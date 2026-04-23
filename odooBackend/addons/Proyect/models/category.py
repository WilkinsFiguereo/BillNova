from odoo import fields, models


class ProductCategory(models.Model):
    _inherit = "product.category"

    billnova_description = fields.Text("Descripcion BillNova")
    billnova_color = fields.Char("Color BillNova", default="#1E3A8A")
    billnova_icon = fields.Char("Icono BillNova", default="Package")
    active = fields.Boolean(default=True)