"use client";

import React from "react";
import { Package } from "lucide-react";
import { reportesTheme as t } from "../theme/reportes.theme";
import type { ClienteTop, ProductoTop } from "../types/reportes.types";
import { formatCurrency } from "../hooks/useReportes";

interface ReportesTablesSectionProps {
  productos: ProductoTop[];
  clientes: ClienteTop[];
}

function EmptyState({ message }: { message: string }) {
  return (
    <div
      style={{
        padding: "20px 16px",
        borderRadius: 12,
        background: t.bgAlt,
        color: t.textDisabled,
        fontSize: 12,
        textAlign: "center",
      }}
    >
      {message}
    </div>
  );
}

function ProductosTopTable({ productos }: { productos: ProductoTop[] }) {
  const maxIngresos = productos.length > 0 ? Math.max(...productos.map((p) => p.ingresos)) : 0;

  return (
    <div
      style={{
        background: "white",
        borderRadius: 16,
        border: `1px solid ${t.border}`,
        padding: "24px",
        flex: 1,
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: t.textPrimary }}>Productos top</h2>
        <p style={{ fontSize: 12, color: t.textDisabled, marginTop: 4 }}>
          Por ingresos generados en el periodo
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {productos.length === 0 && (
          <EmptyState message="Aun no hay productos vendidos en este periodo." />
        )}

        {productos.map((producto, index) => (
          <div key={`${producto.nombre}-${index}`}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 8,
                    background: index === 0 ? t.brand600 : t.bgAlt,
                    color: index === 0 ? "white" : t.textDisabled,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {index + 1}
                </div>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: t.brand100,
                    color: t.brand600,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Package size={15} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary }}>
                    {producto.nombre}
                  </div>
                  <div style={{ fontSize: 11, color: t.textDisabled }}>
                    {producto.categoria} - {producto.unidades} unid.
                  </div>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: t.textPrimary,
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  {formatCurrency(producto.ingresos)}
                </div>
                <div style={{ fontSize: 11, color: t.textDisabled }}>
                  {producto.porcentaje}% del total
                </div>
              </div>
            </div>

            <div style={{ height: 4, background: t.bgAlt, borderRadius: 4 }}>
              <div
                style={{
                  height: "100%",
                  borderRadius: 4,
                  width: `${maxIngresos > 0 ? (producto.ingresos / maxIngresos) * 100 : 0}%`,
                  background: index === 0 ? t.brand400 : t.brand100,
                  transition: "width 0.5s ease",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClientesTopTable({ clientes }: { clientes: ClienteTop[] }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 16,
        border: `1px solid ${t.border}`,
        padding: "24px",
        flex: 1,
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: t.textPrimary }}>Clientes principales</h2>
        <p style={{ fontSize: 12, color: t.textDisabled, marginTop: 4 }}>
          Por volumen de compra en el periodo
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {clientes.length === 0 && (
          <EmptyState message="Aun no hay clientes con compras en este periodo." />
        )}

        {clientes.map((cliente) => (
          <div
            key={`${cliente.nombre}-${cliente.email}`}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px",
              borderRadius: 10,
              background: t.bgAlt,
              transition: "background 0.15s",
            }}
            className="table-row"
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${t.brand600}, ${t.brand400})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: 13,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {cliente.nombre.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary }}>
                  {cliente.nombre}
                </div>
                <div style={{ fontSize: 11, color: t.textDisabled }}>{cliente.email}</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: t.textPrimary,
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  {formatCurrency(cliente.total)}
                </div>
                <div style={{ fontSize: 11, color: t.textDisabled }}>
                  {cliente.facturas} facturas
                </div>
              </div>
              <span
                style={{
                  padding: "3px 10px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 700,
                  background: cliente.status === "activo" ? t.successBg : t.bgAlt,
                  color: cliente.status === "activo" ? t.success : t.textDisabled,
                }}
              >
                {cliente.status === "activo" ? "Activo" : "Inactivo"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReportesTablesSection({ productos, clientes }: ReportesTablesSectionProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16,
        animation: "slideIn 0.5s ease 0.2s both",
      }}
    >
      <ProductosTopTable productos={productos} />
      <ClientesTopTable clientes={clientes} />
    </div>
  );
}
