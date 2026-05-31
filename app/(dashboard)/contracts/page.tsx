"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, FileSignature, Eye, Trash2, Search, CheckCircle, Clock, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { cn, formatDate, formatCurrency } from "@/lib/utils"

interface Contract {
  id: string; contractNumber: string; title: string
  clientName: string; projectName: string; totalAmount: number
  status: string; createdAt: string
  project?: { id: string; name: string } | null
  client?: { id: string; name: string } | null
}


const STATUS_META: Record<string, { label: string; color: string; icon: any }> = {
  DRAFT:    { label: "Qoralama",   color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",     icon: FileText },
  ACTIVE:   { label: "Faol",       color: "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400",   icon: CheckCircle },
  PENDING:  { label: "Kutilmoqda", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400", icon: Clock },
  COMPLETED:{ label: "Tugallandi", color: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",       icon: CheckCircle },
  CANCELLED:{ label: "Bekor",      color: "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400",           icon: Trash2 },
}

function GirihBg() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <svg className="absolute right-0 top-0 opacity-[0.07] animate-float-slow" width="260" height="260" viewBox="0 0 200 200">
        <polygon points="100,10 190,55 190,145 100,190 10,145 10,55" fill="none" stroke="currentColor" strokeWidth="1"/>
        <polygon points="100,30 170,65 170,135 100,170 30,135 30,65" fill="none" stroke="currentColor" strokeWidth="0.6"/>
        <circle cx="100" cy="100" r="38" fill="none" stroke="currentColor" strokeWidth="0.5"/>
        <line x1="100" y1="10" x2="100" y2="190" stroke="currentColor" strokeWidth="0.3"/>
        <line x1="10" y1="100" x2="190" y2="100" stroke="currentColor" strokeWidth="0.3"/>
      </svg>
    </div>
  )
}


export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState("")
  const { toast } = useToast()

  const load = async () => {
    setLoading(true)
    setContracts(await fetch("/api/contracts").then(r => r.json()))
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const del = async (id: string) => {
    if (!confirm("Shartnomani o'chirishni tasdiqlaysizmi?")) return
    await fetch(`/api/contracts/${id}`, { method: "DELETE" })
    toast({ title: "O'chirildi" }); load()
  }

  const filtered = contracts.filter(c =>
    c.clientName.toLowerCase().includes(search.toLowerCase()) ||
    c.projectName.toLowerCase().includes(search.toLowerCase()) ||
    c.contractNumber.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    total:     contracts.length,
    active:    contracts.filter(c => c.status === "ACTIVE").length,
    draft:     contracts.filter(c => c.status === "DRAFT").length,
    completed: contracts.filter(c => c.status === "COMPLETED").length,
    totalSum:  contracts.reduce((s, c) => s + c.totalAmount, 0),
  }

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a3a6b] via-[#0e2a5a] to-[#5a3a00] p-8 text-white">
        <GirihBg />
        <div className="relative z-10 flex flex-col sm:flex-row items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-11 w-11 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center">
                <FileSignature className="h-6 w-6 text-blue-200" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Shartnomalar</h2>
                <p className="text-blue-200/70 text-sm">{contracts.length} ta shartnoma · {formatCurrency(stats.totalSum)} umumiy</p>
              </div>
            </div>
          </div>
          <Link href="/contracts/new">
            <Button className="bg-white text-[#1a3a6b] hover:bg-blue-50 gap-2 rounded-xl font-bold shadow-lg">
              <Plus className="h-4 w-4" /> Yangi Shartnoma
            </Button>
          </Link>
        </div>
        {/* Stats */}
        <div className="relative z-10 flex flex-wrap gap-3 mt-5 pt-5 border-t border-white/10">
          {[
            { label: "Jami", value: stats.total, emoji: "📜" },
            { label: "Faol", value: stats.active, emoji: "✅" },
            { label: "Qoralama", value: stats.draft, emoji: "📝" },
            { label: "Tugallandi", value: stats.completed, emoji: "🏁" },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2.5 border border-white/15">
              <span className="text-xl">{s.emoji}</span>
              <div>
                <p className="text-xl font-bold leading-none">{s.value}</p>
                <p className="text-xs text-blue-200/70">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>


      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400/50" />
        <Input placeholder="Mijoz, loyiha, shartnoma raqami..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 h-11 rounded-xl border-[#e8d8b0] dark:border-[#2a1e08] bg-white dark:bg-[#120e04]" />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="skeleton h-44 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-amber-400/40">
          <div className="text-6xl mb-4 animate-float">📜</div>
          <p className="text-lg font-semibold text-amber-700/50 dark:text-amber-400/40">Shartnoma topilmadi</p>
          <Link href="/contracts/new">
            <Button className="mt-5 btn-blue text-white rounded-xl gap-2">
              <Plus className="h-4 w-4" /> Yaratish
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((c, i) => {
            const sm = STATUS_META[c.status] ?? STATUS_META.DRAFT
            const StatusIcon = sm.icon
            return (
              <div key={c.id} className="contract-card group animate-card" style={{ animationDelay:`${i*0.07}s`}}>
                <div className="h-1 bg-gradient-to-r from-[#1a3a6b] to-[#8a5a00]" />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-amber-600/60 mb-1">#{c.contractNumber}</p>
                      <h3 className="font-bold text-[#3d2800] dark:text-amber-100 leading-tight line-clamp-2 group-hover:text-[#1a3a6b] transition-colors">
                        {c.title}
                      </h3>
                    </div>
                    <span className={cn("text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1 flex-shrink-0", sm.color)}>
                      <StatusIcon className="h-3 w-3" /> {sm.label}
                    </span>
                  </div>
                  <div className="space-y-1.5 mb-4">
                    <p className="text-sm text-amber-700/70 dark:text-amber-300/70 flex items-center gap-2">
                      <span className="text-base">👤</span> {c.clientName}
                    </p>
                    <p className="text-sm text-amber-700/70 dark:text-amber-300/70 flex items-center gap-2">
                      <span className="text-base">📐</span> {c.projectName}
                    </p>
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                      <span className="text-base">💰</span> {formatCurrency(c.totalAmount)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-[#e8d8b0]/60 dark:border-[#2a1e08]/60">
                    <p className="text-xs text-amber-500/50">{formatDate(c.createdAt)}</p>
                    <div className="flex gap-1.5">
                      <Link href={`/contracts/${c.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 rounded-lg gap-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-xs">
                          <Eye className="h-3.5 w-3.5" /> Ko'rish
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm" onClick={() => del(c.id)}
                        className="h-8 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
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
