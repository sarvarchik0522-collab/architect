"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, FileSignature, Eye, Trash2, Search, CheckCircle, Clock, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn, formatDate, formatCurrency } from "@/lib/utils"

interface Contract {
  id:string; contractNumber:string; title:string
  clientName:string; projectName:string; totalAmount:number
  status:string; createdAt:string
}

const C = { ink:"var(--ink)", ink3:"var(--ink3)", cream:"var(--cream)", cream2:"var(--cream2)", stone:"var(--stone)", stone2:"var(--stone2)", white:"var(--white)", border:"rgba(200,168,112,.14)", gold:"var(--gold)" }

const STATUS_META: Record<string,{ label:string; color:string; icon:any }> = {
  DRAFT:    { label:"Qoralama",   color:"bg-[var(--cream2)] text-[var(--stone2)] border border-[rgba(200,168,112,.2)]", icon:FileText },
  ACTIVE:   { label:"Faol",       color:"bg-[var(--cream2)] text-[var(--ink3)] border border-[rgba(200,168,112,.25)]",  icon:CheckCircle },
  PENDING:  { label:"Kutilmoqda", color:"bg-[var(--cream2)] text-[var(--stone2)] border border-[rgba(200,168,112,.18)]",icon:Clock },
  COMPLETED:{ label:"Tugallandi", color:"bg-[var(--cream2)] text-[var(--ink)] border border-[rgba(200,168,112,.3)]",    icon:CheckCircle },
  CANCELLED:{ label:"Bekor",      color:"bg-[var(--cream2)] text-[var(--stone)] border border-[rgba(200,168,112,.12)]", icon:Trash2 },
}

/* ─── Cornice decoration ─── */
function CorniceDot() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <polygon points="7,1 13,4 13,10 7,13 1,10 1,4"
        stroke="rgba(200,168,112,.5)" strokeWidth=".7" fill="none"/>
      <circle cx="7" cy="7" r="2" fill="rgba(200,168,112,.4)"/>
    </svg>
  )
}

