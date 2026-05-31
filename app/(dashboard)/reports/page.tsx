"use client"
import { useState, useCallback, useEffect } from "react"
import { BarChart3, Download, TrendingUp, TrendingDown, DollarSign, RefreshCw, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn, formatCurrency, formatDate, PROJECT_STATUSES, TASK_STATUSES, TASK_PRIORITIES, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/utils"

const MONTHS = ["Yanvar","Fevral","Mart","Aprel","May","Iyun","Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr"]

function SectionTitle({ emoji, title, count }: { emoji: string; title: string; count?: number }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-xl">{emoji}</span>
      <h3 className="font-bold text-[#3d2800] dark:text-amber-100 text-base">{title}</h3>
      {count !== undefined && (
        <span className="ml-1 text-xs bg-[#B8860B]/10 text-[#B8860B] px-2 py-0.5 rounded-full font-semibold">{count} ta</span>
      )}
    </div>
  )
}

function TableWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[#B8860B]/15">
      <table className="w-full text-sm">{children}</table>
    </div>
  )
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={cn("px-4 py-3 text-left text-xs font-bold text-white bg-[#0A2342] first:rounded-tl-2xl last:rounded-tr-2xl", className)}>
      {children}
    </th>
  )
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={cn("px-4 py-3 border-b border-[#B8860B]/10 text-[#3d2800] dark:text-amber-100 text-sm", className)}>
      {children}
    </td>
  )
}

function Tr({ children, className }: { children: React.ReactNode; className?: string }) {
  return <tr className={cn("hover:bg-[#B8860B]/5 transition-colors", className)}>{children}</tr>
}

function TotalRow({ children }: { children: React.ReactNode }) {
  return <tr className="bg-[#0A2342]/5 dark:bg-[#B8860B]/5 font-bold">{children}</tr>
}


