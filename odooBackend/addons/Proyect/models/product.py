# models/product_company.py
from odoo import models, fields

class ProductProduct(models.Model):
    _inherit = "product.product"

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
        index=True,
    )
    moderation_reason = fields.Text(string="Motivo de rechazo")
    moderation_updated_at = fields.Datetime(string="Ultima actualizacion moderacion")