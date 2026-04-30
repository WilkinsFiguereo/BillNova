from datetime import date, timedelta

from odoo import fields, http
from odoo.http import Response, request
import json
import logging
from psycopg2 import IntegrityError
from .auth_controller import AuthApiController

_logger = logging.getLogger(__name__)


class CompanyApiController(http.Controller):
    _MONTH_LABELS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

    def _add_months(self, current_date, delta_months):
        month_index = current_date.month - 1 + delta_months
        year = current_date.year + month_index // 12
        month = month_index % 12 + 1
        return current_date.replace(year=year, month=month, day=1)

    def _build_financial_buckets(self, period):
        today = fields.Date.context_today(request.env.user)
        if isinstance(today, str):
            today = fields.Date.from_string(today)
        today = today or date.today()

        if period == "week":
            start_day = today - timedelta(days=6)
            return [
                {
                    "label": day.strftime("%d/%m"),
                    "start": day,
                    "end": day,
                    "sales": 0.0,
                    "collections": 0.0,
                    "pending": 0.0,
                }
                for day in (start_day + timedelta(days=offset) for offset in range(7))
            ]

        month_count = 12 if period == "year" else 7
        current_month = today.replace(day=1)
        start_month = self._add_months(current_month, -(month_count - 1))
        buckets = []
        for offset in range(month_count):
            bucket_start = self._add_months(start_month, offset)
            if offset + 1 < month_count:
                next_month = self._add_months(bucket_start, 1)
                bucket_end = next_month - timedelta(days=1)
            else:
                next_month = self._add_months(bucket_start, 1)
                bucket_end = next_month - timedelta(days=1)
            buckets.append(
                {
                    "label": self._MONTH_LABELS[bucket_start.month - 1],
                    "start": bucket_start,
                    "end": bucket_end,
                    "sales": 0.0,
                    "collections": 0.0,
                    "pending": 0.0,
                }
            )
        return buckets

    def _accumulate_financial_metric(self, buckets, target_date, metric, amount):
        if not target_date or amount == 0:
            return
        for bucket in buckets:
            if bucket["start"] <= target_date <= bucket["end"]:
                bucket[metric] += amount
                return

    def _get_current_res_user(self):
        AuthApiController()._ensure_session_from_request()
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

    def _log_company_scope_debug(self, label, requested_company_id=None):
        user = self._get_current_res_user()
        billnova_user = self._resolve_current_billnova_user()
        effective_company = None
        if billnova_user and billnova_user.company_id:
            effective_company = billnova_user.company_id.id
        elif user and user.exists() and user.company_id:
            effective_company = user.company_id.id

        _logger.info("=== COMPANY SCOPE DEBUG: %s ===", label)
        _logger.info("SESSION UID: %s", getattr(request.session, "uid", None))
        _logger.info("SESSION LOGIN: %s", getattr(request.session, "login", None))
        _logger.info("REQUESTED COMPANY ID: %s", requested_company_id)
        _logger.info(
            "RES USER -> id=%s login=%s active=%s company_id=%s",
            getattr(user, "id", None),
            getattr(user, "login", None),
            getattr(user, "active", None),
            getattr(getattr(user, "company_id", None), "id", None),
        )
        _logger.info(
            "BILLNOVA USER -> id=%s email=%s role=%s company_id=%s res_user_id=%s",
            getattr(billnova_user, "id", None),
            getattr(billnova_user, "email", None),
            getattr(billnova_user, "role", None),
            getattr(getattr(billnova_user, "company_id", None), "id", None),
            getattr(getattr(billnova_user, "res_user_id", None), "id", None),
        )
        _logger.info("EFFECTIVE COMPANY ID: %s", effective_company)
        _logger.info("=== END COMPANY SCOPE DEBUG ===")

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
        if internal_role == "worker":
            return "Trabajador"
        if internal_role == "moderation":
            return "Soporte"
        return "Almacen"

    def _map_role_to_internal(self, api_role):
        if api_role == "Administrador":
            return "admin"
        if api_role == "Vendedor":
            return "seller"
        if api_role == "Trabajador":
            return "worker"
        if api_role in ("Soporte", "Contabilidad"):
            return "moderation"
        return "user"

    def _resolve_current_billnova_user(self):
        user = self._get_current_res_user()
        if not user or not user.exists():
            return request.env["billnova.user"]
        return request.env["billnova.user"].sudo().search([("res_user_id", "=", user.id)], limit=1)

    def _current_billnova_role(self):
        billnova_user = self._resolve_current_billnova_user()
        return billnova_user.role if billnova_user else None

    def _can_manage_company_settings(self):
        return self._current_billnova_role() in ("seller", "gerente", "admin")

    def _can_moderate_companies(self):
        return self._current_billnova_role() in ("moderator", "moderation", "admin")

    def _is_admin_user(self):
        return self._current_billnova_role() == "admin"

    def _is_company_moderation_payload(self, payload):
        allowed_keys = {"moderation_status", "moderation_reason", "status"}
        payload_keys = {key for key, value in payload.items() if value is not None}
        return bool(payload_keys) and payload_keys.issubset(allowed_keys)

    def _forbidden_manage_response(self):
        return self._json_response(
            {"ok": False, "error": "No tienes permisos para gestionar la empresa."},
            403,
        )

    def _forbidden_admin_response(self):
        return self._json_response(
            {"ok": False, "error": "No tienes permisos para acceder al dashboard administrativo."},
            403,
        )

    def _user_owns_company(self, company_id):
        if not company_id:
            return False

        billnova_user = self._resolve_current_billnova_user()
        if billnova_user and billnova_user.company_id and billnova_user.company_id.id == company_id:
            return True

        current_user = self._get_current_res_user()
        return bool(current_user and current_user.exists() and current_user.company_id and current_user.company_id.id == company_id)

    def _resolve_current_company(self):
        billnova_user = self._resolve_current_billnova_user()
        if billnova_user and billnova_user.company_id:
            return billnova_user.company_id.sudo()

        current_user = self._get_current_res_user()
        if current_user and current_user.exists() and current_user.company_id:
            return current_user.company_id.sudo()

        return request.env["res.company"].browse()

    @http.route("/api/admin/dashboard/financial", type="http", auth="public", methods=["GET", "OPTIONS"], csrf=False)
    def admin_dashboard_financial(self, **kwargs):
        if request.httprequest.method == "OPTIONS":
            return self._options_response()

        role = self._current_billnova_role()
        if role not in ("admin", "moderator", "moderation"):
            return self._forbidden_admin_response()

        period = (request.httprequest.args.get("period") or "month").strip().lower()
        if period not in ("week", "month", "year"):
            period = "month"

        try:
            buckets = self._build_financial_buckets(period)
            oldest_date = buckets[0]["start"] if buckets else None
            invoice_domain = [
                ("move_type", "in", ["out_invoice", "out_refund"]),
                ("state", "=", "posted"),
            ]
            if oldest_date:
                invoice_domain.append("|")
                invoice_domain.append(("invoice_date", ">=", oldest_date))
                invoice_domain.append(("invoice_date_due", ">=", oldest_date))

            invoices = request.env["account.move"].sudo().search(invoice_domain, order="invoice_date asc, id asc")

            for invoice in invoices:
                signed_total = float(invoice.amount_total_signed or invoice.amount_total or 0.0)
                residual = abs(float(invoice.amount_residual_signed or invoice.amount_residual or 0.0))
                invoice_date = invoice.invoice_date
                due_date = invoice.invoice_date_due or invoice_date

                self._accumulate_financial_metric(buckets, invoice_date, "sales", signed_total)

                if invoice.payment_state == "paid":
                    self._accumulate_financial_metric(buckets, due_date, "collections", abs(signed_total))

                if invoice.payment_state in ("not_paid", "partial", "in_payment") and residual > 0:
                    self._accumulate_financial_metric(buckets, due_date, "pending", residual)

            data = [
                {
                    "label": bucket["label"],
                    "sales": round(bucket["sales"], 2),
                    "collections": round(bucket["collections"], 2),
                    "pending": round(bucket["pending"], 2),
                }
                for bucket in buckets
            ]

            return self._json_response({"ok": True, "period": period, "data": data})
        except Exception as error:
            _logger.exception("Error building admin financial dashboard data")
            return self._json_response({"ok": False, "error": str(error)}, 500)

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

    @http.route("/api/companies/<int:company_id>", type="http", auth="public", methods=["PUT", "DELETE", "OPTIONS"], csrf=False)
    def update_company(self, company_id, **kwargs):
        if request.httprequest.method == "OPTIONS":
            return self._options_response()

        company = request.env["res.company"].sudo().with_context(active_test=False).browse(company_id)
        if not company.exists():
            return self._json_response({"ok": False, "error": "Company not found"}, 404)

        if request.httprequest.method == "DELETE":
            if not self._is_admin_user():
                return self._forbidden_manage_response()

            company_name = company.name
            try:
                company.unlink()
                self._log_event(
                    company_id,
                    "eliminar",
                    "Empresa",
                    f"Empresa eliminada: {company_name}",
                    "Eliminacion permanente desde el admin",
                    "res.company",
                    company_id,
                    company_name,
                )
                return self._json_response({"ok": True, "deleted": True, "archived": False})
            except Exception as error:
                vals = {"status": "disabled", "moderation_status": "rejected"}
                if "active" in request.env["res.company"]._fields:
                    vals["active"] = False
                company.write(vals)
                self._log_event(
                    company_id,
                    "eliminar",
                    "Empresa",
                    f"Empresa archivada: {company_name}",
                    f"Archivo preventivo por dependencias: {error}",
                    "res.company",
                    company_id,
                    company_name,
                )
                return self._json_response(
                    {
                        "ok": True,
                        "deleted": False,
                        "archived": True,
                        "warning": "La empresa tenia dependencias y fue archivada en lugar de eliminarse.",
                    }
                )

        payload = request.httprequest.get_json(silent=True) or {}
        is_moderation_update = self._is_company_moderation_payload(payload)

        if is_moderation_update:
            if not self._can_moderate_companies():
                return self._forbidden_manage_response()
        elif not self._can_manage_company_settings():
            return self._forbidden_manage_response()

        if not is_moderation_update and not self._is_admin_user() and not self._user_owns_company(company_id):
            return self._json_response({"ok": False, "error": "Company not found"}, 404)

        vals = {}
        previous_moderation_status = company.moderation_status
        previous_moderation_reason = company.moderation_reason
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
            "business_type",
            "admin_position",
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
        if "access_password" in payload or "password" in payload:
            next_password = payload.get("access_password") or payload.get("password") or False
            vals["access_password"] = next_password
            confirm_password = (
                payload.get("confirm_password")
                if "confirm_password" in payload
                else payload.get("confirmPassword")
            )
            vals["confirm_password"] = confirm_password or next_password or False

        if vals:
            company.write(vals)
            if (
                "moderation_status" in vals
                and vals["moderation_status"] in ("approved", "rejected")
                and (
                    vals["moderation_status"] != previous_moderation_status
                    or vals.get("moderation_reason", company.moderation_reason) != previous_moderation_reason
                )
            ):
                company.action_send_moderation_status_email()
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
        self._log_company_scope_debug("get_company_config", requested_company_id=company_id)
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

        if not self._can_manage_company_settings():
            return self._forbidden_manage_response()

        payload = request.httprequest.get_json(silent=True) or {}
        company_id = self._parse_int(payload.get("companyId"))
        if not company_id:
            return self._json_response({"ok": False, "error": "companyId is required"}, 400)
        if not self._user_owns_company(company_id):
            return self._json_response({"ok": False, "error": "Company not found"}, 404)

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
        if not self._user_owns_company(company_id):
            return self._json_response({"ok": False, "error": "Company not found"}, 404)

        employees = request.env["billnova.user"].sudo().with_context(active_test=False).search(
            [("company_id", "=", company_id)]
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

        if not self._can_manage_company_settings():
            return self._forbidden_manage_response()

        payload = request.httprequest.get_json(silent=True) or {}
        company_id = self._parse_int(payload.get("companyId"))
        if not company_id:
            return self._json_response({"ok": False, "error": "companyId is required"}, 400)
        if not self._user_owns_company(company_id):
            return self._json_response({"ok": False, "error": "Company not found"}, 404)

        name = (payload.get("name") or "").strip()
        email = (payload.get("email") or "").strip().lower()
        role_api = "Trabajador"
        phone = (payload.get("phone") or "").strip()
        raw_password = payload.get("password") or ""
        if not name or not email or not raw_password:
            return self._json_response({"ok": False, "error": "name, email and password are required"}, 400)

        company = request.env["res.company"].sudo().browse(company_id)
        if not company.exists():
            return self._json_response({"ok": False, "error": "Company not found"}, 404)

        existing_billnova_user = request.env["billnova.user"].sudo().with_context(active_test=False).search(
            [("email", "=", email)],
            limit=1,
        )
        if existing_billnova_user and existing_billnova_user.company_id and existing_billnova_user.company_id.id != company_id:
            return self._json_response({"ok": False, "error": "Ese correo ya pertenece a otra empresa."}, 409)
        auth_api = AuthApiController()
        _logger.info(
            "[EMPLOYEE CREATE] start company_id=%s name=%s email=%s phone=%s current_uid=%s",
            company_id,
            name,
            email,
            phone,
            getattr(request.session, "uid", None),
        )
        auth_api._log_user_snapshots(
            "company_employee_before_register",
            login=email,
            email=email,
        )
        auth_api._log_all_users_overview("company_employee_before_register")
        result = auth_api._register_billnova_user(
            name=name,
            login=email,
            password=raw_password,
            email=email,
            phone=phone,
            address="",
            role='worker',
            company_id=company_id,
            is_mobile_user=False,
            frontend_base_url=auth_api._get_frontend_base_url(),
            invitation_company_name=company.name,
        )
        if not result.get("ok"):
            return self._json_response({"ok": False, "error": result.get("error")}, result.get("status", 400))

        billnova_user = request.env["billnova.user"].sudo().with_context(active_test=False).browse(result.get("mobile_user_id"))
        _logger.info("[EMPLOYEE CREATE] register result=%s", result)
        if billnova_user.exists():
            billnova_user.write({
                "company_id": company_id,
                "role": "worker",
                "is_mobile_user": False,
            })
            _logger.info(
                "[EMPLOYEE CREATE] billnova_user linked id=%s res_user_id=%s active=%s company_id=%s",
                billnova_user.id,
                getattr(billnova_user.res_user_id, "id", None),
                billnova_user.active,
                getattr(billnova_user.company_id, "id", None),
            )
        if not billnova_user.exists() or not billnova_user.res_user_id or not billnova_user.res_user_id.exists():
            return self._json_response(
                {"ok": False, "error": "No se pudo completar el alta del usuario del sistema."},
                500,
            )
        auth_api._log_user_snapshots(
            "company_employee_after_register",
            login=email,
            email=email,
        )
        auth_api._log_all_users_overview("company_employee_after_register")

        email_sent = result.get("email_sent")
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
        response = {"ok": True, "id": billnova_user.id, "email_sent": bool(email_sent), "requires_verification": True}
        if not email_sent:
            response["warning"] = "El trabajador fue creado, pero Odoo no pudo enviar el correo."
        return self._json_response(response, status=201)

    @http.route("/api/company/employees/<int:employee_id>", type="http", auth="public", methods=["PUT", "OPTIONS"], csrf=False)
    def update_employee(self, employee_id, **kwargs):
        if request.httprequest.method == "OPTIONS":
            return self._options_response()

        if not self._can_manage_company_settings():
            return self._forbidden_manage_response()

        payload = request.httprequest.get_json(silent=True) or {}
        billnova_user = request.env["billnova.user"].sudo().with_context(active_test=False).browse(employee_id)
        if not billnova_user.exists():
            return self._json_response({"ok": False, "error": "Employee not found"}, 404)
        if not billnova_user.company_id or not self._user_owns_company(billnova_user.company_id.id):
            return self._json_response({"ok": False, "error": "Employee not found"}, 404)

        res_user = billnova_user.res_user_id.sudo()
        vals_billnova = {}
        if "name" in payload and payload.get("name") is not None:
            vals_billnova["name"] = payload.get("name")
        if "email" in payload and payload.get("email") is not None:
            vals_billnova["email"] = payload.get("email")
        if "phone" in payload and payload.get("phone") is not None:
            vals_billnova["phone"] = payload.get("phone")
        vals_billnova["role"] = "worker"
        if "status" in payload and payload.get("status") is not None:
            vals_billnova["active"] = payload.get("status") == "active"
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

        if not self._can_manage_company_settings():
            return self._forbidden_manage_response()

        billnova_user = request.env["billnova.user"].sudo().with_context(active_test=False).browse(employee_id)
        if not billnova_user.exists():
            return self._json_response({"ok": False, "error": "Employee not found"}, 404)
        if not billnova_user.company_id or not self._user_owns_company(billnova_user.company_id.id):
            return self._json_response({"ok": False, "error": "Employee not found"}, 404)

        res_user = billnova_user.res_user_id.sudo()
        new_active = not getattr(res_user, "active", True)
        res_user.write({"active": new_active})
        billnova_user.write({"active": new_active})
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

    @http.route("/api/company/<int:company_id>/stats", type="http", auth="public", methods=["GET", "OPTIONS"], csrf=False)
    def company_stats(self, company_id):
        if request.httprequest.method == "OPTIONS":
            return self._options_response()

        try:
            current_user = self._get_current_res_user()
            if not current_user or not current_user.exists():
                return self._json_response({"ok": False, "error": "No hay sesion activa"}, 401)
            if not self._user_owns_company(company_id):
                return self._forbidden_manage_response()

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
