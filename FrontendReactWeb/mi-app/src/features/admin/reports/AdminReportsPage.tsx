"use client";

import React, { useMemo, useState } from "react";
import { colors } from "@/features/moderator/report_moderation/theme/reportes.theme";
import { dashboardTheme as t, globalStyles } from "@/features/seller/dashboard/theme/dashboard.theme";
import { useReportes } from "@/features/moderator/report_moderation/hooks/useReportes";
import { ReportesHeader } from "@/features/moderator/report_moderation/sections/ReportesHeader";
import { ReportesFilters } from "@/features/moderator/report_moderation/sections/ReportesFilters";
import { ReportesTable } from "@/features/moderator/report_moderation/sections/ReportesTable";
import { ReporteDetailModal } from "@/features/moderator/report_moderation/sections/ReporteDetailModal";
import { exportAdminReportsToExcel, exportAdminReportsToPdf } from "./adminReportExport";
import { useReports } from "./hooks/useReports";
import { useUsers } from "../users/hooks/useUsers";
import { useDashboard as useCompaniesDashboard } from "../companies/hooks/useDashboard";
import { AdminSidebar } from "../dashboard/ui/AdminSidebar";
import { ADMIN_NAV_ITEMS } from "../dashboard/data/adminNavigation.data";

type ReportTargetType = "usuario" | "empresa";

const categoryOptions = [
  { value: "bug", label: "Incidencia" },
  { value: "ui", label: "Comportamiento inusual" },
  { value: "performance", label: "Rendimiento" },
  { value: "security", label: "Seguridad" },
  { value: "other", label: "Otro" },
] as const;

const severityOptions = [
  { value: "low", label: "Baja" },
  { value: "medium", label: "Media" },
  { value: "high", label: "Alta" },
  { value: "critical", label: "Crítica" },
] as const;

