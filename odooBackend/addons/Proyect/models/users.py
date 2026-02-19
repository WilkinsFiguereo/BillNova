from odoo import fields, models

class ProyectAppUser(models.Model):
    _name = 'proyect.app.user'
    _description = 'Proyect App User'

    name = fields.Char(string='Nombre')
    email = fields.Char(string='Email')
    phone = fields.Char(string='Telefono')
    address = fields.Char(string='Direccion')
    res_user_id = fields.Many2one('res.users', required=True, ondelete='cascade')
    is_mobile_user = fields.Boolean(string='Es usuario móvil', default=False)
