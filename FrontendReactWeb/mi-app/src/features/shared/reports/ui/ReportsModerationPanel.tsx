"use client";

import React, { useMemo, useState } from "react";
import type { Report, ReportKind, ReportSeverity, ReportStatus } from "../core/report.types";

const STATUS: { value: ReportStatus; label: string }[] = [
  { value: "open", label: "Abierto" },
  { value: "seen", label: "Visto" },
  { value: "in-progress", label: "En proceso" },
  { value: "resolved", label: "Hecho" },
  { value: "closed", label: "Cerrado" },
];

const SEVERITY: { value: ReportSeverity; label: string }[] = [
  { value: "low", label: "Bajo" },
  { value: "medium", label: "Medio" },
  { value: "high", label: "Alto" },
  { value: "critical", label: "Critico" },
];

const KIND_LABEL: Record<ReportKind, string> = {
  user: "Usuario",
  seller: "Seller",
  bug: "Moderador",
};

interface ReportsModerationPanelProps {
  reports: Report[];
  canEdit: boolean;
  onUpdate: (id: string, patch: { status?: ReportStatus; severity?: ReportSeverity; notes?: string }) => void;
  onDelete?: (id: string) => void;
  allowedKinds?: ReportKind[];
}

export function ReportsModerationPanel({
  reports,
  canEdit,
  onUpdate,
  onDelete,
  allowedKinds = ["user", "seller", "bug"],
}: ReportsModerationPanelProps) {
  const [filter, setFilter] = useState<ReportKind | "all">("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reports.filter((r) => {
      if (!allowedKinds.includes(r.kind)) return false;
      if (filter !== "all" && r.kind !== filter) return false;
      if (!q) return true;
      return (
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        (r.reporter.name ?? "").toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
      );
    });
  }, [allowedKinds, filter, query, reports]);

  return (
    <section style={{ marginTop: 16 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por titulo, categoria, reporter..."
          style={{
            flex: 1,
            minWidth: 240,
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid var(--border)",
            background: "var(--bg-card)",
            color: "var(--text-primary)",
            outline: "none",
          }}
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid var(--border)",
            background: "var(--bg-card)",
            color: "var(--text-primary)",
            outline: "none",
          }}
        >
          <option value="all">Todos</option>
          {allowedKinds.includes("user") && <option value="user">Usuarios</option>}
          {allowedKinds.includes("seller") && <option value="seller">Sellers</option>}
          {allowedKinds.includes("bug") && <option value="bug">Moderador</option>}
        </select>
      </div>

      <div style={{ marginTop: 12, overflowX: "auto", border: "1px solid var(--border)", borderRadius: 16, background: "var(--bg-card)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 920 }}>
          <thead>
            <tr style={{ background: "var(--bg-alt)", borderBottom: "1px solid var(--border)" }}>
              {["Tipo", "Titulo", "Categoria", "Severidad", "Estado", "Reporter", "Notas", "Acciones"].map((h) => (
                <th key={h} style={{ textAlign: "left", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", padding: "12px 14px", color: "var(--text-secondary)" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: 18, color: "var(--text-secondary)" }}>
                  No hay reportes.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px 14px", fontWeight: 800, color: "var(--text-primary)" }}>
                    {KIND_LABEL[r.kind]}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ fontWeight: 800, color: "var(--text-primary)" }}>{r.title}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4, maxWidth: 380 }}>
                      {r.description.slice(0, 120)}{r.description.length > 120 ? "..." : ""}
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px", color: "var(--text-secondary)", fontSize: 13 }}>
                    {r.category}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    {canEdit ? (
                      <select
                        value={r.severity}
                        onChange={(e) => onUpdate(r.id, { severity: e.target.value as ReportSeverity })}
                        style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-primary)" }}
                      >
                        {SEVERITY.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    ) : (
                      <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>{r.severity}</span>
                    )}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    {canEdit ? (
                      <select
                        value={r.status}
                        onChange={(e) => onUpdate(r.id, { status: e.target.value as ReportStatus })}
                        style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-primary)" }}
                      >
                        {STATUS.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    ) : (
                      <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>{r.status}</span>
                    )}
                  </td>
                  <td style={{ padding: "12px 14px", color: "var(--text-secondary)", fontSize: 13 }}>
                    {r.reporter.name}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    {canEdit ? (
                      <input
                        value={r.notes ?? ""}
                        onChange={(e) => onUpdate(r.id, { notes: e.target.value })}
                        placeholder="Nota interna"
                        style={{
                          width: 240,
                          padding: "8px 10px",
                          borderRadius: 10,
                          border: "1px solid var(--border)",
                          background: "var(--bg-card)",
                          color: "var(--text-primary)",
                          outline: "none",
                        }}
                      />
                    ) : (
                      <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>{r.notes ?? ""}</span>
                    )}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    {canEdit && onDelete ? (
                      <button
                        type="button"
                        onClick={() => {
                          const ok = window.confirm("Eliminar este reporte?");
                          if (ok) onDelete(r.id);
                        }}
                        style={{
                          padding: "8px 10px",
                          borderRadius: 10,
                          border: "1px solid rgba(239,68,68,0.35)",
                          background: "rgba(239,68,68,0.08)",
                          color: "var(--text-primary)",
                          cursor: "pointer",
                          fontWeight: 800,
                        }}
                      >
                        Eliminar
                      </button>
                    ) : (
                      <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
