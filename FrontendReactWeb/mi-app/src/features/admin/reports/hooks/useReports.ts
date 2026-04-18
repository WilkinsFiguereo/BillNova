'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchReports, createReport } from '../data/reportApi';
import type { Report, CreateReportPayload } from '../types/report.types';

export function useReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchReports();
      setReports(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar reportes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const submitReport = useCallback(async (payload: CreateReportPayload) => {
    try {
      setCreating(true);
      const newReport = await createReport(payload);
      setReports(prev => [newReport, ...prev]);
      return newReport;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear reporte';
      setError(message);
      throw err;
    } finally {
      setCreating(false);
    }
  }, []);

  return {
    reports,
    loading,
    error,
    creating,
    submitReport,
    refresh: loadReports,
  };
}
