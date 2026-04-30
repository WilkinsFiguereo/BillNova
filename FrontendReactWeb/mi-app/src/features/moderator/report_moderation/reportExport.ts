"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

function formatDate(value: string): string {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("es-DO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}

function formatValue(value: unknown): string | number {
  if (typeof value === "number") return Number(value.toFixed(2));
  if (typeof value === "string" && value.includes("T")) return formatDate(value);
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function exportModeratorDatasetToExcel(
  title: string,
  filename: string,
  rows: Array<Record<string, unknown>>,
) {
  const normalizedRows = rows.map((row) =>
    Object.fromEntries(
      Object.entries(row).map(([key, value]) => [key, formatValue(value)]),
    ),
  );

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(
    normalizedRows.length > 0 ? normalizedRows : [{ Mensaje: "No hay datos para exportar" }],
  );
  XLSX.utils.book_append_sheet(workbook, worksheet, title.slice(0, 31));
  const arrayBuffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
  downloadBlob(
    new Blob([arrayBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    filename,
  );
}

export function exportModeratorDatasetToPdf(
  title: string,
  filename: string,
  rows: Array<Record<string, unknown>>,
) {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  doc.setFontSize(18);
  doc.text(title, 40, 38);
  doc.setFontSize(10);
  doc.text(`Generado: ${formatDate(new Date().toISOString())}`, 40, 56);

  const headers = rows.length > 0 ? Object.keys(rows[0]) : ["Mensaje"];
  const body =
    rows.length > 0
      ? rows.map((row) => headers.map((key) => String(formatValue(row[key]))))
      : [["No hay datos para exportar"]];

  autoTable(doc, {
    startY: 72,
    head: [headers],
    body,
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 6 },
    headStyles: { fillColor: [30, 58, 138] },
  });

  doc.save(filename);
}
