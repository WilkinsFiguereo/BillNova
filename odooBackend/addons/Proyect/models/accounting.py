from odoo import fields, models


class AccountMove(models.Model):
    _inherit = "account.move"

    billnova_app_company_id = fields.Many2one(
        "res.company",
        string="Empresa app BillNova",
        index=True,
    )


class PosOrder(models.Model):
    _inherit = "pos.order"

    billnova_app_company_id = fields.Many2one(
        "res.company",
        string="Empresa app BillNova",
        index=True,
    )
