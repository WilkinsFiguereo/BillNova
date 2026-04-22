import logging

from odoo import fields, models

_logger = logging.getLogger(__name__)


class ResCompany(models.Model):
    _inherit = "res.company"

    def _get_moderation_email_to(self):
        self.ensure_one()
        return self.admin_email or self.contact_email or self.email or False

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
        status_label = "aprobada" if self.moderation_status == "approved" else "rechazada"
        reason_html = (
            f"<p><strong>Motivo:</strong> {self.moderation_reason}</p>"
            if self.moderation_status == "rejected" and self.moderation_reason
            else ""
        )
        body_html = f"""
            <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
                <p>Hola {self.admin_full_name or self.contact_name or self.name},</p>
                <p>La empresa <strong>{self.name}</strong> ha sido <strong>{status_label}</strong> en BillNova.</p>
                {reason_html}
                <p>Puedes entrar a la plataforma para revisar el estado actualizado.</p>
            </div>
        """
        mail = self.env["mail.mail"].sudo().create({
            "subject": f"Estado de moderacion de empresa: {self.name}",
            "email_to": email_to,
            "email_from": email_from,
            "body_html": body_html,
        })
        try:
            mail.send(raise_exception=True)
            return True
        except Exception:
            _logger.exception("No se pudo enviar el correo de moderacion de empresa a %s", email_to)
            return False

    BUSINESS_TYPE_SELECTION = [
        ("products", "Productos"),
        ("services", "Servicios"),
    ]

    COMPANY_STATUS_SELECTION = [
        ("approved", "Aprobado"),
        ("disabled", "Rechazado/Desactivado"),
    ]
    MODERATION_STATUS_SELECTION = [
        ("pending", "Pendiente"),
        ("approved", "Aprobado"),
        ("rejected", "Rechazado"),
    ]

    ruc = fields.Char("RUC/NIT/RFC")
    sector = fields.Char("Sector")
    founding_year = fields.Integer("Ano de fundacion")
    website = fields.Char("Sitio web")
    company_size = fields.Selection(
        [
            ("micro", "Micro"),
            ("small", "Pequena"),
            ("medium", "Mediana"),
            ("large", "Grande"),
        ],
        string="Tamano de empresa",
    )
    business_type = fields.Selection(
        BUSINESS_TYPE_SELECTION,
        string="Tipo de negocio",
    )

    contact_name = fields.Char("Nombre contacto")
    contact_email = fields.Char("Correo corporativo")
    contact_phone = fields.Char("Telefono")

    address_state = fields.Char("Estado")
    address_city = fields.Char("Ciudad")
    postal_code = fields.Char("Codigo postal")

    access_password = fields.Char("Access Password")

    country_name = fields.Char("Pais")
    full_address = fields.Char("Direccion completa")

    admin_full_name = fields.Char("Nombre administrador")
    admin_email = fields.Char("Email administrador")
    admin_phone = fields.Char("Telefono administrador")
    admin_position = fields.Char("Cargo administrador")

    confirm_password = fields.Char("Confirm Password")
    accept_terms = fields.Boolean("Acepta terminos")
    accept_marketing = fields.Boolean("Acepta marketing")

    moderation_status = fields.Selection(
        MODERATION_STATUS_SELECTION,
        string="Estado de moderacion",
        default="pending",
        required=True,
    )
    moderation_reason = fields.Text("Motivo de rechazo")
    moderation_updated_at = fields.Datetime("Fecha de moderacion")
    status = fields.Selection(
        COMPANY_STATUS_SELECTION,
        string="Status",
        default="disabled",
        required=True,
    )
