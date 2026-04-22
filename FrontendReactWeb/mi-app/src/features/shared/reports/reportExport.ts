"use client";

import type { Reporte } from "@/features/moderator/report_moderation/types/reportes.types";

interface ReportRow {
  codigo: string;
  titulo: string;
  usuario: string;
  email: string;
  estado: string;
  prioridad: string;
  fecha: string;
}

function formatDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value || "-";
  }

  return new Intl.DateTimeFormat("es-DO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapePdfText(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");
}

function buildRows(reportes: Reporte[]): ReportRow[] {
  return reportes.map((reporte) => ({
    codigo: reporte.codigo,
    titulo: reporte.titulo,
    usuario: reporte.usuario.nombre,
    email: reporte.usuario.email,
    estado: reporte.estado,
    prioridad: reporte.prioridad,
    fecha: formatDate(reporte.fechaCreacion),
  }));
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

function buildPdfContent(lines: string[]) {
  return [
    "BT",
    "/F1 11 Tf",
    "14 TL",
    "40 800 Td",
    ...lines.map((line, index) => `${index === 0 ? "" : "T* "}(${escapePdfText(line)}) Tj`),
    "ET",
  ].join("\n");
}

function generatePdfBlob(lines: string[]) {
  const pageSize = 42;
  const pages: string[][] = [];

  for (let index = 0; index < lines.length; index += pageSize) {
    pages.push(lines.slice(index, index + pageSize));
  }

  if (pages.length === 0) {
    pages.push(["BillNova", "No hay reportes disponibles para exportar."]);
  }

  const fontObjectId = 3 + pages.length * 2;
  const objects: string[] = [];

  objects[0] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[1] = `<< /Type /Pages /Count ${pages.length} /Kids [${pages
    .map((_, index) => `${3 + index * 2} 0 R`)
    .join(" ")}] >>`;

  pages.forEach((pageLines, index) => {
    const pageObjectId = 3 + index * 2;
    const contentObjectId = pageObjectId + 1;
    const content = buildPdfContent(pageLines);
    objects[pageObjectId - 1] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 ${fontObjectId} 0 R >> >> /Contents ${contentObjectId} 0 R >>`;
    objects[contentObjectId - 1] = `<< /Length ${content.length} >>\nstream\n${content}\nendstream`;
  });

  objects[fontObjectId - 1] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";

  for (let index = 1; index < offsets.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}

export function exportReportsToExcel(reportes: Reporte[]) {
  const rows = buildRows(reportes);
  const now = new Date().toISOString().slice(0, 10);

  const bodyRows =
    rows.length > 0
      ? rows
          .map(
            (row) => `
              <tr>
                <td>${escapeHtml(row.codigo)}</td>
                <td>${escapeHtml(row.titulo)}</td>
                <td>${escapeHtml(row.usuario)}</td>
                <td>${escapeHtml(row.email)}</td>
                <td>${escapeHtml(row.estado)}</td>
                <td>${escapeHtml(row.prioridad)}</td>
                <td>${escapeHtml(row.fecha)}</td>
              </tr>`,
          )
          .join("")
      : `
        <tr>
          <td colspan="7">No hay reportes disponibles para exportar.</td>
        </tr>`;

  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
      </head>
      <body>
        <table border="1">
          <thead>
            <tr>
              <th>Código</th>
              <th>Título</th>
              <th>Usuario</th>
              <th>Email</th>
              <th>Estado</th>
              <th>Prioridad</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>${bodyRows}</tbody>
        </table>
      </body>
    </html>`;

  downloadBlob(
    new Blob(["\uFEFF", html], { type: "application/vnd.ms-excel;charset=utf-8;" }),
    `reportes-${now}.xls`,
  );
}

export function exportReportsToPdf(reportes: Reporte[]) {
  const rows = buildRows(reportes);
  const now = new Date().toISOString().slice(0, 10);
  const lines = [
    "BillNova - Reportes exportados",
    `Fecha de exportacion: ${formatDate(new Date().toISOString())}`,
    " ",
  ];

  if (rows.length === 0) {
    lines.push("No hay reportes disponibles para exportar.");
  } else {
    rows.forEach((row, index) => {
      lines.push(`Reporte ${index + 1}: ${row.codigo}`);
      lines.push(`Titulo: ${row.titulo}`);
      lines.push(`Usuario: ${row.usuario} - ${row.email}`);
      lines.push(`Estado: ${row.estado} | Prioridad: ${row.prioridad}`);
      lines.push(`Fecha: ${row.fecha}`);
      lines.push(" ");
    });
  }

  downloadBlob(generatePdfBlob(lines), `reportes-${now}.pdf`);
}
