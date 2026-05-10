"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type ExportRow = Record<string, unknown>;

type SummaryItem = {
  label: string;
  value: string;
};

type ExportOptions = {
  title: string;
  filename: string;
  rows: ExportRow[];
  emptyMessage?: string;
  summary?: SummaryItem[];
};

let billnovaLogoDataUrlPromise: Promise<string | null> | null = null;

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

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeFilename(filename: string, extension: ".pdf" | ".xls") {
  return filename.replace(/\.[^.]+$/, extension);
}

async function loadBillnovaLogoDataUrl() {
  if (typeof window === "undefined") return null;
  if (!billnovaLogoDataUrlPromise) {
    billnovaLogoDataUrlPromise = fetch("/logos/logo.png")
      .then(async (response) => {
        if (!response.ok) return null;
        const blob = await response.blob();
        return await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onerror = () => reject(new Error("No se pudo leer el logo."));
          reader.onload = () => resolve(String(reader.result ?? ""));
          reader.readAsDataURL(blob);
        });
      })
      .catch(() => null);
  }
  return billnovaLogoDataUrlPromise;
}

function buildSummary(rows: ExportRow[], summary?: SummaryItem[]) {
  if (summary?.length) return summary;
  return [
    { label: "Registros", value: rows.length.toLocaleString("es-DO") },
    { label: "Columnas", value: String(rows.length > 0 ? Object.keys(rows[0]).length : 0) },
    { label: "Generado", value: new Date().toLocaleDateString("es-DO") },
  ];
}

function normalizeTitle(title: string) {
  return title.replace(/\s+/g, " ").trim().toUpperCase();
}

