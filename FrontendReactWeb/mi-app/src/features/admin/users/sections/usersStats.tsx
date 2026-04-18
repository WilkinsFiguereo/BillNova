"use client";
import React from "react";
import { colors, font, radius } from "../theme/tokens";

interface UsersStatsProps {
  totalRes:      number;
  totalBillnova: number;
  activeCount:   number;
  inactiveCount: number;
}

interface StatCardProps {
  label: string;
  value: number;
  accent?: string;
}

function StatCard({ label, value, accent }: StatCardProps) {
  return (
    <div style={{
      flex:         1,
      minWidth:     140,
      padding:      "18px 22px",
      background:   colors.bg.secondary,
      borderRadius: radius.lg,
      border:       `1px solid ${colors.border}`,
    }}>
      <p style={{ margin: 0, fontSize: font.sizes.sm, color: colors.text.tertiary, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </p>
      <p style={{ margin: "6px 0 0", fontSize: font.sizes["2xl"], fontWeight: font.weights.bold, color: accent ?? colors.text.primary }}>
        {value}
      </p>
    </div>
  );
}

export function UsersStats({ totalRes, totalBillnova, activeCount, inactiveCount }: UsersStatsProps) {
  return (
    <div style={{ display: "flex", gap: 14, marginBottom: 28, flexWrap: "wrap" }}>
      <StatCard label="Usuarios RES"      value={totalRes} />
      <StatCard label="Usuarios Billnova" value={totalBillnova} />
      <StatCard label="Activos"           value={activeCount}   accent={colors.success} />
      <StatCard label="Inactivos"         value={inactiveCount} accent={colors.text.tertiary} />
    </div>
  );
}