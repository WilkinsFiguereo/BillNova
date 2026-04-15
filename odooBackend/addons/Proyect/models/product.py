# models/product_company.py
from odoo import models, fields

class ProductProduct(models.Model):
    _inherit = "product.product"

    company_id = fields.Many2one(
        "res.company",
        string="Empresa",
        index=True,
    )