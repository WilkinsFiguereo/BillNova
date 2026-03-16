from odoo import models, fields

class ResCompany(models.Model):
    _inherit = "res.company"

    # Empresa
    ruc = fields.Char("RUC/NIT/RFC")
    sector = fields.Char("Sector")
    founding_year = fields.Integer("Año de fundación")

    website = fields.Char("Sitio web")

    company_size = fields.Selection([
        ("micro", "Micro"),
        ("small", "Pequeña"),
        ("medium", "Mediana"),
        ("large", "Grande"),
    ], string="Tamaño de empresa")

    # Contacto
    contact_name = fields.Char("Nombre contacto")
    contact_email = fields.Char("Correo corporativo")
    contact_phone = fields.Char("Teléfono")

    # Dirección
    address_state = fields.Char("Estado")
    address_city = fields.Char("Ciudad")
    postal_code = fields.Char("Código postal")

    # Acceso
    access_password = fields.Char("Access Password")