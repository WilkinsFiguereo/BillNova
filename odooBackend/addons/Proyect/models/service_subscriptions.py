from odoo import fields, models, api
from datetime import timedelta, date

class ServiceSubscription(models.Model):
    _name = "billnova.subscription"

    partner_id = fields.Many2one("res.partner", required=True)
    product_id = fields.Many2one("product.product", required=True)

    start_date = fields.Date(default=fields.Date.today)
    next_invoice_date = fields.Date()

    payment_frequency = fields.Selection(
        related="product_id.product_tmpl_id.billnova_payment_frequency",
        store=True
    )

    active = fields.Boolean(default=True)

    @api.model
    def cron_generate_service_invoices(self):
        today = date.today()
        _logger.info("🕓 Inicio facturación automática de servicios")

        subscriptions = self.search([
            ('active', '=', True),
            ('next_invoice_date', '<=', today),
        ])

        if not subscriptions:
            _logger.info("✅ No hay suscripciones para facturar hoy")
            return

        for sub in subscriptions:
            try:
                product = sub.product_id
                partner = sub.partner_id

                if not partner:
                    continue

                # Crear factura
                invoice = self.env['account.move'].create({
                    'move_type': 'out_invoice',
                    'partner_id': partner.id,
                    'invoice_date': today,
                    'invoice_line_ids': [(0, 0, {
                        'product_id': product.id,
                        'quantity': 1,
                        'price_unit': product.list_price,
                        'name': product.name,
                    })],
                })

                invoice.action_post()

                _logger.info(f"✅ Factura creada para suscripción {sub.id}")

                # Calcular siguiente fecha
                sub.next_invoice_date = self._get_next_date(
                    sub.next_invoice_date,
                    sub.payment_frequency
                )

            except Exception as e:
                _logger.error(f"❌ Error en suscripción {sub.id}: {e}")

        _logger.info("🕓 Fin facturación automática de servicios")