export default function ReportsPage() {
  const [type,    setType]    = useState("monthly")
  const [year,    setYear]    = useState(new Date().getFullYear())
  const [month,   setMonth]   = useState(new Date().getMonth() + 1)
  const [week,    setWeek]    = useState(1)
  const [data,    setData]    = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ type, year: String(year), month: String(month), week: String(week) })
      const res = await fetch(`/api/reports?${params}`)
      const json = await res.json()
      setData(json)
    } finally { setLoading(false) }
  }, [type, year, month, week])

  const years = [year - 1, year, year + 1]

  const periodLabel = !mounted ? "" : (
    type === "weekly"
      ? `${MONTHS[month - 1]} ${week}-hafta, ${year}`
      : type === "monthly"
      ? `${MONTHS[month - 1]} ${year}`
      : `${year} yil`
  )

  // Per-client income map
  const clientIncomeMap: Record<string, number> = {}
  if (data?.incomes) {
    for (const inc of data.incomes) {
      if (inc.clientId) {
        clientIncomeMap[inc.clientId] = (clientIncomeMap[inc.clientId] ?? 0) + inc.amount
      }
    }
  }

  const totalIncomeSum = data?.incomes?.reduce((s: number, i: any) => s + i.amount, 0) ?? 0
  const totalExpenseSum = data?.expenses?.reduce((s: number, e: any) => s + e.amount, 0) ?? 0

  return (
    <div className="space-y-6 page-enter">
      {/* ── Header ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#8a5a00] via-[#5a3a00] to-[#0A2342] p-8 text-white no-print">
        <div className="absolute inset-0 pointer-events-none opacity-[0.06]" style={{backgroundImage:`url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolygon points='20,2 38,11 38,29 20,38 2,29 2,11' fill='none' stroke='%23B8860B' stroke-width='0.5'/%3E%3C/svg%3E")`}}/>
        <div className="relative z-10 flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-amber-200" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Hisobotlar</h2>
              <p className="text-amber-200/70 text-sm">Jadval ko'rinishida moliya va faoliyat tahlili</p>
            </div>
          </div>
          {data && (
            <Button onClick={() => window.print()}
              className="bg-white text-[#8a5a00] hover:bg-amber-50 gap-2 rounded-xl font-bold shadow-lg no-print">
              <Printer className="h-4 w-4" /> PDF yuklab olish
            </Button>
          )}
        </div>


        {/* Filters */}
        <div className="relative z-10 flex flex-wrap gap-3 mt-6 no-print">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-36 h-10 rounded-xl bg-white/15 border-white/25 text-white text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Haftalik</SelectItem>
              <SelectItem value="monthly">Oylik</SelectItem>
              <SelectItem value="yearly">Yillik</SelectItem>
            </SelectContent>
          </Select>
          <Select value={String(year)} onValueChange={v => setYear(+v)}>
            <SelectTrigger className="w-24 h-10 rounded-xl bg-white/15 border-white/25 text-white text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>{years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
          </Select>
          {(type === "monthly" || type === "weekly") && (
            <Select value={String(month)} onValueChange={v => setMonth(+v)}>
              <SelectTrigger className="w-36 h-10 rounded-xl bg-white/15 border-white/25 text-white text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>{MONTHS.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}</SelectContent>
            </Select>
          )}
          {type === "weekly" && (
            <Select value={String(week)} onValueChange={v => setWeek(+v)}>
              <SelectTrigger className="w-28 h-10 rounded-xl bg-white/15 border-white/25 text-white text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>{[1,2,3,4,5].map(w => <SelectItem key={w} value={String(w)}>{w}-hafta</SelectItem>)}</SelectContent>
            </Select>
          )}
          <Button onClick={load} disabled={loading}
            className="bg-white text-[#8a5a00] hover:bg-amber-50 gap-2 rounded-xl h-10 px-5 font-semibold">
            {loading ? <><RefreshCw className="h-4 w-4 animate-spin" /> Yuklanmoqda...</>
              : <><BarChart3 className="h-4 w-4" /> Hisobotni ko'rish</>}
          </Button>
        </div>
      </div>

      {/* ── Empty state ── */}
      {!data && !loading && (
        <div className="flex flex-col items-center justify-center py-24 text-amber-400/50">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-lg font-semibold text-amber-700/60 dark:text-amber-400/60">Davr tanlang va hisobotni ko'ring</p>
          <p className="text-sm mt-1">Haftalik, oylik yoki yillik hisobot</p>
        </div>
      )}


      {/* ── Report content ── */}
      {data && (
        <div className="space-y-8">

          {/* Print header */}
          <div className="hidden print:block text-center mb-6 border-b-2 border-[#B8860B] pb-4">
            <h1 className="text-2xl font-bold text-[#0A2342]">🏛️ ARXITEKTOR KUNDALIGI — HISOBOT</h1>
            <p className="text-base font-semibold mt-1 text-[#3d2800]">{periodLabel}</p>
            <p className="text-xs text-gray-500 mt-0.5">Yaratilgan: {mounted ? new Date().toLocaleDateString("uz-UZ", { year:"numeric", month:"long", day:"numeric" }) : ""}</p>
          </div>

          {/* ─── SECTION A: Finance Summary ─── */}
          <section>
            <SectionTitle emoji="💰" title="Moliya Xulosasi" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label:"Jami Daromad",  value: data.finance.totalIncome,  icon: TrendingUp,   color:"text-emerald-700 dark:text-emerald-400", bg:"bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40", bar:"bg-emerald-500" },
                { label:"Jami Xarajat",  value: data.finance.totalExpense, icon: TrendingDown,  color:"text-red-600 dark:text-red-400",         bg:"bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/40",             bar:"bg-red-500" },
                {
                  label:"Sof Foyda",
                  value: data.finance.profit,
                  icon: DollarSign,
                  color: data.finance.profit >= 0 ? "text-blue-700 dark:text-blue-400" : "text-orange-600 dark:text-orange-400",
                  bg:    data.finance.profit >= 0 ? "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/40" : "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800/40",
                  bar:   data.finance.profit >= 0 ? "bg-blue-500" : "bg-orange-500",
                },
              ].map(s => (
                <div key={s.label} className={cn("arch-card relative overflow-hidden border p-5", s.bg)}>
                  <div className={cn("absolute top-0 left-0 right-0 h-1", s.bar)} />
                  <div className="flex items-center gap-3 mb-2">
                    <s.icon className={cn("h-5 w-5", s.color)} />
                    <p className="text-xs font-semibold text-[#B8860B]/70 uppercase tracking-wider">{s.label}</p>
                  </div>
                  <p className={cn("text-2xl font-bold", s.color)}>{formatCurrency(Math.abs(s.value))}</p>
                  {s.label === "Sof Foyda" && (
                    <p className="text-xs mt-1 opacity-70">{data.finance.profit >= 0 ? "✅ Ijobiy natija" : "⚠️ Zarar"}</p>
                  )}
                </div>
              ))}
            </div>
          </section>


          {/* ─── SECTION B: Income Table ─── */}
          <section className="arch-card p-5">
            <SectionTitle emoji="📈" title="Daromadlar Jadvali" count={data.incomes.length} />
            {data.incomes.length === 0 ? (
              <p className="text-center text-amber-400/50 py-8 text-sm">Bu davrda daromad yo'q</p>
            ) : (
              <TableWrapper>
                <thead>
                  <tr>
                    <Th className="w-10">№</Th>
                    <Th>Sana</Th>
                    <Th>Tavsif</Th>
                    <Th>Loyiha</Th>
                    <Th>Mijoz</Th>
                    <Th className="text-right">Summa</Th>
                  </tr>
                </thead>
                <tbody>
                  {data.incomes.map((inc: any, i: number) => (
                    <Tr key={inc.id}>
                      <Td className="text-amber-600/50 font-mono">{i + 1}</Td>
                      <Td className="whitespace-nowrap">{formatDate(inc.date)}</Td>
                      <Td>{inc.description || (INCOME_CATEGORIES[inc.category as keyof typeof INCOME_CATEGORIES] ?? inc.category ?? "—")}</Td>
                      <Td>{inc.project?.name ?? "—"}</Td>
                      <Td>{inc.client?.name ?? "—"}</Td>
                      <Td className="text-right font-bold text-emerald-600 whitespace-nowrap">+{formatCurrency(inc.amount)}</Td>
                    </Tr>
                  ))}
                </tbody>
                <tfoot>
                  <TotalRow>
                    <Td className="text-xs text-amber-600/50 font-mono" />
                    <Td colSpan={4} className="font-bold text-[#0A2342] dark:text-amber-100 text-sm">Jami Daromad</Td>
                    <Td className="text-right font-bold text-emerald-700 text-base whitespace-nowrap">+{formatCurrency(totalIncomeSum)}</Td>
                  </TotalRow>
                </tfoot>
              </TableWrapper>
            )}
          </section>

          {/* ─── SECTION C: Expense Table ─── */}
          <section className="arch-card p-5">
            <SectionTitle emoji="📉" title="Xarajatlar Jadvali" count={data.expenses.length} />
            {data.expenses.length === 0 ? (
              <p className="text-center text-amber-400/50 py-8 text-sm">Bu davrda xarajat yo'q</p>
            ) : (
              <TableWrapper>
                <thead>
                  <tr>
                    <Th className="w-10">№</Th>
                    <Th>Sana</Th>
                    <Th>Tavsif</Th>
                    <Th>Kategoriya</Th>
                    <Th className="text-right">Summa</Th>
                  </tr>
                </thead>
                <tbody>
                  {data.expenses.map((exp: any, i: number) => (
                    <Tr key={exp.id}>
                      <Td className="text-amber-600/50 font-mono">{i + 1}</Td>
                      <Td className="whitespace-nowrap">{formatDate(exp.date)}</Td>
                      <Td>{exp.description || "—"}</Td>
                      <Td>{EXPENSE_CATEGORIES[exp.category as keyof typeof EXPENSE_CATEGORIES] ?? exp.category ?? "—"}</Td>
                      <Td className="text-right font-bold text-red-500 whitespace-nowrap">-{formatCurrency(exp.amount)}</Td>
                    </Tr>
                  ))}
                </tbody>
                <tfoot>
                  <TotalRow>
                    <Td className="text-xs text-amber-600/50 font-mono" />
                    <Td colSpan={3} className="font-bold text-[#0A2342] dark:text-amber-100 text-sm">Jami Xarajat</Td>
                    <Td className="text-right font-bold text-red-600 text-base whitespace-nowrap">-{formatCurrency(totalExpenseSum)}</Td>
                  </TotalRow>
                </tfoot>
              </TableWrapper>
            )}
          </section>


          {/* ─── SECTION D: Client Activity Table ─── */}
          <section className="arch-card p-5">
            <SectionTitle emoji="👥" title="Mijozlar Faoliyati" count={data.clients.activeList.length} />
            {data.clients.activeList.length === 0 ? (
              <p className="text-center text-amber-400/50 py-8 text-sm">Bu davrda faol mijoz yo'q</p>
            ) : (
              <TableWrapper>
                <thead>
                  <tr>
                    <Th className="w-10">№</Th>
                    <Th>Mijoz ismi</Th>
                    <Th>Telefon</Th>
                    <Th>Manzil</Th>
                    <Th className="text-right">Kelishilgan summa</Th>
                    <Th className="text-right">Olingan summa</Th>
                    <Th className="text-right">Qolgan summa</Th>
                  </tr>
                </thead>
                <tbody>
                  {data.clients.activeList.map((client: any, i: number) => {
                    const received = clientIncomeMap[client.id] ?? 0
                    return (
                      <Tr key={client.id}>
                        <Td className="text-amber-600/50 font-mono">{i + 1}</Td>
                        <Td className="font-semibold">{client.name}</Td>
                        <Td>{client.phone ?? "—"}</Td>
                        <Td>{client.address ?? "—"}</Td>
                        <Td className="text-right text-amber-600/60">—</Td>
                        <Td className="text-right font-bold text-emerald-600 whitespace-nowrap">
                          {received > 0 ? `+${formatCurrency(received)}` : "—"}
                        </Td>
                        <Td className="text-right text-amber-600/60">—</Td>
                      </Tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <TotalRow>
                    <Td />
                    <Td colSpan={4} className="font-bold text-[#0A2342] dark:text-amber-100 text-sm">Jami</Td>
                    <Td className="text-right font-bold text-emerald-700 whitespace-nowrap">
                      +{formatCurrency(Object.values(clientIncomeMap).reduce((s, v) => s + v, 0))}
                    </Td>
                    <Td />
                  </TotalRow>
                </tfoot>
              </TableWrapper>
            )}
          </section>

          {/* ─── SECTION E: Project Summary ─── */}
          <section className="arch-card p-5">
            <SectionTitle emoji="📐" title="Loyihalar Xulosasi" count={data.projects.list.length} />
            {data.projects.list.length === 0 ? (
              <p className="text-center text-amber-400/50 py-8 text-sm">Bu davrda yangilangan loyiha yo'q</p>
            ) : (
              <TableWrapper>
                <thead>
                  <tr>
                    <Th className="w-10">№</Th>
                    <Th>Loyiha nomi</Th>
                    <Th>Mijoz</Th>
                    <Th>Holat</Th>
                    <Th className="text-right">Byudjet</Th>
                  </tr>
                </thead>
                <tbody>
                  {data.projects.list.map((p: any, i: number) => {
                    const s = PROJECT_STATUSES[p.status as keyof typeof PROJECT_STATUSES]
                    return (
                      <Tr key={p.id}>
                        <Td className="text-amber-600/50 font-mono">{i + 1}</Td>
                        <Td className="font-semibold">{p.name}</Td>
                        <Td>{p.client?.name ?? "—"}</Td>
                        <Td>
                          <span className={cn("inline-block px-2 py-0.5 rounded-full text-xs font-semibold", s?.color ?? "bg-gray-100 text-gray-600")}>
                            {s?.label ?? p.status}
                          </span>
                        </Td>
                        <Td className="text-right whitespace-nowrap">
                          {p.budget ? formatCurrency(p.budget) : "—"}
                        </Td>
                      </Tr>
                    )
                  })}
                </tbody>
              </TableWrapper>
            )}
          </section>


          {/* ─── SECTION F: Tasks Summary ─── */}
          <section className="arch-card p-5">
            <SectionTitle emoji="✅" title="Vazifalar Xulosasi" count={data.tasks.total} />
            {(!data.tasks.list || data.tasks.list?.length === 0) ? (
              <div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {[
                    { label:"Bajarilmagan", value: data.tasks.todo,       color:"text-slate-600",   bg:"bg-slate-50 dark:bg-slate-800/40" },
                    { label:"Jarayonda",    value: data.tasks.inProgress, color:"text-blue-600",    bg:"bg-blue-50 dark:bg-blue-900/20" },
                    { label:"Bajarildi",    value: data.tasks.done,       color:"text-emerald-600", bg:"bg-emerald-50 dark:bg-emerald-900/20" },
                  ].map(s => (
                    <div key={s.label} className={cn("rounded-xl p-4 text-center border border-[#B8860B]/10", s.bg)}>
                      <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
                      <p className="text-xs text-amber-600/60 mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-center text-amber-400/50 py-4 text-sm">Batafsil vazifalar ro'yxati mavjud emas</p>
              </div>
            ) : (
              <TableWrapper>
                <thead>
                  <tr>
                    <Th className="w-10">№</Th>
                    <Th>Nomi</Th>
                    <Th>Holat</Th>
                    <Th>Prioritet</Th>
                    <Th>Deadline</Th>
                  </tr>
                </thead>
                <tbody>
                  {data.tasks.list.map((task: any, i: number) => {
                    const st = TASK_STATUSES[task.status as keyof typeof TASK_STATUSES]
                    const pr = TASK_PRIORITIES[task.priority as keyof typeof TASK_PRIORITIES]
                    const overdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== "DONE"
                    return (
                      <Tr key={task.id}>
                        <Td className="text-amber-600/50 font-mono">{i + 1}</Td>
                        <Td className="font-medium">{task.title}</Td>
                        <Td>
                          <span className={cn("inline-block px-2 py-0.5 rounded-full text-xs font-semibold", st?.color ?? "")}>
                            {st?.label ?? task.status}
                          </span>
                        </Td>
                        <Td>
                          <span className={cn("inline-block px-2 py-0.5 rounded-full text-xs font-semibold", pr?.color ?? "")}>
                            {pr?.label ?? task.priority}
                          </span>
                        </Td>
                        <Td className={cn("whitespace-nowrap", overdue ? "text-red-500 font-semibold" : "")}>
                          {task.deadline ? (overdue ? "⚠️ " : "") + formatDate(task.deadline) : "—"}
                        </Td>
                      </Tr>
                    )
                  })}
                </tbody>
              </TableWrapper>
            )}
          </section>

          {/* Print footer */}
          <div className="hidden print:block text-center mt-8 pt-4 border-t border-[#B8860B]/30">
            <p className="text-xs text-gray-400">Arxitektor Kundaligi · {mounted ? new Date().toLocaleDateString("uz-UZ") : ""} · Hisobot</p>
          </div>
        </div>
      )}

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .arch-card { border: 1px solid #e8d8b0 !important; box-shadow: none !important; }
          thead tr { background: #0A2342 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          thead th { background: #0A2342 !important; color: white !important; -webkit-print-color-adjust: exact; }
          @page { margin: 20mm; }
        }
      `}</style>
    </div>
  )
}
