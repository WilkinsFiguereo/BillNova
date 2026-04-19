from odoo import fields, models


class ResCompany(models.Model):
    _inherit = "res.company"

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
        [
            ("pending", "Pendiente"),
            ("approved", "Aprobada"),
            ("rejected", "Rechazada"),
        ],
        string="Estado de moderacion",
        default="pending",
        index=True,
    )
    moderation_reason = fields.Text("Motivo de rechazo")
    moderation_updated_at = fields.Datetime("Ultima actualizacion moderacion")
