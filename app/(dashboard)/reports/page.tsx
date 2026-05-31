"use client"
import { useState, useCallback, useRef } from "react"
import { BarChart3, Download, TrendingUp, TrendingDown, Users, FolderKanban, CheckSquare, BookOpen, DollarSign, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn, formatCurrency, formatDate, PROJECT_STATUSES, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/utils"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"

const MONTHS = ["Yanvar","Fevral","Mart","Aprel","May","Iyun","Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr"]
const COLORS  = ["#c8922a","#1a4d8f","#2e7d32","#c62828","#7b1fa2","#00695c","#e65100","#37474f"]

function GirihBg() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <svg className="absolute right-0 top-0 opacity-[0.06] animate-rotate-slow" width="300" height="300" viewBox="0 0 200 200">
        <polygon points="100,10 190,55 190,145 100,190 10,145 10,55" fill="none" stroke="currentColor" strokeWidth="1"/>
        <polygon points="100,30 170,65 170,135 100,170 30,135 30,65" fill="none" stroke="currentColor" strokeWidth="0.7"/>
        <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
        <line x1="100" y1="10" x2="100" y2="190" stroke="currentColor" strokeWidth="0.3"/>
        <line x1="10" y1="100" x2="190" y2="100" stroke="currentColor" strokeWidth="0.3"/>
      </svg>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#fdf8ef] dark:bg-[#1a1408] border border-[#e8d8b0] dark:border-[#2a1e08] rounded-xl p-3 shadow-lg text-sm">
      <p className="font-bold text-[#3d2800] dark:text-amber-100 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="font-medium" style={{ color: p.color }}>
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  )
}

