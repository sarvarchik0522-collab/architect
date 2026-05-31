"use client"
import { useState, useEffect, useCallback } from "react"
import { Plus, CheckSquare, Trash2, Edit, GripVertical } from "lucide-react"
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
  { key:"TODO",        label:"To Do",      emoji:"📋" },
  { key:"IN_PROGRESS", label:"Jarayonda",  emoji:"🔄" },
  { key:"DONE",        label:"Bajarildi",  emoji:"✅" },
]

const PRIORITY_COLORS = {
  HIGH:   { dot:"bg-[#ccc]",  badge:"bg-[#1a1a1a] text-[#ccc] border border-[#333]",  label:"Yuqori" },
  MEDIUM: { dot:"bg-[#666]",  badge:"bg-[#1a1a1a] text-[#666] border border-[#333]",  label:"O'rta" },
  LOW:    { dot:"bg-[#333]",  badge:"bg-[#1a1a1a] text-[#444] border border-[#2a2a2a]", label:"Past" },
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
    <div className="space-y-8 page-enter">

      {/* ── Header ── */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0d0d0d] border border-[#222] p-8 text-white">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-10 w-10 rounded-xl bg-[#1a1a1a] border border-[#333] flex items-center justify-center">
                <CheckSquare className="h-5 w-5 text-[#aaa]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Vazifalar — Kanban</h2>
                <p className="text-[#666] text-sm">{tasks.length} ta vazifa · {progress}% bajarildi</p>
              </div>
            </div>
          </div>
          <Button onClick={() => openCreate()} className="btn-primary gap-2 rounded-xl h-10 px-5">
            <Plus className="h-4 w-4" /> Yangi Vazifa
          </Button>
        </div>
        {/* Progress */}
        {tasks.length > 0 && (
          <div className="mt-5 relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#555]">{done}/{tasks.length} bajarildi</span>
              <span className="text-sm font-bold text-white">{progress}%</span>
            </div>
            <div className="progress-arch">
              <div style={{ width:`${progress}%` }} className="h-full bg-white rounded-full transition-all duration-500" />
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
                <div className="px-4 py-3.5 border-b border-[#222] bg-[#0d0d0d]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{col.emoji}</span>
                      <span className="font-bold text-sm text-[#aaa]">{col.label}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#1a1a1a] border border-[#333] text-[#666]">
                        {colItems.length}
                      </span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-[#1a1a1a]"
                      onClick={() => openCreate(col.key)}>
                      <Plus className="h-4 w-4 text-[#555]" />
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
                            <GripVertical className="h-4 w-4 text-[#333] mt-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <p className={cn(
                              "text-sm font-semibold leading-snug",
                              task.status === "DONE" ? "line-through text-[#444]" : "text-white"
                            )}>
                              {task.title}
                            </p>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            <button onClick={() => openEdit(task)} className="h-6 w-6 rounded-lg flex items-center justify-center hover:bg-[#1a1a1a] transition-colors">
                              <Edit className="h-3 w-3 text-[#555] hover:text-[#aaa]" />
                            </button>
                            <button onClick={() => del(task.id)} className="h-6 w-6 rounded-lg flex items-center justify-center hover:bg-[#1a1a1a] transition-colors">
                              <Trash2 className="h-3 w-3 text-[#555] hover:text-[#aaa]" />
                            </button>
                          </div>
                        </div>

                        {task.description && (
                          <p className="text-xs text-[#555] ml-6 line-clamp-2 mb-2">{task.description}</p>
                        )}

                        {/* Meta */}
                        <div className="flex items-center gap-2 ml-6 flex-wrap">
                          <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1", pr?.badge)}>
                            <span className={cn("h-1.5 w-1.5 rounded-full", pr?.dot)} />
                            {pr?.label}
                          </span>
                          {task.deadline && (
                            <span className={cn("text-xs font-medium", overdue ? "text-[#aaa]" : "text-[#555]")}>
                              {overdue ? "⚠️" : "📅"} {formatDate(task.deadline)}
                            </span>
                          )}
                        </div>

                        {task.project && (
                          <div className="mt-2.5 ml-6 pt-2.5 border-t border-[#222]">
                            <span className="text-xs text-[#666] font-medium truncate block">
                              📐 {task.project.name}
                            </span>
                          </div>
                        )}

                        {/* Quick move buttons */}
                        <div className="flex gap-1 mt-2 ml-6 opacity-0 group-hover:opacity-100 transition-opacity">
                          {COLS.filter(c => c.key !== task.status).map(c => (
                            <button key={c.key} onClick={() => changeStatus(task.id, c.key)}
                              className="text-xs px-2 py-0.5 rounded-lg bg-[#1a1a1a] border border-[#333] hover:bg-[#222] text-[#555] hover:text-[#aaa] transition-colors">
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
                      className="flex flex-col items-center justify-center py-12 text-[#333] cursor-pointer rounded-xl border-2 border-dashed border-[#222] hover:border-[#444] hover:text-[#555] transition-all group/empty">
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
        <DialogContent className="max-w-md rounded-2xl bg-[#111] border border-[#222]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">{editing ? "Vazifani tahrirlash" : "Yangi Vazifa"}</DialogTitle>
            <DialogDescription className="text-[#666]">Vazifa ma'lumotlarini kiriting</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5"><Label className="text-[#888]">Nomi *</Label>
              <Input placeholder="Vazifa nomi..." value={form.title} className="rounded-xl h-11 bg-[#0d0d0d] border-[#333] text-white"
                onChange={e => setForm(f => ({...f, title: e.target.value}))} /></div>
            <div className="space-y-1.5"><Label className="text-[#888]">Tavsif</Label>
              <Textarea rows={2} placeholder="Qo'shimcha ma'lumot..." value={form.description} className="rounded-xl resize-none bg-[#0d0d0d] border-[#333] text-white"
                onChange={e => setForm(f => ({...f, description: e.target.value}))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-[#888]">Prioritet</Label>
                <Select value={form.priority} onValueChange={v => setForm(f => ({...f, priority:v}))}>
                  <SelectTrigger className="rounded-xl h-11 bg-[#0d0d0d] border-[#333] text-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(TASK_PRIORITIES).map(([k,v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label className="text-[#888]">Holat</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({...f, status:v}))}>
                  <SelectTrigger className="rounded-xl h-11 bg-[#0d0d0d] border-[#333] text-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(TASK_STATUSES).map(([k,v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5"><Label className="text-[#888]">Deadline</Label>
              <Input type="date" value={form.deadline} className="rounded-xl h-11 bg-[#0d0d0d] border-[#333] text-white"
                onChange={e => setForm(f => ({...f, deadline: e.target.value}))} /></div>
            <div className="space-y-1.5"><Label className="text-[#888]">Loyiha (ixtiyoriy)</Label>
              <Select value={form.projectId} onValueChange={v => setForm(f => ({...f, projectId:v}))}>
                <SelectTrigger className="rounded-xl h-11 bg-[#0d0d0d] border-[#333] text-white"><SelectValue placeholder="Tanlang" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Yo'q —</SelectItem>
                  {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
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
