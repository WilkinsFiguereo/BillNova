"use client";

import React from "react";
import { AdminSidebar } from "@/features/admin/dashboard/ui/AdminSidebar";
import { ADMIN_NAV_ITEMS } from "@/features/admin/dashboard/data/adminNavigation.data";
import { dashboardTheme as t, globalStyles } from "@/features/seller/dashboard/theme/dashboard.theme";
import { useReportStore } from "@/features/shared/reports/core/useReportStore";
import { ReportsModerationPanel } from "@/features/shared/reports/ui/ReportsModerationPanel";

export default function Page() {
  const { reports, update, remove } = useReportStore();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: t.bgMain, color: t.textPrimary, fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <style>{globalStyles(t)}</style>
      <AdminSidebar navItems={ADMIN_NAV_ITEMS} />
      <main style={{ flex: 1, overflow: "auto", padding: "32px" }}>
        <div style={{ marginBottom: 18 }}>
          <h1 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: t.textDisabled, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Admin
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: 22, fontWeight: 900, color: t.textPrimary }}>
            Reportes (ver y editar)
          </p>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: t.textSecondary }}>
            El admin no crea reportes desde aqui: solo revisa, cambia estado y agrega notas.
          </p>
        </div>

        <ReportsModerationPanel
          reports={reports}
          canEdit
          allowedKinds={["user", "seller"]}
          onUpdate={(id, patch) => {
            update(id, patch);
          }}
          onDelete={(id) => {
            remove(id);
          }}
        />
      </main>
    </div>
  );
}