export default function ReportsPage() {
  const [type,    setType]    = useState("monthly")
  const [year,    setYear]    = useState(new Date().getFullYear())
  const [month,   setMonth]   = useState(new Date().getMonth() + 1)
  const [week,    setWeek]    = useState(1)
  const [data,    setData]    = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [printed, setPrinted] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ type, year: String(year), month: String(month), week: String(week) })
      const res = await fetch(`/api/reports?${params}`)
      const json = await res.json()
      setData(json)
    } finally { setLoading(false) }
  }, [type, year, month, week])

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = async () => {
    if (!data) return
    setPrinted(true)
    setTimeout(() => {
      window.print()
      setPrinted(false)
    }, 200)
  }

  const years = [year - 1, year, year + 1]
  const periodLabel = type === "weekly"
    ? `${month}-oy, ${week}-hafta ${year}`
    : type === "monthly"
    ? `${MONTHS[month - 1]} ${year}`
    : `${year} yil`

  const chartData = data && type === "yearly"
    ? MONTHS.map((m, i) => ({
        month: m.slice(0, 3),
        Daromad:  (data.incomes ?? []).filter((x: any) => new Date(x.date).getMonth() === i).reduce((s: number, x: any) => s + x.amount, 0),
        Xarajat: (data.expenses ?? []).filter((x: any) => new Date(x.date).getMonth() === i).reduce((s: number, x: any) => s + x.amount, 0),
      }))
    : []

  const incomePieData = data ? Object.entries(data.finance?.incomeByCategory ?? {}).map(([k, v]) => ({
    name: INCOME_CATEGORIES[k as keyof typeof INCOME_CATEGORIES] ?? k,
    value: v as number,
  })) : []

  return (
    <div className="space-y-6 page-enter">
      {/* ── Header ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#8a5a00] via-[#5a3a00] to-[#1a3a6b] p-8 text-white no-print">
        <GirihBg />
        <div className="relative z-10 flex flex-col sm:flex-row items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-11 w-11 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-amber-200" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Hisobotlar</h2>
                <p className="text-amber-200/70 text-sm">Haftalik · Oylik · Yillik tahlil</p>
              </div>
            </div>
          </div>
          {data && (
            <Button onClick={handleDownloadPDF}
              className="bg-white text-[#8a5a00] hover:bg-amber-50 gap-2 rounded-xl font-bold shadow-lg no-print">
              <Download className="h-4 w-4" /> PDF yuklab olish
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="relative z-10 flex flex-wrap gap-3 mt-6 no-print">
          {/* Type */}
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-36 h-10 rounded-xl bg-white/15 border-white/25 text-white text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Haftalik</SelectItem>
              <SelectItem value="monthly">Oylik</SelectItem>
              <SelectItem value="yearly">Yillik</SelectItem>
            </SelectContent>
          </Select>

          {/* Year */}
          <Select value={String(year)} onValueChange={v => setYear(+v)}>
            <SelectTrigger className="w-24 h-10 rounded-xl bg-white/15 border-white/25 text-white text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>{years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
          </Select>

          {/* Month */}
          {(type === "monthly" || type === "weekly") && (
            <Select value={String(month)} onValueChange={v => setMonth(+v)}>
              <SelectTrigger className="w-36 h-10 rounded-xl bg-white/15 border-white/25 text-white text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          )}

          {/* Week */}
          {type === "weekly" && (
            <Select value={String(week)} onValueChange={v => setWeek(+v)}>
              <SelectTrigger className="w-28 h-10 rounded-xl bg-white/15 border-white/25 text-white text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1,2,3,4,5].map(w => <SelectItem key={w} value={String(w)}>{w}-hafta</SelectItem>)}
              </SelectContent>
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
          <div className="text-6xl mb-4 animate-float">📊</div>
          <p className="text-lg font-semibold text-amber-700/60 dark:text-amber-400/60">Davr tanlang va hisobotni ko'ring</p>
          <p className="text-sm mt-1">Haftalik, oylik yoki yillik hisobot</p>
        </div>
      )}

      {/* ── Report content ── */}
      {data && (
        <div ref={reportRef} className="space-y-6">

          {/* Print header */}
          <div className="hidden print:block text-center mb-8 border-b-2 border-amber-600 pb-6">
            <h1 className="text-3xl font-bold text-[#3d2800]">🏛️ ARXITEKTOR KUNDALIGI</h1>
            <h2 className="text-xl font-semibold mt-2">{periodLabel} — Hisobot</h2>
            <p className="text-sm text-gray-500 mt-1">Sana: {new Date().toLocaleDateString("uz-UZ", { year:"numeric", month:"long", day:"numeric" })}</p>
          </div>

          {/* ── Finance summary ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label:"Jami Daromad", value: data.finance.totalIncome,  icon: TrendingUp,   grad:"from-emerald-600 to-emerald-800",  bg:"bg-emerald-50 dark:bg-emerald-950/30", text:"text-emerald-700" },
              { label:"Jami Xarajat", value: data.finance.totalExpense, icon: TrendingDown,  grad:"from-red-600 to-red-800",           bg:"bg-red-50 dark:bg-red-950/30",         text:"text-red-700" },
              { label:"Sof Foyda",    value: data.finance.profit,       icon: DollarSign,    grad: data.finance.profit >= 0 ? "from-blue-700 to-blue-900" : "from-orange-600 to-orange-800",
                bg: data.finance.profit >= 0 ? "bg-blue-50 dark:bg-blue-950/30" : "bg-orange-50 dark:bg-orange-950/30",
                text: data.finance.profit >= 0 ? "text-blue-700" : "text-orange-700" },
            ].map((s, i) => (
              <div key={s.label} className={cn("report-card bg-white dark:bg-[#120e04] border border-[#e8d8b0] dark:border-[#2a1e08] p-5 animate-card", )} style={{ animationDelay:`${i*0.1}s` }}>
                <div className={cn("absolute top-0 left-0 right-0 h-1 bg-gradient-to-r", s.grad)} />
                <div className="flex items-start justify-between mb-3">
                  <div className={cn("h-11 w-11 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-md", s.grad)}>
                    <s.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <p className="text-xs font-semibold text-amber-700/60 dark:text-amber-400/60 mb-1">{s.label}</p>
                <p className={cn("text-2xl font-bold", s.text)}>{formatCurrency(Math.abs(s.value))}</p>
                {s.label === "Sof Foyda" && <p className="text-xs mt-1 text-amber-500/60">{data.finance.profit >= 0 ? "✅ Ijobiy" : "⚠️ Zarar"}</p>}
              </div>
            ))}
          </div>

          {/* ── Stats row ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label:"Loyihalar",    value: data.projects.total,  emoji:"📐", sub: `${Object.entries(data.projects.byStatus).map(([k,v])=>`${PROJECT_STATUSES[k as keyof typeof PROJECT_STATUSES]?.label??k}:${v}`).join(", ")}` },
              { label:"Faol Mijozlar",value: data.clients.active,  emoji:"👥", sub: `${data.clients.newInPeriod} ta yangi` },
              { label:"Vazifalar",    value: data.tasks.total,     emoji:"✅", sub: `${data.tasks.done} bajarildi, ${data.tasks.inProgress} jarayonda` },
              { label:"Kundaliklar",  value: data.diary.total,     emoji:"📖", sub: "Yozuvlar soni" },
            ].map((s, i) => (
              <div key={s.label} className="card-gold p-4 animate-card" style={{ animationDelay:`${i*0.08}s` }}>
                <div className="text-3xl mb-2">{s.emoji}</div>
                <p className="text-2xl font-bold text-[#3d2800] dark:text-amber-100">{s.value}</p>
                <p className="text-xs font-semibold text-amber-700/70 dark:text-amber-400/60 mt-0.5">{s.label}</p>
                <p className="text-[10px] text-amber-600/50 mt-1 line-clamp-2">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* ── Yearly chart ── */}
          {type === "yearly" && chartData.length > 0 && (
            <div className="card-gold p-6">
              <h3 className="font-bold text-[#3d2800] dark:text-amber-100 mb-1 flex items-center gap-2">
                <span className="text-lg">📈</span> {year} yil — Oylik Tahlil
              </h3>
              <p className="text-xs text-amber-600/50 mb-4">Daromad va xarajatlar dinamikasi</p>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData} margin={{ top:5, right:10, left:10, bottom:5 }}>
                  <defs>
                    <linearGradient id="gD" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2e7d32" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2e7d32" stopOpacity={0.02}/>
                    </linearGradient>
                    <linearGradient id="gX" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c62828" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#c62828" stopOpacity={0.02}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize:11 }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fontSize:10 }} axisLine={false} tickLine={false} tickFormatter={v=>(v/1000000).toFixed(0)+"M"}/>
                  <Tooltip content={<CustomTooltip />}/>
                  <Legend />
                  <Area type="monotone" dataKey="Daromad" stroke="#2e7d32" strokeWidth={2.5} fill="url(#gD)" dot={{ fill:"#2e7d32", r:4 }} activeDot={{ r:6 }}/>
                  <Area type="monotone" dataKey="Xarajat" stroke="#c62828" strokeWidth={2.5} fill="url(#gX)" dot={{ fill:"#c62828", r:4 }} activeDot={{ r:6 }}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ── 2-col: Incomes + Expenses ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Incomes */}
            <div className="card-gold overflow-hidden">
              <div className="px-5 py-4 border-b border-[#e8d8b0]/60 dark:border-[#2a1e08]/60 flex items-center gap-2">
                <span className="text-lg">💰</span>
                <div>
                  <p className="font-bold text-[#3d2800] dark:text-amber-100 text-sm">Daromadlar</p>
                  <p className="text-xs text-amber-600/50">{data.incomes.length} ta to'lov</p>
                </div>
              </div>
              <div className="p-4 space-y-2 max-h-72 overflow-y-auto">
                {data.incomes.length === 0 ? (
                  <p className="text-center text-amber-400/40 py-6 text-sm">Daromad yo'q</p>
                ) : data.incomes.map((inc: any, i: number) => (
                  <div key={inc.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-amber-50/60 dark:hover:bg-amber-950/20 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-[#3d2800] dark:text-amber-100">{inc.description || "Daromad"}</p>
                      <p className="text-xs text-amber-600/50">{formatDate(inc.date)}{inc.project ? ` · ${inc.project.name}` : ""}</p>
                    </div>
                    <span className="font-bold text-emerald-600 text-sm">+{formatCurrency(inc.amount)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Expenses */}
            <div className="card-gold overflow-hidden">
              <div className="px-5 py-4 border-b border-[#e8d8b0]/60 dark:border-[#2a1e08]/60 flex items-center gap-2">
                <span className="text-lg">💸</span>
                <div>
                  <p className="font-bold text-[#3d2800] dark:text-amber-100 text-sm">Xarajatlar</p>
                  <p className="text-xs text-amber-600/50">{data.expenses.length} ta xarajat</p>
                </div>
              </div>
              <div className="p-4 space-y-2 max-h-72 overflow-y-auto">
                {data.expenses.length === 0 ? (
                  <p className="text-center text-amber-400/40 py-6 text-sm">Xarajat yo'q</p>
                ) : data.expenses.map((exp: any) => (
                  <div key={exp.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-amber-50/60 dark:hover:bg-amber-950/20 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-[#3d2800] dark:text-amber-100">{exp.description || "Xarajat"}</p>
                      <p className="text-xs text-amber-600/50">{formatDate(exp.date)}{exp.category ? ` · ${EXPENSE_CATEGORIES[exp.category as keyof typeof EXPENSE_CATEGORIES] ?? exp.category}` : ""}</p>
                    </div>
                    <span className="font-bold text-red-500 text-sm">-{formatCurrency(exp.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Loyihalar ── */}
          {data.projects.list.length > 0 && (
            <div className="card-gold overflow-hidden">
              <div className="px-5 py-4 border-b border-[#e8d8b0]/60 dark:border-[#2a1e08]/60 flex items-center gap-2">
                <span className="text-lg">📐</span>
                <div>
                  <p className="font-bold text-[#3d2800] dark:text-amber-100 text-sm">Loyihalar</p>
                  <p className="text-xs text-amber-600/50">{data.projects.total} ta loyiha</p>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {data.projects.list.map((p: any) => {
                    const s = PROJECT_STATUSES[p.status as keyof typeof PROJECT_STATUSES]
                    return (
                      <div key={p.id} className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100/60 dark:border-amber-900/30">
                        <p className="font-semibold text-sm text-[#3d2800] dark:text-amber-100 truncate">{p.name}</p>
                        <p className="text-xs text-amber-600/50 truncate">{p.client?.name}</p>
                        <span className={cn("inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full font-semibold", s?.color)}>{s?.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── Mijozlar ── */}
          <div className="card-gold overflow-hidden">
            <div className="px-5 py-4 border-b border-[#e8d8b0]/60 dark:border-[#2a1e08]/60 flex items-center gap-2">
              <span className="text-lg">👥</span>
              <div>
                <p className="font-bold text-[#3d2800] dark:text-amber-100 text-sm">Faol Mijozlar</p>
                <p className="text-xs text-amber-600/50">{data.clients.active} ta · {data.clients.newInPeriod} yangi</p>
              </div>
            </div>
            <div className="p-4">
              {data.clients.activeList.length === 0 ? (
                <p className="text-center text-amber-400/40 py-4 text-sm">Faol mijoz yo'q</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {data.clients.activeList.map((c: any) => (
                    <div key={c.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100/50">
                      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center text-white text-xs font-bold">
                        {c.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0,2)}
                      </div>
                      <span className="text-sm font-medium text-[#3d2800] dark:text-amber-100">{c.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Kundaliklar ── */}
          {data.diary.list.length > 0 && (
            <div className="card-gold overflow-hidden">
              <div className="px-5 py-4 border-b border-[#e8d8b0]/60 dark:border-[#2a1e08]/60 flex items-center gap-2">
                <span className="text-lg">📖</span>
                <p className="font-bold text-[#3d2800] dark:text-amber-100 text-sm">Kundalik Yozuvlar</p>
              </div>
              <div className="p-4 space-y-2">
                {data.diary.list.map((d: any) => (
                  <div key={d.id} className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/40 dark:bg-amber-950/10">
                    <div className="h-9 w-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-emerald-700 leading-none">{new Date(d.date).getDate()}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#3d2800] dark:text-amber-100">{d.title}</p>
                      {d.workDone && <p className="text-xs text-amber-600/60 line-clamp-1 mt-0.5">✅ {d.workDone}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Print footer */}
          <div className="hidden print:block text-center mt-8 pt-4 border-t border-amber-300">
            <p className="text-xs text-gray-400">Arxitektor Kundaligi · {new Date().toLocaleDateString("uz-UZ")} · Hisobot</p>
          </div>
        </div>
      )}

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .card-gold { border: 1px solid #e8d8b0 !important; box-shadow: none !important; }
        }
      `}</style>
    </div>
  )
}
