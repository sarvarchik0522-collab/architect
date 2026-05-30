"use client"
import { useState, useEffect, useCallback } from "react"
import { Plus, CheckSquare, Trash2, Edit, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { cn, formatDate, TASK_PRIORITIES, TASK_STATUSES } from "@/lib/utils"

interface Task {
  id:string; title:string; description:string|null
  deadline:string|null; priority:string; status:string; order:number
  project: { id:string; name:string } | null
}

const COLS = [
  { key:"TODO",        label:"Bajarilmagan", dotColor:"bg-slate-400",  bg:"bg-slate-50 dark:bg-slate-900/40" },
  { key:"IN_PROGRESS", label:"Jarayonda",    dotColor:"bg-blue-500",   bg:"bg-blue-50 dark:bg-blue-900/20" },
  { key:"DONE",        label:"Bajarildi",    dotColor:"bg-green-500",  bg:"bg-green-50 dark:bg-green-900/20" },
]

const EMPTY = { title:"", description:"", deadline:"", priority:"MEDIUM", status:"TODO", projectId:"none" }

export default function TasksPage() {
  const [tasks,    setTasks]    = useState<Task[]>([])
  const [projects, setProjects] = useState<{ id:string; name:string }[]>([])
  const [loading,  setLoading]  = useState(true)
  const [open,     setOpen]     = useState(false)
  const [editing,  setEditing]  = useState<Task|null>(null)
  const [form,     setForm]     = useState(EMPTY)
  const [saving,   setSaving]   = useState(false)
  const [dragOver, setDragOver] = useState<string|null>(null)
  const { toast } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    setTasks(await fetch("/api/tasks").then(r => r.json()))
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => { fetch("/api/projects").then(r => r.json()).then(d => setProjects(d.map((p:any) => ({ id:p.id, name:p.name })))) }, [])

  const openCreate = (status = "TODO") => { setEditing(null); setForm({ ...EMPTY, status }); setOpen(true) }
  const openEdit   = (t: Task) => {
    setEditing(t)
    setForm({ title:t.title, description:t.description??"", deadline: t.deadline ? t.deadline.split("T")[0] : "",
      priority:t.priority, status:t.status, projectId:t.project?.id??"none" })
    setOpen(true)
  }

  const save = async () => {
    if (!form.title.trim()) return toast({ variant:"destructive", title:"Vazifa nomi kiritilishi shart" })
    setSaving(true)
    try {
      const res = await fetch(editing ? `/api/tasks/${editing.id}` : "/api/tasks", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ ...form, projectId: form.projectId === "none" ? null : form.projectId || null, deadline: form.deadline || null }),
      })
      if (!res.ok) throw new Error()
      toast({ title: editing ? "Yangilandi" : "Yaratildi" }); setOpen(false); load()
    } catch { toast({ variant:"destructive", title:"Xatolik" }) }
    finally { setSaving(false) }
  }

  const del = async (id: string) => {
    await fetch(`/api/tasks/${id}`, { method:"DELETE" })
    toast({ title:"O'chirildi" }); load()
  }

  const changeStatus = async (id: string, status: string) => {
    await fetch(`/api/tasks/${id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ status }) })
    load()
  }

  const onDragStart = (e: React.DragEvent, id: string) => e.dataTransfer.setData("taskId", id)
  const onDrop = async (e: React.DragEvent, status: string) => {
    e.preventDefault(); setDragOver(null)
    const id = e.dataTransfer.getData("taskId")
    const task = tasks.find(t => t.id === id)
    if (!task || task.status === status) return
    await changeStatus(id, status)
  }

  const colTasks  = (key: string) => tasks.filter(t => t.status === key)
  const done      = tasks.filter(t => t.status === "DONE").length
  const progress  = tasks.length ? Math.round((done / tasks.length) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Vazifalar — Kanban</h2>
          <p className="text-sm text-muted-foreground">{tasks.length} ta vazifa · {progress}% bajarildi</p>
        </div>
        <Button onClick={() => openCreate()} className="gap-2"><Plus className="h-4 w-4" />Yangi Vazifa</Button>
      </div>

      {tasks.length > 0 && (
        <div className="space-y-1">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500" style={{ width:`${progress}%` }} />
          </div>
          <p className="text-xs text-muted-foreground">{done}/{tasks.length} bajarildi</p>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />)}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLS.map(col => (
            <div key={col.key}
              className={cn("rounded-xl p-4 min-h-[420px] border-2 transition-all", col.bg, dragOver === col.key ? "border-blue-400" : "border-transparent")}
              onDragOver={e => { e.preventDefault(); setDragOver(col.key) }}
              onDragLeave={() => setDragOver(null)}
              onDrop={e => onDrop(e, col.key)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={cn("h-2.5 w-2.5 rounded-full", col.dotColor)} />
                  <span className="font-semibold text-sm">{col.label}</span>
                  <span className="bg-background border text-xs font-bold px-2 py-0.5 rounded-full">{colTasks(col.key).length}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openCreate(col.key)}><Plus className="h-4 w-4" /></Button>
              </div>

              <div className="space-y-3">
                {colTasks(col.key).map(task => {
                  const pr = TASK_PRIORITIES[task.priority as keyof typeof TASK_PRIORITIES]
                  const overdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== "DONE"
                  return (
                    <div key={task.id} draggable onDragStart={e => onDragStart(e, task.id)}
                      className="bg-background rounded-lg p-3 shadow-sm border group cursor-grab active:cursor-grabbing hover:shadow-md transition-all">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-1.5 flex-1 min-w-0">
                          <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0 opacity-40 group-hover:opacity-100" />
                          <p className={cn("text-sm font-medium leading-tight", task.status === "DONE" && "line-through opacity-60")}>{task.title}</p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <button onClick={() => openEdit(task)} className="text-muted-foreground hover:text-foreground"><Edit className="h-3.5 w-3.5" /></button>
                          <button onClick={() => del(task.id)} className="text-muted-foreground hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </div>
                      {task.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2 ml-5">{task.description}</p>}
                      <div className="flex items-center gap-2 mt-2.5 ml-5 flex-wrap">
                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", pr?.color)}>{pr?.label}</span>
                        {task.deadline && <span className={cn("text-xs", overdue ? "text-red-500 font-medium" : "text-muted-foreground")}>{overdue?"⚠️ ":"📅 "}{formatDate(task.deadline)}</span>}
                      </div>
                      {task.project && <p className="text-xs text-muted-foreground mt-1.5 ml-5 truncate">📐 {task.project.name}</p>}
                      <div className="flex gap-1 mt-2 ml-5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {COLS.filter(c => c.key !== task.status).map(c => (
                          <button key={c.key} onClick={() => changeStatus(task.id, c.key)}
                            className="text-xs px-2 py-0.5 rounded bg-muted hover:bg-muted/80 transition-colors">→ {c.label}</button>
                        ))}
                      </div>
                    </div>
                  )
                })}
                {colTasks(col.key).length === 0 && (
                  <div onClick={() => openCreate(col.key)} className="text-center py-10 text-muted-foreground cursor-pointer hover:bg-background/60 rounded-lg transition-colors">
                    <CheckSquare className="h-8 w-8 mx-auto mb-2 opacity-20" />
                    <p className="text-xs">Vazifa yo'q</p><p className="text-xs opacity-70">+ Qo'shish</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Vazifani tahrirlash" : "Yangi Vazifa"}</DialogTitle><DialogDescription>Vazifa ma'lumotlarini kiriting</DialogDescription></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5"><Label>Nomi *</Label><Input placeholder="Vazifa nomi..." value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} /></div>
            <div className="space-y-1.5"><Label>Tavsif</Label><Textarea rows={2} placeholder="Qo'shimcha ma'lumot..." value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Prioritet</Label>
                <Select value={form.priority} onValueChange={v => setForm(f => ({...f, priority:v}))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(TASK_PRIORITIES).map(([k,v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Holat</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({...f, status:v}))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(TASK_STATUSES).map(([k,v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5"><Label>Deadline</Label><Input type="date" value={form.deadline} onChange={e => setForm(f => ({...f, deadline: e.target.value}))} /></div>
            <div className="space-y-1.5"><Label>Loyiha (ixtiyoriy)</Label>
              <Select value={form.projectId} onValueChange={v => setForm(f => ({...f, projectId:v}))}>
                <SelectTrigger><SelectValue placeholder="Tanlang" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Yo'q —</SelectItem>
                  {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
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
