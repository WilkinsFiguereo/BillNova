"use client";

import React, { useMemo, useState } from "react";
import type { UserModalMode } from "../types/user.types";
import { colors, radius } from "../theme/tokens";

interface UserFormProps {
  mode: UserModalMode;
  userId?: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function UserForm({ mode, userId, onSuccess, onCancel }: UserFormProps) {
  const isReadOnly = mode === "view";
  const title = useMemo(() => {
    if (mode === "create") return "Crear usuario";
    if (mode === "edit") return `Editar usuario #${userId ?? ""}`;
    return `Detalle usuario #${userId ?? ""}`;
  }, [mode, userId]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess();
  };

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: colors.text.primary }}>{title}</div>

      <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, color: colors.text.secondary }}>
        Nombre
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isReadOnly}
          style={{ padding: "10px 12px", borderRadius: radius.md, border: `1px solid ${colors.border}`, background: colors.bg.secondary }}
        />
      </label>

      <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, color: colors.text.secondary }}>
        Email
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isReadOnly}
          type="email"
          style={{ padding: "10px 12px", borderRadius: radius.md, border: `1px solid ${colors.border}`, background: colors.bg.secondary }}
        />
      </label>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
        <button type="button" onClick={onCancel} style={{ padding: "10px 12px", borderRadius: radius.md, border: `1px solid ${colors.border}`, background: colors.bg.secondary, cursor: "pointer" }}>
          Cerrar
        </button>
        {mode !== "view" && (
          <button type="submit" style={{ padding: "10px 12px", borderRadius: radius.md, border: "none", background: colors.brand[600], color: "#fff", cursor: "pointer", fontWeight: 700 }}>
            Guardar
          </button>
        )}
      </div>
    </form>
  );
}

