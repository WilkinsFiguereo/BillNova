"use client";

import React from "react";
import { SettingsSidebar } from "@/features/shared/sidebar/SettingsSidebar";
import { ReportProblemForm } from "@/features/shared/reports/ReportProblemForm";
import { getStoredAuthState } from "@/features/auth/login";

export default function ReportProblemPage() {
  const user = getStoredAuthState();
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-main)", color: "var(--text-primary)" }}>
      <SettingsSidebar />
      <main style={{ flex: 1, marginLeft: 280, padding: "32px 24px" }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <ReportProblemForm
            kind="user"
            reporter={{
              name: user?.name ?? "Usuario",
              email: user?.email ?? undefined,
              role: user?.role ?? "user",
            }}
            title="Reportar un problema con mi pedido"
            subtitle="Ejemplos: pedido no llego, llego danado, llego tarde, producto equivocado."
          />
        </div>
      </main>
    </div>
  );
}
