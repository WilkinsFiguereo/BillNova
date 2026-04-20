from odoo import fields, http
from odoo.http import Response, request
import json
import secrets
import logging
from psycopg2 import IntegrityError

_logger = logging.getLogger(__name__)


class CompanyApiController(http.Controller):
    def _get_current_res_user(self):
        session_uid = getattr(request.session, "uid", None)
        if session_uid:
            user = request.env["res.users"].sudo().browse(session_uid)
            if user.exists():
                return user

        user = request.env.user
        if user and not user._is_public():
            return user.sudo()

        return request.env["res.users"]

    def _debug_session_context(self, label, requested_company_id=None, resolved_company=None):
        user = self._get_current_res_user()
        billnova_user = self._resolve_current_billnova_user()

        _logger.info("=== COMPANY DEBUG: %s ===", label)
        _logger.info("SESSION UID: %s", getattr(request.session, "uid", None))
        _logger.info("SESSION LOGIN: %s", getattr(request.session, "login", None))
        _logger.info("REQUESTED COMPANY ID: %s", requested_company_id)
        _logger.info(
            "RES USER -> id=%s name=%s login=%s public=%s company_id=%s company_ids=%s",
            getattr(user, "id", None),
            getattr(user, "name", None),
            getattr(user, "login", None),
            user._is_public() if user else None,
            getattr(getattr(user, "company_id", None), "id", None),
            getattr(getattr(user, "company_ids", None), "ids", []),
        )
        _logger.info(
            "BILLNOVA USER -> id=%s name=%s role=%s res_user_id=%s company_id=%s",
            getattr(billnova_user, "id", None),
            getattr(billnova_user, "name", None),
            getattr(billnova_user, "role", None),
            getattr(getattr(billnova_user, "res_user_id", None), "id", None),
            getattr(getattr(billnova_user, "company_id", None), "id", None),
        )
        _logger.info(
            "RESOLVED COMPANY -> id=%s name=%s",
            getattr(resolved_company, "id", None) if resolved_company else None,
            getattr(resolved_company, "name", None) if resolved_company else None,
        )
        _logger.info("=== END COMPANY DEBUG ===")

    def _log_event(self, company_id, accion, modulo, descripcion, detalle="", entidad_modelo="", entidad_id=None, entidad_nombre=""):
        user = request.env.user
        ua = request.httprequest.headers.get("User-Agent", "") or ""
        request.env["billnova.bitacora"].sudo().create_event(
            {
                "company_id": company_id or False,
                "user_id": user.id if user and not user._is_public() else False,
                "accion": accion,
                "modulo": modulo,
                "nivel": "info",
                "descripcion": descripcion,
                "detalle": detalle,
                "ip": request.httprequest.remote_addr or "",
                "dispositivo": ua.split("(")[0].strip() if ua else "Desconocido",
                "entidad_modelo": entidad_modelo or False,
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
            json.dumps(data),
            status=status,
            headers=self._cors_headers(),
            content_type="application/json",
        )

    def _options_response(self):
        return Response("", status=200, headers=self._cors_headers())

    def _parse_int(self, value):
        try:
            if value is None or value == "":
                return None
            return int(value)
        except (TypeError, ValueError):
            return None

    def _normalize_company_status(self, value):
        return value if value in ("approved", "disabled") else "disabled"

    def _normalize_moderation_status(self, value):
        return value if value in ("pending", "approved", "rejected") else "pending"

    def _serialize_company_row(self, company):
        return {
            "id": company.id,
            "name": company.name,
            "ruc": company.ruc or None,
            "sector": company.sector or None,
            "website": company.website or None,
            "contact_name": company.contact_name or None,
            "contact_email": company.contact_email or None,
            "contact_phone": company.contact_phone or None,
            "country_name": company.country_name or (company.country_id.name if company.country_id else None),
            "address_city": company.address_city or None,
            "address_state": company.address_state or None,
            "full_address": company.full_address or company.street or None,
            "city": company.address_city or None,
            "state": company.address_state or None,
            "address": company.full_address or company.street or None,
            "postal_code": company.postal_code or getattr(company, "zip", None) or None,
            "company_size": company.company_size or None,
            "admin_full_name": company.admin_full_name or company.contact_name or None,
            "admin_email": company.admin_email or company.contact_email or company.email or None,
            "admin_phone": company.admin_phone or company.contact_phone or company.phone or None,
            "create_date": company.create_date.isoformat() if company.create_date else None,
            "write_date": company.write_date.isoformat() if company.write_date else None,
            "moderation_status": company.moderation_status or "pending",
            "moderation_reason": company.moderation_reason or None,
            "moderation_updated_at": company.moderation_updated_at.isoformat() if company.moderation_updated_at else None,
            "status": company.status or ("approved" if company.moderation_status == "approved" else "disabled"),
            "business_type": company.business_type or None,
        }

    def _empty_sales_history(self):
        return [
            {"month": "Oct", "sales": 0, "orders": 0},
            {"month": "Nov", "sales": 0, "orders": 0},
            {"month": "Dic", "sales": 0, "orders": 0},
            {"month": "Ene", "sales": 0, "orders": 0},
            {"month": "Feb", "sales": 0, "orders": 0},
            {"month": "Mar", "sales": 0, "orders": 0},
        ]

    def _map_role_to_api(self, internal_role):
        if internal_role == "admin":
            return "Administrador"
        if internal_role == "seller":
            return "Vendedor"
        if internal_role == "moderation":
            return "Soporte"
        return "Almacen"

    def _map_role_to_internal(self, api_role):
        if api_role == "Administrador":
            return "admin"
        if api_role == "Vendedor":
            return "seller"
        if api_role in ("Soporte", "Contabilidad"):
            return "moderation"
        return "user"

    def _resolve_current_billnova_user(self):
        user = self._get_current_res_user()
        if not user or not user.exists():
            return request.env["billnova.user"]
        return request.env["billnova.user"].sudo().search([("res_user_id", "=", user.id)], limit=1)

    def _user_owns_company(self, company_id):
        if not company_id:
            return False

        billnova_user = self._resolve_current_billnova_user()
        return bool(billnova_user and billnova_user.company_id and billnova_user.company_id.id == company_id)

    def _resolve_current_company(self):
        billnova_user = self._resolve_current_billnova_user()
        if billnova_user and billnova_user.company_id:
            return billnova_user.company_id.sudo()

        return request.env["res.company"].browse()

    def _company_to_api(self, company):
        country_name = getattr(company, "country_name", None) or (company.country_id.name if getattr(company, "country_id", None) else "")
        address = getattr(company, "full_address", None) or getattr(company, "street", None) or ""
        tax_id = getattr(company, "ruc", None) or getattr(company, "vat", None) or ""
        founded_year = getattr(company, "founding_year", None) or 0

        return {
            "id": company.id,
            "name": company.name,
            "legal_name": getattr(company, "legal_name", None) or company.name,
            "tax_id": tax_id,
            "email": company.email or "",
            "phone": getattr(company, "phone", None) or getattr(company, "contact_phone", None) or "",
            "address": address,
            "city": getattr(company, "address_city", None) or getattr(company, "city", None) or "",
            "country": country_name,
            "founded_year": str(founded_year),
            "business_type": getattr(company, "business_type", None) or "",
            "sales_history": self._empty_sales_history(),
            "employees": [],
        }

    @http.route("/api/companies", type="http", auth="public", methods=["GET", "OPTIONS"], csrf=False)
    def list_companies(self):
        if request.httprequest.method == "OPTIONS":
            return self._options_response()

        try:
            companies = request.env["res.company"].sudo().search([])
            return self._json_response({"data": [self._serialize_company_row(company) for company in companies]})
        except Exception as error:
            return self._json_response({"error": str(error)}, 500)

    @http.route("/api/companies/<int:company_id>", type="http", auth="public", methods=["PUT", "OPTIONS"], csrf=False)
    def update_company(self, company_id, **kwargs):
        if request.httprequest.method == "OPTIONS":
            return self._options_response()

        payload = request.httprequest.get_json(silent=True) or {}
        company = request.env["res.company"].sudo().browse(company_id)
        if not company.exists():
            return self._json_response({"ok": False, "error": "Company not found"}, 404)

        vals = {}
        simple_fields = [
            "name",
            "ruc",
            "sector",
            "website",
            "contact_name",
            "contact_email",
            "contact_phone",
            "admin_full_name",
            "admin_email",
            "admin_phone",
            "country_name",
            "address_city",
            "address_state",
            "company_size",
        ]
        for field_name in simple_fields:
            if field_name in payload:
                vals[field_name] = payload.get(field_name) or False

        if "full_address" in payload:
            vals["full_address"] = payload.get("full_address") or False
            vals["street"] = payload.get("full_address") or False
        if "status" in payload:
            vals["status"] = self._normalize_company_status(payload.get("status"))
        if "moderation_status" in payload:
            vals["moderation_status"] = self._normalize_moderation_status(payload.get("moderation_status"))
            vals["moderation_updated_at"] = fields.Datetime.now()
            vals["status"] = "approved" if vals["moderation_status"] == "approved" else "disabled"
            if vals["moderation_status"] != "rejected" and "moderation_reason" not in payload:
                vals["moderation_reason"] = False
        if "moderation_reason" in payload:
            vals["moderation_reason"] = payload.get("moderation_reason") or False

        if vals:
            company.write(vals)
            self._log_event(
                company.id,
                "actualizar",
                "Empresa",
                f"Empresa actualizada: {company.name}",
                ", ".join(sorted(vals.keys())),
                "res.company",
                company.id,
                company.name,
            )

        return self._json_response({"ok": True, "data": self._serialize_company_row(company)})

    @http.route("/api/company/register", type="http", auth="public", methods=["POST", "OPTIONS"], csrf=False)
    def register_company(self):
        if request.httprequest.method == "OPTIONS":
            return self._options_response()

        payload = request.httprequest.get_json(silent=True) or {}
        name = payload.get("company_name") or payload.get("companyName") or payload.get("name")
        if not name:
            return self._json_response({"ok": False, "error": "company_name is required"}, 400)

        try:
            company = request.env["res.company"].sudo().create(
                {
                    "name": name,
                    "ruc": payload.get("ruc") or payload.get("taxId"),
                    "sector": payload.get("sector") or payload.get("industryType"),
                    "founding_year": payload.get("founding_year") or payload.get("foundedYear"),
                    "website": payload.get("website"),
                    "company_size": payload.get("company_size") or payload.get("companySize"),
                    "business_type": payload.get("business_type") or payload.get("businessType"),
                    "contact_name": payload.get("contact_name") or payload.get("adminFullName"),
                    "contact_email": payload.get("contact_email") or payload.get("adminEmail"),
                    "contact_phone": payload.get("contact_phone") or payload.get("adminPhone"),
                    "admin_full_name": payload.get("admin_full_name") or payload.get("adminFullName"),
                    "admin_email": payload.get("admin_email") or payload.get("adminEmail"),
                    "admin_phone": payload.get("admin_phone") or payload.get("adminPhone"),
                    "admin_position": payload.get("admin_position") or payload.get("adminPosition"),
                    "country_id": payload.get("country_id"),
                    "country_name": payload.get("country_name") or payload.get("country"),
                    "address_state": payload.get("state"),
                    "address_city": payload.get("city"),
                    "street": payload.get("address"),
                    "full_address": payload.get("address"),
                    "postal_code": payload.get("postal_code") or payload.get("postalCode"),
                    "zip": payload.get("postal_code") or payload.get("postalCode"),
                    "access_password": payload.get("password"),
                    "confirm_password": payload.get("confirm_password") or payload.get("confirmPassword"),
                    "accept_terms": payload.get("accept_terms") if payload.get("accept_terms") is not None else payload.get("acceptTerms"),
                    "accept_marketing": payload.get("accept_marketing") if payload.get("accept_marketing") is not None else payload.get("acceptMarketing"),
                    "moderation_status": "pending",
                    "status": "disabled",
                    "moderation_reason": False,
                }
            )

            current_user = self._get_current_res_user()
            if current_user and current_user.exists():
                billnova_user = request.env["billnova.user"].sudo().search([("res_user_id", "=", current_user.id)], limit=1)

                current_user.sudo().write({
                    "company_id": company.id,
                    "company_ids": [(4, company.id)],
                })

                if billnova_user:
                    billnova_user.sudo().write({"company_id": company.id})
                else:
                    request.env["billnova.user"].sudo().create({
                        "name": current_user.name,
                        "email": current_user.email,
                        "role": "seller",
                        "res_user_id": current_user.id,
                        "company_id": company.id,
                    })

            self._log_event(
                company.id,
                "crear",
                "Empresa",
                f"Empresa registrada: {company.name}",
                f"Sector: {company.sector or 'Sin sector'}",
                "res.company",
                company.id,
                company.name,
            )
            return self._json_response({"ok": True, "company_id": company.id, "data": self._serialize_company_row(company)}, 201)
        except IntegrityError:
            request.env.cr.rollback()
            return self._json_response(
                {"ok": False, "error": "Ya existe una empresa registrada con ese nombre."},
                409,
            )
        except Exception as error:
            return self._json_response({"ok": False, "error": str(error)}, 500)

    @http.route("/api/company/config", type="http", auth="public", methods=["GET", "OPTIONS"], csrf=False)
    def get_company_config(self, **kwargs):
        if request.httprequest.method == "OPTIONS":
            return self._options_response()

        company_id = self._parse_int(request.httprequest.args.get("company_id"))
        if company_id and not self._user_owns_company(company_id):
            self._debug_session_context("company_config_forbidden_company", requested_company_id=company_id, resolved_company=None)
            return self._json_response({"ok": True, "company": None})

        company = self._resolve_current_company() if not company_id else request.env["res.company"].sudo().browse(company_id)
        self._debug_session_context("company_config", requested_company_id=company_id, resolved_company=company if company and company.exists() else None)
        if company_id and not company.exists():
            return self._json_response({"ok": False, "error": "Company not found"}, 404)

        if not company or not company.exists():
            return self._json_response({"ok": True, "company": None})

        return self._json_response({"ok": True, "company": self._company_to_api(company.sudo())})

    @http.route("/api/company/config", type="http", auth="public", methods=["PUT", "OPTIONS"], csrf=False)
    def update_company_config(self, **kwargs):
        if request.httprequest.method == "OPTIONS":
            return self._options_response()

        payload = request.httprequest.get_json(silent=True) or {}
        company_id = self._parse_int(payload.get("companyId"))
        if not company_id:
            return self._json_response({"ok": False, "error": "companyId is required"}, 400)

        company = request.env["res.company"].sudo().browse(company_id)
        if not company.exists():
            return self._json_response({"ok": False, "error": "Company not found"}, 404)

        vals = {}
        if "name" in payload and payload.get("name") is not None:
            vals["name"] = payload.get("name")
        if "rnc" in payload and payload.get("rnc") is not None:
            vals["ruc"] = payload.get("rnc")
        if "email" in payload and payload.get("email") is not None:
            vals["email"] = payload.get("email")
        if "phone" in payload and payload.get("phone") is not None:
            vals["phone"] = payload.get("phone")
            if "contact_phone" in request.env["res.company"]._fields:
                vals["contact_phone"] = payload.get("phone")
        if "address" in payload and payload.get("address") is not None:
            vals["full_address"] = payload.get("address") or ""
            vals["street"] = payload.get("address") or ""
        if "city" in payload and payload.get("city") is not None:
            vals["address_city"] = payload.get("city") or ""
        if "country" in payload and payload.get("country") is not None:
            vals["country_name"] = payload.get("country") or ""
        if "legalName" in payload and payload.get("legalName") is not None and "legal_name" in request.env["res.company"]._fields:
            vals["legal_name"] = payload.get("legalName")

        if vals:
            company.write(vals)

        return self._json_response({"ok": True})

    @http.route("/api/company/employees", type="http", auth="public", methods=["GET", "OPTIONS"], csrf=False)
    def list_employees(self, **kwargs):
        if request.httprequest.method == "OPTIONS":
            return self._options_response()

        company_id = self._parse_int(request.httprequest.args.get("company_id"))
        if not company_id:
            return self._json_response({"ok": False, "error": "company_id is required"}, 400)

        employees = request.env["billnova.user"].sudo().search([]).filtered(
            lambda employee: company_id in (employee.res_user_id.company_ids.ids or [])
        )
        return self._json_response(
            {
                "ok": True,
                "employees": [
                    {
                        "id": employee.id,
                        "name": employee.name or "",
                        "email": employee.email or "",
                        "role": self._map_role_to_api(employee.role or ""),
                        "phone": employee.phone or "",
                        "status": "active" if getattr(employee.res_user_id, "active", True) else "disabled",
                    }
                    for employee in employees
                ],
            }
        )

    @http.route("/api/company/employees", type="http", auth="public", methods=["POST", "OPTIONS"], csrf=False)
    def create_employee(self, **kwargs):
        if request.httprequest.method == "OPTIONS":
            return self._options_response()

        payload = request.httprequest.get_json(silent=True) or {}
        company_id = self._parse_int(payload.get("companyId"))
        if not company_id:
            return self._json_response({"ok": False, "error": "companyId is required"}, 400)

        name = payload.get("name") or ""
        email = payload.get("email") or ""
        role_api = payload.get("role") or "Vendedor"
        phone = payload.get("phone") or ""
        status_api = payload.get("status") or "active"
        if not name or not email:
            return self._json_response({"ok": False, "error": "name and email are required"}, 400)

        users = request.env["res.users"].sudo()
        res_user = users.search([("login", "=", email)], limit=1)
        if not res_user:
            res_user = users.create(
                {
                    "name": name,
                    "login": email,
                    "email": email,
                    "phone": phone,
                    "company_ids": [(6, 0, [company_id])],
                    "password": secrets.token_urlsafe(16),
                }
            )
        else:
            res_user.write({"name": name, "email": email, "login": email, "phone": phone or ""})
            res_user.write({"company_ids": [(6, 0, [company_id])]})

        billnova_user = request.env["billnova.user"].sudo().search([("res_user_id", "=", res_user.id)], limit=1)
        if not billnova_user:
            billnova_user = request.env["billnova.user"].sudo().create(
                {
                    "name": name,
                    "email": email,
                    "phone": phone,
                    "address": "",
                    "role": self._map_role_to_internal(role_api),
                    "is_mobile_user": True,
                    "company_id": company_id,
                    "res_user_id": res_user.id,
                }
            )
        else:
            billnova_user.write(
                {
                    "name": name,
                    "email": email,
                    "phone": phone,
                    "role": self._map_role_to_internal(role_api),
                    "company_id": company_id,
                }
            )

        res_user.write({"active": status_api == "active"})
        self._log_event(
            company_id,
            "crear",
            "Trabajadores",
            f"Trabajador agregado: {name}",
            f"Rol: {role_api} · Email: {email}",
            "billnova.user",
            billnova_user.id,
            name,
        )
        return self._json_response({"ok": True, "id": billnova_user.id}, status=201)

    @http.route("/api/company/employees/<int:employee_id>", type="http", auth="public", methods=["PUT", "OPTIONS"], csrf=False)
    def update_employee(self, employee_id, **kwargs):
        if request.httprequest.method == "OPTIONS":
            return self._options_response()

        payload = request.httprequest.get_json(silent=True) or {}
        billnova_user = request.env["billnova.user"].sudo().browse(employee_id)
        if not billnova_user.exists():
            return self._json_response({"ok": False, "error": "Employee not found"}, 404)

        res_user = billnova_user.res_user_id.sudo()
        vals_billnova = {}
        if "name" in payload and payload.get("name") is not None:
            vals_billnova["name"] = payload.get("name")
        if "email" in payload and payload.get("email") is not None:
            vals_billnova["email"] = payload.get("email")
        if "phone" in payload and payload.get("phone") is not None:
            vals_billnova["phone"] = payload.get("phone")
        if "role" in payload and payload.get("role") is not None:
            vals_billnova["role"] = self._map_role_to_internal(payload.get("role"))
        if vals_billnova:
            billnova_user.write(vals_billnova)

        vals_res = {}
        if "name" in payload and payload.get("name") is not None:
            vals_res["name"] = payload.get("name")
        if "email" in payload and payload.get("email") is not None:
            vals_res["email"] = payload.get("email")
            vals_res["login"] = payload.get("email")
        if "phone" in payload and payload.get("phone") is not None:
            vals_res["phone"] = payload.get("phone")
        if "status" in payload and payload.get("status") is not None:
            vals_res["active"] = payload.get("status") == "active"
        if vals_res:
            res_user.write(vals_res)

        employee_company_id = billnova_user.company_id.id if billnova_user.company_id else (res_user.company_id.id if getattr(res_user, "company_id", None) else False)
        self._log_event(
            employee_company_id,
            "actualizar",
            "Trabajadores",
            f"Trabajador actualizado: {billnova_user.name or res_user.name}",
            ", ".join(sorted(set(list(vals_billnova.keys()) + list(vals_res.keys())))),
            "billnova.user",
            billnova_user.id,
            billnova_user.name or res_user.name,
        )

        return self._json_response({"ok": True})

    @http.route("/api/company/employees/<int:employee_id>/toggle", type="http", auth="public", methods=["POST", "OPTIONS"], csrf=False)
    def toggle_employee(self, employee_id, **kwargs):
        if request.httprequest.method == "OPTIONS":
            return self._options_response()

        billnova_user = request.env["billnova.user"].sudo().browse(employee_id)
        if not billnova_user.exists():
            return self._json_response({"ok": False, "error": "Employee not found"}, 404)

        res_user = billnova_user.res_user_id.sudo()
        new_active = not getattr(res_user, "active", True)
        res_user.write({"active": new_active})
        employee_company_id = billnova_user.company_id.id if billnova_user.company_id else (res_user.company_id.id if getattr(res_user, "company_id", None) else False)
        self._log_event(
            employee_company_id,
            "actualizar",
            "Trabajadores",
            f"Estado de trabajador cambiado: {billnova_user.name or res_user.name}",
            f"Nuevo estado: {'active' if new_active else 'disabled'}",
            "billnova.user",
            billnova_user.id,
            billnova_user.name or res_user.name,
        )
        return self._json_response({"ok": True, "status": "active" if new_active else "disabled"})

    @http.route("/api/company/access-verify", type="http", auth="public", methods=["POST", "OPTIONS"], csrf=False)
    def verify_access(self, **kwargs):
        if request.httprequest.method == "OPTIONS":
            return self._options_response()

        payload = request.httprequest.get_json(silent=True) or {}
        company_id = self._parse_int(payload.get("companyId"))
        if not company_id:
            return self._json_response({"ok": False, "error": "companyId is required"}, 400)

        password = payload.get("password") or ""
        company = request.env["res.company"].sudo().browse(company_id)
        if not company.exists():
            return self._json_response({"ok": False, "error": "Company not found"}, 404)

        expected = getattr(company, "access_password", None) or ""
        if expected and password == expected:
            return self._json_response({"ok": True, "company_id": company.id})
        return self._json_response({"ok": False, "error": "Acceso denegado"}, 401)

    @http.route("/api/company/<int:company_id>/stats", type="http", auth="user", methods=["GET", "OPTIONS"], csrf=False)
    def company_stats(self, company_id):
        if request.httprequest.method == "OPTIONS":
            return self._options_response()

        try:
            company = request.env["res.company"].sudo().browse(company_id)
            if not company.exists():
                return self._json_response({"ok": False, "error": "Company not found"}, 404)

            from datetime import date, timedelta

            today = date.today()
            first_day_month = today.replace(day=1)
            last_day_month = (first_day_month + timedelta(days=31)).replace(day=1) - timedelta(days=1)
            invoices = request.env["account.move"].sudo().search([("company_id", "=", company_id), ("state", "=", "posted")])

            total_ganado = 0.0
            total_perdido = 0.0
            por_mes = 0.0

            for invoice in invoices:
                amount = invoice.amount_total or 0.0
                total_ganado += amount
                if invoice.invoice_date_due and invoice.invoice_date_due < today and invoice.payment_state != "paid":
                    total_perdido += amount
                if invoice.invoice_date and first_day_month <= invoice.invoice_date <= last_day_month:
                    por_mes += amount

            return self._json_response(
                {
                    "ok": True,
                    "total_ganado": round(total_ganado, 2),
                    "total_perdido": round(total_perdido, 2),
                    "por_mes": round(por_mes, 2),
                    "stock_critico": 0,
                }
            )
        except Exception as error:
            import logging

            logging.getLogger(__name__).exception("Error getting company stats")
            return self._json_response({"ok": False, "error": str(error)}, 500)
