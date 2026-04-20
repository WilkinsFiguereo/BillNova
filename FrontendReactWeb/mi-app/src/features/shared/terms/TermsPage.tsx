"use client";

import React, { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getStoredAuthState } from "@/features/auth/login";

function safeInternalPath(raw: string | null) {
  if (!raw) return "";
  const val = raw.trim();
  if (!val.startsWith("/navigation/")) return "";
  return val;
}

function getFallbackConfigHref(from: string) {
  if (from === "admin") return "/navigation/admin/configuracion/page";
  if (from === "moderation") return "/navigation/moderation/config/page";
  if (from === "seller") return "/navigation/seller/config/page";

  const user = getStoredAuthState();
  const role = user?.role ?? null;
  if (role === "admin") return "/navigation/admin/configuracion/page";
  if (role === "moderation") return "/navigation/moderation/config/page";
  return "/navigation/seller/config/page";
}

export default function TermsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const from = (searchParams.get("from") ?? "").toLowerCase();
  const returnTo = safeInternalPath(searchParams.get("returnTo"));

  const fallbackHref = useMemo(() => returnTo || getFallbackConfigHref(from), [from, returnTo]);

  const onBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallbackHref);
  }, [fallbackHref, router]);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg-main)",
        color: "var(--text-primary)",
        padding: "32px 20px",
      }}
    >
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, letterSpacing: "-0.02em" }}>Terminos y condiciones</h1>
            <p style={{ margin: "6px 0 0", color: "var(--text-secondary)", fontSize: 13 }}>
              Version preliminar. Ajusta este contenido cuando tengas el texto legal final.
            </p>
          </div>
          <button
            type="button"
            onClick={onBack}
            style={{
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 700,
              color: "var(--brand-600)",
              background: "var(--brand-100)",
              border: "1px solid var(--border)",
              padding: "10px 12px",
              borderRadius: 12,
              whiteSpace: "nowrap",
              cursor: "pointer",
            }}
          >
            Volver
          </button>
        </div>

        <section
          style={{
            marginTop: 22,
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: "18px 18px",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 15 }}>1. Uso del servicio</h2>
          <p style={{ margin: "10px 0 0", color: "var(--text-secondary)", lineHeight: 1.7, fontSize: 13 }}>
            BillNova es una plataforma conectada con Odoo para gestionar operaciones, facturacion y moderacion.
            Al usar el sistema aceptas utilizarlo de forma responsable y cumplir las politicas aplicables.
          </p>

          <h2 style={{ margin: "18px 0 0", fontSize: 15 }}>2. Datos y privacidad</h2>
          <p style={{ margin: "10px 0 0", color: "var(--text-secondary)", lineHeight: 1.7, fontSize: 13 }}>
            La informacion que ingreses puede ser almacenada para operar el servicio, auditoria y soporte. No
            compartimos datos con terceros salvo lo necesario para proveer el servicio o por obligacion legal.
          </p>

          <h2 style={{ margin: "18px 0 0", fontSize: 15 }}>3. Soporte y reportes</h2>
          <p style={{ margin: "10px 0 0", color: "var(--text-secondary)", lineHeight: 1.7, fontSize: 13 }}>
            Puedes reportar problemas desde el sidebar en la seccion de configuracion. Haremos lo posible por
            atenderlos segun prioridad y severidad.
          </p>

          <h2 style={{ margin: "18px 0 0", fontSize: 15 }}>4. Cambios</h2>
          <p style={{ margin: "10px 0 0", color: "var(--text-secondary)", lineHeight: 1.7, fontSize: 13 }}>
            Estos terminos pueden actualizarse. Mantendremos la version visible desde esta pagina.
          </p>
        </section>
      </div>
    </main>
  );
}

