"use client";
import React from "react";
import { colors, font, radius } from "../theme/tokens";

interface UsersHeaderProps {
  query:         string;
  onQueryChange: (q: string) => void;
  onAddClick:    () => void;
}

export function UsersHeader({ query, onQueryChange, onAddClick }: UsersHeaderProps) {
  return (
    <div style={{
      display:        "flex",
      alignItems:     "center",
      justifyContent: "space-between",
      marginBottom:   28,
      gap:            16,
      flexWrap:       "wrap",
    }}>
      <div>
        <h1 style={{
          margin:     0,
          fontSize:   font.sizes["2xl"],
          fontWeight: font.weights.bold,
          color:      colors.text.primary,
        }}>
          Usuarios
        </h1>
        <p style={{
          margin:    "4px 0 0",
          fontSize:  font.sizes.base,
          color:     colors.text.tertiary,
        }}>
          Gestión de usuarios del sistema
        </p>
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        {/* Search */}
        <input
          type="search"
          placeholder="Buscar por nombre, email o rol…"
          value={query}
          onChange={e => onQueryChange(e.target.value)}
          style={{
            padding:      "8px 14px",
            background:   colors.bg.secondary,
            border:       `1px solid ${colors.border}`,
            borderRadius: radius.md,
            color:        colors.text.primary,
            fontSize:     font.sizes.base,
            fontFamily:   font.family,
            outline:      "none",
            width:        260,
          }}
        />

        {/* Add button */}
        <button
          onClick={onAddClick}
          style={{
            padding:      "8px 18px",
            background:   colors.accent,
            border:       "none",
            borderRadius: radius.md,
            color:        "#fff",
            fontSize:     font.sizes.base,
            fontWeight:   font.weights.semibold,
            fontFamily:   font.family,
            cursor:       "pointer",
            whiteSpace:   "nowrap",
          }}
        >
          + Nuevo usuario
        </button>
      </div>
    </div>
  );
}