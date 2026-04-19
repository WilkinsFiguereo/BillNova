"use client";

import Link from "next/link";

export function ReportsSidebar({
  backHref,
  backLabel,
}: {
  backHref: string;
  backLabel: string;
}) {
  return (
    <div style={{ padding: 16, color: "rgba(255,255,255,0.9)" }}>
      <Link href={backHref} style={{ color: "rgba(255,255,255,0.85)", textDecoration: "none" }}>
        ← {backLabel}
      </Link>
      <div style={{ marginTop: 16, fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
        Reportes (beta)
      </div>
    </div>
  );
}

