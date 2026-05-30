"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Search, Users, Phone, Mail, Building, MoreVertical, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
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
const COLORS = ["bg-blue-500","bg-emerald-500","bg-orange-500","bg-purple-500","bg-pink-500","bg-teal-500"]
const getColor = (name: string) => COLORS[name.charCodeAt(0) % COLORS.length]
const initials  = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2)

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
  const openEdit   = (c: Client) => { setEditing(c); setForm({ name:c.name, phone:c.phone??"", email:c.email??"", company:c.company??"", address:c.address??"", notes:c.notes??"" }); setOpen(true) }

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
      toast({ title: editing ? "Yangilandi" : "Yaratildi" }); setOpen(false); load()
    } catch { toast({ variant:"destructive", title:"Xatolik" }) }
    finally { setSaving(false) }
  }

  const del = async (id: string) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Mijozlar (CRM)</h2>
          <p className="text-sm text-muted-foreground">{clients.length} ta mijoz</p>
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" />Yangi Mijoz</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Mijoz, kompaniya, telefon..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-44 bg-muted animate-pulse rounded-lg" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Users className="h-16 w-16 mb-4 opacity-20" />
          <p className="text-lg font-medium">Mijoz topilmadi</p>
          <Button onClick={openCreate} variant="outline" className="mt-4 gap-2"><Plus className="h-4 w-4" />Yaratish</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(c => (
            <Card key={c.id} className="group hover:shadow-md transition-all">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className={cn("h-11 w-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0", getColor(c.name))}>
                    {initials(c.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/clients/${c.id}`}>
                        <h3 className="font-semibold hover:text-blue-600 transition-colors leading-tight">{c.name}</h3>
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 flex-shrink-0"><MoreVertical className="h-3.5 w-3.5" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(c)}><Edit className="h-4 w-4 mr-2" />Tahrirlash</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => del(c.id)} className="text-red-600"><Trash2 className="h-4 w-4 mr-2" />O'chirish</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {c.company && <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5"><Building className="h-3.5 w-3.5" />{c.company}</p>}
                  </div>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  {c.phone && <a href={`tel:${c.phone}`} className="flex items-center gap-1.5 hover:text-foreground"><Phone className="h-3.5 w-3.5 flex-shrink-0" />{c.phone}</a>}
                  {c.email && <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 hover:text-foreground truncate"><Mail className="h-3.5 w-3.5 flex-shrink-0" />{c.email}</a>}
                </div>
                {c.projects.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-muted-foreground mb-1.5">{c._count.projects} ta loyiha</p>
                    <div className="flex flex-wrap gap-1">
                      {c.projects.slice(0,3).map(p => {
                        const s = PROJECT_STATUSES[p.status as keyof typeof PROJECT_STATUSES]
                        return <Link key={p.id} href={`/projects/${p.id}`}><span className={cn("text-xs px-2 py-0.5 rounded-full font-medium cursor-pointer", s?.color)}>{p.name.length > 16 ? p.name.slice(0,16)+"…" : p.name}</span></Link>
                      })}
                      {c.projects.length > 3 && <span className="text-xs text-muted-foreground">+{c.projects.length-3}</span>}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Mijozni tahrirlash" : "Yangi Mijoz"}</DialogTitle><DialogDescription>Mijoz ma'lumotlarini kiriting</DialogDescription></DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            <div className="sm:col-span-2 space-y-1.5"><Label>Ism-familiya *</Label><Input placeholder="Bobur Toshmatov" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} /></div>
            <div className="space-y-1.5"><Label>Telefon</Label><Input placeholder="+998 90 123 45 67" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input type="email" placeholder="client@example.com" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} /></div>
            <div className="sm:col-span-2 space-y-1.5"><Label>Kompaniya</Label><Input placeholder="ABC Qurilish LLC" value={form.company} onChange={e => setForm(f => ({...f, company: e.target.value}))} /></div>
            <div className="sm:col-span-2 space-y-1.5"><Label>Manzil</Label><Input placeholder="Toshkent, Chilonzor 14" value={form.address} onChange={e => setForm(f => ({...f, address: e.target.value}))} /></div>
            <div className="sm:col-span-2 space-y-1.5"><Label>Izoh</Label><Textarea rows={2} placeholder="Qo'shimcha ma'lumot..." value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} /></div>
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
