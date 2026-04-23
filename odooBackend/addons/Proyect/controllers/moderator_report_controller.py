from odoo import fields, http
from odoo.http import Response, request
import json as json_lib


class ModeratorReportApiController(http.Controller):
    def _log_event(self, descripcion, detalle="", accion="actualizar", entidad_id=None, entidad_nombre=""):
        user = request.env.user
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
            "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
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

    def _state_key(self, report_id):
        return f"proyect.moderation_report.{report_id}"

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
