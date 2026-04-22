# controllers/product_api.py
from odoo import fields, http
from odoo.http import Response, request
import json as json_lib
import logging
from .auth_controller import AuthApiController

_logger = logging.getLogger(__name__)


class ProductApiController(http.Controller):
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

    # ──────────────────────────────────────────────
    # HELPERS
    # ──────────────────────────────────────────────

    def _get_current_billnova_user(self):
        user = self._get_current_res_user()
        if not user or not user.exists():
            return request.env["billnova.user"]

        return request.env["billnova.user"].sudo().search(
            [("res_user_id", "=", user.id)], limit=1
        )

    def _get_effective_company_id(self):
        billnova_user = self._get_current_billnova_user()
        if billnova_user and billnova_user.exists() and billnova_user.company_id:
            return billnova_user.company_id.id

        res_user = self._get_current_res_user()
        if res_user and res_user.exists() and res_user.company_id:
            return res_user.company_id.id

        return None

    def _log_scope_debug(self, label, requested_company_id=None, resolved_company_id=None):
        res_user = self._get_current_res_user()
        billnova_user = self._get_current_billnova_user()
        _logger.info("=== PRODUCT SCOPE DEBUG: %s ===", label)
        _logger.info("SESSION UID: %s", getattr(request.session, "uid", None))
        _logger.info("SESSION LOGIN: %s", getattr(request.session, "login", None))
        _logger.info("REQUESTED COMPANY ID: %s", requested_company_id)
        _logger.info(
            "RES USER -> id=%s login=%s active=%s company_id=%s",
            getattr(res_user, "id", None),
            getattr(res_user, "login", None),
            getattr(res_user, "active", None),
            getattr(getattr(res_user, "company_id", None), "id", None),
        )
        _logger.info(
            "BILLNOVA USER -> id=%s email=%s role=%s company_id=%s res_user_id=%s",
            getattr(billnova_user, "id", None),
            getattr(billnova_user, "email", None),
            getattr(billnova_user, "role", None),
            getattr(getattr(billnova_user, "company_id", None), "id", None),
            getattr(getattr(billnova_user, "res_user_id", None), "id", None),
        )
        _logger.info("RESOLVED COMPANY ID: %s", resolved_company_id)
        _logger.info("=== END PRODUCT SCOPE DEBUG ===")

    def _is_company_scoped_user(self):
        billnova_user = self._get_current_billnova_user()
        return bool(
            billnova_user
            and billnova_user.exists()
            and billnova_user.role in ("seller", "gerente", "worker")
        )

    def _get_current_billnova_company_id(self):
        return self._get_effective_company_id()

    def _resolve_company_id_for_request(self, raw_company_id=None):
        current_company_id = self._get_current_billnova_company_id()
        is_scoped_user = self._is_company_scoped_user()

        if is_scoped_user:
            if not current_company_id:
                return None
            if raw_company_id in (None, ""):
                return current_company_id
            try:
                requested_company_id = int(raw_company_id)
            except (TypeError, ValueError):
                return self._json_response(
                    {"ok": False, "error": "company_id must be an integer"}, 400
                )
            if requested_company_id != current_company_id:
                return self._json_response(
                    {"ok": False, "error": "company_id does not belong to the current user"},
                    403,
                )
            return current_company_id

        if raw_company_id in (None, ""):
            return None

        try:
            requested_company_id = int(raw_company_id)
        except (TypeError, ValueError):
            return self._json_response(
                {"ok": False, "error": "company_id must be an integer"}, 400
            )

        # 👉 protección multiempresa
        return requested_company_id

    def _can_access_product(self, product):
        if not self._is_company_scoped_user():
            return True
        current_company_id = self._get_current_billnova_company_id()
        if not current_company_id:
            return False
        return bool(product.company_id and product.company_id.id == current_company_id)

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
            "moderation_status": product.moderation_status or "pending",
            "moderation_reason": product.moderation_reason or None,
            "moderation_updated_at": product.moderation_updated_at.isoformat() if product.moderation_updated_at else None,

            "company_id": company.id if company else None,
            "company_name": company.name if company else None,
            "company_email": (
                company.admin_email
                or company.contact_email
                or company.email
                or None
            ) if company else None,

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

    @http.route("/api/products", type="http", auth="public",
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

        self._log_scope_debug(
            "list_products",
            requested_company_id=kwargs.get("company_id"),
            resolved_company_id=company_id,
        )

        domain = []

        if company_id:
            domain.append(("company_id", "=", company_id))

        if self._is_company_scoped_user() and not company_id:
            return self._json_response({
                "ok": True,
                "data": [],
            })

        products = request.env["product.product"].sudo().search(domain)

        return self._json_response({
            "ok": True,
            "data": [self._serialize(p) for p in products],
        })

    # ──────────────────────────────────────────────
    # GET ONE
    # ──────────────────────────────────────────────

    @http.route("/api/products/<int:product_id>", type="http",
                auth="public", methods=["GET", "OPTIONS"], csrf=False)
    def get_product(self, product_id):

        if request.httprequest.method == "OPTIONS":
            return self._options_response()

        product = request.env["product.product"].sudo().browse(product_id)
        self._log_scope_debug(
            "get_product",
            requested_company_id=getattr(getattr(product, "company_id", None), "id", None),
            resolved_company_id=self._get_current_billnova_company_id(),
        )

        if not product.exists():
            return self._json_response(
                {"ok": False, "error": "Product not found"}, 404
            )
        if not self._can_access_product(product):
            return self._json_response(
                {"ok": False, "error": "Product does not belong to the current user company"}, 403
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
                auth="public", methods=["PUT", "DELETE", "OPTIONS"], csrf=False)
    def update_delete_product(self, product_id):

        if request.httprequest.method == "OPTIONS":
            return self._options_response()

        product = request.env["product.product"].sudo().browse(product_id)

        if not product.exists():
            return self._json_response(
                {"ok": False, "error": "Product not found"}, 404
            )
        if not self._can_access_product(product):
            return self._json_response(
                {"ok": False, "error": "Product does not belong to the current user company"}, 403
            )

        # DELETE
        if request.httprequest.method == "DELETE":
            product.unlink()
            return self._json_response({"ok": True})

        payload = request.httprequest.get_json(silent=True) or {}
        previous_moderation_status = product.moderation_status
        previous_moderation_reason = product.moderation_reason

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

        if "moderation_status" in payload:
            vals["moderation_status"] = payload.get("moderation_status") or "pending"
            vals["moderation_updated_at"] = fields.Datetime.now()
            if vals["moderation_status"] != "rejected" and "moderation_reason" not in payload:
                vals["moderation_reason"] = False

        if "moderation_reason" in payload:
            vals["moderation_reason"] = payload.get("moderation_reason") or False

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
        if (
            "moderation_status" in vals
            and vals["moderation_status"] in ("approved", "rejected")
            and (
                vals["moderation_status"] != previous_moderation_status
                or vals.get("moderation_reason", product.moderation_reason) != previous_moderation_reason
            )
        ):
            product.action_send_moderation_status_email()

        return self._json_response({
            "ok": True,
            "data": self._serialize(product),
        })
