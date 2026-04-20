"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, FileText, MessageSquareWarning, SlidersHorizontal } from "lucide-react";
import { getLandingRouteForRole } from "@/features/auth/login/navigation";
import { getStoredAuthState } from "@/features/auth/login";

interface SettingsSidebarProps {
  width?: number;
}

export function SettingsSidebar({ width = 280 }: SettingsSidebarProps) {
  const pathname = usePathname();

  const backHref = useMemo(() => {
    const user = getStoredAuthState();
    return getLandingRouteForRole(user?.role ?? null);
  }, []);

  const configHref = useMemo(() => {
    const user = getStoredAuthState();
    const role = user?.role ?? null;
    if (role === "admin") return "/navigation/admin/configuracion/page";
    if (role === "moderation") return "/navigation/moderation/config/page";
    return "/navigation/seller/company_config/page";
  }, []);

  const termsHref = useMemo(() => {
    const user = getStoredAuthState();
    const role = user?.role ?? null;
    const from = role === "admin" ? "admin" : role === "moderation" ? "moderation" : "seller";
    return `/navigation/terms?from=${from}&returnTo=${encodeURIComponent(configHref)}`;
  }, [configHref]);

  const items = [
    { id: "back", href: backHref, label: "Volver", Icon: ArrowLeft },
    { id: "settings", href: configHref, label: "Configuracion", Icon: SlidersHorizontal },
    { id: "report", href: "/navigation/report-problem", label: "Reportar problema", Icon: MessageSquareWarning },
    { id: "terms", href: termsHref, label: "Terminos", Icon: FileText },
  ];

  return (
    <aside
      style={{
        width,
        backgroundColor: "var(--bg-card)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        height: "100vh",
        left: 0,
        top: 0,
        zIndex: 10,
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div style={{ padding: "22px 20px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ color: "var(--text-primary)", fontSize: 18, fontWeight: 900, margin: 0 }}>
          BillNova
        </div>
        <div style={{ color: "var(--text-secondary)", fontSize: 12, marginTop: 4 }}>
          Ajustes y soporte
        </div>
      </div>

      <nav style={{ flex: 1, padding: "18px 0" }}>
        {items.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.Icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 20px",
                color: isActive ? "var(--brand-600)" : "var(--text-secondary)",
                textDecoration: "none",
                backgroundColor: isActive ? "var(--bg-alt)" : "transparent",
                borderRight: isActive ? "3px solid var(--brand-600)" : "3px solid transparent",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "var(--bg-alt)";
                  e.currentTarget.style.color = "var(--text-primary)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }
              }}
            >
              <Icon size={18} />
              <span style={{ fontSize: 14, fontWeight: 600 }}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
