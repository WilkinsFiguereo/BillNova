import os
import logging
import base64

from odoo import http
from odoo.http import request, Response
import json as json_lib

_logger = logging.getLogger(__name__)


class PosApiController(http.Controller):
    def _render_invoice_pdf_content(self, invoice):
        report_service = request.env['ir.actions.report'].sudo()
        pdf_content, _ = report_service._render_qweb_pdf('account.account_invoices', [invoice.id])
        return pdf_content

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
            headers=self._cors_headers(),
            content_type='application/json'
        )

    def _options_response(self):
        return Response('', status=200, headers=self._cors_headers())

    # =============================================================
    # CREATE POS ORDER
    # =============================================================
    @http.route('/api/pos/order', type='http', auth='public', methods=['POST', 'OPTIONS'], csrf=False)
    def create_pos_order(self):
        if request.httprequest.method == 'OPTIONS':
            return self._options_response()

        payload = request.httprequest.get_json(silent=True) or {}
        lines = payload.get('lines', [])

        if not lines:
            return self._json_response({'ok': False, 'error': 'lines required'}, 400)

        try:
            # Determinar compañía
            company = None
            for line in lines:
                product = request.env['product.product'].sudo().browse(int(line.get('product_id')))
                if not product.exists():
                    return self._json_response({'ok': False, 'error': f'Product {line.get("product_id")} not found'}, 404)
                company = company or product.company_id or request.env.company

            company = company or request.env.company

            # Configuración POS (journal, config, session)
            journal = request.env['account.journal'].sudo().search([
                ('company_id', '=', company.id), ('type', '=', 'sale')
            ], limit=1)

            if not journal:
                journal = request.env['account.journal'].sudo().with_company(company).create({
                    'name': f'Ventas POS {company.name}',
                    'code': f'POS{company.id}',
                    'type': 'sale',
                    'company_id': company.id,
                })

            pos_config = request.env['pos.config'].sudo().search([('company_id', '=', company.id)], limit=1)
            if not pos_config:
                pos_config = request.env['pos.config'].sudo().with_company(company).create({
                    'name': f'TPV {company.name}',
                    'company_id': company.id,
                    'journal_id': journal.id,
                    'invoice_journal_id': journal.id,
                })

            pos_session = request.env['pos.session'].sudo().search([
                ('config_id', '=', pos_config.id),
                ('state', 'in', ['opened', 'opening_control'])
            ], limit=1)

            if not pos_session:
                pos_session = request.env['pos.session'].sudo().with_company(company).create({
                    'config_id': pos_config.id,
                    'user_id': request.env.user.id or 2,
                })
                pos_session.action_pos_session_open()

            # ====================== CREAR LÍNEAS Y POS ORDER ======================
            order_lines = []
            amount_total = 0.0
            amount_tax = 0.0

            for line in lines:
                product = request.env['product.product'].sudo().browse(int(line.get('product_id')))
                qty = float(line.get('qty', 1))
                price_unit = float(line.get('price_unit', product.lst_price or 0))

                taxes = product.taxes_id
                tax_res = taxes.compute_all(price_unit, quantity=qty, product=product)

                price_subtotal = tax_res['total_excluded']
                price_subtotal_incl = tax_res['total_included']

                amount_total += price_subtotal_incl
                amount_tax += price_subtotal_incl - price_subtotal

                order_lines.append((0, 0, {
                    'product_id': product.id,
                    'qty': qty,
                    'price_unit': price_unit,
                    'discount': 0.0,
                    'tax_ids': [(6, 0, taxes.ids)],
                    'price_subtotal': price_subtotal,
                    'price_subtotal_incl': price_subtotal_incl,
                }))

            pos_order = request.env['pos.order'].sudo().with_company(company).create({
                'session_id': pos_session.id,
                'company_id': company.id,
                'lines': order_lines,
                'amount_total': amount_total,
                'amount_tax': amount_tax,
                'amount_paid': amount_total,
                'amount_return': 0.0,
                'state': 'draft',
                'user_id': request.env.user.id or 2,
            })

            # ====================== GENERAR FACTURA ======================
            pos_order.action_pos_order_paid()

            invoice = None
            try:
                # Método correcto en Odoo 19
                invoice = pos_order._generate_pos_order_invoice()
            except Exception:
                try:
                    # Método alternativo
                    invoice = pos_order.action_pos_order_invoice()
                except Exception as e2:
                    _logger.warning(f"No se pudo generar factura automáticamente: {e2}")

            # Confirmar factura si está en borrador
            if invoice and invoice.state == 'draft':
                try:
                    invoice.action_post()
                except Exception as e_post:
                    _logger.warning(f"No se pudo confirmar la factura: {e_post}")

            return self._json_response({
                'ok': True,
                'order_id': pos_order.id,
                'order_name': pos_order.name,
                'invoice_id': invoice.id if invoice else None,
                'invoice_name': invoice.name if invoice else None,
                'session_id': pos_session.id,
                'company_id': company.id,
            }, 201)

        except Exception as e:
            _logger.exception("Error creando POS Order")
            return self._json_response({'ok': False, 'error': str(e)}, 500)
    
    
    
    
    # =============================================================
    # CANCEL ORDER
    # =============================================================
    @http.route('/api/pos/order/<int:order_id>/cancel', type='http', auth='public', methods=['POST', 'OPTIONS'], csrf=False)
    def cancel_pos_order(self, order_id):
        if request.httprequest.method == 'OPTIONS':
            return self._options_response()
        order = request.env['pos.order'].sudo().browse(order_id)
        if not order.exists():
            return self._json_response({'ok': False, 'error': 'Pedido no encontrado'}, 404)
        if order.state in ('done', 'cancel'):
            return self._json_response({'ok': False, 'error': 'No se puede cancelar'}, 400)
        order.write({'state': 'cancel'})
        return self._json_response({'ok': True})

    # =============================================================
    # CHANGE INVOICE STATE
    # POST /api/pos/invoice/<invoice_id>/state
    # Body: { "state": "posted" | "cancel" | "draft" }
    # =============================================================
    @http.route('/api/pos/invoice/<int:invoice_id>/state', type='http', auth='public', methods=['POST', 'OPTIONS'], csrf=False)
    def change_invoice_state(self, invoice_id):
        if request.httprequest.method == 'OPTIONS':
            return self._options_response()

        payload = request.httprequest.get_json(silent=True) or {}
        new_state = payload.get('state', '')

        invoice = request.env['account.move'].sudo().browse(invoice_id)
        if not invoice.exists():
            return self._json_response({'ok': False, 'error': 'Factura no encontrada'}, 404)

        try:
            if new_state == 'posted':
                # Confirmar/publicar factura
                if invoice.state == 'draft':
                    invoice.action_post()
                else:
                    return self._json_response({'ok': False, 'error': f'No se puede confirmar desde estado {invoice.state}'}, 400)

            elif new_state == 'cancel':
                # Cancelar factura
                if invoice.state in ('draft', 'posted'):
                    invoice.button_cancel()
                else:
                    return self._json_response({'ok': False, 'error': f'No se puede cancelar desde estado {invoice.state}'}, 400)

            elif new_state == 'draft':
                # Regresar a borrador (reset)
                if invoice.state == 'cancel':
                    invoice.button_draft()
                else:
                    return self._json_response({'ok': False, 'error': f'Solo facturas canceladas pueden volver a borrador'}, 400)

            else:
                return self._json_response({'ok': False, 'error': f'Estado no válido: {new_state}'}, 400)

        except Exception as e:
            _logger.exception("Error cambiando estado de factura %s", invoice_id)
            return self._json_response({'ok': False, 'error': str(e)}, 500)

        return self._json_response({
            'ok': True,
            'invoice_id': invoice.id,
            'new_state': invoice.state,
            'payment_state': invoice.payment_state,
        })

    # =============================================================
    # SEND INVOICE BY EMAIL
    # POST /api/pos/invoice/<invoice_id>/send-email
    # Body: { "email": "cliente@ejemplo.com" }  (opcional, usa partner si no viene)
    # =============================================================
    @http.route('/api/pos/invoice/<int:invoice_id>/send-email', type='http', auth='public', methods=['POST', 'OPTIONS'], csrf=False)
    def send_invoice_email(self, invoice_id):
        if request.httprequest.method == 'OPTIONS':
            return self._options_response()
        _logger.info("[invoice-email] request invoice_id=%s user=%s", invoice_id, getattr(request.env.user, 'login', None))

        payload = request.httprequest.get_json(silent=True) or {}
        override_email = payload.get('email', '').strip()

        invoice = request.env['account.move'].sudo().browse(invoice_id)
        if not invoice.exists():
            return self._json_response({'ok': False, 'error': 'Factura no encontrada'}, 404)

        if invoice.state != 'posted':
            return self._json_response({'ok': False, 'error': 'Solo se pueden enviar facturas confirmadas'}, 400)

        email_to = override_email
        if not email_to and invoice.partner_id:
            email_to = (invoice.partner_id.email or '').strip()

        if not email_to:
            return self._json_response({'ok': False, 'error': 'No hay email de destino'}, 400)

        try:
            pdf_content = self._render_invoice_pdf_content(invoice)
            attachment = request.env['ir.attachment'].sudo().create({
                'name': f'Factura-{invoice.name or invoice.id}.pdf',
                'type': 'binary',
                'datas': base64.b64encode(pdf_content).decode('ascii'),
                'res_model': 'account.move',
                'res_id': invoice.id,
                'mimetype': 'application/pdf',
            })

            company_email = invoice.company_id.email or request.env.user.email or False
            mail_values = {
                'subject': f'Factura {invoice.name or invoice.id}',
                'body_html': (
                    f'<p>Estimado cliente,</p>'
                    f'<p>Adjunto encontrara la factura <strong>{invoice.name or invoice.id}</strong>.</p>'
                ),
                'email_to': email_to,
                'email_from': company_email,
                'attachment_ids': [(4, attachment.id)],
                'model': 'account.move',
                'res_id': invoice.id,
            }
            mail = request.env['mail.mail'].sudo().create(mail_values)
            mail.send()
        except Exception as e:
            _logger.exception("Error enviando email de factura %s", invoice_id)
            return self._json_response({'ok': False, 'error': str(e)}, 500)

        return self._json_response({
            'ok': True,
            'invoice_id': invoice.id,
            'sent_to': email_to,
        })
    # =============================================================
    # LIST ORDERS (filtrado por company_id, con estado de factura)
    # GET /api/pos/orders?company_id=<id>
    # =============================================================
    @http.route('/api/pos/orders', type='http', auth='public', methods=['GET', 'OPTIONS'], csrf=False)
    def list_pos_orders(self):
        if request.httprequest.method == 'OPTIONS':
            return self._options_response()

        try:
            _logger.info("=== /api/pos/orders CALLED ===")

            DEFAULT_BASE_URL = "http://localhost:8079"
            base_url = os.environ.get('ODOO_PUBLIC_URL') or request.httprequest.host_url or DEFAULT_BASE_URL
            base_url = base_url.rstrip('/')

            company_id_raw = request.httprequest.args.get('company_id')
            company_id_filter = None
            if company_id_raw:
                try:
                    company_id_filter = int(company_id_raw)
                except (TypeError, ValueError):
                    pass

            domain = []
            if company_id_filter:
                domain = [('company_id', '=', company_id_filter)]

            orders = request.env['pos.order'].sudo().search(domain, order='date_order desc', limit=100)

            _logger.info("ORDERS COUNT: %s", len(orders))

            def map_invoice_status(invoice):
                if not invoice:
                    return 'borrador'
                if invoice.state == 'cancel':
                    return 'cancelada'
                if invoice.state == 'draft':
                    return 'borrador'
                if invoice.payment_state == 'paid':
                    return 'pagada'
                if invoice.invoice_date_due:
                    from datetime import date
                    if invoice.invoice_date_due < date.today():
                        return 'vencida'
                return 'pendiente'

            data = []

            for o in orders:
                try:
                    invoice = request.env['account.move'].sudo().search(
                        [('invoice_origin', '=', o.name)],
                        limit=1
                    )

                    status = map_invoice_status(invoice)

                    subtotal = 0.0
                    impuesto = 0.0
                    total = o.amount_total or 0.0

                    if invoice:
                        subtotal = invoice.amount_untaxed or 0.0
                        impuesto = invoice.amount_tax or 0.0
                        total = invoice.amount_total or total
                    else:
                        for l in o.lines:
                            subtotal += (l.price_unit or 0.0) * (l.qty or 0.0)
                        impuesto = total - subtotal

                    first_line = o.lines[0] if o.lines else None

                    entry = {
                        'id': str(o.id),
                        'reference': o.name,
                        'numero': o.name,
                        'date': o.date_order.strftime('%Y-%m-%d') if o.date_order else '',
                        'fecha': o.date_order.strftime('%d %b %Y') if o.date_order else '',
                        'fechaVencimiento': (
                            invoice.invoice_date_due.strftime('%d %b %Y')
                            if invoice and invoice.invoice_date_due else ''
                        ),
                        'status': status,
                        'total': total,
                        'subtotal': subtotal,
                        'impuesto': impuesto,
                        'items': len(o.lines),
                        'company_id': (
                            o.company_id.id if o.company_id
                            else (first_line.product_id.company_id.id if first_line and first_line.product_id.company_id else None)
                        ),
                        'client': o.partner_id.name if o.partner_id else '',
                        'cliente': o.partner_id.name if o.partner_id else '',
                        'clienteEmail': o.partner_id.email if o.partner_id else '',
                        'product': first_line.product_id.name if first_line else '',
                        'qty': first_line.qty if first_line else 0,
                        'address': (
                            getattr(o.partner_id, 'contact_address', None)
                            or (o.partner_id.street if o.partner_id else '')
                            or ''
                        ),
                        'phone': (
                            (
                                o.partner_id.phone
                                or getattr(o.partner_id, 'mobile', '')
                                or ''
                            )
                            if o.partner_id
                            else ''
                        ),
                        'lines': [{
                            'id': str(l.id),
                            'productId': str(l.product_id.id) if l.product_id else '',
                            'product_id': str(l.product_id.id) if l.product_id else '',
                            'productName': l.product_id.name,
                            'product_name': l.product_id.name,
                            'quantity': l.qty,
                            'priceUnit': l.price_unit,
                            'price_unit': l.price_unit,
                        } for l in o.lines],
                        'invoice': None,
                    }

                    if invoice:
                        entry['invoice'] = {
                            'id': str(invoice.id),
                            'reference': invoice.name,
                            'state': invoice.state,
                            'payment_state': invoice.payment_state,
                            'url': f"{base_url}/web#id={invoice.id}&model=account.move&view_type=form",
                        }

                        if not entry.get('cliente') and invoice.partner_id:
                            entry['cliente'] = invoice.partner_id.name or ''
                            entry['client'] = entry['cliente']

                        if not entry.get('clienteEmail') and invoice.partner_id:
                            entry['clienteEmail'] = invoice.partner_id.email or ''

                        if not entry.get('phone') and invoice.partner_id:
                            entry['phone'] = (
                                invoice.partner_id.phone
                                or getattr(invoice.partner_id, 'mobile', '')
                                or ''
                            )

                        if not entry.get('address') and invoice.partner_id:
                            entry['address'] = (
                                getattr(invoice.partner_id, 'contact_address', None)
                                or invoice.partner_id.street or ''
                            )

                        if entry.get('company_id') is None and invoice.company_id:
                            entry['company_id'] = invoice.company_id.id

                    if company_id_filter is not None:
                        entry_company_id = entry.get('company_id')
                        if entry_company_id is None or int(entry_company_id) != company_id_filter:
                            continue

                    data.append(entry)

                except Exception as inner_error:
                    _logger.exception("Error procesando orden %s", o.id)
                    continue

            total_facturado = sum(e['total'] for e in data)
            pagadas = [e for e in data if e['status'] == 'pagada']
            pendientes = [e for e in data if e['status'] == 'pendiente']
            vencidas = [e for e in data if e['status'] == 'vencida']
            borradores = [e for e in data if e['status'] == 'borrador']

            stats = {
                'totalFacturado': total_facturado,
                'pagadas': {'count': len(pagadas), 'amount': sum(e['total'] for e in pagadas)},
                'pendientes': {'count': len(pendientes), 'amount': sum(e['total'] for e in pendientes)},
                'vencidas': {'count': len(vencidas), 'amount': sum(e['total'] for e in vencidas)},
                'borradores': {'count': len(borradores), 'amount': sum(e['total'] for e in borradores)},
            }

            return self._json_response({'ok': True, 'data': data, 'stats': stats})

        except Exception as e:
            import traceback
            _logger.exception("ERROR GLOBAL EN /api/pos/orders")

            return self._json_response({
                'ok': False,
                'error': str(e),
                'trace': traceback.format_exc()
            }, 500)
        
    # =============================================================
    # DOWNLOAD INVOICE PDF
    # GET /api/pos/order/<order_id>/invoice
    # =============================================================
    @http.route('/api/pos/order/<int:order_id>/invoice', type='http', auth='public', methods=['GET', 'OPTIONS'], csrf=False)
    def download_invoice(self, order_id):
        if request.httprequest.method == 'OPTIONS':
            return self._options_response()
        _logger.info("[invoice-pdf] request by order_id=%s user=%s", order_id, getattr(request.env.user, 'login', None))

        order = request.env['pos.order'].sudo().browse(order_id)
        invoice = request.env['account.move'].sudo().search([('invoice_origin', '=', order.name)], limit=1)

        if not invoice:
            return self._json_response({'ok': False, 'error': 'Factura no encontrada'}, 404)

        try:
            pdf = self._render_invoice_pdf_content(invoice)
        except Exception as e:
            _logger.exception("Error generando PDF de factura %s", invoice.id)
            return self._json_response({'ok': False, 'error': str(e)}, 500)

        filename = f"factura-{invoice.name or invoice.id}.pdf"
        headers = self._cors_headers()
        headers.update({
            'Content-Type': 'application/pdf',
            'Content-Disposition': f'attachment; filename="{filename}"',
        })

        return Response(pdf, status=200, headers=headers)

    # =============================================================
    # DOWNLOAD INVOICE PDF by invoice_id directly
    # GET /api/pos/invoice/<invoice_id>/pdf
    # =============================================================
    @http.route('/api/pos/invoice/<int:invoice_id>/pdf', type='http', auth='public', methods=['GET', 'OPTIONS'], csrf=False)
    def download_invoice_by_id(self, invoice_id):
        if request.httprequest.method == 'OPTIONS':
            return self._options_response()
        _logger.info("[invoice-pdf] request by invoice_id=%s user=%s", invoice_id, getattr(request.env.user, 'login', None))

        invoice = request.env['account.move'].sudo().browse(invoice_id)
        if not invoice.exists():
            return self._json_response({'ok': False, 'error': 'Factura no encontrada'}, 404)

        try:
            pdf = self._render_invoice_pdf_content(invoice)
        except Exception as e:
            _logger.exception("Error generando PDF de factura %s", invoice_id)
            return self._json_response({'ok': False, 'error': str(e)}, 500)

        filename = f"factura-{invoice.name or invoice.id}.pdf"
        headers = self._cors_headers()
        headers.update({
            'Content-Type': 'application/pdf',
            'Content-Disposition': f'attachment; filename="{filename}"',
        })

        return Response(pdf, status=200, headers=headers)

