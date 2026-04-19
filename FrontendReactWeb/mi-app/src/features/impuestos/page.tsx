"use client";

import React from "react";

import { useImpuestos } from "./hooks/useImpuestos";
import { ImpuestosHeaderSection } from "./sections/ImpuestosHeaderSection";
import { ImpuestosStatsSection } from "./sections/ImpuestosStatsSection";
import { ImpuestosCalculadorSection } from "./sections/ImpuestosCalculadorSection";
import { ImpuestosTableSection } from "./sections/ImpuestosTableSection";

import { Sidebar, Toast } from "../seller/dashboard/dashboards";
import { NAV_ITEMS } from "../seller/dashboard/data/chart.data";
import { dashboardTheme as t, globalStyles } from "../seller/dashboard/theme/dashboard.theme";

export default function ImpuestosPage() {
  const {
    impuestos,
    filteredImpuestos,
    stats,
    search,
    filtroTipo,
    toastVisible,
    toastMsg,
    setSearch,
    setFiltroTipo,
    crear,
    editar,
    eliminar,
    syncOdoo,
  } = useImpuestos();

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
        <ImpuestosHeaderSection onSyncOdoo={syncOdoo} />

        <ImpuestosStatsSection stats={stats} />

        <ImpuestosCalculadorSection />

        <ImpuestosTableSection
          impuestos={filteredImpuestos}
          search={search}
          filtroTipo={filtroTipo}
          onSearchChange={setSearch}
          onFiltroTipoChange={setFiltroTipo}
          onCrear={crear}
          onEditar={editar}
          onEliminar={eliminar}
          totalCount={impuestos.length}
        />
      </main>

      <Toast message={toastMsg} visible={toastVisible} />
    </div>
  );
}