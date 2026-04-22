"use client";

import type { ReactNode } from "react";
import type { Reporte } from "@/features/moderator/report_moderation/types/reportes.types";
import { exportInvoicesToExcel, exportInvoicesToPdf, getInvoiceCount } from "./invoiceExport";

export function SharedReportsPage({
  sidebar,
  reportes = [],
  isLoading = false,
}: {
  sidebar?: ReactNode;
  reportes?: Reporte[];
  isLoading?: boolean;
}) {
  const invoiceCount = getInvoiceCount(reportes);

  const exportOptions = [
    {
      title: "Facturas en PDF",
      description: "Genera facturas listas para descargar, imprimir o compartir con el cliente en formato PDF.",
      accent: "#dbeafe",
      border: "#93c5fd",
      buttonLabel: "Descargar PDF",
      onClick: () => exportInvoicesToPdf(reportes),
    },
    {
      title: "Facturas en Excel",
      description: "Exporta las facturas en Excel para revisiones contables, filtros avanzados y consolidaci\u00f3n de datos.",
      accent: "#dcfce7",
      border: "#86efac",
      buttonLabel: "Descargar Excel",
      onClick: () => exportInvoicesToExcel(reportes),
    },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#f5f7fb", color: "#172033" }}>
      {sidebar}
      <main style={{ flex: 1, padding: 32 }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>Reportes</h1>
          <p style={{ margin: "8px 0 0", color: "#5f6b85", maxWidth: 640 }}>
            Desde esta secci\u00f3n se pueden generar facturas en PDF y Excel para facilitar la entrega,
            consulta y control administrativo.
          </p>
          <p style={{ margin: "10px 0 0", color: "#334155", fontWeight: 600 }}>
            {isLoading
              ? "Cargando facturas disponibles..."
              : `${invoiceCount} factura${invoiceCount === 1 ? "" : "s"} lista${invoiceCount === 1 ? "" : "s"} para exportar`}
          </p>

          <section
            style={{
              marginTop: 32,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 20,
            }}
          >
            {exportOptions.map((option) => (
              <article
                key={option.title}
                style={{
                  padding: 24,
                  borderRadius: 20,
                  background: "#ffffff",
                  border: `1px solid ${option.border}`,
                  boxShadow: "0 18px 40px rgba(15, 23, 42, 0.06)",
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: option.accent,
                    display: "grid",
                    placeItems: "center",
                    fontSize: 22,
                    marginBottom: 16,
                  }}
                >
                  {option.title.includes("PDF") ? "PDF" : "XLS"}
                </div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{option.title}</h2>
                <p style={{ margin: "10px 0 0", color: "#5f6b85", lineHeight: 1.6 }}>{option.description}</p>
                <button
                  type="button"
                  onClick={option.onClick}
                  disabled={isLoading}
                  style={{
                    marginTop: 18,
                    border: "none",
                    borderRadius: 12,
                    padding: "12px 16px",
                    background: "#172033",
                    color: "#ffffff",
                    fontWeight: 700,
                    cursor: isLoading ? "not-allowed" : "pointer",
                    opacity: isLoading ? 0.6 : 1,
                    width: "100%",
                  }}
                >
                  {isLoading ? "Preparando..." : option.buttonLabel}
                </button>
              </article>
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}
