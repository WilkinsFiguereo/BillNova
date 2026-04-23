"use client";

import { useEffect, useState } from "react";
import { getStoredAuthState } from "@/features/auth/login/data/storage";
import { odooGet } from "@/lib/odooApi";
import { Sidebar, Toast } from "@/features/seller/dashboard/dashboards";
import { NAV_ITEMS } from "@/features/seller/dashboard/data/chart.data";
import {
  dashboardTheme as t,
  globalStyles,
} from "@/features/seller/dashboard/theme/dashboard.theme";

type Nivel = "info" | "advertencia" | "critico";

interface BitacoraItem {
  id: string;
  usuario: string;
  usuarioRol: string;
  accion: string;
  modulo: string;
  nivel: Nivel;
  descripcion: string;
  detalle: string;
  ip: string;
  dispositivo: string;
  fecha: string;
  hora: string;
  entidadNombre: string;
}

interface BitacoraResponse {
  ok: boolean;
  data?: BitacoraItem[];
  error?: string;
}

const NIVEL_STYLES: Record<Nivel, { color: string; bg: string; label: string }> = {
  info: { color: "#1d4ed8", bg: "#dbeafe", label: "Info" },
  advertencia: { color: "#b45309", bg: "#fef3c7", label: "Advertencia" },
  critico: { color: "#b91c1c", bg: "#fee2e2", label: "Critico" },
};

export default function BitacoraPage() {
  const [items, setItems] = useState<BitacoraItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const auth = getStoredAuthState();
        const response = await odooGet<BitacoraResponse>("/api/bitacora", {
          sessionToken: auth?.sessionToken,
          allowedStatuses: [401, 403],
        });

        if (cancelled) return;

        if (!response.ok) {
          setItems([]);
          setToastMsg(response.error || "No se pudo cargar la bitacora.");
          setToastVisible(true);
          return;
        }

        setItems(response.data ?? []);
      } catch {
        if (cancelled) return;
        setItems([]);
        setToastMsg("No se pudo cargar la bitacora.");
        setToastVisible(true);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!toastVisible) return;
    const timer = window.setTimeout(() => setToastVisible(false), 2600);
    return () => window.clearTimeout(timer);
  }, [toastVisible]);

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

      <Sidebar navItems={NAV_ITEMS} />

      <main style={{ flex: 1, overflow: "auto", padding: "32px" }}>
        <section style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800 }}>Bitacora</h1>
          <p style={{ margin: "8px 0 0", color: t.textSecondary }}>
            Actividad reciente detectada por el sistema.
          </p>
        </section>

        <section
          style={{
            background: t.bgCard,
            border: `1px solid ${t.border}`,
            borderRadius: 24,
            overflow: "hidden",
            boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.1fr 0.9fr 0.8fr 2fr 1.2fr",
              gap: 16,
              padding: "18px 20px",
              background: t.bgAlt,
              borderBottom: `1px solid ${t.border}`,
              fontSize: 12,
              fontWeight: 700,
              color: t.textSecondary,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            <span>Fecha</span>
            <span>Modulo</span>
            <span>Nivel</span>
            <span>Descripcion</span>
            <span>Usuario</span>
          </div>

          {loading ? (
            <div style={{ padding: 24, color: t.textSecondary }}>Cargando bitacora...</div>
          ) : items.length === 0 ? (
            <div style={{ padding: 24, color: t.textSecondary }}>
              No hay registros disponibles.
            </div>
          ) : (
            items.map((item) => {
              const nivel = NIVEL_STYLES[item.nivel] ?? NIVEL_STYLES.info;

              return (
                <article
                  key={item.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.1fr 0.9fr 0.8fr 2fr 1.2fr",
                    gap: 16,
                    padding: "18px 20px",
                    borderBottom: `1px solid ${t.border}`,
                    alignItems: "start",
                  }}
                >
                  <div>
                    <strong style={{ display: "block", fontSize: 14 }}>{item.fecha}</strong>
                    <span style={{ color: t.textSecondary, fontSize: 12 }}>{item.hora}</span>
                  </div>

                  <div>
                    <strong style={{ display: "block", fontSize: 14 }}>{item.modulo}</strong>
                    <span style={{ color: t.textSecondary, fontSize: 12 }}>{item.accion}</span>
                  </div>

                  <div>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "6px 10px",
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 700,
                        color: nivel.color,
                        background: nivel.bg,
                      }}
                    >
                      {nivel.label}
                    </span>
                  </div>

                  <div>
                    <strong style={{ display: "block", fontSize: 14 }}>
                      {item.descripcion || item.entidadNombre || "Evento"}
                    </strong>
                    <span style={{ color: t.textSecondary, fontSize: 12 }}>
                      {item.detalle || `${item.ip} ${item.dispositivo}`.trim() || "Sin detalle"}
                    </span>
                  </div>

                  <div>
                    <strong style={{ display: "block", fontSize: 14 }}>{item.usuario}</strong>
                    <span style={{ color: t.textSecondary, fontSize: 12 }}>{item.usuarioRol}</span>
                  </div>
                </article>
              );
            })
          )}
        </section>
      </main>

      <Toast message={toastMsg} visible={toastVisible} />
    </div>
  );
}
