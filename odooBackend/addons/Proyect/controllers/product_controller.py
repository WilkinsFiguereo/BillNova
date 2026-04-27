# controllers/product_api.py
from odoo import fields, http
from odoo.http import Response, request
import json as json_lib
import logging
import base64
from .auth_controller import AuthApiController

_logger = logging.getLogger(__name__)


class ProductApiController(http.Controller):
    _GALLERY_FIELD_NAMES = (
        "billnova_image_2_1920",
        "billnova_image_3_1920",
        "billnova_image_4_1920",
        "billnova_image_5_1920",
    )

    def _is_mobile_request(self):
        user_agent = (request.httprequest.headers.get("User-Agent") or "").lower()
        return "expo" in user_agent or "okhttp" in user_agent or "reactnative" in user_agent

    def _get_product_moderation_status(self, product):
        template = getattr(product, "product_tmpl_id", None)
        template_status = getattr(template, "moderation_status", None) if template else None
        return product.moderation_status or template_status or "pending"

    def _get_product_moderation_reason(self, product):
        template = getattr(product, "product_tmpl_id", None)
        template_reason = getattr(template, "moderation_reason", None) if template else None
        return product.moderation_reason or template_reason or None

    def _get_product_moderation_updated_at(self, product):
        template = getattr(product, "product_tmpl_id", None)
        return (
            product.moderation_updated_at
            or (getattr(template, "moderation_updated_at", None) if template else None)
            or None
        )

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
        _logger.info("MOBILE REQUEST: %s", self._is_mobile_request())
        _logger.info("X-AUTH-SESSION PRESENT: %s", bool(request.httprequest.headers.get("X-Auth-Session")))
        _logger.info("USER AGENT: %s", request.httprequest.headers.get("User-Agent"))
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
        requested_company_id = raw_company_id
        _logger.info(
            "COMPANY CHECK -> requested=%s current=%s scoped_user=%s",
            requested_company_id,
            current_company_id,
            is_scoped_user,
        )
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
        template = product.product_tmpl_id
        moderation_status = self._get_product_moderation_status(product)
        moderation_reason = self._get_product_moderation_reason(product)
        moderation_updated_at = self._get_product_moderation_updated_at(product)
        image_urls = self._serialize_product_images(product)
        primary_image_url = image_urls[0] if image_urls else None

        return {
            "id": product.id,
            "name": product.name,
            "default_code": product.default_code,
            "list_price": product.list_price,
            "standard_price": product.standard_price,
            "qty_available": product.qty_available,
            "moderation_status": moderation_status,
            "moderation_reason": moderation_reason,
            "moderation_updated_at": moderation_updated_at.isoformat() if moderation_updated_at else None,

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
            "image_url": primary_image_url,
            "image_urls": image_urls,
            "create_date": product.create_date.isoformat() if product.create_date else None,
            "write_date": product.write_date.isoformat() if product.write_date else None,
        }

    def _to_image_url(self, value):
        if not value:
            return None
        encoded = value.decode() if isinstance(value, bytes) else value
        return f"data:image/png;base64,{encoded}" if encoded else None

    def _serialize_product_images(self, product):
        template = getattr(product, "product_tmpl_id", None)
        image_urls = []
        primary = self._to_image_url(product.image_1920)
        if primary:
            image_urls.append(primary)
        if template:
            for field_name in self._GALLERY_FIELD_NAMES:
                image_url = self._to_image_url(getattr(template, field_name, False))
                if image_url:
                    image_urls.append(image_url)
        return image_urls[:5]

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

    def _apply_gallery_to_product(self, product, decoded_images):
        if decoded_images is None:
            return

        template_vals = {}
        primary_image = decoded_images[0] if decoded_images else False
        product.write({"image_1920": primary_image})

        for index, field_name in enumerate(self._GALLERY_FIELD_NAMES, start=1):
            template_vals[field_name] = decoded_images[index] if index < len(decoded_images) else False

        if template_vals:
            product.product_tmpl_id.write(template_vals)

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

    def _serialize_category(self, category):
        return {
            "id": category.id,
            "name": category.name,
            "description": category.billnova_description or "",
            "color": category.billnova_color or "#1E3A8A",
            "icon": category.billnova_icon or "Package",
            "is_active": bool(category.active),
            "product_count": category.product_count or 0,
            "created_at": category.create_date.isoformat() if category.create_date else None,
            "updated_at": category.write_date.isoformat() if category.write_date else None,
        }

    def _get_mobile_catalog_products(self):
        products = request.env["product.product"].sudo().search([])
        approved_products = [
            product for product in products if self._get_product_moderation_status(product) == "approved"
        ]
        _logger.info(
            "[mobile][products] catalog total=%s approved=%s sample=%s",
            len(products),
            len(approved_products),
            [
                {
                    "id": product.id,
                    "name": product.name,
                    "company_id": product.company_id.id if product.company_id else None,
                    "status": self._get_product_moderation_status(product),
                }
                for product in approved_products[:10]
            ],
        )
        return approved_products

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

        _logger.info(
            "[products] list_products scope user=%s scoped_user=%s requested_company_id=%s resolved_company_id=%s domain=%s",
            getattr(self._get_current_res_user(), "login", None),
            self._is_company_scoped_user(),
            kwargs.get("company_id"),
            company_id,
            domain,
        )

        products = request.env["product.product"].sudo().search(domain)
        approved_count = 0
        status_counts = {}
        serialized_products = []

        for product in products:
            status = self._get_product_moderation_status(product)
            if status == "approved":
                approved_count += 1
            status_counts[status] = status_counts.get(status, 0) + 1
            serialized_products.append(self._serialize(product))

        _logger.info(
            "[products] list_products results total=%s approved=%s status_counts=%s sample=%s",
            len(products),
            approved_count,
            status_counts,
            [
                {
                    "id": product.id,
                    "name": product.name,
                    "status": self._get_product_moderation_status(product),
                    "template_status": getattr(getattr(product, "product_tmpl_id", None), "moderation_status", None),
                    "company_id": product.company_id.id if product.company_id else None,
                }
                for product in products[:10]
            ],
        )

        return self._json_response({
            "ok": True,
            "data": serialized_products,
        })

    @http.route("/api/mobile/products", type="http", auth="none", methods=["GET", "OPTIONS"], csrf=False)
    def list_mobile_products(self):
        if request.httprequest.method == "OPTIONS":
            return self._options_response()

        approved_products = self._get_mobile_catalog_products()
        return self._json_response({
            "ok": True,
            "data": [self._serialize(product) for product in approved_products],
        })

    @http.route("/api/mobile/products/<int:product_id>", type="http", auth="none", methods=["GET", "OPTIONS"], csrf=False)
    def get_mobile_product(self, product_id):
        if request.httprequest.method == "OPTIONS":
            return self._options_response()

        product = request.env["product.product"].sudo().browse(product_id)
        if not product.exists():
            return self._json_response({"ok": False, "error": "Product not found"}, 404)

        if self._get_product_moderation_status(product) != "approved":
            return self._json_response({"ok": False, "error": "Product not available in mobile catalog"}, 404)

        return self._json_response({
            "ok": True,
            "data": self._serialize(product),
        })

    @http.route("/api/categories", type="http", auth="public", methods=["GET", "POST", "OPTIONS"], csrf=False)
    def categories(self, **kwargs):
        if request.httprequest.method == "OPTIONS":
            return self._options_response()

        if request.httprequest.method == "POST":
            payload = request.httprequest.get_json(silent=True) or {}
            name = (payload.get("name") or "").strip()
            if not name:
                return self._json_response({"ok": False, "error": "name is required"}, 400)

            existing = request.env["product.category"].sudo().search([("name", "=", name)], limit=1)
            if existing:
                return self._json_response({"ok": False, "error": "Ya existe una categoria con ese nombre."}, 409)

            category = request.env["product.category"].sudo().create({
                "name": name,
                "active": payload.get("is_active", True),
                "billnova_description": payload.get("description") or "",
                "billnova_color": payload.get("color") or "#1E3A8A",
                "billnova_icon": payload.get("icon") or "Package",
            })
            return self._json_response({"ok": True, "data": self._serialize_category(category)}, 201)

        categories = request.env["product.category"].sudo().search([], order="name asc")
        return self._json_response({
            "ok": True,
            "data": [self._serialize_category(category) for category in categories],
        })

    @http.route("/api/categories/<int:category_id>", type="http", auth="public", methods=["PUT", "DELETE", "OPTIONS"], csrf=False)
    def update_delete_category(self, category_id):
        if request.httprequest.method == "OPTIONS":
            return self._options_response()

        category = request.env["product.category"].sudo().browse(category_id)
        if not category.exists():
            return self._json_response({"ok": False, "error": "Category not found"}, 404)

        if request.httprequest.method == "DELETE":
            if category.product_count:
                return self._json_response(
                    {"ok": False, "error": "No se puede eliminar una categoria con productos asociados."},
                    409,
                )
            category.unlink()
            return self._json_response({"ok": True})

        payload = request.httprequest.get_json(silent=True) or {}
        vals = {}

        if "name" in payload:
            name = (payload.get("name") or "").strip()
            if not name:
                return self._json_response({"ok": False, "error": "name is required"}, 400)
            vals["name"] = name
        if "description" in payload:
            vals["billnova_description"] = payload.get("description") or ""
        if "color" in payload:
            vals["billnova_color"] = payload.get("color") or "#1E3A8A"
        if "icon" in payload:
            vals["billnova_icon"] = payload.get("icon") or "Package"
        if "is_active" in payload:
            vals["active"] = bool(payload.get("is_active"))

        if not vals:
            return self._json_response({"ok": False, "error": "No fields to update"}, 400)

        category.write(vals)
        return self._json_response({"ok": True, "data": self._serialize_category(category)})

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

        decoded_images, image_error = self._extract_image_payload(payload, require_images=True)
        if image_error:
            return image_error

        product = request.env["product.product"].sudo().create({
            "name": name,
            "default_code": payload.get("default_code"),
            "list_price": payload.get("list_price", 0.0),
            "standard_price": payload.get("standard_price", payload.get("cost_price", 0.0)),
            "description_sale": payload.get("description_sale") or "",
            "company_id": company_id,
            "image_1920": decoded_images[0] if decoded_images else False,
        })
        self._apply_gallery_to_product(product, decoded_images)

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
        decoded_images, image_error = self._extract_image_payload(payload, require_images=False)
        if image_error:
            return image_error

        vals = {}

        if "name" in payload:
            vals["name"] = payload.get("name") or ""

        if "default_code" in payload:
            vals["default_code"] = payload.get("default_code")

        if "list_price" in payload:
            vals["list_price"] = payload.get("list_price", 0.0)

        if "standard_price" in payload:
            vals["standard_price"] = payload.get("standard_price", 0.0)
        elif "cost_price" in payload:
            vals["standard_price"] = payload.get("cost_price", 0.0)

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
            if decoded_images is None:
                return self._json_response(
                    {"ok": False, "error": "No fields to update"}, 400
                )

        if vals:
            product.write(vals)
        if decoded_images is not None:
            self._apply_gallery_to_product(product, decoded_images)
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
