"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Loader2, ArrowRight } from "lucide-react"
import { cn, formatDate, PROJECT_STATUSES, TASK_PRIORITIES } from "@/lib/utils"

const C = { ink:"var(--ink)", ink3:"var(--ink3)", cream:"var(--cream)", cream2:"var(--cream2)", stone:"var(--stone)", stone2:"var(--stone2)", white:"var(--white)", border:"rgba(200,168,112,.14)", gold:"var(--gold)" }

function useDebounce<T>(val:T, ms:number):T {
  const [dv,setDv]=useState(val)
  useEffect(()=>{const t=setTimeout(()=>setDv(val),ms);return()=>clearTimeout(t)},[val,ms])
  return dv
}

const TIPS=["Loyiha nomi","Mijoz ismi","Kundalik sarlavhasi","Vazifa nomi","Manzil","Kompaniya"]

export default function SearchPage() {
  const [q,      setQ]       =useState("")
  const [results,setResults] =useState<any>(null)
  const [loading,setLoading] =useState(false)
  const [focused,setFocused] =useState(false)
  const dq=useDebounce(q,350)

  useEffect(()=>{
    if (dq.length<2) { setResults(null); return }
    setLoading(true)
    fetch(`/api/search?q=${encodeURIComponent(dq)}`).then(r=>r.json()).then(d=>{setResults(d);setLoading(false)}).catch(()=>setLoading(false))
  },[dq])

  const total=results?results.projects.length+results.clients.length+results.diaries.length+results.tasks.length:0

  return (
    <div className="max-w-2xl mx-auto space-y-6 anim-page">
      <div>
        <h2 className="text-xl font-black tracking-tight mb-4"
          style={{fontFamily:"'Playfair Display',serif",color:C.ink}}>Global Qidiruv</h2>

        {/* Search input with glow */}
        <div className="relative">
          {focused&&(
            <div className="absolute -inset-1 rounded pointer-events-none"
              style={{background:"linear-gradient(90deg,var(--gold),rgba(200,168,112,.2),var(--gold))",
                opacity:.2,filter:"blur(4px)"}}/>
          )}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5"
              style={{color:focused?C.ink3:C.stone,width:18,height:18}}/>
            {loading&&<Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" style={{color:C.stone}}/>}
            <input
              placeholder="Qidirish..."
              value={q} onChange={e=>setQ(e.target.value)}
              onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
              autoFocus
              className="w-full h-12 pl-11 pr-11 text-sm"
              style={{background:C.white,border:`1.5px solid ${focused?"var(--stone2)":C.border}`,
                borderRadius:4,color:C.ink,outline:"none",fontSize:15,
                boxShadow:focused?"0 0 0 3px rgba(200,168,112,.1)":"none",
                transition:"all .25s"}}
            />
          </div>
          {q.length>0&&q.length<2&&<p className="text-xs mt-2 ml-1" style={{color:C.stone}}>Kamida 2 ta belgi kiriting</p>}
        </div>
      </div>

      {/* Empty state */}
      {!q&&(
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div style={{width:16,height:1,background:"var(--gold)",opacity:.5}}/>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{color:C.stone2,letterSpacing:".14em"}}>
              Qidiruv misollari
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {TIPS.map(tip=>(
              <button key={tip} onClick={()=>setQ(tip)}
                className="px-3 py-2 rounded-sm text-sm transition-all hover:border-stone-400"
                style={{background:C.white,border:`1px solid ${C.border}`,color:C.ink3}}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor=C.stone2;(e.currentTarget as HTMLElement).style.background=C.cream}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor=C.border;(e.currentTarget as HTMLElement).style.background=C.white}}>
                {tip}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {results&&q.length>=2&&(
        <div>
          <p className="text-xs mb-4" style={{color:C.stone2}}>
            "<strong style={{color:C.ink}}>{q}</strong>" — {total} ta natija
          </p>
          {total===0?(
            <div className="flex flex-col items-center py-16" style={{color:C.stone}}>
              <Search className="h-10 w-10 mb-3 opacity-20"/>
              <p className="font-semibold" style={{color:C.ink3}}>Natija topilmadi</p>
            </div>
          ):(
            <div className="space-y-5">
              {results.projects.length>0&&(
                <Section title="Loyihalar" count={results.projects.length}>
                  {results.projects.map((p:any)=>{
                    const s=PROJECT_STATUSES[p.status as keyof typeof PROJECT_STATUSES]
                    return (
                      <Link key={p.id} href={`/projects/${p.id}`}>
                        <div className="search-row flex items-center justify-between p-3.5 bg-white">
                          <div>
                            <p className="font-semibold text-sm" style={{color:C.ink}}>{p.name}</p>
                            <p className="text-xs" style={{color:C.stone2}}>{p.client?.name&&`${p.client.name} · `}{p.address}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                            <span className={cn("text-[10px] px-2 py-0.5 rounded-sm font-semibold",s?.color)}>{s?.label}</span>
                            <ArrowRight style={{width:12,height:12,color:C.stone}}/>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </Section>
              )}
              {results.clients.length>0&&(
                <Section title="Mijozlar" count={results.clients.length}>
                  {results.clients.map((c:any)=>(
                    <Link key={c.id} href={`/clients/${c.id}`}>
                      <div className="search-row flex items-center gap-3 p-3.5 bg-white">
                        <div className="h-9 w-9 rounded flex items-center justify-center text-xs font-black flex-shrink-0"
                          style={{background:C.ink,color:"var(--cream)",fontFamily:"'Playfair Display',serif"}}>
                          {c.name.slice(0,2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm" style={{color:C.ink}}>{c.name}</p>
                          <p className="text-xs" style={{color:C.stone2}}>{c.company&&`${c.company} · `}{c.phone}</p>
                        </div>
                        <ArrowRight style={{width:12,height:12,color:C.stone,flexShrink:0}}/>
                      </div>
                    </Link>
                  ))}
                </Section>
              )}
              {results.diaries.length>0&&(
                <Section title="Kundaliklar" count={results.diaries.length}>
                  {results.diaries.map((d:any)=>(
                    <Link key={d.id} href={`/diary/${d.id}`}>
                      <div className="search-row flex items-center justify-between p-3.5 bg-white">
                        <div>
                          <p className="font-semibold text-sm" style={{color:C.ink}}>{d.title}</p>
                          {d.description&&<p className="text-xs line-clamp-1" style={{color:C.stone2}}>{d.description}</p>}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          <span className="text-xs" style={{color:C.stone}}>{formatDate(d.date)}</span>
                          <ArrowRight style={{width:12,height:12,color:C.stone}}/>
                        </div>
                      </div>
                    </Link>
                  ))}
                </Section>
              )}
              {results.tasks.length>0&&(
                <Section title="Vazifalar" count={results.tasks.length}>
                  {results.tasks.map((t:any)=>{
                    const pr=TASK_PRIORITIES[t.priority as keyof typeof TASK_PRIORITIES]
                    return (
                      <Link key={t.id} href="/tasks">
                        <div className="search-row flex items-center justify-between p-3.5 bg-white">
                          <div>
                            <p className={cn("font-semibold text-sm",t.status==="DONE"&&"line-through opacity-40")}
                              style={{color:C.ink}}>{t.title}</p>
                            {t.project&&<p className="text-xs" style={{color:C.stone2}}>📐 {t.project.name}</p>}
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                            <span className={cn("text-[10px] px-2 py-0.5 rounded-sm font-semibold",pr?.color)}>{pr?.label}</span>
                            <ArrowRight style={{width:12,height:12,color:C.stone}}/>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </Section>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Section({ title,count,children }:{ title:string;count:number;children:React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <div style={{width:12,height:1,background:"var(--gold)",opacity:.6}}/>
        <span className="text-xs font-bold uppercase tracking-wider"
          style={{color:"var(--stone2)",letterSpacing:".14em"}}>{title}</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded-sm"
          style={{background:"var(--cream2)",color:"var(--stone2)",border:"1px solid rgba(200,168,112,.14)"}}>{count}</span>
      </div>
      <div className="card-premium overflow-hidden">{children}</div>
    </div>
  )
}
