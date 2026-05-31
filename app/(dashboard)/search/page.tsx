"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, FolderKanban, Users, BookOpen, CheckSquare, Loader2, Sparkles, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn, formatDate, PROJECT_STATUSES, TASK_PRIORITIES, TASK_STATUSES } from "@/lib/utils"

function useDebounce<T>(val: T, ms: number): T {
  const [dv, setDv] = useState(val)
  useEffect(() => { const t = setTimeout(() => setDv(val), ms); return () => clearTimeout(t) }, [val, ms])
  return dv
}

const SECTION_META = {
  projects: { label:"Loyihalar",  icon: FolderKanban, color:"text-blue-600 dark:text-blue-400",   bg:"bg-blue-50 dark:bg-blue-950/30",   border:"border-blue-100 dark:border-blue-900/40" },
  clients:  { label:"Mijozlar",   icon: Users,        color:"text-violet-600 dark:text-violet-400", bg:"bg-violet-50 dark:bg-violet-950/30", border:"border-violet-100 dark:border-violet-900/40" },
  diaries:  { label:"Kundaliklar",icon: BookOpen,     color:"text-emerald-600 dark:text-emerald-400",bg:"bg-emerald-50 dark:bg-emerald-950/30",border:"border-emerald-100 dark:border-emerald-900/40" },
  tasks:    { label:"Vazifalar",  icon: CheckSquare,  color:"text-orange-600 dark:text-orange-400", bg:"bg-orange-50 dark:bg-orange-950/30",  border:"border-orange-100 dark:border-orange-900/40" },
}

const QUICK_TIPS = ["Loyiha nomi", "Mijoz ismi", "Kundalik sarlavhasi", "Vazifa nomi", "Manzil", "Kompaniya"]