export async function exportDatasetToPdf({
  title,
  filename,
  rows,
  emptyMessage = "No hay datos para exportar.",
  summary,
}: ExportOptions) {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const generatedAt = formatDate(new Date().toISOString());
  const logoDataUrl = await loadBillnovaLogoDataUrl();
  const normalizedTitle = normalizeTitle(title);
  const safeRows = rows.length > 0 ? rows : [{ Mensaje: emptyMessage }];
  const headers = Object.keys(safeRows[0]);
  const body = safeRows.map((row) => headers.map((key) => String(formatValue(row[key]))));
  const summaryItems = buildSummary(rows, summary);

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(28, 24, 786, 132, 20, 20, "F");
  doc.setDrawColor(223, 232, 247);
  doc.roundedRect(28, 24, 786, 132, 20, 20, "S");

  if (logoDataUrl) {
    doc.addImage(logoDataUrl, "PNG", 42, 40, 70, 70);
  } else {
    doc.setFillColor(29, 78, 216);
    doc.roundedRect(42, 40, 70, 70, 16, 16, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(30);
    doc.text("BN", 58, 83);
  }

  doc.setTextColor(15, 31, 77);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  doc.text("BillNova", 126, 72);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(15);
  doc.setTextColor(85, 98, 127);
  doc.text("Ecommerce inteligente,", 126, 94);
  doc.text("facturacion simple.", 126, 114);
  doc.setTextColor(15, 31, 77);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  const titleLines = doc.splitTextToSize(normalizedTitle, 230);
  doc.text(titleLines, 772, 56, { align: "right", baseline: "top" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(85, 98, 127);
  doc.setFillColor(248, 250, 255);
  doc.roundedRect(516, 114, 256, 34, 12, 12, "F");
  doc.setDrawColor(225, 232, 245);
  doc.roundedRect(516, 114, 256, 34, 12, 12, "S");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(57, 70, 95);
  doc.text("Documento generado: ", 520, 135);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(36, 83, 219);
  doc.text(generatedAt, 756, 135, { align: "right" });

  const summaryStartX = 28;
  const summaryY = 182;
  const summaryWidth = 246;
  summaryItems.slice(0, 3).forEach((item, index) => {
    const x = summaryStartX + index * (summaryWidth + 10);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(223, 232, 247);
    doc.roundedRect(x, summaryY, summaryWidth, 58, 14, 14, "FD");
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(10);
    doc.text(item.label.toUpperCase(), x + 16, summaryY + 20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(18);
    doc.text(item.value, x + 16, summaryY + 42);
  });

  autoTable(doc, {
    startY: 262,
    head: [headers],
    body,
    theme: "grid",
    margin: { left: 28, right: 28, bottom: 28 },
    styles: {
      fontSize: 8.5,
      cellPadding: 6,
      textColor: [23, 32, 51],
      lineColor: [226, 232, 240],
      lineWidth: 0.6,
    },
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "left",
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    bodyStyles: {
      valign: "top",
    },
    didDrawPage: () => {
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setDrawColor(219, 234, 254);
      doc.line(28, pageHeight - 24, 814, pageHeight - 24);
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(9);
      doc.text("BillNova · Documento de reporte", 18, pageHeight - 10);
    },
  });

  doc.save(normalizeFilename(filename, ".pdf"));
}

export async function exportDatasetToExcel({
  title,
  filename,
  rows,
  emptyMessage = "No hay datos para exportar.",
  summary,
}: ExportOptions) {
  const generatedAt = formatDate(new Date().toISOString());
  const logoDataUrl = await loadBillnovaLogoDataUrl();
  const safeRows = rows.length > 0 ? rows : [{ Mensaje: emptyMessage }];
  const headers = Object.keys(safeRows[0]);
  const bodyRows = safeRows
    .map(
      (row) => `
        <tr>
          ${headers
            .map((header) => `<td>${escapeHtml(String(formatValue(row[header])))}</td>`)
            .join("")}
        </tr>`,
    )
    .join("");
  const summaryItems = buildSummary(rows, summary);

  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body {
            font-family: Calibri, Arial, sans-serif;
            padding: 24px;
            color: #172033;
            background: #f8fafc;
          }
          .sheet {
            max-width: 1180px;
            margin: 0 auto;
          }
          .hero {
            background: #ffffff;
            border: 1px solid #dfe8f7;
            border-radius: 20px;
            padding: 26px 28px;
            margin-bottom: 18px;
          }
          .hero-table {
            width: 100%;
            border-collapse: collapse;
          }
          .brand-cell,
          .title-cell {
            vertical-align: top;
          }
          .brand-wrap {
            display: flex;
            align-items: center;
            gap: 16px;
          }
          .brand-logo {
            width: 76px;
            height: 76px;
            border-radius: 18px;
          }
          .brand-copy h1 {
            margin: 0;
            font-size: 34px;
            color: #0f1f4d;
          }
          .brand-copy p {
            margin: 6px 0 0;
            font-size: 14px;
            line-height: 1.45;
            color: #55627f;
          }
          .doc-title {
            margin: 0;
            text-align: right;
            font-size: 34px;
            font-weight: 800;
            color: #0f1f4d;
          }
          .doc-box {
            margin-top: 16px;
            margin-left: auto;
            max-width: 330px;
            background: #f8faff;
            border: 1px solid #dfe8f7;
            border-radius: 14px;
            padding: 12px 16px;
            text-align: right;
          }
          .doc-box-label {
            font-size: 13px;
            color: #55627f;
            margin-right: 8px;
          }
          .doc-box-value {
            font-size: 15px;
            font-weight: 800;
            color: #2453db;
          }
          .stats {
            display: table;
            width: 100%;
            margin-bottom: 18px;
          }
          .stats-row {
            display: table-row;
          }
          .stat {
            display: table-cell;
            background: #ffffff;
            border: 1px solid #dfe8f7;
            border-radius: 14px;
            padding: 14px 16px;
            width: 33%;
          }
          .stat-label {
            display: block;
            font-size: 11px;
            color: #64748b;
            margin-bottom: 4px;
            text-transform: uppercase;
            letter-spacing: .08em;
          }
          .stat-value {
            font-size: 20px;
            font-weight: 700;
            color: #0f172a;
          }
          table.report-table {
            width: 100%;
            border-collapse: collapse;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
          }
          .report-table th {
            background: linear-gradient(90deg, #1748cf 0%, #2457dd 100%);
            color: #ffffff;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: .06em;
            padding: 13px 12px;
            border: 1px solid #2457dd;
            text-align: left;
          }
          .report-table td {
            padding: 11px 12px;
            border: 1px solid #e2e8f0;
            vertical-align: top;
            font-size: 12px;
          }
          .report-table tr:nth-child(even) td {
            background: #f8fafc;
          }
          .foot {
            margin-top: 12px;
            color: #64748b;
            font-size: 11px;
          }
        </style>
      </head>
      <body>
        <div class="sheet">
          <div class="hero">
            <table class="hero-table">
              <tr>
                <td class="brand-cell" style="width:58%;">
                  <div class="brand-wrap">
                    ${
                      logoDataUrl
                        ? `<img class="brand-logo" src="${logoDataUrl}" alt="BillNova" />`
                        : `<div style="width:50px;height:50px;border-radius:18px;background:#2457dd;color:#fff;text-align:center;line-height:76px;font-size:34px;font-weight:800;">BN</div>`
                    }
                    <div class="brand-copy">
                      <h2>BillNova</h2>
                      <p>Ecommerce inteligente,<br/>facturacion simple.</p>
                    </div>
                  </div>
                </td>
                <td class="title-cell" style="width:32%;">
                  <h4 class="doc-title">${escapeHtml(title.toUpperCase())}</h4>
                  <div class="doc-box">
                    <span class="doc-box-label">Documento:</span>
                    <span class="doc-box-value">${escapeHtml(generatedAt)}</span>
                  </div>
                </td>
              </tr>
            </table>
          </div>
          <div class="stats">
            <div class="stats-row">
              ${summaryItems
                .slice(0, 3)
                .map(
                  (item) => `
                    <div class="stat">
                      <span class="stat-label">${escapeHtml(item.label)}</span>
                      <span class="stat-value">${escapeHtml(item.value)}</span>
                    </div>`,
                )
                .join("")}
            </div>
          </div>
          <table class="report-table">
            <thead>
              <tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr>
            </thead>
            <tbody>${bodyRows}</tbody>
          </table>
          <div class="foot">BillNova · Documento tabular unificado para reportes y facturas.</div>
        </div>
      </body>
    </html>`;

  downloadBlob(
    new Blob(["\uFEFF", html], { type: "application/vnd.ms-excel;charset=utf-8;" }),
    normalizeFilename(filename, ".xls"),
  );
}
