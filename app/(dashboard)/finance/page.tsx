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
    <div className="rounded-xl p-3 shadow-lg border border-[#333] bg-[#111] text-sm">
      <p className="font-bold text-white mb-1">{label}</p>
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
    <div className="space-y-8 page-enter">

      {/* ── Header ── */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0d0d0d] border border-[#222] p-8 text-white">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-10 w-10 rounded-xl bg-[#1a1a1a] border border-[#333] flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-[#aaa]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Moliya</h2>
                <p className="text-[#666] text-sm">{month ? MONTHS_FULL[month-1] : year} yil · {profitPct}% foyda ulushi</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setExpOpen(true)} className="btn-ghost gap-2 rounded-xl h-10 px-4">
              <TrendingDown className="h-4 w-4" /> Xarajat
            </Button>
            <Button onClick={() => setIncOpen(true)} className="btn-primary gap-2 rounded-xl h-10 px-4">
              <TrendingUp className="h-4 w-4" /> Daromad
            </Button>
          </div>
        </div>
      </div>

      {/* ── Period selector ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <Select value={String(year)} onValueChange={v => setYear(+v)}>
          <SelectTrigger className="w-24 h-10 rounded-xl border-[#333] bg-[#111] text-white"><SelectValue /></SelectTrigger>
          <SelectContent>{years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
        </Select>
        <button onClick={() => setMonth(null)}
          className={cn("px-3 py-2 rounded-xl text-sm font-semibold transition-all border",
            !month ? "bg-white text-[#111] border-white" : "border-[#333] bg-[#111] hover:bg-[#1a1a1a] text-[#666]")}>
          Yil
        </button>
        {MONTHS.map((m,i) => (
          <button key={i} onClick={() => setMonth(month===i+1?null:i+1)}
            className={cn("px-3 py-2 rounded-xl text-sm font-medium transition-all border",
              month===i+1 ? "bg-white text-[#111] border-white" : "border-[#333] bg-[#111] hover:bg-[#1a1a1a] text-[#555]")}>
            {m}
          </button>
        ))}
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label:"Daromad",  value: totalIncome,  icon: TrendingUp,   sub:`${incomes.length} ta to'lov` },
          { label:"Xarajat",  value: totalExpense, icon: TrendingDown, sub:`${expenses.length} ta xarajat` },
          { label:"Sof foyda",value: profit,        icon: DollarSign,  sub:`${profitPct}% foyda` },
        ].map((s, i) => (
          <div key={s.label} className="stat-card" style={{ animationDelay:`${i*0.1}s` }}>
            <div className="flex items-start justify-between mb-4">
              <div className="h-12 w-12 rounded-2xl bg-[#1a1a1a] border border-[#333] flex items-center justify-center">
                <s.icon className="h-6 w-6 text-[#888]" />
              </div>
              <div className="h-1.5 w-16 rounded-full bg-[#222] self-center" />
            </div>
            <p className="text-sm text-[#555] font-medium mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(Math.abs(s.value))}
            </p>
            <p className="text-xs text-[#444] mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Chart ── */}
      {!month && chartData.some(d => d.Daromad > 0 || d.Xarajat > 0) && (
        <div className="bg-[#111] border border-[#222] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-white">{year} yil — Oylik tahlil</h3>
              <p className="text-sm text-[#444]">Daromad va xarajatlar dinamikasi</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="colorDaromad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fff" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#fff" stopOpacity={0.02}/>
                </linearGradient>
                <linearGradient id="colorXarajat" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#888" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#888" stopOpacity={0.02}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="month" tick={{ fontSize:12, fill:"#555" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11, fill:"#555" }} axisLine={false} tickLine={false} tickFormatter={v => (v/1000000).toFixed(0)+"M"} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color:"#888" }} />
              <Area type="monotone" dataKey="Daromad" stroke="#fff" strokeWidth={2} fill="url(#colorDaromad)" dot={{ fill:"#fff", r:3 }} activeDot={{ r:5 }}/>
              <Area type="monotone" dataKey="Xarajat" stroke="#888" strokeWidth={2} fill="url(#colorXarajat)" dot={{ fill:"#888", r:3 }} activeDot={{ r:5 }}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Transactions ── */}
      <Tabs defaultValue="income">
        <TabsList className="rounded-xl bg-[#111] border border-[#222] p-1">
          <TabsTrigger value="income" className="rounded-lg data-[state=active]:bg-[#222] data-[state=active]:text-white text-[#555]">
            💰 Daromadlar ({incomes.length})
          </TabsTrigger>
          <TabsTrigger value="expense" className="rounded-lg data-[state=active]:bg-[#222] data-[state=active]:text-white text-[#555]">
            💸 Xarajatlar ({expenses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="income" className="mt-4">
          <div className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden">
            <div className="p-4 space-y-2">
              {loading ? <div className="skeleton h-20 rounded-xl" /> :
               incomes.length === 0 ? (
                <div className="text-center py-12 text-[#444]">
                  <TrendingUp className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">Daromad yozuvi yo'q</p>
                </div>
              ) : incomes.map((inc:any, i) => (
                <div key={inc.id} className="flex items-center justify-between p-3.5 rounded-xl bg-[#1a1a1a] border border-[#222] hover:bg-[#1e1e1e] transition-all group"
                  style={{ animationDelay:`${i*0.04}s` }}>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#222] border border-[#333] flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="h-4 w-4 text-[#666]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{inc.description || "Daromad"}</p>
                      <p className="text-xs text-[#444]">
                        {formatDate(inc.date)}{inc.project ? ` · ${inc.project.name}` : ""}{inc.client ? ` · ${inc.client.name}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white text-sm">+{formatCurrency(inc.amount)}</span>
                    <button onClick={async () => { await fetch(`/api/finance/income/${inc.id}`, {method:"DELETE"}); load() }}
                      className="h-7 w-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-[#2a2a2a] transition-all">
                      <Trash2 className="h-3.5 w-3.5 text-[#555]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="expense" className="mt-4">
          <div className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden">
            <div className="p-4 space-y-2">
              {loading ? <div className="skeleton h-20 rounded-xl" /> :
               expenses.length === 0 ? (
                <div className="text-center py-12 text-[#444]">
                  <TrendingDown className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">Xarajat yozuvi yo'q</p>
                </div>
              ) : expenses.map((exp:any, i) => (
                <div key={exp.id} className="flex items-center justify-between p-3.5 rounded-xl bg-[#1a1a1a] border border-[#222] hover:bg-[#1e1e1e] transition-all group"
                  style={{ animationDelay:`${i*0.04}s` }}>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#222] border border-[#333] flex items-center justify-center flex-shrink-0">
                      <TrendingDown className="h-4 w-4 text-[#666]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{exp.description || "Xarajat"}</p>
                      <p className="text-xs text-[#444]">
                        {formatDate(exp.date)}{exp.category ? ` · ${EXPENSE_CATEGORIES[exp.category]||exp.category}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-[#ccc] text-sm">-{formatCurrency(exp.amount)}</span>
                    <button onClick={async () => { await fetch(`/api/finance/expense/${exp.id}`, {method:"DELETE"}); load() }}
                      className="h-7 w-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-[#2a2a2a] transition-all">
                      <Trash2 className="h-3.5 w-3.5 text-[#555]" />
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
        <DialogContent className="max-w-md rounded-2xl bg-[#111] border border-[#222]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">💰 Daromad qo'shish</DialogTitle>
            <DialogDescription className="text-[#666]">To'lov ma'lumotlarini kiriting</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-[#888]">Sana *</Label>
                <Input type="date" value={incForm.date} className="rounded-xl h-11 bg-[#0d0d0d] border-[#333] text-white" onChange={e => setIncForm(f => ({...f, date:e.target.value}))} /></div>
              <div className="space-y-1.5"><Label className="text-[#888]">Summa *</Label>
                <Input type="number" placeholder="0" value={incForm.amount} className="rounded-xl h-11 bg-[#0d0d0d] border-[#333] text-white" onChange={e => setIncForm(f => ({...f, amount:e.target.value}))} /></div>
            </div>
            <div className="space-y-1.5"><Label className="text-[#888]">Kategoriya</Label>
              <Select value={incForm.category} onValueChange={v => setIncForm(f => ({...f, category:v}))}>
                <SelectTrigger className="rounded-xl h-11 bg-[#0d0d0d] border-[#333] text-white"><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(INCOME_CATEGORIES).map(([k,v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
              </Select></div>
            <div className="space-y-1.5"><Label className="text-[#888]">Tavsif</Label>
              <Input placeholder="To'lov maqsadi..." value={incForm.description} className="rounded-xl h-11 bg-[#0d0d0d] border-[#333] text-white" onChange={e => setIncForm(f => ({...f, description:e.target.value}))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-[#888]">Loyiha</Label>
                <Select value={incForm.projectId} onValueChange={v => setIncForm(f => ({...f, projectId:v}))}>
                  <SelectTrigger className="rounded-xl h-11 bg-[#0d0d0d] border-[#333] text-white"><SelectValue placeholder="Tanlang" /></SelectTrigger>
                  <SelectContent><SelectItem value="none">— Yo'q —</SelectItem>{projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select></div>
              <div className="space-y-1.5"><Label className="text-[#888]">Mijoz</Label>
                <Select value={incForm.clientId} onValueChange={v => setIncForm(f => ({...f, clientId:v}))}>
                  <SelectTrigger className="rounded-xl h-11 bg-[#0d0d0d] border-[#333] text-white"><SelectValue placeholder="Tanlang" /></SelectTrigger>
                  <SelectContent><SelectItem value="none">— Yo'q —</SelectItem>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select></div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIncOpen(false)} className="rounded-xl border-[#333] text-[#888]">Bekor</Button>
            <Button onClick={addIncome} disabled={saving} className="btn-primary rounded-xl">{saving?"Saqlanmoqda...":"Qo'shish"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Expense Dialog */}
      <Dialog open={expOpen} onOpenChange={setExpOpen}>
        <DialogContent className="max-w-md rounded-2xl bg-[#111] border border-[#222]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">💸 Xarajat qo'shish</DialogTitle>
            <DialogDescription className="text-[#666]">Xarajat ma'lumotlarini kiriting</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-[#888]">Sana *</Label>
                <Input type="date" value={expForm.date} className="rounded-xl h-11 bg-[#0d0d0d] border-[#333] text-white" onChange={e => setExpForm(f => ({...f, date:e.target.value}))} /></div>
              <div className="space-y-1.5"><Label className="text-[#888]">Summa *</Label>
                <Input type="number" placeholder="0" value={expForm.amount} className="rounded-xl h-11 bg-[#0d0d0d] border-[#333] text-white" onChange={e => setExpForm(f => ({...f, amount:e.target.value}))} /></div>
            </div>
            <div className="space-y-1.5"><Label className="text-[#888]">Kategoriya</Label>
              <Select value={expForm.category} onValueChange={v => setExpForm(f => ({...f, category:v}))}>
                <SelectTrigger className="rounded-xl h-11 bg-[#0d0d0d] border-[#333] text-white"><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(EXPENSE_CATEGORIES).map(([k,v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
              </Select></div>
            <div className="space-y-1.5"><Label className="text-[#888]">Tavsif</Label>
              <Input placeholder="Xarajat maqsadi..." value={expForm.description} className="rounded-xl h-11 bg-[#0d0d0d] border-[#333] text-white" onChange={e => setExpForm(f => ({...f, description:e.target.value}))} /></div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setExpOpen(false)} className="rounded-xl border-[#333] text-[#888]">Bekor</Button>
            <Button onClick={addExpense} disabled={saving} className="btn-primary rounded-xl">{saving?"Saqlanmoqda...":"Qo'shish"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
