/**
 * Export utility — Word (.docx) + PDF
 * Uses: docx + file-saver + browser print API
 */

import { formatDate, formatCurrency, PROJECT_STATUSES, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "./utils"

/* ════════════════════════════════════════════════
   WORD EXPORT — using docx library
════════════════════════════════════════════════ */

export async function exportReportToWord(data: any, periodLabel: string) {
  const { Document, Packer, Paragraph, Table, TableRow, TableCell,
    TextRun, HeadingLevel, AlignmentType, BorderStyle, WidthType,
    ShadingType, convertInchesToTwip, Header, Footer, PageNumber } = await import("docx")
  const { saveAs } = await import("file-saver")

  const GOLD  = "C8A870"
  const CREAM = "F5F0E8"
  const INK   = "1A1814"
  const STONE = "8A8070"
  const WHITE = "FFFFFF"

  /* Helper: heading */
  const h1 = (text: string) => new Paragraph({
    children: [new TextRun({ text, bold: true, size: 28, color: INK, font: "Georgia" })],
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 200, after: 160 },
    border: { bottom: { color: GOLD, size: 8, style: BorderStyle.SINGLE, space: 4 } },
  })

  const h2 = (text: string) => new Paragraph({
    children: [new TextRun({ text: `◆  ${text}`, bold: true, size: 22, color: INK })],
    spacing: { before: 300, after: 100 },
  })

  const p = (text: string, opts: any = {}) => new Paragraph({
    children: [new TextRun({ text, size: 20, color: opts.color || INK, ...opts })],
    spacing: { before: 40, after: 40 },
  })

  const divider = () => new Paragraph({
    border: { bottom: { color: GOLD, size: 4, style: BorderStyle.SINGLE, space: 2 } },
    spacing: { before: 120, after: 120 },
  })

  /* Helper: table */
  const makeTable = (headers: string[], rows: string[][]) => new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map(h => new TableCell({
          children: [new Paragraph({
            children: [new TextRun({ text: h.toUpperCase(), bold: true, size: 16, color: STONE })],
            alignment: AlignmentType.LEFT,
          })],
          shading: { fill: CREAM, type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
        })),
      }),
      ...rows.map(row => new TableRow({
        children: row.map(cell => new TableCell({
          children: [new Paragraph({
            children: [new TextRun({ text: String(cell), size: 18, color: INK })],
          })],
          margins: { top: 60, bottom: 60, left: 120, right: 120 },
        })),
      })),
    ],
  })

  /* ── Build document ── */
  const children: any[] = []

  /* Title */
  children.push(
    new Paragraph({
      children: [new TextRun({ text: "🏛  ARXITEKTOR KUNDALIGI", bold: true, size: 36, color: GOLD })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 80 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "HISOBOT", bold: true, size: 28, color: INK })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [new TextRun({ text: periodLabel, size: 22, color: STONE })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [new TextRun({
        text: new Date().toLocaleDateString("uz-UZ", { year: "numeric", month: "long", day: "numeric" }),
        size: 18, color: STONE,
      })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    divider(),
  )

  /* Finance summary */
  children.push(h2("MOLIYA XULOSASI"))
  const fin = data.finance
  children.push(makeTable(
    ["Ko'rsatkich", "Summa"],
    [
      ["Jami Daromad",  formatCurrency(fin.totalIncome)],
      ["Jami Xarajat",  formatCurrency(fin.totalExpense)],
      ["Sof Foyda",     formatCurrency(fin.profit)],
    ]
  ), divider())

  /* Income table */
  if (data.incomes?.length) {
    children.push(h2(`DAROMADLAR (${data.incomes.length} ta)`))
    children.push(makeTable(
      ["#", "Sana", "Tavsif", "Loyiha", "Mijoz", "Summa"],
      data.incomes.map((inc: any, i: number) => [
        String(i + 1),
        formatDate(inc.date),
        inc.description || (INCOME_CATEGORIES[inc.category as keyof typeof INCOME_CATEGORIES] ?? "—"),
        inc.project?.name ?? "—",
        inc.client?.name ?? "—",
        "+" + formatCurrency(inc.amount),
      ])
    ), divider())
  }

  /* Expense table */
  if (data.expenses?.length) {
    children.push(h2(`XARAJATLAR (${data.expenses.length} ta)`))
    children.push(makeTable(
      ["#", "Sana", "Tavsif", "Kategoriya", "Summa"],
      data.expenses.map((exp: any, i: number) => [
        String(i + 1),
        formatDate(exp.date),
        exp.description || "—",
        EXPENSE_CATEGORIES[exp.category as keyof typeof EXPENSE_CATEGORIES] ?? exp.category ?? "—",
        "-" + formatCurrency(exp.amount),
      ])
    ), divider())
  }

  /* Client activity */
  if (data.clients?.activeList?.length) {
    const clientIncomeMap: Record<string, number> = {}
    data.incomes?.forEach((inc: any) => {
      if (inc.clientId) clientIncomeMap[inc.clientId] = (clientIncomeMap[inc.clientId] ?? 0) + inc.amount
    })
    children.push(h2(`MIJOZLAR FAOLIYATI (${data.clients.activeList.length} ta)`))
    children.push(makeTable(
      ["#", "Mijoz ismi", "Telefon", "Manzil", "Kelishilgan summa", "Olingan summa", "Qolgan summa"],
      data.clients.activeList.map((c: any, i: number) => [
        String(i + 1),
        c.name,
        c.phone ?? "—",
        c.address ?? "—",
        "—",
        "+" + formatCurrency(clientIncomeMap[c.id] ?? 0),
        "—",
      ])
    ), divider())
  }

  /* Projects */
  if (data.projects?.list?.length) {
    children.push(h2(`LOYIHALAR (${data.projects.list.length} ta)`))
    children.push(makeTable(
      ["#", "Loyiha nomi", "Mijoz", "Holat", "Byudjet"],
      data.projects.list.map((pr: any, i: number) => [
        String(i + 1),
        pr.name,
        pr.client?.name ?? "—",
        PROJECT_STATUSES[pr.status as keyof typeof PROJECT_STATUSES]?.label ?? pr.status,
        pr.budget ? formatCurrency(pr.budget) : "—",
      ])
    ), divider())
  }

  /* Tasks */
  children.push(h2("VAZIFALAR XULOSASI"))
  children.push(makeTable(
    ["Ko'rsatkich", "Soni"],
    [
      ["Jami vazifalar",    String(data.tasks.total)],
      ["Bajarilmagan",     String(data.tasks.todo)],
      ["Jarayonda",        String(data.tasks.inProgress)],
      ["Bajarildi",        String(data.tasks.done)],
    ]
  ))

  /* Footer */
  children.push(
    new Paragraph({ text: "", spacing: { before: 400 } }),
    new Paragraph({
      children: [new TextRun({
        text: `Arxitektor Kundaligi  ·  ${new Date().toLocaleDateString("uz-UZ")}`,
        size: 16, color: STONE, italics: true,
      })],
      alignment: AlignmentType.CENTER,
    }),
  )

  const doc = new Document({
    sections: [{
      properties: {},
      children,
    }],
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 20, color: INK },
        },
      },
    },
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `hisobot-${periodLabel.replace(/\s+/g, "-")}.docx`)
}

