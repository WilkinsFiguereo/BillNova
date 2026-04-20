"use client";

import React from "react";
import { ReporteStatCardUI } from "../ui/ReporteUI";
import { ReporteStatCard } from "../types/reportes.types";

interface ReportesStatsSectionProps {
  stats: ReporteStatCard[];
}

export function ReportesStatsSection({ stats }: ReportesStatsSectionProps) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
      gap: 16, marginBottom: 24,
      animation: "slideIn 0.5s ease 0.1s both",
    }}>
      {stats.map((stat) => (
        <ReporteStatCardUI key={stat.label} stat={stat} />
      ))}
    </div>
  );
}
