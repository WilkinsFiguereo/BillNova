"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, ArrowLeft } from "lucide-react";
import { SidebarSettingsSection } from "@/features/shared/sidebar/SidebarSettingsSection";

interface ReportsSidebarProps {
  backHref: string;
  backLabel: string;
}

export function ReportsSidebar({ backHref, backLabel }: ReportsSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      id: "back",
      Icon: ArrowLeft,
      label: backLabel,
      href: backHref,
    },
    {
      id: "reports",
      Icon: FileText,
      label: "Reportes",
      href: pathname, // Stay on current page
    },
  ];

  return (
    <aside
      style={{
        width: 280,
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
      {/* Logo/Brand */}
      <div
        style={{
          padding: "24px 20px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <h1
          style={{
            color: "var(--text-primary)",
            fontSize: 20,
            fontWeight: 700,
            margin: 0,
          }}
        >
          BillNova
        </h1>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: 12,
            margin: "4px 0 0 0",
          }}
        >
          Sistema de Reportes
        </p>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "20px 0" }}>
        {navItems.map((item) => {
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
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: "0 20px 18px" }}>
        <SidebarSettingsSection compact />
      </div>
    </aside>
  );
}
