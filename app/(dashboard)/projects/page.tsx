"use client"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  Plus, Search, Filter, FolderKanban, Calendar, User,
  MoreVertical, Edit, Trash2, Building2, ChevronRight,
  Layers, Clock, DollarSign, FileText
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { cn, formatDate, formatCurrency, PROJECT_STATUSES } from "@/lib/utils"

interface Project {
  id: string; name: string; address: string | null; phone: string | null
  startDate: string | null; deadline: string | null; status: string
  description: string | null; budget: number | null
  client: { id: string; name: string } | null
  _count: { files: number; notes: number; tasks: number }
}
interface Client { id: string; name: string }

const EMPTY = { name:"", clientId:"none", phone:"", email:"", address:"", startDate:"", deadline:"", status:"NEW", description:"", budget:"" }

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [clients,  setClients]  = useState<Client[]>([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState("")
  const [filter,   setFilter]   = useState("ALL")
  const [open,     setOpen]     = useState(false)
  const [editing,  setEditing]  = useState<Project | null>(null)
  const [form,     setForm]     = useState(EMPTY)
  const [saving,   setSaving]   = useState(false)
  const { toast } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    const url = filter !== "ALL" ? `/api/projects?status=${filter}` : "/api/projects"
    setProjects(await fetch(url).then(r => r.json()))
    setLoading(false)
  }, [filter])

  useEffect(() => { load() }, [load])
  useEffect(() => { fetch("/api/clients").then(r => r.json()).then(setClients) }, [])

  const openCreate = () => { setEditing(null); setForm(EMPTY); setOpen(true) }
  const openEdit = (p: Project) => {
    setEditing(p)
    setForm({
      name: p.name, clientId: p.client?.id ?? "none", phone: p.phone ?? "",
      email: "", address: p.address ?? "",
      startDate: p.startDate ? p.startDate.split("T")[0] : "",
      deadline: p.deadline ? p.deadline.split("T")[0] : "",
      status: p.status, description: p.description ?? "",
      budget: p.budget ? String(p.budget) : ""
    })
    setOpen(true)
  }

  const save = async () => {
    if (!form.name.trim()) return toast({ variant:"destructive", title:"Loyiha nomi kiritilishi shart" })
    setSaving(true)
    try {
      const res = await fetch(editing ? `/api/projects/${editing.id}` : "/api/projects", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({
          ...form,
          clientId: form.clientId === "none" ? null : form.clientId || null,
          budget: form.budget ? Number(form.budget) : null,
          startDate: form.startDate || null,
          deadline: form.deadline || null,
        }),
      })
      if (!res.ok) throw new Error()
      toast({ title: editing ? "Yangilandi ✓" : "Yaratildi ✓" })
      setOpen(false); load()
    } catch { toast({ variant:"destructive", title:"Xatolik yuz berdi" }) }
    finally { setSaving(false) }
  }

  const del = async (id: string) => {
    if (!confirm("Loyihani o'chirishni tasdiqlaysizmi?")) return
    await fetch(`/api/projects/${id}`, { method:"DELETE" })
    toast({ title:"O'chirildi" }); load()
  }

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.client?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.address?.toLowerCase().includes(search.toLowerCase())
  )

  const totalBudget = filtered.reduce((s, p) => s + (p.budget ?? 0), 0)

  return (
    <div className="space-y-8 page-enter">

      {/* ── Header banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0d0d0d] border border-[#222] p-8 text-white">
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none hidden lg:block">
          <svg width="200" height="200" viewBox="0 0 200 200">
            <rect x="20" y="20" width="160" height="160" fill="none" stroke="white" strokeWidth="1" strokeDasharray="4 2"/>
            <rect x="50" y="50" width="100" height="100" fill="none" stroke="white" strokeWidth="0.5"/>
            <rect x="80" y="80" width="40" height="40" fill="none" stroke="white" strokeWidth="0.5"/>
            <line x1="100" y1="20" x2="100" y2="180" stroke="white" strokeWidth="0.5" opacity="0.5"/>
            <line x1="20" y1="100" x2="180" y2="100" stroke="white" strokeWidth="0.5" opacity="0.5"/>
            <circle cx="100" cy="100" r="50" fill="none" stroke="white" strokeWidth="0.5"/>
            <circle cx="100" cy="100" r="25" fill="none" stroke="white" strokeWidth="0.5"/>
          </svg>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-[#222] border border-[#333] flex items-center justify-center">
                <FolderKanban className="h-5 w-5 text-[#aaa]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Loyihalar</h2>
                <p className="text-[#666] text-sm">{projects.length} ta loyiha · {formatCurrency(totalBudget)} umumiy byudjet</p>
              </div>
            </div>
          </div>
          <Button onClick={openCreate} className="btn-primary gap-2 rounded-xl h-11 px-5">
            <Plus className="h-4 w-4" /> Yangi Loyiha
          </Button>
        </div>

        {/* Status summary bar */}
        <div className="flex flex-wrap gap-2 mt-5 relative z-10">
          {Object.entries(PROJECT_STATUSES).map(([k, v]) => {
            const count = projects.filter(p => p.status === k).length
            if (!count) return null
            return (
              <button key={k} onClick={() => setFilter(filter === k ? "ALL" : k)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200",
                  filter === k
                    ? "bg-white text-[#111] border-white shadow-lg scale-105"
                    : "bg-[#1a1a1a] text-[#888] border-[#333] hover:bg-[#222]"
                )}>
                <div className="h-1.5 w-1.5 rounded-full bg-[#555]" />
                {v.label} <span className="font-bold">{count}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Search + Filter ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#555]" />
          <Input
            placeholder="Loyiha, mijoz, manzil qidirish..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="pl-10 h-11 rounded-xl border-[#222] bg-[#111] text-white"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-48 h-11 rounded-xl border-[#222] bg-[#111] text-white">
            <Filter className="h-4 w-4 mr-2 text-[#555]" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Barchasi</SelectItem>
            {Object.entries(PROJECT_STATUSES).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="skeleton h-52 rounded-2xl" style={{ animationDelay: `${i * 0.08}s` }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-[#555]">
          <div className="h-20 w-20 rounded-3xl bg-[#111] border border-[#222] flex items-center justify-center mb-4">
            <FolderKanban className="h-10 w-10 opacity-40" />
          </div>
          <p className="text-lg font-semibold text-[#666]">Loyiha topilmadi</p>
          <p className="text-sm mt-1 text-[#444]">Yangi loyiha yarating</p>
          <Button onClick={openCreate} className="mt-5 btn-primary rounded-xl gap-2">
            <Plus className="h-4 w-4" /> Yaratish
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((p, i) => {
            const s = PROJECT_STATUSES[p.status as keyof typeof PROJECT_STATUSES]
            const overdue = p.deadline && new Date(p.deadline) < new Date() && p.status !== "COMPLETED"
            return (
              <div key={p.id} className="project-card group animate-card"
                style={{ animationDelay: `${i * 0.07}s` }}>

                {/* Top strip */}
                <div className="h-1.5 w-full bg-[#333]" />

                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <Link href={`/projects/${p.id}`} className="flex-1 min-w-0">
                      <h3 className="font-bold text-white hover:text-[#ccc] transition-colors leading-tight line-clamp-2 text-base">
                        {p.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-[#1a1a1a] text-[#888] border border-[#333]">
                        {s?.label}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                          <DropdownMenuItem onClick={() => openEdit(p)} className="rounded-lg">
                            <Edit className="h-4 w-4 mr-2 text-[#888]" /> Tahrirlash
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => del(p.id)} className="rounded-lg text-[#ccc]">
                            <Trash2 className="h-4 w-4 mr-2" /> O'chirish
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-2 mb-4">
                    {p.client && (
                      <div className="flex items-center gap-2 text-sm text-[#666]">
                        <div className="h-6 w-6 rounded-lg bg-[#1a1a1a] border border-[#333] flex items-center justify-center flex-shrink-0">
                          <User className="h-3 w-3 text-[#888]" />
                        </div>
                        <span className="truncate">{p.client.name}</span>
                      </div>
                    )}
                    {p.address && (
                      <div className="flex items-center gap-2 text-sm text-[#666]">
                        <div className="h-6 w-6 rounded-lg bg-[#1a1a1a] border border-[#333] flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-3 w-3 text-[#555]" />
                        </div>
                        <span className="truncate">{p.address}</span>
                      </div>
                    )}
                    {p.deadline && (
                      <div className={cn("flex items-center gap-2 text-sm", overdue ? "text-[#aaa]" : "text-[#666]")}>
                        <div className="h-6 w-6 rounded-lg bg-[#1a1a1a] border border-[#333] flex items-center justify-center flex-shrink-0">
                          <Clock className="h-3 w-3 text-[#555]" />
                        </div>
                        <span>{overdue ? "⚠️ " : ""}{formatDate(p.deadline)}</span>
                      </div>
                    )}
                    {p.budget && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="h-6 w-6 rounded-lg bg-[#1a1a1a] border border-[#333] flex items-center justify-center flex-shrink-0">
                          <DollarSign className="h-3 w-3 text-[#888]" />
                        </div>
                        <span className="font-semibold text-[#ccc]">{formatCurrency(p.budget)}</span>
                      </div>
                    )}
                  </div>

                  {/* Footer stats */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#222]">
                    <div className="flex gap-3">
                      {[
                        { icon: "📁", val: p._count.files, label: "fayl" },
                        { icon: "📝", val: p._count.notes, label: "izoh" },
                        { icon: "✅", val: p._count.tasks, label: "vazifa" },
                      ].map(s => (
                        <div key={s.label} className="flex items-center gap-1 text-xs text-[#555]">
                          <span>{s.icon}</span>
                          <span className="font-semibold text-[#888]">{s.val}</span>
                        </div>
                      ))}
                    </div>
                    <Link href={`/projects/${p.id}`}>
                      <Button variant="ghost" size="sm" className="h-7 rounded-lg text-xs text-[#888] hover:text-white hover:bg-[#1a1a1a] gap-1">
                        Ko'rish <ChevronRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Dialog ── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#111] border border-[#222]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">{editing ? "Loyihani tahrirlash" : "Yangi Loyiha"}</DialogTitle>
            <DialogDescription className="text-[#666]">Loyiha ma'lumotlarini to'ldiring</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            <div className="sm:col-span-2 space-y-1.5">
              <Label className="text-[#888]">Nomi *</Label>
              <Input placeholder="Loyiha nomi" value={form.name}
                onChange={e => setForm(f => ({...f, name: e.target.value}))}
                className="rounded-xl h-11 bg-[#0d0d0d] border-[#333] text-white" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[#888]">Mijoz</Label>
              <Select value={form.clientId} onValueChange={v => setForm(f => ({...f, clientId: v}))}>
                <SelectTrigger className="rounded-xl h-11 bg-[#0d0d0d] border-[#333] text-white"><SelectValue placeholder="Tanlang" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Yo'q —</SelectItem>
                  {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[#888]">Holat</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({...f, status: v}))}>
                <SelectTrigger className="rounded-xl h-11 bg-[#0d0d0d] border-[#333] text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PROJECT_STATUSES).map(([k,v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label className="text-[#888]">Telefon</Label>
              <Input placeholder="+998 90 000 00 00" value={form.phone} className="rounded-xl h-11 bg-[#0d0d0d] border-[#333] text-white"
                onChange={e => setForm(f => ({...f, phone: e.target.value}))} /></div>
            <div className="space-y-1.5"><Label className="text-[#888]">Email</Label>
              <Input type="email" placeholder="email@example.com" value={form.email} className="rounded-xl h-11 bg-[#0d0d0d] border-[#333] text-white"
                onChange={e => setForm(f => ({...f, email: e.target.value}))} /></div>
            <div className="sm:col-span-2 space-y-1.5"><Label className="text-[#888]">Manzil</Label>
              <Input placeholder="Toshkent, ..." value={form.address} className="rounded-xl h-11 bg-[#0d0d0d] border-[#333] text-white"
                onChange={e => setForm(f => ({...f, address: e.target.value}))} /></div>
            <div className="space-y-1.5"><Label className="text-[#888]">Boshlanish</Label>
              <Input type="date" value={form.startDate} className="rounded-xl h-11 bg-[#0d0d0d] border-[#333] text-white"
                onChange={e => setForm(f => ({...f, startDate: e.target.value}))} /></div>
            <div className="space-y-1.5"><Label className="text-[#888]">Deadline</Label>
              <Input type="date" value={form.deadline} className="rounded-xl h-11 bg-[#0d0d0d] border-[#333] text-white"
                onChange={e => setForm(f => ({...f, deadline: e.target.value}))} /></div>
            <div className="sm:col-span-2 space-y-1.5"><Label className="text-[#888]">Byudjet (so'm)</Label>
              <Input type="number" placeholder="0" value={form.budget} className="rounded-xl h-11 bg-[#0d0d0d] border-[#333] text-white"
                onChange={e => setForm(f => ({...f, budget: e.target.value}))} /></div>
            <div className="sm:col-span-2 space-y-1.5"><Label className="text-[#888]">Tavsif</Label>
              <Textarea rows={3} placeholder="Loyiha haqida..." value={form.description}
                className="rounded-xl resize-none bg-[#0d0d0d] border-[#333] text-white"
                onChange={e => setForm(f => ({...f, description: e.target.value}))} /></div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl border-[#333] text-[#888]">Bekor</Button>
            <Button onClick={save} disabled={saving} className="btn-primary rounded-xl">
              {saving ? "Saqlanmoqda..." : editing ? "Saqlash" : "Yaratish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
