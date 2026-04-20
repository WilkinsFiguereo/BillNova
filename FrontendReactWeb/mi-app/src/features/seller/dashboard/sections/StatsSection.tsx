"use client";

import React from "react";
import { StatCard } from "../ui/StatCard";
import { STATS_DATA } from "../data/chart.data";

interface StatsSectionProps {
  totalGanado?: number;
  totalPerdido?: number;
  porMes?: number;
  stockCritico?: number;
  loading?: boolean;
}

function formatCurrency(value: number): string {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value.toFixed(2)}`;
}

export function StatsSection({
  totalGanado = 0,
  totalPerdido = 0,
  porMes = 0,
  stockCritico = 0,
  loading = false,
}: StatsSectionProps) {
  const values = [
    formatCurrency(totalGanado),
    formatCurrency(totalPerdido),
    formatCurrency(porMes),
    String(stockCritico),
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
      {STATS_DATA.map((stat, i) => (
        <StatCard key={stat.label} stat={stat} value={loading ? "..." : values[i]} />
      ))}
    </div>
  );
}
