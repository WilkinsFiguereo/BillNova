from odoo import http
from odoo.http import request, Response
import json as json_lib
import logging
from .auth_controller import AuthApiController

_logger = logging.getLogger(__name__)


class UserApiController(http.Controller):

    # =========================
    # Helpers
    # =========================

    def _cors_headers(self):
        origin = request.httprequest.headers.get('Origin')
        return {
            'Access-Control-Allow-Origin': origin or '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Origin, X-Auth-Session',
            'Access-Control-Allow-Credentials': 'true',
        }

    def _json_response(self, data, status=200):
        return Response(
            json_lib.dumps(data),
            status=status,
            headers={**self._cors_headers(), 'Content-Type': 'application/json'}
        )

    def _options_response(self):
        return Response(status=200, headers=self._cors_headers())

    def _get_current_res_user(self):
        AuthApiController()._ensure_session_from_request()
        session_uid = getattr(request.session, 'uid', None)
        if session_uid:
            user = request.env['res.users'].sudo().with_context(active_test=False).browse(session_uid)
            if user.exists():
                return user

        user = request.env.user
        if user and getattr(user, 'id', False):
            try:
                if user._is_public():
                    return request.env['res.users']
            except Exception:
                return request.env['res.users']
            return user.sudo().with_context(active_test=False)

        return request.env['res.users']

    def _get_current_billnova_user(self):
        user = self._get_current_res_user()
        if not user or not user.exists():
            return request.env['billnova.user']
        return request.env['billnova.user'].sudo().search([('res_user_id', '=', user.id)], limit=1)

    def _get_effective_billnova_company(self, billnova_user):
        if billnova_user and billnova_user.exists():
            return billnova_user.company_id or request.env['res.company']
        return request.env['res.company']

    def _serialize_mobile_profile(self, billnova_user, res_user):
        company = self._get_effective_billnova_company(billnova_user)
        role = billnova_user.role if billnova_user and billnova_user.exists() else getattr(res_user, 'billnova_role', None)
        return {
            'uid': res_user.id if res_user and res_user.exists() else None,
            'billnova_user_id': billnova_user.id if billnova_user and billnova_user.exists() else None,
            'name': (
                billnova_user.name
                if billnova_user and billnova_user.exists() and billnova_user.name
                else (res_user.name if res_user and res_user.exists() else '')
            ),
            'login': res_user.login if res_user and res_user.exists() else '',
            'email': (
                billnova_user.email
                if billnova_user and billnova_user.exists() and billnova_user.email
                else (res_user.email if res_user and res_user.exists() else '')
            ),
            'phone': billnova_user.phone if billnova_user and billnova_user.exists() else '',
            'address': billnova_user.address if billnova_user and billnova_user.exists() else '',
            'role': role or 'seller',
            'company_id': company.id if company else None,
            'company_name': company.name if company else None,
        }

    # =========================
    # Normalizadores
    # =========================

    def _normalize_role(self, role):
        allowed_roles = {'admin', 'moderation', 'seller', 'user'}
        normalized = (role or 'user').strip().lower()
        return normalized if normalized in allowed_roles else 'user'

    def _normalize_email(self, value):
        return (value or '').strip().lower()

    def _system_group(self):
        return request.env.ref('base.group_system').sudo()

    def _active_admin_count(self, exclude_user_id=None):
        domain = [('active', '=', True), ('group_ids', 'in', self._system_group().id)]
        if exclude_user_id:
            domain.append(('id', '!=', exclude_user_id))
        return request.env['res.users'].sudo().search_count(domain)

    def _sync_system_admin_role(self, user, role):
        if role == 'admin':
            user.write({'group_ids': [(4, self._system_group().id)]})

    # =========================================================
    # ====================== RES USERS =========================
    # =========================================================

    # =========================
    # GET USERS
    # =========================

    @http.route('/api/users', type='http', auth='public', methods=['GET', 'OPTIONS'], csrf=False)
    def list_users(self, **kwargs):
        if request.httprequest.method == 'OPTIONS':
            return self._options_response()

        users = request.env['res.users'].sudo().with_context(active_test=False).search([])

        data = [{
            'id': u.id,
            'name': u.name,
            'login': u.login,
            'email': u.email,
            'role': getattr(u, 'billnova_role', 'user'),
            'active': u.active,
        } for u in users]

        return self._json_response({'data': data})

    # =========================
    # GET USER BY ID
    # =========================

    @http.route('/api/users/<int:user_id>', type='http', auth='public', methods=['GET', 'OPTIONS'], csrf=False)
    def get_user(self, user_id):
        if request.httprequest.method == 'OPTIONS':
            return self._options_response()

        user = request.env['res.users'].sudo().with_context(active_test=False).browse(user_id)

        if not user.exists():
            return self._json_response({'error': 'Usuario no encontrado'}, 404)

        return self._json_response({'data': {
            'id': user.id,
            'name': user.name,
            'login': user.login,
            'email': user.email,
            'role': getattr(user, 'billnova_role', 'user'),
            'active': user.active,
        }})

    # =========================
    # CREATE USER (UNIFICADO)
    # =========================

    @http.route('/api/users', type='http', auth='public', methods=['POST', 'OPTIONS'], csrf=False)
    def create_user(self):
        if request.httprequest.method == 'OPTIONS':
            return self._options_response()

        try:
            body = json_lib.loads(request.httprequest.data)

            name = (body.get('name') or '').strip()
            login = (body.get('login') or body.get('email') or '').strip().lower()
            email = (body.get('email') or login).strip().lower()
            password = body.get('password') or 'Temp1234*'
            role = self._normalize_role(body.get('role'))

            if not name:
                return self._json_response({'error': 'El nombre es obligatorio'}, 400)

            if not login:
                return self._json_response({'error': 'El login/email es obligatorio'}, 400)

            # evitar crear sin admin
            if role != 'admin' and self._active_admin_count() == 0:
                return self._json_response({
                    'error': 'Debe existir al menos un admin activo'
                }, 400)

            existing = request.env['res.users'].sudo().search([
                '|', ('login', '=', login), ('email', '=', email)
            ], limit=1)

            if existing:
                existing.write({
                    'name': name,
                    'login': login,
                    'email': email,
                    'billnova_role': role,
                    'active': body.get('active', existing.active),
                })

                if body.get('password'):
                    existing.write({'password': password})

                self._sync_system_admin_role(existing, role)

                return self._json_response({
                    'message': 'Usuario reutilizado',
                    'id': existing.id,
                    'reused': True
                })

            values = {
                'name': name,
                'login': login,
                'email': email,
                'password': password,
                'billnova_role': role,
                'active': body.get('active', True),
            }

            if role == 'admin':
                values['group_ids'] = [(4, self._system_group().id)]

            user = request.env['res.users'].sudo().create(values)

            return self._json_response({'message': 'Usuario creado', 'id': user.id}, 201)

        except Exception as e:
            _logger.exception("Error creando usuario")
            return self._json_response({'error': str(e)}, 400)

    # =========================
    # UPDATE USER
    # =========================

    @http.route('/api/users/<int:user_id>', type='http', auth='public', methods=['PUT', 'OPTIONS'], csrf=False)
    def update_user(self, user_id):
        if request.httprequest.method == 'OPTIONS':
            return self._options_response()

        user = request.env['res.users'].sudo().browse(user_id)

        if not user.exists():
            return self._json_response({'error': 'Usuario no encontrado'}, 404)

        try:
            body = json_lib.loads(request.httprequest.data)

            name = (body.get('name') or user.name).strip()
            login = (body.get('login') or body.get('email') or user.login).strip().lower()
            email = (body.get('email') or user.email or login).strip().lower()
            role = self._normalize_role(body.get('role', getattr(user, 'billnova_role', 'user')))

            duplicate = request.env['res.users'].sudo().search([
                ('id', '!=', user.id),
                '|', ('login', '=', login), ('email', '=', email)
            ], limit=1)

            if duplicate:
                return self._json_response({'error': 'Email/login ya existe'}, 409)

            user.write({
                'name': name,
                'login': login,
                'email': email,
                'billnova_role': role,
                'active': body.get('active', user.active),
            })

            if body.get('password'):
                user.write({'password': body.get('password')})

            self._sync_system_admin_role(user, role)

            return self._json_response({'message': 'Usuario actualizado'})

        except Exception as e:
            _logger.exception("Error update user")
            return self._json_response({'error': str(e)}, 400)

    # =========================
    # DELETE (SOFT)
    # =========================

    @http.route('/api/users/<int:user_id>', type='http', auth='public', methods=['DELETE', 'OPTIONS'], csrf=False)
    def delete_user(self, user_id):
        if request.httprequest.method == 'OPTIONS':
            return self._options_response()

        user = request.env['res.users'].sudo().browse(user_id)

        if not user.exists():
            return self._json_response({'error': 'Usuario no encontrado'}, 404)

        try:
            request.env.cr.execute(
                "UPDATE res_users SET active = FALSE WHERE id = %s",
                [user.id]
            )
            request.env.cr.commit()

            return self._json_response({'message': 'Usuario desactivado'})
        except Exception as e:
            _logger.exception("Error delete user")
            return self._json_response({'error': str(e)}, 400)

    # =========================================================
    # ================== BILLNOVA USERS =======================
    # =========================================================

    # LIST
    @http.route('/api/billnova-users', type='http', auth='public', methods=['GET', 'OPTIONS'], csrf=False)
    def list_billnova_users(self):
        if request.httprequest.method == 'OPTIONS':
            return self._options_response()

        users = request.env['billnova.user'].sudo().with_context(active_test=False).search([])

        data = [{
            'id': u.id,
            'name': u.name,
            'email': u.email,
            'phone': u.phone,
            'address': u.address,
            'role': u.role,
            'active': u.active,
            'is_mobile_user': u.is_mobile_user,
            'res_user_id': u.res_user_id.id if u.res_user_id else None,
        } for u in users]

        return self._json_response({'data': data})

    # GET
    @http.route('/api/billnova-users/<int:user_id>', type='http', auth='public', methods=['GET', 'OPTIONS'], csrf=False)
    def get_billnova_user(self, user_id):
        if request.httprequest.method == 'OPTIONS':
            return self._options_response()

        u = request.env['billnova.user'].sudo().browse(user_id)

        if not u.exists():
            return self._json_response({'error': 'No encontrado'}, 404)

        return self._json_response({'data': {
            'id': u.id,
            'name': u.name,
            'email': u.email,
            'phone': u.phone,
            'address': u.address,
            'role': u.role,
            'active': u.active,
            'is_mobile_user': u.is_mobile_user,
            'res_user_id': u.res_user_id.id if u.res_user_id else None,
        }})

    # CREATE (UNIFICADO + LINK RES USERS)
    @http.route('/api/billnova-users', type='http', auth='public', methods=['POST', 'OPTIONS'], csrf=False)
    def create_billnova_user(self):
        if request.httprequest.method == 'OPTIONS':
            return self._options_response()

        try:
            body = json_lib.loads(request.httprequest.data)

            name = (body.get('name') or '').strip()
            email = self._normalize_email(body.get('email'))
            role = self._normalize_role(body.get('role', 'seller'))

            if not name:
                return self._json_response({'error': 'Nombre obligatorio'}, 400)

            if not email:
                return self._json_response({'error': 'Email obligatorio'}, 400)

            res_user_id = body.get('res_user_id')

            # crear o reutilizar res.users
            if not res_user_id:
                res_user = request.env['res.users'].sudo().search([
                    '|', ('login', '=', email), ('email', '=', email)
                ], limit=1)

                if not res_user:
                    if role != 'admin' and self._active_admin_count() == 0:
                        return self._json_response({'error': 'Debe existir admin activo'}, 400)

                    res_user = request.env['res.users'].sudo().create({
                        'name': name,
                        'login': email,
                        'email': email,
                        'password': body.get('password') or 'Temp1234*',
                        'billnova_role': role,
                    })

                res_user_id = res_user.id

            existing = request.env['billnova.user'].sudo().search([
                '|', ('email', '=', email), ('res_user_id', '=', res_user_id)
            ], limit=1)

            values = {
                'name': name,
                'email': email,
                'phone': body.get('phone'),
                'address': body.get('address'),
                'role': role,
                'active': body.get('active', True),
                'is_mobile_user': body.get('is_mobile_user', False),
                'res_user_id': res_user_id,
            }

            if existing:
                existing.write(values)
                return self._json_response({
                    'message': 'BillNova user reutilizado',
                    'id': existing.id,
                    'reused': True
                })

            u = request.env['billnova.user'].sudo().create(values)

            return self._json_response({'message': 'Creado', 'id': u.id}, 201)

        except Exception as e:
            _logger.exception("Error billnova create")
            return self._json_response({'error': str(e)}, 400)

    # UPDATE
    @http.route('/api/billnova-users/<int:user_id>', type='http', auth='public', methods=['PUT', 'OPTIONS'], csrf=False)
    def update_billnova_user(self, user_id):
        if request.httprequest.method == 'OPTIONS':
            return self._options_response()

        u = request.env['billnova.user'].sudo().browse(user_id)

        if not u.exists():
            return self._json_response({'error': 'No encontrado'}, 404)

        try:
            body = json_lib.loads(request.httprequest.data)

            email = self._normalize_email(body.get('email', u.email))
            name = (body.get('name') or u.name).strip()

            u.write({
                'name': name,
                'email': email,
                'phone': body.get('phone', u.phone),
                'address': body.get('address', u.address),
                'role': self._normalize_role(body.get('role', u.role)),
                'active': body.get('active', u.active),
                'is_mobile_user': body.get('is_mobile_user', u.is_mobile_user),
            })

            if u.res_user_id:
                u.res_user_id.sudo().write({
                    'name': name,
                    'login': email,
                    'email': email,
                    'billnova_role': u.role,
                    'active': u.active,
                })

            return self._json_response({'message': 'Actualizado'})

        except Exception as e:
            _logger.exception("Error update billnova")
            return self._json_response({'error': str(e)}, 400)

    # DELETE (SOFT + sync)
    @http.route('/api/billnova-users/<int:user_id>', type='http', auth='public', methods=['DELETE', 'OPTIONS'], csrf=False)
    def delete_billnova_user(self, user_id):
        if request.httprequest.method == 'OPTIONS':
            return self._options_response()

        u = request.env['billnova.user'].sudo().browse(user_id)

        if not u.exists():
            return self._json_response({'error': 'No encontrado'}, 404)

        try:
            if u.res_user_id:
                request.env.cr.execute(
                    "UPDATE res_users SET active = FALSE WHERE id = %s",
                    [u.res_user_id.id]
                )

            request.env.cr.execute(
                "UPDATE billnova_user SET active = FALSE WHERE id = %s",
                [u.id]
            )
            request.env.cr.commit()

            return self._json_response({'message': 'Desactivado'})

        except Exception as e:
            _logger.exception("Error delete billnova")
            return self._json_response({'error': str(e)}, 400)

    @http.route('/api/mobile/profile', type='http', auth='public', methods=['GET', 'OPTIONS'], csrf=False)
    def get_mobile_profile(self):
        if request.httprequest.method == 'OPTIONS':
            return self._options_response()

        res_user = self._get_current_res_user()
        if not res_user or not res_user.exists():
            return self._json_response({'ok': False, 'error': 'No hay sesion activa'}, 401)

        billnova_user = self._get_current_billnova_user()
        return self._json_response({
            'ok': True,
            'data': self._serialize_mobile_profile(billnova_user, res_user),
        })

    @http.route('/api/mobile/profile', type='http', auth='public', methods=['PUT', 'OPTIONS'], csrf=False)
    def update_mobile_profile(self):
        if request.httprequest.method == 'OPTIONS':
            return self._options_response()

        res_user = self._get_current_res_user()
        if not res_user or not res_user.exists():
            return self._json_response({'ok': False, 'error': 'No hay sesion activa'}, 401)

        billnova_user = self._get_current_billnova_user()

        try:
            body = json_lib.loads(request.httprequest.data or b'{}')
        except Exception:
            return self._json_response({'ok': False, 'error': 'JSON invalido'}, 400)

        name = (body.get('name') or res_user.name or '').strip()
        email = self._normalize_email(body.get('email') or res_user.email or res_user.login)
        phone = (body.get('phone') or '').strip()
        address = (body.get('address') or '').strip()
        password = (body.get('password') or '').strip()

        if not name:
            return self._json_response({'ok': False, 'error': 'El nombre es obligatorio'}, 400)
        if not email:
            return self._json_response({'ok': False, 'error': 'El email es obligatorio'}, 400)

        duplicate_res_user = request.env['res.users'].sudo().with_context(active_test=False).search([
            ('id', '!=', res_user.id),
            '|',
            ('login', '=', email),
            ('email', '=', email),
        ], limit=1)
        if duplicate_res_user:
            return self._json_response({'ok': False, 'error': 'Ese correo ya esta en uso'}, 409)

        if billnova_user and billnova_user.exists():
            duplicate_billnova_user = request.env['billnova.user'].sudo().search([
                ('id', '!=', billnova_user.id),
                ('email', '=', email),
            ], limit=1)
            if duplicate_billnova_user:
                return self._json_response({'ok': False, 'error': 'Ese correo ya esta en uso'}, 409)

        res_user_vals = {
            'name': name,
            'login': email,
            'email': email,
        }
        if password:
            res_user_vals['password'] = password
        res_user.sudo().write(res_user_vals)

        if billnova_user and billnova_user.exists():
            billnova_user.sudo().write({
                'name': name,
                'email': email,
                'phone': phone,
                'address': address,
            })
        else:
            billnova_user = request.env['billnova.user'].sudo().create({
                'name': name,
                'email': email,
                'phone': phone,
                'address': address,
                'role': getattr(res_user, 'billnova_role', None) or 'seller',
                'active': True,
                'is_mobile_user': True,
                'res_user_id': res_user.id,
                'company_id': res_user.company_id.id if res_user.company_id else False,
            })

        return self._json_response({
            'ok': True,
            'data': self._serialize_mobile_profile(billnova_user, res_user),
        })
