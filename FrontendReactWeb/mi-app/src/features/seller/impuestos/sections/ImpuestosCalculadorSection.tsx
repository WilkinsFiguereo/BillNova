"use client";

import React, { useMemo, useState, useCallback } from "react";
import {
  Calculator, Zap, TrendingUp, Loader2,
  Calendar, ChevronRight, AlertCircle, CheckCircle2,
} from "lucide-react";
import type { Impuesto, CalcPreview } from "../hooks/useImpuestos";
import { impuestosTheme as t } from "../theme/impuestos.theme";
import { ODOO_URL } from "@/lib/odooApi";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface VentasMesResult {
  periodo: string;
  totalFacturado: number;
  totalBase: number;
  totalImpuestos: number;
  facturas: number;
  impuestosDesglose: Array<{ nombre: string; monto: number }>;
}

interface ImpuestosCalculadorSectionProps {
  impuestos: Impuesto[];
  loading?: boolean;
  calcBase: number;
  setCalcBase: (v: number) => void;
  calcSelected: string[];
  setCalcSelected: (ids: string[]) => void;
  calcPreview: CalcPreview;
  companyId?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  n.toLocaleString("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function formatearPeriodoLabel(desde: string, hasta: string): string {
  const desdeDate = new Date(`${desde}T00:00:00`);
  const hastaDate = new Date(`${hasta}T00:00:00`);
  const desdeLabel = desdeDate.toLocaleDateString("es-DO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const hastaLabel = hastaDate.toLocaleDateString("es-DO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return desde === hasta ? desdeLabel : `${desdeLabel} - ${hastaLabel}`;
}

function rangoMesActual() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();
  return {
    desde: `${y}-${m}-01`,
    hasta: `${y}-${m}-${String(lastDay).padStart(2, "0")}`,
  };
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function ImpuestosCalculadorSection({
  impuestos,
  loading = false,
  calcBase,
  setCalcBase,
  calcSelected,
  setCalcSelected,
  calcPreview,
  companyId,
}: ImpuestosCalculadorSectionProps) {
  const activos = useMemo(() => impuestos.filter(i => i.activo), [impuestos]);

  const [cargando, setCargando] = useState(false);
  const [ventasMes, setVentasMes] = useState<VentasMesResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rangoFechas, setRangoFechas] = useState(() => rangoMesActual());

  // ── Fetch facturas del mes desde Odoo ─────────────────────────────────────
  const calcularVentasMes = useCallback(async () => {
    setCargando(true);
    setError(null);
    setVentasMes(null);

    try {
      if (rangoFechas.desde > rangoFechas.hasta) {
        throw new Error("La fecha 'desde' no puede ser mayor que 'hasta'");
      }

      const qs = companyId ? `?company_id=${companyId}` : "";
      const res = await fetch(`${ODOO_URL}/api/pos/orders${qs}`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Error obteniendo facturas");

      // Filtrar por rango seleccionado
      const desde = new Date(`${rangoFechas.desde}T00:00:00`);
      const hasta = new Date(`${rangoFechas.hasta}T23:59:59.999`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const facturasMes = (data.data as any[]).filter((f: any) => {
        if (!f.date) return false;
        const d = new Date(f.date);
        return d >= desde && d <= hasta;
      });

      if (facturasMes.length === 0) {
        setVentasMes({
          periodo: formatearPeriodoLabel(rangoFechas.desde, rangoFechas.hasta),
          totalFacturado: 0,
          totalBase: 0,
          totalImpuestos: 0,
          facturas: 0,
          impuestosDesglose: [],
        });
        setCalcBase(0);
        return;
      }

      // Sumar totales
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const totalFacturado = facturasMes.reduce((s: number, f: any) => s + (f.total || 0), 0);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const totalBase      = facturasMes.reduce((s: number, f: any) => s + (f.subtotal || 0), 0);
      const totalImpuestos = totalFacturado - totalBase;

      // Desglose estimado por tipo
      const desglose: Array<{ nombre: string; monto: number }> = [];
      const itbisActivos    = activos.filter(i => i.tipo === "itbis");
      const retencionActiva = activos.find(i => i.tipo === "retencion");

      if (itbisActivos.length > 0 && totalBase > 0) {
        const imp0 = itbisActivos[0];
        const montoItbis = +(totalBase * (imp0.tasa / 100)).toFixed(2);
        desglose.push({ nombre: imp0.nombre, monto: montoItbis });

        const resto = +(totalImpuestos - montoItbis).toFixed(2);
        if (resto > 1) {
          desglose.push({
            nombre: retencionActiva?.nombre ?? "Otros impuestos",
            monto: resto,
          });
        }
      } else if (totalImpuestos > 0) {
        desglose.push({ nombre: "Impuestos totales", monto: +totalImpuestos.toFixed(2) });
      }

      const resultado: VentasMesResult = {
        periodo: formatearPeriodoLabel(rangoFechas.desde, rangoFechas.hasta),
        totalFacturado: +totalFacturado.toFixed(2),
        totalBase:      +totalBase.toFixed(2),
        totalImpuestos: +totalImpuestos.toFixed(2),
        facturas: facturasMes.length,
        impuestosDesglose: desglose,
      };

      setVentasMes(resultado);

      // Auto-llenar calculadora
      setCalcBase(resultado.totalBase);
      const idsItbis = activos.filter(i => i.tipo === "itbis").map(i => i.id);
      if (idsItbis.length > 0) setCalcSelected(idsItbis);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setCargando(false);
    }
  }, [companyId, activos, rangoFechas.desde, rangoFechas.hasta, setCalcBase, setCalcSelected]);

  function toggleTax(id: string) {
    setCalcSelected(
      calcSelected.includes(id)
        ? calcSelected.filter(x => x !== id)
        : [...calcSelected, id]
    );
  }

  function selectSoloItbis() {
    setCalcSelected(activos.filter(i => i.tipo === "itbis").map(i => i.id));
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{
      background: "white",
      borderRadius: 16,
      border: `1px solid ${t.border}`,
      padding: 24,
      marginBottom: 24,
    }}>

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap", gap: 12,
        marginBottom: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: t.brand100, color: t.brand600,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Calculator size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: t.textPrimary, margin: 0 }}>
              Calculadora de Impuestos
            </h3>
            <p style={{ fontSize: 12, color: t.textSecondary, margin: 0 }}>
              Cálculo en tiempo real · Odoo compute_all
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {/* ★ BOTÓN PRINCIPAL */}
          <button
            onClick={calcularVentasMes}
            disabled={cargando}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 20px",
              background: cargando
                ? "#94A3B8"
                : "linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)",
              color: "white",
              border: "none",
              borderRadius: 10,
              fontSize: 13, fontWeight: 700,
              cursor: cargando ? "not-allowed" : "pointer",
              boxShadow: cargando ? "none" : "0 4px 16px rgba(37,99,235,0.4)",
              transition: "all 0.2s ease",
              whiteSpace: "nowrap",
            }}
          >
            {cargando
              ? <><Loader2 size={14} style={{ animation: "calcSpin 1s linear infinite" }} /> Calculando...</>
              : <><TrendingUp size={14} /> Calcular Ventas</>
            }
          </button>

          <button
            onClick={selectSoloItbis}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "10px 14px",
              background: "#EFF6FF", color: t.brand600,
              border: `1px solid #BFDBFE`,
              borderRadius: 10, fontSize: 12, fontWeight: 600,
              cursor: "pointer", whiteSpace: "nowrap",
            }}
          >
            <Zap size={13} /> Solo ITBIS
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          background: "#FEF2F2", border: "1px solid #FECACA",
          borderRadius: 10, padding: "12px 16px", marginBottom: 16,
          fontSize: 13, color: "#991B1B",
        }}>
          <AlertCircle size={15} />
          {error}
        </div>
      )}

      {/* Banner resultado ventas del mes */}
      {ventasMes && <VentasMesBanner ventasMes={ventasMes} />}

      {/* Grid inputs + resultado */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* Izquierda */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          <div>
            <label style={labelStyle}>Rango de fechas</label>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr",
              gap: 10,
              alignItems: "center",
            }}>
              <input
                type="date"
                value={rangoFechas.desde}
                max={rangoFechas.hasta}
                onChange={e => setRangoFechas(prev => ({ ...prev, desde: e.target.value }))}
                style={dateInputStyle}
              />
              <span style={{
                fontSize: 12,
                fontWeight: 700,
                color: t.textSecondary,
                textAlign: "center",
              }}>
                hasta
              </span>
              <input
                type="date"
                value={rangoFechas.hasta}
                min={rangoFechas.desde}
                onChange={e => setRangoFechas(prev => ({ ...prev, hasta: e.target.value }))}
                style={dateInputStyle}
              />
            </div>
            <div style={{
              fontSize: 11,
              color: t.textSecondary,
              marginTop: 6,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}>
              <Calendar size={11} />
              {formatearPeriodoLabel(rangoFechas.desde, rangoFechas.hasta)}
            </div>
          </div>

          {/* Base imponible */}
          <div>
            <label style={labelStyle}>Base Imponible (RD$)</label>
            <div style={{ position: "relative" }}>
              <input
                type="number"
                value={calcBase || ""}
                onChange={e => setCalcBase(Number(e.target.value))}
                placeholder="0.00"
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  paddingRight: ventasMes ? 58 : 14,
                  borderRadius: 10,
                  border: `1.5px solid ${ventasMes ? "#93C5FD" : t.border}`,
                  fontSize: 15,
                  fontFamily: "'DM Mono', monospace",
                  fontWeight: 700,
                  color: t.textPrimary,
                  outline: "none",
                  boxSizing: "border-box",
                  background: ventasMes ? "#F0F9FF" : "white",
                  transition: "border-color 0.25s, background 0.25s",
                }}
              />
              {ventasMes && (
                <span style={{
                  position: "absolute", right: 10, top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 9, color: "#1D4ED8", fontWeight: 800,
                  background: "#DBEAFE", padding: "2px 7px",
                  borderRadius: 20, textTransform: "uppercase", letterSpacing: "0.05em",
                }}>
                  AUTO
                </span>
              )}
            </div>
            {ventasMes && ventasMes.facturas > 0 && (
              <div style={{
                fontSize: 11, color: "#2563EB", marginTop: 5,
                display: "flex", alignItems: "center", gap: 4,
              }}>
                <Calendar size={10} />
                {ventasMes.facturas} factura{ventasMes.facturas !== 1 ? "s" : ""} en {ventasMes.periodo}
              </div>
            )}
          </div>

          {/* Selector impuestos */}
          <div>
            <label style={labelStyle}>
              Impuestos ({calcSelected.length} seleccionados)
            </label>
            <div style={{
              maxHeight: 210, overflowY: "auto",
              border: `1px solid ${t.border}`, borderRadius: 10,
            }}>
              {activos.length === 0
                ? <div style={{ padding: 16, textAlign: "center", fontSize: 13, color: t.textSecondary }}>
                    {loading ? "Cargando impuestos..." : "No hay impuestos disponibles"}
                  </div>
                : activos.map((imp, idx) => {
                    const sel = calcSelected.includes(imp.id);
                    return (
                      <label key={imp.id} style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "9px 12px", cursor: "pointer",
                        borderBottom: idx < activos.length - 1 ? `1px solid ${t.border}` : "none",
                        background: sel ? "#EFF6FF" : "white",
                        transition: "background 0.15s",
                      }}>
                        <input
                          type="checkbox"
                          checked={sel}
                          onChange={() => toggleTax(imp.id)}
                          style={{ accentColor: t.brand600, width: 14, height: 14, cursor: "pointer" }}
                        />
                        <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: t.textPrimary }}>
                          {imp.nombre}
                        </span>
                        <span style={{
                          fontSize: 12, fontWeight: 700,
                          color: sel ? t.brand600 : t.textSecondary,
                          fontFamily: "'DM Mono', monospace",
                        }}>
                          {imp.tasa}%
                        </span>
                      </label>
                    );
                  })
              }
            </div>
          </div>
        </div>

        {/* Derecha: resultado */}
        <div style={{
          background: "#F8FAFC", borderRadius: 12, padding: 20,
          display: "flex", flexDirection: "column", gap: 12,
        }}>
          <div style={labelStyle}>Resultado</div>

          {calcPreview.desglose.length > 0 && (
            <div style={{
              background: "white", borderRadius: 8,
              border: `1px solid ${t.border}`, overflow: "hidden",
            }}>
              {calcPreview.desglose.map((item, i) => (
                <div key={item.id} style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "8px 12px", fontSize: 12,
                  borderBottom: i < calcPreview.desglose.length - 1
                    ? `1px solid ${t.border}` : "none",
                }}>
                  <span style={{ color: t.textSecondary }}>{item.name}</span>
                  <span style={{
                    fontFamily: "'DM Mono', monospace",
                    fontWeight: 700, color: t.textPrimary,
                  }}>
                    RD$ {fmt(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
            <Row label="Base"      value={`RD$ ${fmt(calcPreview.base)}`}      color={t.textPrimary} big={false} />
            {calcPreview.itbis > 0 && (
              <Row label="ITBIS"   value={`RD$ ${fmt(calcPreview.itbis)}`}     color="#D97706"       big={false} />
            )}
            {calcPreview.impuesto > 0 && (
              <Row label="Otros"   value={`RD$ ${fmt(calcPreview.impuesto)}`}  color="#DC2626"       big={false} />
            )}
            <div style={{ height: 1, background: t.border }} />
            <Row label="Total"     value={`RD$ ${fmt(calcPreview.total)}`}     color={t.brand600}    big={true}  />
          </div>

          <div style={{
            fontSize: 10, color: t.textSecondary,
            display: "flex", alignItems: "center", gap: 5,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
              background: calcPreview.desglose.length > 0 ? "#10B981" : "#D1D5DB",
              display: "inline-block",
            }} />
            {calcPreview.desglose.length > 0
              ? "Calculado con Odoo compute_all"
              : "Selecciona impuestos y base"}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes calcSpin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ─── Banner ventas del mes ────────────────────────────────────────────────────

function VentasMesBanner({ ventasMes }: { ventasMes: VentasMesResult }) {
  if (ventasMes.facturas === 0) {
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        background: "#FFFBEB", border: "1px solid #FDE68A",
        borderRadius: 10, padding: "12px 16px", marginBottom: 16,
        fontSize: 13, color: "#92400E",
      }}>
        <AlertCircle size={15} />
        No hay facturas en {ventasMes.periodo}
      </div>
    );
  }

  return (
    <div style={{
      background: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
      border: "1px solid #93C5FD",
      borderRadius: 14, padding: "16px 20px",
      marginBottom: 20,
    }}>
      {/* Título */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8, marginBottom: 14,
      }}>
        <CheckCircle2 size={15} color="#1D4ED8" />
        <span style={{
          fontSize: 12, fontWeight: 800, color: "#1D4ED8",
          textTransform: "uppercase", letterSpacing: "0.06em",
        }}>
          Ventas de {ventasMes.periodo}
        </span>
        <span style={{
          marginLeft: "auto",
          fontSize: 10, color: "#3B82F6",
          background: "white", border: "1px solid #BFDBFE",
          borderRadius: 20, padding: "2px 9px", fontWeight: 700,
        }}>
          {ventasMes.facturas} factura{ventasMes.facturas !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Tarjetas métricas */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 10,
      }}>
        <MetCard label="Total Facturado"   valor={ventasMes.totalFacturado}  color="#1D4ED8" />
        <MetCard label="Base Imponible"    valor={ventasMes.totalBase}       color="#065F46" />
        <MetCard label="Impuestos Cobrados" valor={ventasMes.totalImpuestos} color="#9D174D" />
      </div>

      {/* Desglose */}
      {ventasMes.impuestosDesglose.length > 0 && (
        <div style={{
          marginTop: 12, paddingTop: 12,
          borderTop: "1px solid #BFDBFE",
          display: "flex", gap: 16, flexWrap: "wrap",
          alignItems: "center",
        }}>
          <span style={{ fontSize: 10, color: "#3B82F6", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Desglose estimado:
          </span>
          {ventasMes.impuestosDesglose.map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 5,
              fontSize: 12, color: "#1E40AF",
            }}>
              <ChevronRight size={11} />
              <span style={{ fontWeight: 600 }}>{item.nombre}:</span>
              <span style={{
                fontFamily: "'DM Mono', monospace", fontWeight: 800,
              }}>
                RD$ {fmt(item.monto)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MetCard({ label, valor, color }: { label: string; valor: number; color: string }) {
  return (
    <div style={{
      background: "white", borderRadius: 10,
      padding: "10px 14px", border: "1px solid #DBEAFE",
    }}>
      <div style={{
        fontSize: 9, color: "#6B7280", fontWeight: 700,
        textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 15, fontWeight: 800,
        fontFamily: "'DM Mono', monospace",
        color, letterSpacing: "-0.02em",
      }}>
        RD$ {fmt(valor)}
      </div>
    </div>
  );
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: "#6B7280",
  display: "block", marginBottom: 6,
  textTransform: "uppercase", letterSpacing: "0.05em",
};

const dateInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: 10,
  border: `1.5px solid ${t.border}`,
  fontSize: 14,
  color: t.textPrimary,
  outline: "none",
  boxSizing: "border-box",
  background: "white",
};

function Row({ label, value, color, big }: {
  label: string; value: string; color: string; big: boolean;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
      <span style={{ fontSize: big ? 13 : 12, color: "#6B7280", fontWeight: 500 }}>{label}</span>
      <span style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: big ? 22 : 14,
        fontWeight: big ? 800 : 600,
        color, letterSpacing: big ? "-0.02em" : "0",
      }}>
        {value}
      </span>
    </div>
  );
}
