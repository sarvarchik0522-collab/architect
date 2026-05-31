"use client"
import { useState, useEffect, useCallback } from "react"
import { Plus, CheckSquare, Trash2, Edit, GripVertical, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
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
  { key:"TODO",        label:"To Do",      emoji:"📋", color:"text-slate-600 dark:text-slate-300",  count_bg:"bg-slate-100 dark:bg-slate-800", header:"bg-slate-50 dark:bg-slate-900/80", border:"border-slate-200 dark:border-slate-700/80" },
  { key:"IN_PROGRESS", label:"Jarayonda",  emoji:"🔄", color:"text-blue-600 dark:text-blue-400",    count_bg:"bg-blue-100 dark:bg-blue-900/50",  header:"bg-blue-50/80 dark:bg-blue-950/40", border:"border-blue-200 dark:border-blue-800/60" },
  { key:"DONE",        label:"Bajarildi",  emoji:"✅", color:"text-emerald-600 dark:text-emerald-400", count_bg:"bg-emerald-100 dark:bg-emerald-900/50", header:"bg-emerald-50/80 dark:bg-emerald-950/40", border:"border-emerald-200 dark:border-emerald-800/60" },
]

const PRIORITY_COLORS = {
  HIGH:   { dot:"bg-red-500",    badge:"bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400",    label:"Yuqori" },
  MEDIUM: { dot:"bg-blue-500",   badge:"bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",  label:"O'rta" },
  LOW:    { dot:"bg-slate-400",  badge:"bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400", label:"Past" },
}

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
  const [dragId,   setDragId]   = useState<string|null>(null)
  const { toast } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    setTasks(await fetch("/api/tasks").then(r => r.json()))
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    fetch("/api/projects").then(r => r.json()).then(d => setProjects(d.map((p:any) => ({ id:p.id, name:p.name }))))
  }, [])

  const openCreate = (status = "TODO") => { setEditing(null); setForm({ ...EMPTY, status }); setOpen(true) }
  const openEdit = (t: Task) => {
    setEditing(t)
    setForm({ title:t.title, description:t.description??"",
      deadline: t.deadline ? t.deadline.split("T")[0] : "",
      priority:t.priority, status:t.status,
      projectId:t.project?.id??"none" })
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
      toast({ title: editing ? "Yangilandi ✓" : "Yaratildi ✓" }); setOpen(false); load()
    } catch { toast({ variant:"destructive", title:"Xatolik" }) }
    finally { setSaving(false) }
  }

  const del = async (id: string) => {
    await fetch(`/api/tasks/${id}`, { method:"DELETE" })
    toast({ title:"O'chirildi" }); load()
  }

  const changeStatus = async (id: string, status: string) => {
    await fetch(`/api/tasks/${id}`, {
      method:"PUT", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ status })
    })
    load()
  }

  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("taskId", id); setDragId(id)
  }
  const onDrop = async (e: React.DragEvent, status: string) => {
    e.preventDefault(); setDragOver(null); setDragId(null)
    const id = e.dataTransfer.getData("taskId")
    const task = tasks.find(t => t.id === id)
    if (!task || task.status === status) return
    await changeStatus(id, status)
  }

  const colTasks = (key: string) => tasks.filter(t => t.status === key)
  const done = tasks.filter(t => t.status === "DONE").length
  const progress = tasks.length ? Math.round((done / tasks.length) * 100) : 0

  return (
    <div className="space-y-8 page-enter arch-pattern">

      {/* ── Header ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 p-8 text-white">
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10 hidden lg:block pointer-events-none">
          <svg width="180" height="160" viewBox="0 0 180 160" className="animate-float-x">
            <rect x="10" y="10" width="50" height="60" rx="6" fill="none" stroke="white" strokeWidth="1.5"/>
            <rect x="70" y="10" width="50" height="60" rx="6" fill="none" stroke="white" strokeWidth="1.5"/>
            <rect x="130" y="10" width="50" height="60" rx="6" fill="none" stroke="white" strokeWidth="1.5"/>
            <rect x="10" y="80" width="50" height="40" rx="6" fill="white" opacity="0.2"/>
            <rect x="70" y="80" width="50" height="55" rx="6" fill="white" opacity="0.2"/>
            <rect x="70" y="80" width="50" height="30" rx="6" fill="white" opacity="0.3"/>
          </svg>
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-10 w-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center">
                <CheckSquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Vazifalar — Kanban</h2>
                <p className="text-slate-400 text-sm">{tasks.length} ta vazifa · {progress}% bajarildi</p>
              </div>
            </div>
          </div>
          <Button onClick={() => openCreate()} className="btn-primary-3d text-white gap-2 rounded-xl h-10 px-5">
            <Plus className="h-4 w-4" /> Yangi Vazifa
          </Button>
        </div>
        {/* Progress */}
        {tasks.length > 0 && (
          <div className="mt-5 relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">{done}/{tasks.length} bajarildi</span>
              <span className="text-sm font-bold text-white">{progress}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="progress-bar" style={{ width:`${progress}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* ── Kanban Board ── */}
      {loading ? (
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="skeleton h-72 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {COLS.map(col => {
            const colItems = colTasks(col.key)
            return (
              <div key={col.key}
                className={cn(
                  "kanban-col rounded-2xl overflow-hidden",
                  dragOver === col.key && "drag-over"
                )}
                onDragOver={e => { e.preventDefault(); setDragOver(col.key) }}
                onDragLeave={() => setDragOver(null)}
                onDrop={e => onDrop(e, col.key)}
              >
                {/* Column header */}
                <div className={cn("px-4 py-3.5 border-b", col.header, col.border)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{col.emoji}</span>
                      <span className={cn("font-bold text-sm", col.color)}>{col.label}</span>
                      <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", col.count_bg, col.color)}>
                        {colItems.length}
                      </span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-white/50 dark:hover:bg-white/10"
                      onClick={() => openCreate(col.key)}>
                      <Plus className="h-4 w-4 text-slate-500" />
                    </Button>
                  </div>
                </div>

                {/* Tasks */}
                <div className="p-3 space-y-3 min-h-[400px]">
                  {colItems.map((task, i) => {
                    const pr = PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS]
                    const overdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== "DONE"
                    const isDragging = dragId === task.id
                    return (
                      <div key={task.id} draggable
                        onDragStart={e => onDragStart(e, task.id)}
                        onDragEnd={() => setDragId(null)}
                        className={cn(
                          "task-card p-3.5 group",
                          isDragging && "opacity-50 rotate-2 scale-95"
                        )}>
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            <GripVertical className="h-4 w-4 text-slate-300 mt-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <p className={cn(
                              "text-sm font-semibold leading-snug",
                              task.status === "DONE" ? "line-through text-slate-400" : "text-slate-800 dark:text-white"
                            )}>
                              {task.title}
                            </p>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            <button onClick={() => openEdit(task)} className="h-6 w-6 rounded-lg flex items-center justify-center hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors">
                              <Edit className="h-3 w-3 text-slate-400 hover:text-blue-500" />
                            </button>
                            <button onClick={() => del(task.id)} className="h-6 w-6 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                              <Trash2 className="h-3 w-3 text-slate-400 hover:text-red-500" />
                            </button>
                          </div>
                        </div>

                        {task.description && (
                          <p className="text-xs text-slate-400 ml-6 line-clamp-2 mb-2">{task.description}</p>
                        )}

                        {/* Meta */}
                        <div className="flex items-center gap-2 ml-6 flex-wrap">
                          <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1", pr?.badge)}>
                            <span className={cn("h-1.5 w-1.5 rounded-full", pr?.dot)} />
                            {pr?.label}
                          </span>
                          {task.deadline && (
                            <span className={cn("text-xs font-medium", overdue ? "text-red-500" : "text-slate-400")}>
                              {overdue ? "⚠️" : "📅"} {formatDate(task.deadline)}
                            </span>
                          )}
                        </div>

                        {task.project && (
                          <div className="mt-2.5 ml-6 pt-2.5 border-t border-slate-100 dark:border-slate-700/50">
                            <span className="text-xs text-blue-500 dark:text-blue-400 font-medium truncate block">
                              📐 {task.project.name}
                            </span>
                          </div>
                        )}

                        {/* Quick move buttons */}
                        <div className="flex gap-1 mt-2 ml-6 opacity-0 group-hover:opacity-100 transition-opacity">
                          {COLS.filter(c => c.key !== task.status).map(c => (
                            <button key={c.key} onClick={() => changeStatus(task.id, c.key)}
                              className="text-xs px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-slate-500 hover:text-blue-600 transition-colors">
                              → {c.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })}

                  {/* Empty state */}
                  {colItems.length === 0 && (
                    <div onClick={() => openCreate(col.key)}
                      className="flex flex-col items-center justify-center py-12 text-slate-300 dark:text-slate-600 cursor-pointer rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-400 transition-all group/empty">
                      <Plus className="h-8 w-8 mb-2 group-hover/empty:scale-110 transition-transform" />
                      <p className="text-xs font-medium">Vazifa yo'q</p>
                      <p className="text-xs opacity-60">Qo'shish uchun bosing</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Dialog ── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{editing ? "Vazifani tahrirlash" : "Yangi Vazifa"}</DialogTitle>
            <DialogDescription>Vazifa ma'lumotlarini kiriting</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5"><Label>Nomi *</Label>
              <Input placeholder="Vazifa nomi..." value={form.title} className="rounded-xl h-11"
                onChange={e => setForm(f => ({...f, title: e.target.value}))} /></div>
            <div className="space-y-1.5"><Label>Tavsif</Label>
              <Textarea rows={2} placeholder="Qo'shimcha ma'lumot..." value={form.description} className="rounded-xl resize-none"
                onChange={e => setForm(f => ({...f, description: e.target.value}))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Prioritet</Label>
                <Select value={form.priority} onValueChange={v => setForm(f => ({...f, priority:v}))}>
                  <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(TASK_PRIORITIES).map(([k,v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Holat</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({...f, status:v}))}>
                  <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(TASK_STATUSES).map(([k,v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5"><Label>Deadline</Label>
              <Input type="date" value={form.deadline} className="rounded-xl h-11"
                onChange={e => setForm(f => ({...f, deadline: e.target.value}))} /></div>
            <div className="space-y-1.5"><Label>Loyiha (ixtiyoriy)</Label>
              <Select value={form.projectId} onValueChange={v => setForm(f => ({...f, projectId:v}))}>
                <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Tanlang" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Yo'q —</SelectItem>
                  {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl">Bekor</Button>
            <Button onClick={save} disabled={saving} className="btn-primary-3d text-white rounded-xl">
              {saving ? "Saqlanmoqda..." : editing ? "Saqlash" : "Yaratish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
