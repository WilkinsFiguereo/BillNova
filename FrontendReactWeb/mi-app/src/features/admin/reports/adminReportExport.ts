"use client";

import type { Report } from "./types/report.types";

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

function toPdfText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, " ")
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)");
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

function summarizeTypes(reports: Report[]) {
  const userReports = reports.filter((report) => report.title?.includes("[Usuario]")).length;
  const companyReports = reports.filter((report) => report.title?.includes("[Empresa]")).length;

  return {
    userReports,
    companyReports,
  };
}

function wrapText(text: string, maxChars: number) {
  const clean = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!clean) return ["-"];

  const words = clean.split(" ");
  const lines: string[] = [];
  let current = "";

  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      current = candidate;
      return;
    }

    if (current) {
      lines.push(current);
    }

    if (word.length <= maxChars) {
      current = word;
      return;
    }

    for (let index = 0; index < word.length; index += maxChars) {
      lines.push(word.slice(index, index + maxChars));
    }
    current = "";
  });

  if (current) lines.push(current);
  return lines;
}

function buildPdfBlob(reports: Report[]) {
  const summary = summarizeTypes(reports);
  const pageWidth = 595;
  const pageHeight = 842;
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  const pageStreams: string[] = [];

  let stream = "";
  let cursorY = pageHeight - 40;

  const add = (line: string) => {
    stream += `${line}\n`;
  };

  const startPage = () => {
    stream = "";
    cursorY = pageHeight - 40;

    add("0.94 0.96 0.99 rg");
    add(`0 0 ${pageWidth} ${pageHeight} re f`);

    add("0.07 0.10 0.18 rg");
    add(`${margin} ${pageHeight - 120} ${contentWidth} 78 re f`);

    add("BT");
    add("/F1 24 Tf");
    add("1 1 1 rg");
    add(`${margin + 18} ${pageHeight - 72} Td`);
    add(`(${toPdfText("BillNova Reportes Administrativos")}) Tj`);
    add("ET");

    add("BT");
    add("/F1 11 Tf");
    add("0.90 0.94 1 rg");
    add(`${margin + 18} ${pageHeight - 92} Td`);
    add(`(${toPdfText(`Documento generado el ${formatDate(new Date().toISOString())}`)}) Tj`);
    add("ET");

    const statY = pageHeight - 170;
    const statWidth = 160;
    const statGap = 14;
    const stats = [
      { label: "Total", value: String(reports.length) },
      { label: "Usuarios", value: String(summary.userReports) },
      { label: "Empresas", value: String(summary.companyReports) },
    ];

    stats.forEach((stat, index) => {
      const x = margin + index * (statWidth + statGap);
      add("1 1 1 rg");
      add(`${x} ${statY} ${statWidth} 56 re f`);
      add("0.84 0.89 0.95 RG");
      add(`${x} ${statY} ${statWidth} 56 re S`);

      add("BT");
      add("/F1 10 Tf");
      add("0.38 0.45 0.55 rg");
      add(`${x + 14} ${statY + 36} Td`);
      add(`(${toPdfText(stat.label)}) Tj`);
      add("ET");

      add("BT");
      add("/F1 22 Tf");
      add("0.07 0.10 0.18 rg");
      add(`${x + 14} ${statY + 14} Td`);
      add(`(${toPdfText(stat.value)}) Tj`);
      add("ET");
    });

    cursorY = statY - 22;
  };

  const flushPage = () => {
    if (stream) pageStreams.push(stream);
  };

  const ensureSpace = (needed: number) => {
    if (cursorY - needed < 40) {
      flushPage();
      startPage();
    }
  };

  startPage();

  if (reports.length === 0) {
    ensureSpace(100);
    add("1 1 1 rg");
    add(`${margin} ${cursorY - 74} ${contentWidth} 74 re f`);
    add("0.82 0.87 0.93 RG");
    add(`${margin} ${cursorY - 74} ${contentWidth} 74 re S`);
    add("BT");
    add("/F1 14 Tf");
    add("0.22 0.29 0.38 rg");
    add(`${margin + 18} ${cursorY - 34} Td`);
    add(`(${toPdfText("No hay reportes administrativos disponibles para exportar.")}) Tj`);
    add("ET");
  } else {
    reports.forEach((report, index) => {
      const type = report.title?.includes("[Empresa]") ? "Empresa" : "Usuario";
      const titleLines = wrapText(report.title || "-", 54);
      const descriptionLines = wrapText(report.description || "Sin descripcion registrada.", 88).slice(0, 8);
      const cardHeight = 132 + titleLines.length * 16 + descriptionLines.length * 12;

      ensureSpace(cardHeight + 18);

      const cardY = cursorY - cardHeight;
      add("1 1 1 rg");
      add(`${margin} ${cardY} ${contentWidth} ${cardHeight} re f`);
      add("0.84 0.89 0.95 RG");
      add(`${margin} ${cardY} ${contentWidth} ${cardHeight} re S`);

      add("0.91 0.95 1 rg");
      add(`${margin + 18} ${cardY + cardHeight - 32} 78 18 re f`);

      add("BT");
      add("/F1 10 Tf");
      add("0.12 0.32 0.73 rg");
      add(`${margin + 26} ${cardY + cardHeight - 20} Td`);
      add(`(${toPdfText(`Reporte ${index + 1}`)}) Tj`);
      add("ET");

      let titleY = cardY + cardHeight - 50;
      titleLines.forEach((line) => {
        add("BT");
        add("/F1 16 Tf");
        add("0.07 0.10 0.18 rg");
        add(`${margin + 18} ${titleY} Td`);
        add(`(${toPdfText(line)}) Tj`);
        add("ET");
        titleY -= 16;
      });

      const badgesText = `${type}  |  ${report.severity || "-"}  |  ${report.status || "-"}`;
      add("BT");
      add("/F1 10 Tf");
      add("0.38 0.45 0.55 rg");
      add(`${margin + 18} ${titleY - 4} Td`);
      add(`(${toPdfText(badgesText)}) Tj`);
      add("ET");

      const metaStartY = titleY - 26;
      const metaLines = [
        `Reportado por: ${report.reporter?.name || "-"}`,
        `Email: ${report.reporter?.email || "-"}`,
        `Categoria: ${report.category || "-"}`,
        `Fecha: ${formatDate(report.createdAt)}`,
      ];

      metaLines.forEach((line, metaIndex) => {
        add("BT");
        add("/F1 10 Tf");
        add("0.22 0.29 0.38 rg");
        add(`${margin + 18 + (metaIndex % 2) * 250} ${metaStartY - Math.floor(metaIndex / 2) * 16} Td`);
        add(`(${toPdfText(line)}) Tj`);
        add("ET");
      });

      const descBoxY = cardY + 16;
      const descBoxHeight = descriptionLines.length * 12 + 18;
      add("0.97 0.98 1 rg");
      add(`${margin + 18} ${descBoxY} ${contentWidth - 36} ${descBoxHeight} re f`);
      add("0.87 0.91 0.96 RG");
      add(`${margin + 18} ${descBoxY} ${contentWidth - 36} ${descBoxHeight} re S`);

      let descY = descBoxY + descBoxHeight - 14;
      descriptionLines.forEach((line) => {
        add("BT");
        add("/F1 10 Tf");
        add("0.19 0.25 0.33 rg");
        add(`${margin + 30} ${descY} Td`);
        add(`(${toPdfText(line)}) Tj`);
        add("ET");
        descY -= 12;
      });

      cursorY = cardY - 18;
    });
  }

  flushPage();

  const objects: string[] = [];
  const pageObjectIds: number[] = [];
  const contentObjectIds: number[] = [];
  const fontObjectId = 3 + pageStreams.length * 2;

  objects[0] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[1] = `<< /Type /Pages /Count ${pageStreams.length} /Kids [${pageStreams
    .map((_, index) => `${3 + index * 2} 0 R`)
    .join(" ")}] >>`;

  pageStreams.forEach((pageStream, index) => {
    const pageObjectId = 3 + index * 2;
    const contentObjectId = pageObjectId + 1;
    pageObjectIds.push(pageObjectId);
    contentObjectIds.push(contentObjectId);
    objects[pageObjectId - 1] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontObjectId} 0 R >> >> /Contents ${contentObjectId} 0 R >>`;
    objects[contentObjectId - 1] = `<< /Length ${pageStream.length} >>\nstream\n${pageStream}endstream`;
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

export function exportAdminReportsToExcel(reports: Report[]) {
  const now = new Date().toISOString().slice(0, 10);
  const summary = summarizeTypes(reports);
  const bodyRows =
    reports.length > 0
      ? reports
          .map(
            (report) => `
              <tr>
                <td>${escapeHtml(report.title || "-")}</td>
                <td>${escapeHtml(report.title?.includes("[Empresa]") ? "Empresa" : "Usuario")}</td>
                <td>${escapeHtml(report.category || "-")}</td>
                <td>${escapeHtml(report.severity || "-")}</td>
                <td>${escapeHtml(report.status || "-")}</td>
                <td>${escapeHtml(report.reporter?.name || "-")}</td>
                <td>${escapeHtml(report.reporter?.email || "-")}</td>
                <td>${escapeHtml(formatDate(report.createdAt))}</td>
                <td>${escapeHtml(report.description || "-")}</td>
              </tr>`,
          )
          .join("")
      : `
        <tr>
          <td colspan="9">No hay reportes administrativos disponibles para exportar.</td>
        </tr>`;

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
          .hero {
            background: linear-gradient(135deg, #0f172a, #1d4ed8);
            color: #fff;
            border-radius: 18px;
            padding: 24px 28px;
            margin-bottom: 20px;
          }
          .hero h1 {
            margin: 0 0 8px;
            font-size: 28px;
          }
          .hero p {
            margin: 0;
            font-size: 14px;
            opacity: 0.88;
          }
          .stats {
            margin: 0 0 20px;
            border-collapse: separate;
            border-spacing: 12px 0;
          }
          .stats td {
            background: #ffffff;
            border: 1px solid #dbe4f0;
            border-radius: 14px;
            padding: 14px 16px;
            min-width: 140px;
          }
          .stats .label {
            display: block;
            font-size: 12px;
            color: #64748b;
            margin-bottom: 4px;
          }
          .stats .value {
            font-size: 22px;
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
            background: #eaf2ff;
            color: #1e3a8a;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            padding: 14px 12px;
            border-bottom: 1px solid #cbd5e1;
          }
          .report-table td {
            padding: 12px;
            border-bottom: 1px solid #e2e8f0;
            vertical-align: top;
            font-size: 13px;
          }
        </style>
      </head>
      <body>
        <div class="hero">
          <h1>BillNova Reportes Administrativos</h1>
          <p>Exportación generada el ${escapeHtml(formatDate(new Date().toISOString()))}</p>
        </div>
        <table class="stats">
          <tr>
            <td><span class="label">Total reportes</span><span class="value">${reports.length}</span></td>
            <td><span class="label">De usuarios</span><span class="value">${summary.userReports}</span></td>
            <td><span class="label">De empresas</span><span class="value">${summary.companyReports}</span></td>
          </tr>
        </table>
        <table class="report-table">
          <thead>
            <tr>
              <th>Titulo</th>
              <th>Tipo</th>
              <th>Categoria</th>
              <th>Severidad</th>
              <th>Estado</th>
              <th>Reportado por</th>
              <th>Email</th>
              <th>Fecha</th>
              <th>Descripcion</th>
            </tr>
          </thead>
          <tbody>${bodyRows}</tbody>
        </table>
      </body>
    </html>`;

  downloadBlob(
    new Blob(["\uFEFF", html], { type: "application/vnd.ms-excel;charset=utf-8;" }),
    `reportes-admin-${now}.xls`,
  );
}

export function exportAdminReportsToPdf(reports: Report[]) {
  const now = new Date().toISOString().slice(0, 10);
  downloadBlob(buildPdfBlob(reports), `reportes-admin-${now}.pdf`);
}
