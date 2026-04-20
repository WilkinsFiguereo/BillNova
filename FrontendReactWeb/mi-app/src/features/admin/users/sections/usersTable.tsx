"use client";
import React from "react";
import { colors, font, radius } from "../theme/tokens";
import type { ResUser, BillnovaUser } from "../types/user.types";

interface UsersTableProps {
  resUsers: ResUser[];
  billnovaUsers: BillnovaUser[];
  activeTab: "res" | "billnova";
  onTabChange: (tab: "res" | "billnova") => void;
  deleting: number | null;
  onDelete: (id: number) => void;
  onEdit: (id: number, userType: "res" | "billnova") => void;
  onView: (id: number, userType: "res" | "billnova") => void;
}

type Tab = "res" | "billnova";

const th: React.CSSProperties = {
  padding: "10px 14px",
  textAlign: "left",
  fontSize: font.sizes.sm,
  fontWeight: font.weights.semibold,
  color: colors.text.tertiary,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  borderBottom: `1px solid ${colors.border}`,
  whiteSpace: "nowrap",
};

const td: React.CSSProperties = {
  padding: "12px 14px",
  fontSize: font.sizes.base,
  color: colors.text.primary,
  borderBottom: `1px solid ${colors.border}22`,
  verticalAlign: "middle",
};

function Badge({ active }: { active: boolean }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: radius.full,
        fontSize: font.sizes.xs,
        fontWeight: font.weights.semibold,
        background: active ? colors.success + "22" : colors.text.tertiary + "22",
        color: active ? colors.success : colors.text.tertiary,
        border: `1px solid ${active ? colors.success + "55" : colors.text.tertiary + "33"}`,
      }}
    >
      {active ? "Activo" : "Inactivo"}
    </span>
  );
}

function UserRow({
  user,
  userType,
  deleting,
  onDelete,
  onEdit,
  onView,
}: {
  user: ResUser | BillnovaUser;
  userType: "res" | "billnova";
  deleting: number | null;
  onDelete: (id: number) => void;
  onEdit: (id: number, userType: "res" | "billnova") => void;
  onView: (id: number, userType: "res" | "billnova") => void;
}) {
  const isDeleting = deleting === user.id;
  const isInactive = !user.active;

  return (
    <tr>
      <td style={td}>{user.name}</td>
      <td style={{ ...td, color: colors.text.secondary }}>{user.email}</td>
      <td style={td}>{user.role}</td>
      <td style={td}>
        <Badge active={user.active} />
      </td>
      <td style={{ ...td, textAlign: "right" }}>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <button
            onClick={() => onView(user.id, userType)}
            style={{
              padding: "5px 10px",
              background: "transparent",
              border: `1px solid ${colors.text.tertiary}55`,
              borderRadius: radius.md,
              color: colors.text.tertiary,
              fontSize: font.sizes.sm,
              fontFamily: font.family,
              cursor: "pointer",
            }}
          >
            Ver
          </button>
          <button
            onClick={() => onEdit(user.id, userType)}
            style={{
              padding: "5px 10px",
              background: "transparent",
              border: `1px solid ${colors.accent}55`,
              borderRadius: radius.md,
              color: colors.accent,
              fontSize: font.sizes.sm,
              fontFamily: font.family,
              cursor: "pointer",
            }}
          >
            Editar
          </button>
          <button
            onClick={() => onDelete(user.id)}
            disabled={isDeleting || isInactive}
            style={{
              padding: "5px 10px",
              background: "transparent",
              border: `1px solid ${colors.error}55`,
              borderRadius: radius.md,
              color: colors.error,
              fontSize: font.sizes.sm,
              fontFamily: font.family,
              cursor: isDeleting || isInactive ? "not-allowed" : "pointer",
              opacity: isDeleting || isInactive ? 0.5 : 1,
            }}
          >
            {isDeleting ? "..." : isInactive ? "Deshabilitado" : "Deshabilitar"}
          </button>
        </div>
      </td>
    </tr>
  );
}

function Table({
  users,
  userType,
  deleting,
  onDelete,
  onEdit,
  onView,
}: {
  users: (ResUser | BillnovaUser)[];
  userType: "res" | "billnova";
  deleting: number | null;
  onDelete: (id: number) => void;
  onEdit: (id: number, userType: "res" | "billnova") => void;
  onView: (id: number, userType: "res" | "billnova") => void;
}) {
  if (!users.length) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: 48,
          color: colors.text.tertiary,
          fontSize: font.sizes.base,
        }}
      >
        Sin resultados
      </div>
    );
  }

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={th}>Nombre</th>
          <th style={th}>Email</th>
          <th style={th}>Rol</th>
          <th style={th}>Estado</th>
          <th style={{ ...th, textAlign: "right" }}>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {users.map((u) => (
          <UserRow
            key={u.id}
            user={u}
            userType={userType}
            deleting={deleting}
            onDelete={onDelete}
            onEdit={onEdit}
            onView={onView}
          />
        ))}
      </tbody>
    </table>
  );
}

export function UsersTable({
  resUsers,
  billnovaUsers,
  activeTab,
  onTabChange,
  deleting,
  onDelete,
  onEdit,
  onView,
}: UsersTableProps) {
  const tab = activeTab;
  const tabBtn = (t: Tab): React.CSSProperties => ({
    padding: "7px 18px",
    background: tab === t ? colors.accent : "transparent",
    border: `1px solid ${tab === t ? colors.accent : colors.border}`,
    borderRadius: radius.md,
    color: tab === t ? "#fff" : colors.text.secondary,
    fontSize: font.sizes.sm,
    fontWeight: font.weights.semibold,
    fontFamily: font.family,
    cursor: "pointer",
  });

  return (
    <div
      style={{
        background: colors.bg.secondary,
        borderRadius: radius.lg,
        border: `1px solid ${colors.border}`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 8,
          padding: "16px 18px",
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <button style={tabBtn("res")} onClick={() => onTabChange("res")}>
          RES ({resUsers.length})
        </button>
        <button style={tabBtn("billnova")} onClick={() => onTabChange("billnova")}>
          Billnova ({billnovaUsers.length})
        </button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <Table
          users={tab === "res" ? resUsers : billnovaUsers}
          userType={tab}
          deleting={deleting}
          onDelete={onDelete}
          onEdit={onEdit}
          onView={onView}
        />
      </div>
    </div>
  );
}
