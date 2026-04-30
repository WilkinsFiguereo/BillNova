"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { companyApi, ApiCompany, ApiEmployee } from "../data/companyApi";
import { Company, Employee } from "../types/company.types";
import { getActiveCompanyId, syncBusinessTypeWithCurrentUser, syncCompanyIdWithCurrentUser } from "@/features/seller/shared/companySession";

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
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function mapRoleFromApi(role: string): Employee["role"] {
  if (role === "Almacen") return "Almacén";
  return role as Employee["role"];
}

function mapEmployeeFromApi(employee: ApiEmployee): Employee {
  return {
    id: String(employee.id),
    name: employee.name,
    email: employee.email,
    role: mapRoleFromApi(employee.role),
    phone: employee.phone,
    status: employee.status,
  };
}

function mapCompanyFromApi(company: ApiCompany): Company {
  const foundedYear = Number(company.founded_year) || new Date().getFullYear();

  return {
    id: String(company.id),
    name: company.name,
    legalName: company.legal_name || company.name,
    rnc: company.tax_id || "",
    email: company.email || "",
    phone: company.phone || "",
    address: company.address || "",
    city: company.city || "",
    country: company.country || "",
    logoInitials: toInitials(company.name),
    foundedYear,
    employees: Array.isArray(company.employees) ? company.employees.map(mapEmployeeFromApi) : [],
    salesHistory: Array.isArray(company.sales_history) ? company.sales_history : EMPTY_COMPANY.salesHistory,
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
      const activeCompanyId = getActiveCompanyId() ?? undefined;
      let res = await companyApi.getConfig(activeCompanyId);

      if ((!res.ok || !res.company) && activeCompanyId) {
        res = await companyApi.getConfig();
      }

      if (res.ok && res.company) {
        setCompany(mapCompanyFromApi(res.company));
        syncCompanyIdWithCurrentUser(res.company.id);
        syncBusinessTypeWithCurrentUser(res.company.business_type ?? null);
      } else {
        setCompany(EMPTY_COMPANY);
        syncCompanyIdWithCurrentUser(null);
        syncBusinessTypeWithCurrentUser(null);
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

  const updateCompany = useCallback(
    async (fields: Partial<CompanyEditable>) => {
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
    },
    [companyId],
  );

  return { company, companyId, isLoading, error, updateCompany, reload: loadCompany };
}
