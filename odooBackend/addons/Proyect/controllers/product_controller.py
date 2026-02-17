
from odoo import http
from odoo.http import request


class ProductApiController(http.Controller):
    
    @http.route('/api/products', type='http', auth='user', methods=['GET'], csrf=False)
    def list_products(self):
        products = request.env['product.product'].sudo().search([])
        data = [
            {
                'id': product.id,
                'name': product.name,
                'default_code': product.default_code,
                'list_price': product.list_price,
            }
            for product in products
        ]
        return request.make_json_response({'ok': True, 'data': data}, status=200)

    @http.route('/api/products/<int:product_id>', type='http', auth='user', methods=['GET'], csrf=False)
    def get_product(self, product_id):
        product = request.env['product.product'].sudo().browse(product_id)
        if not product.exists():
            return request.make_json_response({'ok': False, 'error': 'Product not found'}, status=404)

        data = {
            'id': product.id,
            'name': product.name,
            'default_code': product.default_code,
            'list_price': product.list_price,
        }
        return request.make_json_response({'ok': True, 'data': data}, status=200)

    @http.route('/api/products', type='http', auth='user', methods=['POST'], csrf=False)
    def create_product(self):
        payload = request.httprequest.get_json(silent=True) or {}
        name = payload.get('name')

        if not name:
            return request.make_json_response({'ok': False, 'error': 'name is required'}, status=400)

        values = {
            'name': name,
            'default_code': payload.get('default_code'),
            'list_price': payload.get('list_price', 0.0),
        }
        product = request.env['product.product'].sudo().create(values)
        return request.make_json_response({'ok': True, 'id': product.id}, status=201)

    @http.route('/api/products/<int:product_id>', type='http', auth='user', methods=['PUT'], csrf=False)
    def update_product(self, product_id):
        product = request.env['product.product'].sudo().browse(product_id)
        if not product.exists():
            return request.make_json_response({'ok': False, 'error': 'Product not found'}, status=404)

        payload = request.httprequest.get_json(silent=True) or {}
        values = {}
        if 'name' in payload:
            values['name'] = payload['name']
        if 'default_code' in payload:
            values['default_code'] = payload['default_code']
        if 'list_price' in payload:
            values['list_price'] = payload['list_price']

        if not values:
            return request.make_json_response({'ok': False, 'error': 'No fields to update'}, status=400)

        product.write(values)
        return request.make_json_response({'ok': True}, status=200)

    @http.route('/api/products/<int:product_id>', type='http', auth='user', methods=['DELETE'], csrf=False)
    def delete_product(self, product_id):
        product = request.env['product.product'].sudo().browse(product_id)
        if not product.exists():
            return request.make_json_response({'ok': False, 'error': 'Product not found'}, status=404)

        product.unlink()
        return request.make_json_response({'ok': True}, status=200)
