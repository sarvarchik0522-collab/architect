"use client"
import { useState, useCallback, useEffect } from "react"
import { BarChart3, TrendingUp, TrendingDown, DollarSign, RefreshCw, Printer, FileDown } from "lucide-react"
import { exportReportToWord, printReportPDF } from "@/lib/export"
import { cn, formatCurrency, formatDate, PROJECT_STATUSES, TASK_STATUSES, TASK_PRIORITIES, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"

const MONTHS = ["Yanvar","Fevral","Mart","Aprel","May","Iyun","Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr"]

/* ─── Warm palette constants ─── */
const C = {
  ink:"var(--ink)", ink3:"var(--ink3)", cream:"var(--cream)", cream2:"var(--cream2)",
  stone:"var(--stone)", stone2:"var(--stone2)", white:"var(--white)",
  border:"rgba(200,168,112,.14)", gold:"var(--gold)",
}

/* ─── Frieze section title ─── */
function SectionTitle({ emoji, title, count }: { emoji:string; title:string; count?:number }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div style={{ width:12, height:1, background:"var(--gold)", opacity:.6 }} />
      <span className="text-xl">{emoji}</span>
      <h3 className="font-bold text-base"
        style={{ fontFamily:"'Playfair Display',serif", color:C.ink }}>{title}</h3>
      {count !== undefined && (
        <span className="text-[10px] px-2 py-0.5 rounded-sm font-semibold"
          style={{ background:C.cream2, border:`1px solid ${C.border}`, color:C.stone2 }}>
          {count} ta
        </span>
      )}
    </div>
  )
}

/* ─── Table wrapper ─── */
function TableWrapper({ children }: { children:React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-sm" style={{ border:`1px solid ${C.border}` }}>
      <table className="table-arch w-full text-sm">{children}</table>
    </div>
  )
}

function Th({ children, className }: { children:React.ReactNode; className?:string }) {
  return (
    <th className={cn("px-4 py-3 text-left font-bold uppercase tracking-wider", className)}
      style={{ background:C.cream2, color:C.stone2, fontSize:9, letterSpacing:".12em",
        borderBottom:`1.5px solid rgba(200,168,112,.2)` }}>
      {children}
    </th>
  )
}
function Td({ children, className }: { children:React.ReactNode; className?:string }) {
  return (
    <td className={cn("px-4 py-3 text-sm", className)}
      style={{ color:C.ink3, borderBottom:`1px solid rgba(200,168,112,.06)` }}>
      {children}
    </td>
  )
}
function Tr({ children, className }: { children:React.ReactNode; className?:string }) {
  return (
    <tr className={cn("transition-colors hover:bg-[var(--cream)]", className)}>
      {children}
    </tr>
  )
}
function TotalRow({ children }: { children:React.ReactNode }) {
  return (
    <tr style={{ background:"rgba(200,168,112,.05)", fontWeight:700 }}>{children}</tr>
  )
}

