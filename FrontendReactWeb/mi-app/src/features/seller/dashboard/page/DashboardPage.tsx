"use client";

import React from "react";
import { useDashboard } from "../hooks/useDashboard";
import { dashboardTheme as t, globalStyles } from "../theme/dashboard.theme";
import { NAV_ITEMS } from "../data/chart.data";
import { Sidebar, Toast } from "../dashboards";
import { SalesChartSection } from "../sections/SalesChartSection";
import { StatsSection } from "../sections/StatsSection";
import { UsersTableSection } from "../sections/UsersTableSection";

export default function DashboardPage() {
  const {
    search,
    toastVisible,
    toastMsg,
    filteredProducts,
    totalProducts,
    stats,
    meta,
    loading,
    error,
    setSearch,
    showToast,
  } = useDashboard();

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
        <SalesChartSection
          fechaLabel={meta.fechaLabel}
          resumenLabel={meta.resumenLabel}
        />

        {error && (
          <div
            style={{
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              color: "#991B1B",
              borderRadius: 12,
              padding: "14px 16px",
              marginBottom: 16,
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        <StatsSection
          totalGanado={stats.totalGanado}
          totalPerdido={stats.totalPerdido}
          porMes={stats.porMes}
          stockCritico={stats.stockCritico}
          loading={loading}
        />

        <UsersTableSection
          products={filteredProducts}
          search={search}
          onSearchChange={setSearch}
          onAction={showToast}
          totalCount={totalProducts}
        />
      </main>

      <Toast message={toastMsg} visible={toastVisible} />
    </div>
  );
}
