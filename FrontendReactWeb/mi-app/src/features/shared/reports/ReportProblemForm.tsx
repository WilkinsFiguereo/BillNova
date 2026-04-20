"use client";

import React, { useCallback, useMemo, useState } from "react";
import { Send } from "lucide-react";
import { useReportStore } from "./core/useReportStore";
import type {
  BugCategory,
  CreateReportInput,
  ReportCategory,
  ReportKind,
  ReportSeverity,
  SellerIssueCategory,
  UserIssueCategory,
} from "./core/report.types";

const USER_CATEGORIES: { value: UserIssueCategory; label: string }[] = [
  { value: "not-received", label: "Pedido no llego" },
  { value: "damaged", label: "Llego danado" },
  { value: "late", label: "Llego tarde" },
  { value: "wrong-item", label: "Producto equivocado" },
  { value: "quality-issue", label: "Problema de calidad" },
  { value: "other", label: "Otro" },
];

const SELLER_CATEGORIES: { value: SellerIssueCategory; label: string }[] = [
  { value: "payment-not-received", label: "Pago no llego" },
  { value: "payment-mismatch", label: "Pago no coincide" },
  { value: "payout-delay", label: "Retraso en payout" },
  { value: "chargeback", label: "Chargeback / disputa" },
  { value: "other", label: "Otro" },
];

const BUG_CATEGORIES: { value: BugCategory; label: string }[] = [
  { value: "bug", label: "Bug" },
  { value: "ui", label: "UI" },
  { value: "performance", label: "Performance" },
  { value: "security", label: "Security" },
  { value: "feature", label: "Feature request" },
  { value: "other", label: "Otro" },
];

const SEVERITY_OPTIONS: { value: ReportSeverity; label: string }[] = [
  { value: "low", label: "Bajo" },
  { value: "medium", label: "Medio" },
  { value: "high", label: "Alto" },
  { value: "critical", label: "Critico" },
];

function getCategoryOptions(kind: ReportKind) {
  if (kind === "seller") return SELLER_CATEGORIES as { value: ReportCategory; label: string }[];
  if (kind === "bug") return BUG_CATEGORIES as { value: ReportCategory; label: string }[];
  return USER_CATEGORIES as { value: ReportCategory; label: string }[];
}

interface ReportProblemFormProps {
  kind: ReportKind;
  reporter: CreateReportInput["reporter"];
  title?: string;
  subtitle?: string;
}

export function ReportProblemForm({
  kind,
  reporter,
  title = "Reportar un problema",
  subtitle = "Describe lo que paso y agrega contexto (pantalla, accion, y si ocurre siempre).",
}: ReportProblemFormProps) {
  const { create } = useReportStore();
  const categoryOptions = useMemo(() => getCategoryOptions(kind), [kind]);
  const defaultCategory = categoryOptions[0]?.value ?? "other";

  const [payload, setPayload] = useState<Omit<CreateReportInput, "reporter">>({
    kind,
    title: "",
    description: "",
    category: defaultCategory,
    severity: "medium",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(
    () => payload.title.trim().length > 0 && payload.description.trim().length > 0,
    [payload],
  );

  const onSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!canSubmit) {
      setError("Completa el titulo y la descripcion.");
      return;
    }
    setIsSubmitting(true);
    try {
      create({ ...payload, kind, reporter });
      setSuccess("Reporte enviado. Gracias por ayudarnos a mejorar.");
      setPayload((prev) => ({ ...prev, title: "", description: "" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar el reporte.");
    } finally {
      setIsSubmitting(false);
    }
  }, [canSubmit, create, kind, payload, reporter]);

  return (
    <section
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: 18,
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div>
        <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-0.02em" }}>{title}</div>
        <div style={{ marginTop: 6, color: "var(--text-secondary)", fontSize: 13 }}>{subtitle}</div>
      </div>

      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }} noValidate>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", color: "var(--text-disabled)", textTransform: "uppercase" }}>
            Titulo
          </span>
          <input
            value={payload.title}
            onChange={(e) => setPayload((prev) => ({ ...prev, title: e.target.value }))}
            placeholder={kind === "seller" ? "Ej: Pago no llego de orden #..." : "Ej: No puedo completar el pedido"}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "var(--bg-alt)",
              color: "var(--text-primary)",
              outline: "none",
            }}
          />
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", color: "var(--text-disabled)", textTransform: "uppercase" }}>
              Categoria
            </span>
            <select
              value={payload.category}
              onChange={(e) => setPayload((prev) => ({ ...prev, category: e.target.value as ReportCategory }))}
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid var(--border)",
                background: "var(--bg-alt)",
                color: "var(--text-primary)",
                outline: "none",
              }}
            >
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", color: "var(--text-disabled)", textTransform: "uppercase" }}>
              Severidad
            </span>
            <select
              value={payload.severity}
              onChange={(e) => setPayload((prev) => ({ ...prev, severity: e.target.value as ReportSeverity }))}
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid var(--border)",
                background: "var(--bg-alt)",
                color: "var(--text-primary)",
                outline: "none",
              }}
            >
              {SEVERITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </label>
        </div>

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", color: "var(--text-disabled)", textTransform: "uppercase" }}>
            Descripcion
          </span>
          <textarea
            value={payload.description}
            onChange={(e) => setPayload((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Pasos para reproducir, resultado esperado y resultado actual..."
            rows={6}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "var(--bg-alt)",
              color: "var(--text-primary)",
              outline: "none",
              resize: "vertical",
            }}
          />
        </label>

        {error && (
          <div style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(239,68,68,0.4)", background: "rgba(239,68,68,0.08)", color: "var(--text-primary)", fontSize: 13 }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(16,185,129,0.4)", background: "rgba(16,185,129,0.08)", color: "var(--text-primary)", fontSize: 13 }}>
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !canSubmit}
          style={{
            marginTop: 4,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "11px 14px",
            borderRadius: 12,
            border: "none",
            cursor: isSubmitting || !canSubmit ? "not-allowed" : "pointer",
            background: "var(--brand-600)",
            color: "white",
            fontWeight: 900,
            letterSpacing: "0.02em",
            opacity: isSubmitting || !canSubmit ? 0.6 : 1,
          }}
        >
          <Send size={16} />
          {isSubmitting ? "Enviando..." : "Enviar reporte"}
        </button>
      </form>
    </section>
  );
}

