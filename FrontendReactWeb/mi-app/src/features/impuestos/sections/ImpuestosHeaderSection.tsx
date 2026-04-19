"use client";

import React from "react";
import { Plus, RefreshCw, Receipt } from "lucide-react";
import { dashboardTheme as t } from "../../../seller/dashboard/theme/dashboard.theme";

interface ImpuestosHeaderSectionProps {
  onSyncOdoo: () => void;
}

export function ImpuestosHeaderSection({ onSyncOdoo }: ImpuestosHeaderSectionProps) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 28,
    }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: t.brand100,
            color: t.brand600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <Receipt size={18} />
          </div>
          <h1 style={{
            fontSize: 26,
            fontWeight: 700,
            color: t.textPrimary,
            letterSpacing: "-0.02em",
            margin: 0,
          }}>
            Impuestos
          </h1>
        </div>
        <p style={{ fontSize: 13, color: t.textSecondary, marginTop: 2, marginLeft: 46 }}>
          Gestión de impuestos RD
        </p>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button className="btn-secondary" onClick={onSyncOdoo}>
          <RefreshCw size={15} /> Sincronizar Odoo
        </button>
        <button className="btn-primary">
          <Plus size={15} /> Nuevo Impuesto
        </button>
      </div>
    </div>
  );
}