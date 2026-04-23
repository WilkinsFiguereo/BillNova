"use client";

import React from "react";
import { serviciosTheme as t } from "../theme/servicios.theme";
import type { PagoFrecuencia, ServicioStatus } from "../types/servicios.types";
import type { LucideIcon } from "lucide-react";

export function ServicioStatCard({
  stat,
}: {
  stat: { label: string; value: string; Icon: LucideIcon; delta: string; color: string; bg: string };
}) {
  const { Icon } = stat;
  return (
    <div
      style={{
        borderRadius: 16,
        padding: "20px 24px",
        background: "white",
        border: `1px solid ${t.border}`,
        transition: "all 0.2s ease",
      }}
      className="stat-card"
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: stat.bg,
            color: stat.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={20} />
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: t.textPrimary,
            letterSpacing: "-0.03em",
            fontFamily: "'DM Mono', monospace",
          }}
        >
          {stat.value}
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: t.textSecondary, marginTop: 2 }}>
          {stat.label}
        </div>
        <div style={{ fontSize: 11, color: stat.color, marginTop: 4, fontWeight: 500 }}>
          {stat.delta}
        </div>
      </div>
    </div>
  );
}

export function Toast({ message, visible }: { message: string; visible: boolean }) {
  if (!visible) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        background: t.brand600,
        color: "white",
        padding: "12px 20px",
        borderRadius: 12,
        fontSize: 13,
        fontWeight: 500,
        boxShadow: "0 8px 24px rgba(30,58,138,0.3)",
        animation: "toastIn 0.3s ease",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      {message}
    </div>
  );
}

export function PagoFrecuenciaBadge({ frecuencia }: { frecuencia: PagoFrecuencia }) {
  const map: Record<PagoFrecuencia, { label: string; color: string; bg: string }> = {
    unico: { label: "Único", color: t.brand600, bg: t.brand100 },
    diario: { label: "Diario", color: t.success, bg: t.successBg },
    semanal: { label: "Semanal", color: t.brand400, bg: t.brand100 },
    quincenal: { label: "Cada 15 días", color: t.warning, bg: t.warningBg },
    mensual: { label: "Mensual", color: t.success, bg: t.successBg },
    anual: { label: "Anual", color: t.textSecondary, bg: t.bgAlt },
  };
  const s = map[frecuencia];
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.03em",
        whiteSpace: "nowrap",
      }}
    >
      {s.label}
    </span>
  );
}

export function StatusBadge({ status }: { status: ServicioStatus }) {
  const map: Record<ServicioStatus, { label: string; color: string; bg: string }> = {
    activo: { label: "Activo", color: t.success, bg: t.successBg },
    inactivo: { label: "Inactivo", color: t.error, bg: t.errorBg },
  };
  const s = map[status];
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.03em",
        whiteSpace: "nowrap",
      }}
    >
      {s.label}
    </span>
  );
}

