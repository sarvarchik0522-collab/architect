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
  DRAFT:    { label: "Qoralama",   color: "bg-[#1a1a1a] text-[#666] border border-[#333]", icon: FileText },
  ACTIVE:   { label: "Faol",       color: "bg-[#1a1a1a] text-[#aaa] border border-[#444]", icon: CheckCircle },
  PENDING:  { label: "Kutilmoqda", color: "bg-[#1a1a1a] text-[#888] border border-[#333]", icon: Clock },
  COMPLETED:{ label: "Tugallandi", color: "bg-[#1a1a1a] text-[#ccc] border border-[#444]", icon: CheckCircle },
  CANCELLED:{ label: "Bekor",      color: "bg-[#1a1a1a] text-[#444] border border-[#2a2a2a]", icon: Trash2 },
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
      <div className="relative overflow-hidden rounded-2xl bg-[#0d0d0d] border border-[#222] p-8 text-white">
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none hidden lg:block">
          <svg width="260" height="260" viewBox="0 0 200 200">
            <polygon points="100,10 190,55 190,145 100,190 10,145 10,55" fill="none" stroke="white" strokeWidth="1"/>
            <polygon points="100,30 170,65 170,135 100,170 30,135 30,65" fill="none" stroke="white" strokeWidth="0.6"/>
            <circle cx="100" cy="100" r="38" fill="none" stroke="white" strokeWidth="0.5"/>
          </svg>
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-11 w-11 rounded-2xl bg-[#1a1a1a] border border-[#333] flex items-center justify-center">
                <FileSignature className="h-6 w-6 text-[#aaa]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Shartnomalar</h2>
                <p className="text-[#555] text-sm">{contracts.length} ta shartnoma · {formatCurrency(stats.totalSum)} umumiy</p>
              </div>
            </div>
          </div>
          <Link href="/contracts/new">
            <Button className="btn-primary gap-2 rounded-xl font-bold">
              <Plus className="h-4 w-4" /> Yangi Shartnoma
            </Button>
          </Link>
        </div>
        {/* Stats */}
        <div className="relative z-10 flex flex-wrap gap-3 mt-5 pt-5 border-t border-[#222]">
          {[
            { label: "Jami", value: stats.total, emoji: "📜" },
            { label: "Faol", value: stats.active, emoji: "✅" },
            { label: "Qoralama", value: stats.draft, emoji: "📝" },
            { label: "Tugallandi", value: stats.completed, emoji: "🏁" },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2 bg-[#1a1a1a] rounded-xl px-4 py-2.5 border border-[#333]">
              <span className="text-xl">{s.emoji}</span>
              <div>
                <p className="text-xl font-bold leading-none text-white">{s.value}</p>
                <p className="text-xs text-[#444]">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#555]" />
        <Input placeholder="Mijoz, loyiha, shartnoma raqami..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 h-11 rounded-xl border-[#222] bg-[#111] text-white" />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="skeleton h-44 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-[#444]">
          <div className="text-6xl mb-4">📜</div>
          <p className="text-lg font-semibold text-[#555]">Shartnoma topilmadi</p>
          <Link href="/contracts/new">
            <Button className="mt-5 btn-primary rounded-xl gap-2">
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
              <div key={c.id} className="arch-card arch-card-lift group animate-card" style={{ animationDelay:`${i*0.07}s`}}>
                <div className="h-1 bg-[#333]" />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#444] mb-1">#{c.contractNumber}</p>
                      <h3 className="font-bold text-white leading-tight line-clamp-2 group-hover:text-[#ccc] transition-colors">
                        {c.title}
                      </h3>
                    </div>
                    <span className={cn("text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1 flex-shrink-0", sm.color)}>
                      <StatusIcon className="h-3 w-3" /> {sm.label}
                    </span>
                  </div>
                  <div className="space-y-1.5 mb-4">
                    <p className="text-sm text-[#555] flex items-center gap-2">
                      <span className="text-base">👤</span> {c.clientName}
                    </p>
                    <p className="text-sm text-[#555] flex items-center gap-2">
                      <span className="text-base">📐</span> {c.projectName}
                    </p>
                    <p className="text-sm font-bold text-white flex items-center gap-2">
                      <span className="text-base">💰</span> {formatCurrency(c.totalAmount)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-[#222]">
                    <p className="text-xs text-[#444]">{formatDate(c.createdAt)}</p>
                    <div className="flex gap-1.5">
                      <Link href={`/contracts/${c.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 rounded-lg gap-1 text-[#888] hover:text-white hover:bg-[#1a1a1a] text-xs">
                          <Eye className="h-3.5 w-3.5" /> Ko'rish
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm" onClick={() => del(c.id)}
                        className="h-8 rounded-lg text-[#444] hover:bg-[#1a1a1a] hover:text-[#aaa]">
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
