"use client";

import React, { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight, FileText, LogOut, Moon, Shield, Sun, User } from "lucide-react";
import { AdminSidebar } from "@/features/admin/dashboard/ui/AdminSidebar";
import { ADMIN_NAV_ITEMS } from "@/features/admin/dashboard/data/adminNavigation.data";
import { Sidebar } from "@/features/seller/dashboard/dashboards";
import { NAV_ITEMS } from "@/features/seller/dashboard/data/chart.data";
import { MODERATOR_NAV_ITEMS } from "@/features/moderator/moderationNav";
import { dashboardTheme as t, globalStyles } from "@/features/seller/dashboard/theme/dashboard.theme";
import { useColorMode } from "@/features/shared/theme/useColorMode";
import { clearStoredAuthState } from "@/features/auth/login";
import { useSession } from "@/features/auth/login/hooks/useSession";
import { getStoredAuthState } from "@/features/auth/login/data/storage";
import { normalizeUserRole } from "@/features/auth/session/roleRoutes";
import type { UserRole } from "@/features/auth/login/types/auth.types";

const SETTINGS_COPY_BY_ROLE: Record<UserRole, { title: string; subtitle: string; profileHref: string }> = {
  admin: {
    title: "Configuracion",
    subtitle: "Ajustes de administrador",
    profileHref: "/navigation/profile",
  },
  moderator: {
    title: "Configuracion",
    subtitle: "Ajustes de moderacion",
    profileHref: "/navigation/profile",
  },
  seller: {
    title: "Configuracion",
    subtitle: "Ajustes de vendedor",
    profileHref: "/navigation/profile",
  },
  gerente: {
    title: "Configuracion",
    subtitle: "Ajustes de gerencia",
    profileHref: "/navigation/profile",
  },
  worker: {
    title: "Configuracion",
    subtitle: "Ajustes de trabajo",
    profileHref: "/navigation/profile",
  },
};

export default function AdminConfigPage() {
  const { mode, toggle } = useColorMode();
  const { user } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const storedUser = getStoredAuthState();
  const currentRole = normalizeUserRole(user?.role ?? storedUser?.role);
  const copy = SETTINGS_COPY_BY_ROLE[currentRole];

  const privacyHref = "/navigation/privacy";
  const termsHref = "/navigation/terms";

  const onLogout = useCallback(() => {
    clearStoredAuthState();
    router.push("/navigation/welcome");
    router.refresh();
  }, [router]);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        background: t.bgMain,
        color: t.textPrimary,
      }}
    >
      <style>{globalStyles(t)}</style>

      {currentRole === "admin" ? (
        <AdminSidebar navItems={ADMIN_NAV_ITEMS} />
      ) : currentRole === "moderator" ? (
        <Sidebar navItems={MODERATOR_NAV_ITEMS} />
      ) : (
        <Sidebar navItems={NAV_ITEMS} />
      )}

      <main style={{ flex: 1, overflow: "auto", padding: "32px" }}>
        <SettingsPageHeader title={copy.title} subtitle={copy.subtitle} />

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <SettingsSection title="Cuenta">
            <SettingsItem icon={User} label="Perfil" onClick={() => router.push(copy.profileHref)} />
            <SettingsItem icon={LogOut} label="Cerrar sesion" onClick={onLogout} danger />
          </SettingsSection>

          <SettingsSection title="Apariencia">
            <SettingsItem
              icon={mode === "dark" ? Moon : Sun}
              label={mode === "dark" ? "Modo oscuro" : "Modo claro"}
              onClick={toggle}
              rightElement={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, color: t.textSecondary }}>
                    {mode === "dark" ? "Activado" : "Desactivado"}
                  </span>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      toggle();
                    }}
                    style={{
                      width: 44,
                      height: 24,
                      borderRadius: 12,
                      background: mode === "dark" ? t.brand600 : t.border,
                      border: "none",
                      cursor: "pointer",
                      position: "relative",
                      transition: "background 0.2s",
                    }}
                  >
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        background: "white",
                        position: "absolute",
                        top: 3,
                        left: mode === "dark" ? 23 : 3,
                        transition: "left 0.2s",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                      }}
                    />
                  </button>
                </div>
              }
            />
          </SettingsSection>

          <SettingsSection title="Legal">
            <SettingsItem icon={FileText} label="Terminos y condiciones" onClick={() => router.push(termsHref)} />
            <SettingsItem icon={Shield} label="Politica de privacidad" onClick={() => router.push(privacyHref)} />
          </SettingsSection>

          <div
            style={{
              marginTop: 24,
              padding: "16px 20px",
              background: t.bgCard,
              borderRadius: 12,
              border: `1px solid ${t.border}`,
            }}
          >
            <p
              style={{
                fontSize: 13,
                color: t.textSecondary,
                margin: 0,
                textAlign: "center",
              }}
            >
              BillNova v1.0.0 2026 Todos los derechos reservados
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: t.bgCard,
        borderRadius: 12,
        border: `1px solid ${t.border}`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "12px 20px",
          borderBottom: `1px solid ${t.border}`,
          fontSize: 12,
          fontWeight: 600,
          color: t.textSecondary,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>{children}</div>
    </div>
  );
}

function SettingsItem({
  icon: Icon,
  label,
  onClick,
  danger = false,
  rightElement,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  danger?: boolean;
  rightElement?: React.ReactNode;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        padding: "14px 20px",
        cursor: "pointer",
        transition: "background 0.15s",
        borderBottom: `1px solid ${t.border}`,
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.background = t.bgAlt;
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.background = "transparent";
      }}
    >
      <Icon
        size={20}
        style={{
          color: danger ? t.error : t.textSecondary,
          marginRight: 14,
        }}
      />
      <span
        style={{
          flex: 1,
          fontSize: 14,
          fontWeight: 500,
          color: danger ? t.error : t.textPrimary,
        }}
      >
        {label}
      </span>
      {rightElement || <ChevronRight size={18} style={{ color: t.textSecondary }} />}
    </div>
  );
}

function SettingsPageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h1
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: t.textSecondary,
          margin: 0,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {title}
      </h1>
      <p
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: t.textPrimary,
          margin: "4px 0 0",
        }}
      >
        {subtitle}
      </p>
    </div>
  );
}
