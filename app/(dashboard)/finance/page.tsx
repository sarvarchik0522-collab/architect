"use client"
import { useState, useEffect, useCallback } from "react"
import { TrendingUp, TrendingDown, DollarSign, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { formatDate, formatCurrency, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "@/lib/utils"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"

const MONTHS_S = ["Yan","Fev","Mar","Apr","May","Iyu","Iyl","Avg","Sen","Okt","Noy","Dek"]
const MONTHS_F = ["Yanvar","Fevral","Mart","Aprel","May","Iyun","Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr"]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active||!payload?.length) return null
  return (
    <div className="rounded p-3 text-sm" style={{background:"#111",border:"1px solid #222",color:"#f0f0f0"}}>
      <p className="font-bold mb-1" style={{color:"#ccc"}}>{label}</p>
      {payload.map((p:any) => (
        <p key={p.dataKey} style={{color: p.dataKey==="Daromad"?"#fff":"#888"}}>
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

  const [incForm, setIncForm] = useState({ date:new Date().toISOString().split("T")[0], amount:"", description:"", category:"PROJECT_PAYMENT", projectId:"none", clientId:"none" })
  const [expForm, setExpForm] = useState({ date:new Date().toISOString().split("T")[0], amount:"", description:"", category:"OTHER" })

  const load = useCallback(async () => {
    setLoading(true)
    const p = month ? `year=${year}&month=${month}` : `year=${year}`
    const [inc,exp] = await Promise.all([
      fetch(`/api/finance/income?${p}`).then(r=>r.json()),
      fetch(`/api/finance/expense?${p}`).then(r=>r.json()),
    ])
    setIncomes(inc); setExpenses(exp); setLoading(false)
  },[year,month])

  useEffect(()=>{ load() },[load])
  useEffect(()=>{
    fetch("/api/projects").then(r=>r.json()).then(d=>setProjects(d.map((p:any)=>({id:p.id,name:p.name}))))
    fetch("/api/clients").then(r=>r.json()).then(d=>setClients(d.map((c:any)=>({id:c.id,name:c.name}))))
  },[])

  const totalIncome  = incomes.reduce((s,i)=>s+i.amount,0)
  const totalExpense = expenses.reduce((s,e)=>s+e.amount,0)
  const profit       = totalIncome - totalExpense

  const addIncome = async () => {
    if (!incForm.amount) return toast({variant:"destructive",title:"Summa kerak"})
    setSaving(true)
    try {
      await fetch("/api/finance/income",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({...incForm,amount:+incForm.amount,
          projectId:incForm.projectId==="none"?null:incForm.projectId||null,
          clientId:incForm.clientId==="none"?null:incForm.clientId||null})})
      toast({title:"Qo'shildi"}); setIncOpen(false); load()
    } catch { toast({variant:"destructive",title:"Xatolik"}) }
    finally { setSaving(false) }
  }

  const addExpense = async () => {
    if (!expForm.amount) return toast({variant:"destructive",title:"Summa kerak"})
    setSaving(true)
    try {
      await fetch("/api/finance/expense",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({...expForm,amount:+expForm.amount})})
      toast({title:"Qo'shildi"}); setExpOpen(false); load()
    } catch { toast({variant:"destructive",title:"Xatolik"}) }
    finally { setSaving(false) }
  }

  const chartData = !month ? MONTHS_S.map((m,i)=>({
    month:m,
    Daromad:  incomes.filter(x=>new Date(x.date).getMonth()===i).reduce((s,x)=>s+x.amount,0),
    Xarajat: expenses.filter(x=>new Date(x.date).getMonth()===i).reduce((s,x)=>s+x.amount,0),
  })) : []

  const inp = (val:string, onChange:(v:string)=>void, ph:string, type="text") => (
    <input type={type} placeholder={ph} value={val} onChange={e=>onChange(e.target.value)}
      className="w-full h-10 px-3 text-sm rounded"
      style={{background:"#0d0d0d",border:"1px solid #222",color:"#f0f0f0",outline:"none"}}
      onFocus={e=>{e.target.style.borderColor="#555"}} onBlur={e=>{e.target.style.borderColor="#222"}}/>
  )

  return (
    <div className="space-y-5" style={{color:"#f0f0f0"}}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-black tracking-tight">Moliya</h2>
          <p style={{fontSize:12,color:"#555"}}>{month?MONTHS_F[month-1]:year} yil</p>
        </div>
        <div className="flex gap-2">
          <button onClick={()=>setExpOpen(true)} className="btn-ghost h-9 px-4 text-sm flex items-center gap-2">
            <TrendingDown className="h-4 w-4"/> Xarajat
          </button>
          <button onClick={()=>setIncOpen(true)} className="btn-primary h-9 px-4 text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4"/> Daromad
          </button>
        </div>
      </div>

      {/* Period selector */}
      <div className="flex items-center gap-2 flex-wrap">
        <select value={String(year)} onChange={e=>setYear(+e.target.value)}
          className="h-9 px-3 text-sm rounded"
          style={{background:"#111",border:"1px solid #222",color:"#888",outline:"none"}}>
          {[year-1,year,year+1].map(y=><option key={y} value={y}>{y}</option>)}
        </select>
        <button onClick={()=>setMonth(null)}
          className="h-9 px-3 text-sm rounded font-medium transition-all"
          style={{background:!month?"#222":"#111",border:`1px solid ${!month?"#444":"#1e1e1e"}`,color:!month?"#f0f0f0":"#555"}}>
          Yil
        </button>
        {MONTHS_S.map((m,i)=>(
          <button key={i} onClick={()=>setMonth(month===i+1?null:i+1)}
            className="h-9 px-3 text-sm rounded font-medium transition-all"
            style={{background:month===i+1?"#222":"#111",border:`1px solid ${month===i+1?"#444":"#1e1e1e"}`,
              color:month===i+1?"#f0f0f0":"#555"}}>
            {m}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {label:"Daromad",   val:totalIncome,  icon:TrendingUp,  color:"#f0f0f0"},
          {label:"Xarajat",   val:totalExpense, icon:TrendingDown, color:"#888"},
          {label:"Sof foyda", val:profit,        icon:DollarSign,  color:profit>=0?"#ccc":"#666"},
        ].map(s=>(
          <div key={s.label} className="arch-card p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-wider" style={{color:"#444"}}>{s.label}</p>
              <s.icon className="h-4 w-4" style={{color:"#333"}}/>
            </div>
            <p className="font-black text-lg" style={{color:s.color}}>
              {formatCurrency(Math.abs(s.val))}
            </p>
            {s.label==="Sof foyda"&&<p className="text-xs mt-0.5" style={{color:"#444"}}>
              {profit>=0?"Ijobiy":"Zarar"}
            </p>}
          </div>
        ))}
      </div>

      {/* Chart */}
      {!month && chartData.some(d=>d.Daromad>0||d.Xarajat>0) && (
        <div className="arch-card p-5">
          <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{color:"#555"}}>{year} yil dinamika</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{top:5,right:10,left:10,bottom:5}}>
              <defs>
                <linearGradient id="gI" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fff" stopOpacity={0.12}/>
                  <stop offset="95%" stopColor="#fff" stopOpacity={0.01}/>
                </linearGradient>
                <linearGradient id="gE" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#666" stopOpacity={0.12}/>
                  <stop offset="95%" stopColor="#666" stopOpacity={0.01}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a"/>
              <XAxis dataKey="month" tick={{fontSize:11,fill:"#444"}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:"#444"}} axisLine={false} tickLine={false} tickFormatter={v=>(v/1000000).toFixed(0)+"M"}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Area type="monotone" dataKey="Daromad" stroke="#fff" strokeWidth={1.5} fill="url(#gI)" dot={{fill:"#fff",r:3}} activeDot={{r:5}}/>
              <Area type="monotone" dataKey="Xarajat" stroke="#666" strokeWidth={1.5} fill="url(#gE)" dot={{fill:"#666",r:3}} activeDot={{r:5}}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="income">
        <TabsList className="rounded" style={{background:"#111",border:"1px solid #222"}}>
          <TabsTrigger value="income" className="rounded text-sm data-[state=active]:bg-[#222] data-[state=active]:text-white"
            style={{color:"#555"}}>
            Daromadlar ({incomes.length})
          </TabsTrigger>
          <TabsTrigger value="expense" className="rounded text-sm data-[state=active]:bg-[#222] data-[state=active]:text-white"
            style={{color:"#555"}}>
            Xarajatlar ({expenses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="income" className="mt-3">
          <div className="arch-card overflow-hidden">
            {loading ? <div className="skeleton h-16 m-4"/> :
             incomes.length===0 ? <p className="text-center py-8 text-sm" style={{color:"#444"}}>Daromad yo'q</p> :
             <div className="divide-y" style={{borderColor:"#1a1a1a"}}>
               {incomes.map((inc:any)=>(
                 <div key={inc.id} className="flex items-center justify-between px-4 py-3 group transition-colors hover:bg-[#151515]">
                   <div>
                     <p className="text-sm font-medium" style={{color:"#ddd"}}>{inc.description||"Daromad"}</p>
                     <p className="text-xs" style={{color:"#444"}}>{formatDate(inc.date)}{inc.project?` · ${inc.project.name}`:""}</p>
                   </div>
                   <div className="flex items-center gap-3">
                     <span className="font-bold text-sm" style={{color:"#f0f0f0"}}>+{formatCurrency(inc.amount)}</span>
                     <button onClick={async()=>{await fetch(`/api/finance/income/${inc.id}`,{method:"DELETE"});load()}}
                       className="h-6 w-6 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#1e1e1e]"
                       style={{color:"#555"}}>
                       <Trash2 className="h-3.5 w-3.5"/>
                     </button>
                   </div>
                 </div>
               ))}
             </div>
            }
          </div>
        </TabsContent>

        <TabsContent value="expense" className="mt-3">
          <div className="arch-card overflow-hidden">
            {loading ? <div className="skeleton h-16 m-4"/> :
             expenses.length===0 ? <p className="text-center py-8 text-sm" style={{color:"#444"}}>Xarajat yo'q</p> :
             <div className="divide-y" style={{borderColor:"#1a1a1a"}}>
               {expenses.map((exp:any)=>(
                 <div key={exp.id} className="flex items-center justify-between px-4 py-3 group transition-colors hover:bg-[#151515]">
                   <div>
                     <p className="text-sm font-medium" style={{color:"#ddd"}}>{exp.description||"Xarajat"}</p>
                     <p className="text-xs" style={{color:"#444"}}>{formatDate(exp.date)}{exp.category?` · ${EXPENSE_CATEGORIES[exp.category as keyof typeof EXPENSE_CATEGORIES]||exp.category}`:""}</p>
                   </div>
                   <div className="flex items-center gap-3">
                     <span className="font-bold text-sm" style={{color:"#888"}}>-{formatCurrency(exp.amount)}</span>
                     <button onClick={async()=>{await fetch(`/api/finance/expense/${exp.id}`,{method:"DELETE"});load()}}
                       className="h-6 w-6 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#1e1e1e]"
                       style={{color:"#555"}}>
                       <Trash2 className="h-3.5 w-3.5"/>
                     </button>
                   </div>
                 </div>
               ))}
             </div>
            }
          </div>
        </TabsContent>
      </Tabs>

      {/* Income Dialog */}
      <Dialog open={incOpen} onOpenChange={setIncOpen}>
        <DialogContent className="max-w-md rounded" style={{background:"#0f0f0f",border:"1px solid #222",color:"#f0f0f0"}}>
          <DialogHeader>
            <DialogTitle style={{color:"#f0f0f0"}}>Daromad qo'shish</DialogTitle>
            <DialogDescription style={{color:"#555"}}>To'lov ma'lumotlari</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{color:"#555"}}>Sana</label>
                {inp(incForm.date, v=>setIncForm(f=>({...f,date:v})),"",  "date")}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{color:"#555"}}>Summa</label>
                {inp(incForm.amount, v=>setIncForm(f=>({...f,amount:v})), "0", "number")}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{color:"#555"}}>Kategoriya</label>
              <select value={incForm.category} onChange={e=>setIncForm(f=>({...f,category:e.target.value}))}
                className="w-full h-10 px-3 text-sm rounded"
                style={{background:"#0d0d0d",border:"1px solid #222",color:"#888",outline:"none"}}>
                {Object.entries(INCOME_CATEGORIES).map(([k,v])=><option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{color:"#555"}}>Tavsif</label>
              {inp(incForm.description, v=>setIncForm(f=>({...f,description:v})), "To'lov maqsadi...")}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[{field:"projectId",label:"Loyiha",items:projects},{field:"clientId",label:"Mijoz",items:clients}].map(s=>(
                <div key={s.field} className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider" style={{color:"#555"}}>{s.label}</label>
                  <select value={(incForm as any)[s.field]} onChange={e=>setIncForm(f=>({...f,[s.field]:e.target.value}))}
                    className="w-full h-10 px-3 text-sm rounded"
                    style={{background:"#0d0d0d",border:"1px solid #222",color:"#888",outline:"none"}}>
                    <option value="none">— Yo'q —</option>
                    {s.items.map((x:any)=><option key={x.id} value={x.id}>{x.name}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button onClick={()=>setIncOpen(false)} className="btn-ghost h-9 px-4 text-sm">Bekor</button>
            <button onClick={addIncome} disabled={saving} className="btn-primary h-9 px-4 text-sm">
              {saving?"...":"Qo'shish"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Expense Dialog */}
      <Dialog open={expOpen} onOpenChange={setExpOpen}>
        <DialogContent className="max-w-md rounded" style={{background:"#0f0f0f",border:"1px solid #222",color:"#f0f0f0"}}>
          <DialogHeader>
            <DialogTitle style={{color:"#f0f0f0"}}>Xarajat qo'shish</DialogTitle>
            <DialogDescription style={{color:"#555"}}>Xarajat ma'lumotlari</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{color:"#555"}}>Sana</label>
                {inp(expForm.date, v=>setExpForm(f=>({...f,date:v})), "", "date")}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{color:"#555"}}>Summa</label>
                {inp(expForm.amount, v=>setExpForm(f=>({...f,amount:v})), "0", "number")}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{color:"#555"}}>Kategoriya</label>
              <select value={expForm.category} onChange={e=>setExpForm(f=>({...f,category:e.target.value}))}
                className="w-full h-10 px-3 text-sm rounded"
                style={{background:"#0d0d0d",border:"1px solid #222",color:"#888",outline:"none"}}>
                {Object.entries(EXPENSE_CATEGORIES).map(([k,v])=><option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{color:"#555"}}>Tavsif</label>
              {inp(expForm.description, v=>setExpForm(f=>({...f,description:v})), "Xarajat maqsadi...")}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button onClick={()=>setExpOpen(false)} className="btn-ghost h-9 px-4 text-sm">Bekor</button>
            <button onClick={addExpense} disabled={saving} className="btn-primary h-9 px-4 text-sm">
              {saving?"...":"Qo'shish"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
