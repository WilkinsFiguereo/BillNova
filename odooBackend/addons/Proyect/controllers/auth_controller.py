from requests import Response

from odoo import http
from odoo.http import request
from odoo.exceptions import AccessDenied
import json

class AuthApiController(http.Controller):

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
            json.dumps(data),
            status=status,
            headers=self._cors_headers(),
            content_type='application/json'
        )

    def _options(self):
        return self._json_response({}, status=200)
    
    @http.route('/api/auth/register', type='http', auth='public', methods=['POST', 'OPTIONS'], csrf=False)
    def register(self):
        if request.httprequest.method == 'OPTIONS':
            return self._options()
        try:
            payload = request.httprequest.get_json(silent=True) or {}

            name = payload.get('name')
            login = payload.get('login')
            password = payload.get('password')
            email = payload.get('email')
            phone = payload.get('phone')
            address = payload.get('address')
            is_mobile_user = payload.get('is_mobile_user', False)

            if not name or not login or not password or not email:
                return request.make_json_response(
                    {'ok': False, 'error': 'name, login, password and email are required'},
                    status=400,
                )

            user_model = request.env['res.users'].sudo()
            existing_user = user_model.search([('login', '=', login)], limit=1)
            if existing_user:
                return request.make_json_response({'ok': False, 'error': 'login already exists'}, status=409)

            user_vals = {
                'name': name,
                'login': login,
                'password': password,
                'email': email,
                'address': address,
                'is_mobile_user': is_mobile_user,
            }
            user = user_model.create(user_vals)

            request.env['proyect.app.user'].sudo().create(
                {
                    'name': name,
                    'email': email,
                    'phone': phone,
                    'address': address,
                    'res_user_id': user.id,
                    'is_mobile_user': is_mobile_user,
                }
            )

            return request.make_json_response({'ok': True, 'user_id': user.id}, status=201)
        except Exception as e:
            return request.make_json_response({'ok': False, 'error': str(e)}, status=500)

    @http.route('/api/auth/login', type='http', auth='public', methods=['POST', 'OPTIONS'], csrf=False)
    def login(self):
        if request.httprequest.method == 'OPTIONS':
            return self._options()
        try:
            payload = request.httprequest.get_json(silent=True) or {}
            login = payload.get('login')
            password = payload.get('password')

            if not login or not password:
                return request.make_json_response({'ok': False, 'error': 'login and password are required'}, status=400)

            try:
                uid = request.session.authenticate(request.db, login, password)
            except AccessDenied:
                uid = False
            if not uid:
                return request.make_json_response({'ok': False, 'error': 'invalid credentials'}, status=401)

            app_user = request.env['proyect.app.user'].sudo().search([('res_user_id', '=', uid)], limit=1)
            is_mobile_user = bool(app_user and app_user.is_mobile_user)

            return request.make_json_response(
                {'ok': True, 'uid': uid, 'is_mobile_user': is_mobile_user},
                status=200,
            )
        except Exception as e:
            return request.make_json_response({'ok': False, 'error': str(e)}, status=500)

    @http.route('/api/auth/logout', type='http', auth='user', methods=['POST'], csrf=False)
    def logout(self):
        request.session.logout(keep_db=True)
        return request.make_json_response({'ok': True}, status=200)

