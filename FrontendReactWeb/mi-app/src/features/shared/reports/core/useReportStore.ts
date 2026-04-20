"use client";

import { useCallback, useEffect, useState } from "react";
import type { CreateReportInput, Report, UpdateReportInput } from "./report.types";
import { odooDelete, odooGet, odooPost, odooPut } from "@/lib/odooApi";

type ListEnvelope = { data: Report[] };
type OneEnvelope = { data: Report };

export function useReportStore() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await odooGet<ListEnvelope>("/api/reports");
      setReports(res?.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando reportes");
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(async (input: CreateReportInput) => {
    const res = await odooPost<OneEnvelope>("/api/reports", input);
    const created = res.data;
    setReports((prev) => [created, ...prev]);
    return created;
  }, []);

  const update = useCallback(async (id: string, patch: UpdateReportInput) => {
    const res = await odooPut<OneEnvelope>(`/api/reports/${id}`, patch);
    const updated = res.data;
    setReports((prev) => prev.map((r) => (r.id === id ? updated : r)));
    return updated;
  }, []);

  const remove = useCallback(async (id: string) => {
    await odooDelete<{ ok: boolean }>(`/api/reports/${id}`, { allowedStatuses: [200] });
    setReports((prev) => prev.filter((r) => r.id !== id));
    return true;
  }, []);

  return { reports, loading, error, refresh, create, update, remove };
}

