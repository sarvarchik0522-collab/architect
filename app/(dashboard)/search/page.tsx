"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, FolderKanban, Users, BookOpen, CheckSquare, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn, formatDate, PROJECT_STATUSES, TASK_PRIORITIES, TASK_STATUSES } from "@/lib/utils"

function useDebounce<T>(val: T, ms: number): T {
  const [dv, setDv] = useState(val)
  useEffect(() => { const t = setTimeout(() => setDv(val), ms); return () => clearTimeout(t) }, [val, ms])
  return dv
}

export default function SearchPage() {
  const [q,       setQ]       = useState("")
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const dq = useDebounce(q, 350)

  useEffect(() => {
    if (dq.length < 2) { setResults(null); return }
    setLoading(true)
    fetch(`/api/search?q=${encodeURIComponent(dq)}`).then(r => r.json()).then(d => { setResults(d); setLoading(false) })
  }, [dq])

  const total = results ? results.projects.length + results.clients.length + results.diaries.length + results.tasks.length : 0

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-xl font-bold mb-4">Global Qidiruv</h2>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          {loading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />}
          <Input placeholder="Loyiha, mijoz, kundalik, vazifa..." value={q} onChange={e => setQ(e.target.value)}
            className="pl-12 pr-10 h-12 text-base" autoFocus />
        </div>
        {q.length > 0 && q.length < 2 && <p className="text-xs text-muted-foreground mt-2">Kamida 2 ta belgi kiriting</p>}
      </div>

      {results && q.length >= 2 && (
        <div>
          <p className="text-sm text-muted-foreground mb-4">"{q}" — {total} ta natija</p>
          {total === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="text-lg font-medium">Natija topilmadi</p>
              <p className="text-sm mt-1">Boshqa kalit so'z bilan qidiring</p>
            </div>
          ) : (
            <div className="space-y-6">
              {results.projects.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3"><FolderKanban className="h-4 w-4 text-blue-500" /><h3 className="font-semibold text-sm">Loyihalar</h3><Badge variant="secondary">{results.projects.length}</Badge></div>
                  <div className="space-y-2">
                    {results.projects.map((p: any) => {
                      const s = PROJECT_STATUSES[p.status as keyof typeof PROJECT_STATUSES]
                      return (
                        <Link key={p.id} href={`/projects/${p.id}`}>
                          <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                            <div><p className="font-medium text-sm">{p.name}</p><p className="text-xs text-muted-foreground">{p.client?.name && `${p.client.name} · `}{p.address}</p></div>
                            <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ml-2", s?.color)}>{s?.label}</span>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </section>
              )}
              {results.clients.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3"><Users className="h-4 w-4 text-emerald-500" /><h3 className="font-semibold text-sm">Mijozlar</h3><Badge variant="secondary">{results.clients.length}</Badge></div>
                  <div className="space-y-2">
                    {results.clients.map((c: any) => (
                      <Link key={c.id} href={`/clients/${c.id}`}>
                        <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                          <div className="h-9 w-9 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{c.name.slice(0,2).toUpperCase()}</div>
                          <div><p className="font-medium text-sm">{c.name}</p><p className="text-xs text-muted-foreground">{c.company && `${c.company} · `}{c.phone}</p></div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
              {results.diaries.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3"><BookOpen className="h-4 w-4 text-purple-500" /><h3 className="font-semibold text-sm">Kundaliklar</h3><Badge variant="secondary">{results.diaries.length}</Badge></div>
                  <div className="space-y-2">
                    {results.diaries.map((d: any) => (
                      <Link key={d.id} href={`/diary/${d.id}`}>
                        <div className="p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                          <div className="flex items-center justify-between"><p className="font-medium text-sm">{d.title}</p><p className="text-xs text-muted-foreground">{formatDate(d.date)}</p></div>
                          {d.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{d.description}</p>}
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
              {results.tasks.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3"><CheckSquare className="h-4 w-4 text-orange-500" /><h3 className="font-semibold text-sm">Vazifalar</h3><Badge variant="secondary">{results.tasks.length}</Badge></div>
                  <div className="space-y-2">
                    {results.tasks.map((t: any) => {
                      const pr = TASK_PRIORITIES[t.priority as keyof typeof TASK_PRIORITIES]
                      const st = TASK_STATUSES[t.status   as keyof typeof TASK_STATUSES]
                      return (
                        <Link key={t.id} href="/tasks">
                          <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                            <div><p className={cn("font-medium text-sm", t.status==="DONE"&&"line-through opacity-60")}>{t.title}</p>{t.project && <p className="text-xs text-muted-foreground">📐 {t.project.name}</p>}</div>
                            <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                              <span className={cn("text-xs px-2 py-0.5 rounded-full", pr?.color)}>{pr?.label}</span>
                              <span className={cn("text-xs px-2 py-0.5 rounded-full", st?.color)}>{st?.label}</span>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      )}

      {!q && (
        <div className="text-center py-20 text-muted-foreground">
          <Search className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">Nima qidirmoqchisiz?</p>
          <p className="text-sm mt-1">Loyiha, mijoz, kundalik yoki vazifa nomini yozing</p>
        </div>
      )}
    </div>
  )
}
