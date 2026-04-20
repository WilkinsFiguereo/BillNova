import { ODOO_URL } from '@/lib/odooApi';
import type { CreateReportPayload, Report } from '../types/report.types';

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json() as Promise<T>;
}

export async function fetchReports(): Promise<Report[]> {
  const payload = await fetchJson<{ data?: Report[] }>(`${ODOO_URL}/api/reports`);
  return payload.data || [];
}

export async function createReport(payload: CreateReportPayload): Promise<Report> {
  const response = await fetchJson<{ data: Report }>(`${ODOO_URL}/api/reports`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return response.data;
}

export async function getReportById(id: string): Promise<Report | null> {
  const reports = await fetchReports();
  return reports.find((report) => report.id === id) || null;
}
