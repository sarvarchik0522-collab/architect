"use client"
import { useState, useEffect, useCallback } from "react"
import { TrendingUp, TrendingDown, DollarSign, Trash2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { cn, formatDate, formatCurrency, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"

const MONTHS = ["Yan","Fev","Mar","Apr","May","Iyu","Iyl","Avg","Sen","Okt","Noy","Dek"]
const MONTHS_FULL = ["Yanvar","Fevral","Mart","Aprel","May","Iyun","Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr"]

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
    const [inc, exp] = await Promise.all([fetch(`/api/finance/income?${p}`).then(r => r.json()), fetch(`/api/finance/expense?${p}`).then(r => r.json())])
    setIncomes(inc); setExpenses(exp); setLoading(false)
  }, [year, month])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    fetch("/api/projects").then(r => r.json()).then(d => setProjects(d.map((p:any) => ({id:p.id,name:p.name}))))
    fetch("/api/clients").then(r => r.json()).then(d => setClients(d.map((c:any) => ({id:c.id,name:c.name}))))
  }, [])

  const totalIncome  = incomes.reduce((s,i) => s + i.amount, 0)
  const totalExpense = expenses.reduce((s,e) => s + e.amount, 0)
  const profit       = totalIncome - totalExpense

  const addIncome = async () => {
    if (!incForm.amount) return toast({ variant:"destructive", title:"Summa kiritilishi shart" })
    setSaving(true)
    try {
      await fetch("/api/finance/income", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ ...incForm, amount: +incForm.amount, projectId: incForm.projectId === "none" ? null : incForm.projectId || null, clientId: incForm.clientId === "none" ? null : incForm.clientId || null }) })
      toast({ title:"Daromad qo'shildi" }); setIncOpen(false); load()
    } catch { toast({ variant:"destructive", title:"Xatolik" }) }
    finally { setSaving(false) }
  }

  const addExpense = async () => {
    if (!expForm.amount) return toast({ variant:"destructive", title:"Summa kiritilishi shart" })
    setSaving(true)
    try {
      await fetch("/api/finance/expense", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ ...expForm, amount: +expForm.amount }) })
      toast({ title:"Xarajat qo'shildi" }); setExpOpen(false); load()
    } catch { toast({ variant:"destructive", title:"Xatolik" }) }
    finally { setSaving(false) }
  }

  const chartData = !month ? MONTHS.map((m,i) => ({
    month: m,
    daromad:  incomes.filter(x  => new Date(x.date).getMonth()===i).reduce((s,x)=>s+x.amount,0),
    xarajat: expenses.filter(x  => new Date(x.date).getMonth()===i).reduce((s,x)=>s+x.amount,0),
  })) : []

  const years = [year-1, year, year+1]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div><h2 className="text-xl font-bold">Moliya</h2><p className="text-sm text-muted-foreground">{month ? MONTHS_FULL[month-1] : year} yil</p></div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setExpOpen(true)} className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/30"><TrendingDown className="h-4 w-4" />Xarajat</Button>
          <Button onClick={() => setIncOpen(true)} className="gap-1.5"><TrendingUp className="h-4 w-4" />Daromad</Button>
        </div>
      </div>

      {/* Period */}
      <div className="flex items-center gap-2 flex-wrap">
        <Select value={String(year)} onValueChange={v => setYear(+v)}>
          <SelectTrigger className="w-24 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>{years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
        </Select>
        <button onClick={() => setMonth(null)} className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border", !month ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted")}>Yil</button>
        {MONTHS_FULL.map((m,i) => (
          <button key={i} onClick={() => setMonth(month === i+1 ? null : i+1)}
            className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border", month===i+1 ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted")}>
            {MONTHS[i]}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-emerald-200 dark:border-emerald-900">
          <CardContent className="pt-5"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Daromad</p><p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalIncome)}</p></div><div className="h-11 w-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center"><TrendingUp className="h-5 w-5 text-emerald-600" /></div></div></CardContent>
        </Card>
        <Card className="border-red-200 dark:border-red-900">
          <CardContent className="pt-5"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Xarajat</p><p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpense)}</p></div><div className="h-11 w-11 rounded-xl bg-red-50 dark:bg-red-950/40 flex items-center justify-center"><TrendingDown className="h-5 w-5 text-red-600" /></div></div></CardContent>
        </Card>
        <Card className={cn(profit >= 0 ? "border-blue-200 dark:border-blue-900" : "border-orange-200 dark:border-orange-900")}>
          <CardContent className="pt-5"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Sof foyda</p><p className={cn("text-2xl font-bold", profit >= 0 ? "text-blue-600" : "text-orange-600")}>{profit >= 0 ? "+" : ""}{formatCurrency(profit)}</p></div><div className={cn("h-11 w-11 rounded-xl flex items-center justify-center", profit >= 0 ? "bg-blue-50 dark:bg-blue-950/40" : "bg-orange-50 dark:bg-orange-950/40")}><DollarSign className={cn("h-5 w-5", profit >= 0 ? "text-blue-600" : "text-orange-600")} /></div></div></CardContent>
        </Card>
      </div>

      {/* Chart */}
      {!month && chartData.some(d => d.daromad > 0 || d.xarajat > 0) && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">{year} yil — Oylik tahlil</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <XAxis dataKey="month" tick={{ fontSize:12 }} />
                <YAxis tick={{ fontSize:11 }} tickFormatter={v => (v/1000000).toFixed(0)+"M"} />
                <Tooltip formatter={(v:number) => formatCurrency(v)} />
                <Legend />
                <Bar dataKey="daromad" fill="#10b981" radius={[4,4,0,0]} />
                <Bar dataKey="xarajat" fill="#ef4444" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="income">
        <TabsList><TabsTrigger value="income">Daromadlar ({incomes.length})</TabsTrigger><TabsTrigger value="expense">Xarajatlar ({expenses.length})</TabsTrigger></TabsList>
        <TabsContent value="income" className="mt-4">
          <Card><CardContent className="pt-4">
            {loading ? <div className="h-24 bg-muted animate-pulse rounded" /> : incomes.length === 0 ? <p className="text-center text-muted-foreground py-8 text-sm">Daromad yozuvi yo'q</p> :
              <div className="space-y-2">
                {incomes.map((inc:any) => (
                  <div key={inc.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 group">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center flex-shrink-0"><TrendingUp className="h-4 w-4 text-emerald-600" /></div>
                      <div><p className="text-sm font-medium">{inc.description || "Daromad"}</p><p className="text-xs text-muted-foreground">{formatDate(inc.date)}{inc.project ? ` · ${inc.project.name}` : ""}{inc.client ? ` · ${inc.client.name}` : ""}</p></div>
                    </div>
                    <div className="flex items-center gap-3"><span className="font-bold text-emerald-600">+{formatCurrency(inc.amount)}</span>
                      <button onClick={async () => { await fetch(`/api/finance/income/${inc.id}`, {method:"DELETE"}); load() }} className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            }
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="expense" className="mt-4">
          <Card><CardContent className="pt-4">
            {loading ? <div className="h-24 bg-muted animate-pulse rounded" /> : expenses.length === 0 ? <p className="text-center text-muted-foreground py-8 text-sm">Xarajat yozuvi yo'q</p> :
              <div className="space-y-2">
                {expenses.map((exp:any) => (
                  <div key={exp.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 group">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-red-100 dark:bg-red-900/50 flex items-center justify-center flex-shrink-0"><TrendingDown className="h-4 w-4 text-red-600" /></div>
                      <div><p className="text-sm font-medium">{exp.description || "Xarajat"}</p><p className="text-xs text-muted-foreground">{formatDate(exp.date)}{exp.category ? ` · ${EXPENSE_CATEGORIES[exp.category]||exp.category}` : ""}</p></div>
                    </div>
                    <div className="flex items-center gap-3"><span className="font-bold text-red-600">-{formatCurrency(exp.amount)}</span>
                      <button onClick={async () => { await fetch(`/api/finance/expense/${exp.id}`, {method:"DELETE"}); load() }} className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            }
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      {/* Income Dialog */}
      <Dialog open={incOpen} onOpenChange={setIncOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Daromad qo'shish</DialogTitle><DialogDescription>To'lov ma'lumotlarini kiriting</DialogDescription></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Sana *</Label><Input type="date" value={incForm.date} onChange={e => setIncForm(f => ({...f, date:e.target.value}))} /></div>
              <div className="space-y-1.5"><Label>Summa *</Label><Input type="number" placeholder="0" value={incForm.amount} onChange={e => setIncForm(f => ({...f, amount:e.target.value}))} /></div>
            </div>
            <div className="space-y-1.5"><Label>Kategoriya</Label>
              <Select value={incForm.category} onValueChange={v => setIncForm(f => ({...f, category:v}))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(INCOME_CATEGORIES).map(([k,v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Tavsif</Label><Input placeholder="To'lov maqsadi..." value={incForm.description} onChange={e => setIncForm(f => ({...f, description:e.target.value}))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Loyiha</Label>
                <Select value={incForm.projectId} onValueChange={v => setIncForm(f => ({...f, projectId:v}))}>
                  <SelectTrigger><SelectValue placeholder="Tanlang" /></SelectTrigger>
                  <SelectContent><SelectItem value="none">— Yo'q —</SelectItem>{projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Mijoz</Label>
                <Select value={incForm.clientId} onValueChange={v => setIncForm(f => ({...f, clientId:v}))}>
                  <SelectTrigger><SelectValue placeholder="Tanlang" /></SelectTrigger>
                  <SelectContent><SelectItem value="none">— Yo'q —</SelectItem>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIncOpen(false)}>Bekor</Button><Button onClick={addIncome} disabled={saving}>{saving?"Saqlanmoqda...":"Qo'shish"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Expense Dialog */}
      <Dialog open={expOpen} onOpenChange={setExpOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Xarajat qo'shish</DialogTitle><DialogDescription>Xarajat ma'lumotlarini kiriting</DialogDescription></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Sana *</Label><Input type="date" value={expForm.date} onChange={e => setExpForm(f => ({...f, date:e.target.value}))} /></div>
              <div className="space-y-1.5"><Label>Summa *</Label><Input type="number" placeholder="0" value={expForm.amount} onChange={e => setExpForm(f => ({...f, amount:e.target.value}))} /></div>
            </div>
            <div className="space-y-1.5"><Label>Kategoriya</Label>
              <Select value={expForm.category} onValueChange={v => setExpForm(f => ({...f, category:v}))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(EXPENSE_CATEGORIES).map(([k,v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Tavsif</Label><Input placeholder="Xarajat maqsadi..." value={expForm.description} onChange={e => setExpForm(f => ({...f, description:e.target.value}))} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setExpOpen(false)}>Bekor</Button><Button variant="destructive" onClick={addExpense} disabled={saving}>{saving?"Saqlanmoqda...":"Qo'shish"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
