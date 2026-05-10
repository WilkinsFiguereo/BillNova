"use client";

import {
  exportDatasetToExcel,
  exportDatasetToPdf,
} from "@/features/shared/reports/reportExport";

export function exportModeratorDatasetToExcel(
  title: string,
  filename: string,
  rows: Array<Record<string, unknown>>,
) {
  return exportDatasetToExcel({ title, filename, rows });
}

export function exportModeratorDatasetToPdf(
  title: string,
  filename: string,
  rows: Array<Record<string, unknown>>,
) {
  return exportDatasetToPdf({ title, filename, rows });
}
