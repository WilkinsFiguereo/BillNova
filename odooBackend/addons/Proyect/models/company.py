from odoo import models, fields

class ResCompany(models.Model):
    _inherit = "res.company"

    # =========================
    # Empresa (YA EXISTENTES)
    # =========================
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

    # =========================
    # Contacto (YA EXISTENTES)
    # =========================
    contact_name = fields.Char("Nombre contacto")
    contact_email = fields.Char("Correo corporativo")
    contact_phone = fields.Char("Teléfono")

    # =========================
    # Dirección (YA EXISTENTES)
    # =========================
    address_state = fields.Char("Estado")
    address_city = fields.Char("Ciudad")
    postal_code = fields.Char("Código postal")

    # =========================
    # Acceso (YA EXISTENTE)
    # =========================
    access_password = fields.Char("Access Password")

    # =========================
    # 🔥 NUEVOS CAMPOS (FRONTEND)
    # =========================

    # País como texto (porque tu frontend manda string)
    country_name = fields.Char("País")

    # Dirección completa
    full_address = fields.Char("Dirección completa")

    # Admin / Responsable
    admin_full_name = fields.Char("Nombre administrador")
    admin_email = fields.Char("Email administrador")
    admin_phone = fields.Char("Teléfono administrador")
    admin_position = fields.Char("Cargo administrador")

    # Seguridad extra
    confirm_password = fields.Char("Confirm Password")
    accept_terms = fields.Boolean("Acepta términos")
    accept_marketing = fields.Boolean("Acepta marketing")

    # =========================
    # Admin Dashboard (Frontend)
    # =========================

    billnova_status = fields.Selection(
        [
            ("Activa", "Activa"),
            ("Pendiente", "Pendiente"),
            ("Inactiva", "Inactiva"),
        ],
        string="Estado (BillNova)",
        default="Activa",
    )

    billnova_plan = fields.Selection(
        [
            ("Starter", "Starter"),
            ("Business", "Business"),
            ("Premium", "Premium"),
        ],
        string="Plan (BillNova)",
        default="Starter",
    )