/* ════════════════════════════════════════════════
   CONTRACT → WORD
════════════════════════════════════════════════ */

export async function exportContractToWord(contract: any) {
  const { Document, Packer, Paragraph, Table, TableRow, TableCell,
    TextRun, HeadingLevel, AlignmentType, BorderStyle, WidthType,
    ShadingType, convertMillimetersToTwip } = await import("docx")
  const { saveAs } = await import("file-saver")

  const GOLD  = "C8A870"
  const CREAM = "F5F0E8"
  const INK   = "1A1814"
  const STONE = "8A8070"

  const p = (text: string, opts: any = {}) => new Paragraph({
    children: [new TextRun({ text, size: opts.size || 20, color: opts.color || INK,
      bold: opts.bold, italics: opts.italics })],
    alignment: opts.align || AlignmentType.LEFT,
    spacing: { before: opts.before || 60, after: opts.after || 60 },
    ...(opts.border ? { border: { bottom: { color: GOLD, size: 4, style: BorderStyle.SINGLE, space: 2 } } } : {}),
  })

  const divider = () => new Paragraph({
    border: { bottom: { color: GOLD, size: 4, style: BorderStyle.SINGLE, space: 2 } },
    spacing: { before: 160, after: 160 },
  })

  const kv = (key: string, val: string) => new Paragraph({
    children: [
      new TextRun({ text: key + ":  ", bold: true, size: 18, color: STONE }),
      new TextRun({ text: val, size: 19, color: INK }),
    ],
    spacing: { before: 50, after: 50 },
  })

  const party = (num: string, title: string, fields: [string, string][]) => new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [new TableCell({
        columnSpan: 2,
        children: [new Paragraph({
          children: [new TextRun({ text: `${num}. ${title.toUpperCase()}`, bold: true, size: 20, color: STONE })],
        })],
        shading: { fill: CREAM, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 140, right: 140 },
      })]}),
      ...fields.map(([k, v]) => new TableRow({ children: [
        new TableCell({
          width: { size: 35, type: WidthType.PERCENTAGE },
          children: [new Paragraph({
            children: [new TextRun({ text: k, bold: true, size: 18, color: STONE })],
          })],
          margins: { top: 60, bottom: 60, left: 140, right: 80 },
        }),
        new TableCell({
          width: { size: 65, type: WidthType.PERCENTAGE },
          children: [new Paragraph({
            children: [new TextRun({ text: v, size: 19, color: INK })],
          })],
          margins: { top: 60, bottom: 60, left: 80, right: 140 },
        }),
      ]})),
    ],
  })

  const children: any[] = [
    /* Title block */
    new Paragraph({
      children: [new TextRun({ text: "ARXITEKTURA XIZMATLARI SHARTNOMASI", bold: true, size: 32, color: GOLD })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 80 },
    }),
    new Paragraph({
      children: [new TextRun({ text: `Shartnoma № ${contract.contractNumber}`, size: 22, color: INK, bold: true })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [new TextRun({ text: `Tuzilgan sana: ${formatDate(contract.createdAt)}`, size: 18, color: STONE })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    divider(),

    /* Parties */
    p("1-QISM: TOMONLAR MA'LUMOTLARI", { bold: true, size: 24, border: true }),
    new Paragraph({ text: "", spacing: { before: 160, after: 0 } }),

    party("1", "Buyurtmachi", [
      ["Ism-sharif",  contract.clientName    || "—"],
      ["Pasport",     contract.clientPassport || "—"],
      ["Telefon",     contract.clientPhone   || "—"],
      ["Manzil",      contract.clientAddress || "—"],
    ]),
    new Paragraph({ text: "", spacing: { before: 160, after: 0 } }),

    party("2", "Ijrochi (Arxitektor)", [
      ["Ism-sharif",  contract.architectName    || "—"],
      ["Telefon",     contract.architectPhone   || "—"],
      ["Manzil",      contract.architectAddress || "—"],
    ]),
    divider(),

    /* Project */
    p("2-QISM: LOYIHA MA'LUMOTLARI", { bold: true, size: 24, border: true }),
    new Paragraph({ text: "", spacing: { before: 80, after: 0 } }),
    kv("Loyiha nomi",   contract.projectName    || "—"),
    kv("Loyiha turi",   contract.projectType    || "—"),
    kv("Manzil",        contract.projectAddress || "—"),
    kv("Boshlanish",    contract.startDate ? formatDate(contract.startDate) : "—"),
    kv("Tugash sanasi", contract.endDate   ? formatDate(contract.endDate)   : "—"),
    divider(),

    /* Work items */
    p("3-QISM: BAJARILISHI KERAK BO'LGAN ISHLAR", { bold: true, size: 24, border: true }),
    new Paragraph({ text: "", spacing: { before: 100, after: 0 } }),
    new Paragraph({
      children: [new TextRun({ text: contract.workItems || "—", size: 19, color: INK })],
      spacing: { before: 60, after: 60 },
    }),
    divider(),

    /* Payment */
    p("4-QISM: TO'LOV SHARTLARI", { bold: true, size: 24, border: true }),
    new Paragraph({ text: "", spacing: { before: 80, after: 0 } }),
    kv("Jami summa",  formatCurrency(contract.totalAmount)),
  ]

  if (contract.advanceAmount > 0) {
    children.push(
      kv("Avans to'lov", formatCurrency(contract.advanceAmount)),
      kv("Qoldiq",       formatCurrency(contract.totalAmount - contract.advanceAmount)),
    )
  }
  children.push(divider())

  /* Terms */
  if (contract.terms) {
    children.push(
      p("5-QISM: SHARTNOMA SHARTLARI", { bold: true, size: 24, border: true }),
      new Paragraph({ text: "", spacing: { before: 80, after: 0 } }),
      new Paragraph({
        children: [new TextRun({ text: contract.terms, size: 19, color: INK })],
        spacing: { before: 60, after: 200 },
      }),
      divider(),
    )
  }

  /* Signatures */
  children.push(
    p("6-QISM: IMZOLAR", { bold: true, size: 24, border: true }),
    new Paragraph({ text: "", spacing: { before: 200, after: 0 } }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              p("Buyurtmachi:", { bold: true }),
              new Paragraph({ text: "", spacing: { before: 20, after: 20 } }),
              new Paragraph({
                border: { bottom: { color: GOLD, size: 6, style: BorderStyle.SINGLE, space: 1 } },
                spacing: { before: 100, after: 60 },
                children: [],
              }),
              p(contract.clientName, { size: 18, color: STONE }),
              p("Imzo / Sana: _______________", { size: 16, color: STONE }),
            ],
            margins: { top: 60, bottom: 60, left: 0, right: 200 },
            borders: { top: {style: BorderStyle.NONE}, bottom: {style: BorderStyle.NONE}, left: {style: BorderStyle.NONE}, right: {style: BorderStyle.NONE} },
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              p("Ijrochi (Arxitektor):", { bold: true }),
              new Paragraph({ text: "", spacing: { before: 20, after: 20 } }),
              new Paragraph({
                border: { bottom: { color: GOLD, size: 6, style: BorderStyle.SINGLE, space: 1 } },
                spacing: { before: 100, after: 60 },
                children: [],
              }),
              p(contract.architectName, { size: 18, color: STONE }),
              p("Imzo / Sana: _______________", { size: 16, color: STONE }),
            ],
            margins: { top: 60, bottom: 60, left: 200, right: 0 },
            borders: { top: {style: BorderStyle.NONE}, bottom: {style: BorderStyle.NONE}, left: {style: BorderStyle.NONE}, right: {style: BorderStyle.NONE} },
          }),
        ]}),
      ],
    }),
    new Paragraph({ text: "", spacing: { before: 400, after: 0 } }),
    new Paragraph({
      children: [new TextRun({
        text: `Arxitektor Kundaligi  ·  Shartnoma #${contract.contractNumber}  ·  ${formatDate(contract.createdAt)}`,
        size: 16, color: STONE, italics: true,
      })],
      alignment: AlignmentType.CENTER,
    }),
  )

  const doc = new Document({
    sections: [{ properties: {}, children }],
    styles: {
      default: {
        document: { run: { font: "Calibri", size: 20, color: INK } },
      },
    },
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `shartnoma-${contract.contractNumber}.docx`)
}

