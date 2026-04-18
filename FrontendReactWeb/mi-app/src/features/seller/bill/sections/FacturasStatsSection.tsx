"use client";

import React from "react";
import { DollarSign, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { OdooStats } from "../hooks/useFacturas";
import { facturasTheme as t } from "../theme/facturas.theme";

interface FacturasStatsSectionProps {
  stats: OdooStats | null;
}

function StatCard({
  label, value, delta, Icon, color, bg,
}: {
  label: string;
  value: string;
  delta: string;
  Icon: React.ElementType;
  color: string;
  bg: string;
}) {
  return (
    <div style={{
      borderRadius: 16, padding: "20px 24px",
      background: "white", border: `1px solid ${t.border}`,
      transition: "all 0.2s ease",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12,
          background: bg, color: color,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={20} />
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        <div style={{
          fontSize: 28, fontWeight: 700, color: t.textPrimary,
          letterSpacing: "-0.03em", fontFamily: "'DM Mono', monospace",
        }}>
          {value}
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: t.textSecondary, marginTop: 2 }}>
          {label}
        </div>
        <div style={{ fontSize: 11, color: color, marginTop: 4, fontWeight: 500 }}>
          {delta}
        </div>
      </div>
    </div>
  );
}

function fmt(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

export function FacturasStatsSection({ stats }: FacturasStatsSectionProps) {
  if (!stats) {
    // Skeleton
    return (
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
        gap: 16, marginBottom: 24,
      }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{
            borderRadius: 16, padding: "20px 24px",
            background: "white", border: `1px solid ${t.border}`,
            height: 120,
            background: "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.4s infinite",
          }} />
        ))}
        <style>{`
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </div>
    );
  }

  const cards = [
    {
      label: "Total Facturado",
      value: fmt(stats.totalFacturado),
      delta: `${stats.pagadas.count + stats.pendientes.count + stats.borradores.count + stats.vencidas.count} facturas en total`,
      Icon: DollarSign,
      color: t.brand400,
      bg: t.brand100,
    },
    {
      label: "Facturas Pagadas",
      value: String(stats.pagadas.count),
      delta: `${fmt(stats.pagadas.amount)} cobrados`,
      Icon: CheckCircle,
      color: "#059669",
      bg: "#ECFDF5",
    },
    {
      label: "Pendientes de Cobro",
      value: String(stats.pendientes.count),
      delta: `${fmt(stats.pendientes.amount)} por cobrar`,
      Icon: Clock,
      color: "#D97706",
      bg: "#FFFBEB",
    },
    {
      label: "Facturas Vencidas",
      value: String(stats.vencidas.count),
      delta: `${fmt(stats.vencidas.amount)} en riesgo`,
      Icon: AlertCircle,
      color: "#DC2626",
      bg: "#FEF2F2",
    },
  ];

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
      gap: 16, marginBottom: 24,
      animation: "slideIn 0.5s ease 0.1s both",
    }}>
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
}