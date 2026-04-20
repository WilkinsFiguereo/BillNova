"use client";

import type { CreateReportInput, Report, UpdateReportInput } from "./report.types";

const STORAGE_KEY = "billnova.reports.v1";

function nowIso() {
  return new Date().toISOString();
}

function safeParse(raw: string | null): Report[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as Report[];
  } catch {
    return [];
  }
}

export function loadReports(): Report[] {
  if (typeof window === "undefined") return [];
  return safeParse(localStorage.getItem(STORAGE_KEY));
}

export function saveReports(reports: Report[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

export function seedReportsIfEmpty() {
  if (typeof window === "undefined") return;
  const existing = loadReports();
  if (existing.length > 0) return;

  const seeded: Report[] = [
    {
      id: "seed-user-1",
      kind: "user",
      category: "not-received",
      severity: "high",
      status: "open",
      title: "Mi pedido no llego",
      description: "Hice el pedido hace 5 dias y no he recibido ninguna notificacion de entrega.",
      reporter: { name: "Cliente Demo", role: "User", email: "user@demo.com" },
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: "seed-seller-1",
      kind: "seller",
      category: "payment-not-received",
      severity: "critical",
      status: "in-progress",
      title: "Pago no llego",
      description: "El cliente marco como pagado pero no aparece en mi balance. Orden #A-1021.",
      reporter: { name: "Seller Demo", role: "Seller", email: "seller@demo.com" },
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: "seed-bug-1",
      kind: "bug",
      category: "bug",
      severity: "medium",
      status: "open",
      title: "Dashboard tarda en cargar",
      description: "Al entrar al dashboard algunas tarjetas se quedan en loading.",
      reporter: { name: "Moderador Demo", role: "Moderation", email: "mod@demo.com" },
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  ];

  saveReports(seeded);
}

export function createReport(input: CreateReportInput): Report {
  const createdAt = nowIso();
  return {
    id: String(Date.now()),
    kind: input.kind,
    category: input.category,
    severity: input.severity,
    status: "open",
    title: input.title,
    description: input.description,
    reporter: input.reporter,
    createdAt,
    updatedAt: createdAt,
  };
}

export function addReport(input: CreateReportInput): Report {
  const next = createReport(input);
  const reports = loadReports();
  const updated = [next, ...reports];
  saveReports(updated);
  return next;
}

export function updateReport(id: string, patch: UpdateReportInput): Report | null {
  const reports = loadReports();
  const idx = reports.findIndex((r) => r.id === id);
  if (idx < 0) return null;
  const prev = reports[idx];
  const next: Report = {
    ...prev,
    ...patch,
    reporter: prev.reporter,
    updatedAt: nowIso(),
  };
  const updated = [...reports];
  updated[idx] = next;
  saveReports(updated);
  return next;
}

export function deleteReport(id: string): boolean {
  const reports = loadReports();
  const updated = reports.filter((r) => r.id !== id);
  if (updated.length === reports.length) return false;
  saveReports(updated);
  return true;
}
