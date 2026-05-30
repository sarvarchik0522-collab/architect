"use client"
import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Edit, Trash2, Plus, Upload, FileText, X, Save, Calendar, User, Phone, MapPin, DollarSign, MessageSquare, Paperclip, CheckSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { cn, formatDate, formatCurrency, formatFileSize, PROJECT_STATUSES, TASK_PRIORITIES, TASK_STATUSES } from "@/lib/utils"

interface Project {
  id: string; name: string; address: string|null; phone: string|null; email: string|null
  startDate: string|null; deadline: string|null; status: string; description: string|null; budget: number|null
  client: { id: string; name: string; phone: string|null } | null
  files: { id:string; originalName:string; path:string; size:number; mimeType:string }[]
  notes: { id:string; content:string; createdAt:string }[]
  tasks: { id:string; title:string; status:string; priority:string; deadline:string|null }[]
}

export default function ProjectDetail() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [project, setProject] = useState<Project|null>(null)
  const [loading, setLoading] = useState(true)
  const [note, setNote]       = useState("")
  const [savingNote, setSN]   = useState(false)
  const [uploading, setUpl]   = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [form, setForm]       = useState<any>({})
  const [saving, setSaving]   = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    const res = await fetch(`/api/projects/${params.id}`)
    if (!res.ok) { router.push("/projects"); return }
    setProject(await res.json()); setLoading(false)
  }
  useEffect(() => { load() }, [params.id])

  const openEdit = () => {
    if (!project) return
    setForm({
      name: project.name, clientId: project.client?.id ?? "", phone: project.phone ?? "",
      email: project.email ?? "", address: project.address ?? "",
      startDate: project.startDate ? project.startDate.split("T")[0] : "",
      deadline: project.deadline ? project.deadline.split("T")[0] : "",
      status: project.status, description: project.description ?? "",
      budget: project.budget ? String(project.budget) : "",
    })
    setEditOpen(true)
  }

  const saveEdit = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/projects/${params.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, clientId: form.clientId || null, budget: form.budget ? Number(form.budget) : null, startDate: form.startDate || null, deadline: form.deadline || null }),
      })
      if (!res.ok) throw new Error()
      toast({ title: "Yangilandi" }); setEditOpen(false); load()
    } catch { toast({ variant: "destructive", title: "Xatolik" }) }
    finally { setSaving(false) }
  }

  const addNote = async () => {
    if (!note.trim()) return
    setSN(true)
    await fetch(`/api/projects/${params.id}/notes`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: note }) })
    setNote(""); setSN(false); toast({ title: "Izoh qo'shildi" }); load()
  }

  const delNote = async (noteId: string) => {
    await fetch(`/api/projects/${params.id}/notes`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ noteId }) })
    toast({ title: "Izoh o'chirildi" }); load()
  }

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setUpl(true)
    const fd = new FormData(); fd.append("file", file)
    const res = await fetch(`/api/projects/${params.id}/files`, { method: "POST", body: fd })
    if (!res.ok) toast({ variant: "destructive", title: "Yuklanmadi" })
    else { toast({ title: "Fayl yuklandi" }); load() }
    setUpl(false); if (fileRef.current) fileRef.current.value = ""
  }

  const delFile = async (fileId: string) => {
    await fetch(`/api/projects/${params.id}/files`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fileId }) })
    toast({ title: "Fayl o'chirildi" }); load()
  }

  const delProject = async () => {
    if (!confirm("Loyihani o'chirishni tasdiqlaysizmi?")) return
    await fetch(`/api/projects/${params.id}`, { method: "DELETE" })
    toast({ title: "O'chirildi" }); router.push("/projects")
  }

  if (loading) return <div className="space-y-4"><div className="h-8 w-48 bg-muted animate-pulse rounded" /><div className="h-48 bg-muted animate-pulse rounded-lg" /></div>
  if (!project) return null

  const s = PROJECT_STATUSES[project.status as keyof typeof PROJECT_STATUSES]
  const overdue = project.deadline && new Date(project.deadline) < new Date() && project.status !== "COMPLETED"

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between gap-4">
        <Link href="/projects"><Button variant="ghost" size="sm" className="gap-1 -ml-2"><ArrowLeft className="h-4 w-4" />Orqaga</Button></Link>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1" onClick={openEdit}><Edit className="h-4 w-4" />Tahrirlash</Button>
          <Button variant="destructive" size="sm" className="gap-1" onClick={delProject}><Trash2 className="h-4 w-4" />O'chirish</Button>
        </div>
      </div>

      {/* Header card */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold mb-2">{project.name}</h2>
              <div className="flex flex-wrap gap-2">
                <span className={cn("text-sm px-3 py-1 rounded-full font-medium", s?.color)}>{s?.label}</span>
                {overdue && <Badge variant="destructive">Muddati o'tdi!</Badge>}
              </div>
              {project.description && <p className="text-muted-foreground text-sm mt-3 leading-relaxed">{project.description}</p>}
            </div>
            {project.budget && (
              <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl px-5 py-3 text-center flex-shrink-0">
                <p className="text-xs text-emerald-600 font-medium">Byudjet</p>
                <p className="text-lg font-bold text-emerald-700">{formatCurrency(project.budget)}</p>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            {project.client && <div className="flex items-start gap-2"><User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" /><div><p className="text-xs text-muted-foreground">Mijoz</p><Link href={`/clients/${project.client.id}`} className="text-sm font-medium hover:text-blue-600">{project.client.name}</Link></div></div>}
            {project.phone && <div className="flex items-start gap-2"><Phone className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" /><div><p className="text-xs text-muted-foreground">Telefon</p><p className="text-sm font-medium">{project.phone}</p></div></div>}
            {project.startDate && <div className="flex items-start gap-2"><Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" /><div><p className="text-xs text-muted-foreground">Boshlanish</p><p className="text-sm font-medium">{formatDate(project.startDate)}</p></div></div>}
            {project.deadline && <div className="flex items-start gap-2"><Calendar className={cn("h-4 w-4 mt-0.5 flex-shrink-0", overdue ? "text-red-500" : "text-muted-foreground")} /><div><p className="text-xs text-muted-foreground">Deadline</p><p className={cn("text-sm font-medium", overdue && "text-red-500")}>{formatDate(project.deadline)}</p></div></div>}
            {project.address && <div className="flex items-start gap-2 col-span-2"><MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" /><div><p className="text-xs text-muted-foreground">Manzil</p><p className="text-sm font-medium">{project.address}</p></div></div>}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="notes">
        <TabsList>
          <TabsTrigger value="notes" className="gap-1.5"><MessageSquare className="h-4 w-4" />Izohlar ({project.notes.length})</TabsTrigger>
          <TabsTrigger value="files" className="gap-1.5"><Paperclip className="h-4 w-4" />Fayllar ({project.files.length})</TabsTrigger>
          <TabsTrigger value="tasks" className="gap-1.5"><CheckSquare className="h-4 w-4" />Vazifalar ({project.tasks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="notes" className="mt-4">
          <Card><CardContent className="pt-5">
            <div className="flex gap-2 mb-5">
              <Textarea placeholder="Izoh yozing..." value={note} onChange={e => setNote(e.target.value)} rows={2} className="resize-none" />
              <Button onClick={addNote} disabled={savingNote || !note.trim()} className="self-end"><Plus className="h-4 w-4" /></Button>
            </div>
            {project.notes.length === 0 ? <p className="text-center text-muted-foreground py-8 text-sm">Izoh yo'q</p> :
              <div className="space-y-3">
                {project.notes.map(n => (
                  <div key={n.id} className="flex items-start gap-3 p-3 bg-muted/40 rounded-lg group">
                    <div className="flex-1"><p className="text-sm">{n.content}</p><p className="text-xs text-muted-foreground mt-1">{formatDate(n.createdAt)}</p></div>
                    <button onClick={() => delNote(n.id)} className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"><X className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            }
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="files" className="mt-4">
          <Card><CardContent className="pt-5">
            <div className="flex justify-between items-center mb-5">
              <p className="text-sm text-muted-foreground">{project.files.length} ta fayl</p>
              <div>
                <input ref={fileRef} type="file" className="hidden" onChange={uploadFile} accept="image/*,.pdf,.docx,.doc,.xlsx,.dwg" />
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => fileRef.current?.click()} disabled={uploading}>
                  <Upload className="h-4 w-4" />{uploading ? "Yuklanmoqda..." : "Fayl yuklash"}
                </Button>
              </div>
            </div>
            {project.files.length === 0 ? <div className="text-center py-10 text-muted-foreground"><Paperclip className="h-10 w-10 mx-auto mb-2 opacity-20" /><p className="text-sm">Fayl yuklanmagan</p></div> :
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {project.files.map(f => (
                  <div key={f.id} className="group relative border rounded-lg overflow-hidden bg-muted/30">
                    {f.mimeType.startsWith("image/")
                      ? <a href={f.path} target="_blank" rel="noopener noreferrer"><img src={f.path} alt={f.originalName} className="w-full h-28 object-cover" /></a>
                      : <a href={f.path} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center h-28 hover:bg-muted/60 transition-colors"><FileText className="h-10 w-10 text-muted-foreground" /><span className="text-xs text-muted-foreground uppercase mt-1">{f.originalName.split(".").pop()}</span></a>
                    }
                    <div className="p-2 border-t"><p className="text-xs font-medium truncate" title={f.originalName}>{f.originalName}</p><p className="text-xs text-muted-foreground">{formatFileSize(f.size)}</p></div>
                    <button onClick={() => delFile(f.id)} className="absolute top-1 right-1 h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-3 w-3" /></button>
                  </div>
                ))}
              </div>
            }
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="tasks" className="mt-4">
          <Card><CardContent className="pt-5">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-muted-foreground">{project.tasks.length} ta vazifa</p>
              <Link href="/tasks"><Button variant="outline" size="sm" className="gap-1.5"><Plus className="h-4 w-4" />Vazifa qo'shish</Button></Link>
            </div>
            {project.tasks.length === 0 ? <div className="text-center py-10 text-muted-foreground"><CheckSquare className="h-10 w-10 mx-auto mb-2 opacity-20" /><p className="text-sm">Vazifa yo'q</p></div> :
              <div className="space-y-2">
                {project.tasks.map(t => {
                  const pr = TASK_PRIORITIES[t.priority as keyof typeof TASK_PRIORITIES]
                  const st = TASK_STATUSES[t.status as keyof typeof TASK_STATUSES]
                  return (
                    <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                      <div className={cn("h-2 w-2 rounded-full flex-shrink-0", t.status === "DONE" ? "bg-green-500" : t.status === "IN_PROGRESS" ? "bg-blue-500" : "bg-slate-400")} />
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-medium", t.status === "DONE" && "line-through opacity-60")}>{t.title}</p>
                        {t.deadline && <p className="text-xs text-muted-foreground">{formatDate(t.deadline)}</p>}
                      </div>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full", pr?.color)}>{pr?.label}</span>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full", st?.color)}>{st?.label}</span>
                    </div>
                  )
                })}
              </div>
            }
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Loyihani tahrirlash</DialogTitle><DialogDescription>Ma'lumotlarni yangilang</DialogDescription></DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            <div className="sm:col-span-2 space-y-1.5"><Label>Nomi *</Label><Input value={form.name ?? ""} onChange={e => setForm((f:any) => ({...f, name: e.target.value}))} /></div>
            <div className="space-y-1.5"><Label>Holat</Label>
              <Select value={form.status} onValueChange={v => setForm((f:any) => ({...f, status: v}))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(PROJECT_STATUSES).map(([k,v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Telefon</Label><Input value={form.phone ?? ""} onChange={e => setForm((f:any) => ({...f, phone: e.target.value}))} /></div>
            <div className="space-y-1.5"><Label>Boshlanish</Label><Input type="date" value={form.startDate ?? ""} onChange={e => setForm((f:any) => ({...f, startDate: e.target.value}))} /></div>
            <div className="space-y-1.5"><Label>Deadline</Label><Input type="date" value={form.deadline ?? ""} onChange={e => setForm((f:any) => ({...f, deadline: e.target.value}))} /></div>
            <div className="sm:col-span-2 space-y-1.5"><Label>Manzil</Label><Input value={form.address ?? ""} onChange={e => setForm((f:any) => ({...f, address: e.target.value}))} /></div>
            <div className="sm:col-span-2 space-y-1.5"><Label>Byudjet</Label><Input type="number" value={form.budget ?? ""} onChange={e => setForm((f:any) => ({...f, budget: e.target.value}))} /></div>
            <div className="sm:col-span-2 space-y-1.5"><Label>Tavsif</Label><Textarea rows={3} value={form.description ?? ""} onChange={e => setForm((f:any) => ({...f, description: e.target.value}))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Bekor</Button>
            <Button onClick={saveEdit} disabled={saving}>{saving ? "Saqlanmoqda..." : "Saqlash"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
