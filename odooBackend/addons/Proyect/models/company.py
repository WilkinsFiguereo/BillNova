from odoo import fields, models


class ResCompany(models.Model):
    _inherit = "res.company"

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
