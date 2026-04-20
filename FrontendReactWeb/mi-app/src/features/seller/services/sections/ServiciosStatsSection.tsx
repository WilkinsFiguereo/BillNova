"use client";

import React from "react";
import { Briefcase, CheckCircle2, XCircle, Repeat } from "lucide-react";
import type { Servicio } from "../types/servicios.types";
import { serviciosTheme as t } from "../theme/servicios.theme";
import { ServicioStatCard } from "../ui/ServicioUI";

export function ServiciosStatsSection({ servicios }: { servicios: Servicio[] }) {
  const total = servicios.length;
  const activos = servicios.filter((s) => s.status === "activo").length;
  const inactivos = servicios.filter((s) => s.status === "inactivo").length;
  const frecuencias = new Set(servicios.map((s) => s.pagoFrecuencia)).size;

  const stats = [
    {
      label: "Total Servicios",
      value: String(total),
      Icon: Briefcase,
      delta: "En catálogo",
      color: t.brand400,
      bg: t.brand100,
    },
    {
      label: "Activos",
      value: String(activos),
      Icon: CheckCircle2,
      delta: "Disponibles",
      color: t.success,
      bg: t.successBg,
    },
    {
      label: "Inactivos",
      value: String(inactivos),
      Icon: XCircle,
      delta: "Ocultos",
      color: t.error,
      bg: t.errorBg,
    },
    {
      label: "Frecuencias",
      value: String(frecuencias),
      Icon: Repeat,
      delta: "Planes",
      color: t.warning,
      bg: t.warningBg,
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 16,
        marginBottom: 24,
        animation: "slideIn 0.5s ease 0.1s both",
      }}
    >
      {stats.map((stat) => (
        <ServicioStatCard key={stat.label} stat={stat} />
      ))}
    </div>
  );
}

