"use client"
import { useState, useEffect, useCallback } from "react"
import { TrendingUp, TrendingDown, DollarSign, Trash2, Plus, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { cn, formatDate, formatCurrency, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, CartesianGrid } from "recharts"

const MONTHS = ["Yan","Fev","Mar","Apr","May","Iyu","Iyl","Avg","Sen","Okt","Noy","Dek"]
const MONTHS_FULL = ["Yanvar","Fevral","Mart","Aprel","May","Iyun","Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr"]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl p-3 shadow-lg border border-slate-200 dark:border-slate-700 text-sm">
      <p className="font-bold text-slate-700 dark:text-slate-200 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-medium">
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  )
}

export default function FinancePage() {
  const [incomes,  setIncomes]  = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [clients,  setClients]  = useState<any[]>([])
  const [loading,  setLoading]  = useState(true)
  const [year,     setYear]     = useState(new Date().getFullYear())
  const [month,    setMonth]    = useState<number|null>(null)
  const [incOpen,  setIncOpen]  = useState(false)
  const [expOpen,  setExpOpen]  = useState(false)
  const [saving,   setSaving]   = useState(false)
  const { toast } = useToast()

  const [incForm, setIncForm] = useState({ date: new Date().toISOString().split("T")[0], amount:"", description:"", category:"PROJECT_PAYMENT", projectId:"none", clientId:"none" })
  const [expForm, setExpForm] = useState({ date: new Date().toISOString().split("T")[0], amount:"", description:"", category:"OTHER" })

  const load = useCallback(async () => {
    setLoading(true)
    const p = month ? `year=${year}&month=${month}` : `year=${year}`
    const [inc, exp] = await Promise.all([
      fetch(`/api/finance/income?${p}`).then(r => r.json()),
      fetch(`/api/finance/expense?${p}`).then(r => r.json()),
    ])
    setIncomes(inc); setExpenses(exp); setLoading(false)
  }, [year, month])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    fetch("/api/projects").then(r => r.json()).then(d => setProjects(d.map((p:any) => ({id:p.id,name:p.name}))))
    fetch("/api/clients").then(r => r.json()).then(d => setClients(d.map((c:any) => ({id:c.id,name:c.name}))))
  }, [])

  const totalIncome  = incomes.reduce((s,i) => s+i.amount, 0)
  const totalExpense = expenses.reduce((s,e) => s+e.amount, 0)
  const profit       = totalIncome - totalExpense
  const profitPct    = totalIncome > 0 ? Math.round((profit / totalIncome) * 100) : 0

  const addIncome = async () => {
    if (!incForm.amount) return toast({ variant:"destructive", title:"Summa kiritilishi shart" })
    setSaving(true)
    try {
      await fetch("/api/finance/income", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ ...incForm, amount: +incForm.amount, projectId: incForm.projectId==="none"?null:incForm.projectId||null, clientId: incForm.clientId==="none"?null:incForm.clientId||null })
      })
      toast({ title:"Daromad qo'shildi ✓" }); setIncOpen(false); load()
    } catch { toast({ variant:"destructive", title:"Xatolik" }) }
    finally { setSaving(false) }
  }

  const addExpense = async () => {
    if (!expForm.amount) return toast({ variant:"destructive", title:"Summa kiritilishi shart" })
    setSaving(true)
    try {
      await fetch("/api/finance/expense", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ ...expForm, amount: +expForm.amount })
      })
      toast({ title:"Xarajat qo'shildi ✓" }); setExpOpen(false); load()
    } catch { toast({ variant:"destructive", title:"Xatolik" }) }
    finally { setSaving(false) }
  }

  const chartData = !month ? MONTHS.map((m,i) => ({
    month: m,
    Daromad:  incomes.filter(x  => new Date(x.date).getMonth()===i).reduce((s,x)=>s+x.amount,0),
    Xarajat: expenses.filter(x  => new Date(x.date).getMonth()===i).reduce((s,x)=>s+x.amount,0),
  })) : []

  const years = [year-1, year, year+1]

  return (
    <div className="space-y-8 page-enter arch-pattern">

      {/* ── Header ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-700 via-green-700 to-teal-800 p-8 text-white">
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none hidden lg:block">
          <svg width="200" height="160" viewBox="0 0 200 160" className="animate-float-x">
            {[0,1,2,3,4,5,6,7,8,9,10,11].map((i)=>{
              const h = 20 + Math.sin(i*0.8)*40 + i*8
              return <rect key={i} x={i*16+4} y={155-h} width="12" height={h} rx="3" fill="white" opacity={0.3+i*0.05}/>
            })}
            <line x1="4" y1="155" x2="196" y2="155" stroke="white" strokeWidth="1"/>
          </svg>
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-10 w-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Moliya</h2>
                <p className="text-emerald-200 text-sm">{month ? MONTHS_FULL[month-1] : year} yil · {profitPct}% foyda ulushi</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setExpOpen(true)} className="bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 text-white gap-2 rounded-xl h-10 px-4 backdrop-blur-sm">
              <TrendingDown className="h-4 w-4" /> Xarajat
            </Button>
            <Button onClick={() => setIncOpen(true)} className="bg-white text-emerald-700 hover:bg-emerald-50 gap-2 rounded-xl h-10 px-4 font-semibold shadow-lg">
              <TrendingUp className="h-4 w-4" /> Daromad
            </Button>
          </div>
        </div>
      </div>

      {/* ── Period selector ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <Select value={String(year)} onValueChange={v => setYear(+v)}>
          <SelectTrigger className="w-24 h-10 rounded-xl border-slate-200 dark:border-slate-700"><SelectValue /></SelectTrigger>
          <SelectContent>{years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
        </Select>
        <button onClick={() => setMonth(null)}
          className={cn("px-3 py-2 rounded-xl text-sm font-semibold transition-all border",
            !month ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/25" : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300")}>
          Yil
        </button>
        {MONTHS.map((m,i) => (
          <button key={i} onClick={() => setMonth(month===i+1?null:i+1)}
            className={cn("px-3 py-2 rounded-xl text-sm font-medium transition-all border",
              month===i+1 ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/25" : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400")}>
            {m}
          </button>
        ))}
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label:"Daromad", value: totalIncome, icon: TrendingUp, gradient:"from-emerald-500 to-teal-600", bg:"bg-emerald-50 dark:bg-emerald-950/30", text:"text-emerald-600", border:"border-emerald-100 dark:border-emerald-900/40", sub:`${incomes.length} ta to'lov` },
          { label:"Xarajat", value: totalExpense, icon: TrendingDown, gradient:"from-red-500 to-rose-600", bg:"bg-red-50 dark:bg-red-950/30", text:"text-red-600", border:"border-red-100 dark:border-red-900/40", sub:`${expenses.length} ta xarajat` },
          { label:"Sof foyda", value: profit, icon: DollarSign, gradient: profit>=0?"from-blue-500 to-violet-600":"from-orange-500 to-red-600", bg: profit>=0?"bg-blue-50 dark:bg-blue-950/30":"bg-orange-50 dark:bg-orange-950/30", text: profit>=0?"text-blue-600":"text-orange-600", border: profit>=0?"border-blue-100 dark:border-blue-900/40":"border-orange-100 dark:border-orange-900/40", sub:`${profitPct}% foyda` },
        ].map((s, i) => (
          <div key={s.label} className={cn("finance-card bg-white dark:bg-slate-900 border animate-card", s.border)} style={{ animationDelay:`${i*0.1}s` }}>
            <div className={cn("finance-bg", s.text)} />
            <div className="relative z-10 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={cn("h-12 w-12 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg", s.gradient)}>
                  <s.icon className="h-6 w-6 text-white" />
                </div>
                <div className={cn("h-1.5 w-16 rounded-full bg-gradient-to-r self-center", s.gradient)} />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">{s.label}</p>
              <p className={cn("text-2xl font-bold", s.text)}>
                {s.value >= 0 || s.label !== "Sof foyda" ? "" : "-"}{formatCurrency(Math.abs(s.value))}
              </p>
              <p className="text-xs text-slate-400 mt-1">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Chart ── */}
      {!month && chartData.some(d => d.Daromad > 0 || d.Xarajat > 0) && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white">{year} yil — Oylik tahlil</h3>
              <p className="text-sm text-slate-400">Daromad va xarajatlar dinamikasi</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="colorDaromad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.02}/>
                </linearGradient>
                <linearGradient id="colorXarajat" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(226,232,240,0.5)" />
              <XAxis dataKey="month" tick={{ fontSize:12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v => (v/1000000).toFixed(0)+"M"} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area type="monotone" dataKey="Daromad" stroke="#10b981" strokeWidth={2.5} fill="url(#colorDaromad)" dot={{ fill:"#10b981", r:4 }} activeDot={{ r:6 }}/>
              <Area type="monotone" dataKey="Xarajat" stroke="#ef4444" strokeWidth={2.5} fill="url(#colorXarajat)" dot={{ fill:"#ef4444", r:4 }} activeDot={{ r:6 }}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Transactions ── */}
      <Tabs defaultValue="income">
        <TabsList className="rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
          <TabsTrigger value="income" className="rounded-lg">💰 Daromadlar ({incomes.length})</TabsTrigger>
          <TabsTrigger value="expense" className="rounded-lg">💸 Xarajatlar ({expenses.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="income" className="mt-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="p-4 space-y-2">
              {loading ? <div className="skeleton h-20 rounded-xl" /> :
               incomes.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <TrendingUp className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">Daromad yozuvi yo'q</p>
                </div>
              ) : incomes.map((inc:any, i) => (
                <div key={inc.id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all group animate-slide-up"
                  style={{ animationDelay:`${i*0.04}s` }}>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{inc.description || "Daromad"}</p>
                      <p className="text-xs text-slate-400">
                        {formatDate(inc.date)}{inc.project ? ` · ${inc.project.name}` : ""}{inc.client ? ` · ${inc.client.name}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-emerald-600 text-sm">+{formatCurrency(inc.amount)}</span>
                    <button onClick={async () => { await fetch(`/api/finance/income/${inc.id}`, {method:"DELETE"}); load() }}
                      className="h-7 w-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all">
                      <Trash2 className="h-3.5 w-3.5 text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="expense" className="mt-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="p-4 space-y-2">
              {loading ? <div className="skeleton h-20 rounded-xl" /> :
               expenses.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <TrendingDown className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">Xarajat yozuvi yo'q</p>
                </div>
              ) : expenses.map((exp:any, i) => (
                <div key={exp.id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all group animate-slide-up"
                  style={{ animationDelay:`${i*0.04}s` }}>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-shrink-0">
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{exp.description || "Xarajat"}</p>
                      <p className="text-xs text-slate-400">
                        {formatDate(exp.date)}{exp.category ? ` · ${EXPENSE_CATEGORIES[exp.category]||exp.category}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-red-500 text-sm">-{formatCurrency(exp.amount)}</span>
                    <button onClick={async () => { await fetch(`/api/finance/expense/${exp.id}`, {method:"DELETE"}); load() }}
                      className="h-7 w-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all">
                      <Trash2 className="h-3.5 w-3.5 text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Income Dialog */}
      <Dialog open={incOpen} onOpenChange={setIncOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">💰 Daromad qo'shish</DialogTitle>
            <DialogDescription>To'lov ma'lumotlarini kiriting</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Sana *</Label><Input type="date" value={incForm.date} className="rounded-xl h-11" onChange={e => setIncForm(f => ({...f, date:e.target.value}))} /></div>
              <div className="space-y-1.5"><Label>Summa *</Label><Input type="number" placeholder="0" value={incForm.amount} className="rounded-xl h-11" onChange={e => setIncForm(f => ({...f, amount:e.target.value}))} /></div>
            </div>
            <div className="space-y-1.5"><Label>Kategoriya</Label>
              <Select value={incForm.category} onValueChange={v => setIncForm(f => ({...f, category:v}))}>
                <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(INCOME_CATEGORIES).map(([k,v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
              </Select></div>
            <div className="space-y-1.5"><Label>Tavsif</Label><Input placeholder="To'lov maqsadi..." value={incForm.description} className="rounded-xl h-11" onChange={e => setIncForm(f => ({...f, description:e.target.value}))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Loyiha</Label>
                <Select value={incForm.projectId} onValueChange={v => setIncForm(f => ({...f, projectId:v}))}>
                  <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Tanlang" /></SelectTrigger>
                  <SelectContent><SelectItem value="none">— Yo'q —</SelectItem>{projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select></div>
              <div className="space-y-1.5"><Label>Mijoz</Label>
                <Select value={incForm.clientId} onValueChange={v => setIncForm(f => ({...f, clientId:v}))}>
                  <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Tanlang" /></SelectTrigger>
                  <SelectContent><SelectItem value="none">— Yo'q —</SelectItem>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select></div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIncOpen(false)} className="rounded-xl">Bekor</Button>
            <Button onClick={addIncome} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">{saving?"Saqlanmoqda...":"Qo'shish"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Expense Dialog */}
      <Dialog open={expOpen} onOpenChange={setExpOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">💸 Xarajat qo'shish</DialogTitle>
            <DialogDescription>Xarajat ma'lumotlarini kiriting</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Sana *</Label><Input type="date" value={expForm.date} className="rounded-xl h-11" onChange={e => setExpForm(f => ({...f, date:e.target.value}))} /></div>
              <div className="space-y-1.5"><Label>Summa *</Label><Input type="number" placeholder="0" value={expForm.amount} className="rounded-xl h-11" onChange={e => setExpForm(f => ({...f, amount:e.target.value}))} /></div>
            </div>
            <div className="space-y-1.5"><Label>Kategoriya</Label>
              <Select value={expForm.category} onValueChange={v => setExpForm(f => ({...f, category:v}))}>
                <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(EXPENSE_CATEGORIES).map(([k,v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
              </Select></div>
            <div className="space-y-1.5"><Label>Tavsif</Label><Input placeholder="Xarajat maqsadi..." value={expForm.description} className="rounded-xl h-11" onChange={e => setExpForm(f => ({...f, description:e.target.value}))} /></div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setExpOpen(false)} className="rounded-xl">Bekor</Button>
            <Button onClick={addExpense} disabled={saving} className="bg-red-500 hover:bg-red-600 text-white rounded-xl">{saving?"Saqlanmoqda...":"Qo'shish"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
