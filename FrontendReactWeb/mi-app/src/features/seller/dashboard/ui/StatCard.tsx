"use client";

import React from "react";
import { StatCardData } from "../data/chart.data";
import { dashboardTheme as t } from "../theme/dashboard.theme";

interface StatCardProps {
  stat: StatCardData;
  value?: string;
}

export function StatCard({ stat, value }: StatCardProps) {
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
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div
          style={{
            width: 42, height: 42, borderRadius: 12,
            background: stat.bg,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: stat.color,
          }}
        >
          <Icon size={20} />
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={{
          fontSize: 28, fontWeight: 700, color: t.textPrimary,
          letterSpacing: "-0.03em", fontFamily: "'DM Mono', monospace",
        }}>
          {value || stat.value}
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