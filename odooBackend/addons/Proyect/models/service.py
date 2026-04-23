from odoo import fields, models


class BillnovaService(models.Model):
    _name = "billnova.service"
    _description = "Servicios BillNova"
    _order = "id desc"

    name = fields.Char("Nombre del servicio", required=True)
    description = fields.Text("Descripción corta")
    details = fields.Text("Detalles del servicio")
    image_1920 = fields.Image("Imagen del servicio", max_width=1920, max_height=1920)
    price = fields.Float("Precio", digits=(12, 2), default=0.0)
    payment_frequency = fields.Selection(
        [
            ("unico", "Pago único"),
            ("diario", "Diario"),
            ("semanal", "Semanal"),
            ("quincenal", "Quincenal"),
            ("mensual", "Mensual"),
            ("anual", "Anual"),
        ],
        string="Frecuencia de pago",
        default="unico",
    )
    active = fields.Boolean("Activo", default=True)
    company_id = fields.Many2one(
        "res.company",
        string="Empresa",
        index=True,
    )
    write_date = fields.Datetime("Última actualización", readonly=True)
    create_date = fields.Datetime("Fecha de creación", readonly=True)

    moderation_status = fields.Selection(
        [
            ("pending", "Pendiente"),
            ("approved", "Aprobado"),
            ("rejected", "Rechazado"),
        ],
        string="Estado de moderación",
        default="pending",
        required=True,
    )
    moderation_reason = fields.Text("Motivo de rechazo")
    moderation_updated_at = fields.Datetime("Fecha de moderación")