export default function SearchPage() {
  const [q,       setQ]       = useState("")
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)
  const dq = useDebounce(q, 350)

  useEffect(() => {
    if (dq.length < 2) { setResults(null); return }
    setLoading(true)
    fetch(`/api/search?q=${encodeURIComponent(dq)}`).then(r => r.json()).then(d => {
      setResults(d); setLoading(false)
    }).catch(() => setLoading(false))
  }, [dq])

  const total = results
    ? results.projects.length + results.clients.length + results.diaries.length + results.tasks.length
    : 0

  return (
    <div className="max-w-3xl mx-auto space-y-8 page-enter arch-pattern">

      {/* ── Header ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-8 text-white blueprint-grid">
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <svg width="400" height="200" viewBox="0 0 400 200" className="animate-float-slow">
            <circle cx="200" cy="100" r="80" fill="none" stroke="white" strokeWidth="1" strokeDasharray="4 2"/>
            <circle cx="200" cy="100" r="50" fill="none" stroke="white" strokeWidth="0.5"/>
            <line x1="160" y1="60" x2="240" y2="140" stroke="white" strokeWidth="1"/>
            <line x1="240" y1="60" x2="160" y2="140" stroke="white" strokeWidth="1"/>
          </svg>
        </div>
        <div className="relative z-10 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-14 w-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
              <Search className="h-7 w-7 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Global Qidiruv</h2>
          <p className="text-slate-400 text-sm">Loyiha, mijoz, kundalik va vazifalarni qidiring</p>
        </div>
      </div>

      {/* ── Search input ── */}
      <div className="relative">
        {/* Glow ring when focused */}
        {focused && (
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-violet-500 to-blue-500 rounded-2xl opacity-20 blur-sm animate-pulse" />
        )}
        <div className="relative">
          <Search className={cn("absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors", focused ? "text-blue-500" : "text-slate-400")} />
          {loading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 animate-spin" />}
          <Input
            placeholder="Qidirish..."
            value={q}
            onChange={e => setQ(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="pl-12 pr-12 h-14 text-base rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg focus:ring-2 focus:ring-blue-500/20"
            autoFocus
          />
        </div>
        {q.length > 0 && q.length < 2 && (
          <p className="text-xs text-slate-400 mt-2 ml-2">Kamida 2 ta belgi kiriting</p>
        )}
      </div>

      {/* ── Empty state — quick tips ── */}
      {!q && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Qidiruv misollari</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_TIPS.map(tip => (
              <button key={tip} onClick={() => setQ(tip)}
                className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all">
                {tip}
              </button>
            ))}
          </div>

          {/* Category cards */}
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(SECTION_META).map(([key, meta]) => (
              <div key={key} className={cn("p-4 rounded-2xl border bg-white dark:bg-slate-900 flex items-center gap-3", meta.border)}>
                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", meta.bg)}>
                  <meta.icon className={cn("h-5 w-5", meta.color)} />
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-700 dark:text-slate-200">{meta.label}</p>
                  <p className="text-xs text-slate-400">Qidirishingiz mumkin</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {results && q.length >= 2 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-500">
              <span className="font-bold text-slate-800 dark:text-white">"{q}"</span> — {total} ta natija
            </p>
            {total > 0 && (
              <div className="flex gap-1.5">
                {Object.entries(SECTION_META).map(([key, meta]) => {
                  const count = results[key]?.length ?? 0
                  if (!count) return null
                  return (
                    <span key={key} className={cn("text-xs px-2 py-0.5 rounded-full font-medium", meta.bg, meta.color)}>
                      {meta.label} {count}
                    </span>
                  )
                })}
              </div>
            )}
          </div>

          {total === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <div className="h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 animate-float">
                <Search className="h-8 w-8 opacity-40" />
              </div>
              <p className="font-semibold text-slate-500">Natija topilmadi</p>
              <p className="text-sm mt-1">Boshqa kalit so'z bilan urinib ko'ring</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Projects */}
              {results.projects.length > 0 && (
                <div className="animate-slide-up">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-7 w-7 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                      <FolderKanban className="h-4 w-4 text-blue-500" />
                    </div>
                    <span className="font-bold text-sm text-slate-700 dark:text-slate-200">Loyihalar</span>
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-semibold">{results.projects.length}</span>
                  </div>
                  <div className="space-y-2">
                    {results.projects.map((p: any) => {
                      const s = PROJECT_STATUSES[p.status as keyof typeof PROJECT_STATUSES]
                      return (
                        <Link key={p.id} href={`/projects/${p.id}`}>
                          <div className="search-result-row flex items-center justify-between p-3.5 bg-white dark:bg-slate-900">
                            <div>
                              <p className="font-semibold text-sm text-slate-700 dark:text-slate-200">{p.name}</p>
                              <p className="text-xs text-slate-400">{p.client?.name && `${p.client.name} · `}{p.address}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", s?.color)}>{s?.label}</span>
                              <ArrowRight className="h-4 w-4 text-slate-300" />
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Clients */}
              {results.clients.length > 0 && (
                <div className="animate-slide-up delay-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-7 w-7 rounded-lg bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center">
                      <Users className="h-4 w-4 text-violet-500" />
                    </div>
                    <span className="font-bold text-sm text-slate-700 dark:text-slate-200">Mijozlar</span>
                    <span className="text-xs bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 px-2 py-0.5 rounded-full font-semibold">{results.clients.length}</span>
                  </div>
                  <div className="space-y-2">
                    {results.clients.map((c: any) => (
                      <Link key={c.id} href={`/clients/${c.id}`}>
                        <div className="search-result-row flex items-center gap-3 p-3.5 bg-white dark:bg-slate-900">
                          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {c.name.slice(0,2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-slate-700 dark:text-slate-200">{c.name}</p>
                            <p className="text-xs text-slate-400">{c.company && `${c.company} · `}{c.phone}</p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-slate-300 flex-shrink-0" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Diary */}
              {results.diaries.length > 0 && (
                <div className="animate-slide-up delay-2">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-7 w-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-emerald-500" />
                    </div>
                    <span className="font-bold text-sm text-slate-700 dark:text-slate-200">Kundaliklar</span>
                    <span className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-semibold">{results.diaries.length}</span>
                  </div>
                  <div className="space-y-2">
                    {results.diaries.map((d: any) => (
                      <Link key={d.id} href={`/diary/${d.id}`}>
                        <div className="search-result-row flex items-center justify-between p-3.5 bg-white dark:bg-slate-900">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-emerald-500 flex flex-col items-center justify-center text-white flex-shrink-0">
                              <span className="text-sm font-bold leading-none">{new Date(d.date).getDate()}</span>
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-slate-700 dark:text-slate-200">{d.title}</p>
                              {d.description && <p className="text-xs text-slate-400 line-clamp-1">{d.description}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">{formatDate(d.date)}</span>
                            <ArrowRight className="h-4 w-4 text-slate-300" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks */}
              {results.tasks.length > 0 && (
                <div className="animate-slide-up delay-3">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-7 w-7 rounded-lg bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center">
                      <CheckSquare className="h-4 w-4 text-orange-500" />
                    </div>
                    <span className="font-bold text-sm text-slate-700 dark:text-slate-200">Vazifalar</span>
                    <span className="text-xs bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full font-semibold">{results.tasks.length}</span>
                  </div>
                  <div className="space-y-2">
                    {results.tasks.map((t: any) => {
                      const pr = TASK_PRIORITIES[t.priority as keyof typeof TASK_PRIORITIES]
                      const st = TASK_STATUSES[t.status as keyof typeof TASK_STATUSES]
                      return (
                        <Link key={t.id} href="/tasks">
                          <div className="search-result-row flex items-center justify-between p-3.5 bg-white dark:bg-slate-900">
                            <div>
                              <p className={cn("font-semibold text-sm", t.status==="DONE" && "line-through opacity-50")} >{t.title}</p>
                              {t.project && <p className="text-xs text-slate-400">📐 {t.project.name}</p>}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", pr?.color)}>{pr?.label}</span>
                              <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", st?.color)}>{st?.label}</span>
                              <ArrowRight className="h-4 w-4 text-slate-300 ml-1" />
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
