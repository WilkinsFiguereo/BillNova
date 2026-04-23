"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield } from "lucide-react";
import { NavItemData } from "../data/usersNavigation.data";
import { colors, font } from "../theme/tokens";
import { UserProfileSidebarSection } from "@/features/admin/dashboard/ui/UserProfileSidebarSection";
import { SidebarSettingsSection } from "@/features/shared/sidebar/SidebarSettingsSection";

interface UsersSidebarProps {
  navItems: NavItemData[];
}

export function UsersSidebar({ navItems }: UsersSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: 220,
        minHeight: "100vh",
        background: colors.bg.secondary,
        borderRight: `1px solid ${colors.border}`,
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        fontFamily: font.family,
      }}
    >
      <div
        style={{
          padding: "0 8px 28px",
          borderBottom: `1px solid ${colors.border}`,
          marginBottom: 12,
        }}
      >
        <Link href="/navigation/admin/dashboard/page" style={{ textDecoration: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                background: `linear-gradient(135deg, ${colors.accent}, #818cf8)`,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
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

      <nav style={{ flex: 1 }}>
        {navItems.map(item => {
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display:      "flex",
                alignItems:   "center",
                gap:          10,
                padding:      "10px 16px",
                fontSize:     font.sizes.base,
                fontWeight:   active ? font.weights.semibold : font.weights.normal,
                color:        active ? colors.accent : colors.text.secondary,
                background:   active ? colors.accent + "18" : "transparent",
                borderRadius: 10,
                textDecoration: "none",
                transition:   "background .15s, color .15s",
                marginBottom: 4,
              }}
            >
              <item.Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <SidebarSettingsSection compact />

      {/* User Profile Section */}
      <UserProfileSidebarSection />
    </aside>
  );
}
