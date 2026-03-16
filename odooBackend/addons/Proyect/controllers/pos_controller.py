from odoo import http
from odoo.http import request, Response
import json as json_lib

class PosApiController(http.Controller):

    def _cors_headers(self):
        origin = request.httprequest.headers.get('Origin')

        return {
            'Access-Control-Allow-Origin': origin or '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Origin',
            'Access-Control-Allow-Credentials': 'true',   # 👈 CAMBIA ESTO
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


    # ========================
    # LIST
    # ========================
    @http.route('/api/pos/order', type='http', auth='public', methods=['POST', 'OPTIONS'], csrf=False)
    def create_pos_order(self):
        if request.httprequest.method == 'OPTIONS':
            return self._options_response()

        payload = request.httprequest.get_json(silent=True) or {}
        lines = payload.get('lines', [])  # [{product_id, qty, price_unit}]

        if not lines:
            return self._json_response({'ok': False, 'error': 'lines required'}, 400)

        session = request.env['pos.session'].sudo().search(
            [('state', '=', 'opened')], limit=1
        )
        if not session:
            return self._json_response({'ok': False, 'error': 'No POS session open'}, 400)

        order_lines = [(0, 0, {
            'product_id': int(line['product_id']),
            'qty': line['qty'],
            'price_unit': line['price_unit'],
        }) for line in lines]

        order = request.env['pos.order'].sudo().create({
            'session_id': session.id,
            'lines': order_lines,
            'amount_total': payload.get('amount_total', 0),
            'amount_tax': payload.get('amount_tax', 0),
            'amount_paid': 0,
            'amount_return': 0,
        })

        return self._json_response({'ok': True, 'order_id': order.id}, 201)