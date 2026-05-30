"use client"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Plus, Search, Filter, FolderKanban, Calendar, User, MoreVertical, Edit, Trash2 } from "lucide-react"
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
  const openEdit   = (p: Project) => {
    setEditing(p)
    setForm({ name: p.name, clientId: p.client?.id ?? "none", phone: p.phone ?? "", email: "",
      address: p.address ?? "", startDate: p.startDate ? p.startDate.split("T")[0] : "",
      deadline: p.deadline ? p.deadline.split("T")[0] : "", status: p.status,
      description: p.description ?? "", budget: p.budget ? String(p.budget) : "" })
    setOpen(true)
  }

  const save = async () => {
    if (!form.name.trim()) return toast({ variant:"destructive", title:"Loyiha nomi kiritilishi shart" })
    setSaving(true)
    try {
      const res = await fetch(editing ? `/api/projects/${editing.id}` : "/api/projects", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, clientId: form.clientId === "none" ? null : form.clientId || null, budget: form.budget ? Number(form.budget) : null, startDate: form.startDate || null, deadline: form.deadline || null }),
      })
      if (!res.ok) throw new Error()
      toast({ title: editing ? "Yangilandi" : "Yaratildi" })
      setOpen(false); load()
    } catch { toast({ variant:"destructive", title:"Xatolik" }) }
    finally { setSaving(false) }
  }

  const del = async (id: string) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return
    await fetch(`/api/projects/${id}`, { method:"DELETE" })
    toast({ title:"O'chirildi" }); load()
  }

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.client?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.address?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Loyihalar</h2>
          <p className="text-sm text-muted-foreground">{projects.length} ta loyiha</p>
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" />Yangi Loyiha</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Qidirish..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <Filter className="h-4 w-4 mr-2 opacity-60" /><SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Barchasi</SelectItem>
            {Object.entries(PROJECT_STATUSES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Status chips */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(PROJECT_STATUSES).map(([k, v]) => {
          const count = projects.filter(p => p.status === k).length
          if (!count) return null
          return (
            <button key={k} onClick={() => setFilter(filter === k ? "ALL" : k)}
              className={cn("text-xs px-3 py-1.5 rounded-full font-medium border transition-all", v.color, filter === k && "ring-2 ring-offset-1 ring-blue-500")}>
              {v.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-44 bg-muted animate-pulse rounded-lg" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <FolderKanban className="h-16 w-16 mb-4 opacity-20" />
          <p className="text-lg font-medium">Loyiha topilmadi</p>
          <Button onClick={openCreate} variant="outline" className="mt-4 gap-2"><Plus className="h-4 w-4" />Yaratish</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(p => {
            const s = PROJECT_STATUSES[p.status as keyof typeof PROJECT_STATUSES]
            const overdue = p.deadline && new Date(p.deadline) < new Date() && p.status !== "COMPLETED"
            return (
              <Card key={p.id} className="group hover:shadow-md transition-all">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Link href={`/projects/${p.id}`} className="flex-1 min-w-0">
                      <h3 className="font-semibold hover:text-blue-600 transition-colors line-clamp-2 leading-tight">{p.name}</h3>
                    </Link>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap", s?.color)}>{s?.label}</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(p)}><Edit className="h-4 w-4 mr-2" />Tahrirlash</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => del(p.id)} className="text-red-600"><Trash2 className="h-4 w-4 mr-2" />O'chirish</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {p.client && <p className="flex items-center gap-1.5"><User className="h-3.5 w-3.5 flex-shrink-0" />{p.client.name}</p>}
                    {p.deadline && (
                      <p className={cn("flex items-center gap-1.5", overdue && "text-red-500 font-medium")}>
                        <Calendar className="h-3.5 w-3.5 flex-shrink-0" />{formatDate(p.deadline)}
                        {overdue && <Badge variant="destructive" className="text-xs py-0 px-1.5">Muddati o'tdi</Badge>}
                      </p>
                    )}
                    {p.budget && <p className="font-medium text-foreground">{formatCurrency(p.budget)}</p>}
                  </div>
                  <div className="flex gap-3 mt-3 pt-3 border-t text-xs text-muted-foreground">
                    <span>📁 {p._count.files}</span>
                    <span>📝 {p._count.notes}</span>
                    <span>✅ {p._count.tasks}</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Loyihani tahrirlash" : "Yangi Loyiha"}</DialogTitle>
            <DialogDescription>Loyiha ma'lumotlarini to'ldiring</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            <div className="sm:col-span-2 space-y-1.5">
              <Label>Nomi *</Label>
              <Input placeholder="Loyiha nomi" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
            </div>
            <div className="space-y-1.5">
              <Label>Mijoz</Label>
              <Select value={form.clientId} onValueChange={v => setForm(f => ({...f, clientId: v}))}>
                <SelectTrigger><SelectValue placeholder="Tanlang" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Yo'q —</SelectItem>
                  {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Holat</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({...f, status: v}))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(PROJECT_STATUSES).map(([k,v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Telefon</Label><Input placeholder="+998 90 000 00 00" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input type="email" placeholder="email@example.com" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} /></div>
            <div className="sm:col-span-2 space-y-1.5"><Label>Manzil</Label><Input placeholder="Toshkent, ..." value={form.address} onChange={e => setForm(f => ({...f, address: e.target.value}))} /></div>
            <div className="space-y-1.5"><Label>Boshlanish</Label><Input type="date" value={form.startDate} onChange={e => setForm(f => ({...f, startDate: e.target.value}))} /></div>
            <div className="space-y-1.5"><Label>Deadline</Label><Input type="date" value={form.deadline} onChange={e => setForm(f => ({...f, deadline: e.target.value}))} /></div>
            <div className="sm:col-span-2 space-y-1.5"><Label>Byudjet (so'm)</Label><Input type="number" placeholder="0" value={form.budget} onChange={e => setForm(f => ({...f, budget: e.target.value}))} /></div>
            <div className="sm:col-span-2 space-y-1.5"><Label>Tavsif</Label><Textarea rows={3} placeholder="Loyiha haqida..." value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Bekor</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Saqlanmoqda..." : editing ? "Saqlash" : "Yaratish"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