export function AdminReportsPage() {
  const {
    reportes,
    reporteSeleccionado,
    filtros,
    estadisticas,
    isLoading,
    modalAbierto,
    setFiltros,
    seleccionarReporte,
    cerrarModal,
    cambiarEstado,
    guardarNota,
  } = useReportes();
  const { reports: adminReports, creating, submitReport } = useReports();
  const { resUsers, billnovaUsers, loading: usersLoading } = useUsers();
  const { companies, isLoading: companiesLoading } = useCompaniesDashboard();
  const [targetType, setTargetType] = useState<ReportTargetType>("usuario");
  const [targetId, setTargetId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<(typeof categoryOptions)[number]["value"]>("other");
  const [severity, setSeverity] = useState<(typeof severityOptions)[number]["value"]>("medium");
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const userOptions = useMemo(
    () =>
      [
        ...resUsers.map((user) => ({
          id: `usuario-res-${user.id}`,
          entityId: user.id,
          targetModel: "res.users" as const,
          label: `${user.name} (${user.email})`,
          metadata: `Rol: ${user.role}`,
        })),
        ...billnovaUsers.map((user) => ({
          id: `usuario-billnova-${user.id}`,
          entityId: user.id,
          targetModel: "billnova.user" as const,
          label: `${user.name} (${user.email})`,
          metadata: `Rol: ${user.role}`,
        })),
      ],
    [billnovaUsers, resUsers],
  );

  const companyOptions = useMemo(
    () =>
      companies.map((company) => ({
        id: `empresa-${company.id}`,
        entityId: company.id,
        targetModel: "res.company" as const,
        label: company.name,
        metadata: company.contact_email || company.ruc || "Sin dato adicional",
      })),
    [companies],
  );

  const targetOptions = targetType === "usuario" ? userOptions : companyOptions;
  const selectedTarget = targetOptions.find((option) => option.id === targetId);
  const recentAdminReports = adminReports.slice(0, 5);

  const handleCreateAdminReport = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!targetId) {
      setFormError(`Selecciona ${targetType === "usuario" ? "un usuario" : "una empresa"}.`);
      return;
    }

    if (!title.trim() || !description.trim()) {
      setFormError("Completa el título y la descripción del reporte.");
      return;
    }

    const entityLabel = targetType === "usuario" ? "Usuario" : "Empresa";
    const composedTitle = `[${entityLabel}] ${selectedTarget?.label || targetId} - ${title.trim()}`;
    const composedDescription = [
      `${entityLabel} relacionado: ${selectedTarget?.label || targetId}`,
      selectedTarget?.metadata ? `Referencia: ${selectedTarget.metadata}` : null,
      "",
      description.trim(),
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await submitReport({
        title: composedTitle,
        description: composedDescription,
        category,
        severity,
        targetType,
        targetModel: selectedTarget?.targetModel || (targetType === "usuario" ? "res.users" : "res.company"),
        targetId: selectedTarget?.entityId || 0,
        targetLabel: selectedTarget?.label || "",
      });

      setTitle("");
      setDescription("");
      setTargetId("");
      setCategory("other");
      setSeverity("medium");
      setFormSuccess(`Reporte de ${targetType} creado correctamente.`);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "No se pudo crear el reporte.");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily:
          "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        backgroundColor: colors.background.primary,
      }}
    >
      <style>{globalStyles(t)}</style>

      <AdminSidebar navItems={ADMIN_NAV_ITEMS} />

      <main style={{ flex: 1, overflow: "auto", padding: "32px 28px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <ReportesHeader estadisticas={estadisticas} />
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(320px, 1.3fr) minmax(280px, 0.9fr)",
              gap: 20,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                background: colors.background.secondary,
                border: `1px solid ${colors.border}`,
                borderRadius: 18,
                padding: 22,
                boxShadow: `0 8px 24px ${colors.shadow}`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: colors.text.primary }}>
                    Crear reportes de usuarios y empresas
                  </h2>
                  <p style={{ margin: "6px 0 0", fontSize: 14, color: colors.text.secondary }}>
                    Registra incidencias administrativas asociadas a usuarios o empresas desde este panel.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
                {(["usuario", "empresa"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setTargetType(option);
                      setTargetId("");
                      setFormError(null);
                      setFormSuccess(null);
                    }}
                    style={{
                      borderRadius: 999,
                      border: `1px solid ${targetType === option ? colors.brand[600] : colors.border}`,
                      background: targetType === option ? colors.brand[100] : "#fff",
                      color: targetType === option ? colors.brand[600] : colors.text.secondary,
                      padding: "10px 16px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {option === "usuario" ? "Reporte de usuario" : "Reporte de empresa"}
                  </button>
                ))}
              </div>

              <form onSubmit={handleCreateAdminReport} style={{ display: "grid", gap: 14, marginTop: 18 }}>
                <select
                  value={targetId}
                  onChange={(event) => setTargetId(event.target.value)}
                  disabled={usersLoading || companiesLoading}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: `1px solid ${colors.border}`,
                    background: "#fff",
                    color: colors.text.primary,
                  }}
                >
                  <option value="">
                    {usersLoading || companiesLoading
                      ? "Cargando opciones..."
                      : targetType === "usuario"
                        ? "Selecciona un usuario"
                        : "Selecciona una empresa"}
                  </option>
                  {targetOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value as (typeof categoryOptions)[number]["value"])}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: `1px solid ${colors.border}`,
                      background: "#fff",
                      color: colors.text.primary,
                    }}
                  >
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <select
                    value={severity}
                    onChange={(event) => setSeverity(event.target.value as (typeof severityOptions)[number]["value"])}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: `1px solid ${colors.border}`,
                      background: "#fff",
                      color: colors.text.primary,
                    }}
                  >
                    {severityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        Severidad {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder={`Título del reporte de ${targetType}`}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: `1px solid ${colors.border}`,
                    background: "#fff",
                    color: colors.text.primary,
                  }}
                />

                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Describe el motivo del reporte y las acciones sugeridas."
                  rows={5}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: `1px solid ${colors.border}`,
                    background: "#fff",
                    color: colors.text.primary,
                    resize: "vertical",
                  }}
                />

                {formError ? (
                  <div
                    style={{
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: `1px solid ${colors.estado.error.main}`,
                      background: colors.estado.error.bg,
                      color: colors.estado.error.text,
                      fontSize: 14,
                    }}
                  >
                    {formError}
                  </div>
                ) : null}

                {formSuccess ? (
                  <div
                    style={{
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: `1px solid ${colors.estado.success.main}`,
                      background: colors.estado.success.bg,
                      color: colors.estado.success.text,
                      fontSize: 14,
                    }}
                  >
                    {formSuccess}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={creating}
                  style={{
                    border: "none",
                    borderRadius: 12,
                    padding: "13px 18px",
                    background: colors.brand[600],
                    color: "#fff",
                    fontWeight: 700,
                    cursor: creating ? "wait" : "pointer",
                    opacity: creating ? 0.75 : 1,
                  }}
                >
                  {creating ? "Creando reporte..." : `Crear reporte de ${targetType}`}
                </button>
              </form>
            </div>

            <aside
              style={{
                background: colors.background.secondary,
                border: `1px solid ${colors.border}`,
                borderRadius: 18,
                padding: 22,
                boxShadow: `0 8px 24px ${colors.shadow}`,
              }}
            >
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: colors.text.primary }}>
                Reportes administrativos recientes
              </h2>
              <p style={{ margin: "6px 0 18px", fontSize: 14, color: colors.text.secondary }}>
                Últimos reportes creados para usuarios y empresas.
              </p>

              <div style={{ display: "grid", gap: 12 }}>
                {recentAdminReports.length === 0 ? (
                  <div
                    style={{
                      padding: "16px 14px",
                      borderRadius: 12,
                      border: `1px dashed ${colors.border}`,
                      color: colors.text.secondary,
                      fontSize: 14,
                    }}
                  >
                    Todavía no hay reportes administrativos creados.
                  </div>
                ) : (
                  recentAdminReports.map((report) => (
                    <article
                      key={report.id}
                      style={{
                        padding: "14px 16px",
                        borderRadius: 14,
                        border: `1px solid ${colors.border}`,
                        background: colors.background.alt,
                      }}
                    >
                      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: colors.text.primary }}>
                        {report.title}
                      </h3>
                      <p style={{ margin: "6px 0 0", fontSize: 13, color: colors.text.secondary }}>
                        {report.status} · {report.severity} · {new Date(report.createdAt).toLocaleDateString("es-DO")}
                      </p>
                    </article>
                  ))
                )}
              </div>
            </aside>
          </section>

          <section
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
              marginBottom: 24,
              padding: "20px 22px",
              borderRadius: 18,
              background: colors.background.secondary,
              border: `1px solid ${colors.border}`,
              boxShadow: `0 8px 24px ${colors.shadow}`,
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 700,
                  color: colors.text.primary,
                }}
              >
                Exportar reportes de usuarios y empresas
              </h2>
              <p style={{ margin: "6px 0 0", fontSize: 14, color: colors.text.secondary }}>
                {creating
                  ? "Actualizando reportes administrativos..."
                  : `${adminReports.length} reporte${adminReports.length === 1 ? "" : "s"} administrativo${adminReports.length === 1 ? "" : "s"} disponible${adminReports.length === 1 ? "" : "s"} para descargar en PDF o Excel`}
              </p>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => exportAdminReportsToPdf(adminReports)}
                disabled={creating}
                style={{
                  border: "none",
                  borderRadius: 12,
                  padding: "12px 18px",
                  background: "#172033",
                  color: "#ffffff",
                  fontWeight: 700,
                  cursor: creating ? "not-allowed" : "pointer",
                  opacity: creating ? 0.65 : 1,
                }}
              >
                {creating ? "Preparando..." : "Descargar PDF"}
              </button>
              <button
                type="button"
                onClick={() => exportAdminReportsToExcel(adminReports)}
                disabled={creating}
                style={{
                  borderRadius: 12,
                  padding: "12px 18px",
                  background: "#ffffff",
                  color: colors.text.primary,
                  fontWeight: 700,
                  border: `1px solid ${colors.border}`,
                  cursor: creating ? "not-allowed" : "pointer",
                  opacity: creating ? 0.65 : 1,
                }}
              >
                {creating ? "Preparando..." : "Descargar Excel"}
              </button>
            </div>
          </section>
          <ReportesFilters
            filtros={filtros}
            onChange={setFiltros}
            totalResultados={reportes.length}
          />
          <ReportesTable
            reportes={reportes}
            isLoading={isLoading}
            onSelectReporte={seleccionarReporte}
          />
        </div>
      </main>

      <ReporteDetailModal
        reporte={reporteSeleccionado}
        isOpen={modalAbierto}
        onClose={cerrarModal}
        onCambiarEstado={cambiarEstado}
        onGuardarNota={guardarNota}
      />
    </div>
  );
}
