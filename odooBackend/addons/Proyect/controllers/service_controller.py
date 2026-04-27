from odoo import SUPERUSER_ID, fields, http
from odoo.http import Response, request
import json as json_lib
import logging
import base64
from .auth_controller import AuthApiController

_logger = logging.getLogger(__name__)


class ServiceApiController(http.Controller):
    _GALLERY_FIELD_NAMES = (
        "billnova_image_2_1920",
        "billnova_image_3_1920",
        "billnova_image_4_1920",
        "billnova_image_5_1920",
    )

    def _get_service_template_model(self):
        return request.env["product.template"].with_user(SUPERUSER_ID).sudo()

    def _get_service_type_domain(self):
        product_model = request.env["product.product"].sudo()
        if "detailed_type" in product_model._fields:
            return [("detailed_type", "=", "service")]
        if "type" in product_model._fields:
            return [("type", "=", "service")]
        return []

    def _is_service_product(self, product):
        if not product or not product.exists():
            return False
        detailed_type = getattr(product, "detailed_type", None)
        if detailed_type is not None:
            return detailed_type == "service"
        product_type = getattr(product, "type", None)
        if product_type is not None:
            return product_type == "service"
        return False

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
        return self._get_effective_company_id()

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

    def _decode_image_list(self, image_data_urls):
        if image_data_urls in (None, False):
            return []
        if not isinstance(image_data_urls, list):
            return None

        decoded = []
        for raw_image in image_data_urls:
            decoded_image = self._decode_image_data_url(raw_image)
            if not decoded_image:
                return None
            decoded.append(decoded_image)
        return decoded

    def _extract_image_payload(self, payload, require_images=False):
        if "image_data_urls" in payload:
            decoded_images = self._decode_image_list(payload.get("image_data_urls"))
            if decoded_images is None:
                return None, self._json_response({"ok": False, "error": "image_data_urls must be a list of valid base64 images"}, 400)
            if len(decoded_images) < 1:
                return None, self._json_response({"ok": False, "error": "Debes agregar al menos 1 imagen."}, 400)
            if len(decoded_images) > 5:
                return None, self._json_response({"ok": False, "error": "Solo se permiten hasta 5 imagenes."}, 400)
            return decoded_images, None

        if "image_data_url" in payload:
            decoded_image = self._decode_image_data_url(payload.get("image_data_url"))
            if require_images and not decoded_image:
                return None, self._json_response({"ok": False, "error": "Debes agregar al menos 1 imagen."}, 400)
            if decoded_image:
                return [decoded_image], None
            return [], None

        if require_images:
            return None, self._json_response({"ok": False, "error": "Debes agregar al menos 1 imagen."}, 400)

        return None, None

    def _to_image_url(self, value):
        if not value:
            return None
        encoded = value.decode() if isinstance(value, bytes) else value
        return f"data:image/png;base64,{encoded}" if encoded else None

    def _serialize_service_images(self, service):
        template = service.product_tmpl_id
        image_urls = []
        primary = self._to_image_url(service.image_1920)
        if primary:
            image_urls.append(primary)
        for field_name in self._GALLERY_FIELD_NAMES:
            image_url = self._to_image_url(getattr(template, field_name, False))
            if image_url:
                image_urls.append(image_url)
        return image_urls[:5]

    def _apply_gallery_to_service(self, service, decoded_images):
        if decoded_images is None:
            return

        template_vals = {}
        service.write({"image_1920": decoded_images[0] if decoded_images else False})
        for index, field_name in enumerate(self._GALLERY_FIELD_NAMES, start=1):
            template_vals[field_name] = decoded_images[index] if index < len(decoded_images) else False
        service.product_tmpl_id.write(template_vals)

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

    def _get_service_moderation_status(self, product):
        template = product.product_tmpl_id
        return product.moderation_status or template.moderation_status or "pending"

    def _get_service_moderation_reason(self, product):
        template = product.product_tmpl_id
        return product.moderation_reason or template.moderation_reason or None

    def _get_service_moderation_updated_at(self, product):
        template = product.product_tmpl_id
        return product.moderation_updated_at or template.moderation_updated_at or None

    def _serialize(self, service):
        template = service.product_tmpl_id
        company = service.company_id or template.company_id
        moderation_updated_at = self._get_service_moderation_updated_at(service)
        image_urls = self._serialize_service_images(service)
        return {
            "id": service.id,
            "name": service.name,
            "description": service.description_sale or "",
            "details": template.billnova_details or "",
            "price": service.list_price or 0.0,
            "payment_frequency": template.billnova_payment_frequency or "unico",
            "active": bool(service.active),
            "image_url": image_urls[0] if image_urls else None,
            "image_urls": image_urls,
            "company_id": company.id if company else None,
            "company_name": company.name if company else None,
            "company_email": (
                company.admin_email
                or company.contact_email
                or company.email
                or None
            ) if company else None,
            "moderation_status": self._get_service_moderation_status(service),
            "moderation_reason": self._get_service_moderation_reason(service),
            "moderation_updated_at": moderation_updated_at.isoformat() if moderation_updated_at else None,
            "create_date": service.create_date.isoformat() if service.create_date else None,
            "write_date": service.write_date.isoformat() if service.write_date else None,
        }

    def _build_service_create_vals(self, payload, company_id_int, legacy_service_id=None):
        template_model = self._get_service_template_model()
        vals = {
            "name": payload.get("name"),
            "list_price": payload.get("price", 0.0),
            "standard_price": payload.get("standard_price", payload.get("cost_price", 0.0)),
            "description_sale": payload.get("description") or "",
            "billnova_details": payload.get("details") or "",
            "billnova_payment_frequency": payload.get("payment_frequency") or "unico",
            "active": payload.get("active", True),
            "company_id": company_id_int,
            "image_1920": self._decode_image_data_url(payload.get("image_data_url")),
            "moderation_status": self._normalize_moderation_status(payload.get("moderation_status")),
            "moderation_reason": payload.get("moderation_reason") or False,
            "moderation_updated_at": fields.Datetime.now(),
            "sale_ok": True,
            "purchase_ok": False,
        }
        if "invoice_policy" in template_model._fields:
            vals["invoice_policy"] = "order"
        if "detailed_type" in template_model._fields:
            vals["detailed_type"] = "service"
        elif "type" in template_model._fields:
            vals["type"] = "service"
        if legacy_service_id:
            vals["billnova_legacy_service_id"] = legacy_service_id
        return vals

    def _migrate_legacy_services(self, company_id=None):
        try:
            legacy_model = request.env["billnova.service"].sudo()
        except KeyError:
            return

        domain = []
        if company_id:
            domain.append(("company_id", "=", company_id))

        template_model = self._get_service_template_model()
        for legacy_service in legacy_model.search(domain):
            already_migrated = template_model.search(
                [("billnova_legacy_service_id", "=", legacy_service.id)],
                limit=1,
            )
            if already_migrated:
                continue

            vals = self._build_service_create_vals(
                {
                    "name": legacy_service.name,
                    "description": legacy_service.description,
                    "details": legacy_service.details,
                    "price": legacy_service.price,
                    "payment_frequency": legacy_service.payment_frequency,
                    "active": legacy_service.active,
                    "image_data_url": legacy_service.image_1920,
                    "moderation_status": legacy_service.moderation_status,
                    "moderation_reason": legacy_service.moderation_reason,
                },
                legacy_service.company_id.id if legacy_service.company_id else False,
                legacy_service_id=legacy_service.id,
            )
            try:
                template = template_model.create(vals)
                if template.product_variant_id and legacy_service.company_id:
                    template.product_variant_id.write({"company_id": legacy_service.company_id.id})
                _logger.info("[services] Legacy service %s migrated to product.template", legacy_service.id)
            except Exception:
                _logger.exception("[services] Could not migrate legacy service %s", legacy_service.id)

    def _get_service_product(self, service_id):
        product = request.env["product.product"].sudo().browse(service_id)
        if product.exists() and self._is_service_product(product):
            return product

        template = self._get_service_template_model().search(
            [("billnova_legacy_service_id", "=", service_id)],
            limit=1,
        )
        if template and template.product_variant_id and self._is_service_product(template.product_variant_id):
            return template.product_variant_id

        return request.env["product.product"]

    def _log_event(self, company_id, accion, descripcion, detalle="", entidad_id=None, entidad_nombre=""):
        try:
            user = request.env.user
            user_id = user.id if user and hasattr(user, "id") and user.id else False

            is_public = False
            try:
                is_public = user._is_public() if hasattr(user, "_is_public") else False
            except Exception:
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
                    "entidad_modelo": "product.product",
                    "entidad_id": entidad_id or 0,
                    "entidad_nombre": entidad_nombre or "",
                }
            )
        except Exception as e:
            _logger.warning("[services] Error al crear bitacora: %s", str(e))

    @http.route("/api/services", type="http", auth="none", methods=["GET", "POST", "OPTIONS"], csrf=False)
    def list_services(self, **kwargs):
        if request.httprequest.method == "OPTIONS":
            return self._options_response()
        if request.httprequest.method == "POST":
            return self.create_service()

        domain = []
        company_id = self._resolve_company_id_for_request(kwargs.get("company_id"))

        if isinstance(company_id, Response):
            return company_id
        if self._is_company_scoped_user() and not company_id:
            return self._json_response({"ok": True, "data": []})

        self._migrate_legacy_services(company_id=company_id)

        domain.extend(self._get_service_type_domain())
        if company_id:
            domain.append(("product_tmpl_id.company_id", "=", company_id))

        services = request.env["product.product"].sudo().search(domain)
        return self._json_response({"ok": True, "data": [self._serialize(service) for service in services]})

    @http.route("/api/services/<int:service_id>", type="http", auth="none", methods=["GET", "OPTIONS"], csrf=False)
    def get_service(self, service_id):
        if request.httprequest.method == "OPTIONS":
            return self._options_response()

        self._migrate_legacy_services()
        service = self._get_service_product(service_id)
        if not service or not service.exists():
            return self._json_response({"ok": False, "error": "Service not found"}, 404)

        return self._json_response({"ok": True, "data": self._serialize(service)})

    @http.route("/api/services/create", type="http", auth="public", methods=["POST", "OPTIONS"], csrf=False)
    def create_service(self):
        if request.httprequest.method == "OPTIONS":
            return self._options_response()

        payload = request.httprequest.get_json(silent=True) or {}
        name = payload.get("name")
        if not name:
            return self._json_response({"ok": False, "error": "name is required"}, 400)

        company_id_int = self._parse_company_id(payload)
        if isinstance(company_id_int, Response):
            return company_id_int
        if not company_id_int:
            return self._json_response({"ok": False, "error": "company_id is required"}, 400)

        decoded_images, image_error = self._extract_image_payload(payload, require_images=True)
        if image_error:
            return image_error

        vals = self._build_service_create_vals(payload, company_id_int)
        if decoded_images:
            vals["image_1920"] = decoded_images[0]

        try:
            template = self._get_service_template_model().create(vals)
            service = template.product_variant_id
            service.write({"company_id": company_id_int})
            self._apply_gallery_to_service(service, decoded_images)
        except Exception as e:
            _logger.error("[services] ERROR al crear servicio-producto: %s", str(e))
            return self._json_response({"ok": False, "error": f"Error al crear servicio: {str(e)}"}, 500)

        self._log_event(
            company_id_int,
            "crear",
            f"Servicio creado: {service.name}",
            f"Precio: {service.list_price} | Frecuencia: {service.product_tmpl_id.billnova_payment_frequency}",
            service.id,
            service.name,
        )
        return self._json_response({"ok": True, "id": service.id, "data": self._serialize(service)}, 201)

    @http.route("/api/services/<int:service_id>", type="http", auth="none", methods=["PUT", "DELETE", "OPTIONS"], csrf=False)
    def update_delete_service(self, service_id):
        if request.httprequest.method == "OPTIONS":
            return self._options_response()

        self._migrate_legacy_services()
        service = self._get_service_product(service_id)
        if not service or not service.exists():
            return self._json_response({"ok": False, "error": "Service not found"}, 404)

        if request.httprequest.method == "DELETE":
            company_id = service.company_id.id if service.company_id else (service.product_tmpl_id.company_id.id if service.product_tmpl_id.company_id else False)
            service_name = service.name
            service.product_tmpl_id.unlink()
            self._log_event(
                company_id,
                "eliminar",
                f"Servicio eliminado: {service_name}",
                "El servicio-producto fue eliminado desde la gestion de servicios",
                service_id,
                service_name,
            )
            return self._json_response({"ok": True})

        payload = request.httprequest.get_json(silent=True) or {}
        template_vals = {}
        decoded_images, image_error = self._extract_image_payload(payload, require_images=False)
        if image_error:
            return image_error

        if "name" in payload:
            template_vals["name"] = payload.get("name") or ""
        if "description" in payload:
            template_vals["description_sale"] = payload.get("description") or ""
        if "details" in payload:
            template_vals["billnova_details"] = payload.get("details") or ""
        if "price" in payload:
            template_vals["list_price"] = payload.get("price", 0.0)
        if "standard_price" in payload:
            template_vals["standard_price"] = payload.get("standard_price", 0.0)
        elif "cost_price" in payload:
            template_vals["standard_price"] = payload.get("cost_price", 0.0)
        if "payment_frequency" in payload:
            template_vals["billnova_payment_frequency"] = payload.get("payment_frequency") or "unico"
        if "active" in payload:
            template_vals["active"] = payload.get("active", True)
        company_id_int = self._parse_company_id(payload)
        if isinstance(company_id_int, Response):
            return company_id_int
        if "company_id" in payload:
            template_vals["company_id"] = company_id_int

        previous_moderation_status = self._get_service_moderation_status(service)
        previous_moderation_reason = self._get_service_moderation_reason(service)

        if "moderation_status" in payload:
            template_vals["moderation_status"] = self._normalize_moderation_status(payload.get("moderation_status"))
            template_vals["moderation_updated_at"] = fields.Datetime.now()
            if template_vals["moderation_status"] != "rejected" and "moderation_reason" not in payload:
                template_vals["moderation_reason"] = False
        if "moderation_reason" in payload:
            template_vals["moderation_reason"] = payload.get("moderation_reason") or False

        if not template_vals and decoded_images is None:
            return self._json_response({"ok": False, "error": "No fields to update"}, 400)

        if template_vals:
            service.product_tmpl_id.write(template_vals)
        if decoded_images is not None:
            self._apply_gallery_to_service(service, decoded_images)
        if "company_id" in template_vals and company_id_int:
            service.write({"company_id": company_id_int})
        if (
            "moderation_status" in template_vals
            and template_vals["moderation_status"] in ("approved", "rejected")
            and (
                template_vals["moderation_status"] != previous_moderation_status
                or template_vals.get("moderation_reason", previous_moderation_reason) != previous_moderation_reason
            )
        ):
            service.product_tmpl_id.action_send_moderation_status_email()

        self._log_event(
            service.company_id.id if service.company_id else (service.product_tmpl_id.company_id.id if service.product_tmpl_id.company_id else False),
            "actualizar",
            f"Servicio actualizado: {service.name}",
            ", ".join(sorted(template_vals.keys())),
            service.id,
            service.name,
        )
        return self._json_response({"ok": True, "data": self._serialize(service)})
