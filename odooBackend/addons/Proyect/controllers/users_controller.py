from odoo import http
from odoo.http import request, Response
import json as json_lib
import logging

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
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Credentials': 'true',
        }

    def _json_response(self, data, status=200):
        return Response(
            json_lib.dumps(data),
            status=status,
            headers={**self._cors_headers(), 'Content-Type': 'application/json'}
        )

    def _options_response(self):
        return Response(
            status=200,
            headers=self._cors_headers()
        )

    def _normalize_role(self, role):
        allowed_roles = {'admin', 'moderation', 'seller', 'user'}
        normalized = (role or 'user').strip().lower()
        return normalized if normalized in allowed_roles else 'user'

    def _normalize_email(self, value):
        return (value or '').strip().lower()

    def _system_group(self):
        return request.env.ref('base.group_system').sudo()

    def _active_admin_count(self, exclude_user_id=None):
        admin_group = self._system_group()
        domain = [('active', '=', True), ('group_ids', 'in', admin_group.id)]
        if exclude_user_id:
            domain.append(('id', '!=', exclude_user_id))
        return request.env['res.users'].sudo().search_count(domain)

    def _sync_system_admin_role(self, user, role):
        if role == 'admin':
            user.write({'group_ids': [(4, self._system_group().id)]})

    # =========================
    # GET - Listar usuarios
    # =========================

    @http.route('/api/users', type='http', auth='public', methods=['GET', 'OPTIONS'], csrf=False)
    def list_users(self, **kwargs):

        if request.httprequest.method == 'OPTIONS':
            return self._options_response()

        users = request.env['res.users'].sudo().with_context(active_test=False).search([])

        data = []
        for user in users:
            data.append({
                'id': user.id,
                'name': user.name,
                'login': user.login,
                'email': user.email,
                'role': user.billnova_role or 'user',
                'active': user.active,
            })

        return self._json_response({'data': data})

    # =========================
    # GET - Usuario por ID
    # =========================

    @http.route('/api/users/<int:user_id>', type='http', auth='public', methods=['GET', 'OPTIONS'], csrf=False)
    def get_user(self, user_id):

        if request.httprequest.method == 'OPTIONS':
            return self._options_response()

        user = request.env['res.users'].sudo().with_context(active_test=False).browse(user_id)

        if not user.exists():
            return self._json_response({'error': 'Usuario no encontrado'}, 404)

        data = {
            'id': user.id,
            'name': user.name,
            'login': user.login,
            'email': user.email,
            'role': user.billnova_role or 'user',
            'active': user.active,
        }

        return self._json_response({'data': data})

    # =========================
    # POST - Crear usuario
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
                return self._json_response({'error': 'El correo o login es obligatorio'}, 400)

            if role != 'admin' and self._active_admin_count() == 0:
                return self._json_response({
                    'error': 'Debes crear o mantener al menos un usuario con rol admin para Odoo.'
                }, 400)

            existing_user = request.env['res.users'].sudo().search([
                '|', ('login', '=', login), ('email', '=', email)
            ], limit=1)
            if existing_user:
                existing_user.write({
                    'name': name or existing_user.name,
                    'login': login,
                    'email': email,
                    'billnova_role': role,
                    'active': body.get('active', existing_user.active),
                })
                if body.get('password'):
                    existing_user.write({'password': password})
                self._sync_system_admin_role(existing_user, role)
                return self._json_response({
                    'message': 'Usuario existente reutilizado',
                    'id': existing_user.id,
                    'reused': True,
                }, 200)

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

            return self._json_response({
                'message': 'Usuario creado correctamente',
                'id': user.id
            }, 201)

        except Exception as e:
            _logger.exception("Error creando usuario")
            return self._json_response({'error': str(e)}, 400)

    # =========================
    # PUT - Actualizar usuario
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
            name = (body.get('name') or user.name or '').strip()
            login = (body.get('login') or body.get('email') or user.login or '').strip().lower()
            email = (body.get('email') or user.email or login).strip().lower()
            role = self._normalize_role(body.get('role', user.billnova_role or 'user'))

            if not name:
                return self._json_response({'error': 'El nombre es obligatorio'}, 400)

            if not login:
                return self._json_response({'error': 'El correo o login es obligatorio'}, 400)

            duplicate_user = request.env['res.users'].sudo().search([
                ('id', '!=', user.id),
                '|', ('login', '=', login), ('email', '=', email)
            ], limit=1)
            if duplicate_user:
                return self._json_response({'error': 'Ya existe otro usuario con ese correo/login'}, 409)

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

            return self._json_response({'message': 'Usuario actualizado correctamente'})

        except Exception as e:
            _logger.exception("Error actualizando usuario")
            return self._json_response({'error': str(e)}, 400)

    # =========================
    # DELETE - Eliminar usuario
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
                [user.id],
            )
            request.env.cr.commit()
            return self._json_response({'message': 'Usuario deshabilitado correctamente'})
        except Exception as e:
            _logger.exception("Error eliminando usuario")
            return self._json_response({'error': str(e)}, 400)
        
    @http.route('/api/billnova-users', type='http', auth='public', methods=['GET', 'OPTIONS'], csrf=False)
    def list_billnova_users(self, **kwargs):
        if request.httprequest.method == 'OPTIONS':
            return self._options_response()
        users = request.env['billnova.user'].sudo().with_context(active_test=False).search([])
        data = [{'id': u.id, 'name': u.name, 'email': u.email,
                 'phone': u.phone, 'address': u.address,
                 'role': u.role,
                 'active': u.active,
                 'is_mobile_user': u.is_mobile_user,
                 'res_user_id': u.res_user_id.id} for u in users]
        return self._json_response({'data': data})

    @http.route('/api/billnova-users/<int:user_id>', type='http', auth='public', methods=['GET', 'OPTIONS'], csrf=False)
    def get_billnova_user(self, user_id):
        if request.httprequest.method == 'OPTIONS':
            return self._options_response()
        u = request.env['billnova.user'].sudo().browse(user_id)
        if not u.exists():
            return self._json_response({'error': 'No encontrado'}, 404)
        return self._json_response({'data': {'id': u.id, 'name': u.name,
            'email': u.email, 'phone': u.phone, 'address': u.address,
            'role': u.role,
            'active': u.active,
            'is_mobile_user': u.is_mobile_user, 'res_user_id': u.res_user_id.id}})

    @http.route('/api/billnova-users', type='http', auth='public', methods=['POST', 'OPTIONS'], csrf=False)
    def create_billnova_user(self):
        if request.httprequest.method == 'OPTIONS':
            return self._options_response()
        try:
            body = json_lib.loads(request.httprequest.data)
            name = (body.get('name') or '').strip()
            email = self._normalize_email(body.get('email'))
            res_user_id = body.get('res_user_id')

            if not name:
                return self._json_response({'error': 'El nombre es obligatorio'}, 400)

            if not email:
                return self._json_response({'error': 'El correo es obligatorio'}, 400)

            if not res_user_id:
                existing_res_user = request.env['res.users'].sudo().search([
                    '|', ('login', '=', email), ('email', '=', email)
                ], limit=1)
                if existing_res_user:
                    existing_res_user.write({
                        'name': name or existing_res_user.name,
                        'login': email,
                        'email': email,
                        'billnova_role': self._normalize_role(body.get('role', 'seller')),
                    })
                    if body.get('password'):
                        existing_res_user.write({'password': body.get('password')})
                    self._sync_system_admin_role(existing_res_user, self._normalize_role(body.get('role', 'seller')))
                    res_user_id = existing_res_user.id
                else:
                    role = self._normalize_role(body.get('role', 'seller'))
                    if role != 'admin' and self._active_admin_count() == 0:
                        return self._json_response({
                            'error': 'Debes crear o mantener al menos un usuario con rol admin para Odoo.'
                        }, 400)
                    values = {
                        'name': name,
                        'login': email,
                        'email': email,
                        'password': body.get('password') or 'Temp1234*',
                        'billnova_role': role,
                    }
                    if role == 'admin':
                        values['group_ids'] = [(4, self._system_group().id)]
                    res_user = request.env['res.users'].sudo().create(values)
                    res_user_id = res_user.id
            else:
                linked_user = request.env['res.users'].sudo().browse(res_user_id)
                if not linked_user.exists():
                    return self._json_response({'error': 'El usuario relacionado no existe'}, 404)
            existing_billnova_user = request.env['billnova.user'].sudo().search([
                '|',
                ('email', '=', email),
                ('res_user_id', '=', res_user_id)
            ], limit=1)

            values = {
                'name': name,
                'email': email,
                'phone': body.get('phone'),
                'address': body.get('address'),
                'active': body.get('active', True),
                'role': self._normalize_role(body.get('role', 'seller')),
                'is_mobile_user': body.get('is_mobile_user', False),
                'res_user_id': res_user_id,
            }

            if existing_billnova_user:
                existing_billnova_user.write(values)
                return self._json_response({
                    'message': 'Usuario BillNova existente reutilizado',
                    'id': existing_billnova_user.id,
                    'reused': True,
                }, 200)

            u = request.env['billnova.user'].sudo().create(values)
            return self._json_response({'message': 'Creado', 'id': u.id}, 201)
        except Exception as e:
            _logger.exception("Error creando usuario BillNova")
            return self._json_response({'error': str(e)}, 400)

    @http.route('/api/billnova-users/<int:user_id>', type='http', auth='public', methods=['PUT', 'OPTIONS'], csrf=False)
    def update_billnova_user(self, user_id):
        if request.httprequest.method == 'OPTIONS':
            return self._options_response()
        u = request.env['billnova.user'].sudo().with_context(active_test=False).browse(user_id)
        if not u.exists():
            return self._json_response({'error': 'No encontrado'}, 404)
        try:
            body = json_lib.loads(request.httprequest.data)
            name = (body.get('name', u.name) or '').strip()
            email = self._normalize_email(body.get('email', u.email))

            if not name:
                return self._json_response({'error': 'El nombre es obligatorio'}, 400)

            if not email:
                return self._json_response({'error': 'El correo es obligatorio'}, 400)

            duplicate_billnova_user = request.env['billnova.user'].sudo().search([
                ('id', '!=', u.id),
                ('email', '=', email),
            ], limit=1)
            if duplicate_billnova_user:
                return self._json_response({'error': 'Ya existe otro usuario BillNova con ese correo'}, 409)

            duplicate_res_user = request.env['res.users'].sudo().search([
                ('id', '!=', u.res_user_id.id),
                '|', ('login', '=', email), ('email', '=', email)
            ], limit=1)
            if duplicate_res_user:
                return self._json_response({'error': 'Ya existe otro usuario con ese correo/login'}, 409)

            u.write({'name': name,
                     'email': email,
                     'phone': body.get('phone', u.phone),
                     'address': body.get('address', u.address),
                     'active': body.get('active', u.active),
                     'role': self._normalize_role(body.get('role', u.role)),
                     'is_mobile_user': body.get('is_mobile_user', u.is_mobile_user)})
            if u.res_user_id.exists():
                u.res_user_id.sudo().write({
                    'name': name,
                    'login': email,
                    'email': email,
                    'billnova_role': self._normalize_role(body.get('role', u.role)),
                    'active': body.get('active', u.res_user_id.active),
                })
                self._sync_system_admin_role(u.res_user_id, self._normalize_role(body.get('role', u.role)))
            return self._json_response({'message': 'Actualizado'})
        except Exception as e:
            _logger.exception("Error actualizando usuario BillNova")
            return self._json_response({'error': str(e)}, 400)

    @http.route('/api/billnova-users/<int:user_id>', type='http', auth='public', methods=['DELETE', 'OPTIONS'], csrf=False)
    def delete_billnova_user(self, user_id):
        if request.httprequest.method == 'OPTIONS':
            return self._options_response()
        u = request.env['billnova.user'].sudo().browse(user_id)
        if not u.exists():
            return self._json_response({'error': 'No encontrado'}, 404)
        try:
            linked_user = u.res_user_id
            if linked_user.exists():
                request.env.cr.execute(
                    "UPDATE res_users SET active = FALSE WHERE id = %s",
                    [linked_user.id],
                )
            request.env.cr.execute(
                "UPDATE billnova_user SET active = FALSE WHERE id = %s",
                [u.id],
            )
            request.env.cr.commit()
            return self._json_response({'message': 'Usuario deshabilitado correctamente'})
        except Exception as e:
            return self._json_response({'error': str(e)}, 400)