/* ─── Custom chart tooltip ─── */
const CT = ({ active, payload, label }: any) => {
  if (!active||!payload?.length) return null
  return (
    <div className="rounded-sm p-3 text-sm"
      style={{ background:C.white, border:`1px solid ${C.border}`, boxShadow:"var(--shadow-md)" }}>
      <p className="font-bold mb-1"
        style={{ color:C.ink, fontFamily:"'Playfair Display',serif" }}>{label}</p>
      {payload.map((p:any) => (
        <p key={p.dataKey} style={{ color:p.dataKey==="Daromad"?C.ink:C.stone2 }}>
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
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ type, year:String(year), month:String(month), week:String(week) })
      setData(await fetch(`/api/reports?${params}`).then(r => r.json()))
    } finally { setLoading(false) }
  }, [type, year, month, week])

  const years = [year - 1, year, year + 1]

  const periodLabel = !mounted ? "" : (
    type === "weekly"  ? `${MONTHS[month-1]} ${week}-hafta, ${year}` :
    type === "monthly" ? `${MONTHS[month-1]} ${year}` : `${year} yil`
  )

  const clientIncomeMap: Record<string,number> = {}
  if (data?.incomes) {
    for (const inc of data.incomes) {
      if (inc.clientId) clientIncomeMap[inc.clientId] = (clientIncomeMap[inc.clientId]??0) + inc.amount
    }
  }

  const totalIncomeSum  = data?.incomes?.reduce((s:number,i:any)=>s+i.amount,0)??0
  const totalExpenseSum = data?.expenses?.reduce((s:number,e:any)=>s+e.amount,0)??0

  const chartData = !month ? MONTHS.map((m,i)=>({
    month: m.slice(0,3),
    Daromad:  data?.incomes?.filter((x:any)=>new Date(x.date).getMonth()===i).reduce((s:number,x:any)=>s+x.amount,0)??0,
    Xarajat: data?.expenses?.filter((x:any)=>new Date(x.date).getMonth()===i).reduce((s:number,x:any)=>s+x.amount,0)??0,
  })) : []

  const inputSt = { background:C.cream, border:`1px solid ${C.border}`, color:C.ink2, borderRadius:4, outline:"none" } as React.CSSProperties

  return (
    <div className="space-y-6 anim-page">

      {/* ─── Header banner ─── */}
      <div className="relative overflow-hidden rounded-sm"
        style={{
          background:"linear-gradient(135deg,var(--cream2) 0%,var(--cream) 50%,var(--cream2) 100%)",
          border:`1px solid rgba(200,168,112,.2)`,
          boxShadow:"var(--shadow-md)",
        }}>
        <div style={{ height:2, background:"linear-gradient(90deg,transparent,var(--gold),var(--gold2),var(--gold),transparent)" }}/>
        <div className="frieze-band px-6 py-1.5" style={{ borderColor:"rgba(200,168,112,.12)" }}>
          <span style={{ fontSize:8, color:C.stone, letterSpacing:".22em", fontWeight:600, textTransform:"uppercase" }}>
            MOLIYA VA FAOLIYAT TAHLILI
          </span>
        </div>
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-sm flex items-center justify-center"
              style={{ background:C.cream2, border:`1px solid ${C.border}` }}>
              <BarChart3 className="h-5 w-5" style={{ color:C.stone2 }} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight"
                style={{ fontFamily:"'Playfair Display',serif", color:C.ink }}>Hisobotlar</h2>
              <p style={{ fontSize:12, color:C.stone2 }}>Jadval ko'rinishida tahlil</p>
            </div>
          </div>
          {data && (
            <div className="flex gap-2 no-print">
              <button onClick={() => exportReportToWord(data, periodLabel)}
                className="btn-outline h-9 px-4 text-sm flex items-center gap-2">
                <FileDown className="h-4 w-4" /> Word (.doc)
              </button>
              <button onClick={() => printReportPDF(data, periodLabel)}
                className="btn-ink h-9 px-4 text-sm flex items-center gap-2">
                <Printer className="h-4 w-4" /> PDF (1 varaq)
              </button>
            </div>
          )}
        </div>

        {/* ─── Filters ─── */}
        <div className="flex flex-wrap gap-3 px-6 pb-5 no-print">
          <select value={type} onChange={e=>setType(e.target.value)}
            className="h-9 px-3 text-sm rounded-sm" style={inputSt}>
            <option value="weekly">Haftalik</option>
            <option value="monthly">Oylik</option>
            <option value="yearly">Yillik</option>
          </select>
          <select value={String(year)} onChange={e=>setYear(+e.target.value)}
            className="h-9 px-3 text-sm rounded-sm" style={{...inputSt,minWidth:80}}>
            {years.map(y=><option key={y} value={y}>{y}</option>)}
          </select>
          {(type==="monthly"||type==="weekly") && (
            <select value={String(month)} onChange={e=>setMonth(+e.target.value)}
              className="h-9 px-3 text-sm rounded-sm" style={{...inputSt,minWidth:130}}>
              {MONTHS.map((m,i)=><option key={i} value={i+1}>{m}</option>)}
            </select>
          )}
          {type==="weekly" && (
            <select value={String(week)} onChange={e=>setWeek(+e.target.value)}
              className="h-9 px-3 text-sm rounded-sm" style={{...inputSt,minWidth:100}}>
              {[1,2,3,4,5].map(w=><option key={w} value={w}>{w}-hafta</option>)}
            </select>
          )}
          <button onClick={load} disabled={loading}
            className="btn-ink h-9 px-4 text-sm flex items-center gap-2">
            {loading
              ? <><RefreshCw className="h-4 w-4 animate-spin" /> Yuklanmoqda...</>
              : <><BarChart3 className="h-4 w-4" /> Hisobotni ko'rish</>
            }
          </button>
        </div>
      </div>

      {/* ─── Empty state ─── */}
      {!data && !loading && (
        <div className="flex flex-col items-center py-20" style={{ color:C.stone }}>
          <BarChart3 className="h-12 w-12 mb-3 opacity-20" />
          <p className="font-semibold" style={{ color:C.ink3 }}>Davr tanlang va hisobotni ko'ring</p>
        </div>
      )}

      {/* ─── Report content ─── */}
      {data && (
        <div className="space-y-6" id="report-content">

          {/* Print header */}
          <div className="hidden print:block text-center mb-6"
            style={{ borderBottom:`2px solid rgba(200,168,112,.3)`, paddingBottom:16 }}>
            <h1 className="text-2xl font-black" style={{ fontFamily:"'Playfair Display',serif", color:C.ink }}>
              🏛️ ARXITEKTOR KUNDALIGI — HISOBOT
            </h1>
            <p className="font-semibold mt-1" style={{ color:C.ink3 }}>{periodLabel}</p>
            <p className="text-xs mt-0.5" style={{ color:C.stone2 }}>
              {mounted ? new Date().toLocaleDateString("uz-UZ",{year:"numeric",month:"long",day:"numeric"}) : ""}
            </p>
          </div>

          {/* ─── A: Finance summary ─── */}
          <section>
            <SectionTitle emoji="💰" title="Moliya Xulosasi" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label:"Jami Daromad",  value:data.finance.totalIncome,  icon:TrendingUp,   pos:true  },
                { label:"Jami Xarajat",  value:data.finance.totalExpense, icon:TrendingDown,  pos:false },
                { label:"Sof Foyda",     value:data.finance.profit,       icon:DollarSign,    pos:data.finance.profit>=0 },
              ].map(s=>(
                <div key={s.label} className="card-premium p-5">
                  <div style={{ height:1.5, background:`linear-gradient(90deg,transparent,${s.pos?"var(--gold)":"var(--stone)"},transparent)`, marginBottom:12 }}/>
                  <div className="flex items-center justify-between mb-2">
                    <p style={{ fontSize:9, color:C.stone2, fontWeight:700, letterSpacing:".14em", textTransform:"uppercase" as const }}>
                      {s.label}
                    </p>
                    <s.icon className="h-4 w-4" style={{ color:C.stone }} />
                  </div>
                  <p className="font-black text-2xl"
                    style={{ color:C.ink, fontFamily:"'Playfair Display',serif" }}>
                    {formatCurrency(Math.abs(s.value))}
                  </p>
                  {s.label==="Sof Foyda" && (
                    <p className="text-xs mt-1" style={{ color:C.stone2 }}>
                      {data.finance.profit>=0 ? "✅ Ijobiy natija" : "⚠️ Zarar"}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ─── Yearly chart ─── */}
          {type==="yearly" && chartData.some(d=>d.Daromad>0||d.Xarajat>0) && (
            <section className="card-premium p-5">
              <SectionTitle emoji="📈" title={`${year} yil — Oylik dinamika`} />
              <ResponsiveContainer width="100%" height={230}>
                <AreaChart data={chartData} margin={{top:5,right:10,left:10,bottom:5}}>
                  <defs>
                    <linearGradient id="gI2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--ink)" stopOpacity={0.12}/>
                      <stop offset="95%" stopColor="var(--ink)" stopOpacity={0.01}/>
                    </linearGradient>
                    <linearGradient id="gE2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--stone2)" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="var(--stone2)" stopOpacity={0.01}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,168,112,.1)"/>
                  <XAxis dataKey="month" tick={{fontSize:11,fill:C.stone2}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:10,fill:C.stone2}} axisLine={false} tickLine={false}
                    tickFormatter={v=>(v/1000000).toFixed(0)+"M"}/>
                  <Tooltip content={<CT/>}/>
                  <Area type="monotone" dataKey="Daromad" stroke={C.ink} strokeWidth={1.8}
                    fill="url(#gI2)" dot={{fill:C.ink,r:3}} activeDot={{r:5}}/>
                  <Area type="monotone" dataKey="Xarajat" stroke={C.stone2} strokeWidth={1.5}
                    fill="url(#gE2)" dot={{fill:C.stone2,r:3}} activeDot={{r:5}}/>
                </AreaChart>
              </ResponsiveContainer>
            </section>
          )}

          {/* ─── B: Income table ─── */}
          <section className="card-premium p-5">
            <SectionTitle emoji="📈" title="Daromadlar Jadvali" count={data.incomes.length} />
            {data.incomes.length===0 ? (
              <p className="text-center py-8 text-sm" style={{ color:C.stone }}>Bu davrda daromad yo'q</p>
            ) : (
              <TableWrapper>
                <thead><tr>
                  <Th className="w-10">№</Th><Th>Sana</Th><Th>Tavsif</Th>
                  <Th>Loyiha</Th><Th>Mijoz</Th><Th className="text-right">Summa</Th>
                </tr></thead>
                <tbody>
                  {data.incomes.map((inc:any,i:number)=>(
                    <Tr key={inc.id}>
                      <Td style={{ fontFamily:"monospace", color:C.stone }}>{i+1}</Td>
                      <Td className="whitespace-nowrap">{formatDate(inc.date)}</Td>
                      <Td>{inc.description||(INCOME_CATEGORIES[inc.category as keyof typeof INCOME_CATEGORIES]??inc.category??"—")}</Td>
                      <Td>{inc.project?.name??"—"}</Td>
                      <Td>{inc.client?.name??"—"}</Td>
                      <Td className="text-right font-bold whitespace-nowrap"
                        style={{ color:C.ink, fontFamily:"'Playfair Display',serif" }}>
                        +{formatCurrency(inc.amount)}
                      </Td>
                    </Tr>
                  ))}
                </tbody>
                <tfoot>
                  <TotalRow>
                    <Td/><Td colSpan={4} className="font-bold" style={{ color:C.ink }}>Jami Daromad</Td>
                    <Td className="text-right font-black text-base whitespace-nowrap"
                      style={{ color:C.ink, fontFamily:"'Playfair Display',serif" }}>
                      +{formatCurrency(totalIncomeSum)}
                    </Td>
                  </TotalRow>
                </tfoot>
              </TableWrapper>
            )}
          </section>

          {/* ─── C: Expense table ─── */}
          <section className="card-premium p-5">
            <SectionTitle emoji="📉" title="Xarajatlar Jadvali" count={data.expenses.length} />
            {data.expenses.length===0 ? (
              <p className="text-center py-8 text-sm" style={{ color:C.stone }}>Bu davrda xarajat yo'q</p>
            ) : (
              <TableWrapper>
                <thead><tr>
                  <Th className="w-10">№</Th><Th>Sana</Th><Th>Tavsif</Th>
                  <Th>Kategoriya</Th><Th className="text-right">Summa</Th>
                </tr></thead>
                <tbody>
                  {data.expenses.map((exp:any,i:number)=>(
                    <Tr key={exp.id}>
                      <Td style={{ fontFamily:"monospace", color:C.stone }}>{i+1}</Td>
                      <Td className="whitespace-nowrap">{formatDate(exp.date)}</Td>
                      <Td>{exp.description??"—"}</Td>
                      <Td>{EXPENSE_CATEGORIES[exp.category as keyof typeof EXPENSE_CATEGORIES]??exp.category??"—"}</Td>
                      <Td className="text-right font-bold whitespace-nowrap" style={{ color:C.stone2 }}>
                        -{formatCurrency(exp.amount)}
                      </Td>
                    </Tr>
                  ))}
                </tbody>
                <tfoot>
                  <TotalRow>
                    <Td/><Td colSpan={3} className="font-bold" style={{ color:C.ink }}>Jami Xarajat</Td>
                    <Td className="text-right font-black text-base whitespace-nowrap"
                      style={{ color:C.ink3, fontFamily:"'Playfair Display',serif" }}>
                      -{formatCurrency(totalExpenseSum)}
                    </Td>
                  </TotalRow>
                </tfoot>
              </TableWrapper>
            )}
          </section>

          {/* ─── D: Client activity ─── */}
          <section className="card-premium p-5">
            <SectionTitle emoji="👥" title="Mijozlar Faoliyati" count={data.clients.activeList.length} />
            {data.clients.activeList.length===0 ? (
              <p className="text-center py-8 text-sm" style={{ color:C.stone }}>Bu davrda faol mijoz yo'q</p>
            ) : (
              <TableWrapper>
                <thead><tr>
                  <Th className="w-10">№</Th><Th>Mijoz ismi</Th><Th>Telefon</Th>
                  <Th>Manzil</Th><Th className="text-right">Kelishilgan summa</Th>
                  <Th className="text-right">Olingan summa</Th>
                  <Th className="text-right">Qolgan summa</Th>
                </tr></thead>
                <tbody>
                  {data.clients.activeList.map((client:any,i:number)=>{
                    const received = clientIncomeMap[client.id]??0
                    return (
                      <Tr key={client.id}>
                        <Td style={{ fontFamily:"monospace", color:C.stone }}>{i+1}</Td>
                        <Td className="font-semibold">{client.name}</Td>
                        <Td>{client.phone??"—"}</Td>
                        <Td>{client.address??"—"}</Td>
                        <Td className="text-right" style={{ color:C.stone }}>—</Td>
                        <Td className="text-right font-bold whitespace-nowrap"
                          style={{ color:C.ink, fontFamily:"'Playfair Display',serif" }}>
                          {received>0?`+${formatCurrency(received)}`:"—"}
                        </Td>
                        <Td className="text-right" style={{ color:C.stone }}>—</Td>
                      </Tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <TotalRow>
                    <Td/><Td colSpan={4} className="font-bold" style={{ color:C.ink }}>Jami</Td>
                    <Td className="text-right font-black whitespace-nowrap"
                      style={{ color:C.ink, fontFamily:"'Playfair Display',serif" }}>
                      +{formatCurrency(Object.values(clientIncomeMap).reduce((s,v)=>s+v,0))}
                    </Td>
                    <Td/>
                  </TotalRow>
                </tfoot>
              </TableWrapper>
            )}
          </section>

          {/* ─── E: Projects ─── */}
          {data.projects.list.length>0&&(
            <section className="card-premium p-5">
              <SectionTitle emoji="📐" title="Loyihalar Xulosasi" count={data.projects.list.length} />
              <TableWrapper>
                <thead><tr>
                  <Th className="w-10">№</Th><Th>Loyiha nomi</Th><Th>Mijoz</Th>
                  <Th>Holat</Th><Th className="text-right">Byudjet</Th>
                </tr></thead>
                <tbody>
                  {data.projects.list.map((p:any,i:number)=>{
                    const s=PROJECT_STATUSES[p.status as keyof typeof PROJECT_STATUSES]
                    return (
                      <Tr key={p.id}>
                        <Td style={{ fontFamily:"monospace", color:C.stone }}>{i+1}</Td>
                        <Td className="font-semibold">{p.name}</Td>
                        <Td>{p.client?.name??"—"}</Td>
                        <Td>
                          <span className={cn("text-[10px] px-2 py-0.5 rounded-sm font-semibold",s?.color??"")}>{s?.label??p.status}</span>
                        </Td>
                        <Td className="text-right whitespace-nowrap">{p.budget?formatCurrency(p.budget):"—"}</Td>
                      </Tr>
                    )
                  })}
                </tbody>
              </TableWrapper>
            </section>
          )}

          {/* ─── F: Tasks ─── */}
          <section className="card-premium p-5">
            <SectionTitle emoji="✅" title="Vazifalar Xulosasi" count={data.tasks.total} />
            {(!data.tasks.list||data.tasks.list?.length===0)?(
              <div className="grid grid-cols-3 gap-4">
                {[
                  {l:"Bajarilmagan",v:data.tasks.todo,       c:C.stone2  },
                  {l:"Jarayonda",   v:data.tasks.inProgress, c:C.ink3    },
                  {l:"Bajarildi",   v:data.tasks.done,       c:C.ink     },
                ].map(s=>(
                  <div key={s.l} className="text-center p-4 rounded-sm"
                    style={{ background:C.cream2, border:`1px solid ${C.border}` }}>
                    <p className="text-2xl font-black" style={{ color:s.c, fontFamily:"'Playfair Display',serif" }}>{s.v}</p>
                    <p className="text-xs mt-1" style={{ color:C.stone2 }}>{s.l}</p>
                  </div>
                ))}
              </div>
            ):(
              <TableWrapper>
                <thead><tr>
                  <Th className="w-10">№</Th><Th>Nomi</Th><Th>Holat</Th>
                  <Th>Prioritet</Th><Th>Deadline</Th>
                </tr></thead>
                <tbody>
                  {data.tasks.list.map((task:any,i:number)=>{
                    const st=TASK_STATUSES[task.status as keyof typeof TASK_STATUSES]
                    const pr=TASK_PRIORITIES[task.priority as keyof typeof TASK_PRIORITIES]
                    const ov=task.deadline&&new Date(task.deadline)<new Date()&&task.status!=="DONE"
                    return (
                      <Tr key={task.id}>
                        <Td style={{ fontFamily:"monospace", color:C.stone }}>{i+1}</Td>
                        <Td className="font-medium">{task.title}</Td>
                        <Td><span className={cn("text-[10px] px-2 py-0.5 rounded-sm font-semibold",st?.color??"")}>{st?.label??task.status}</span></Td>
                        <Td><span className={cn("text-[10px] px-2 py-0.5 rounded-sm font-semibold",pr?.color??"")}>{pr?.label??task.priority}</span></Td>
                        <Td className={cn("whitespace-nowrap",ov?"font-semibold":"")}>
                          {task.deadline?(ov?"⚠️ ":"")+formatDate(task.deadline):"—"}
                        </Td>
                      </Tr>
                    )
                  })}
                </tbody>
              </TableWrapper>
            )}
          </section>

          {/* Print footer */}
          <div className="hidden print:block text-center mt-6 pt-4"
            style={{ borderTop:`1px solid rgba(200,168,112,.2)` }}>
            <p className="text-xs" style={{ color:C.stone2 }}>
              Arxitektor Kundaligi · {mounted?new Date().toLocaleDateString("uz-UZ"):""} · Hisobot
            </p>
          </div>
        </div>
      )}

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; -webkit-print-color-adjust: exact; }
          .card-premium { border: 1px solid rgba(200,168,112,.2) !important; box-shadow: none !important; }
          @page { margin: 20mm; }
        }
      `}</style>
    </div>
  )
}
