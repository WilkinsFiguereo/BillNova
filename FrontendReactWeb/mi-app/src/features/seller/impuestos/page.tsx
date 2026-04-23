"use client";

import React from "react";
import { Sidebar, Toast } from "../dashboard/dashboards";
import { NAV_ITEMS } from "../dashboard/data/chart.data";
import { dashboardTheme as t, globalStyles } from "../dashboard/theme/dashboard.theme";
import { useImpuestos } from "./hooks/useImpuestos";
import { ImpuestosCalculadorSection } from "./sections/ImpuestosCalculadorSection";
import { ImpuestosHeaderSection } from "./sections/ImpuestosHeaderSection";
import { ImpuestosStatsSection } from "./sections/ImpuestosStatsSection";
import { ImpuestosTableSection } from "./sections/ImpuestosTableSection";
import { getActiveCompanyId } from "@/features/seller/shared/companySession";
import { getStoredAuthState } from "@/features/auth/login/data/storage";

export default function ImpuestosPage() {
  const companyId = typeof window !== "undefined" ? getActiveCompanyId() ?? undefined : undefined;
  const canManage = getStoredAuthState()?.role !== "worker";

  const {
    impuestos,
    impuestosFiltrados,
    stats,
    loading,
    search,
    setSearch,
    filtroTipo,
    setFiltroTipo,
    filtroAlcance,
    setFiltroAlcance,
    vistaMode,
    setVistaMode,
    ordenCampo,
    ordenDir,
    toggleOrden,
    modalOpen,
    editando,
    formData,
    setFormData,
    saving,
    abrirCrear,
    abrirEditar,
    cerrarModal,
    guardar,
    eliminar,
    toggleActivo,
    calcBase,
    setCalcBase,
    calcSelected,
    setCalcSelected,
    calcPreview,
    toastVisible,
    toastMsg,
    toastType,
    showToast,
    fetchImpuestos,
  } = useImpuestos(companyId);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        background: t.bgMain,
        color: t.textPrimary,
      }}
    >
      <style>{globalStyles(t)}</style>

      <Sidebar navItems={NAV_ITEMS} />

      <main style={{ flex: 1, overflow: "auto", padding: "32px" }}>
        <ImpuestosHeaderSection
          total={impuestosFiltrados.length}
          onNuevo={abrirCrear}
          onExportar={() => showToast("Exportando impuestos...", "info")}
          onSincronizar={fetchImpuestos}
          sincronizando={loading}
          canManage={canManage}
        />

        <ImpuestosStatsSection stats={stats} />

        <ImpuestosCalculadorSection
          impuestos={impuestos}
          calcBase={calcBase}
          setCalcBase={setCalcBase}
          calcSelected={calcSelected}
          setCalcSelected={setCalcSelected}
          calcPreview={calcPreview}
        />

        <ImpuestosTableSection
          impuestos={impuestosFiltrados}
          search={search}
          filtroTipo={filtroTipo}
          filtroAlcance={filtroAlcance}
          vistaMode={vistaMode}
          ordenCampo={ordenCampo}
          ordenDir={ordenDir}
          totalCount={impuestos.length}
          modalOpen={modalOpen}
          editando={editando}
          formData={formData}
          saving={saving}
          onSearchChange={setSearch}
          onFiltroTipoChange={setFiltroTipo}
          onFiltroAlcanceChange={setFiltroAlcance}
          onVistaModeChange={setVistaMode}
          onToggleOrden={toggleOrden}
          onEditar={abrirEditar}
          onEliminar={eliminar}
          onToggleActivo={toggleActivo}
          onOpenModal={abrirCrear}
          onCloseModal={cerrarModal}
          onGuardar={guardar}
          setFormData={setFormData}
          canManage={canManage}
        />
      </main>

      <Toast message={toastMsg} visible={toastVisible} />
    </div>
  );
}
