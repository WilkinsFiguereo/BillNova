"use client";

import React, { useMemo } from "react";
import type { BillnovaUser, ResUser, UserModalState } from "../types/user.types";
import { colors, font, radius } from "../theme/tokens";

interface UsersTableProps {
  resUsers: ResUser[];
  billnovaUsers: BillnovaUser[];
  deleting: number | null;
  onDelete: (resUserId: number) => Promise<void>;
  onModalOpen: (s: UserModalState) => void;
}

export function UsersTable({ resUsers, billnovaUsers, deleting, onDelete, onModalOpen }: UsersTableProps) {
  const roleByResId = useMemo(() => {
    const map = new Map<number, BillnovaUser>();
    for (const b of billnovaUsers) map.set(b.res_user_id, b);
    return map;
  }, [billnovaUsers]);

  return (
    <section
      style={{
        background: colors.bg.secondary,
        borderRadius: radius.lg,
        border: `1px solid ${colors.border}`,
        overflow: "hidden",
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "90px 1.2fr 1.4fr 160px 140px 220px", gap: 10, padding: "12px 14px", background: colors.bg.alt, borderBottom: `1px solid ${colors.border}` }}>
        {["ID", "Nombre", "Email", "Rol", "Estado", "Acciones"].map((h) => (
          <div key={h} style={{ fontSize: 12, fontWeight: 700, color: colors.text.disabled, letterSpacing: ".08em", textTransform: "uppercase" }}>
            {h}
          </div>
        ))}
      </div>

      {resUsers.length === 0 ? (
        <div style={{ padding: 24, textAlign: "center", color: colors.text.disabled, fontSize: font.size.base }}>
          No hay usuarios para mostrar.
        </div>
      ) : (
        resUsers.map((u) => {
          const b = roleByResId.get(u.id);
          const role = b?.role ?? "--";
          return (
            <div
              key={u.id}
              style={{
                display: "grid",
                gridTemplateColumns: "90px 1.2fr 1.4fr 160px 140px 220px",
                gap: 10,
                padding: "12px 14px",
                borderBottom: `1px solid ${colors.border}`,
                alignItems: "center",
              }}
            >
              <div style={{ fontSize: 13, color: colors.text.secondary }}>{u.id}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: colors.text.primary }}>{u.name}</div>
              <div style={{ fontSize: 13, color: colors.text.secondary }}>{u.email}</div>
              <div style={{ fontSize: 13, color: colors.text.secondary, textTransform: "capitalize" }}>{role}</div>
              <div style={{ fontSize: 13, color: u.active ? colors.success.text : colors.text.disabled }}>
                {u.active ? "Activo" : "Inactivo"}
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => onModalOpen({ open: true, mode: "view", userId: u.id })}
                  style={{ padding: "8px 10px", borderRadius: radius.md, border: `1px solid ${colors.border}`, background: colors.bg.secondary, cursor: "pointer" }}
                >
                  Ver
                </button>
                <button
                  type="button"
                  onClick={() => onModalOpen({ open: true, mode: "edit", userId: u.id })}
                  style={{ padding: "8px 10px", borderRadius: radius.md, border: `1px solid ${colors.brand[200]}`, background: colors.brand[50], color: colors.brand[700], cursor: "pointer", fontWeight: 600 }}
                >
                  Editar
                </button>
                <button
                  type="button"
                  disabled={deleting === u.id}
                  onClick={() => onDelete(u.id)}
                  style={{
                    padding: "8px 10px",
                    borderRadius: radius.md,
                    border: `1px solid #FECACA`,
                    background: colors.error.soft,
                    color: colors.error.text,
                    cursor: deleting === u.id ? "not-allowed" : "pointer",
                    fontWeight: 600,
                    opacity: deleting === u.id ? 0.7 : 1,
                  }}
                >
                  {deleting === u.id ? "Eliminando..." : "Eliminar"}
                </button>
              </div>
            </div>
          );
        })
      )}
    </section>
  );
}

