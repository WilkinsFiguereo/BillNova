from odoo import http
from odoo.http import request, Response
from odoo.exceptions import AccessDenied
import json as json_lib
import logging

_logger = logging.getLogger(__name__)

class AuthApiController(http.Controller):

    def _cors_headers(self):
        origin = request.httprequest.headers.get('Origin')

        headers = {
            'Access-Control-Allow-Origin': origin or '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Origin, X-Auth-Session',
            'Access-Control-Allow-Credentials': 'true',
        }

        return headers

    def _json_response(self, data, status=200):
        return Response(
            json_lib.dumps(data),
            status=status,
            headers=self._cors_headers(),
            content_type='application/json'
        )

    def _options_response(self):
        return Response(
            '',
            status=200,
            headers=self._cors_headers()
        )

    @http.route('/api/auth/register', type='http', auth='public', methods=['POST', 'OPTIONS'], csrf=False)
    def register(self):

        if request.httprequest.method == 'OPTIONS':
            return self._options_response()

        payload = request.httprequest.get_json(silent=True) or {}

        name = payload.get('name')
        login = payload.get('login')
        password = payload.get('password')
        email = payload.get('email')
        phone = payload.get('phone')
        address = payload.get('address')

        if not name or not login or not password or not email:
            return self._json_response(
                {'ok': False, 'error': 'name, login, password and email are required'},
                status=400
            )

        user_model = request.env['res.users'].sudo()

        if user_model.search([('login', '=', login)], limit=1):
            return self._json_response(
                {'ok': False, 'error': 'login already exists'},
                status=409
            )

        user = user_model.create({
            'name': name,
            'login': login,
            'password': password,
            'email': email,
        })

        mobile_user = request.env['billnova.user'].sudo().create({
            'name': name,
            'email': email,
            'phone': phone,
            'address': address,
            'is_mobile_user': True,
            'role': 'seller',
            'res_user_id': user.id,
        })

        return self._json_response(
            {
                'ok': True,
                'user_id': user.id,
                'mobile_user_id': mobile_user.id,
            },
            status=201
        )

    @http.route('/api/auth/login', type='http', auth='public', methods=['POST', 'OPTIONS'], csrf=False)
    def login(self):
        if request.httprequest.method == 'OPTIONS':
            return self._options_response()

        _logger.info("LOGIN DEBUG - Headers: %s", dict(request.httprequest.headers))

        try:
            payload = request.httprequest.get_json(silent=False)
        except Exception as json_err:
            return self._json_response(
                {'ok': False, 'error': 'El body debe ser JSON válido'},
                status=400
            )

        if not isinstance(payload, dict):
            return self._json_response(
                {'ok': False, 'error': 'Formato inválido'},
                status=400
            )

        login = payload.get('login')
        password = payload.get('password')

        if not login or not password:
            return self._json_response(
                {'ok': False, 'error': 'login y password requeridos'},
                status=400
            )

        db = request.env.cr.dbname

        # 🔥 CLAVE: contexto interactivo
        env = request.env(context=dict(request.env.context, interactive=True))

        uid = False

        try:
            credential = {
                'type': 'password',
                'login': login,
                'password': password,
            }

            # Método moderno
            auth_info = env['res.users'].sudo().authenticate(
                credential,
                request.httprequest.environ
            )
            uid = auth_info.get('uid') if auth_info else False

        except Exception as e:
            _logger.warning("Auth moderno falló: %s", str(e))
            uid = False

        # Fallback clásico
        if not uid:
            try:
                user = env['res.users'].sudo().search([('login', '=', login)], limit=1)
                if user:
                    user._check_credentials(password)
                    uid = user.id
            except Exception:
                uid = False

        if not uid:
            return self._json_response(
                {'ok': False, 'error': 'Credenciales inválidas'},
                status=401
            )

        # ✅ Crear sesión correctamente
        request.session.db = db
        request.session.uid = uid
        request.session.login = login

        if hasattr(request.session, '_fix_lang'):
            try:
                request.session._fix_lang(env)
            except Exception:
                pass

        _logger.info("LOGIN OK - UID: %s", uid)

        mobile_user = request.env['billnova.user'].sudo().search(
            [('res_user_id', '=', uid)], limit=1
        )
        user = request.env['res.users'].sudo().browse(uid)

        return self._json_response({
            'ok': True,
            'uid': uid,
            'name': user.name,
            'email': user.email or login,
            'role': mobile_user.role if mobile_user else 'seller',
            'session_token': request.session.sid,
        }, status=200)
    
    @http.route('/api/auth/session', type='http', auth='public', methods=['GET', 'OPTIONS'], csrf=False)
    def session(self):
        if request.httprequest.method == 'OPTIONS':
            return self._options_response()

        user = request.env.user
        if not user or user._is_public():
            return self._json_response({'ok': False, 'error': 'No hay sesión activa'}, status=401)

        mobile_user = request.env['billnova.user'].sudo().search(
            [('res_user_id', '=', user.id)], limit=1
        )

        return self._json_response({
            'ok': True,
            'uid': user.id,
            'name': user.name,
            'email': user.email,
            'role': mobile_user.role if mobile_user else 'seller',
            'session_token': request.session.sid,
        })

    @http.route('/api/auth/logout', type='http', auth='user', methods=['POST', 'OPTIONS'], csrf=False)
    def logout(self):
        if request.httprequest.method == 'OPTIONS':
            return self._options_response()

        logout_fn = getattr(request.session, "logout", None)
        try:
            if callable(logout_fn):
                logout_fn()
            else:
                request.session.uid = False
                request.session.login = False
        except Exception:
            # Aseguramos que la sesión quede invalidada
            request.session.uid = False
            request.session.login = False

        return self._json_response({'ok': True})
