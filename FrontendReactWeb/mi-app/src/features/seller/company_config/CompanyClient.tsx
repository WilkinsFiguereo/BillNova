"use client";
// src/feature/company/CompanyClient.tsx

import { useState, useCallback } from "react";
import { Employee } from "./types/company.types";
import T from "@/features/seller/company_config/theme/appTheme";

import { useCompany }    from "./hooks/useCompany";
import { useEmployees }  from "./hooks/useEmployees";

import CompanyHeader      from "./sections/CompanyHeader";
import CompanyInfo        from "./sections/CompanyInfo";
import CompanySalesChart  from "./sections/CompanySalesChart";
import EmployeesSection   from "./sections/EmployeesSection";

import EditCompanyModal from "./ui/EditCompanyModal";
import EmployeeModal    from "./ui/EmployeeModal";
import AccessPasswordModal from "./ui/AccessPasswordModal";
import Toast            from "@/features/seller/orders/ui/Toast";   // reutilizamos el Toast
import { Sidebar } from "../dashboard/dashboards";
import { NAV_ITEMS } from "../dashboard/data/chart.data";
import { dashboardTheme, globalStyles } from "../dashboard/theme/dashboard.theme";
import { getStoredAuthState } from "@/features/auth/login/data/storage";

type ToastType = "success" | "error" | "warning" | "info";
interface ToastState { msg: string; type: ToastType; }

export default function CompanyClient() {
  const { company, companyId, isLoading, error, updateCompany } = useCompany();
  const { employees, addEmployee, updateEmployee, toggleStatus } =
    useEmployees(companyId);
  const currentRole = getStoredAuthState()?.role;
  const canManageCompany = currentRole !== "worker";

  const [editCompanyOpen, setEditCompanyOpen] = useState(false);
  const [accessModalOpen, setAccessModalOpen] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [accessLoading, setAccessLoading] = useState(false);
  const [employeeModal,   setEmployeeModal]   = useState<Employee | null | undefined>(undefined);
  // undefined = cerrado, null = nuevo, Employee = editar
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((msg: string, type: ToastType = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  }, []);

  const handleSaveCompany = useCallback((fields: Partial<typeof company>) => {
    updateCompany(fields);
    showToast("Empresa actualizada correctamente");
  }, [updateCompany, showToast]);

  const handleSaveEmployee = useCallback((emp: Employee) => {
    if (employeeModal === null) {
      addEmployee(emp);
      showToast("Empleado agregado");
    } else {
      updateEmployee(emp);
      showToast("Empleado actualizado");
    }
  }, [employeeModal, addEmployee, updateEmployee, showToast]);

  const handleToggle = useCallback((id: string) => {
    const emp = employees.find((e) => e.id === id);
    toggleStatus(id);
    showToast(
      emp?.status === "active" ? "Empleado deshabilitado" : "Empleado activado",
      emp?.status === "active" ? "error" : "success"
    );
  }, [employees, toggleStatus, showToast]);

  const handleRequestEdit = useCallback(() => {
    setAccessError(null);
    setAccessModalOpen(true);
  }, []);

  const handleVerifyAccess = useCallback(async (password: string) => {
    if (!companyId || companyId === "0") return;
    setAccessLoading(true);
    setAccessError(null);
    try {
      const { companyApi } = await import("./data/companyApi");
      const res = await companyApi.verifyAccess({ companyId, password });
      if (res.ok) {
        setAccessModalOpen(false);
        setEditCompanyOpen(true);
      } else {
        setAccessError(res.error || "Acceso denegado");
      }
    } catch (err) {
      console.error(err);
      setAccessError("No se pudo validar la contraseña");
    } finally {
      setAccessLoading(false);
    }
  }, [companyId]);

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      background: T.bgMain,
      color: T.text1,
    }}>
      <style>{globalStyles(dashboardTheme)}</style>
      <Sidebar navItems={NAV_ITEMS} />
      <main style={{ flex: 1, overflow: "auto", padding: "32px" }}>
      {/* Page title */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 14, fontWeight: 600, color: T.text3, margin: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Configuración
        </h1>
        <p style={{ fontSize: 22, fontWeight: 700, color: T.text1, margin: "4px 0 0" }}>
          Mi Empresa
        </p>
      </div>

      {isLoading ? (
        <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, padding: "24px 28px" }}>
          Cargando empresa...
        </div>
      ) : error ? (
        <div style={{ background: T.errorBg, border: `1px solid ${T.error}`, borderRadius: 12, padding: "24px 28px", color: T.error }}>
          {error}
        </div>
      ) : (
        <CompanyHeader
          company={{ ...company, employees }}
          onEdit={handleRequestEdit}
          canEdit={canManageCompany}
        />
      )}

      {/* Two-column layout: info + chart */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 20, marginBottom: 20 }}>
        <CompanyInfo company={company} />
        <CompanySalesChart salesHistory={company.salesHistory} />
      </div>

      <EmployeesSection
        employees={employees}
        onAdd={() => setEmployeeModal(null)}
        onEdit={(emp) => setEmployeeModal(emp)}
        onToggle={handleToggle}
        canManage={canManageCompany}
      />

      {/* Modals */}
      {editCompanyOpen && (
        <EditCompanyModal
          company={company}
          onClose={() => setEditCompanyOpen(false)}
          onSave={handleSaveCompany}
        />
      )}

      {accessModalOpen && canManageCompany && (
        <AccessPasswordModal
          onClose={() => setAccessModalOpen(false)}
          onConfirm={handleVerifyAccess}
          isLoading={accessLoading}
          error={accessError}
        />
      )}

      {employeeModal !== undefined && canManageCompany && (
        <EmployeeModal
          employee={employeeModal}
          onClose={() => setEmployeeModal(undefined)}
          onSave={handleSaveEmployee}
        />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} />}
      </main>
    </div>
  );
}
