from odoo import fields, http
from odoo.http import Response, request
import json as json_lib


class ProductApiController(http.Controller):
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

    def _current_billnova_role(self):
        session_uid = getattr(request.session, "uid", None)
        if not session_uid:
            return None
        user = request.env["res.users"].sudo().browse(session_uid)
        if not user.exists():
            return None
        mobile_user = request.env["billnova.user"].sudo().search(
            [("res_user_id", "=", user.id)],
            limit=1,
        )
        if mobile_user:
            return mobile_user.role
        if user.id == 1:
            return "admin"
        return None

    def _can_view_unapproved_products(self):
        return self._current_billnova_role() in ("admin", "moderation", "moderator")

    def _company_is_approved(self, company):
        return bool(
            company
            and company.exists()
            and company.moderation_status == "approved"
            and company.status == "approved"
        )

    def _visibility_domain(self):
        if self._can_view_unapproved_products():
            return []
        return [
            ("moderation_status", "=", "approved"),
            ("company_id.moderation_status", "=", "approved"),
            ("company_id.status", "=", "approved"),
        ]

    def _resolve_company(self, payload=None, product=None):
        if payload and "company_id" in payload:
            company_id_int = self._parse_company_id(payload)
            if isinstance(company_id_int, Response):
                return company_id_int
            if company_id_int:
                return request.env["res.company"].sudo().browse(company_id_int)
        if product and product.company_id:
            return product.company_id.sudo()
        return None

    def _is_only_moderation_update(self, payload):
        allowed = {"moderation_status", "moderation_reason"}
        keys = {key for key in payload.keys() if payload.get(key) is not None}
        return bool(keys) and keys.issubset(allowed)

    def _parse_company_id(self, payload):
        company_id = payload.get("company_id")
        if company_id is None or company_id == "":
            return None

        try:
            company_id_int = int(company_id)
        except (TypeError, ValueError):
            return self._json_response({"ok": False, "error": "company_id must be an integer"}, 400)

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

        domain = self._visibility_domain()
        company_id = kwargs.get("company_id")
        if company_id:
            try:
                domain.append(("company_id", "=", int(company_id)))
            except ValueError:
                return self._json_response({"ok": False, "error": "company_id must be an integer"}, 400)

        products = request.env["product.product"].sudo().search(domain)
        return self._json_response({"ok": True, "data": [self._serialize(product) for product in products]})

    @http.route("/api/products/<int:product_id>", type="http", auth="none", methods=["GET", "OPTIONS"], csrf=False)
    def get_product(self, product_id):
        if request.httprequest.method == "OPTIONS":
            return self._options_response()

        product = request.env["product.product"].sudo().browse(product_id)
        if not product.exists():
            return self._json_response({"ok": False, "error": "Product not found"}, 404)
        if not self._can_view_unapproved_products():
            company = product.company_id.sudo()
            if product.moderation_status != "approved" or not self._company_is_approved(company):
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
        company = request.env["res.company"].sudo().browse(company_id_int)
        if not self._company_is_approved(company):
            return self._json_response(
                {"ok": False, "error": "La empresa no esta aprobada y no puede subir productos"},
                403,
            )

        moderation_status = self._normalize_moderation_status(payload.get("moderation_status"))
        if not self._can_view_unapproved_products():
            moderation_status = "pending"

        vals = {
            "name": name,
            "default_code": payload.get("default_code"),
            "list_price": payload.get("list_price", 0.0),
            "standard_price": payload.get("standard_price", 0.0),
            "description_sale": payload.get("description_sale") or "",
            "company_id": company_id_int,
            "moderation_status": moderation_status,
            "moderation_reason": payload.get("moderation_reason") or False,
            "moderation_updated_at": fields.Datetime.now(),
        }

        product = request.env["product.product"].sudo().create(vals)
        return self._json_response({"ok": True, "id": product.id, "data": self._serialize(product)}, 201)

    @http.route("/api/products/<int:product_id>", type="http", auth="none", methods=["PUT", "DELETE", "OPTIONS"], csrf=False)
    def update_delete_product(self, product_id):
        if request.httprequest.method == "OPTIONS":
            return self._options_response()

        product = request.env["product.product"].sudo().browse(product_id)
        if not product.exists():
            return self._json_response({"ok": False, "error": "Product not found"}, 404)

        if request.httprequest.method == "DELETE":
            product.unlink()
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

        if not self._is_only_moderation_update(payload):
            company = self._resolve_company(payload=payload, product=product)
            if isinstance(company, Response):
                return company
            if not self._company_is_approved(company):
                return self._json_response(
                    {"ok": False, "error": "La empresa no esta aprobada y no puede modificar o subir productos"},
                    403,
                )
            if "moderation_status" in vals and not self._can_view_unapproved_products():
                vals["moderation_status"] = "pending"
                vals["moderation_reason"] = False

        product.write(vals)
        return self._json_response({"ok": True, "data": self._serialize(product)})
