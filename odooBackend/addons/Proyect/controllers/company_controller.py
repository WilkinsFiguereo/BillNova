from odoo import http
from odoo.fields import Datetime
from odoo.http import request, Response
import json


class CompanyApiController(http.Controller):

    def _cors_headers(self):
        origin = request.httprequest.headers.get("Origin")
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

    def _serialize_company(self, company):
        return {
            "id": company.id,
            "name": company.name or "",
            "ruc": company.ruc or "",
            "sector": company.sector or "",
            "company_size": company.company_size or "",
            "country_name": company.country_name or company.country_id.name or "",
            "address_city": company.address_city or company.city or "",
            "address_state": company.address_state or company.state_id.name or "",
            "full_address": company.full_address or company.street or "",
            "website": company.website or "",
            "contact_name": company.contact_name or "",
            "contact_email": company.contact_email or company.email or "",
            "contact_phone": company.contact_phone or company.phone or "",
            "admin_full_name": company.admin_full_name or company.contact_name or "",
            "admin_email": company.admin_email or company.contact_email or company.email or "",
            "admin_phone": company.admin_phone or company.contact_phone or company.phone or "",
            "admin_position": company.admin_position or "",
            "moderation_status": company.moderation_status or "pending",
            "moderation_reason": company.moderation_reason or "",
            "moderation_updated_at": company.moderation_updated_at.isoformat() if company.moderation_updated_at else None,
            "create_date": company.create_date.isoformat() if company.create_date else None,
            "write_date": company.write_date.isoformat() if company.write_date else None,
            "product_count": request.env["product.product"].sudo().search_count([("company_id", "=", company.id)]),
        }

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
        name = payload.get("company_name") or payload.get("companyName") or payload.get("name")

        if not name:
            return self._json_response({"ok": False, "error": "company_name is required"}, 400)

        try:
            company = request.env["res.company"].sudo().create({
                "name": name,
                "ruc": payload.get("ruc"),
                "sector": payload.get("sector"),
                "founding_year": payload.get("founding_year"),
                "website": payload.get("website"),
                "company_size": payload.get("company_size"),
                "contact_name": payload.get("contact_name"),
                "contact_email": payload.get("contact_email"),
                "contact_phone": payload.get("contact_phone"),
                "country_id": payload.get("country_id"),
                "country_name": payload.get("country_name"),
                "address_state": payload.get("state"),
                "address_city": payload.get("city"),
                "street": payload.get("address"),
                "full_address": payload.get("full_address") or payload.get("address"),
                "zip": payload.get("postal_code"),
                "admin_full_name": payload.get("admin_full_name"),
                "admin_email": payload.get("admin_email"),
                "admin_phone": payload.get("admin_phone"),
                "admin_position": payload.get("admin_position"),
                "access_password": payload.get("password"),
                "confirm_password": payload.get("confirm_password"),
                "accept_terms": bool(payload.get("accept_terms")),
                "accept_marketing": bool(payload.get("accept_marketing")),
                "moderation_status": "pending",
            })

            return self._json_response({"ok": True, "company_id": company.id}, 201)
        except Exception as exc:
            return self._json_response({"ok": False, "error": str(exc)}, 500)

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

        status = request.httprequest.args.get("status")
        domain = []
        if status in {"pending", "approved", "rejected"}:
            domain.append(("moderation_status", "=", status))

        companies = request.env["res.company"].sudo().search(domain, order="create_date desc")
        return self._json_response({"ok": True, "data": [self._serialize_company(c) for c in companies]})

    @http.route(
        "/api/companies/<int:company_id>",
        type="http",
        auth="public",
        methods=["GET", "PUT", "OPTIONS"],
        csrf=False,
    )
    def company_detail(self, company_id):
        if request.httprequest.method == "OPTIONS":
            return self._options_response()

        company = request.env["res.company"].sudo().browse(company_id)
        if not company.exists():
            return self._json_response({"ok": False, "error": "Company not found"}, 404)

        if request.httprequest.method == "GET":
            return self._json_response({"ok": True, "data": self._serialize_company(company)})

        payload = request.httprequest.get_json(silent=True) or {}
        vals = {}

        if "moderation_status" in payload:
            status = payload.get("moderation_status") or "pending"
            if status not in ("pending", "approved", "rejected"):
                return self._json_response({"ok": False, "error": "Invalid moderation_status"}, 400)
            vals["moderation_status"] = status
            vals["moderation_updated_at"] = Datetime.now()

        if "moderation_reason" in payload:
            vals["moderation_reason"] = payload.get("moderation_reason") or ""

        if not vals:
            return self._json_response({"ok": False, "error": "No fields to update"}, 400)

        company.write(vals)
        return self._json_response({"ok": True, "data": self._serialize_company(company)})
