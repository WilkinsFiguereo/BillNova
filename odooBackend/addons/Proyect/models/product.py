# models/product_company.py
import logging

from odoo import fields, models

_logger = logging.getLogger(__name__)


class ProductProduct(models.Model):
    _inherit = "product.product"

    def _get_moderation_email_to(self):
        self.ensure_one()
        company = self.company_id
        if not company:
            return False
        return company.admin_email or company.contact_email or company.email or False

    def action_send_moderation_status_email(self):
        self.ensure_one()
        email_to = self._get_moderation_email_to()
        if not email_to:
            return False

        config = self.env["ir.config_parameter"].sudo()
        email_from = (
            config.get_param("mail.default.from")
            or self.env.company.email
            or "no-reply@billnova.local"
        )
        status_label = "aprobado" if self.moderation_status == "approved" else "rechazado"
        reason_html = (
            f"<p><strong>Motivo:</strong> {self.moderation_reason}</p>"
            if self.moderation_status == "rejected" and self.moderation_reason
            else ""
        )
        body_html = f"""
            <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
                <p>Hola,</p>
                <p>El producto <strong>{self.name}</strong> de la empresa <strong>{self.company_id.name or 'Sin empresa'}</strong> ha sido <strong>{status_label}</strong> en BillNova.</p>
                {reason_html}
                <p>Puedes entrar a la plataforma para revisar el estado actualizado.</p>
            </div>
        """
        mail = self.env["mail.mail"].sudo().create({
            "subject": f"Estado de moderacion del producto: {self.name}",
            "email_to": email_to,
            "email_from": email_from,
            "body_html": body_html,
        })
        try:
            mail.send(raise_exception=True)
            return True
        except Exception:
            _logger.exception("No se pudo enviar el correo de moderacion del producto a %s", email_to)
            return False

    company_id = fields.Many2one(
        "res.company",
        string="Empresa",
        index=True,
    )
    moderation_status = fields.Selection(
        [
            ("pending", "Pendiente"),
            ("approved", "Aprobado"),
            ("rejected", "Rechazado"),
        ],
        string="Estado de moderacion",
        default="pending",
        required=True,
    )
    moderation_reason = fields.Text("Motivo de rechazo")
    moderation_updated_at = fields.Datetime("Fecha de moderacion")
