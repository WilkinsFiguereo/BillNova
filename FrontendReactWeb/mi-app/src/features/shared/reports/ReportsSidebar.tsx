"use client";

import Link from "next/link";

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
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 24 }}>BillNova</div>
      <Link href={backHref} style={{ color: "#8fc0ff", textDecoration: "none" }}>
        {backLabel}
      </Link>
    </aside>
  );
}
