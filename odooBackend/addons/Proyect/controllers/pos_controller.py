import os

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

        order_lines = []
        amount_total = 0.0

        for line in lines:
            product_id = int(line['product_id'])
            qty = float(line['qty'])
            price = float(line['price_unit'])

            subtotal = qty * price

            # (Opcional pero recomendado) obtener impuestos del producto
            product = request.env['product.product'].sudo().browse(product_id)
            taxes = product.taxes_id

            order_lines.append((0, 0, {
                'product_id': product_id,
                'qty': qty,
                'price_unit': price,
                'tax_ids': [(6, 0, taxes.ids)],  # importante si usas impuestos
                'price_subtotal': subtotal,
                'price_subtotal_incl': subtotal,
            }))

            amount_total += subtotal

        order = request.env['pos.order'].sudo().create({
            'session_id': session.id,
            'lines': order_lines,
            'amount_total': amount_total,
            'amount_tax': payload.get('amount_tax', 0),
            'amount_paid': 0,
            'amount_return': 0,
        })

        company = request.env['res.company'].sudo().browse(1)

        partner = request.env['res.partner'].sudo().search([], limit=1)
        if not partner:
            return self._json_response({'ok': False, 'error': 'No customer found'}, 400)

        invoice_lines = []
        for line in lines:
            p_id = int(line['product_id'])
            qty = float(line['qty'])
            price = float(line['price_unit'])
            product = request.env['product.product'].sudo().browse(p_id)
            invoice_lines.append((0, 0, {
                'product_id': p_id,
                'quantity': qty,
                'price_unit': price,
                'name': product.name,
                'tax_ids': [(6, 0, product.taxes_id.ids)],
            }))

        invoice = request.env['account.move'].sudo().create({
            'move_type': 'out_invoice',
            'partner_id': partner.id,
            'company_id': company.id,
            'invoice_line_ids': invoice_lines,
            'invoice_origin': order.name,
        })
        invoice.action_post()

        return self._json_response({'ok': True, 'order_id': order.id, 'invoice_id': invoice.id}, 201)

    @http.route('/api/pos/order/<int:order_id>/cancel', type='http', auth='public', methods=['POST', 'OPTIONS'], csrf=False)
    def cancel_pos_order(self, order_id):
        if request.httprequest.method == 'OPTIONS':
            return self._options_response()

        order = request.env['pos.order'].sudo().browse(order_id)
        if not order:
            return self._json_response({'ok': False, 'error': 'Pedido no encontrado'}, 404)

        if order.state in ('done', 'cancel'):
            return self._json_response({'ok': False, 'error': 'No se puede cancelar este pedido'}, 400)

        order.sudo().write({'state': 'cancel'})
        return self._json_response({'ok': True})

    @http.route('/api/pos/orders', type='http', auth='public', methods=['GET', 'OPTIONS'], csrf=False)
    def list_pos_orders(self):
        if request.httprequest.method == 'OPTIONS':
            return self._options_response()

        DEFAULT_BASE_URL = "https://jwfn4vcd-8079.use2.devtunnels.ms/"
        env_url = os.environ.get('ODOO_PUBLIC_URL') or os.environ.get('NEXT_PUBLIC_ODOO_URL')
        base_url = (
            env_url
            or request.httprequest.host_url
            or DEFAULT_BASE_URL
        ).rstrip('/')

        orders = request.env['pos.order'].sudo().search([], order='date_order desc', limit=50)
        data = [{
            'id': str(o.id),
            'reference': o.name,
            'date': o.date_order.strftime('%Y-%m-%d') if o.date_order else '',
            'status': 'delivered' if o.state == 'done' else 'pending',
            'total': o.amount_total,
            'lines': [{
                'id': str(l.id),
                'productName': l.product_id.name,
                'quantity': l.qty,
                'priceUnit': l.price_unit,
            } for l in o.lines],
            'invoice': None,
        } for o in orders]

        for entry, o in zip(data, orders):
            invoice = request.env['account.move'].sudo().search(
                [('invoice_origin', '=', o.name)], limit=1)
        if invoice:
            entry['invoice'] = {
                'id': str(invoice.id),
                'reference': invoice.name,
                'url': f"{base_url}/web#id={invoice.id}&model=account.move&view_type=form",
            }

        return self._json_response({'ok': True, 'data': data})

    @http.route('/api/pos/order/<int:order_id>/invoice', type='http', auth='public', methods=['GET', 'OPTIONS'], csrf=False)
    def download_invoice(self, order_id):
        if request.httprequest.method == 'OPTIONS':
            return self._options_response()

        order = request.env['pos.order'].sudo().browse(order_id)
        invoice = request.env['account.move'].sudo().search(
            [('invoice_origin', '=', order.name)], limit=1)
        if not invoice:
            return self._json_response({'ok': False, 'error': 'Factura no encontrada'}, 404)

        report = request.env.ref('account.account_invoices').sudo()
        pdf, _ = report._render_qweb_pdf(report.id, res_ids=[invoice.id])
        filename = f"factura-{invoice.name or invoice.id}.pdf"
        headers = self._cors_headers()
        headers.update({
            'Content-Type': 'application/pdf',
            'Content-Disposition': f'attachment; filename="{filename}"',
        })

        return Response(
            pdf,
            status=200,
            headers=headers,
        )
