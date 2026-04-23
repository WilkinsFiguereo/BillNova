"use client";

import React from "react";
import { Calculator, Percent, Shield, Ban } from "lucide-react";
import type { ImpuestosStats } from "../types/impuestos.types";
import { dashboardTheme as t } from "../../../seller/dashboard/theme/dashboard.theme";

interface ImpuestosStatsSectionProps {
  stats: ImpuestosStats;
}

function StatCard({ label, value, delta, Icon, color, bg }: {
  label: string;
  value: string;
  delta: string;
  Icon: React.ElementType;
  color: string;
  bg: string;
}) {
  return (
    <div style={{
      borderRadius: 16,
      padding: "20px 24px",
      background: "white",
      border: `1px solid ${t.border}`,
      transition: "all 0.2s ease",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          background: bg,
          color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <Icon size={20} />
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        <div style={{
          fontSize: 28,
          fontWeight: 700,
          color: t.textPrimary,
          letterSpacing: "-0.03em",
          fontFamily: "'DM Mono', monospace",
        }}>
          {value}
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: t.textSecondary, marginTop: 2 }}>
          {label}
        </div>
        <div style={{ fontSize: 11, color, marginTop: 4, fontWeight: 500 }}>
          {delta}
        </div>
      </div>
    </div>
  );
}

export function ImpuestosStatsSection({ stats }: ImpuestosStatsSectionProps) {
  const cards = [
    {
      label: "Total Impuestos",
      value: String(stats.total),
      delta: "Registros configurados",
      Icon: Calculator,
      color: t.brand400,
      bg: t.brand100,
    },
    {
      label: "Activos",
      value: String(stats.activos),
      delta: "Aplicando actualmente",
      Icon: Percent,
      color: t.success,
      bg: t.successBg,
    },
    {
      label: "Retenciones",
      value: String(stats.retenciones),
      delta: "Configured",
      Icon: Shield,
      color: t.warning,
      bg: t.warningBg,
    },
    {
      label: "Exentos",
      value: String(stats.exentos),
      delta: "Sin aplicación",
      Icon: Ban,
      color: t.error,
      bg: t.errorBg,
    },
  ];

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: 16,
      marginBottom: 24,
    }}>
      {cards.map(card => <StatCard key={card.label} {...card} />)}
    </div>
  );
}