/* ════════════════════════════════════════════════
   PDF — proper print-based approach
   Creates a hidden iframe with full styles and prints it
════════════════════════════════════════════════ */

export function printAsPDF(elementId: string, filename: string) {
  const el = document.getElementById(elementId)
  if (!el) return

  const html = el.innerHTML

  const printWindow = window.open("", "_blank", "width=900,height=700")
  if (!printWindow) { window.print(); return }

  printWindow.document.write(`<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8"/>
  <title>${filename}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Cormorant+Garamond:wght@400;600&family=Inter:wght@400;500;600&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
      font-size: 12pt;
      color: #1A1814;
      background: white;
      padding: 18mm 20mm;
      line-height: 1.5;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    h1, h2, h3 {
      font-family: 'Playfair Display', Georgia, serif;
      color: #1A1814;
      letter-spacing: -0.02em;
    }

    /* Tables */
    table { width: 100%; border-collapse: collapse; margin: 8pt 0; font-size: 10pt; }
    thead tr { background: #F5F0E8 !important; -webkit-print-color-adjust: exact; }
    thead th {
      padding: 7pt 10pt; text-align: left;
      font-size: 8pt; font-weight: 700;
      letter-spacing: 0.1em; text-transform: uppercase;
      color: #8A8070;
      border-bottom: 1.5pt solid #C8A870;
    }
    tbody tr { border-bottom: 0.5pt solid rgba(200,168,112,0.15); }
    tbody tr:hover { background: #faf8f4; }
    tbody td { padding: 6pt 10pt; font-size: 10pt; color: #2E2A24; }

    /* Cards */
    .card-premium, .arch-card {
      background: white; border: 1pt solid rgba(200,168,112,0.25);
      border-radius: 4pt; padding: 14pt; margin-bottom: 12pt;
    }

    /* Section titles */
    .section-title {
      font-family: 'Playfair Display', serif;
      font-size: 14pt; font-weight: 700;
      color: #1A1814; margin: 14pt 0 8pt;
      border-bottom: 1pt solid rgba(200,168,112,0.3);
      padding-bottom: 4pt;
    }

    /* Contract-specific */
    .contract-header { text-align: center; padding: 16pt; }
    .contract-header h1 { font-size: 18pt; color: #1A1814; }
    .contract-header .sub { color: #8A8070; font-size: 11pt; }

    .party-box {
      border: 1pt solid rgba(200,168,112,0.25);
      background: #F5F0E8;
      padding: 10pt; border-radius: 3pt;
    }
    .party-title { font-weight: 700; font-size: 9pt; text-transform: uppercase;
      letter-spacing: 0.08em; color: #8A8070; margin-bottom: 6pt; }
    .kv-row { display: flex; gap: 8pt; padding: 3pt 0; font-size: 10pt; }
    .kv-key { font-weight: 600; color: #8A8070; min-width: 110pt; }
    .kv-val { color: #1A1814; }

    .sig-row { display: flex; gap: 24pt; margin-top: 24pt; }
    .sig-box { flex: 1; }
    .sig-line { border-bottom: 1.5pt solid #C8A870; margin: 28pt 0 4pt; }

    /* Totals */
    .total-row td { font-weight: 700 !important; color: #1A1814 !important;
      border-top: 1pt solid rgba(200,168,112,0.35); background: rgba(200,168,112,0.05); }

    .gold-line {
      border: none; border-top: 1pt solid #C8A870;
      margin: 10pt 0; opacity: 0.5;
    }

    .text-gold { color: #C8A870; }
    .text-stone { color: #8A8070; }
    .text-ink { color: #1A1814; }
    .font-serif { font-family: 'Playfair Display', serif; }
    .text-center { text-align: center; }
    .font-bold { font-weight: 700; }
    .text-sm { font-size: 9pt; }
    .text-xs { font-size: 8pt; }

    /* Frieze */
    .frieze-band {
      background: rgba(200,168,112,0.06);
      border-top: 1pt solid rgba(200,168,112,0.2);
      border-bottom: 1pt solid rgba(200,168,112,0.2);
      padding: 4pt 0;
      font-size: 7pt; letter-spacing: 0.2em;
      text-transform: uppercase; color: #8A8070;
      text-align: center;
    }

    /* Status badges */
    [class*="bg-[var"] {
      background: #F5F0E8 !important;
      color: #8A8070 !important;
      border: 1pt solid rgba(200,168,112,0.3) !important;
    }

    @page {
      margin: 15mm 18mm;
      size: A4;
    }
    @media print {
      .no-print { display: none !important; }
      body { padding: 0; }
    }
  </style>
</head>
<body>
  ${html}
  <script>
    setTimeout(function() {
      window.focus();
      window.print();
      setTimeout(function() { window.close(); }, 800);
    }, 600);
  </script>
</body>
</html>`)

  printWindow.document.close()
}
