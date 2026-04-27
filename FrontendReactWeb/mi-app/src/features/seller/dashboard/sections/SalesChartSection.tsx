"use client";

import React from "react";
import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { dashboardTheme as t } from "../theme/dashboard.theme";

interface SalesChartSectionProps {
  fechaLabel: string;
  resumenLabel: string;
}

export function SalesChartSection({
  fechaLabel,
  resumenLabel,
}: SalesChartSectionProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 28,
        animation: "slideIn 0.4s ease",
      }}
    >
      <div>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: t.textPrimary,
            letterSpacing: "-0.02em",
          }}
        >
          Panel Principal
        </h1>
        <p style={{ fontSize: 13, color: t.textSecondary, marginTop: 4 }}>
          {fechaLabel} - <span style={{ color: t.success }}>Sistema operativo</span>
        </p>
        <p style={{ fontSize: 12, color: t.textDisabled, marginTop: 6 }}>
          {resumenLabel}
        </p>
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Link href="/navigation/seller/bill" className="btn-secondary">
          <FileText size={15} /> Ver Factura
        </Link>
        <Link href="/navigation/seller/product" className="btn-primary">
          <Plus size={15} /> Agregar Producto
        </Link>
      </div>
    </div>
  );
}
