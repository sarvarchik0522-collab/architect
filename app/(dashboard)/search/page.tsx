"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Loader2 } from "lucide-react"
import { cn, formatDate, PROJECT_STATUSES, TASK_PRIORITIES } from "@/lib/utils"

function useDebounce<T>(val:T, ms:number):T {
  const [dv, setDv] = useState(val)
  useEffect(()=>{ const t=setTimeout(()=>setDv(val),ms); return()=>clearTimeout(t) },[val,ms])
  return dv
}

export default function SearchPage() {
  const [q,       setQ]       = useState("")
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const dq = useDebounce(q, 350)

  useEffect(()=>{
    if (dq.length<2) { setResults(null); return }
    setLoading(true)
    fetch(`/api/search?q=${encodeURIComponent(dq)}`).then(r=>r.json()).then(d=>{
      setResults(d); setLoading(false)
    }).catch(()=>setLoading(false))
  },[dq])

  const total = results ? results.projects.length+results.clients.length+results.diaries.length+results.tasks.length : 0

  return (
    <div className="max-w-2xl mx-auto space-y-6" style={{color:"#f0f0f0"}}>
      <div>
        <h2 className="text-xl font-black tracking-tight mb-4">Global Qidiruv</h2>
        <div className="relative">
          <Search className={cn("absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors",
            q.length>=2?"opacity-60":"opacity-30")} style={{color:"#fff"}}/>
          {loading&&<Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" style={{color:"#555"}}/>}
          <input
            placeholder="Loyiha, mijoz, kundalik, vazifa..."
            value={q} onChange={e=>setQ(e.target.value)}
            autoFocus
            className="w-full h-12 pl-11 pr-11 text-sm rounded"
            style={{background:"#0f0f0f",border:"1px solid #1e1e1e",color:"#f0f0f0",outline:"none",fontSize:15}}
            onFocus={e=>{e.target.style.borderColor="#444"}}
            onBlur={e=>{e.target.style.borderColor="#1e1e1e"}}/>
        </div>
        {q.length>0&&q.length<2&&<p className="text-xs mt-2" style={{color:"#444"}}>Kamida 2 ta belgi kiriting</p>}
      </div>

      {!q&&(
        <div className="flex flex-col items-center py-16" style={{color:"#333"}}>
          <Search className="h-12 w-12 mb-3 opacity-20"/>
          <p className="text-sm font-medium" style={{color:"#555"}}>Nima qidirmoqchisiz?</p>
        </div>
      )}

      {results&&q.length>=2&&(
        <div>
          <p className="text-xs mb-4" style={{color:"#444"}}>
            "{q}" — {total} ta natija
          </p>

          {total===0&&(
            <div className="flex flex-col items-center py-12" style={{color:"#333"}}>
              <p className="font-medium" style={{color:"#555"}}>Natija topilmadi</p>
            </div>
          )}

          <div className="space-y-5">
            {results.projects.length>0&&(
              <Section title="Loyihalar" count={results.projects.length}>
                {results.projects.map((p:any)=>{
                  const s = PROJECT_STATUSES[p.status as keyof typeof PROJECT_STATUSES]
                  return (
                    <Link key={p.id} href={`/projects/${p.id}`}>
                      <div className="search-row flex items-center justify-between p-3">
                        <div>
                          <p className="text-sm font-semibold" style={{color:"#f0f0f0"}}>{p.name}</p>
                          <p className="text-xs" style={{color:"#555"}}>{p.client?.name&&`${p.client.name} · `}{p.address}</p>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded" style={{background:"#1a1a1a",color:"#666",border:"1px solid #222"}}>
                          {s?.label}
                        </span>
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
                    <div className="search-row flex items-center gap-3 p-3">
                      <div className="h-8 w-8 rounded flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{background:"#1a1a1a",border:"1px solid #222",color:"#888"}}>
                        {c.name.slice(0,2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{color:"#f0f0f0"}}>{c.name}</p>
                        <p className="text-xs" style={{color:"#555"}}>{c.company&&`${c.company} · `}{c.phone}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </Section>
            )}

            {results.diaries.length>0&&(
              <Section title="Kundaliklar" count={results.diaries.length}>
                {results.diaries.map((d:any)=>(
                  <Link key={d.id} href={`/diary/${d.id}`}>
                    <div className="search-row flex items-center justify-between p-3">
                      <div>
                        <p className="text-sm font-semibold" style={{color:"#f0f0f0"}}>{d.title}</p>
                        {d.description&&<p className="text-xs line-clamp-1" style={{color:"#555"}}>{d.description}</p>}
                      </div>
                      <p className="text-xs flex-shrink-0 ml-2" style={{color:"#444"}}>{formatDate(d.date)}</p>
                    </div>
                  </Link>
                ))}
              </Section>
            )}

            {results.tasks.length>0&&(
              <Section title="Vazifalar" count={results.tasks.length}>
                {results.tasks.map((t:any)=>{
                  const pr = TASK_PRIORITIES[t.priority as keyof typeof TASK_PRIORITIES]
                  return (
                    <Link key={t.id} href="/tasks">
                      <div className="search-row flex items-center justify-between p-3">
                        <div>
                          <p className={cn("text-sm font-semibold",t.status==="DONE"&&"line-through opacity-40")} style={{color:"#f0f0f0"}}>{t.title}</p>
                          {t.project&&<p className="text-xs" style={{color:"#555"}}>{t.project.name}</p>}
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded" style={{background:"#1a1a1a",color:"#666",border:"1px solid #222"}}>
                          {pr?.label}
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </Section>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function Section({ title,count,children }:{ title:string;count:number;children:React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-bold uppercase tracking-wider" style={{color:"#555"}}>{title}</span>
        <span className="text-xs px-1.5 py-0.5 rounded" style={{background:"#1a1a1a",color:"#444"}}>{count}</span>
      </div>
      <div className="arch-card overflow-hidden">{children}</div>
    </div>
  )
}
