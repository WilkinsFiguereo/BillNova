from odoo import http
from odoo.http import request, Response
import json

class CompanyApiController(http.Controller):

    def _cors_headers(self):
        origin = request.httprequest.headers.get('Origin')
        return {
            "Access-Control-Allow-Origin": origin or "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
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
                    "active": company.active,
                    "ruc": company.ruc or None,
                    "sector": company.sector or None,
                    "website": company.website or None,
                    "company_size": company.company_size or None,
                    "contact_name": company.contact_name or None,
                    "contact_email": company.contact_email or None,
                    "contact_phone": company.contact_phone or None,
                    "city": company.address_city or None,
                    "state": company.address_state or None,
                    "address": company.street or None,
                    "created_at": company.create_date.isoformat() if company.create_date else None,
                })
            return self._json_response({"data": data})
        except Exception as e:
            return self._json_response({"error": str(e)}, 500)

    @http.route(
        "/api/companies/<int:company_id>",
        type="http",
        auth="public",
        methods=["PUT", "OPTIONS"],
        csrf=False,
    )
    def update_company(self, company_id):
        if request.httprequest.method == "OPTIONS":
            return self._options_response()

        company = request.env["res.company"].sudo().browse(company_id)
        if not company.exists():
            return self._json_response({"ok": False, "error": "Company not found"}, 404)

        payload = request.httprequest.get_json(silent=True) or {}

        vals = {}
        field_map = {
            "name": "name",
            "company_name": "name",
            "ruc": "ruc",
            "sector": "sector",
            "website": "website",
            "company_size": "company_size",
            "contact_name": "contact_name",
            "contact_email": "contact_email",
            "contact_phone": "contact_phone",
            "state": "address_state",
            "city": "address_city",
            "address": "street",
            "password": "access_password",
            "active": "active",
        }

        for payload_key, model_key in field_map.items():
            if payload_key in payload:
                vals[model_key] = payload.get(payload_key)

        if not vals:
            return self._json_response({"ok": False, "error": "No fields to update"}, 400)

        try:
            company.write(vals)
            return self._json_response({"ok": True, "id": company.id})
        except Exception as e:
            return self._json_response({"ok": False, "error": str(e)}, 500)

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
                "postal_code": payload.get("postal_code"),

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
