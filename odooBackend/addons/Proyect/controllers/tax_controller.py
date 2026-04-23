import json as json_lib
import logging

from odoo import http
from odoo.http import Response, request

_logger = logging.getLogger(__name__)


class TaxApiController(http.Controller):
    def _get_current_billnova_user(self):
        user = request.env.user
        if not user or user._is_public():
            return request.env['billnova.user']
        return request.env['billnova.user'].sudo().search([('res_user_id', '=', user.id)], limit=1)

    def _current_billnova_role(self):
        billnova_user = self._get_current_billnova_user()
        return billnova_user.role if billnova_user else None

    def _can_manage_taxes(self):
        return self._current_billnova_role() in ('seller', 'gerente', 'admin')

    def _forbidden_manage_response(self):
        return self._json_response({'ok': False, 'error': 'No tienes permisos para gestionar impuestos.'}, 403)

    def _get_current_billnova_company_id(self):
        billnova_user = self._get_current_billnova_user()
        return billnova_user.company_id.id if billnova_user and billnova_user.company_id else None

    def _resolve_company_id_for_request(self, raw_company_id=None):
        current_company_id = self._get_current_billnova_company_id()
        if not current_company_id:
            return None

        if raw_company_id in (None, ''):
            return current_company_id

        try:
            requested_company_id = int(raw_company_id)
        except (TypeError, ValueError):
            return self._json_response({'ok': False, 'error': 'company_id must be integer'}, 400)

        if requested_company_id != current_company_id:
            return self._json_response({'ok': False, 'error': 'company_id does not belong to the current user'}, 403)

        return current_company_id

    def _log_event(self, company_id, accion, descripcion, detalle="", entidad_id=None, entidad_nombre=""):
        user = request.env.user
        ua = request.httprequest.headers.get('User-Agent', '') or ''
        request.env['billnova.bitacora'].sudo().create_event({
            'company_id': company_id or False,
            'user_id': user.id if user and not user._is_public() else False,
            'accion': accion,
            'modulo': 'Impuestos',
            'nivel': 'info',
            'descripcion': descripcion,
            'detalle': detalle,
            'ip': request.httprequest.remote_addr or '',
            'dispositivo': ua.split("(")[0].strip() if ua else 'Desconocido',
            'entidad_modelo': 'account.tax',
            'entidad_id': entidad_id or 0,
            'entidad_nombre': entidad_nombre or '',
        })

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
            json_lib.dumps(data, default=str),
            status=status,
            headers=self._cors_headers(),
            content_type='application/json',
        )

    def _options_response(self):
        return Response('', status=200, headers=self._cors_headers())

    def _serialize_tax(self, tax):
        return {
            'id': tax.id,
            'name': tax.name or '',
            'description': tax.description or tax.name or '',
            'amount': tax.amount,
            'amount_type': tax.amount_type,
            'price_include': tax.price_include,
            'type_tax_use': tax.type_tax_use,
            'active': tax.active,
            'company_id': tax.company_id.id if tax.company_id else None,
            'company_name': tax.company_id.name if tax.company_id else None,
            'account': self._get_tax_account(tax),
            'is_retention': 'retenc' in (tax.name or '').lower() or 'ret.' in (tax.name or '').lower(),
        }

    def _get_tax_account(self, tax):
        try:
            lines = tax.invoice_repartition_line_ids.filtered(
                lambda line: line.repartition_type == 'tax' and line.account_id
            )
            if lines:
                account = lines[0].account_id
                return f"{account.code} - {account.name}"
        except Exception:
            pass
        return ''

    @http.route('/api/taxes', type='http', auth='none', methods=['GET', 'OPTIONS'], csrf=False)
    def list_taxes(self, **kwargs):
        if request.httprequest.method == 'OPTIONS':
            return self._options_response()

        try:
            company_id = self._resolve_company_id_for_request(kwargs.get('company_id'))
            if isinstance(company_id, Response):
                return company_id
            if not company_id:
                return self._json_response({'ok': True, 'data': []})

            domain = [
                ('active', 'in', [True, False]),
                ('company_id', '=', company_id),
            ]
            taxes = request.env['account.tax'].sudo().search(domain, order='sequence asc, name asc')

            return self._json_response({'ok': True, 'data': [self._serialize_tax(tax) for tax in taxes]})
        except Exception as error:
            _logger.exception("Error listando impuestos")
            return self._json_response({'ok': False, 'error': str(error)}, 500)

    @http.route('/api/taxes/<int:tax_id>', type='http', auth='none', methods=['GET', 'OPTIONS'], csrf=False)
    def get_tax(self, tax_id):
        if request.httprequest.method == 'OPTIONS':
            return self._options_response()

        company_id = self._get_current_billnova_company_id()
        if not company_id:
            return self._json_response({'ok': False, 'error': 'El usuario actual no tiene empresa asignada'}, 404)

        tax = request.env['account.tax'].sudo().browse(tax_id)
        if not tax.exists() or (tax.company_id and tax.company_id.id != company_id):
            return self._json_response({'ok': False, 'error': 'Impuesto no encontrado'}, 404)

        return self._json_response({'ok': True, 'data': self._serialize_tax(tax)})

    @http.route('/api/taxes/create', type='http', auth='public', methods=['POST', 'OPTIONS'], csrf=False)
    def create_tax(self):
        if request.httprequest.method == 'OPTIONS':
            return self._options_response()
        if not self._can_manage_taxes():
            return self._forbidden_manage_response()

        payload = request.httprequest.get_json(silent=True) or {}
        name = payload.get('name', '').strip()
        if not name:
            return self._json_response({'ok': False, 'error': 'name es requerido'}, 400)

        company_id = self._resolve_company_id_for_request(payload.get('company_id'))
        if isinstance(company_id, Response):
            return company_id
        if not company_id:
            return self._json_response({'ok': False, 'error': 'El usuario actual no tiene empresa asignada'}, 400)

        amount_type_raw = payload.get('amount_type', 'percent')
        amount_type_map = {'porcentaje': 'percent', 'fijo': 'fixed', 'exento': 'percent'}
        amount_type = amount_type_map.get(amount_type_raw, amount_type_raw)

        scope_raw = payload.get('type_tax_use', 'sale')
        scope_map = {'ventas': 'sale', 'compras': 'purchase', 'ambos': 'all'}
        type_tax_use = scope_map.get(scope_raw, scope_raw)

        try:
            vals = {
                'name': name,
                'description': payload.get('description', name),
                'amount': float(payload.get('amount', 0)),
                'amount_type': amount_type,
                'price_include': bool(payload.get('price_include', False)),
                'type_tax_use': type_tax_use,
                'active': bool(payload.get('active', True)),
                'company_id': company_id,
            }

            tax = request.env['account.tax'].sudo().create(vals)
            self._log_event(
                tax.company_id.id if tax.company_id else company_id,
                'crear',
                f'Impuesto creado: {tax.name}',
                f'Monto: {tax.amount} · Tipo: {tax.amount_type}',
                tax.id,
                tax.name,
            )

            return self._json_response({'ok': True, 'id': tax.id, 'data': self._serialize_tax(tax)}, 201)
        except Exception as error:
            _logger.exception("Error creando impuesto")
            return self._json_response({'ok': False, 'error': str(error)}, 500)

    @http.route('/api/taxes/<int:tax_id>', type='http', auth='none', methods=['PUT', 'OPTIONS'], csrf=False)
    def update_tax(self, tax_id):
        if request.httprequest.method == 'OPTIONS':
            return self._options_response()
        if not self._can_manage_taxes():
            return self._forbidden_manage_response()

        company_id = self._get_current_billnova_company_id()
        if not company_id:
            return self._json_response({'ok': False, 'error': 'El usuario actual no tiene empresa asignada'}, 400)

        tax = request.env['account.tax'].sudo().browse(tax_id)
        if not tax.exists() or (tax.company_id and tax.company_id.id != company_id):
            return self._json_response({'ok': False, 'error': 'Impuesto no encontrado'}, 404)

        payload = request.httprequest.get_json(silent=True) or {}
        vals = {}

        if 'name' in payload:
            vals['name'] = payload['name']
        if 'description' in payload:
            vals['description'] = payload['description']
        if 'active' in payload:
            vals['active'] = bool(payload['active'])
        if 'price_include' in payload:
            vals['price_include'] = bool(payload['price_include'])
        if 'amount' in payload:
            vals['amount'] = float(payload['amount'])
        if 'amount_type' in payload:
            amount_type_map = {'porcentaje': 'percent', 'fijo': 'fixed', 'exento': 'percent'}
            vals['amount_type'] = amount_type_map.get(payload['amount_type'], payload['amount_type'])
        if 'type_tax_use' in payload:
            scope_map = {'ventas': 'sale', 'compras': 'purchase', 'ambos': 'all'}
            vals['type_tax_use'] = scope_map.get(payload['type_tax_use'], payload['type_tax_use'])
        if 'company_id' in payload:
            resolved_company_id = self._resolve_company_id_for_request(payload.get('company_id'))
            if isinstance(resolved_company_id, Response):
                return resolved_company_id
            if not resolved_company_id:
                return self._json_response({'ok': False, 'error': 'El usuario actual no tiene empresa asignada'}, 400)
            vals['company_id'] = resolved_company_id

        if not vals:
            return self._json_response({'ok': False, 'error': 'No hay campos para actualizar'}, 400)

        try:
            tax.write(vals)
            self._log_event(
                tax.company_id.id if tax.company_id else False,
                'actualizar',
                f'Impuesto actualizado: {tax.name}',
                ', '.join(sorted(vals.keys())),
                tax.id,
                tax.name,
            )
            return self._json_response({'ok': True, 'data': self._serialize_tax(tax)})
        except Exception as error:
            _logger.exception("Error actualizando impuesto %s", tax_id)
            return self._json_response({'ok': False, 'error': str(error)}, 500)

    @http.route('/api/taxes/<int:tax_id>', type='http', auth='none', methods=['DELETE', 'OPTIONS'], csrf=False)
    def delete_tax(self, tax_id):
        if request.httprequest.method == 'OPTIONS':
            return self._options_response()
        if not self._can_manage_taxes():
            return self._forbidden_manage_response()

        company_id = self._get_current_billnova_company_id()
        if not company_id:
            return self._json_response({'ok': False, 'error': 'El usuario actual no tiene empresa asignada'}, 400)

        tax = request.env['account.tax'].sudo().browse(tax_id)
        if not tax.exists() or (tax.company_id and tax.company_id.id != company_id):
            return self._json_response({'ok': False, 'error': 'Impuesto no encontrado'}, 404)

        try:
            tax.write({'active': False})
            self._log_event(
                tax.company_id.id if tax.company_id else False,
                'eliminar',
                f'Impuesto archivado: {tax.name}',
                'El impuesto fue marcado como inactivo',
                tax.id,
                tax.name,
            )
            return self._json_response({'ok': True, 'archived': True})
        except Exception as error:
            _logger.exception("Error eliminando impuesto %s", tax_id)
            return self._json_response({'ok': False, 'error': str(error)}, 500)

    @http.route('/api/taxes/compute', type='http', auth='public', methods=['POST', 'OPTIONS'], csrf=False)
    def compute_taxes(self):
        if request.httprequest.method == 'OPTIONS':
            return self._options_response()

        payload = request.httprequest.get_json(silent=True) or {}
        tax_ids = payload.get('tax_ids', [])
        base = float(payload.get('base', 0))
        company_id = self._resolve_company_id_for_request(payload.get('company_id'))
        if isinstance(company_id, Response):
            return company_id

        if not tax_ids:
            return self._json_response({'ok': False, 'error': 'tax_ids requerido'}, 400)

        try:
            taxes = request.env['account.tax'].sudo().browse([int(tax_id) for tax_id in tax_ids])
            if company_id:
                taxes = taxes.filtered(lambda tax: not tax.company_id or tax.company_id.id == int(company_id))
            else:
                taxes = taxes.browse([])

            result = taxes.compute_all(base)
            return self._json_response({
                'ok': True,
                'base': result['total_excluded'],
                'total': result['total_included'],
                'total_excluded': result['total_excluded'],
                'total_included': result['total_included'],
                'taxes': [
                    {
                        'id': tax['id'],
                        'name': tax['name'],
                        'amount': round(tax['amount'], 2),
                    }
                    for tax in result['taxes']
                ],
            })
        except Exception as error:
            _logger.exception("Error computando impuestos")
            return self._json_response({'ok': False, 'error': str(error)}, 500)
