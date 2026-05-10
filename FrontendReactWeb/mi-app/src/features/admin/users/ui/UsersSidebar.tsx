"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandBadge } from "@/components/BrandBadge";
import { NavItemData } from "../data/usersNavigation.data";
import { colors, font } from "../theme/tokens";
import { UserProfileSidebarSection } from "@/features/admin/dashboard/ui/UserProfileSidebarSection";

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
        <BrandBadge
          href="/navigation/admin/dashboard/page"
          title="BillNova"
          subtitle="GESTION INTERNA"
          titleColor={colors.text.primary}
          subtitleColor={colors.text.tertiary}
        />
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

      {/* User Profile Section */}
      <UserProfileSidebarSection />
    </aside>
  );
}
