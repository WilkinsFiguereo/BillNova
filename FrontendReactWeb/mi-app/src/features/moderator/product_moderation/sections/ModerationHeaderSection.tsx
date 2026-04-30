"use client";

import React from "react";
import { CheckCircle, Clock, Package, XCircle } from "lucide-react";
import { moderationTheme as t } from "../theme/moderation.theme";
import { ModerationStatCardUI } from "../ui/ModerationUI";
import { ModerationCounters, ModerationStatCard } from "../types/moderation.types";

export function ModerationHeaderSection({ contadores }: { contadores: ModerationCounters }) {
  const stats: ModerationStatCard[] = [
    {
      label: "Pendientes",
      value: String(contadores.pending),
      Icon: Clock,
      delta: "Requieren revision",
      color: t.warning,
      bg: t.warningBg,
    },
    {
      label: "Aprobados",
      value: String(contadores.approved),
      Icon: CheckCircle,
      delta: "Publicados correctamente",
      color: t.success,
      bg: t.successBg,
    },
    {
      label: "Rechazados",
      value: String(contadores.rejected),
      Icon: XCircle,
      delta: "Con observaciones",
      color: t.error,
      bg: t.errorBg,
    },
    {
      label: "Total revisados",
      value: String(contadores.todos),
      Icon: Package,
      delta: "Catalogo moderado",
      color: t.brand400,
      bg: t.brand100,
    },
  ];

  return (
    <div style={{ marginBottom: 28, animation: "slideIn 0.4s ease" }}>
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: t.textPrimary,
            letterSpacing: "-0.02em",
          }}
        >
          Moderación de Productos
        </h1>
        <p style={{ fontSize: 13, color: t.textSecondary, marginTop: 4 }}>
          Revisa y aprueba los productos subidos por los vendedores antes de
          publicarlos.
        </p>
      </div>

      {/* Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          animation: "slideIn 0.5s ease 0.1s both",
        }}
      >
        {stats.map((stat) => (
          <ModerationStatCardUI key={stat.label} stat={stat} />
        ))}
      </div>
    </div>
  );
}
