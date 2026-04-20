# controllers/product_api.py
from odoo import fields, http
from odoo.http import Response, request
import json as json_lib
import logging

_logger = logging.getLogger(__name__)


class ProductApiController(http.Controller):

    # ──────────────────────────────────────────────
    # HELPERS
    # ──────────────────────────────────────────────

    def _get_current_billnova_company_id(self):
        user = request.env.user

        if not user or not user.id:
            return None

        try:
            if user._is_public():
                return None
        except:
            return None

        billnova_user = request.env["billnova.user"].sudo().search(
            [("res_user_id", "=", user.id)], limit=1
        )

        if not billnova_user or not billnova_user.company_id:
            return None

        return billnova_user.company_id.id

    def _resolve_company_id_for_request(self, raw_company_id=None):
        current_company_id = self._get_current_billnova_company_id()

        # 👉 si no mandan company_id → usar el del usuario si existe
        if raw_company_id in (None, ""):
            return current_company_id

        try:
            requested_company_id = int(raw_company_id)
        except (TypeError, ValueError):
            return self._json_response(
                {"ok": False, "error": "company_id must be an integer"}, 400
            )

        # 👉 protección multiempresa
        if current_company_id and requested_company_id != current_company_id:
            return self._json_response(
                {"ok": False, "error": "company_id does not belong to the current user"},
                403,
            )

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

            "company_id": company.id if company else None,
            "company_name": company.name if company else None,

            "category_id": category.id if category else None,
            "category_name": category.name if category else None,

            "description_sale": product.description_sale or "",
            "create_date": product.create_date.isoformat() if product.create_date else None,
            "write_date": product.write_date.isoformat() if product.write_date else None,
        }

    def _parse_company_id(self, payload):
        company_id_int = self._resolve_company_id_for_request(
            payload.get("company_id")
        )

        if isinstance(company_id_int, Response):
            return company_id_int

        if not company_id_int:
            return None

        company = request.env["res.company"].sudo().browse(company_id_int)
        if not company.exists():
            return self._json_response(
                {"ok": False, "error": f"Company {company_id_int} not found"}, 404
            )

        return company_id_int

    # ──────────────────────────────────────────────
    # LIST PRODUCTS
    # ──────────────────────────────────────────────

    @http.route("/api/products", type="http", auth="none",
                methods=["GET", "POST", "OPTIONS"], csrf=False)
    def list_products(self, **kwargs):

        if request.httprequest.method == "OPTIONS":
            return self._options_response()

        if request.httprequest.method == "POST":
            return self.create_product()

        company_id = self._resolve_company_id_for_request(
            kwargs.get("company_id")
        )

        if isinstance(company_id, Response):
            return company_id

        domain = []

        # ✅ SI hay company_id → filtra
        if company_id:
            domain.append(("company_id", "=", company_id))

        # ✅ SI NO hay → trae todos (como antes)
        products = request.env["product.product"].sudo().search(domain)

        return self._json_response({
            "ok": True,
            "data": [self._serialize(p) for p in products],
        })

    # ──────────────────────────────────────────────
    # GET ONE
    # ──────────────────────────────────────────────

    @http.route("/api/products/<int:product_id>", type="http",
                auth="none", methods=["GET", "OPTIONS"], csrf=False)
    def get_product(self, product_id):

        if request.httprequest.method == "OPTIONS":
            return self._options_response()

        product = request.env["product.product"].sudo().browse(product_id)

        if not product.exists():
            return self._json_response(
                {"ok": False, "error": "Product not found"}, 404
            )

        return self._json_response({
            "ok": True,
            "data": self._serialize(product),
        })

    # ──────────────────────────────────────────────
    # CREATE
    # ──────────────────────────────────────────────

    @http.route("/api/products/create", type="http",
                auth="public", methods=["POST", "OPTIONS"], csrf=False)
    def create_product(self):

        if request.httprequest.method == "OPTIONS":
            return self._options_response()

        payload = request.httprequest.get_json(silent=True) or {}
        name = payload.get("name")

        if not name:
            return self._json_response(
                {"ok": False, "error": "name is required"}, 400
            )

        company_id = self._parse_company_id(payload)

        if isinstance(company_id, Response):
            return company_id

        if not company_id:
            return self._json_response(
                {"ok": False, "error": "company_id is required"}, 400
            )

        product = request.env["product.product"].sudo().create({
            "name": name,
            "default_code": payload.get("default_code"),
            "list_price": payload.get("list_price", 0.0),
            "standard_price": payload.get("standard_price", 0.0),
            "description_sale": payload.get("description_sale") or "",
            "company_id": company_id,
        })

        return self._json_response({
            "ok": True,
            "id": product.id,
            "data": self._serialize(product),
        }, 201)

    # ──────────────────────────────────────────────
    # UPDATE / DELETE
    # ──────────────────────────────────────────────

    @http.route("/api/products/<int:product_id>", type="http",
                auth="none", methods=["PUT", "DELETE", "OPTIONS"], csrf=False)
    def update_delete_product(self, product_id):

        if request.httprequest.method == "OPTIONS":
            return self._options_response()

        product = request.env["product.product"].sudo().browse(product_id)

        if not product.exists():
            return self._json_response(
                {"ok": False, "error": "Product not found"}, 404
            )

        # DELETE
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

        company_id = self._parse_company_id(payload)

        if isinstance(company_id, Response):
            return company_id

        if "company_id" in payload and company_id:
            vals["company_id"] = company_id

        if not vals:
            return self._json_response(
                {"ok": False, "error": "No fields to update"}, 400
            )

        product.write(vals)

        return self._json_response({
            "ok": True,
            "data": self._serialize(product),
        })