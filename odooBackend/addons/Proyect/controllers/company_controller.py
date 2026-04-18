from odoo import http
from odoo.http import request, Response
import json
import secrets

class CompanyApiController(http.Controller):

    def _cors_headers(self):
        origin = request.httprequest.headers.get('Origin')
        return {
            "Access-Control-Allow-Origin": origin or "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
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

    # =========================
    # LIST COMPANIES
    # =========================
    @http.route(
        "/api/companies",
        type="http",
        auth="public",
        methods=["GET", "OPTIONS"],
        csrf=False,
    )
    def list_companies(self):
        if request.httprequest.method == "OPTIONS":
            return self._options_response()

        try:
            companies = request.env["res.company"].sudo().search([])
            data = []
            for company in companies:
                data.append({
                    "id": company.id,
                    "name": company.name,
                    "ruc": company.ruc or None,
                    "sector": company.sector or None,
                    "website": company.website or None,
                    "contact_name": company.contact_name or None,
                    "contact_email": company.contact_email or None,
                    "contact_phone": company.contact_phone or None,
                    "city": company.address_city or None,
                    "state": company.address_state or None,
                    "address": company.street or None,
                })
            return self._json_response({"data": data})
        except Exception as e:
            return self._json_response({"error": str(e)}, 500)

    # =========================
    # REGISTER COMPANY
    # =========================
    @http.route(
        "/api/company/register",
        type="http",
        auth="public",
        methods=["POST", "OPTIONS"],
        csrf=False,
    )
    def register_company(self):

        if request.httprequest.method == "OPTIONS":
            return self._options_response()

        payload = request.httprequest.get_json(silent=True) or {}

        # ✅ VALIDACIÓN OBLIGATORIA
        name = (
            payload.get("company_name") or
            payload.get("companyName") or
            payload.get("name")
        )
        
        if not name:
            return self._json_response({
                "ok": False,
                "error": "company_name is required"
            }, 400)

        try:
            company = request.env["res.company"].sudo().create({
                "name": name,  # 👈 YA NUNCA SERÁ NULL

                "ruc": payload.get("ruc"),
                "sector": payload.get("sector"),
                "founding_year": payload.get("founding_year"),
                "website": payload.get("website"),
                "company_size": payload.get("company_size"),

                # contacto
                "contact_name": payload.get("contact_name"),
                "contact_email": payload.get("contact_email"),
                "contact_phone": payload.get("contact_phone"),

                # dirección
                "country_id": payload.get("country_id"),
                "address_state": payload.get("state"),
                "address_city": payload.get("city"),
                "street": payload.get("address"),
                "zip": payload.get("postal_code"),

                # acceso
                "access_password": payload.get("password"),
            })

            return self._json_response({
                "ok": True,
                "company_id": company.id
            }, 201)

        except Exception as e:
            return self._json_response({
                "ok": False,
                "error": str(e)
            }, 500)

    # =============================================================
    # CONFIG (empresa)
    # =============================================================

    def _parse_int(self, value):
        try:
            if value is None or value == "":
                return None
            return int(value)
        except (TypeError, ValueError):
            return None

    def _empty_sales_history(self):
        # Debe traer datos para que el frontend no falle con Math.max([]).
        return [
            {"month": "Oct", "sales": 0, "orders": 0},
            {"month": "Nov", "sales": 0, "orders": 0},
            {"month": "Dic", "sales": 0, "orders": 0},
            {"month": "Ene", "sales": 0, "orders": 0},
            {"month": "Feb", "sales": 0, "orders": 0},
            {"month": "Mar", "sales": 0, "orders": 0},
        ]

    def _map_role_to_api(self, internal_role):
        # billnova.user.role: admin|moderation|seller|user
        if internal_role == "admin":
            return "Administrador"
        if internal_role == "seller":
            return "Vendedor"
        if internal_role == "moderation":
            return "Soporte"
        return "Almacén"

    def _map_role_to_internal(self, api_role):
        # Frontend: Administrador|Vendedor|Almacén|Contabilidad|Soporte
        if api_role == "Administrador":
            return "admin"
        if api_role == "Vendedor":
            return "seller"
        if api_role == "Soporte":
            return "moderation"
        if api_role == "Contabilidad":
            return "moderation"
        return "user"

    def _company_to_api(self, company):
        # Campos extendidos (vienen de models/company.py) + fallback a campos estándar.
        env_company = request.env["res.company"]
        country_name = None
        if hasattr(company, "country_name"):
            country_name = getattr(company, "country_name")
        if not country_name and getattr(company, "country_id", None):
            country_name = company.country_id.name

        address = ""
        if hasattr(company, "full_address") and getattr(company, "full_address"):
            address = company.full_address
        elif getattr(company, "street", None):
            address = company.street or ""

        tax_id = None
        if hasattr(company, "ruc") and getattr(company, "ruc", None):
            tax_id = company.ruc
        elif getattr(company, "vat", None):
            tax_id = company.vat

        founded_year = getattr(company, "founding_year", None) or 0

        return {
            "id": company.id,
            "name": company.name,
            "legal_name": getattr(company, "legal_name", None) or company.name,
            "tax_id": tax_id or "",
            "email": company.email or "",
            "phone": getattr(company, "phone", None) or getattr(company, "contact_phone", None) or "",
            "address": address,
            "city": getattr(company, "address_city", None) or getattr(company, "city", None) or "",
            "country": country_name or "",
            "founded_year": str(founded_year),
            "sales_history": self._empty_sales_history(),
            "employees": [],  # se rellena desde /employees o aquí si aplica
        }

    @http.route(
        "/api/company/config",
        type="http",
        auth="public",
        methods=["GET", "OPTIONS"],
        csrf=False,
    )
    def get_company_config(self, **kwargs):
        if request.httprequest.method == "OPTIONS":
            return self._options_response()

        company_id = self._parse_int(request.httprequest.args.get("company_id"))
        if not company_id:
            # fallback (puede no ser correcto, pero evita que crashee)
            company = request.env.company
        else:
            company = request.env["res.company"].sudo().browse(company_id)
            if not company.exists():
                return self._json_response({"ok": False, "error": "Company not found"}, 404)

        data = self._company_to_api(company.sudo())
        return self._json_response({"ok": True, "company": data})

    @http.route(
        "/api/company/config",
        type="http",
        auth="public",
        methods=["PUT", "OPTIONS"],
        csrf=False,
    )
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
            # también guardamos en el campo extendido si existe
            if "contact_phone" in request.env["res.company"]._fields:
                vals["contact_phone"] = payload.get("phone")
        if "address" in payload and payload.get("address") is not None:
            if "full_address" in request.env["res.company"]._fields:
                vals["full_address"] = payload.get("address") or ""
            if "street" in request.env["res.company"]._fields:
                vals["street"] = payload.get("address") or ""
        if "city" in payload and payload.get("city") is not None:
            if "address_city" in request.env["res.company"]._fields:
                vals["address_city"] = payload.get("city") or ""
            if "city" in request.env["res.company"]._fields:
                vals["city"] = payload.get("city") or ""
        if "country" in payload and payload.get("country") is not None:
            if "country_name" in request.env["res.company"]._fields:
                vals["country_name"] = payload.get("country") or ""

        # legalName (si existe en el modelo/base)
        if "legalName" in payload and payload.get("legalName") is not None:
            if "legal_name" in request.env["res.company"]._fields:
                vals["legal_name"] = payload.get("legalName")

        if vals:
            company.write(vals)

        return self._json_response({"ok": True})

    # =============================================================
    # EMPLOYEES (equipo)
    # =============================================================

    @http.route(
        "/api/company/employees",
        type="http",
        auth="public",
        methods=["GET", "OPTIONS"],
        csrf=False,
    )
    def list_employees(self, **kwargs):
        if request.httprequest.method == "OPTIONS":
            return self._options_response()

        company_id = self._parse_int(request.httprequest.args.get("company_id"))
        if not company_id:
            return self._json_response({"ok": False, "error": "company_id is required"}, 400)

        employees = request.env["billnova.user"].sudo().search([])
        # Filtrado en Python para evitar problemas con dominios sobre relaciones.
        employees = employees.filtered(
            lambda e: company_id in (e.res_user_id.company_ids.ids or [])
        )

        return self._json_response(
            {
                "ok": True,
                "employees": [
                    {
                        "id": e.id,
                        "name": e.name or "",
                        "email": e.email or "",
                        "role": self._map_role_to_api(e.role or ""),
                        "phone": e.phone or "",
                        "status": "active" if getattr(e.res_user_id, "active", True) else "disabled",
                    }
                    for e in employees
                ],
            }
        )

    @http.route(
        "/api/company/employees",
        type="http",
        auth="public",
        methods=["POST", "OPTIONS"],
        csrf=False,
    )
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
        internal_role = self._map_role_to_internal(role_api)
        is_active = True if status_api == "active" else False

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
            if company_id:
                res_user.write({"company_ids": [(6, 0, [company_id])]})

        # billnova.user (equipo)
        billnova_user = request.env["billnova.user"].sudo().search(
            [("res_user_id", "=", res_user.id)], limit=1
        )
        if not billnova_user:
            billnova_user = request.env["billnova.user"].sudo().create(
                {
                    "name": name,
                    "email": email,
                    "phone": phone,
                    "address": "",
                    "role": internal_role,
                    "is_mobile_user": True,
                    "res_user_id": res_user.id,
                }
            )
        else:
            billnova_user.write(
                {
                    "name": name,
                    "email": email,
                    "phone": phone,
                    "role": internal_role,
                }
            )

        res_user.write({"active": is_active})

        return self._json_response({"ok": True, "id": billnova_user.id}, status=201)

    @http.route(
        "/api/company/employees/<int:employee_id>",
        type="http",
        auth="public",
        methods=["PUT", "OPTIONS"],
        csrf=False,
    )
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
            vals_res["active"] = True if payload.get("status") == "active" else False

        if vals_res:
            res_user.write(vals_res)

        return self._json_response({"ok": True})

    @http.route(
        "/api/company/employees/<int:employee_id>/toggle",
        type="http",
        auth="public",
        methods=["POST", "OPTIONS"],
        csrf=False,
    )
    def toggle_employee(self, employee_id, **kwargs):
        if request.httprequest.method == "OPTIONS":
            return self._options_response()

        billnova_user = request.env["billnova.user"].sudo().browse(employee_id)
        if not billnova_user.exists():
            return self._json_response({"ok": False, "error": "Employee not found"}, 404)

        res_user = billnova_user.res_user_id.sudo()
        new_active = not getattr(res_user, "active", True)
        res_user.write({"active": new_active})

        return self._json_response(
            {"ok": True, "status": "active" if new_active else "disabled"}
        )

    # =============================================================
    # VERIFY ACCESS
    # =============================================================

    @http.route(
        "/api/company/access-verify",
        type="http",
        auth="public",
        methods=["POST", "OPTIONS"],
        csrf=False,
    )
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