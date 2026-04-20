"use client";

import React, { useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FileText, LogOut } from "lucide-react";
import { AdminSidebar } from "@/features/admin/dashboard/ui/AdminSidebar";
import { ADMIN_NAV_ITEMS } from "@/features/admin/dashboard/data/adminNavigation.data";
import { dashboardTheme as t, globalStyles } from "@/features/seller/dashboard/theme/dashboard.theme";
import { useColorMode } from "@/features/shared/theme/useColorMode";
import { clearStoredAuthState } from "@/features/auth/login";
import { AUTH_ENTRY_ROUTE } from "@/features/auth/login/navigation";

export default function AdminConfigPage() {
  const { isDark, toggle } = useColorMode();
  const router = useRouter();
  const pathname = usePathname();

  const termsHref = useMemo(() => {
    const returnTo = encodeURIComponent(pathname || "/navigation/admin/configuracion/page");
    return `/navigation/terms?from=admin&returnTo=${returnTo}`;
  }, [pathname]);

  const onLogout = useCallback(() => {
    clearStoredAuthState();
    router.push(AUTH_ENTRY_ROUTE);
    router.refresh();
  }, [router]);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: t.bgMain,
        color: t.textPrimary,
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
    >
      <style>{globalStyles(t)}</style>
      <AdminSidebar navItems={ADMIN_NAV_ITEMS} />

      <main style={{ flex: 1, overflow: "auto", padding: "32px" }}>
        <div style={{ marginBottom: 18 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 800,
              color: t.textDisabled,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Admin
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: 22, fontWeight: 900, color: t.textPrimary }}>
            Configuracion
          </p>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: t.textSecondary }}>
            Preferencias del panel de administrador.
          </p>
        </div>

        <section
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: 18,
            maxWidth: 820,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 900, color: "var(--text-primary)" }}>Tema</div>
              <div style={{ marginTop: 4, fontSize: 13, color: "var(--text-secondary)" }}>
                Cambia entre modo claro y oscuro.
              </div>
            </div>
            <button
              type="button"
              onClick={toggle}
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid var(--border)",
                background: "var(--bg-alt)",
                color: "var(--text-primary)",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              {isDark ? "Light mode" : "Dark mode"}
            </button>
          </div>

          <div style={{ height: 12 }} />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 900, color: "var(--text-primary)" }}>Terminos</div>
              <div style={{ marginTop: 4, fontSize: 13, color: "var(--text-secondary)" }}>
                Revisa los terminos y condiciones de BillNova.
              </div>
            </div>
            <Link
              href={termsHref}
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid var(--border)",
                background: "var(--brand-100)",
                color: "var(--brand-600)",
                fontWeight: 900,
                textDecoration: "none",
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <FileText size={16} />
                Ver
              </span>
            </Link>
          </div>

          <div style={{ height: 12 }} />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 900, color: "var(--text-primary)" }}>Cuenta</div>
              <div style={{ marginTop: 4, fontSize: 13, color: "var(--text-secondary)" }}>
                Cierra tu sesion del panel.
              </div>
            </div>
            <button
              type="button"
              onClick={onLogout}
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(239,68,68,0.35)",
                background: "rgba(239,68,68,0.08)",
                color: "var(--text-primary)",
                fontWeight: 900,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <LogOut size={16} />
              Cerrar sesion
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

