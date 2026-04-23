"use client";

import type { ReactNode } from "react";

export function SharedReportsPage({ sidebar }: { sidebar?: ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#f5f7fb", color: "#172033" }}>
      {sidebar}
      <main style={{ flex: 1, padding: 32 }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>Reportes</h1>
          <p style={{ margin: "8px 0 0", color: "#5f6b85" }}>Vista compartida de reportes.</p>
        </div>
      </main>
    </div>
  );
}
