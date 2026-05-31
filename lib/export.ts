/**
 * Export — Word (.docx via HTML) + PDF (print window)
 * Word: HTML → Blob with mimeType application/msword  ← 100% browser-compatible, no library needed
 * PDF: Opens a styled iframe/window and triggers print
 */
import {
  formatDate, formatCurrency,
  PROJECT_STATUSES, EXPENSE_CATEGORIES, INCOME_CATEGORIES,
} from "./utils"

/* ══════════════════════════════════════════════
   SHARED STYLES (used in both Word HTML + PDF)
══════════════════════════════════════════════ */
const SHARED_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:11pt;color:#1A1814;background:white;line-height:1.55}
  h1,h2,h3{font-family:'Playfair Display',Georgia,serif;color:#1A1814;letter-spacing:-0.02em}
  table{width:100%;border-collapse:collapse;margin:8pt 0;font-size:9.5pt;page-break-inside:auto}
  thead{display:table-header-group}
  tr{page-break-inside:avoid;page-break-after:auto}
  thead th{padding:7pt 10pt;text-align:left;font-size:8pt;font-weight:700;
    letter-spacing:.1em;text-transform:uppercase;color:#8A8070;
    background:#F5F0E8!important;border-bottom:1.5pt solid #C8A870;
    -webkit-print-color-adjust:exact;print-color-adjust:exact}
  tbody td{padding:5.5pt 10pt;font-size:9.5pt;color:#2E2A24;border-bottom:.5pt solid rgba(200,168,112,.18)}
  tfoot td{padding:6pt 10pt;font-weight:700;color:#1A1814;border-top:1pt solid rgba(200,168,112,.35);
    background:rgba(200,168,112,.06)!important;-webkit-print-color-adjust:exact}
  .gold-line{border:none;border-top:1pt solid rgba(200,168,112,.45);margin:10pt 0}
  .title-block{text-align:center;padding:0 0 14pt}
  .title-block h1{font-size:18pt;color:#1A1814}
  .title-block .sub{color:#8A8070;font-size:10.5pt;margin-top:4pt}
  .section-title{font-family:'Playfair Display',serif;font-size:13pt;font-weight:700;
    color:#1A1814;margin:14pt 0 6pt;padding-bottom:4pt;border-bottom:1pt solid rgba(200,168,112,.35)}
  .stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8pt;margin-bottom:8pt}
  .stat-box{border:1pt solid rgba(200,168,112,.25);background:#F5F0E8;padding:9pt 12pt;border-radius:3pt;
    -webkit-print-color-adjust:exact;print-color-adjust:exact}
  .stat-box .lbl{font-size:7.5pt;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#8A8070}
  .stat-box .val{font-family:'Playfair Display',serif;font-size:15pt;font-weight:700;color:#1A1814;margin-top:3pt}
  .two-col{display:grid;grid-template-columns:1fr 1fr;gap:10pt}
  .party-box{border:1pt solid rgba(200,168,112,.25);background:#F5F0E8;padding:10pt;border-radius:3pt;
    -webkit-print-color-adjust:exact;print-color-adjust:exact}
  .party-box .ptitle{font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#8A8070;margin-bottom:7pt}
  .kv{display:flex;gap:6pt;padding:2.5pt 0;font-size:9.5pt}
  .kv .k{font-weight:600;color:#8A8070;min-width:95pt;flex-shrink:0}
  .kv .v{color:#1A1814}
  .sig-grid{display:grid;grid-template-columns:1fr 1fr;gap:28pt;margin-top:28pt}
  .sig-box .sib-title{font-size:8.5pt;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#8A8070;margin-bottom:20pt}
  .sig-line{border-bottom:1.5pt solid #C8A870;margin-bottom:5pt}
  .sig-name{font-size:9pt;color:#8A8070}
  .footer-text{text-align:center;font-size:8pt;color:#8A8070;margin-top:20pt;font-style:italic}
  .badge{display:inline-block;padding:2pt 6pt;background:#F5F0E8;color:#8A8070;
    border:0.7pt solid rgba(200,168,112,.35);border-radius:2pt;font-size:8pt;font-weight:600}
  .pre{white-space:pre-wrap;font-family:'Inter',sans-serif;font-size:9.5pt;color:#2E2A24;line-height:1.6}
`

/* ══════════════════════════════════════════════
   REPORT — HTML string builder
══════════════════════════════════════════════ */
function buildReportHTML(data: any, periodLabel: string): string {
  const now = new Date().toLocaleDateString("uz-UZ", { year:"numeric", month:"long", day:"numeric" })
  const fin = data.finance

  const clientIncomeMap: Record<string,number> = {}
  data.incomes?.forEach((inc: any) => {
    if (inc.clientId) clientIncomeMap[inc.clientId] = (clientIncomeMap[inc.clientId]??0) + inc.amount
  })

  const tableHdr = (cols: string[]) =>
    `<thead><tr>${cols.map(c=>`<th>${c}</th>`).join("")}</tr></thead>`
  const tableRows = (rows: string[][]) =>
    `<tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join("")}</tr>`).join("")}</tbody>`
  const tfoot = (label: string, val: string, cols: number) =>
    `<tfoot><tr><td colspan="${cols-1}"><strong>${label}</strong></td><td><strong>${val}</strong></td></tr></tfoot>`

  let html = `
  <div class="title-block">
    <h1>ARXITEKTOR KUNDALIGI — HISOBOT</h1>
    <p class="sub">${periodLabel}</p>
    <p class="sub" style="font-size:8.5pt;margin-top:3pt">${now}</p>
  </div>
  <hr class="gold-line">

  <h2 class="section-title">💰 Moliya Xulosasi</h2>
  <div class="stat-grid">
    <div class="stat-box">
      <div class="lbl">Jami Daromad</div>
      <div class="val">+${formatCurrency(fin.totalIncome)}</div>
    </div>
    <div class="stat-box">
      <div class="lbl">Jami Xarajat</div>
      <div class="val">-${formatCurrency(fin.totalExpense)}</div>
    </div>
    <div class="stat-box">
      <div class="lbl">Sof Foyda</div>
      <div class="val">${fin.profit>=0?"+":""}${formatCurrency(fin.profit)}</div>
    </div>
  </div>`

  if (data.incomes?.length) {
    html += `
  <h2 class="section-title">📈 Daromadlar Jadvali (${data.incomes.length} ta)</h2>
  <table>
    ${tableHdr(["#","Sana","Tavsif","Loyiha","Mijoz","Summa"])}
    ${tableRows(data.incomes.map((inc:any,i:number)=>[
      String(i+1), formatDate(inc.date),
      inc.description||(INCOME_CATEGORIES[inc.category as keyof typeof INCOME_CATEGORIES]??"—"),
      inc.project?.name??"—", inc.client?.name??"—",
      "+"+formatCurrency(inc.amount),
    ]))}
    ${tfoot("Jami Daromad", "+"+formatCurrency(data.incomes.reduce((s:number,i:any)=>s+i.amount,0)), 6)}
  </table>`
  }

  if (data.expenses?.length) {
    html += `
  <h2 class="section-title">📉 Xarajatlar Jadvali (${data.expenses.length} ta)</h2>
  <table>
    ${tableHdr(["#","Sana","Tavsif","Kategoriya","Summa"])}
    ${tableRows(data.expenses.map((exp:any,i:number)=>[
      String(i+1), formatDate(exp.date),
      exp.description??"—",
      EXPENSE_CATEGORIES[exp.category as keyof typeof EXPENSE_CATEGORIES]??exp.category??"—",
      "-"+formatCurrency(exp.amount),
    ]))}
    ${tfoot("Jami Xarajat", "-"+formatCurrency(data.expenses.reduce((s:number,e:any)=>s+e.amount,0)), 5)}
  </table>`
  }

  if (data.clients?.activeList?.length) {
    html += `
  <h2 class="section-title">👥 Mijozlar Faoliyati (${data.clients.activeList.length} ta)</h2>
  <table>
    ${tableHdr(["#","Mijoz ismi","Telefon","Manzil","Kelishilgan","Olingan","Qolgan"])}
    ${tableRows(data.clients.activeList.map((c:any,i:number)=>[
      String(i+1), c.name, c.phone??"—", c.address??"—",
      "—", "+"+formatCurrency(clientIncomeMap[c.id]??0), "—",
    ]))}
    ${tfoot("Jami olingan", "+"+formatCurrency(Object.values(clientIncomeMap).reduce((s,v)=>(s as number)+(v as number),0)), 7)}
  </table>`
  }

  if (data.projects?.list?.length) {
    html += `
  <h2 class="section-title">📐 Loyihalar (${data.projects.list.length} ta)</h2>
  <table>
    ${tableHdr(["#","Loyiha nomi","Mijoz","Holat","Byudjet"])}
    ${tableRows(data.projects.list.map((p:any,i:number)=>[
      String(i+1), p.name, p.client?.name??"—",
      PROJECT_STATUSES[p.status as keyof typeof PROJECT_STATUSES]?.label??p.status,
      p.budget?formatCurrency(p.budget):"—",
    ]))}
  </table>`
  }

  html += `
  <h2 class="section-title">✅ Vazifalar Xulosasi</h2>
  <table>
    ${tableHdr(["Ko'rsatkich","Soni"])}
    <tbody>
      <tr><td>Jami vazifalar</td><td>${data.tasks.total}</td></tr>
      <tr><td>Bajarilmagan</td><td>${data.tasks.todo}</td></tr>
      <tr><td>Jarayonda</td><td>${data.tasks.inProgress}</td></tr>
      <tr><td>Bajarildi</td><td>${data.tasks.done}</td></tr>
    </tbody>
  </table>

  <p class="footer-text">Arxitektor Kundaligi · ${now} · Hisobot</p>`

  return html
}

/* ══════════════════════════════════════════════
   CONTRACT — HTML string builder
══════════════════════════════════════════════ */
function buildContractHTML(c: any): string {
  const kv = (k: string, v: string) =>
    `<div class="kv"><span class="k">${k}</span><span class="v">${v||"—"}</span></div>`

  return `
  <div class="title-block">
    <h1>ARXITEKTURA XIZMATLARI SHARTNOMASI</h1>
    <p class="sub">Shartnoma № ${c.contractNumber}</p>
    <p class="sub" style="font-size:8.5pt;margin-top:3pt">Tuzilgan sana: ${formatDate(c.createdAt)}</p>
  </div>
  <hr class="gold-line">

  <div class="two-col" style="margin-bottom:10pt">
    <div class="party-box">
      <div class="ptitle">1 — Buyurtmachi</div>
      ${kv("Ism-sharif",  c.clientName)}
      ${c.clientPassport ? kv("Pasport",    c.clientPassport) : ""}
      ${c.clientPhone    ? kv("Telefon",    c.clientPhone)    : ""}
      ${c.clientAddress  ? kv("Manzil",     c.clientAddress)  : ""}
    </div>
    <div class="party-box">
      <div class="ptitle">2 — Ijrochi (Arxitektor)</div>
      ${kv("Ism-sharif",  c.architectName)}
      ${c.architectPhone   ? kv("Telefon", c.architectPhone)   : ""}
      ${c.architectAddress ? kv("Manzil",  c.architectAddress) : ""}
    </div>
  </div>

  <h2 class="section-title">📐 Loyiha Ma'lumotlari</h2>
  ${kv("Loyiha nomi",   c.projectName)}
  ${c.projectType    ? kv("Turi",       c.projectType)                         : ""}
  ${c.projectAddress ? kv("Manzil",     c.projectAddress)                      : ""}
  ${c.startDate      ? kv("Boshlanish", formatDate(c.startDate))               : ""}
  ${c.endDate        ? kv("Tugash",     formatDate(c.endDate))                 : ""}

  <h2 class="section-title">📋 Bajarilishi Kerak Bo'lgan Ishlar</h2>
  <div class="pre">${(c.workItems||"").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</div>

  <h2 class="section-title">💳 To'lov Shartlari</h2>
  ${kv("Jami summa",    formatCurrency(c.totalAmount))}
  ${c.advanceAmount>0 ? kv("Avans to'lov", formatCurrency(c.advanceAmount)) : ""}
  ${c.advanceAmount>0 ? kv("Qoldiq",        formatCurrency(c.totalAmount-c.advanceAmount)) : ""}

  ${c.terms ? `
  <h2 class="section-title">📄 Shartnoma Shartlari</h2>
  <div class="pre">${(c.terms||"").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</div>
  ` : ""}

  <h2 class="section-title">✍️ Imzolar</h2>
  <div class="sig-grid">
    <div class="sig-box">
      <div class="sib-title">Buyurtmachi</div>
      <div class="sig-line"></div>
      <div class="sig-name">${c.clientName}</div>
      <div class="sig-name" style="margin-top:4pt">Imzo / Sana: __________</div>
    </div>
    <div class="sig-box">
      <div class="sib-title">Ijrochi (Arxitektor)</div>
      <div class="sig-line"></div>
      <div class="sig-name">${c.architectName}</div>
      <div class="sig-name" style="margin-top:4pt">Imzo / Sana: __________</div>
    </div>
  </div>

  <div style="display:flex;justify-content:center;margin-top:18pt">
    <div style="width:70pt;height:70pt;border-radius:50%;border:2pt dashed rgba(200,168,112,.35);
      display:flex;align-items:center;justify-content:center;text-align:center">
      <span style="font-size:8pt;color:rgba(200,168,112,.5);line-height:1.4">Muhr<br>joyi</span>
    </div>
  </div>

  <p class="footer-text">Arxitektor Kundaligi · Shartnoma #${c.contractNumber} · ${formatDate(c.createdAt)}</p>`
}

/* ══════════════════════════════════════════════
   WORD EXPORT (.docx) via HTML Blob
   mimeType: application/vnd.ms-word  → opens in Word, saves as .doc
   For true .docx without library, we use the HTML → Word blob trick
══════════════════════════════════════════════ */
function downloadWordBlob(htmlBody: string, filename: string) {
  const fullHtml = `
<html xmlns:o='urn:schemas-microsoft-com:office:office'
      xmlns:w='urn:schemas-microsoft-com:office:word'
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='UTF-8'>
  <meta name=ProgId content=Word.Document>
  <meta name=Generator content='Microsoft Word 15'>
  <meta name=Originator content='Microsoft Word 15'>
  <style>
    ${SHARED_CSS}
    /* Word-specific */
    @page Section1 {
      size: 21cm 29.7cm;
      margin: 2.5cm 2.2cm 2.5cm 2.2cm;
    }
    div.Section1 { page: Section1; }
    body { margin: 0; }
    table { border-collapse: collapse; }
    p { margin: 0 0 4pt; }
  </style>
</head>
<body>
  <div class="Section1">
    ${htmlBody}
  </div>
</body>
</html>`

  const blob = new Blob(["\ufeff", fullHtml], {
    type: "application/vnd.ms-word;charset=utf-8",
  })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement("a")
  a.href     = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/* ══════════════════════════════════════════════
   PUBLIC API
══════════════════════════════════════════════ */

/** Export report as Word (.doc) */
export function exportReportToWord(data: any, periodLabel: string) {
  const html = buildReportHTML(data, periodLabel)
  downloadWordBlob(html, `hisobot-${periodLabel.replace(/[\s/]/g, "-")}.doc`)
}

/** Export contract as Word (.doc) */
export function exportContractToWord(contract: any) {
  const html = buildContractHTML(contract)
  downloadWordBlob(html, `shartnoma-${contract.contractNumber}.doc`)
}

/** Print as PDF — opens a clean print window with full CSS */
export function printAsPDF(elementId: string, _filename: string) {
  const contentEl = document.getElementById(elementId)
  if (!contentEl) { window.print(); return }

  /* We always build from data to keep PDF clean and single-page optimised */
  const html = contentEl.innerHTML

  const printWin = window.open("", "_blank", "width=850,height=1100,scrollbars=yes")
  if (!printWin) { window.print(); return }

  printWin.document.write(`<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8"/>
  <title>Print</title>
  <style>
    ${SHARED_CSS}

    /* ── PDF-specific: single A4, tight margins ── */
    html, body {
      width: 210mm;
      background: white !important;
    }
    body {
      padding: 14mm 16mm 14mm 16mm;
      font-size: 10pt;
    }

    @page {
      size: A4 portrait;
      margin: 12mm 14mm 14mm 14mm;
    }

    /* Force single page for short contracts */
    .title-block { margin-bottom: 10pt; }
    .section-title { margin: 10pt 0 4pt; font-size: 11pt; }
    .two-col { gap: 8pt; }
    .party-box { padding: 7pt 9pt; }
    .sig-grid  { margin-top: 18pt; }
    table { font-size: 8.5pt; }
    thead th { padding: 5pt 8pt; font-size: 7pt; }
    tbody td  { padding: 4pt 8pt; }

    /* Reduce spacing for single page */
    .gold-line { margin: 7pt 0; }
    .kv        { padding: 2pt 0; font-size: 9pt; }
    .pre       { font-size: 8.5pt; line-height: 1.45; }
    .stat-grid { gap: 6pt; }
    .stat-box  { padding: 7pt 9pt; }
    .stat-box .val { font-size: 12pt; }

    /* No extra whitespace at bottom */
    .footer-text { margin-top: 12pt; }

    /* Don't show browser UI in print */
    @media print {
      .no-print { display: none !important; }
      html, body { width: 100% !important; padding: 0 !important; }
    }
  </style>
</head>
<body>
  ${html}
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.focus();
        window.print();
      }, 400);
    };
  </script>
</body>
</html>`)
  printWin.document.close()
}

/** Build & print report PDF (uses internal HTML builder for clean output) */
export function printReportPDF(data: any, periodLabel: string) {
  const html = buildReportHTML(data, periodLabel)
  const printWin = window.open("", "_blank", "width=850,height=1100")
  if (!printWin) return
  printWin.document.write(`<!DOCTYPE html><html lang="uz"><head><meta charset="UTF-8"/><title>Hisobot</title>
<style>
  ${SHARED_CSS}
  html,body{background:white!important}
  body{padding:14mm 16mm;font-size:10pt}
  @page{size:A4 portrait;margin:12mm 14mm}
  .section-title{margin:10pt 0 4pt;font-size:11.5pt}
  table{font-size:8.5pt}
  thead th{padding:5pt 8pt;font-size:7pt}
  tbody td{padding:4pt 8pt}
  .stat-box .val{font-size:13pt}
  @media print{html,body{padding:0!important}}
</style></head><body>
  ${html}
  <script>window.onload=function(){setTimeout(function(){window.focus();window.print();},400)}</script>
</body></html>`)
  printWin.document.close()
}

/** Build & print contract PDF (uses internal HTML builder for clean single-page output) */
export function printContractPDF(contract: any) {
  const html = buildContractHTML(contract)
  const printWin = window.open("", "_blank", "width=850,height=1100")
  if (!printWin) return
  printWin.document.write(`<!DOCTYPE html><html lang="uz"><head><meta charset="UTF-8"/><title>Shartnoma</title>
<style>
  ${SHARED_CSS}
  html,body{background:white!important}
  body{padding:12mm 15mm;font-size:10pt}
  @page{size:A4 portrait;margin:10mm 13mm}
  .title-block{margin-bottom:8pt}
  .section-title{margin:8pt 0 4pt;font-size:11pt}
  .two-col{gap:7pt}
  .party-box{padding:7pt 9pt}
  .kv{padding:1.5pt 0;font-size:9pt}
  .pre{font-size:8.5pt;line-height:1.4}
  .sig-grid{margin-top:14pt}
  .gold-line{margin:6pt 0}
  table{font-size:8.5pt}
  thead th{padding:5pt 8pt;font-size:7pt}
  tbody td{padding:4pt 8pt}
  .footer-text{margin-top:10pt;font-size:7.5pt}
  @media print{html,body{padding:0!important}}
</style></head><body>
  ${html}
  <script>window.onload=function(){setTimeout(function(){window.focus();window.print();},400)}</script>
</body></html>`)
  printWin.document.close()
}
