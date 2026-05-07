"use client";

import React, { useState } from "react";
import { useUsers } from "./hooks/useUsers";
import { useUserSearch } from "./hooks/useUserSearch";
import { UsersHeader } from "./sections/usersHeader";
import { UsersStats } from "./sections/usersStats";
import { UsersTable } from "./sections/usersTable";
import { UserForm } from "./sections/userForm";
import { Modal } from "./ui/Modal";
import { UsersSidebar } from "./ui/UsersSidebar";
import { colors, font, radius } from "./theme/tokens";
import { USERS_NAV_ITEMS } from "./data/usersNavigation.data";
import type { AdminUserType } from "./types/user.types";

interface ModalState {
  open: boolean;
  mode: "create" | "edit" | "view";
  userId?: number;
  userType: AdminUserType;
}

const CLOSED: ModalState = { open: false, mode: "create", userType: "res" };

const MODAL_TITLE = {
  create: "Nuevo usuario",
  edit: "Editar usuario",
  view: "Detalle del usuario",
} as const;

export function UsersPage() {
  const { resUsers, billnovaUsers, loading, error, deleting, toggling, refresh, removeUser, toggleUserActive } = useUsers();
  const { query, setQuery, filtered } = useUserSearch(resUsers, billnovaUsers);
  const [activeTab, setActiveTab] = useState<AdminUserType>("res");
  const [modal, setModal] = useState<ModalState>(CLOSED);

  const closeModal = () => setModal(CLOSED);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: colors.bg.primary,
        fontFamily: font.family,
      }}
    >
      <UsersSidebar navItems={USERS_NAV_ITEMS} />

      <main
        style={{
          flex: 1,
          overflow: "auto",
          padding: "32px 36px",
          background: colors.bg.primary,
        }}
      >
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <UsersHeader
            query={query}
            onQueryChange={setQuery}
            onAddClick={() => setModal({ open: true, mode: "create", userType: activeTab })}
          />

          {!loading && !error && (
            <UsersStats
              totalRes={resUsers.length}
              totalBillnova={billnovaUsers.length}
              activeCount={[...resUsers, ...billnovaUsers].filter((user) => user.active).length}
              inactiveCount={[...resUsers, ...billnovaUsers].filter((user) => !user.active).length}
            />
          )}

          {loading && (
            <div
              style={{
                textAlign: "center",
                padding: 80,
                background: colors.bg.secondary,
                borderRadius: radius.lg,
                border: `1px solid ${colors.border}`,
                color: colors.text.tertiary,
                fontSize: font.sizes.base,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  border: `2.5px solid ${colors.accent}33`,
                  borderTop: `2.5px solid ${colors.accent}`,
                  borderRadius: "50%",
                  margin: "0 auto 14px",
                  animation: "bn-spin .8s linear infinite",
                }}
              />
              Cargando usuarios...
            </div>
          )}

          {error && !loading && (
            <div
              style={{
                padding: "16px 20px",
                background: colors.error + "20",
                borderRadius: radius.lg,
                color: colors.error,
                border: `1px solid ${colors.error}66`,
                fontSize: font.sizes.base,
              }}
            >
              <strong>Error:</strong> {error}{" "}
              <button
                onClick={() => void refresh()}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: colors.error,
                  fontWeight: font.weights.semibold,
                  textDecoration: "underline",
                  fontFamily: "inherit",
                }}
              >
                Reintentar
              </button>
            </div>
          )}

          {!loading && !error && (
            <UsersTable
              resUsers={filtered.resUsers}
              billnovaUsers={filtered.billnovaUsers}
              deleting={deleting}
              toggling={toggling}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onDelete={(id, userType) => void removeUser(id, userType)}
              onEdit={(id, userType) => setModal({ open: true, mode: "edit", userId: id, userType })}
              onView={(id, userType) => setModal({ open: true, mode: "view", userId: id, userType })}
              onToggleActive={(id, userType, nextActive) => void toggleUserActive(id, userType, nextActive)}
            />
          )}

          <Modal open={modal.open} onClose={closeModal} title={MODAL_TITLE[modal.mode]}>
            <UserForm
              mode={modal.mode}
              userType={modal.userType}
              userId={modal.userId}
              onSubmit={async () => {
                closeModal();
                await refresh();
              }}
              onCancel={closeModal}
            />
          </Modal>
        </div>
      </main>
    </div>
  );
}
