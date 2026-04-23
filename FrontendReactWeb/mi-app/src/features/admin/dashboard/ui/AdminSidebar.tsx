"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield } from "lucide-react";
import { colors, font } from "../../users/theme/tokens";
import { UserProfileSidebarSection } from "./UserProfileSidebarSection";
import type { AdminNavItemData } from "../data/adminNavigation.data";

interface AdminSidebarProps {
  navItems: AdminNavItemData[];
}

export function AdminSidebar({ navItems }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: 220,
        background: colors.bg.secondary,
        borderRight: `1px solid ${colors.border}`,
        display: "flex",
        flexDirection: "column",
        padding: "24px 16px",
        position: "sticky",
        top: 0,
        height: "100vh",
        fontFamily: font.family,
      }}
    >
      {/* Logo */}
      <div style={{ padding: "0 8px 28px", borderBottom: `1px solid ${colors.border}` }}>
        <Link href="/navigation/admin/dashboard/page" style={{ textDecoration: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                background: colors.bg.alt ?? "#EFF6FF",
                borderRadius: 999,
                border: `1px solid ${colors.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: colors.accent,
              }}
            >
              <Shield size={18} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: colors.text.primary }}>
                BillNova
              </div>
              <div style={{ fontSize: 10, color: colors.text.tertiary, letterSpacing: "0.05em" }}>
                BUSINESS
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Nav Links */}
      <nav
        style={{
          marginTop: 20,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link key={item.id} href={item.href} style={{ textDecoration: "none" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 16px",
                  borderRadius: 10,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  fontSize: 14,
                  fontWeight: 500,
                  color: isActive ? colors.accent : colors.text.secondary,
                  background: isActive ? "#E5EDFF" : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLDivElement).style.background = colors.bg.alt ?? "#F3F4F6";
                    (e.currentTarget as HTMLDivElement).style.color = colors.text.primary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLDivElement).style.background = "transparent";
                    (e.currentTarget as HTMLDivElement).style.color = colors.text.secondary;
                  }
                }}
              >
                <item.Icon size={18} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Avatar */}
      <UserProfileSidebarSection />
    </aside>
  );
}
