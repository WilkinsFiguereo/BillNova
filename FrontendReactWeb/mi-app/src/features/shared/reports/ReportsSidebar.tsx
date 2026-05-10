"use client";

import Link from "next/link";
import { BrandBadge } from "@/components/BrandBadge";

interface ReportsSidebarProps {
  backHref: string;
  backLabel: string;
}

export function ReportsSidebar({ backHref, backLabel }: ReportsSidebarProps) {
  return (
    <aside
      style={{
        width: 260,
        minHeight: "100vh",
        padding: 24,
        background: "#0d1628",
        color: "#eef4ff",
        borderRight: "1px solid #1c2a44",
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <BrandBadge
          href={backHref}
          title="BillNova"
          subtitle="CENTRO DE REPORTES"
          titleColor="#eef4ff"
          subtitleColor="#8fc0ff"
        />
      </div>
      <Link href={backHref} style={{ color: "#8fc0ff", textDecoration: "none" }}>
        {backLabel}
      </Link>
    </aside>
  );
}
