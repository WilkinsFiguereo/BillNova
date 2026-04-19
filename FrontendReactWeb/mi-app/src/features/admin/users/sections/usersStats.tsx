"use client";

import React, { useMemo } from "react";
import type { BillnovaUser, ResUser } from "../types/user.types";
import { colors, radius } from "../theme/tokens";

interface UsersStatsProps {
  resUsers: ResUser[];
  billnovaUsers: BillnovaUser[];
}

export function UsersStats({ resUsers, billnovaUsers }: UsersStatsProps) {
  const stats = useMemo(() => {
    const total = resUsers.length;
    const activos = resUsers.filter((u) => u.active).length;
    const byRole = new Map<string, number>();
    for (const b of billnovaUsers) {
      const role = b.role ?? "unknown";
      byRole.set(role, (byRole.get(role) ?? 0) + 1);
    }
    const topRole = [...byRole.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "--";

    return { total, activos, topRole };
  }, [resUsers, billnovaUsers]);

  const cardStyle: React.CSSProperties = {
    background: colors.bg.secondary,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.lg,
    padding: 16,
  };

  return (
    <section style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, margin: "14px 0 18px" }}>
      <div style={cardStyle}>
        <div style={{ fontSize: 12, color: colors.text.disabled }}>Total</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: colors.text.primary, marginTop: 6 }}>{stats.total}</div>
      </div>
      <div style={cardStyle}>
        <div style={{ fontSize: 12, color: colors.text.disabled }}>Activos</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: colors.text.primary, marginTop: 6 }}>{stats.activos}</div>
      </div>
      <div style={cardStyle}>
        <div style={{ fontSize: 12, color: colors.text.disabled }}>Rol más común</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: colors.text.primary, marginTop: 6, textTransform: "capitalize" }}>
          {stats.topRole}
        </div>
      </div>
    </section>
  );
}