export default function ContractsPage() {
  const [contracts,setContracts]=useState<Contract[]>([])
  const [loading,  setLoading]  =useState(true)
  const [search,   setSearch]   =useState("")
  const { toast }=useToast()

  const load=async()=>{
    setLoading(true)
    setContracts(await fetch("/api/contracts").then(r=>r.json()))
    setLoading(false)
  }
  useEffect(()=>{load()},[])

  const del=async(id:string)=>{
    if (!confirm("Shartnomani o'chirishni tasdiqlaysizmi?")) return
    await fetch(`/api/contracts/${id}`,{method:"DELETE"})
    toast({title:"O'chirildi"});load()
  }

  const filtered=contracts.filter(c=>
    c.clientName.toLowerCase().includes(search.toLowerCase())||
    c.projectName.toLowerCase().includes(search.toLowerCase())||
    c.contractNumber.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    total:     contracts.length,
    active:    contracts.filter(c=>c.status==="ACTIVE").length,
    draft:     contracts.filter(c=>c.status==="DRAFT").length,
    completed: contracts.filter(c=>c.status==="COMPLETED").length,
    totalSum:  contracts.reduce((s,c)=>s+c.totalAmount,0),
  }

  return (
    <div className="space-y-5 anim-page">

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
            SHARTNOMA GENERATORI
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-sm flex items-center justify-center"
              style={{ background:C.cream2, border:`1px solid ${C.border}` }}>
              <FileSignature className="h-5 w-5" style={{ color:C.stone2 }} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight"
                style={{ fontFamily:"'Playfair Display',serif", color:C.ink }}>Shartnomalar</h2>
              <p style={{ fontSize:12, color:C.stone2 }}>
                {contracts.length} ta shartnoma · {formatCurrency(stats.totalSum)}
              </p>
            </div>
          </div>
          <Link href="/contracts/new">
            <button className="btn-ink h-9 px-4 text-sm flex items-center gap-2">
              <Plus className="h-4 w-4" /> Yangi Shartnoma
            </button>
          </Link>
        </div>

        {/* Quick stats */}
        <div className="flex flex-wrap gap-3 px-6 pb-5">
          {[
            { label:"Jami",      val:stats.total,     emoji:"📜" },
            { label:"Faol",      val:stats.active,    emoji:"✅" },
            { label:"Qoralama",  val:stats.draft,     emoji:"📝" },
            { label:"Tugallandi",val:stats.completed, emoji:"🏁" },
          ].map(s=>(
            <div key={s.label} className="flex items-center gap-2 px-3 py-2 rounded-sm"
              style={{ background:"rgba(250,248,244,.85)", border:`1px solid ${C.border}`, backdropFilter:"blur(8px)" }}>
              <span className="text-base">{s.emoji}</span>
              <div>
                <p className="font-black leading-none"
                  style={{ color:C.ink, fontFamily:"'Playfair Display',serif", fontSize:"1.1rem" }}>{s.val}</p>
                <p style={{ fontSize:9, color:C.stone2 }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Search ─── */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color:C.stone }} />
        <input placeholder="Mijoz, loyiha, shartnoma raqami..."
          value={search} onChange={e=>setSearch(e.target.value)}
          className="w-full h-9 pl-9 pr-3 text-sm"
          style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:4, color:C.ink, outline:"none" }}
          onFocus={e=>{e.target.style.borderColor=C.stone2}} onBlur={e=>{e.target.style.borderColor=C.border}} />
      </div>

      {/* ─── Grid ─── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3].map(i=><div key={i} className="skeleton h-44"/>)}
        </div>
      ) : filtered.length===0 ? (
        <div className="flex flex-col items-center py-20" style={{ color:C.stone }}>
          <FileSignature className="h-10 w-10 mb-3 opacity-20"/>
          <p className="font-semibold" style={{ color:C.ink3 }}>Shartnoma topilmadi</p>
          <Link href="/contracts/new">
            <button className="btn-outline mt-4 h-9 px-4 text-sm flex items-center gap-2">
              <Plus className="h-4 w-4" /> Yaratish
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((c,i)=>{
            const sm=STATUS_META[c.status]??STATUS_META.DRAFT
            const StatusIcon=sm.icon
            return (
              <div key={c.id} className="card-premium anim-cardIn group"
                style={{ animationDelay:`${i*.06}s`, cursor:"default" }}>
                {/* Gold cornice */}
                <div style={{ height:1.5, background:"linear-gradient(90deg,transparent,var(--gold),transparent)" }}/>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold mb-1"
                        style={{ color:C.stone, letterSpacing:".1em" }}>
                        #{c.contractNumber}
                      </p>
                      <h3 className="font-bold text-sm leading-tight line-clamp-2"
                        style={{ color:C.ink, fontFamily:"'Playfair Display',serif" }}>
                        {c.title}
                      </h3>
                    </div>
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-sm font-semibold flex items-center gap-1 flex-shrink-0",sm.color)}>
                      <StatusIcon className="h-2.5 w-2.5" /> {sm.label}
                    </span>
                  </div>

                  <div className="space-y-1.5 mb-4">
                    <p className="text-sm flex items-center gap-2" style={{ color:C.stone2 }}>
                      <span className="text-base">👤</span> {c.clientName}
                    </p>
                    <p className="text-sm flex items-center gap-2" style={{ color:C.stone2 }}>
                      <span className="text-base">📐</span> {c.projectName}
                    </p>
                    <p className="text-sm font-bold flex items-center gap-2"
                      style={{ color:C.ink, fontFamily:"'Playfair Display',serif" }}>
                      <span className="text-base">💰</span> {formatCurrency(c.totalAmount)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3"
                    style={{ borderTop:`1px solid rgba(200,168,112,.1)` }}>
                    <p className="text-[10px]" style={{ color:C.stone }}>{formatDate(c.createdAt)}</p>
                    <div className="flex gap-1.5">
                      <Link href={`/contracts/${c.id}`}>
                        <button className="btn-outline h-7 px-2.5 text-xs flex items-center gap-1">
                          <Eye className="h-3 w-3" /> Ko'rish
                        </button>
                      </Link>
                      <button onClick={()=>del(c.id)}
                        className="h-7 w-7 rounded flex items-center justify-center transition-colors"
                        style={{ color:C.stone }}
                        onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background=C.cream2}}
                        onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="transparent"}}>
                        <Trash2 className="h-3.5 w-3.5"/>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
