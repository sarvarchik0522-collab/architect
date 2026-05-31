"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Search, Users, Phone, Mail, Building, MoreVertical, Edit, Trash2, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { cn, PROJECT_STATUSES } from "@/lib/utils"

interface Client {
  id:string; name:string; phone:string|null; email:string|null
  company:string|null; address:string|null; notes:string|null
  projects: { id:string; name:string; status:string }[]
  _count: { projects:number; payments:number }
}

const EMPTY = { name:"", phone:"", email:"", company:"", address:"", notes:"" }

const AVATAR_GRADIENTS = [
  "from-blue-500 to-violet-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-pink-600",
  "from-violet-500 to-purple-700",
  "from-pink-500 to-rose-600",
  "from-cyan-500 to-blue-600",
]
const getGradient = (name: string) => AVATAR_GRADIENTS[name.charCodeAt(0) % AVATAR_GRADIENTS.length]
const initials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2)

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState("")
  const [open,    setOpen]    = useState(false)
  const [editing, setEditing] = useState<Client|null>(null)
  const [form,    setForm]    = useState(EMPTY)
  const [saving,  setSaving]  = useState(false)
  const { toast } = useToast()

  const load = async () => {
    setLoading(true)
    setClients(await fetch("/api/clients").then(r => r.json()))
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(EMPTY); setOpen(true) }
  const openEdit = (c: Client) => {
    setEditing(c)
    setForm({ name:c.name, phone:c.phone??"", email:c.email??"", company:c.company??"", address:c.address??"", notes:c.notes??"" })
    setOpen(true)
  }

  const save = async () => {
    if (!form.name.trim()) return toast({ variant:"destructive", title:"Ism kiritilishi shart" })
    setSaving(true)
    try {
      const res = await fetch(editing ? `/api/clients/${editing.id}` : "/api/clients", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      toast({ title: editing ? "Yangilandi ✓" : "Yaratildi ✓" }); setOpen(false); load()
    } catch { toast({ variant:"destructive", title:"Xatolik" }) }
    finally { setSaving(false) }
  }

  const del = async (id: string) => {
    if (!confirm("Mijozni o'chirishni tasdiqlaysizmi?")) return
    await fetch(`/api/clients/${id}`, { method:"DELETE" })
    toast({ title:"O'chirildi" }); load()
  }

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.company?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-8 page-enter arch-pattern">

      {/* ── Header banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-800 p-8 text-white">
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none hidden lg:block">
          <svg width="180" height="180" viewBox="0 0 180 180" className="animate-float">
            <circle cx="90" cy="90" r="70" fill="none" stroke="white" strokeWidth="1"/>
            <circle cx="90" cy="90" r="50" fill="none" stroke="white" strokeWidth="0.7"/>
            <circle cx="90" cy="90" r="30" fill="none" stroke="white" strokeWidth="0.5"/>
            {[0,60,120,180,240,300].map((deg, i) => (
              <circle key={i} cx={90 + 50*Math.cos(deg*Math.PI/180)} cy={90 + 50*Math.sin(deg*Math.PI/180)} r="6" fill="white" opacity="0.6"/>
            ))}
          </svg>
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-10 w-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Mijozlar</h2>
                <p className="text-violet-200 text-sm">{clients.length} ta mijoz · CRM tizimi</p>
              </div>
            </div>
          </div>
          <Button onClick={openCreate} className="bg-white text-violet-700 hover:bg-violet-50 gap-2 rounded-xl h-10 px-5 font-semibold shadow-lg">
            <Plus className="h-4 w-4" /> Yangi Mijoz
          </Button>
        </div>
        {/* Stats row */}
        <div className="flex flex-wrap gap-4 mt-5 relative z-10">
          {[
            { label: "Jami mijozlar",  value: clients.length,                         icon: "👥" },
            { label: "Kompaniyalar",   value: clients.filter(c=>c.company).length,     icon: "🏢" },
            { label: "Faol loyihalar", value: clients.reduce((s,c)=>s+c._count.projects,0), icon: "📐" },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/20">
              <span className="text-xl">{s.icon}</span>
              <div>
                <p className="text-xl font-bold leading-none">{s.value}</p>
                <p className="text-xs text-violet-200">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Search ── */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input placeholder="Mijoz, kompaniya, telefon qidirish..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="pl-10 h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" />
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-48 rounded-2xl" style={{ animationDelay:`${i*0.08}s` }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <div className="h-20 w-20 rounded-3xl bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center mb-4 animate-float">
            <Users className="h-10 w-10 text-violet-300" />
          </div>
          <p className="text-lg font-semibold text-slate-500">Mijoz topilmadi</p>
          <Button onClick={openCreate} className="mt-5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl gap-2">
            <Plus className="h-4 w-4" /> Yaratish
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((c, i) => (
            <div key={c.id} className="client-card bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 group animate-card"
              style={{ animationDelay:`${i*0.07}s` }}>
              {/* Top accent */}
              <div className={cn("h-1 w-full bg-gradient-to-r", getGradient(c.name))} />
              <div className="p-5">
                <div className="flex items-start gap-4 mb-4">
                  {/* 3D Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className={cn("client-avatar h-14 w-14 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-lg shadow-lg", getGradient(c.name))}>
                      {initials(c.name)}
                    </div>
                    {/* Glow */}
                    <div className={cn("absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-30 blur-md transition-opacity", getGradient(c.name))} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/clients/${c.id}`}>
                        <h3 className="font-bold text-slate-800 dark:text-white hover:text-violet-600 transition-colors leading-tight">{c.name}</h3>
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                          <DropdownMenuItem onClick={() => openEdit(c)} className="rounded-lg">
                            <Edit className="h-4 w-4 mr-2 text-violet-500" /> Tahrirlash
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => del(c.id)} className="rounded-lg text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" /> O'chirish
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {c.company && (
                      <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Building className="h-3.5 w-3.5 text-violet-400" /> {c.company}
                      </p>
                    )}
                  </div>
                </div>

                {/* Contact info */}
                <div className="space-y-2">
                  {c.phone && (
                    <a href={`tel:${c.phone}`} className="flex items-center gap-2.5 text-sm text-slate-500 hover:text-violet-600 transition-colors group/link">
                      <div className="h-7 w-7 rounded-lg bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center flex-shrink-0 group-hover/link:bg-violet-100 transition-colors">
                        <Phone className="h-3.5 w-3.5 text-violet-500" />
                      </div>
                      <span className="font-medium">{c.phone}</span>
                    </a>
                  )}
                  {c.email && (
                    <a href={`mailto:${c.email}`} className="flex items-center gap-2.5 text-sm text-slate-500 hover:text-violet-600 transition-colors group/link truncate">
                      <div className="h-7 w-7 rounded-lg bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center flex-shrink-0 group-hover/link:bg-violet-100 transition-colors">
                        <Mail className="h-3.5 w-3.5 text-violet-500" />
                      </div>
                      <span className="truncate">{c.email}</span>
                    </a>
                  )}
                </div>

                {/* Projects */}
                {c.projects.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{c._count.projects} ta loyiha</p>
                      <Link href={`/clients/${c.id}`}>
                        <span className="text-xs text-violet-500 flex items-center gap-0.5">
                          Barchasi <ChevronRight className="h-3 w-3" />
                        </span>
                      </Link>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {c.projects.slice(0,3).map(p => {
                        const s = PROJECT_STATUSES[p.status as keyof typeof PROJECT_STATUSES]
                        return (
                          <Link key={p.id} href={`/projects/${p.id}`}>
                            <span className={cn("text-xs px-2 py-0.5 rounded-lg font-medium cursor-pointer hover:opacity-80 transition-opacity", s?.color)}>
                              {p.name.length > 16 ? p.name.slice(0,16)+"…" : p.name}
                            </span>
                          </Link>
                        )
                      })}
                      {c.projects.length > 3 && (
                        <span className="text-xs text-slate-400 px-1">+{c.projects.length-3}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Dialog ── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{editing ? "Mijozni tahrirlash" : "Yangi Mijoz"}</DialogTitle>
            <DialogDescription>Mijoz ma'lumotlarini kiriting</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            <div className="sm:col-span-2 space-y-1.5"><Label>Ism-familiya *</Label>
              <Input placeholder="Bobur Toshmatov" value={form.name} className="rounded-xl h-11"
                onChange={e => setForm(f => ({...f, name: e.target.value}))} /></div>
            <div className="space-y-1.5"><Label>Telefon</Label>
              <Input placeholder="+998 90 123 45 67" value={form.phone} className="rounded-xl h-11"
                onChange={e => setForm(f => ({...f, phone: e.target.value}))} /></div>
            <div className="space-y-1.5"><Label>Email</Label>
              <Input type="email" placeholder="client@example.com" value={form.email} className="rounded-xl h-11"
                onChange={e => setForm(f => ({...f, email: e.target.value}))} /></div>
            <div className="sm:col-span-2 space-y-1.5"><Label>Kompaniya</Label>
              <Input placeholder="ABC Qurilish LLC" value={form.company} className="rounded-xl h-11"
                onChange={e => setForm(f => ({...f, company: e.target.value}))} /></div>
            <div className="sm:col-span-2 space-y-1.5"><Label>Manzil</Label>
              <Input placeholder="Toshkent, Chilonzor 14" value={form.address} className="rounded-xl h-11"
                onChange={e => setForm(f => ({...f, address: e.target.value}))} /></div>
            <div className="sm:col-span-2 space-y-1.5"><Label>Izoh</Label>
              <Textarea rows={2} placeholder="Qo'shimcha ma'lumot..." value={form.notes} className="rounded-xl resize-none"
                onChange={e => setForm(f => ({...f, notes: e.target.value}))} /></div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl">Bekor</Button>
            <Button onClick={save} disabled={saving} className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl">
              {saving ? "Saqlanmoqda..." : editing ? "Saqlash" : "Yaratish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
