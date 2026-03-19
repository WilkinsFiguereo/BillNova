"use client";
// src/feature/company/hooks/useCompany.ts

import { useCallback, useEffect, useMemo, useState } from "react";
import { Company, Employee } from "../types/company.types";
import { companyApi, ApiCompany, ApiEmployee } from "../data/companyApi";

type CompanyEditable = Pick<Company, "name" | "legalName" | "rnc" | "email" | "phone" | "address" | "city" | "country">;

const EMPTY_COMPANY: Company = {
  id: "0",
  name: "",
  legalName: "",
  rnc: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  country: "",
  logoInitials: "",
  foundedYear: new Date().getFullYear(),
  employees: [],
  salesHistory: [
    { month: "Oct", sales: 0, orders: 0 },
    { month: "Nov", sales: 0, orders: 0 },
    { month: "Dic", sales: 0, orders: 0 },
    { month: "Ene", sales: 0, orders: 0 },
    { month: "Feb", sales: 0, orders: 0 },
    { month: "Mar", sales: 0, orders: 0 },
  ],
};

function toInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

function mapRoleFromApi(role: string): Employee["role"] {
  if (role === "Almacen") return "Almacén";
  return role as Employee["role"];
}

function mapEmployeeFromApi(e: ApiEmployee): Employee {
  return {
    id: String(e.id),
    name: e.name,
    email: e.email,
    role: mapRoleFromApi(e.role),
    phone: e.phone,
    status: e.status,
  };
}

function mapCompanyFromApi(c: ApiCompany): Company {
  const foundedYear = Number(c.founded_year) || new Date().getFullYear();
  return {
    id: String(c.id),
    name: c.name,
    legalName: c.legal_name || c.name,
    rnc: c.tax_id,
    email: c.email,
    phone: c.phone,
    address: c.address,
    city: c.city,
    country: c.country,
    logoInitials: toInitials(c.name),
    foundedYear,
    employees: (c.employees || []).map(mapEmployeeFromApi),
    salesHistory: c.sales_history || EMPTY_COMPANY.salesHistory,
  };
}

export function useCompany() {
  const [company, setCompany] = useState<Company>(EMPTY_COMPANY);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const companyId = useMemo(() => company.id, [company.id]);

  const loadCompany = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await companyApi.getConfig();
      if (res.ok && res.company) {
        setCompany(mapCompanyFromApi(res.company));
      } else {
        setError("No se encontró empresa");
      }
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar la empresa");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCompany();
  }, [loadCompany]);

  const updateCompany = useCallback(async (fields: Partial<CompanyEditable>) => {
    setCompany((prev) => ({ ...prev, ...fields }));
    if (!companyId || companyId === "0") return;

    try {
      await companyApi.updateCompany({
        companyId,
        name: fields.name,
        legalName: fields.legalName,
        rnc: fields.rnc,
        email: fields.email,
        phone: fields.phone,
        address: fields.address,
        city: fields.city,
        country: fields.country,
      });
    } catch (err) {
      console.error(err);
      setError("No se pudo actualizar la empresa");
    }
  }, [companyId]);

  return { company, companyId, isLoading, error, updateCompany, reload: loadCompany };
}
