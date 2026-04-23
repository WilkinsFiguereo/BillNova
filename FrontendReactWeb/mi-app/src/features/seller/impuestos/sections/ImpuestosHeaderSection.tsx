"use client";

import React from "react";
import { Plus, RefreshCw, Receipt } from "lucide-react";
import { impuestosTheme as t } from "../theme/impuestos.theme";

interface ImpuestosHeaderSectionProps {
  total: number;
  onNuevo: () => void;
  onExportar?: () => void;
  onSincronizar: () => void;
  sincronizando: boolean;
  canManage?: boolean;
}

export function ImpuestosHeaderSection({
  total,
  onNuevo,
  onSincronizar,
  sincronizando,
  canManage = true,
}: ImpuestosHeaderSectionProps) {
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
            width: 36, height: 36, borderRadius: 10,
            background: t.brand100, color: t.brand600,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Receipt size={18} />
          </div>
          <h1 style={{
            fontSize: 26, fontWeight: 700, color: t.textPrimary,
            letterSpacing: "-0.02em", margin: 0,
          }}>
            Impuestos
          </h1>
        </div>
        <p style={{ fontSize: 13, color: t.textSecondary, marginTop: 2, marginLeft: 46 }}>
          Gestion de impuestos RD · {total} registros
        </p>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={onSincronizar}
          disabled={sincronizando}
          className="btn-secondary"
          style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "9px 16px", borderRadius: 9,
            border: `1px solid ${t.border}`,
            background: "white", cursor: sincronizando ? "not-allowed" : "pointer",
            fontSize: 13, fontWeight: 600, color: t.textSecondary,
            opacity: sincronizando ? 0.7 : 1,
          }}
        >
          <RefreshCw
            size={14}
            style={{ animation: sincronizando ? "spin 1s linear infinite" : "none" }}
          />
          {sincronizando ? "Sincronizando..." : "Sincronizar Odoo"}
        </button>

        {canManage ? (
          <button
            onClick={onNuevo}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "9px 18px", borderRadius: 9,
              background: t.brand600, color: "white",
              border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 700,
              boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
            }}
          >
            <Plus size={15} />
            Nuevo Impuesto
          </button>
        ) : null}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
