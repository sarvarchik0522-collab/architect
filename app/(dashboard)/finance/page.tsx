"use client"
import { useState, useEffect, useCallback } from "react"
import { TrendingUp, TrendingDown, DollarSign, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { formatDate, formatCurrency, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "@/lib/utils"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"

const C = { ink:"var(--ink)", ink2:"var(--ink2)", ink3:"var(--ink3)", cream:"var(--cream)", cream2:"var(--cream2)", stone:"var(--stone)", stone2:"var(--stone2)", white:"var(--white)", border:"rgba(200,168,112,.14)", gold:"var(--gold)" }
const MS=["Yan","Fev","Mar","Apr","May","Iyu","Iyl","Avg","Sen","Okt","Noy","Dek"]
const MF=["Yanvar","Fevral","Mart","Aprel","May","Iyun","Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr"]
const inputSt={ background:C.cream, border:`1px solid ${C.border}`, borderRadius:3, color:C.ink, outline:"none" }

const CT = ({ active, payload, label }: any) => {
  if (!active||!payload?.length) return null
  return (
    <div className="rounded-sm p-3 text-sm" style={{background:C.white,border:`1px solid ${C.border}`,boxShadow:"var(--shadow-md)"}}>
      <p className="font-bold mb-1" style={{color:C.ink,fontFamily:"'Playfair Display',serif"}}>{label}</p>
      {payload.map((p:any)=>(
        <p key={p.dataKey} style={{color:p.dataKey==="Daromad"?C.ink:C.stone2}}>{p.name}: {formatCurrency(p.value)}</p>
      ))}
    </div>
  )
}

export default function FinancePage() {
  const [incomes, setIncomes] =useState<any[]>([])
  const [expenses,setExpenses]=useState<any[]>([])
  const [projects,setProjects]=useState<any[]>([])
  const [clients, setClients] =useState<any[]>([])
  const [loading, setLoading] =useState(true)
  const [year,    setYear]    =useState(new Date().getFullYear())
  const [month,   setMonth]   =useState<number|null>(null)
  const [incOpen, setIncOpen] =useState(false)
  const [expOpen, setExpOpen] =useState(false)
  const [saving,  setSaving]  =useState(false)
  const { toast }=useToast()

  const [incF,setIncF]=useState({date:new Date().toISOString().split("T")[0],amount:"",description:"",category:"PROJECT_PAYMENT",projectId:"none",clientId:"none"})
  const [expF,setExpF]=useState({date:new Date().toISOString().split("T")[0],amount:"",description:"",category:"OTHER"})

  const load=useCallback(async()=>{
    setLoading(true)
    const p=month?`year=${year}&month=${month}`:`year=${year}`
    const [i,e]=await Promise.all([fetch(`/api/finance/income?${p}`).then(r=>r.json()),fetch(`/api/finance/expense?${p}`).then(r=>r.json())])
    setIncomes(i);setExpenses(e);setLoading(false)
  },[year,month])
  useEffect(()=>{load()},[load])
  useEffect(()=>{
    fetch("/api/projects").then(r=>r.json()).then(d=>setProjects(d.map((p:any)=>({id:p.id,name:p.name}))))
    fetch("/api/clients").then(r=>r.json()).then(d=>setClients(d.map((c:any)=>({id:c.id,name:c.name}))))
  },[])

  const tI=incomes.reduce((s,i)=>s+i.amount,0)
  const tE=expenses.reduce((s,e)=>s+e.amount,0)
  const pft=tI-tE

  const addIncome=async()=>{
    if (!incF.amount) return toast({variant:"destructive",title:"Summa kerak"})
    setSaving(true)
    try {
      await fetch("/api/finance/income",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({...incF,amount:+incF.amount,projectId:incF.projectId==="none"?null:incF.projectId||null,clientId:incF.clientId==="none"?null:incF.clientId||null})})
      toast({title:"Qo'shildi ✓"});setIncOpen(false);load()
    } catch { toast({variant:"destructive",title:"Xatolik"}) } finally { setSaving(false) }
  }
  const addExpense=async()=>{
    if (!expF.amount) return toast({variant:"destructive",title:"Summa kerak"})
    setSaving(true)
    try {
      await fetch("/api/finance/expense",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...expF,amount:+expF.amount})})
      toast({title:"Qo'shildi ✓"});setExpOpen(false);load()
    } catch { toast({variant:"destructive",title:"Xatolik"}) } finally { setSaving(false) }
  }

  const chartData=!month?MS.map((m,i)=>({
    month:m,
    Daromad:incomes.filter(x=>new Date(x.date).getMonth()===i).reduce((s,x)=>s+x.amount,0),
    Xarajat:expenses.filter(x=>new Date(x.date).getMonth()===i).reduce((s,x)=>s+x.amount,0),
  })):[]

  return (
    <div className="space-y-5 anim-page">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-black tracking-tight"
            style={{fontFamily:"'Playfair Display',serif",color:C.ink}}>Moliya</h2>
          <p style={{fontSize:12,color:C.stone2}}>{month?MF[month-1]:year} yil</p>
        </div>
        <div className="flex gap-2">
          <button onClick={()=>setExpOpen(true)} className="btn-outline h-9 px-4 text-sm flex items-center gap-2">
            <TrendingDown className="h-4 w-4"/> Xarajat
          </button>
          <button onClick={()=>setIncOpen(true)} className="btn-ink h-9 px-4 text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4"/> Daromad
          </button>
        </div>
      </div>

      {/* Period */}
      <div className="flex items-center gap-2 flex-wrap">
        <select value={String(year)} onChange={e=>setYear(+e.target.value)}
          className="h-9 px-3 text-sm rounded-sm" style={{...inputSt,color:C.ink3,minWidth:80}}>
          {[year-1,year,year+1].map(y=><option key={y} value={y}>{y}</option>)}
        </select>
        <button onClick={()=>setMonth(null)}
          className="h-9 px-3 text-sm font-semibold rounded-sm transition-all"
          style={{background:!month?C.ink:C.cream2,color:!month?"var(--cream)":C.stone2,border:`1px solid ${!month?C.ink:C.border}`}}>
          Yil
        </button>
        {MS.map((m,i)=>(
          <button key={i} onClick={()=>setMonth(month===i+1?null:i+1)}
            className="h-9 px-3 text-sm font-medium rounded-sm transition-all"
            style={{background:month===i+1?C.ink:C.cream2,color:month===i+1?"var(--cream)":C.stone2,
              border:`1px solid ${month===i+1?C.ink:C.border}`}}>
            {m}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {l:"Daromad",   v:tI,  Icon:TrendingUp,   top:"var(--ink)"},
          {l:"Xarajat",   v:tE,  Icon:TrendingDown,  top:C.stone2},
          {l:"Sof foyda", v:pft, Icon:DollarSign,    top:pft>=0?C.ink:C.stone},
        ].map((s,i)=>(
          <div key={s.l} className="card-premium p-5">
            <div className="flex items-center justify-between mb-3">
              <p style={{fontSize:9,color:C.stone2,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase"}}>{s.l}</p>
              <s.Icon className="h-4 w-4" style={{color:C.stone}}/>
            </div>
            <p className="font-black text-xl" style={{color:s.top,fontFamily:"'Playfair Display',serif"}}>
              {formatCurrency(Math.abs(s.v))}
            </p>
            {s.l==="Sof foyda"&&<p className="text-xs mt-0.5" style={{color:C.stone2}}>{pft>=0?"Ijobiy natija":"Zarar"}</p>}
          </div>
        ))}
      </div>

      {/* Chart */}
      {!month&&chartData.some(d=>d.Daromad>0||d.Xarajat>0)&&(
        <div className="card-premium p-5">
          <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{color:C.stone2,letterSpacing:".14em"}}>
            {year} yil dinamika
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{top:5,right:10,left:10,bottom:5}}>
              <defs>
                <linearGradient id="gI" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--ink)" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="var(--ink)" stopOpacity={0.01}/>
                </linearGradient>
                <linearGradient id="gE" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--stone)" stopOpacity={0.12}/>
                  <stop offset="95%" stopColor="var(--stone)" stopOpacity={0.01}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,168,112,.12)"/>
              <XAxis dataKey="month" tick={{fontSize:11,fill:C.stone2}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:C.stone2}} axisLine={false} tickLine={false} tickFormatter={v=>(v/1000000).toFixed(0)+"M"}/>
              <Tooltip content={<CT/>}/>
              <Area type="monotone" dataKey="Daromad" stroke={C.ink} strokeWidth={1.8} fill="url(#gI)" dot={{fill:C.ink,r:3}} activeDot={{r:5}}/>
              <Area type="monotone" dataKey="Xarajat" stroke={C.stone2} strokeWidth={1.5} fill="url(#gE)" dot={{fill:C.stone2,r:3}} activeDot={{r:5}}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="income">
        <TabsList className="rounded-sm" style={{background:C.cream2,border:`1px solid ${C.border}`}}>
          <TabsTrigger value="income" className="rounded-sm text-sm"
            style={{color:C.stone2}}>
            Daromadlar ({incomes.length})
          </TabsTrigger>
          <TabsTrigger value="expense" className="rounded-sm text-sm"
            style={{color:C.stone2}}>
            Xarajatlar ({expenses.length})
          </TabsTrigger>
        </TabsList>
        {["income","expense"].map(tab=>{
          const items=tab==="income"?incomes:expenses
          return (
            <TabsContent key={tab} value={tab} className="mt-3">
              <div className="card-premium overflow-hidden">
                {loading?<div className="skeleton h-16 m-4"/>:
                 items.length===0?<p className="text-center py-8 text-sm" style={{color:C.stone}}>
                   {tab==="income"?"Daromad":"Xarajat"} yo'q</p>:
                 <div style={{borderTop:`1px solid rgba(200,168,112,.06)`}}>
                   {items.map((item:any)=>(
                     <div key={item.id}
                       className="flex items-center justify-between px-4 py-3 group transition-colors"
                       style={{borderBottom:`1px solid rgba(200,168,112,.06)`}}
                       onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background=C.cream}}
                       onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="transparent"}}>
                       <div>
                         <p className="text-sm font-medium" style={{color:C.ink}}>{item.description||"Yozuv"}</p>
                         <p className="text-xs" style={{color:C.stone2}}>
                           {formatDate(item.date)}{item.project?` · ${item.project.name}`:""}
                           {tab==="expense"&&item.category?` · ${EXPENSE_CATEGORIES[item.category as keyof typeof EXPENSE_CATEGORIES]||item.category}`:""}
                         </p>
                       </div>
                       <div className="flex items-center gap-3">
                         <span className="font-bold text-sm"
                           style={{color:tab==="income"?C.ink:C.stone2,
                             fontFamily:"'Playfair Display',serif"}}>
                           {tab==="income"?"+":"-"}{formatCurrency(item.amount)}
                         </span>
                         <button
                           onClick={async()=>{await fetch(`/api/finance/${tab}/${item.id}`,{method:"DELETE"});load()}}
                           className="h-6 w-6 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                           style={{color:C.stone}}
                           onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background=C.cream2}}
                           onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="transparent"}}>
                           <Trash2 className="h-3.5 w-3.5"/>
                         </button>
                       </div>
                     </div>
                   ))}
                 </div>
                }
              </div>
            </TabsContent>
          )
        })}
      </Tabs>

      {/* Income Dialog */}
      <Dialog open={incOpen} onOpenChange={setIncOpen}>
        <DialogContent className="max-w-md rounded-sm"
          style={{background:C.white,border:`1px solid ${C.border}`,boxShadow:"var(--shadow-xl)"}}>
          <div style={{height:2,background:"linear-gradient(90deg,transparent,var(--gold),transparent)",marginBottom:4}}/>
          <DialogHeader>
            <DialogTitle style={{color:C.ink,fontFamily:"'Playfair Display',serif",fontWeight:800}}>Daromad qo'shish</DialogTitle>
            <DialogDescription style={{color:C.stone2}}>To'lov ma'lumotlari</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              {[{f:"date",l:"Sana",t:"date"},{f:"amount",l:"Summa",t:"number",ph:"0"}].map(x=>(
                <div key={x.f} className="space-y-1.5">
                  <label style={{fontSize:9,color:C.stone2,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase" as const}}>{x.l}</label>
                  <input type={x.t} placeholder={(x as any).ph||""} value={(incF as any)[x.f]} onChange={e=>setIncF(f=>({...f,[x.f]:e.target.value}))}
                    className="w-full h-10 px-3 text-sm" style={inputSt}/>
                </div>
              ))}
            </div>
            <div className="space-y-1.5">
              <label style={{fontSize:9,color:C.stone2,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase" as const}}>Kategoriya</label>
              <select value={incF.category} onChange={e=>setIncF(f=>({...f,category:e.target.value}))}
                className="w-full h-10 px-3 text-sm" style={{...inputSt,color:C.ink3}}>
                {Object.entries(INCOME_CATEGORIES).map(([k,v])=><option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label style={{fontSize:9,color:C.stone2,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase" as const}}>Tavsif</label>
              <input placeholder="To'lov maqsadi..." value={incF.description} onChange={e=>setIncF(f=>({...f,description:e.target.value}))}
                className="w-full h-10 px-3 text-sm" style={inputSt}/>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[{f:"projectId",l:"Loyiha",items:projects},{f:"clientId",l:"Mijoz",items:clients}].map(s=>(
                <div key={s.f} className="space-y-1.5">
                  <label style={{fontSize:9,color:C.stone2,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase" as const}}>{s.l}</label>
                  <select value={(incF as any)[s.f]} onChange={e=>setIncF(f=>({...f,[s.f]:e.target.value}))}
                    className="w-full h-10 px-3 text-sm" style={{...inputSt,color:C.ink3}}>
                    <option value="none">— Yo'q —</option>
                    {s.items.map((x:any)=><option key={x.id} value={x.id}>{x.name}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button onClick={()=>setIncOpen(false)} className="btn-outline h-9 px-4 text-sm">Bekor</button>
            <button onClick={addIncome} disabled={saving} className="btn-ink h-9 px-4 text-sm">
              {saving?"...":"Qo'shish"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Expense Dialog */}
      <Dialog open={expOpen} onOpenChange={setExpOpen}>
        <DialogContent className="max-w-md rounded-sm"
          style={{background:C.white,border:`1px solid ${C.border}`,boxShadow:"var(--shadow-xl)"}}>
          <div style={{height:2,background:"linear-gradient(90deg,transparent,var(--gold),transparent)",marginBottom:4}}/>
          <DialogHeader>
            <DialogTitle style={{color:C.ink,fontFamily:"'Playfair Display',serif",fontWeight:800}}>Xarajat qo'shish</DialogTitle>
            <DialogDescription style={{color:C.stone2}}>Xarajat ma'lumotlari</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              {[{f:"date",l:"Sana",t:"date"},{f:"amount",l:"Summa",t:"number",ph:"0"}].map(x=>(
                <div key={x.f} className="space-y-1.5">
                  <label style={{fontSize:9,color:C.stone2,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase" as const}}>{x.l}</label>
                  <input type={x.t} placeholder={(x as any).ph||""} value={(expF as any)[x.f]} onChange={e=>setExpF(f=>({...f,[x.f]:e.target.value}))}
                    className="w-full h-10 px-3 text-sm" style={inputSt}/>
                </div>
              ))}
            </div>
            <div className="space-y-1.5">
              <label style={{fontSize:9,color:C.stone2,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase" as const}}>Kategoriya</label>
              <select value={expF.category} onChange={e=>setExpF(f=>({...f,category:e.target.value}))}
                className="w-full h-10 px-3 text-sm" style={{...inputSt,color:C.ink3}}>
                {Object.entries(EXPENSE_CATEGORIES).map(([k,v])=><option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label style={{fontSize:9,color:C.stone2,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase" as const}}>Tavsif</label>
              <input placeholder="Xarajat maqsadi..." value={expF.description} onChange={e=>setExpF(f=>({...f,description:e.target.value}))}
                className="w-full h-10 px-3 text-sm" style={inputSt}/>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button onClick={()=>setExpOpen(false)} className="btn-outline h-9 px-4 text-sm">Bekor</button>
            <button onClick={addExpense} disabled={saving} className="btn-ink h-9 px-4 text-sm">
              {saving?"...":"Qo'shish"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
