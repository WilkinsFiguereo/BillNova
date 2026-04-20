"use client";

import React, { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, LogOut, Moon, Sun } from "lucide-react";
import { Sidebar } from "@/features/seller/dashboard/dashboards";
import { NAV_ITEMS } from "@/features/seller/dashboard/data/chart.data";
import { globalStyles, dashboardTheme as t } from "@/features/seller/dashboard/theme/dashboard.theme";
import { authApi, clearStoredAuthState, getStoredAuthState } from "@/features/auth/login";
import { useColorMode } from "@/features/shared/theme/useColorMode";
import { ReportProblemForm } from "@/features/shared/reports/ReportProblemForm";

export default function SellerConfigPage() {
  const user = getStoredAuthState();
  const pathname = usePathname();
  const { isDark, toggle } = useColorMode();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const termsHref = useMemo(() => {
    const returnTo = encodeURIComponent(pathname || "/navigation/seller/config/page");
    return `/navigation/terms?from=seller&returnTo=${returnTo}`;
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
        background: t.bgMain,
        color: t.textPrimary,
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
    >
      <style>{globalStyles(t)}</style>
      <Sidebar navItems={NAV_ITEMS} />
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
            Configuracion
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: 22, fontWeight: 900, color: t.textPrimary }}>
            Soporte del vendedor
          </p>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: t.textSecondary }}>
            Reporta problemas relacionados a pagos, payouts o disputas.
          </p>
        </div>

        <section style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, maxWidth: 980 }}>
          <button
            type="button"
            onClick={toggle}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 14px",
              borderRadius: 16,
              border: "1px solid var(--border)",
              background: "var(--bg-card)",
              boxShadow: "var(--shadow-sm)",
              cursor: "pointer",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 900 }}>
              {isDark ? <Moon size={18} /> : <Sun size={18} />}
              Modo oscuro
            </span>
            <span style={{ color: "var(--text-secondary)", fontSize: 12, fontWeight: 800 }}>
              {isDark ? "On" : "Off"}
            </span>
          </button>

          <Link
            href={termsHref}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 14px",
              borderRadius: 16,
              border: "1px solid var(--border)",
              background: "var(--bg-card)",
              boxShadow: "var(--shadow-sm)",
              cursor: "pointer",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 900 }}>
              <FileText size={18} />
              Terminos y condiciones
            </span>
            <span style={{ color: "var(--text-secondary)", fontSize: 12, fontWeight: 800 }}>Ver</span>
          </Link>

          <button
            type="button"
            onClick={logout}
            disabled={isLoggingOut}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 14px",
              borderRadius: 16,
              border: "1px solid rgba(239,68,68,0.35)",
              background: "rgba(239,68,68,0.06)",
              boxShadow: "var(--shadow-sm)",
              cursor: isLoggingOut ? "not-allowed" : "pointer",
              opacity: isLoggingOut ? 0.6 : 1,
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 900 }}>
              <LogOut size={18} />
              Cerrar sesion
            </span>
            <span style={{ color: "var(--text-secondary)", fontSize: 12, fontWeight: 800 }}>
              {isLoggingOut ? "..." : ""}
            </span>
          </button>
        </section>

        <ReportProblemForm
          kind="seller"
          reporter={{
            name: user?.name ?? "Seller",
            email: user?.email ?? undefined,
            role: user?.role ?? "seller",
          }}
          title="Reportar un problema de pago"
          subtitle="Ejemplos: pago no llego, pago no coincide, retraso en payout, chargeback."
        />
      </main>
    </div>
  );
}

