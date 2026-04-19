# controllers/product_api.py
from odoo import http
from odoo.http import request, Response
import json as json_lib
from odoo.fields import Datetime

class ProductApiController(http.Controller):

    # ── Helpers ──────────────────────────────────────────────
    def _cors_headers(self):
        origin = request.httprequest.headers.get('Origin')
        return {
            'Access-Control-Allow-Origin': origin or '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Origin',
            'Access-Control-Allow-Credentials': 'true',
        }

    def _json_response(self, data, status=200):
        return Response(
            json_lib.dumps(data),
            status=status,
            headers=self._cors_headers(),
            content_type='application/json',
        )

    def _options_response(self):
        return Response('', status=200, headers=self._cors_headers())

    def _serialize(self, p):
        """Serializa un product.product a dict."""
        return {
            'id': p.id,
            'name': p.name,
            'default_code': p.default_code,
            'category_id': p.categ_id.id or None,
            'category_name': p.categ_id.name or None,
            'list_price': p.list_price,
            'company_id': p.company_id.id or None,
            'company_name': p.company_id.name or None,
            'company_email': p.company_id.admin_email or p.company_id.contact_email or None,
            'moderation_status': p.moderation_status or 'pending',
            'moderation_reason': p.moderation_reason or '',
            'moderation_updated_at': (
                p.moderation_updated_at.isoformat() if p.moderation_updated_at else None
            ),
            'create_date': p.create_date.isoformat() if p.create_date else None,
            'write_date': p.write_date.isoformat() if p.write_date else None,
            'standard_price': p.standard_price or 0.0,
            'qty_available': p.qty_available or 0.0,
            'description_sale': p.description_sale or '',
        }

    def _parse_company_id(self, payload):
        """Returns int company_id or None; raises a json response on invalid input."""
        company_id = payload.get('company_id')
        if company_id is None or company_id == '':
            return None

        try:
            company_id_int = int(company_id)
        except (TypeError, ValueError):
            return self._json_response(
                {'ok': False, 'error': 'company_id must be an integer'}, 400
            )

        company = request.env['res.company'].sudo().browse(company_id_int)
        if not company.exists():
            return self._json_response(
                {'ok': False, 'error': f'Company {company_id_int} not found'}, 404
            )

        return company_id_int

    # ── LIST  /api/products?company_id=3 ─────────────────────
    @http.route('/api/products', type='http', auth='none',
                methods=['GET', 'OPTIONS'], csrf=False)
    def list_products(self):
        if request.httprequest.method == 'OPTIONS':
            return self._options_response()

        # Filtro opcional por empresa
        domain = []
        company_id = request.httprequest.args.get('company_id')
        if company_id:
            try:
                domain.append(('company_id', '=', int(company_id)))
            except ValueError:
                return self._json_response(
                    {'ok': False, 'error': 'company_id must be an integer'}, 400
                )

        products = request.env['product.product'].sudo().search(domain)
        return self._json_response({'ok': True, 'data': [self._serialize(p) for p in products]})

    # ── GET ONE  /api/products/<id> ───────────────────────────
    @http.route('/api/products/<int:product_id>', type='http', auth='none',
                methods=['GET', 'OPTIONS'], csrf=False)
    def get_product(self, product_id):
        if request.httprequest.method == 'OPTIONS':
            return self._options_response()

        product = request.env['product.product'].sudo().browse(product_id)
        if not product.exists():
            return self._json_response({'ok': False, 'error': 'Product not found'}, 404)

        return self._json_response({'ok': True, 'data': self._serialize(product)})

    # ── CREATE  POST /api/products/create ────────────────────
    @http.route('/api/products/create', type='http', auth='none',
                methods=['POST', 'OPTIONS'], csrf=False)
    def create_product(self):
        if request.httprequest.method == 'OPTIONS':
            return self._options_response()

        payload = request.httprequest.get_json(silent=True) or {}
        name = payload.get('name')

        if not name:
            return self._json_response({'ok': False, 'error': 'name is required'}, 400)

        # Validar company_id si viene en el payload
        company_id_int = self._parse_company_id(payload)
        if isinstance(company_id_int, Response):
            return company_id_int

        if not company_id_int:
            return self._json_response({
                'ok': False,
                'error': 'company_id is required'
            }, 400)

        vals = {
            'name': name,
            'default_code': payload.get('default_code'),
            'list_price': payload.get('list_price', 0.0),
            'standard_price': payload.get('standard_price', payload.get('cost', 0.0)),
            'description_sale': payload.get('description_sale', payload.get('description', '')),
        }
        if company_id_int:
            vals['company_id'] = company_id_int

        product = request.env['product.product'].sudo().create(vals)
        return self._json_response({'ok': True, 'id': product.id}, 201)

    # ── UPDATE/DELETE  /api/products/<id> ─────────────────────
    @http.route('/api/products/<int:product_id>', type='http', auth='none',
                methods=['PUT', 'DELETE', 'OPTIONS'], csrf=False)
    def update_delete_product(self, product_id):
        if request.httprequest.method == 'OPTIONS':
            return self._options_response()

        product = request.env['product.product'].sudo().browse(product_id)
        if not product.exists():
            return self._json_response({'ok': False, 'error': 'Product not found'}, 404)

        if request.httprequest.method == 'DELETE':
            product.unlink()
            return self._json_response({'ok': True})

        payload = request.httprequest.get_json(silent=True) or {}

        vals = {}
        if 'name' in payload:
            vals['name'] = payload.get('name') or ''
        if 'default_code' in payload:
            vals['default_code'] = payload.get('default_code')
        if 'list_price' in payload:
            vals['list_price'] = payload.get('list_price', 0.0)
        if 'standard_price' in payload or 'cost' in payload:
            vals['standard_price'] = payload.get('standard_price', payload.get('cost', 0.0))
        if 'description_sale' in payload or 'description' in payload:
            vals['description_sale'] = payload.get('description_sale', payload.get('description', ''))
        if 'moderation_status' in payload:
            status = payload.get('moderation_status') or 'pending'
            if status not in ('pending', 'approved', 'rejected'):
                return self._json_response({'ok': False, 'error': 'Invalid moderation_status'}, 400)
            vals['moderation_status'] = status
            vals['moderation_updated_at'] = Datetime.now()
        if 'moderation_reason' in payload:
            vals['moderation_reason'] = payload.get('moderation_reason') or ''

        company_id_int = self._parse_company_id(payload)
        if isinstance(company_id_int, Response):
            return company_id_int
        if company_id_int:
            vals['company_id'] = company_id_int

        if not vals:
            return self._json_response({'ok': False, 'error': 'No fields to update'}, 400)

        product.write(vals)
        return self._json_response({'ok': True, 'data': self._serialize(product)})
