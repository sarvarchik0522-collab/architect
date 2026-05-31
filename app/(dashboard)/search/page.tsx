"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, FolderKanban, Users, BookOpen, CheckSquare, Loader2, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn, formatDate, PROJECT_STATUSES, TASK_PRIORITIES, TASK_STATUSES } from "@/lib/utils"

function useDebounce<T>(val: T, ms: number): T {
  const [dv, setDv] = useState(val)
  useEffect(() => { const t = setTimeout(() => setDv(val), ms); return () => clearTimeout(t) }, [val, ms])
  return dv
}

const SECTION_META = {
  projects: { label:"Loyihalar",   icon: FolderKanban },
  clients:  { label:"Mijozlar",    icon: Users },
  diaries:  { label:"Kundaliklar", icon: BookOpen },
  tasks:    { label:"Vazifalar",   icon: CheckSquare },
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
    <div className="max-w-3xl mx-auto space-y-8 page-enter">

      {/* ── Header ── */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0d0d0d] border border-[#222] p-8 text-white">
        <div className="relative z-10 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-14 w-14 rounded-2xl bg-[#1a1a1a] border border-[#333] flex items-center justify-center">
              <Search className="h-7 w-7 text-[#aaa]" />
            </div>
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-2 text-white">Global Qidiruv</h2>
          <p className="text-[#555] text-sm">Loyiha, mijoz, kundalik va vazifalarni qidiring</p>
        </div>
      </div>

      {/* ── Search input ── */}
      <div className="relative">
        <Search className={cn("absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors", focused ? "text-white" : "text-[#444]")} />
        {loading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#555] animate-spin" />}
        <Input
          placeholder="Qidirish..."
          value={q}
          onChange={e => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="pl-12 pr-12 h-14 text-base rounded-2xl border-[#333] bg-[#111] text-white shadow-lg"
          autoFocus
        />
        {q.length > 0 && q.length < 2 && (
          <p className="text-xs text-[#444] mt-2 ml-2">Kamida 2 ta belgi kiriting</p>
        )}
      </div>

      {/* ── Empty state — quick tips ── */}
      {!q && (
        <div className="space-y-6">
          <p className="text-sm font-semibold text-[#555]">Qidiruv misollari</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_TIPS.map(tip => (
              <button key={tip} onClick={() => setQ(tip)}
                className="px-4 py-2 rounded-xl bg-[#111] border border-[#222] text-sm text-[#555] hover:border-[#444] hover:text-[#aaa] hover:bg-[#1a1a1a] transition-all">
                {tip}
              </button>
            ))}
          </div>

          {/* Category cards */}
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(SECTION_META).map(([key, meta]) => (
              <div key={key} className="p-4 rounded-2xl border border-[#222] bg-[#111] flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#1a1a1a] border border-[#333] flex items-center justify-center">
                  <meta.icon className="h-5 w-5 text-[#666]" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-white">{meta.label}</p>
                  <p className="text-xs text-[#444]">Qidirishingiz mumkin</p>
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
            <p className="text-sm text-[#555]">
              <span className="font-bold text-white">"{q}"</span> — {total} ta natija
            </p>
            {total > 0 && (
              <div className="flex gap-1.5">
                {Object.entries(SECTION_META).map(([key, meta]) => {
                  const count = results[key]?.length ?? 0
                  if (!count) return null
                  return (
                    <span key={key} className="text-xs px-2 py-0.5 rounded-full font-medium bg-[#1a1a1a] border border-[#333] text-[#666]">
                      {meta.label} {count}
                    </span>
                  )
                })}
              </div>
            )}
          </div>

          {total === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#444]">
              <div className="h-16 w-16 rounded-2xl bg-[#111] border border-[#222] flex items-center justify-center mb-4">
                <Search className="h-8 w-8 opacity-40" />
              </div>
              <p className="font-semibold text-[#555]">Natija topilmadi</p>
              <p className="text-sm mt-1">Boshqa kalit so'z bilan urinib ko'ring</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Projects */}
              {results.projects.length > 0 && (
                <div className="animate-slide-up">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-7 w-7 rounded-lg bg-[#1a1a1a] border border-[#333] flex items-center justify-center">
                      <FolderKanban className="h-4 w-4 text-[#666]" />
                    </div>
                    <span className="font-bold text-sm text-white">Loyihalar</span>
                    <span className="text-xs bg-[#1a1a1a] border border-[#333] text-[#555] px-2 py-0.5 rounded-full font-semibold">{results.projects.length}</span>
                  </div>
                  <div className="space-y-2">
                    {results.projects.map((p: any) => {
                      const s = PROJECT_STATUSES[p.status as keyof typeof PROJECT_STATUSES]
                      return (
                        <Link key={p.id} href={`/projects/${p.id}`}>
                          <div className="search-row flex items-center justify-between p-3.5">
                            <div>
                              <p className="font-semibold text-sm text-white">{p.name}</p>
                              <p className="text-xs text-[#444]">{p.client?.name && `${p.client.name} · `}{p.address}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-[#1a1a1a] border border-[#333] text-[#666]">{s?.label}</span>
                              <ArrowRight className="h-4 w-4 text-[#333]" />
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
                <div className="animate-slide-up">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-7 w-7 rounded-lg bg-[#1a1a1a] border border-[#333] flex items-center justify-center">
                      <Users className="h-4 w-4 text-[#666]" />
                    </div>
                    <span className="font-bold text-sm text-white">Mijozlar</span>
                    <span className="text-xs bg-[#1a1a1a] border border-[#333] text-[#555] px-2 py-0.5 rounded-full font-semibold">{results.clients.length}</span>
                  </div>
                  <div className="space-y-2">
                    {results.clients.map((c: any) => (
                      <Link key={c.id} href={`/clients/${c.id}`}>
                        <div className="search-row flex items-center gap-3 p-3.5">
                          <div className="h-9 w-9 rounded-xl bg-[#222] border border-[#333] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {c.name.slice(0,2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-white">{c.name}</p>
                            <p className="text-xs text-[#444]">{c.company && `${c.company} · `}{c.phone}</p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-[#333] flex-shrink-0" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Diary */}
              {results.diaries.length > 0 && (
                <div className="animate-slide-up">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-7 w-7 rounded-lg bg-[#1a1a1a] border border-[#333] flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-[#666]" />
                    </div>
                    <span className="font-bold text-sm text-white">Kundaliklar</span>
                    <span className="text-xs bg-[#1a1a1a] border border-[#333] text-[#555] px-2 py-0.5 rounded-full font-semibold">{results.diaries.length}</span>
                  </div>
                  <div className="space-y-2">
                    {results.diaries.map((d: any) => (
                      <Link key={d.id} href={`/diary/${d.id}`}>
                        <div className="search-row flex items-center justify-between p-3.5">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-[#222] border border-[#333] flex flex-col items-center justify-center text-white flex-shrink-0">
                              <span className="text-sm font-bold leading-none">{new Date(d.date).getDate()}</span>
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-white">{d.title}</p>
                              {d.description && <p className="text-xs text-[#444] line-clamp-1">{d.description}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[#444]">{formatDate(d.date)}</span>
                            <ArrowRight className="h-4 w-4 text-[#333]" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks */}
              {results.tasks.length > 0 && (
                <div className="animate-slide-up">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-7 w-7 rounded-lg bg-[#1a1a1a] border border-[#333] flex items-center justify-center">
                      <CheckSquare className="h-4 w-4 text-[#666]" />
                    </div>
                    <span className="font-bold text-sm text-white">Vazifalar</span>
                    <span className="text-xs bg-[#1a1a1a] border border-[#333] text-[#555] px-2 py-0.5 rounded-full font-semibold">{results.tasks.length}</span>
                  </div>
                  <div className="space-y-2">
                    {results.tasks.map((t: any) => {
                      const pr = TASK_PRIORITIES[t.priority as keyof typeof TASK_PRIORITIES]
                      const st = TASK_STATUSES[t.status as keyof typeof TASK_STATUSES]
                      return (
                        <Link key={t.id} href="/tasks">
                          <div className="search-row flex items-center justify-between p-3.5">
                            <div>
                              <p className={cn("font-semibold text-sm text-white", t.status==="DONE" && "line-through opacity-50")}>{t.title}</p>
                              {t.project && <p className="text-xs text-[#444]">📐 {t.project.name}</p>}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-[#1a1a1a] border border-[#333] text-[#666]">{pr?.label}</span>
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-[#1a1a1a] border border-[#333] text-[#666]">{st?.label}</span>
                              <ArrowRight className="h-4 w-4 text-[#333] ml-1" />
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
