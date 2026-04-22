from urllib.parse import urlparse

from odoo import fields, http
from odoo.http import request, Response, root
import json as json_lib
import logging

_logger = logging.getLogger(__name__)
TARGET_DB = 'wilkins'


class AuthApiController(http.Controller):
    def _get_request_session_token(self):
        return (
            request.httprequest.headers.get('X-Auth-Session')
            or request.httprequest.headers.get('x-auth-session')
            or request.httprequest.args.get('session_token')
            or request.httprequest.args.get('session_id')
        )

    def _ensure_session_from_request(self):
        if getattr(request.session, "uid", None):
            return getattr(request.session, "uid", None)

        token = self._get_request_session_token()
        if not token:
            return None

        try:
            stored_session = root.session_store.get(token)
        except Exception as error:
            _logger.warning("No se pudo leer la sesion %s desde session_store: %s", token, error)
            return None

        if not stored_session:
            _logger.warning("No se encontro sesion activa para token %s", token)
            return None

        uid = getattr(stored_session, "uid", None)
        if not uid:
            _logger.warning("La sesion %s existe pero no tiene uid", token)
            return None

        request.session.uid = uid
        request.session.login = getattr(stored_session, "login", None)
        try:
            request.session.db = getattr(stored_session, "db", None) or TARGET_DB
        except Exception:
            pass

        session_token = getattr(stored_session, "session_token", None) or token
        try:
            request.session.session_token = session_token
        except Exception:
            pass

        _logger.info(
            "Sesion restaurada desde header token=%s uid=%s login=%s db=%s",
            token,
            uid,
            getattr(stored_session, "login", None),
            getattr(stored_session, "db", None),
        )
        return uid

    def _serialize_res_user_debug(self, user):
        return {
            'id': user.id,
            'login': user.login,
            'active': bool(user.active),
            'share': bool(user.share),
            'company_id': user.company_id.id if user.company_id else None,
        }

    def _serialize_billnova_user_debug(self, user):
        return {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'role': user.role,
            'active': bool(user.active),
            'is_mobile_user': bool(user.is_mobile_user),
            'res_user_id': user.res_user_id.id if user.res_user_id else None,
            'company_id': user.company_id.id if user.company_id else None,
        }

    def _log_user_snapshots(self, label, *, login=None, email=None):
        res_user_domain = []
        billnova_domain = []

        if login and email:
            res_user_domain = ['|', ('login', '=', login), ('login', '=', email)]
            billnova_domain = ['|', ('email', '=', email), ('res_user_id.login', '=', login)]
        elif login:
            res_user_domain = [('login', '=', login)]
            billnova_domain = [('res_user_id.login', '=', login)]
        elif email:
            res_user_domain = [('login', '=', email)]
            billnova_domain = [('email', '=', email)]

        res_users = request.env['res.users'].sudo().with_context(active_test=False).search(
            res_user_domain,
            order='id asc',
        ) if res_user_domain else request.env['res.users']
        billnova_users = request.env['billnova.user'].sudo().with_context(active_test=False).search(
            billnova_domain,
            order='id asc',
        ) if billnova_domain else request.env['billnova.user']

        _logger.info("=== USER SNAPSHOT: %s ===", label)
        _logger.info("FILTER login=%s email=%s", login, email)
        _logger.info(
            "RES.USERS COUNT=%s DATA=%s",
            len(res_users),
            [self._serialize_res_user_debug(user) for user in res_users],
        )
        _logger.info(
            "BILLNOVA.USER COUNT=%s DATA=%s",
            len(billnova_users),
            [self._serialize_billnova_user_debug(user) for user in billnova_users],
        )
        _logger.info("=== END USER SNAPSHOT: %s ===", label)

    def _log_all_users_overview(self, label):
        res_users = request.env['res.users'].sudo().with_context(active_test=False).search([], order='id asc')
        billnova_users = request.env['billnova.user'].sudo().with_context(active_test=False).search([], order='id asc')
        _logger.info("=== ALL USERS OVERVIEW: %s ===", label)
        _logger.info(
            "ALL RES.USERS COUNT=%s DATA=%s",
            len(res_users),
            [self._serialize_res_user_debug(user) for user in res_users],
        )
        _logger.info(
            "ALL BILLNOVA.USER COUNT=%s DATA=%s",
            len(billnova_users),
            [self._serialize_billnova_user_debug(user) for user in billnova_users],
        )
        _logger.info("=== END ALL USERS OVERVIEW: %s ===", label)

    def _build_res_user_vals(self, *, name, login, password, email, phone=None, company_id=None):
        user_vals = {
            'name': name,
            'login': login,
            'password': password,
            'email': email,
            'phone': phone,
            'active': True,
        }
        if company_id:
            user_vals.update({
                'company_id': company_id,
                'company_ids': [(4, company_id)],
            })
        return user_vals

    def _ensure_res_user_for_billnova_user(
        self,
        mobile_user,
        *,
        name,
        login,
        password,
        email,
        phone=None,
        company_id=None,
    ):
        user_model = request.env['res.users'].sudo().with_context(active_test=False)
        res_user = self._get_mobile_res_user_including_inactive(mobile_user)

        if res_user and res_user.exists():
            vals = {
                'name': name,
                'login': login,
                'email': email,
                'phone': phone,
            }
            if password:
                vals['password'] = password
            if company_id:
                vals.update({
                    'company_id': company_id,
                    'company_ids': [(4, company_id)],
                })
            res_user.sudo().write(vals)
            return res_user

        res_user = user_model.create(
            self._build_res_user_vals(
                name=name,
                login=login,
                password=password,
                email=email,
                phone=phone,
                company_id=company_id,
            )
        )
        mobile_user.sudo().write({'res_user_id': res_user.id})
        return res_user

    def _get_mobile_res_user_including_inactive(self, mobile_user):
        if not mobile_user or not mobile_user.exists() or not mobile_user.res_user_id:
            return request.env['res.users']
        return request.env['res.users'].sudo().with_context(active_test=False).browse(mobile_user.res_user_id.id)

    def _find_pending_mobile_user(self, login=None, email=None):
        domain = []
        if email and login:
            domain = ['|', ('email', '=', email), ('res_user_id.login', '=', login)]
        elif email:
            domain = [('email', '=', email)]
        elif login:
            domain = [('res_user_id.login', '=', login)]
        else:
            return request.env['billnova.user']

        mobile_user = request.env['billnova.user'].sudo().with_context(active_test=False).search(domain, limit=1)
        if not mobile_user:
            return request.env['billnova.user']
        res_user = self._get_mobile_res_user_including_inactive(mobile_user)
        if mobile_user.email_verified_at or mobile_user.active or res_user.active:
            return request.env['billnova.user']
        return mobile_user

    def _get_frontend_base_url(self):
        origin = request.httprequest.headers.get('Origin')
        if origin:
            parsed = urlparse(origin)
            if parsed.scheme and parsed.netloc:
                return f"{parsed.scheme}://{parsed.netloc}"
        return None

    def _find_res_user(self, login_value):
        if not login_value:
            return request.env['res.users']
        return request.env['res.users'].sudo().with_context(active_test=False).search(
            ['|', ('login', '=', login_value), ('email', '=', login_value)],
            limit=1,
        )

    def _get_current_res_user(self):
        self._ensure_session_from_request()
        session_uid = getattr(request.session, "uid", None)
        if session_uid:
            user = request.env["res.users"].sudo().browse(session_uid)
            if user.exists():
                return user

        user = request.env.user
        if user and not user._is_public():
            return user.sudo()

        return request.env["res.users"]

    def _get_current_billnova_user(self, user=None):
        current_user = user or self._get_current_res_user()
        if not current_user or not current_user.exists():
            return request.env['billnova.user']
        return request.env['billnova.user'].sudo().search(
            [('res_user_id', '=', current_user.id)], limit=1
        )

    def _get_effective_company_id(self, user=None, mobile_user=None):
        current_mobile_user = mobile_user or self._get_current_billnova_user(user)
        if current_mobile_user and current_mobile_user.exists() and current_mobile_user.company_id:
            return current_mobile_user.company_id.id

        current_user = user or self._get_current_res_user()
        if current_user and current_user.exists() and current_user.company_id:
            return current_user.company_id.id

        return None

    def _log_session_snapshot(self, label, user, mobile_user, role, company_id, session_id=None, session_token=None):
        _logger.info("=== AUTH DEBUG: %s ===", label)
        _logger.info("SESSION UID: %s", getattr(request.session, "uid", None))
        _logger.info("SESSION LOGIN: %s", getattr(request.session, "login", None))
        _logger.info("SESSION DB: %s", getattr(request.session, "db", None))
        _logger.info(
            "RES USER -> id=%s name=%s login=%s email=%s company_id=%s company_ids=%s",
            getattr(user, "id", None),
            getattr(user, "name", None),
            getattr(user, "login", None),
            getattr(user, "email", None),
            getattr(getattr(user, "company_id", None), "id", None),
            getattr(getattr(user, "company_ids", None), "ids", []),
        )
        _logger.info(
            "BILLNOVA USER -> id=%s name=%s role=%s res_user_id=%s company_id=%s",
            getattr(mobile_user, "id", None),
            getattr(mobile_user, "name", None),
            getattr(mobile_user, "role", None),
            getattr(getattr(mobile_user, "res_user_id", None), "id", None),
            getattr(getattr(mobile_user, "company_id", None), "id", None),
        )
        _logger.info("RESOLVED ROLE: %s", role)
        _logger.info("RESOLVED COMPANY ID: %s", company_id)
        _logger.info("SESSION ID: %s", session_id)
        _logger.info("SESSION TOKEN: %s", session_token)
        _logger.info("=== END AUTH DEBUG ===")

    def _cors_headers(self):
        origin = request.httprequest.headers.get('Origin')
        return {
            'Access-Control-Allow-Origin': origin or '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Origin, X-Auth-Session',
            'Access-Control-Allow-Credentials': 'true',
        }

    def _json_response(self, data, status=200):
        return Response(
            json_lib.dumps(data),
            status=status,
            headers=self._cors_headers(),
            content_type='application/json'
        )

    def _options_response(self):
        return Response('', status=200, headers=self._cors_headers())

    def _register_billnova_user(
        self,
        *,
        name,
        login,
        password,
        email,
        phone=None,
        address=None,
        role='seller',
        company_id=None,
        is_mobile_user=True,
        frontend_base_url=None,
        invitation_company_name=None,
    ):
        self._log_user_snapshots(
            'register_billnova_user_before',
            login=login,
            email=email,
        )
        self._log_all_users_overview('register_billnova_user_before')
        user_model = request.env['res.users'].sudo()
        user_lookup = user_model.with_context(active_test=False)
        pending_mobile_user = self._find_pending_mobile_user(login=login, email=email)
        if pending_mobile_user:
            res_user = self._ensure_res_user_for_billnova_user(
                pending_mobile_user,
                name=name,
                login=login,
                password=password,
                email=email,
                phone=phone,
                company_id=company_id,
            )
            res_user.sudo().with_context(active_test=False).write({'active': False})
            pending_mobile_user.sudo().write({
                'name': name,
                'email': email,
                'phone': phone,
                'address': address,
                'role': role,
                'is_mobile_user': is_mobile_user,
                'active': False,
                'email_verified_at': False,
            })
            if company_id:
                res_user.sudo().with_context(active_test=False).write({
                    'company_id': company_id,
                    'company_ids': [(4, company_id)],
                })
                pending_mobile_user.sudo().write({
                    'company_id': company_id,
                    'role': role,
                    'is_mobile_user': is_mobile_user,
                })
            if role == 'worker':
                email_sent = pending_mobile_user.action_send_employee_invitation_email(
                    company_name=invitation_company_name,
                    password=password,
                    frontend_base_url=frontend_base_url,
                )
            else:
                email_sent = pending_mobile_user.action_send_verification_email(frontend_base_url=frontend_base_url)
            self._log_user_snapshots(
                'register_billnova_user_after_pending_reuse',
                login=login,
                email=email,
            )
            self._log_all_users_overview('register_billnova_user_after_pending_reuse')
            return {
                'ok': True,
                'status': 200,
                'user_id': res_user.id,
                'mobile_user_id': pending_mobile_user.id,
                'email': pending_mobile_user.email or email,
                'requires_verification': True,
                'email_sent': bool(email_sent),
                'message': 'La cuenta ya existe y sigue pendiente de verificacion. Te reenviamos el correo.',
            }

        if user_lookup.search([('login', '=', login)], limit=1):
            return {'ok': False, 'status': 409, 'error': 'Ese nombre de usuario ya esta registrado.'}
        if user_lookup.search([('email', '=', email)], limit=1):
            return {'ok': False, 'status': 409, 'error': 'Ese correo ya esta registrado.'}

        user = user_model.create(
            self._build_res_user_vals(
                name=name,
                login=login,
                password=password,
                email=email,
                phone=phone,
                company_id=company_id,
            )
        )
        user.sudo().with_context(active_test=False).write({'active': False})

        mobile_user_vals = {
            'name': name,
            'email': email,
            'phone': phone,
            'address': address,
            'is_mobile_user': is_mobile_user,
            'role': role,
            'res_user_id': user.id,
            'active': False,
            'email_verified_at': False,
        }
        if company_id:
            mobile_user_vals['company_id'] = company_id

        mobile_user = request.env['billnova.user'].sudo().create(mobile_user_vals)
        if role == 'worker':
            email_sent = mobile_user.action_send_employee_invitation_email(
                company_name=invitation_company_name,
                password=password,
                frontend_base_url=frontend_base_url,
            )
        else:
            email_sent = mobile_user.action_send_verification_email(frontend_base_url=frontend_base_url)

        self._log_user_snapshots(
            'register_billnova_user_after_create',
            login=login,
            email=email,
        )
        self._log_all_users_overview('register_billnova_user_after_create')
        return {
            'ok': True,
            'status': 201,
            'user_id': user.id,
            'mobile_user_id': mobile_user.id,
            'email': email,
            'requires_verification': True,
            'email_sent': bool(email_sent),
        }

    @http.route('/api/auth/register', type='http', auth='public', methods=['POST', 'OPTIONS'], csrf=False)
    def register(self):
        if request.httprequest.method == 'OPTIONS':
            return self._options_response()

        try:
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

            result = self._register_billnova_user(
                name=name,
                login=login,
                password=password,
                email=email,
                phone=phone,
                address=address,
                role='seller',
                is_mobile_user=True,
                frontend_base_url=self._get_frontend_base_url(),
            )
            if not result.get('ok'):
                return self._json_response({'ok': False, 'error': result.get('error')}, status=result.get('status', 400))
            return self._json_response(result, status=result.get('status', 201))
        except Exception as error:
            _logger.exception("Register failed: %s", error)
            return self._json_response(
                {'ok': False, 'error': 'No se pudo completar el registro en el servidor.'},
                status=422
            )

    @http.route('/api/auth/login', type='http', auth='none', methods=['POST', 'OPTIONS'], csrf=False)
    def login(self):
        if request.httprequest.method == 'OPTIONS':
            return self._options_response()

        _logger.info("LOGIN DEBUG - Headers: %s", dict(request.httprequest.headers))

        try:
            payload = request.httprequest.get_json(silent=False)
        except Exception:
            return self._json_response(
                {'ok': False, 'error': 'El body debe ser JSON valido'},
                status=400
            )

        if not isinstance(payload, dict):
            return self._json_response(
                {'ok': False, 'error': 'Formato invalido'},
                status=400
            )

        login = payload.get('login')
        password = payload.get('password')
        if not login or not password:
            return self._json_response(
                {'ok': False, 'error': 'login y password requeridos'},
                status=400
            )

        found_user = self._find_res_user(login)
        auth_login = found_user.login if found_user and found_user.exists() else login

        if found_user and found_user.exists() and not found_user.active:
            try:
                found_user._check_credentials(password)
                mobile_user = request.env['billnova.user'].sudo().with_context(active_test=False).search(
                    [('res_user_id', '=', found_user.id)],
                    limit=1,
                )
                not_verified = bool(mobile_user and not mobile_user.email_verified_at)
                return self._json_response(
                    {
                        'ok': False,
                        'code': 'ACCOUNT_NOT_VERIFIED' if not_verified else 'ACCOUNT_DISABLED',
                        'error': (
                            'Tu usuario no esta activo. Revisa tu correo electronico.'
                            if not_verified
                            else 'Cuenta deshabilitada. Contacta soporte.'
                        ),
                        'email': found_user.email or login,
                    },
                    status=403
                )
            except Exception:
                pass

        env = request.env(context=dict(request.env.context, interactive=True))
        uid = False

        try:
            credential = {
                'type': 'password',
                'login': auth_login,
                'password': password,
            }
            auth_info = env['res.users'].sudo().authenticate(
                credential,
                request.httprequest.environ
            )
            uid = auth_info.get('uid') if auth_info else False
        except Exception as error:
            _logger.warning("Auth moderno fallo: %s", str(error))
            uid = False

        if not uid:
            try:
                user = self._find_res_user(auth_login)
                if user:
                    user._check_credentials(password)
                    uid = user.id
            except Exception:
                uid = False

        if not uid:
            return self._json_response(
                {'ok': False, 'error': 'Credenciales invalidas'},
                status=401
            )

        rotate_fn = getattr(request.session, "rotate", None)
        if callable(rotate_fn):
            try:
                rotate_fn()
            except Exception:
                pass

        request.session.uid = uid
        request.session.login = auth_login
        try:
            request.session.db = TARGET_DB
        except Exception:
            pass

        _logger.info("LOGIN OK - UID: %s", request.session.uid)

        session_id = getattr(request.session, "sid", None)
        session_token = getattr(request.session, "session_token", None) or session_id
        try:
            if hasattr(request.session, "session_token") and not getattr(request.session, "session_token", None):
                request.session.session_token = session_token
        except Exception:
            pass

        user = self._get_current_res_user()
        mobile_user = self._get_current_billnova_user(user)
        user_role = mobile_user.role if mobile_user else 'seller'
        company_id = self._get_effective_company_id(user=user, mobile_user=mobile_user)
        self._log_session_snapshot('login', user, mobile_user, user_role, company_id, session_id, session_token)

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

    @http.route('/api/auth/verify-email', type='http', auth='public', methods=['POST', 'OPTIONS'], csrf=False)
    def verify_email(self):
        if request.httprequest.method == 'OPTIONS':
            return self._options_response()

        payload = request.httprequest.get_json(silent=True) or {}
        token = payload.get('token')
        email = payload.get('email')
        if not token:
            return self._json_response({'ok': False, 'error': 'token requerido'}, status=400)

        domain = [('verification_token', '=', token)]
        if email:
            domain.append(('email', '=', email))
        mobile_user = request.env['billnova.user'].sudo().with_context(active_test=False).search(domain, limit=1)

        if not mobile_user:
            return self._json_response({'ok': False, 'error': 'El enlace no es valido o ya fue usado.'}, status=404)
        if mobile_user.verification_token_expiry and mobile_user.verification_token_expiry < fields.Datetime.now():
            return self._json_response({'ok': False, 'error': 'El enlace de verificacion ya expiro.'}, status=410)

        mobile_user.write({
            'active': True,
            'email_verified_at': fields.Datetime.now(),
            'verification_token': False,
            'verification_token_expiry': False,
        })
        if mobile_user.res_user_id:
            mobile_user.res_user_id.sudo().with_context(active_test=False).write({'active': True})

        return self._json_response({'ok': True, 'message': 'Cuenta verificada correctamente.'}, status=200)

    @http.route('/api/auth/resend-code', type='http', auth='public', methods=['POST', 'OPTIONS'], csrf=False)
    def resend_code(self):
        if request.httprequest.method == 'OPTIONS':
            return self._options_response()

        payload = request.httprequest.get_json(silent=True) or {}
        email = payload.get('email')
        if not email:
            return self._json_response({'ok': False, 'error': 'email requerido'}, status=400)

        mobile_user = request.env['billnova.user'].sudo().with_context(active_test=False).search(
            [('email', '=', email)],
            limit=1,
        )
        if not mobile_user:
            return self._json_response({'ok': False, 'error': 'No existe una cuenta con ese correo.'}, status=404)
        if mobile_user.active and mobile_user.email_verified_at:
            return self._json_response({'ok': True, 'message': 'La cuenta ya esta verificada.'}, status=200)

        mobile_user.action_send_verification_email(frontend_base_url=self._get_frontend_base_url())
        return self._json_response({'ok': True, 'message': 'Te enviamos un nuevo correo de verificacion.'}, status=200)

    @http.route('/api/auth/session', type='http', auth='public', methods=['GET', 'OPTIONS'], csrf=False)
    def session(self):
        if request.httprequest.method == 'OPTIONS':
            return self._options_response()

        user = self._get_current_res_user()
        _logger.info("=== API SESSION DEBUG ===")
        _logger.info("USER: %s", user.name if user else "None")
        _logger.info("USER ID: %s", user.id if user else "None")
        _logger.info("IS PUBLIC: %s", user._is_public() if user and hasattr(user, "_is_public") else "Unknown")
        _logger.info("SESSION UID: %s", request.session.uid)
        _logger.info("SESSION LOGIN: %s", request.session.login)
        _logger.info("SESSION DB: %s", request.session.db)

        if not user or not user.exists():
            _logger.warning("SESSION: No hay sesion activa o usuario publico")
            return self._json_response({'ok': False, 'error': 'No hay sesion activa'}, status=401)

        mobile_user = self._get_current_billnova_user(user)
        user_role = mobile_user.role if mobile_user else 'seller'
        company_id = self._get_effective_company_id(user=user, mobile_user=mobile_user)

        session_id = getattr(request.session, "sid", None)
        session_token = getattr(request.session, "session_token", None) or session_id
        self._log_session_snapshot('session', user, mobile_user, user_role, company_id, session_id, session_token)

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
            request.session.uid = False
            request.session.login = False

        return self._json_response({'ok': True})
