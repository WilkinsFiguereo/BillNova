"use client";

import React from "react";
import Link from "next/link";
import { Settings } from "lucide-react";
import { getStoredAuthState } from "@/features/auth/login";

interface SidebarSettingsSectionProps {
  compact?: boolean;
  href?: string;
}

export function SidebarSettingsSection({
  compact = false,
  href,
}: SidebarSettingsSectionProps) {
  const configHref = React.useMemo(() => {
    if (href) return href;
    const user = getStoredAuthState();
    const role = user?.role ?? null;
    if (role === "admin") return "/navigation/admin/configuracion/page";
    if (role === "moderation") return "/navigation/moderation/config/page";
    return "/navigation/seller/company_config/page";
  }, [href]);

  return (
    <div style={{ marginTop: 12 }}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: "0.12em",
          color: "var(--text-disabled)",
          padding: "0 8px",
          marginBottom: 8,
          textTransform: "uppercase",
        }}
      >
        Configuracion
      </div>

      <Link
        href={configHref}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: compact ? "10px 12px" : "12px 14px",
          borderRadius: 12,
          border: "1px solid var(--border)",
          background: "var(--bg-card)",
          color: "var(--text-primary)",
          textDecoration: "none",
          fontSize: compact ? 13 : 14,
          fontWeight: 700,
        }}
      >
        <Settings size={16} />
        Ajustes
      </Link>
    </div>
  );
}
