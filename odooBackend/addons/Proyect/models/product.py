# models/product_company.py
from odoo import models, fields

class ProductProduct(models.Model):
    _inherit = "product.product"

    company_id = fields.Many2one(
        "res.company",
        string="Empresa",
        index=True,
    )

    billnova_moderation_status = fields.Selection(
        [
            ("pending", "Pendiente"),
            ("approved", "Aprobado"),
            ("rejected", "Rechazado"),
        ],
        string="Estado de Moderación (BillNova)",
        default="pending",
        index=True,
    )

    billnova_rejection_reason = fields.Text("Motivo de Rechazo (BillNova)")
