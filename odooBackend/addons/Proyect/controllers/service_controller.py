from odoo import fields, http
from odoo.http import Response, request
import json as json_lib
import logging
import base64
from .auth_controller import AuthApiController

_logger = logging.getLogger(__name__)


class ServiceApiController(http.Controller):
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

    def _get_current_billnova_user(self):
        user = self._get_current_res_user()
        if not user or not user.exists():
            return request.env["billnova.user"]
        return request.env["billnova.user"].sudo().search([("res_user_id", "=", user.id)], limit=1)

    def _is_company_scoped_user(self):
        billnova_user = self._get_current_billnova_user()
        return bool(
            billnova_user
            and billnova_user.exists()
            and billnova_user.role in ("seller", "gerente", "worker")
        )

    def _get_effective_company_id(self):
        billnova_user = self._get_current_billnova_user()
        if billnova_user and billnova_user.exists() and billnova_user.company_id:
            return billnova_user.company_id.id

        user = self._get_current_res_user()
        if user and user.exists() and user.company_id:
            return user.company_id.id

        return None
    def _get_current_billnova_company_id(self):
        user = request.env.user

        if not user or not user.id:
            _logger.warning("[services] Usuario no autenticado o vacío")
            return None

        try:
            is_public = user._is_public()
        except:
            is_public = True

        if is_public:
            _logger.warning("[services] Usuario es público")
            return None

        billnova_user = request.env["billnova.user"].sudo().search([("res_user_id", "=", user.id)], limit=1)

        if not billnova_user:
            _logger.warning("[services] No se encontró billnova_user para res_user_id=%s", user.id)
            return None

        if not billnova_user.company_id:
            _logger.warning("[services] billnova_user %s no tiene company_id", billnova_user.id)
            return None

        return billnova_user.company_id.id

    def _resolve_company_id_for_request(self, raw_company_id=None):
        current_company_id = self._get_effective_company_id()
        is_scoped_user = self._is_company_scoped_user()

        if is_scoped_user:
            if raw_company_id in (None, ""):
                return current_company_id

            try:
                requested_company_id = int(raw_company_id)
            except (TypeError, ValueError):
                return self._json_response({"ok": False, "error": "company_id must be an integer"}, 400)

            if current_company_id and requested_company_id != current_company_id:
                _logger.warning(
                    "[services] blocked company access user=%s requested_company_id=%s current_company_id=%s",
                    getattr(self._get_current_res_user(), "login", None),
                    requested_company_id,
                    current_company_id,
                )
                return self._json_response({"ok": False, "error": "company_id does not belong to the current user"}, 403)

            return current_company_id

        if raw_company_id in (None, ""):
            return None

        try:
            requested_company_id = int(raw_company_id)
        except (TypeError, ValueError):
            return self._json_response({"ok": False, "error": "company_id must be an integer"}, 400)

        return requested_company_id

    def _log_event(self, company_id, accion, descripcion, detalle="", entidad_id=None, entidad_nombre=""):
        try:
            user = request.env.user
            user_id = user.id if user and hasattr(user, 'id') and user.id else False

            is_public = False
            try:
                is_public = user._is_public() if hasattr(user, '_is_public') else False
            except:
                pass

            ua = request.httprequest.headers.get("User-Agent", "") or ""

            request.env["billnova.bitacora"].sudo().create_event(
                {
                    "company_id": company_id or False,
                    "user_id": user_id if not is_public else False,
                    "accion": accion,
                    "modulo": "Servicios",
                    "nivel": "info",
                    "descripcion": descripcion,
                    "detalle": detalle,
                    "ip": request.httprequest.remote_addr or "",
                    "dispositivo": ua.split("(")[0].strip() if ua else "Desconocido",
                    "entidad_modelo": "billnova.service",
                    "entidad_id": entidad_id or 0,
                    "entidad_nombre": entidad_nombre or "",
                }
            )
        except Exception as e:
            _logger.warning("[services] Error al crear bitacora: %s", str(e))

    def _cors_headers(self):
        origin = request.httprequest.headers.get("Origin")
        return {
            "Access-Control-Allow-Origin": origin or "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
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

    def _serialize(self, service):
        company = service.company_id
        image_base64 = None
        if service.image_1920:
            image_base64 = service.image_1920.decode() if isinstance(service.image_1920, bytes) else service.image_1920
        return {
            "id": service.id,
            "name": service.name,
            "description": service.description or "",
            "details": service.details or "",
            "price": service.price or 0.0,
            "payment_frequency": service.payment_frequency or "unico",
            "active": service.active or False,
            "image_url": f"data:image/png;base64,{image_base64}" if image_base64 else None,
            "company_id": company.id or None,
            "company_name": company.name or None,
            "company_email": (
                company.admin_email
                or company.contact_email
                or company.email
                or None
            ) if company else None,
            "moderation_status": service.moderation_status or "pending",
            "moderation_reason": service.moderation_reason or None,
            "moderation_updated_at": service.moderation_updated_at.isoformat() if service.moderation_updated_at else None,
            "create_date": service.create_date.isoformat() if service.create_date else None,
            "write_date": service.write_date.isoformat() if service.write_date else None,
        }

    def _decode_image_data_url(self, image_data_url):
        if image_data_url in (None, "", False):
            return False
        if not isinstance(image_data_url, str):
            return False

        raw_value = image_data_url.strip()
        if not raw_value:
            return False

        if raw_value.startswith("data:"):
            parts = raw_value.split(",", 1)
            if len(parts) != 2:
                return False
            raw_value = parts[1]

        try:
            base64.b64decode(raw_value, validate=True)
        except Exception:
            return False

        return raw_value

    def _parse_company_id(self, payload):
        company_id_int = self._resolve_company_id_for_request(payload.get("company_id"))
        if isinstance(company_id_int, Response):
            return company_id_int
        if not company_id_int:
            return None

        company = request.env["res.company"].sudo().browse(company_id_int)
        if not company.exists():
            return self._json_response({"ok": False, "error": f"Company {company_id_int} not found"}, 404)

        return company_id_int

    def _normalize_moderation_status(self, value):
        if value in ("pending", "approved", "rejected"):
            return value
        return "pending"

    @http.route("/api/services", type="http", auth="none", methods=["GET", "POST", "OPTIONS"], csrf=False)
    def list_services(self, **kwargs):
        if request.httprequest.method == "OPTIONS":
            return self._options_response()
        if request.httprequest.method == "POST":
            return self.create_service()

        _logger.info("[services] ====== INICIO LIST SERVICES ======")
        _logger.info("[services] company_id param: %s", kwargs.get("company_id"))

        domain = []
        company_id = self._resolve_company_id_for_request(kwargs.get("company_id"))
        _logger.info("[services] company_id resolved: %s", company_id)

        if isinstance(company_id, Response):
            return company_id
        if self._is_company_scoped_user() and not company_id:
            _logger.warning("[services] No hay company_id, retornando lista vacía")
            return self._json_response({"ok": True, "data": []})
        if company_id:
            domain.append(("company_id", "=", company_id))

        services = request.env["billnova.service"].sudo().search(domain)
        _logger.info("[services] Servicios encontrados: %s", len(services))
        _logger.info("[services] ====== FIN LIST SERVICES ======")
        return self._json_response({"ok": True, "data": [self._serialize(service) for service in services]})

    @http.route("/api/services/<int:service_id>", type="http", auth="none", methods=["GET", "OPTIONS"], csrf=False)
    def get_service(self, service_id):
        if request.httprequest.method == "OPTIONS":
            return self._options_response()

        service = request.env["billnova.service"].sudo().browse(service_id)
        if not service.exists():
            return self._json_response({"ok": False, "error": "Service not found"}, 404)

        return self._json_response({"ok": True, "data": self._serialize(service)})

    @http.route("/api/services/create", type="http", auth="public", methods=["POST", "OPTIONS"], csrf=False)
    def create_service(self):
        if request.httprequest.method == "OPTIONS":
            return self._options_response()

        _logger.info("[services] ====== INICIO CREATE SERVICE ======")
        _logger.info("[services] Request method: %s", request.httprequest.method)
        _logger.info("[services] User: %s (id=%s, is_public=%s)", request.env.user.login, request.env.user.id, request.env.user._is_public())

        payload = request.httprequest.get_json(silent=True) or {}
        _logger.info("[services] Payload: %s", payload)

        name = payload.get("name")
        if not name:
            _logger.warning("[services] ERROR: name es requerido")
            return self._json_response({"ok": False, "error": "name is required"}, 400)

        _logger.info("[services] Nombre: %s", name)

        company_id_int = self._parse_company_id(payload)
        if isinstance(company_id_int, Response):
            _logger.warning("[services] ERROR: company_id es response object")
            return company_id_int
        if not company_id_int:
            _logger.warning("[services] ERROR: company_id no encontrado. Current: %s", self._get_current_billnova_company_id())
            return self._json_response({"ok": False, "error": "company_id is required"}, 400)

        _logger.info("[services] Company ID: %s", company_id_int)

        vals = {
            "name": name,
            "description": payload.get("description") or "",
            "details": payload.get("details") or "",
            "price": payload.get("price", 0.0),
            "payment_frequency": payload.get("payment_frequency") or "unico",
            "active": payload.get("active", True),
            "company_id": company_id_int,
            "image_1920": self._decode_image_data_url(payload.get("image_data_url")),
            "moderation_status": self._normalize_moderation_status(payload.get("moderation_status")),
            "moderation_reason": payload.get("moderation_reason") or False,
            "moderation_updated_at": fields.Datetime.now(),
        }

        _logger.info("[services] Intentando crear servicio con vals: %s", vals)

        try:
            service = request.env["billnova.service"].sudo().create(vals)
            _logger.info("[services] Servicio creado exitosamente. ID=%s, name=%s", service.id, service.name)
        except Exception as e:
            _logger.error("[services] ERROR al crear servicio: %s", str(e))
            return self._json_response({"ok": False, "error": f"Error al crear servicio: {str(e)}"}, 500)

        self._log_event(
            company_id_int,
            "crear",
            f"Servicio creado: {service.name}",
            f"Precio: {service.price} · Frecuencia: {service.payment_frequency}",
            service.id,
            service.name,
        )
        _logger.info("[services] ====== FIN CREATE SERVICE ======")
        return self._json_response({"ok": True, "id": service.id, "data": self._serialize(service)}, 201)

    @http.route("/api/services/<int:service_id>", type="http", auth="none", methods=["PUT", "DELETE", "OPTIONS"], csrf=False)
    def update_delete_service(self, service_id):
        if request.httprequest.method == "OPTIONS":
            return self._options_response()

        service = request.env["billnova.service"].sudo().browse(service_id)
        if not service.exists():
            return self._json_response({"ok": False, "error": "Service not found"}, 404)

        if request.httprequest.method == "DELETE":
            company_id = service.company_id.id if service.company_id else False
            service_name = service.name
            service.unlink()
            self._log_event(
                company_id,
                "eliminar",
                f"Servicio eliminado: {service_name}",
                "El servicio fue eliminado desde la gestión de servicios",
                service_id,
                service_name,
            )
            return self._json_response({"ok": True})

        payload = request.httprequest.get_json(silent=True) or {}
        vals = {}

        if "name" in payload:
            vals["name"] = payload.get("name") or ""
        if "description" in payload:
            vals["description"] = payload.get("description") or ""
        if "details" in payload:
            vals["details"] = payload.get("details") or ""
        if "price" in payload:
            vals["price"] = payload.get("price", 0.0)
        if "payment_frequency" in payload:
            vals["payment_frequency"] = payload.get("payment_frequency") or "unico"
        if "active" in payload:
            vals["active"] = payload.get("active", True)
        if "image_data_url" in payload:
            vals["image_1920"] = self._decode_image_data_url(payload.get("image_data_url"))

        company_id_int = self._parse_company_id(payload)
        if isinstance(company_id_int, Response):
            return company_id_int
        if "company_id" in payload:
            vals["company_id"] = company_id_int

        if "moderation_status" in payload:
            vals["moderation_status"] = self._normalize_moderation_status(payload.get("moderation_status"))
            vals["moderation_updated_at"] = fields.Datetime.now()
            if vals["moderation_status"] != "rejected" and "moderation_reason" not in payload:
                vals["moderation_reason"] = False
        if "moderation_reason" in payload:
            vals["moderation_reason"] = payload.get("moderation_reason") or False

        if not vals:
            return self._json_response({"ok": False, "error": "No fields to update"}, 400)

        service.write(vals)
        self._log_event(
            service.company_id.id if service.company_id else False,
            "actualizar",
            f"Servicio actualizado: {service.name}",
            ", ".join(sorted(vals.keys())),
            service.id,
            service.name,
        )
        return self._json_response({"ok": True, "data": self._serialize(service)})
