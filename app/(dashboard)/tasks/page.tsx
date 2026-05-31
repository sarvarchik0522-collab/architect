"use client"
import { useState, useEffect, useCallback } from "react"
import { Plus, Trash2, Edit, GripVertical } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { cn, formatDate, TASK_PRIORITIES, TASK_STATUSES } from "@/lib/utils"

interface Task {
  id:string; title:string; description:string|null
  deadline:string|null; priority:string; status:string
  project:{ id:string; name:string }|null
}

const COLS = [
  { key:"TODO",        label:"Bajarilmagan" },
  { key:"IN_PROGRESS", label:"Jarayonda"    },
  { key:"DONE",        label:"Bajarildi"    },
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
    setTasks(await fetch("/api/tasks").then(r=>r.json()))
    setLoading(false)
  }, [])

  useEffect(()=>{ load() },[load])
  useEffect(()=>{
    fetch("/api/projects").then(r=>r.json()).then(d=>setProjects(d.map((p:any)=>({id:p.id,name:p.name}))))
  },[])

  const openCreate = (status="TODO") => { setEditing(null); setForm({...EMPTY,status}); setOpen(true) }
  const openEdit   = (t:Task) => {
    setEditing(t)
    setForm({title:t.title,description:t.description??"",
      deadline:t.deadline?t.deadline.split("T")[0]:"",
      priority:t.priority,status:t.status,projectId:t.project?.id??"none"})
    setOpen(true)
  }

  const save = async () => {
    if (!form.title.trim()) return toast({variant:"destructive",title:"Nomi kerak"})
    setSaving(true)
    try {
      await fetch(editing?`/api/tasks/${editing.id}`:"/api/tasks",{
        method:editing?"PUT":"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({...form,projectId:form.projectId==="none"?null:form.projectId||null,deadline:form.deadline||null})
      })
      toast({title:editing?"Yangilandi":"Yaratildi"}); setOpen(false); load()
    } catch { toast({variant:"destructive",title:"Xatolik"}) }
    finally { setSaving(false) }
  }

  const del = async (id:string) => {
    await fetch(`/api/tasks/${id}`,{method:"DELETE"})
    toast({title:"O'chirildi"}); load()
  }

  const changeStatus = async (id:string, status:string) => {
    await fetch(`/api/tasks/${id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({status})})
    load()
  }

  const onDragStart = (e:React.DragEvent, id:string) => e.dataTransfer.setData("taskId",id)
  const onDrop = async (e:React.DragEvent, status:string) => {
    e.preventDefault(); setDragOver(null)
    const id = e.dataTransfer.getData("taskId")
    const task = tasks.find(t=>t.id===id)
    if (!task||task.status===status) return
    await changeStatus(id,status)
  }

  const colTasks  = (key:string) => tasks.filter(t=>t.status===key)
  const done      = tasks.filter(t=>t.status==="DONE").length
  const progress  = tasks.length ? Math.round((done/tasks.length)*100) : 0

  return (
    <div className="space-y-5" style={{color:"#f0f0f0"}}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black tracking-tight">Vazifalar</h2>
          <p style={{fontSize:12,color:"#555"}}>{tasks.length} ta · {progress}% bajarildi</p>
        </div>
        <button onClick={()=>openCreate()} className="btn-primary h-9 px-4 text-sm flex items-center gap-2">
          <Plus className="h-4 w-4"/> Yangi Vazifa
        </button>
      </div>

      {/* Progress */}
      {tasks.length>0&&(
        <div>
          <div className="h-px rounded-full overflow-hidden" style={{background:"#1a1a1a"}}>
            <div className="progress-arch" style={{width:`${progress}%`}}/>
          </div>
          <p className="text-xs mt-1" style={{color:"#444"}}>{done}/{tasks.length}</p>
        </div>
      )}

      {/* Kanban */}
      {loading ? (
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i=><div key={i} className="skeleton h-64"/>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLS.map(col=>{
            const items = colTasks(col.key)
            return (
              <div key={col.key}
                className={cn("kanban-col min-h-[400px]",dragOver===col.key&&"drag-over")}
                onDragOver={e=>{e.preventDefault();setDragOver(col.key)}}
                onDragLeave={()=>setDragOver(null)}
                onDrop={e=>onDrop(e,col.key)}>

                {/* Col header */}
                <div className="flex items-center justify-between px-4 py-3"
                  style={{borderBottom:"1px solid #1e1e1e"}}>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full"
                      style={{background:col.key==="DONE"?"#888":col.key==="IN_PROGRESS"?"#aaa":"#444"}}/>
                    <span className="text-sm font-semibold" style={{color:"#ccc"}}>{col.label}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded"
                      style={{background:"#1a1a1a",color:"#555"}}>{items.length}</span>
                  </div>
                  <button onClick={()=>openCreate(col.key)} className="h-7 w-7 rounded flex items-center justify-center hover:bg-[#1e1e1e]"
                    style={{color:"#444"}}>
                    <Plus className="h-4 w-4"/>
                  </button>
                </div>

                {/* Tasks */}
                <div className="p-3 space-y-2.5">
                  {items.map(task=>{
                    const ov = task.deadline&&new Date(task.deadline)<new Date()&&task.status!=="DONE"
                    return (
                      <div key={task.id} draggable
                        onDragStart={e=>onDragStart(e,task.id)}
                        className="task-card p-3 group">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            <GripVertical className="h-4 w-4 flex-shrink-0 mt-0.5 opacity-20 group-hover:opacity-60"
                              style={{color:"#666"}}/>
                            <p className={cn("text-sm font-medium leading-snug",task.status==="DONE"&&"line-through opacity-40")}
                              style={{color:"#ddd"}}>{task.title}</p>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            <button onClick={()=>openEdit(task)} className="h-5 w-5 rounded flex items-center justify-center hover:bg-[#222]" style={{color:"#555"}}>
                              <Edit className="h-3 w-3"/>
                            </button>
                            <button onClick={()=>del(task.id)} className="h-5 w-5 rounded flex items-center justify-center hover:bg-[#222]" style={{color:"#555"}}>
                              <Trash2 className="h-3 w-3"/>
                            </button>
                          </div>
                        </div>

                        {task.description&&<p className="text-xs mt-1.5 ml-6 line-clamp-2" style={{color:"#555"}}>{task.description}</p>}

                        <div className="flex items-center gap-2 mt-2 ml-6 flex-wrap">
                          <span className="text-xs px-1.5 py-0.5 rounded"
                            style={{background:"#1a1a1a",border:"1px solid #222",
                              color:task.priority==="HIGH"?"#ccc":task.priority==="MEDIUM"?"#888":"#555"}}>
                            {task.priority==="HIGH"?"Yuqori":task.priority==="MEDIUM"?"O'rta":"Past"}
                          </span>
                          {task.deadline&&(
                            <span className="text-xs" style={{color:ov?"#aaa":"#444"}}>
                              {ov?"⚠ ":""}{formatDate(task.deadline)}
                            </span>
                          )}
                        </div>

                        {task.project&&<p className="text-xs mt-1.5 ml-6 truncate" style={{color:"#444"}}>
                          📐 {task.project.name}
                        </p>}

                        {/* Quick move */}
                        <div className="flex gap-1 mt-2 ml-6 opacity-0 group-hover:opacity-100 transition-opacity">
                          {COLS.filter(c=>c.key!==task.status).map(c=>(
                            <button key={c.key} onClick={()=>changeStatus(task.id,c.key)}
                              className="text-xs px-2 py-0.5 rounded transition-colors"
                              style={{background:"#1a1a1a",border:"1px solid #222",color:"#555"}}>
                              → {c.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                  {items.length===0&&(
                    <div onClick={()=>openCreate(col.key)}
                      className="flex flex-col items-center justify-center py-10 rounded cursor-pointer"
                      style={{border:"1px dashed #1e1e1e",color:"#333"}}>
                      <Plus className="h-6 w-6 mb-1"/>
                      <p className="text-xs">Qo'shish</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded"
          style={{background:"#0f0f0f",border:"1px solid #222",color:"#f0f0f0"}}>
          <DialogHeader>
            <DialogTitle style={{color:"#f0f0f0"}}>{editing?"Tahrirlash":"Yangi Vazifa"}</DialogTitle>
            <DialogDescription style={{color:"#555"}}>Ma'lumotlarni kiriting</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {[
              {field:"title",       label:"Nomi *",   ph:"Vazifa nomi",  type:"text"},
              {field:"deadline",    label:"Deadline", ph:"",             type:"date"},
            ].map(f=>(
              <div key={f.field} className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{color:"#555"}}>{f.label}</label>
                <input type={f.type} placeholder={f.ph} value={(form as any)[f.field]}
                  onChange={e=>setForm(prev=>({...prev,[f.field]:e.target.value}))}
                  className="w-full h-10 px-3 text-sm rounded"
                  style={{background:"#0d0d0d",border:"1px solid #222",color:"#f0f0f0",outline:"none"}}
                  onFocus={e=>{e.target.style.borderColor="#555"}}
                  onBlur={e=>{e.target.style.borderColor="#222"}}/>
              </div>
            ))}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{color:"#555"}}>Tavsif</label>
              <textarea rows={2} value={form.description}
                onChange={e=>setForm(f=>({...f,description:e.target.value}))}
                className="w-full px-3 py-2 text-sm rounded resize-none"
                style={{background:"#0d0d0d",border:"1px solid #222",color:"#f0f0f0",outline:"none"}}/>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                {field:"priority", label:"Prioritet", opts:{LOW:"Past",MEDIUM:"O'rta",HIGH:"Yuqori"}},
                {field:"status",   label:"Holat",      opts:{TODO:"Bajarilmagan",IN_PROGRESS:"Jarayonda",DONE:"Bajarildi"}},
              ].map(s=>(
                <div key={s.field} className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider" style={{color:"#555"}}>{s.label}</label>
                  <select value={(form as any)[s.field]} onChange={e=>setForm(f=>({...f,[s.field]:e.target.value}))}
                    className="w-full h-10 px-3 text-sm rounded"
                    style={{background:"#0d0d0d",border:"1px solid #222",color:"#888",outline:"none"}}>
                    {Object.entries(s.opts).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{color:"#555"}}>Loyiha</label>
              <select value={form.projectId} onChange={e=>setForm(f=>({...f,projectId:e.target.value}))}
                className="w-full h-10 px-3 text-sm rounded"
                style={{background:"#0d0d0d",border:"1px solid #222",color:"#888",outline:"none"}}>
                <option value="none">— Yo'q —</option>
                {projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button onClick={()=>setOpen(false)} className="btn-ghost h-9 px-4 text-sm">Bekor</button>
            <button onClick={save} disabled={saving} className="btn-primary h-9 px-4 text-sm">
              {saving?"...":editing?"Saqlash":"Yaratish"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
