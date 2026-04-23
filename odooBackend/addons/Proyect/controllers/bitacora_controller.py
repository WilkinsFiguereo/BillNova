from odoo import http
from odoo.http import request, Response
import json as json_lib
from datetime import datetime


class BitacoraApiController(http.Controller):
    def _cors_headers(self):
        origin = request.httprequest.headers.get("Origin")
        return {
            "Access-Control-Allow-Origin": origin or "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
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

    def _resolve_company_id(self):
        company_id_raw = request.httprequest.args.get("company_id")
        if company_id_raw:
            try:
                return int(company_id_raw)
            except (TypeError, ValueError):
                return None

        user = request.env.user
        if not user or user._is_public():
            return None

        mobile_user = request.env["billnova.user"].sudo().search([("res_user_id", "=", user.id)], limit=1)
        if mobile_user and mobile_user.company_id:
            return mobile_user.company_id.id

        return user.company_id.id if getattr(user, "company_id", None) else None

    @http.route("/api/bitacora", type="http", auth="public", methods=["GET", "OPTIONS"], csrf=False)
    def list_bitacora(self, **kwargs):
        if request.httprequest.method == "OPTIONS":
            return self._options_response()

        try:
            limit = min(int(request.httprequest.args.get("limit", 200)), 500)
        except Exception:
            limit = 200

        domain = []
        company_id = self._resolve_company_id()
        if company_id:
            domain.append(("company_id", "=", company_id))

        events = request.env["billnova.bitacora"].sudo().search(domain, order="create_date desc, id desc", limit=limit)

        data = []
        for event in events:
            created = event.create_date or datetime.utcnow()
            data.append(
                {
                    "id": str(event.id),
                    "usuario": event.usuario or getattr(event.user_id, "name", None) or "Sistema",
                    "usuarioRol": event.usuario_rol or "seller",
                    "accion": event.accion or "registro",
                    "modulo": event.modulo or "Sistema",
                    "nivel": event.nivel or "info",
                    "descripcion": (event.descripcion or event.name or "Evento").strip(),
                    "detalle": (event.detalle or "").strip(),
                    "ip": event.ip or "",
                    "dispositivo": event.dispositivo or "Desconocido",
                    "fecha": created.strftime("%d/%m/%Y"),
                    "hora": created.strftime("%I:%M %p").lstrip("0"),
                    "entidadNombre": event.entidad_nombre or "",
                }
            )

        return self._json_response({"ok": True, "data": data})
