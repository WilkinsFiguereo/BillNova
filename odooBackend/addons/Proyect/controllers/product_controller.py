from odoo import fields, http
from odoo.http import Response, request
import json as json_lib
import logging

_logger = logging.getLogger(__name__)


class ProductApiController(http.Controller):
    def _get_current_billnova_company_id(self):
        user = request.env.user
        if not user or user._is_public():
            return None

        billnova_user = request.env["billnova.user"].sudo().search([("res_user_id", "=", user.id)], limit=1)
        return billnova_user.company_id.id if billnova_user and billnova_user.company_id else None

    def _resolve_company_id_for_request(self, raw_company_id=None):
        current_company_id = self._get_current_billnova_company_id()
        if not current_company_id:
            return None

        if raw_company_id in (None, ""):
            return current_company_id

        try:
            requested_company_id = int(raw_company_id)
        except (TypeError, ValueError):
            return self._json_response({"ok": False, "error": "company_id must be an integer"}, 400)

        if requested_company_id != current_company_id:
            _logger.warning(
                "[products] blocked company access user=%s requested_company_id=%s current_company_id=%s",
                getattr(request.env.user, "login", None),
                requested_company_id,
                current_company_id,
            )
            return self._json_response({"ok": False, "error": "company_id does not belong to the current user"}, 403)

        return current_company_id

    def _log_event(self, company_id, accion, descripcion, detalle="", entidad_id=None, entidad_nombre=""):
        user = request.env.user
        ua = request.httprequest.headers.get("User-Agent", "") or ""
        request.env["billnova.bitacora"].sudo().create_event(
            {
                "company_id": company_id or False,
                "user_id": user.id if user and not user._is_public() else False,
                "accion": accion,
                "modulo": "Productos",
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

    def _serialize(self, product):
        company = product.company_id
        category = product.categ_id
        return {
            "id": product.id,
            "name": product.name,
            "default_code": product.default_code,
            "list_price": product.list_price,
            "standard_price": product.standard_price,
            "qty_available": product.qty_available,
            "company_id": company.id or None,
            "company_name": company.name or None,
            "company_email": (
                getattr(company, "admin_email", None)
                or getattr(company, "contact_email", None)
                or company.email
                or None
            ),
            "category_id": category.id or None,
            "category_name": category.name or None,
            "description_sale": product.description_sale or "",
            "moderation_status": product.moderation_status or "pending",
            "moderation_reason": product.moderation_reason or None,
            "moderation_updated_at": product.moderation_updated_at.isoformat() if product.moderation_updated_at else None,
            "create_date": product.create_date.isoformat() if product.create_date else None,
            "write_date": product.write_date.isoformat() if product.write_date else None,
        }

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

    @http.route("/api/products", type="http", auth="none", methods=["GET", "POST", "OPTIONS"], csrf=False)
    def list_products(self, **kwargs):
        if request.httprequest.method == "OPTIONS":
            return self._options_response()
        if request.httprequest.method == "POST":
            return self.create_product()

        domain = []
        company_id = self._resolve_company_id_for_request(kwargs.get("company_id"))
        if isinstance(company_id, Response):
            return company_id
        if not company_id:
            return self._json_response({"ok": True, "data": []})
        domain.append(("company_id", "=", company_id))

        products = request.env["product.product"].sudo().search(domain)
        return self._json_response({"ok": True, "data": [self._serialize(product) for product in products]})

    @http.route("/api/products/<int:product_id>", type="http", auth="none", methods=["GET", "OPTIONS"], csrf=False)
    def get_product(self, product_id):
        if request.httprequest.method == "OPTIONS":
            return self._options_response()

        product = request.env["product.product"].sudo().browse(product_id)
        if not product.exists():
            return self._json_response({"ok": False, "error": "Product not found"}, 404)

        return self._json_response({"ok": True, "data": self._serialize(product)})

    @http.route("/api/products/create", type="http", auth="public", methods=["POST", "OPTIONS"], csrf=False)
    def create_product(self):
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

        vals = {
            "name": name,
            "default_code": payload.get("default_code"),
            "list_price": payload.get("list_price", 0.0),
            "standard_price": payload.get("standard_price", 0.0),
            "description_sale": payload.get("description_sale") or "",
            "company_id": company_id_int,
            "moderation_status": self._normalize_moderation_status(payload.get("moderation_status")),
            "moderation_reason": payload.get("moderation_reason") or False,
            "moderation_updated_at": fields.Datetime.now(),
        }

        product = request.env["product.product"].sudo().create(vals)
        self._log_event(
            company_id_int,
            "crear",
            f"Producto creado: {product.name}",
            f"Codigo: {product.default_code or 'Sin codigo'} · Precio: {product.list_price}",
            product.id,
            product.name,
        )
        return self._json_response({"ok": True, "id": product.id, "data": self._serialize(product)}, 201)

    @http.route("/api/products/<int:product_id>", type="http", auth="none", methods=["PUT", "DELETE", "OPTIONS"], csrf=False)
    def update_delete_product(self, product_id):
        if request.httprequest.method == "OPTIONS":
            return self._options_response()

        product = request.env["product.product"].sudo().browse(product_id)
        if not product.exists():
            return self._json_response({"ok": False, "error": "Product not found"}, 404)

        if request.httprequest.method == "DELETE":
            company_id = product.company_id.id if product.company_id else False
            product_name = product.name
            product.unlink()
            self._log_event(
                company_id,
                "eliminar",
                f"Producto eliminado: {product_name}",
                "El producto fue eliminado desde la gestion de productos",
                product_id,
                product_name,
            )
            return self._json_response({"ok": True})

        payload = request.httprequest.get_json(silent=True) or {}
        vals = {}

        if "name" in payload:
            vals["name"] = payload.get("name") or ""
        if "default_code" in payload:
            vals["default_code"] = payload.get("default_code")
        if "list_price" in payload:
            vals["list_price"] = payload.get("list_price", 0.0)
        if "standard_price" in payload:
            vals["standard_price"] = payload.get("standard_price", 0.0)
        if "description_sale" in payload:
            vals["description_sale"] = payload.get("description_sale") or ""

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

        product.write(vals)
        self._log_event(
            product.company_id.id if product.company_id else False,
            "actualizar",
            f"Producto actualizado: {product.name}",
            ", ".join(sorted(vals.keys())),
            product.id,
            product.name,
        )
        return self._json_response({"ok": True, "data": self._serialize(product)})

    @http.route("/api/categories", type="http", auth="none", methods=["GET", "OPTIONS"], csrf=False)
    def list_categories(self, **kwargs):
        if request.httprequest.method == "OPTIONS":
            return self._options_response()

        domain = []
        company_id = self._resolve_company_id_for_request(kwargs.get("company_id"))
        if isinstance(company_id, Response):
            return company_id
        if not company_id:
            return self._json_response({"ok": True, "data": []})
        domain.append(("company_id", "=", company_id))

        categories = request.env["product.category"].sudo().search(domain, order="name asc")
        data = [{"id": c.id, "name": c.complete_name or c.name} for c in categories]
        return self._json_response({"ok": True, "data": data})
