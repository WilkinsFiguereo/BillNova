"use client";

import React, { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sun,
  Moon,
  FileText,
  Shield,
  User,
  LogOut,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { Sidebar } from "@/features/seller/dashboard/dashboards";
import { MODERATOR_NAV_ITEMS } from "@/features/moderator/moderationNav";
import { globalStyles, dashboardTheme as t } from "@/features/seller/dashboard/theme/dashboard.theme";
import { authApi, clearStoredAuthState, getStoredAuthState } from "@/features/auth/login";
import { useColorMode } from "@/features/shared/theme/useColorMode";
import { ReportProblemForm } from "@/features/shared/reports/ReportProblemForm";

export default function ModeratorConfigPage() {
  const user = getStoredAuthState();
  const pathname = usePathname();
  const { mode, toggle } = useColorMode();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const termsHref = useMemo(() => {
    const returnTo = encodeURIComponent(pathname || "/navigation/moderation/config/page");
    return `/navigation/terms?from=moderation&returnTo=${returnTo}`;
  }, [pathname]);

  const logout = useCallback(async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    const cached = getStoredAuthState();
    try {
      await authApi.logout(cached?.sessionToken);
    } catch {
      // ignore
    } finally {
      clearStoredAuthState();
      window.location.href = "/navigation/auth/login/page";
    }
  }, [isLoggingOut]);

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
      <Sidebar navItems={MODERATOR_NAV_ITEMS} />

      <main style={{ flex: 1, overflow: "auto", padding: "32px" }}>
        <SettingsPageHeader title="Configuración" subtitle="Ajustes" />

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <SettingsSection title="Cuenta">
            <SettingsItem
              icon={User}
              label="Perfil"
              onClick={() => {}}
            />
            <SettingsItem
              icon={LogOut}
              label="Cerrar Sesión"
              onClick={logout}
              danger
            />
          </SettingsSection>

          <SettingsSection title="Apariencia">
            <SettingsItem
              icon={mode === "dark" ? Moon : Sun}
              label={mode === "dark" ? "Modo Oscuro" : "Modo Claro"}
              onClick={toggle}
              rightElement={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, color: t.textSecondary }}>
                    {mode === "dark" ? "Activado" : "Desactivado"}
                  </span>
                  <button
                    onClick={toggle}
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
            <SettingsItem
              icon={FileText}
              label="Términos y Condiciones"
              onClick={() => {}}
            />
            <SettingsItem
              icon={Shield}
              label="Política de Privacidad"
              onClick={() => {}}
            />
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
              BillNova v1.0.0 © 2026 Todos los derechos reservados
            </p>
          </div>
        </div>

        <div style={{ marginTop: 24, maxWidth: 980 }}>
          <ReportProblemForm
            kind="bug"
            reporter={{
              name: user?.name ?? "Moderador",
              email: user?.email ?? undefined,
              role: user?.role ?? "moderation",
            }}
            title="Reportar un problema de la aplicación"
            subtitle="Ejemplos: crash, error 500, pantalla en blanco, botones que no responden, lentitud."
          />
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
      onMouseEnter={(e) => (e.currentTarget.style.background = t.bgAlt)}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
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

