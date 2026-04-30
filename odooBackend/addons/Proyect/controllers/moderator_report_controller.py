from odoo import fields, http
from odoo.http import Response, request
import json as json_lib
import logging
import uuid
from .auth_controller import AuthApiController

_logger = logging.getLogger(__name__)

class ModeratorReportApiController(http.Controller):
    _ADMIN_REPORT_KEY_PREFIX = "proyect.admin_report."

    def _log_event(self, descripcion, detalle="", accion="actualizar", entidad_id=None, entidad_nombre=""):
        user = self._get_current_res_user()
        ua = request.httprequest.headers.get("User-Agent", "") or ""
        request.env["billnova.bitacora"].sudo().create_event(
            {
                "company_id": False,
                "user_id": user.id if user and not user._is_public() else False,
                "accion": accion,
                "modulo": "Reportes",
                "nivel": "info",
                "descripcion": descripcion,
                "detalle": detalle,
                "ip": request.httprequest.remote_addr or "",
                "dispositivo": ua.split("(")[0].strip() if ua else "Desconocido",
                "entidad_modelo": "moderation.report",
                "entidad_id": entidad_id or 0,
                "entidad_nombre": entidad_nombre or "",
            }
        )

    def _cors_headers(self):
        origin = request.httprequest.headers.get("Origin")
        return {
            "Access-Control-Allow-Origin": origin or "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, Origin, X-Auth-Session",
            "Access-Control-Allow-Credentials": "true",
        }

    def _json_response(self, data, status=200):
        return Response(
            json_lib.dumps(data),
            status=status,
            headers=self._cors_headers(),
            content_type="application/json",
        )

    def _options_response(self):
        return Response("", status=200, headers=self._cors_headers())

    def _get_current_res_user(self):
        AuthApiController()._ensure_session_from_request()
        session_uid = getattr(request.session, "uid", None)
        if session_uid:
            user = request.env["res.users"].sudo().with_context(active_test=False).browse(session_uid)
            if user.exists():
                return user

        user = request.env.user
        if user and getattr(user, "id", False):
            try:
                if user._is_public():
                    return request.env["res.users"]
            except Exception:
                return request.env["res.users"]
            return user.sudo().with_context(active_test=False)

        return request.env["res.users"]

    def _state_key(self, report_id):
        return f"proyect.moderation_report.{report_id}"

    def _admin_report_key(self, report_id):
        return f"{self._ADMIN_REPORT_KEY_PREFIX}{report_id}"

    def _load_override(self, report_id):
        raw = request.env["ir.config_parameter"].sudo().get_param(self._state_key(report_id))
        if not raw:
            return {}
        try:
            return json_lib.loads(raw)
        except Exception:
            return {}

    def _save_override(self, report_id, payload):
        request.env["ir.config_parameter"].sudo().set_param(self._state_key(report_id), json_lib.dumps(payload))

    def _load_admin_report(self, report_id):
        raw = request.env["ir.config_parameter"].sudo().get_param(self._admin_report_key(report_id))
        if not raw:
            return None
        try:
            return json_lib.loads(raw)
        except Exception:
            _logger.exception("No se pudo leer el reporte administrativo %s", report_id)
            return None

    def _save_admin_report(self, report_id, payload):
        request.env["ir.config_parameter"].sudo().set_param(
            self._admin_report_key(report_id),
            json_lib.dumps(payload),
        )

    def _list_admin_reports(self):
        params = request.env["ir.config_parameter"].sudo().search([
            ("key", "like", f"{self._ADMIN_REPORT_KEY_PREFIX}%")
        ], order="key desc")
        reports = []
        for param in params:
            try:
                payload = json_lib.loads(param.value or "{}")
            except Exception:
                continue
            if payload:
                reports.append(payload)
        reports.sort(key=lambda report: report.get("createdAt") or "", reverse=True)
        return reports

    def _current_reporter_payload(self):
        user = self._get_current_res_user()
        if user and user.exists():
            return {
                "id": str(user.id),
                "name": user.name or "Administrador",
                "email": user.email or user.login or "",
            }
        return {"id": "", "name": "Sistema", "email": ""}

    def _send_report_notification_email(self, *, email_to, subject, title, reason, entity_label):
        if not email_to:
            return False

        config = request.env["ir.config_parameter"].sudo()
        email_from = (
            config.get_param("mail.default.from")
            or request.env.company.email
            or "no-reply@billnova.local"
        )
        body_html = f"""
            <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
                <p>Hola,</p>
                <p>Se ha registrado un reporte administrativo para <strong>{entity_label}</strong> y la cuenta/empresa fue desactivada.</p>
                <p><strong>Titulo:</strong> {title}</p>
                <p><strong>Motivo:</strong> {reason}</p>
                <p>Si consideras que esto es un error, contacta al equipo de soporte de BillNova.</p>
            </div>
        """
        mail = request.env["mail.mail"].sudo().create({
            "subject": subject,
            "email_to": email_to,
            "email_from": email_from,
            "body_html": body_html,
        })
        try:
            mail.send(raise_exception=True)
            return True
        except Exception:
            _logger.exception("No se pudo enviar el correo de reporte a %s", email_to)
            return False

    def _deactivate_report_target(self, *, target_type, target_model, target_id, title, reason):
        if target_type == "empresa" and target_model == "res.company":
            company = request.env["res.company"].sudo().browse(target_id)
            if not company.exists():
                return None, "Empresa no encontrada"

            company.sudo().write({
                "status": "disabled",
                "moderation_status": "rejected",
                "moderation_reason": reason,
                "moderation_updated_at": fields.Datetime.now(),
            })
            email_to = company.admin_email or company.contact_email or company.email or False
            self._send_report_notification_email(
                email_to=email_to,
                subject=title,
                title=title,
                reason=reason,
                entity_label=company.name,
            )
            return {
                "targetLabel": company.name,
                "targetEmail": email_to or "",
                "status": "disabled",
            }, None

        if target_type == "usuario" and target_model == "res.users":
            res_user = request.env["res.users"].sudo().with_context(active_test=False).browse(target_id)
            if not res_user.exists():
                related_billnova_user = request.env["billnova.user"].sudo().with_context(active_test=False).search([
                    "|",
                    ("id", "=", target_id),
                    ("res_user_id", "=", target_id),
                ], limit=1)
                if related_billnova_user:
                    res_user = related_billnova_user.res_user_id.sudo().with_context(active_test=False)
                if not res_user.exists():
                    return None, "Usuario no encontrado"

            related_billnova_users = request.env["billnova.user"].sudo().with_context(active_test=False).search([
                ("res_user_id", "=", res_user.id)
            ])
            res_user.sudo().write({"active": False})
            if related_billnova_users:
                related_billnova_users.sudo().write({"active": False})

            email_to = res_user.email or res_user.login or ""
            self._send_report_notification_email(
                email_to=email_to,
                subject=title,
                title=title,
                reason=reason,
                entity_label=res_user.name,
            )
            return {
                "targetLabel": res_user.name,
                "targetEmail": email_to,
                "status": "disabled",
            }, None

        if target_type == "usuario" and target_model == "billnova.user":
            billnova_user = request.env["billnova.user"].sudo().with_context(active_test=False).browse(target_id)
            if not billnova_user.exists():
                billnova_user = request.env["billnova.user"].sudo().with_context(active_test=False).search([
                    ("res_user_id", "=", target_id)
                ], limit=1)
                if not billnova_user.exists():
                    res_user = request.env["res.users"].sudo().with_context(active_test=False).browse(target_id)
                    if res_user.exists():
                        related_billnova_user = request.env["billnova.user"].sudo().with_context(active_test=False).search([
                            ("res_user_id", "=", res_user.id)
                        ], limit=1)
                        if related_billnova_user.exists():
                            billnova_user = related_billnova_user
                if not billnova_user.exists():
                    return None, "Usuario no encontrado"

            billnova_user.sudo().write({"active": False})
            if billnova_user.res_user_id:
                billnova_user.res_user_id.sudo().with_context(active_test=False).write({"active": False})

            email_to = (
                billnova_user.email
                or getattr(billnova_user.res_user_id, "email", None)
                or getattr(billnova_user.res_user_id, "login", "")
            )
            self._send_report_notification_email(
                email_to=email_to,
                subject=title,
                title=title,
                reason=reason,
                entity_label=billnova_user.name,
            )
            return {
                "targetLabel": billnova_user.name,
                "targetEmail": email_to or "",
                "status": "disabled",
            }, None

        return None, "Objetivo de reporte no soportado"

    def _serialize_admin_report(self, report):
        return {
            "id": str(report.get("id") or ""),
            "title": report.get("title") or "",
            "description": report.get("description") or "",
            "category": report.get("category") or "other",
            "severity": report.get("severity") or "medium",
            "status": report.get("status") or "open",
            "reporter": report.get("reporter") or {"id": "", "name": "Sistema", "email": ""},
            "createdAt": report.get("createdAt") or "",
            "updatedAt": report.get("updatedAt") or report.get("createdAt") or "",
            "attachments": report.get("attachments") or [],
            "targetType": report.get("targetType") or "",
            "targetModel": report.get("targetModel") or "",
            "targetId": report.get("targetId") or None,
            "targetLabel": report.get("targetLabel") or "",
        }

    def _severity_to_priority(self, level):
        value = (level or "").lower()
        if value in ("error", "critical"):
            return "urgente"
        if value in ("warning", "warn"):
            return "alta"
        return "media"

    def _serialize_log_as_report(self, log):
        report_id = str(log.id)
        override = self._load_override(report_id)
        created = log.create_date.isoformat() if log.create_date else ""
        updated = log.write_date.isoformat() if log.write_date else created
        return {
            "id": report_id,
            "codigo": f"REP-{log.id:05d}",
            "titulo": getattr(log, "name", None) or f"Incidencia #{log.id}",
            "descripcion": (getattr(log, "message", None) or getattr(log, "name", None) or "Incidencia sin detalle").strip(),
            "categoria": "otro",
            "estado": override.get("estado") or "pendiente",
            "prioridad": self._severity_to_priority(getattr(log, "level", None)),
            "usuario": {
                "id": str(getattr(log.create_uid, "id", "") or ""),
                "nombre": getattr(log.create_uid, "name", None) or "Sistema",
                "email": getattr(log.create_uid, "email", None) or "",
                "telefono": getattr(log.create_uid, "phone", None) or "",
            },
            "pedido": None,
            "fechaCreacion": created,
            "fechaActualizacion": override.get("fechaActualizacion") or updated,
            "imagenes": [],
            "notasModerador": override.get("notasModerador") or "",
            "historial": override.get("historial") or [],
        }

    @http.route("/api/moderation/reports", type="http", auth="public", methods=["GET", "OPTIONS"], csrf=False)
    def list_reports(self, **kwargs):
        if request.httprequest.method == "OPTIONS":
            return self._options_response()

        logs = request.env["ir.logging"].sudo().search([], order="create_date desc, id desc", limit=100)
        return self._json_response({"ok": True, "data": [self._serialize_log_as_report(log) for log in logs]})

    @http.route("/api/moderation/reports/<int:report_id>", type="http", auth="public", methods=["PUT", "OPTIONS"], csrf=False)
    def update_report(self, report_id, **kwargs):
        if request.httprequest.method == "OPTIONS":
            return self._options_response()

        log = request.env["ir.logging"].sudo().browse(report_id)
        if not log.exists():
            return self._json_response({"ok": False, "error": "Report not found"}, 404)

        payload = request.httprequest.get_json(silent=True) or {}
        current = self._load_override(str(report_id))
        previous_state = current.get("estado") or "pendiente"
        history = current.get("historial") or []

        if payload.get("estado"):
            history.append(
                {
                    "id": f"{report_id}-{len(history) + 1}",
                    "fecha": fields.Datetime.now().isoformat(),
                    "estadoAnterior": previous_state,
                    "estadoNuevo": payload.get("estado"),
                    "moderador": request.env.user.name if request.env.user and not request.env.user._is_public() else "Moderador",
                    "nota": payload.get("nota") or "",
                }
            )
            current["estado"] = payload.get("estado")
            current["historial"] = history

        if "notasModerador" in payload:
            current["notasModerador"] = payload.get("notasModerador") or ""

        current["fechaActualizacion"] = fields.Datetime.now().isoformat()
        self._save_override(str(report_id), current)
        self._log_event(
            f"Reporte actualizado: {getattr(log, 'name', None) or f'Incidencia #{report_id}'}",
            f"Estado: {current.get('estado') or previous_state}",
            "actualizar",
            report_id,
            getattr(log, "name", None) or f"Incidencia #{report_id}",
        )
        return self._json_response({"ok": True, "data": self._serialize_log_as_report(log)})

    @http.route("/api/reports", type="http", auth="public", methods=["GET", "POST", "OPTIONS"], csrf=False)
    def admin_reports(self, **kwargs):
        if request.httprequest.method == "OPTIONS":
            return self._options_response()

        if request.httprequest.method == "GET":
            reports = [self._serialize_admin_report(report) for report in self._list_admin_reports()]
            return self._json_response({"ok": True, "data": reports})

        payload = request.httprequest.get_json(silent=True) or {}
        title = (payload.get("title") or "").strip()
        description = (payload.get("description") or "").strip()
        category = (payload.get("category") or "other").strip()
        severity = (payload.get("severity") or "medium").strip()
        target_type = (payload.get("targetType") or "").strip().lower()
        target_model = (payload.get("targetModel") or "").strip()
        target_id = payload.get("targetId")
        target_label = (payload.get("targetLabel") or "").strip()

        if not title or not description:
            return self._json_response({"ok": False, "error": "Titulo y descripcion son obligatorios"}, 400)

        try:
            target_id = int(target_id)
        except (TypeError, ValueError):
            return self._json_response({"ok": False, "error": "targetId invalido"}, 400)

        if target_type not in ("usuario", "empresa"):
            return self._json_response({"ok": False, "error": "targetType invalido"}, 400)

        target_result, target_error = self._deactivate_report_target(
            target_type=target_type,
            target_model=target_model,
            target_id=target_id,
            title=title,
            reason=description,
        )
        if target_error:
            return self._json_response({"ok": False, "error": target_error}, 400)

        report_id = uuid.uuid4().hex
        now = fields.Datetime.now().isoformat()
        report = {
            "id": report_id,
            "title": title,
            "description": description,
            "category": category,
            "severity": severity,
            "status": "open",
            "reporter": self._current_reporter_payload(),
            "createdAt": now,
            "updatedAt": now,
            "attachments": [],
            "targetType": target_type,
            "targetModel": target_model,
            "targetId": target_id,
            "targetLabel": target_label or (target_result or {}).get("targetLabel") or "",
        }
        self._save_admin_report(report_id, report)
        self._log_event(
            f"Reporte administrativo creado: {title}",
            f"Objetivo: {report['targetLabel']} | Estado aplicado: {(target_result or {}).get('status', 'disabled')}",
            "crear",
            entidad_id=target_id,
            entidad_nombre=report["targetLabel"],
        )
        return self._json_response({"ok": True, "data": self._serialize_admin_report(report)}, 201)
