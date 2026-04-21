"use client";
// src/feature/company/hooks/useEmployees.ts

import { useCallback, useEffect, useState } from "react";
import { Employee, EmployeeStatus } from "../types/company.types";
import { companyApi, ApiEmployee } from "../data/companyApi";

function mapRoleFromApi(role: string): Employee["role"] {
  if (role === "Almacen") return "Almacén";
  return role as Employee["role"];
}

function mapRoleToApi(role: Employee["role"]): string {
  if (role === "Almacén") return "Almacen";
  return role;
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

export function useEmployees(companyId: string) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEmployees = useCallback(async () => {
    if (!companyId || companyId === "0") return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await companyApi.listEmployees(companyId);
      if (res.ok && res.employees) {
        setEmployees(res.employees.map(mapEmployeeFromApi));
      }
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar empleados");
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    void loadEmployees();
  }, [loadEmployees]);

  const addEmployee = useCallback(async (emp: Employee) => {
    if (!companyId || companyId === "0") return;
    try {
      const res = await companyApi.createEmployee({
        companyId,
        name: emp.name,
        email: emp.email,
        role: mapRoleToApi(emp.role),
        phone: emp.phone,
        status: emp.status,
      });
      if (res.ok) {
        setEmployees((prev) => [{ ...emp, id: String(res.id) }, ...prev]);
      }
    } catch (err) {
      console.error(err);
      setError("No se pudo agregar empleado");
    }
  }, [companyId]);

  const updateEmployee = useCallback(async (updated: Employee) => {
    try {
      await companyApi.updateEmployee(updated.id, {
        name: updated.name,
        email: updated.email,
        role: mapRoleToApi(updated.role),
        phone: updated.phone,
        status: updated.status,
      });
      setEmployees((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    } catch (err) {
      console.error(err);
      setError("No se pudo actualizar empleado");
    }
  }, []);

  const toggleStatus = useCallback(async (id: string) => {
    try {
      const res = await companyApi.toggleEmployee(id);
      if (res.ok) {
        setEmployees((prev) =>
          prev.map((e) => (e.id === id ? { ...e, status: res.status as EmployeeStatus } : e))
        );
      }
    } catch (err) {
      console.error(err);
      setError("No se pudo cambiar estado");
    }
  }, []);

  return { employees, isLoading, error, addEmployee, updateEmployee, toggleStatus, reload: loadEmployees };
}
