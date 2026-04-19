"use client";

import type { ReactNode } from "react";

export function SharedReportsPage({ sidebar }: { sidebar: ReactNode }) {
  return (
    <main style={{ display: "grid", gridTemplateColumns: "280px 1fr", minHeight: "100vh", background: "#0b1220" }}>
      <aside style={{ borderRight: "1px solid rgba(255,255,255,0.08)" }}>
        {sidebar}
      </aside>
      <section style={{ padding: 24, color: "rgba(255,255,255,0.9)" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Reportes</h1>
        <p style={{ color: "rgba(255,255,255,0.65)" }}>
          Módulo en construcción.
        </p>
      </section>
    </main>
  );
}

