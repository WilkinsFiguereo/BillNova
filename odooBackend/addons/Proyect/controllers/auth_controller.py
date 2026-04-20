from odoo import http
from odoo.http import request, Response
from odoo.exceptions import AccessDenied
import json as json_lib
import logging

_logger = logging.getLogger(__name__)
TARGET_DB = 'wilkins'

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

    @http.route('/api/auth/login', type='http', auth='none', methods=['POST', 'OPTIONS'], csrf=False)
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

        db = TARGET_DB

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

        # ✅ crear sesión REAL
        # En Odoo 19 la firma de `Session.authenticate` cambió y puede variar por build.
        # Para evitar errores de firma, establecemos la sesión manualmente.
        rotate_fn = getattr(request.session, "rotate", None)
        if callable(rotate_fn):
            try:
                rotate_fn()
            except Exception:
                pass

        request.session.uid = uid
        request.session.login = login
        try:
            request.session.db = TARGET_DB
        except Exception:
            pass

        _logger.info("LOGIN OK - UID: %s", request.session.uid)

        # Odoo 19 puede usar `session_token` para validar requests (header `X-Auth-Session`).
        # En algunos casos puede venir `None`; aseguramos un fallback consistente.
        session_id = getattr(request.session, "sid", None)
        session_token = getattr(request.session, "session_token", None) or session_id
        try:
            if hasattr(request.session, "session_token") and not getattr(request.session, "session_token", None):
                request.session.session_token = session_token
        except Exception:
            # No bloqueamos el login si el atributo es de solo-lectura en esta versión.
            pass

        user = request.env["res.users"].sudo().browse(request.session.uid)
        mobile_user = request.env['billnova.user'].sudo().search(
            [('res_user_id', '=', user.id)], limit=1
        )
        user_role = mobile_user.role if mobile_user else 'seller'
        company_id = mobile_user.company_id.id if mobile_user and mobile_user.company_id else None

        return self._json_response({
            'ok': True,
            'uid': request.session.uid,
            'name': user.name,
            'email': user.email,
            'role': user_role,
            'company_id': company_id,
            'session_id': session_id,
            'session_token': session_token,
        }, status=200)
    
    @http.route('/api/auth/session', type='http', auth='public', methods=['GET', 'OPTIONS'], csrf=False)
    def session(self):
        if request.httprequest.method == 'OPTIONS':
            return self._options_response()

        user = request.env.user
        _logger.info("=== API SESSION DEBUG ===")
        _logger.info("USER: %s", user.name if user else "None")
        _logger.info("USER ID: %s", user.id if user else "None")
        _logger.info("IS PUBLIC: %s", user._is_public() if user else "Unknown")
        _logger.info("SESSION UID: %s", request.session.uid)
        _logger.info("SESSION LOGIN: %s", request.session.login)
        _logger.info("SESSION DB: %s", request.session.db)

        if not user or user._is_public():
            _logger.warning("SESSION: No hay sesión activa o usuario público")
            return self._json_response({'ok': False, 'error': 'No hay sesión activa'}, status=401)

        mobile_user = request.env['billnova.user'].sudo().search(
            [('res_user_id', '=', user.id)], limit=1
        )

        user_role = mobile_user.role if mobile_user else 'seller'
        company_id = mobile_user.company_id.id if mobile_user and mobile_user.company_id else None

        session_id = getattr(request.session, "sid", None)
        session_token = getattr(request.session, "session_token", None) or session_id

        _logger.info("SESSION ACTIVE:")
        _logger.info("  - uid: %s", user.id)
        _logger.info("  - name: %s", user.name)
        _logger.info("  - email: %s", user.email)
        _logger.info("  - role: %s", user_role)
        _logger.info("  - company_id: %s", company_id)
        _logger.info("  - session_id: %s", session_id)
        _logger.info("  - session_token: %s", session_token)
        _logger.info("=========================")

        return self._json_response({
            'ok': True,
            'uid': user.id,
            'name': user.name,
            'email': user.email,
            'role': user_role,
            'company_id': company_id,
            'session_id': session_id,
            'session_token': session_token,
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
