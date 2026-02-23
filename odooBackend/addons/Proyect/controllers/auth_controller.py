from odoo import http
from odoo.http import request, Response
from odoo.exceptions import AccessDenied
import json

class AuthApiController(http.Controller):

    def _cors_headers(self):
        origin = request.httprequest.headers.get('Origin')
        return {
            'Access-Control-Allow-Origin': origin or '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Origin',
            'Access-Control-Allow-Credentials': 'true',
        }

    def _json_response(self, data, status=200):
        return Response(
            json.dumps(data),
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

        # 👇 Manejo correcto del preflight
        if request.httprequest.method == 'OPTIONS':
            return self._options_response()

        payload = request.httprequest.get_json(silent=True) or {}

        name = payload.get('name')
        login = payload.get('login')
        password = payload.get('password')
        email = payload.get('email')

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

        return self._json_response(
            {'ok': True, 'user_id': user.id},
            status=201
        )

    @http.route('/api/auth/login', type='http', auth='public', methods=['POST'], csrf=False, cors='*')
    def login(self):
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

        return request.make_json_response({'ok': True, 'uid': uid}, status=200)

    @http.route('/api/auth/logout', type='http', auth='user', methods=['POST'], csrf=False)
    def logout(self):
        request.session.logout(keep_db=True)
        return request.make_json_response({'ok': True}, status=200)

