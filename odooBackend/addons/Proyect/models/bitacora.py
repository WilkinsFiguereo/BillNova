from odoo import api, fields, models


class BillnovaBitacora(models.Model):
    _name = "billnova.bitacora"
    _description = "Bitacora de actividad"
    _order = "create_date desc, id desc"

    name = fields.Char("Titulo", required=True)
    company_id = fields.Many2one("res.company", string="Empresa", index=True)
    user_id = fields.Many2one("res.users", string="Usuario")
    billnova_user_id = fields.Many2one("billnova.user", string="Usuario Billnova")
    usuario = fields.Char("Usuario")
    usuario_rol = fields.Char("Rol usuario")
    accion = fields.Char("Accion", required=True, default="registro")
    modulo = fields.Char("Modulo", required=True, default="Sistema")
    nivel = fields.Selection(
        [
            ("info", "Info"),
            ("advertencia", "Advertencia"),
            ("critico", "Critico"),
        ],
        string="Nivel",
        default="info",
        required=True,
    )
    descripcion = fields.Text("Descripcion", required=True)
    detalle = fields.Text("Detalle")
    ip = fields.Char("IP")
    dispositivo = fields.Char("Dispositivo")
    entidad_modelo = fields.Char("Modelo entidad")
    entidad_id = fields.Integer("ID entidad")
    entidad_nombre = fields.Char("Nombre entidad")

    @api.model
    def create_event(self, values):
        payload = dict(values or {})
        payload["name"] = payload.get("name") or payload.get("descripcion") or "Evento"
        payload["accion"] = payload.get("accion") or "registro"
        payload["modulo"] = payload.get("modulo") or "Sistema"
        payload["nivel"] = payload.get("nivel") if payload.get("nivel") in ("info", "advertencia", "critico") else "info"
        payload["descripcion"] = payload.get("descripcion") or payload["name"]

        user_id = payload.get("user_id")
        if user_id and not payload.get("billnova_user_id"):
            mobile_user = self.env["billnova.user"].sudo().search([("res_user_id", "=", user_id)], limit=1)
            if mobile_user:
                payload["billnova_user_id"] = mobile_user.id
                payload["usuario_rol"] = payload.get("usuario_rol") or mobile_user.role or "seller"
                payload["usuario"] = payload.get("usuario") or mobile_user.name or mobile_user.email or ""

        user = self.env["res.users"].sudo().browse(user_id) if user_id else self.env["res.users"]
        if user_id and user.exists():
            payload["usuario"] = payload.get("usuario") or user.name or user.login or ""

        return self.sudo().create(payload)
