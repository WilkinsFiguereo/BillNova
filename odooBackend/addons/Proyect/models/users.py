from odoo import fields, models


class ProyectAppUser(models.Model):
    _name = "billnova.user"
    _description = "Proyect App User"

    name = fields.Char(string="Nombre")
    email = fields.Char(string="Email")
    phone = fields.Char(string="Telefono")
    address = fields.Char(string="Direccion")
    department = fields.Char(string="Departamento")
    avatar = fields.Binary(string="Avatar")
    avatar_mime = fields.Char(string="Avatar MIME")
    role = fields.Selection(
        [
            ("admin", "Admin"),
            ("moderation", "Moderación"),
            ("seller", "Vendedor"),
            ("user", "Usuario"),
        ],
        string="Rol",
        default="seller",
    )
    is_mobile_user = fields.Boolean(string="Es Usuario Móvil")
    res_user_id = fields.Many2one("res.users", required=True, ondelete="cascade")

