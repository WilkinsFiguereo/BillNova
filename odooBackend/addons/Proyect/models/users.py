import logging
import secrets
from urllib.parse import quote

from dateutil.relativedelta import relativedelta
from odoo import fields, models

_logger = logging.getLogger(__name__)


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
            ('moderator', 'Moderacion'),
            ('gerente', 'Gerente'),
            ('seller', 'Vendedor'),
            ('worker', 'Trabajador'),
        ],
        string='Rol',
        default='seller',
    )
    is_mobile_user = fields.Boolean(string='Es Usuario Movil')
    res_user_id = fields.Many2one('res.users', required=True, ondelete='cascade')
    company_id = fields.Many2one('res.company', string='Empresa')

    active = fields.Boolean(default=True)
    verification_token = fields.Char(string='Token de verificacion', copy=False)
    verification_token_expiry = fields.Datetime(string='Expiracion token', copy=False)
    email_verified_at = fields.Datetime(string='Correo verificado el', copy=False)
    password_reset_token = fields.Char(string='Token de recuperacion', copy=False)
    password_reset_token_expiry = fields.Datetime(string='Expiracion token de recuperacion', copy=False)
    password_reset_otp = fields.Char(string='OTP de recuperacion', copy=False)
    password_reset_otp_expiry = fields.Datetime(string='Expiracion OTP de recuperacion', copy=False)

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
            or 'http://localhost:3000'
        )
        return base_url.rstrip('/')

    def _is_mobile_frontend_url(self, frontend_base_url=None):
        base_url = self._get_frontend_base_url(frontend_base_url=frontend_base_url)
        return not (base_url.startswith('http://') or base_url.startswith('https://'))

    def _build_verification_link(self, token, frontend_base_url=None):
        self.ensure_one()
        base_url = self._get_frontend_base_url(frontend_base_url=frontend_base_url)
        res_user = self._get_res_user_including_inactive()
        email = quote(self.email or res_user.email or '')
        if base_url.startswith('http://') or base_url.startswith('https://'):
            return f"{base_url}/navigation/auth/verify-email?token={quote(token)}&email={email}"
        separator = '&' if '?' in base_url else '?'
        return f"{base_url}{separator}token={quote(token)}&email={email}"

    def _build_password_reset_link(self, token, frontend_base_url=None):
        self.ensure_one()
        base_url = self._get_frontend_base_url(frontend_base_url=frontend_base_url)
        res_user = self._get_res_user_including_inactive()
        email = quote(self.email or res_user.email or '')
        if base_url.startswith('http://') or base_url.startswith('https://'):
            return f"{base_url}/navigation/auth/reset-password?token={quote(token)}&email={email}"
        separator = '&' if '?' in base_url else '?'
        return f"{base_url}{separator}token={quote(token)}&email={email}"

    def action_prepare_verification(self, frontend_base_url=None):
        self.ensure_one()
        token = secrets.token_urlsafe(24)
        expiry = fields.Datetime.now() + relativedelta(days=1)
        self.sudo().write({
            'verification_token': token,
            'verification_token_expiry': expiry,
        })
        return self._build_verification_link(token, frontend_base_url=frontend_base_url)

    def action_prepare_password_reset(self, method='link', frontend_base_url=None):
        self.ensure_one()
        token = secrets.token_urlsafe(24)
        otp = ''.join(secrets.choice('0123456789') for _ in range(6))
        expiry = fields.Datetime.now() + relativedelta(minutes=30)
        self.sudo().write({
            'password_reset_token': token,
            'password_reset_token_expiry': expiry,
            'password_reset_otp': otp,
            'password_reset_otp_expiry': expiry,
        })
        if method == 'otp':
            return otp
        return self._build_password_reset_link(token, frontend_base_url=frontend_base_url)

    def action_clear_password_reset(self):
        self.ensure_one()
        self.sudo().write({
            'password_reset_token': False,
            'password_reset_token_expiry': False,
            'password_reset_otp': False,
            'password_reset_otp_expiry': False,
        })

    def action_send_password_reset_email(self, method='link', frontend_base_url=None):
        self.ensure_one()
        res_user = self._get_res_user_including_inactive()
        email_to = self.email or res_user.email or res_user.login
        if not email_to:
            return False

        payload = self.action_prepare_password_reset(method=method, frontend_base_url=frontend_base_url)
        config = self.env['ir.config_parameter'].sudo()
        email_from = (
            config.get_param('mail.default.from')
            or self.env.company.email
            or 'no-reply@billnova.local'
        )

        if method == 'otp':
            body_html = f"""
                <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
                    <p>Hola {self.name or 'usuario'},</p>
                    <p>Recibimos una solicitud para restablecer tu contrasena de BillNova.</p>
                    <p>Ingresa este codigo en la pantalla de recuperacion:</p>
                    <p style="margin: 20px 0; font-size: 20px; font-weight: 700; letter-spacing: 4px; color: #1e3a8a;">
                        {payload}
                    </p>
                    <p>El codigo vence en 30 minutos.</p>
                    <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
                </div>
            """
        else:
            body_html = f"""
                <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
                    <p>Hola {self.name or 'usuario'},</p>
                    <p>Recibimos una solicitud para restablecer tu contrasena de BillNova.</p>
                    <p>Para continuar, usa el siguiente boton:</p>
                    <p style="margin: 24px 0;">
                        <a href="{payload}" style="background:#1e3a8a;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;display:inline-block;font-weight:700;">
                            Restablecer contrasena
                        </a>
                    </p>
                    <p>Si el boton no funciona, abre este enlace en tu navegador:</p>
                    <p><a href="{payload}">{payload}</a></p>
                    <p>El enlace vence en 30 minutos.</p>
                    <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
                </div>
            """

        mail = self.env['mail.mail'].sudo().create({
            'subject': 'Recupera tu contrasena de BillNova',
            'email_to': email_to,
            'email_from': email_from,
            'body_html': body_html,
        })
        try:
            mail.send(raise_exception=True)
            return True
        except Exception:
            _logger.exception("No se pudo enviar el correo de recuperacion a %s", email_to)
            return False

    def action_send_verification_email(self, frontend_base_url=None):
        self.ensure_one()
        res_user = self._get_res_user_including_inactive()
        email_to = self.email or res_user.email
        if not email_to:
            return False

        verification_link = self.action_prepare_verification(frontend_base_url=frontend_base_url)
        verification_token = self.verification_token or ''
        is_mobile_frontend = self._is_mobile_frontend_url(frontend_base_url=frontend_base_url)
        config = self.env['ir.config_parameter'].sudo()
        email_from = (
            config.get_param('mail.default.from')
            or self.env.company.email
            or 'no-reply@billnova.local'
        )
        if is_mobile_frontend:
            body_html = f"""
                <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
                    <p>Hola {self.name or 'usuario'},</p>
                    <p>Tu cuenta en BillNova ya fue creada, pero todavia no esta activa.</p>
                    <p>Para activarla desde el telefono, usa este token en la pantalla de verificacion de la app:</p>
                    <p style="margin: 20px 0; font-size: 20px; font-weight: 700; letter-spacing: 1px; color: #1e3a8a;">
                        {verification_token}
                    </p>
                    <p>Si prefieres abrir la app directamente, usa este boton:</p>
                    <p style="margin: 24px 0;">
                        <a href="{verification_link}" style="background:#1e3a8a;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;display:inline-block;font-weight:700;">
                            Abrir app y verificar
                        </a>
                    </p>
                    <p>Si el boton no funciona, copia este enlace en tu telefono:</p>
                    <p><a href="{verification_link}">{verification_link}</a></p>
                    <p>Este token vence en 24 horas.</p>
                </div>
            """
        else:
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
        try:
            mail.send(raise_exception=True)
            return True
        except Exception:
            _logger.exception("No se pudo enviar el correo de verificacion a %s", email_to)
            return False

    def action_send_employee_invitation_email(self, company_name=None, password=None, frontend_base_url=None):
        self.ensure_one()
        res_user = self._get_res_user_including_inactive()
        email_to = self.email or res_user.email
        if not email_to:
            return False

        verification_link = self.action_prepare_verification(frontend_base_url=frontend_base_url)
        verification_token = self.verification_token or ''
        is_mobile_frontend = self._is_mobile_frontend_url(frontend_base_url=frontend_base_url)
        config = self.env['ir.config_parameter'].sudo()
        email_from = (
            config.get_param('mail.default.from')
            or self.env.company.email
            or 'no-reply@billnova.local'
        )
        company_label = company_name or (self.company_id.name if self.company_id else 'tu empresa')
        password_html = f"<p><strong>Contrasena temporal:</strong> {password}</p>" if password else ""
        if is_mobile_frontend:
            body_html = f"""
                <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
                    <p>Hola {self.name or 'trabajador'},</p>
                    <p>Has sido agregado como trabajador en <strong>{company_label}</strong> dentro de BillNova.</p>
                    <p>Tu cuenta fue creada con el mismo sistema de acceso de la app.</p>
                    <p>Tus credenciales de acceso son:</p>
                    <p><strong>Usuario / correo:</strong> {email_to}</p>
                    {password_html}
                    <p>Antes de iniciar sesion, primero debes verificar tu correo.</p>
                    <p><strong>Token de verificacion:</strong></p>
                    <p style="margin: 20px 0; font-size: 20px; font-weight: 700; letter-spacing: 1px; color: #1e3a8a;">
                        {verification_token}
                    </p>
                    <p>Tambien puedes abrir la app directamente desde aqui:</p>
                    <p style="margin: 24px 0;">
                        <a href="{verification_link}" style="background:#1e3a8a;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;display:inline-block;font-weight:700;">
                            Abrir app y verificar
                        </a>
                    </p>
                    <p>Si el boton no funciona, copia este enlace en tu telefono:</p>
                    <p><a href="{verification_link}">{verification_link}</a></p>
                    <p>Despues de verificar, podras entrar a la app e iniciar sesion con esas credenciales.</p>
                </div>
            """
        else:
            body_html = f"""
                <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
                    <p>Hola {self.name or 'trabajador'},</p>
                    <p>Has sido agregado como trabajador en <strong>{company_label}</strong> dentro de BillNova.</p>
                    <p>Tu cuenta fue creada con el mismo sistema de acceso de la app.</p>
                    <p>Tus credenciales de acceso son:</p>
                    <p><strong>Usuario / correo:</strong> {email_to}</p>
                    {password_html}
                    <p>Antes de iniciar sesion, primero debes verificar tu correo:</p>
                    <p style="margin: 24px 0;">
                        <a href="{verification_link}" style="background:#1e3a8a;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;display:inline-block;font-weight:700;">
                            Verificar cuenta
                        </a>
                    </p>
                    <p>Si el boton no funciona, abre este enlace en tu navegador:</p>
                    <p><a href="{verification_link}">{verification_link}</a></p>
                    <p>Despues de verificar, podras entrar a la app e iniciar sesion con esas credenciales.</p>
                </div>
            """
        mail = self.env['mail.mail'].sudo().create({
            'subject': f'Invitacion como trabajador en {company_label}',
            'email_to': email_to,
            'email_from': email_from,
            'body_html': body_html,
        })
        try:
            mail.send(raise_exception=True)
            return True
        except Exception:
            _logger.exception("No se pudo enviar la invitacion del trabajador a %s", email_to)
            return False
