"use client";

import React, { useState } from "react";
import { Calculator } from "lucide-react";
import { dashboardTheme as t } from "../../../seller/dashboard/theme/dashboard.theme";
import { calcularImpuesto } from "../../hooks/useImpuestos";

export function ImpuestosCalculadorSection() {
  const [base, setBase] = useState(0);
  const [tasa, setTasa] = useState(18);
  const [aplicaItbis, setAplicaItbis] = useState(true);

  const preview = calcularImpuesto(base, tasa, aplicaItbis);

  return (
    <div style={{
      background: "white",
      borderRadius: 16,
      border: `1px solid ${t.border}`,
      padding: 24,
      marginBottom: 24,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <Calculator size={20} color={t.brand600} />
        <h3 style={{ fontSize: 18, fontWeight: 600, color: t.textPrimary, margin: 0 }}>
          Calculadora de Impuestos
        </h3>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: t.textSecondary, display: "block", marginBottom: 6 }}>
            Base Imponible (RD$)
          </label>
          <input
            type="number"
            value={base}
            onChange={(e) => setBase(Number(e.target.value))}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: 10,
              border: `1px solid ${t.border}`,
              fontSize: 14,
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: t.textSecondary, display: "block", marginBottom: 6 }}>
            Tasa (%)
          </label>
          <input
            type="number"
            value={tasa}
            onChange={(e) => setTasa(Number(e.target.value))}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: 10,
              border: `1px solid ${t.border}`,
              fontSize: 14,
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: t.textSecondary, display: "block", marginBottom: 6 }}>
            Aplicar ITBIS
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
            <input
              type="checkbox"
              checked={aplicaItbis}
              onChange={(e) => setAplicaItbis(e.target.checked)}
            />
            <span style={{ fontSize: 14 }}>Sumar ITBIS 18%</span>
          </label>
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 16,
        marginTop: 20,
        paddingTop: 20,
        borderTop: `1px solid ${t.border}`,
      }}>
        <div>
          <div style={{ fontSize: 11, color: t.textSecondary }}>Base</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: t.textPrimary }}>
            RD$ {preview.base.toLocaleString()}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: t.textSecondary }}>ITBIS</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: t.warning }}>
            RD$ {preview.itbis.toLocaleString()}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: t.textSecondary }}>Impuesto</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: t.error }}>
            RD$ {preview.impuesto.toLocaleString()}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: t.textSecondary }}>Total</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: t.brand600 }}>
            RD$ {preview.total.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}