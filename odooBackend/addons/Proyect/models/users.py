import secrets
from urllib.parse import quote

from dateutil.relativedelta import relativedelta
from odoo import fields, models

class ProyectAppUser(models.Model):
    _name = 'billnova.user'
    _description = 'Proyect App User'

    name = fields.Char(string='Nombre')
    email = fields.Char(string='Email')
    phone = fields.Char(string='Telefono')
    address = fields.Char(string='Direccion')
    role = fields.Selection(
        [
            ('admin', 'Admin'),
            ('moderator', 'Moderación'),
            ('gerente', 'Gerente'),
            ('seller', 'Vendedor'),
            ('worker', 'Trabajador'),
        ],
        string='Rol',
        default='seller',
    )
    is_mobile_user = fields.Boolean(string='Es Usuario Móvil')
    res_user_id = fields.Many2one('res.users', required=True, ondelete='cascade')
    company_id = fields.Many2one('res.company', string='Empresa')

    active = fields.Boolean(default=True)
    verification_token = fields.Char(string='Token de verificacion', copy=False)
    verification_token_expiry = fields.Datetime(string='Expiracion token', copy=False)
    email_verified_at = fields.Datetime(string='Correo verificado el', copy=False)

    def _get_res_user_including_inactive(self):
        self.ensure_one()
        if not self.res_user_id:
            return self.env['res.users']
        return self.env['res.users'].sudo().with_context(active_test=False).browse(self.res_user_id.id)

    def _get_frontend_base_url(self, frontend_base_url=None):
        config = self.env['ir.config_parameter'].sudo()
        base_url = (
            frontend_base_url
            or config.get_param('billnova.frontend_url')
            or config.get_param('web.base.url')
            or 'http://localhost:3000'
        )
        return base_url.rstrip('/')

    def _build_verification_link(self, token, frontend_base_url=None):
        self.ensure_one()
        base_url = self._get_frontend_base_url(frontend_base_url=frontend_base_url)
        res_user = self._get_res_user_including_inactive()
        email = quote(self.email or res_user.email or '')
        return f"{base_url}/navigation/auth/verify-email?token={quote(token)}&email={email}"

    def action_prepare_verification(self, frontend_base_url=None):
        self.ensure_one()
        token = secrets.token_urlsafe(24)
        expiry = fields.Datetime.now() + relativedelta(days=1)
        self.sudo().write({
            'verification_token': token,
            'verification_token_expiry': expiry,
        })
        return self._build_verification_link(token, frontend_base_url=frontend_base_url)

    def action_send_verification_email(self, frontend_base_url=None):
        self.ensure_one()
        res_user = self._get_res_user_including_inactive()
        email_to = self.email or res_user.email
        if not email_to:
            return False

        verification_link = self.action_prepare_verification(frontend_base_url=frontend_base_url)
        config = self.env['ir.config_parameter'].sudo()
        email_from = (
            config.get_param('mail.default.from')
            or self.env.company.email
            or 'no-reply@billnova.local'
        )
        body_html = f"""
            <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
                <p>Hola {self.name or 'usuario'},</p>
                <p>Tu cuenta en BillNova ya fue creada, pero todavia no esta activa.</p>
                <p>Para activarla, confirma tu correo con el siguiente boton:</p>
                <p style="margin: 24px 0;">
                    <a href="{verification_link}" style="background:#1e3a8a;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;display:inline-block;font-weight:700;">
                        Verificar cuenta
                    </a>
                </p>
                <p>Si el boton no funciona, abre este enlace en tu navegador:</p>
                <p><a href="{verification_link}">{verification_link}</a></p>
                <p>Este enlace vence en 24 horas.</p>
            </div>
        """
        mail = self.env['mail.mail'].sudo().create({
            'subject': 'Verifica tu cuenta de BillNova',
            'email_to': email_to,
            'email_from': email_from,
            'body_html': body_html,
        })
        mail.send()
        return True

    def action_send_employee_invitation_email(self, company_name=None, password=None):
        self.ensure_one()
        res_user = self._get_res_user_including_inactive()
        email_to = self.email or res_user.email
        if not email_to:
            return False

        config = self.env['ir.config_parameter'].sudo()
        email_from = (
            config.get_param('mail.default.from')
            or self.env.company.email
            or 'no-reply@billnova.local'
        )
        company_label = company_name or (self.company_id.name if self.company_id else 'tu empresa')
        password_html = f"<p><strong>Contraseña temporal:</strong> {password}</p>" if password else ""
        body_html = f"""
            <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
                <p>Hola {self.name or 'trabajador'},</p>
                <p>Has sido agregado como trabajador en <strong>{company_label}</strong> dentro de BillNova.</p>
                <p>Tus credenciales de acceso son:</p>
                <p><strong>Correo:</strong> {email_to}</p>
                {password_html}
                <p>Tu cuenta fue creada vinculada a esa empresa y actualmente esta inactiva hasta que la empresa la habilite.</p>
                <p>Cuando sea activada, podras iniciar sesion con estas credenciales.</p>
            </div>
        """
        mail = self.env['mail.mail'].sudo().create({
            'subject': f'Invitacion como trabajador en {company_label}',
            'email_to': email_to,
            'email_from': email_from,
            'body_html': body_html,
        })
        mail.send()
        return True
