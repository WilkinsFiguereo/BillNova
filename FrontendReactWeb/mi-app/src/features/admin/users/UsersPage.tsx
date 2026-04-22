"use client";
import React, { useState } from "react";
import { useUsers }        from "./hooks/useUsers";
import { useUserSearch }   from "./hooks/useUserSearch";
import { UsersHeader }     from "./sections/usersHeader";
import { UsersStats }      from "./sections/usersStats";
import { UsersTable }      from "./sections/usersTable";
import { UserForm }        from "./sections/userForm";
import { Modal }           from "./ui/Modal";
import { colors, font, radius } from "./theme/tokens";
import { AdminSidebar } from "@/features/admin/dashboard/ui/AdminSidebar";
import { ADMIN_NAV_ITEMS } from "@/features/admin/dashboard/data/adminNavigation.data";

interface ModalState {
  open: boolean;
  mode: "create" | "edit" | "view";
  userId?: number;
  userType?: "res" | "billnova";
}

const CLOSED: ModalState = { open: false, mode: "create" };

const MODAL_TITLE = {
  create: "Nuevo usuario",
  edit:   "Editar usuario",
  view:   "Detalle del usuario",
} as const;

export function UsersPage() {
  const {
    resUsers, billnovaUsers,
    loading, error,
    deleting, refresh, removeUser,
  } = useUsers();

  const { query, setQuery, filtered } = useUserSearch(resUsers, billnovaUsers);
  const [modal, setModal] = useState<ModalState>(CLOSED);

  const closeModal = () => setModal(CLOSED);
  
  const openEditModal = (userId: number, userType: "res" | "billnova") => {
    setModal({ open: true, mode: "edit", userId, userType });
  };

  const openViewModal = (userId: number, userType: "res" | "billnova") => {
    setModal({ open: true, mode: "view", userId, userType });
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: colors.bg.primary,
        fontFamily: font.family,
      }}
    >
      {/* ── Sidebar ── */}
      <AdminSidebar navItems={ADMIN_NAV_ITEMS} />

      {/* ── Main Content ── */}
      <main
        style={{
          flex: 1,
          overflow: "auto",
          padding: "32px 36px",
          background: colors.bg.primary,
        }}
      >
        <div
          style={{
            maxWidth: 1080,
            margin: "0 auto",
          }}
        >

      <UsersHeader
        query={query}
        onQueryChange={setQuery}
        onAddClick={() => setModal({ open: true, mode: "create" })}
      />

      {/* Stats — solo si hay datos */}
      {!loading && !error && (
        <UsersStats 
          totalRes={resUsers.length} 
          totalBillnova={billnovaUsers.length}
          activeCount={resUsers.filter(u => u.active).length}
          inactiveCount={resUsers.filter(u => !u.active).length}
        />
      )}

      {/* ── Estado: cargando ── */}
      {loading && (
        <div style={{
          textAlign:    "center",
          padding:      80,
          background:   colors.bg.secondary,
          borderRadius: radius.lg,
          border:       `1px solid ${colors.border}`,
          color:        colors.text.tertiary,
          fontSize:     font.sizes.base,
        }}>
          <div style={{
            width:        30,
            height:       30,
            border:       `2.5px solid ${colors.accent}33`,
            borderTop:    `2.5px solid ${colors.accent}`,
            borderRadius: "50%",
            margin:       "0 auto 14px",
            animation:    "bn-spin .8s linear infinite",
          }} />
          Cargando usuarios...
        </div>
      )}

      {/* ── Estado: error ── */}
      {error && !loading && (
        <div style={{
          padding:      "16px 20px",
          background:   colors.error + "20",
          borderRadius: radius.lg,
          color:        colors.error,
          border:       `1px solid ${colors.error}66`,
          fontSize:     font.sizes.base,
        }}>
          <strong>Error:</strong> {error}{" "}
          <button
            onClick={refresh}
            style={{
              background:     "none",
              border:         "none",
              cursor:         "pointer",
              color:          colors.error,
              fontWeight:     font.weights.semibold,
              textDecoration: "underline",
              fontFamily:     "inherit",
            }}
          >
            Reintentar
          </button>
        </div>
      )}

      {/* ── Tabla ── */}
      {!loading && !error && (
        <UsersTable
          resUsers={filtered.resUsers}
          billnovaUsers={filtered.billnovaUsers}
          deleting={deleting}
          onDelete={(id) => removeUser(id)}
          onEdit={openEditModal}
          onView={openViewModal}
        />
      )}

      {/* ── Modal crear / editar / ver ── */}
      <Modal
        open={modal.open}
        onClose={closeModal}
        title={MODAL_TITLE[modal.mode]}
      >
        <UserForm
          mode={modal.mode}
          userType={modal.userType || "res"}
          userId={modal.userId}
          onSubmit={async () => { closeModal(); refresh(); }}
          onCancel={closeModal}
        />
      </Modal>
        </div>
      </main>
    </div>
  );
}
