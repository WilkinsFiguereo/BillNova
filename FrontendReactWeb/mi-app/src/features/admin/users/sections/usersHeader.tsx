"use client";

import React from "react";
import { colors, font, radius } from "../theme/tokens";

interface UsersHeaderProps {
  total: number;
  query: string;
  onSearch: (q: string) => void;
  onCreateNew: () => void;
}

export function UsersHeader({ total, query, onSearch, onCreateNew }: UsersHeaderProps) {
  return (
    <header style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, letterSpacing: "-0.4px", color: colors.text.primary }}>
            Usuarios
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: font.size.sm, color: colors.text.disabled }}>
            Total: <strong style={{ color: colors.text.secondary }}>{total}</strong>
          </p>
        </div>

        <button
          type="button"
          onClick={onCreateNew}
          style={{
            border: "none",
            borderRadius: radius.md,
            padding: "10px 14px",
            background: colors.brand[600],
            color: "#fff",
            fontWeight: font.weight.semibold,
            cursor: "pointer",
          }}
        >
          Nuevo usuario
        </button>
      </div>

      <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
        <input
          value={query}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Buscar por nombre, email, rol o ID..."
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: radius.md,
            border: `1px solid ${colors.border}`,
            background: colors.bg.secondary,
            outline: "none",
            fontSize: font.size.base,
          }}
        />
      </div>
    </header>
  );
}

