"use client"
import { useState, useEffect, useCallback } from "react"
import { Plus, Trash2, Edit, GripVertical } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { cn, formatDate, TASK_PRIORITIES, TASK_STATUSES } from "@/lib/utils"

interface Task {
  id:string; title:string; description:string|null
  deadline:string|null; priority:string; status:string
  project:{id:string;name:string}|null
}
const COLS = [
  {key:"TODO",       label:"To Do",    bg:"#FAFAF8"},
  {key:"IN_PROGRESS",label:"Jarayonda",bg:"#F7F5F0"},
  {key:"DONE",       label:"Bajarildi",bg:"#F5F3EE"},
]
const EMPTY = {title:"",description:"",deadline:"",priority:"MEDIUM",status:"TODO",projectId:"none"}
const F = {c:"#1C1B18",c2:"#5A5650",c3:"#9A968E",bg:"#FFFFFF",bg2:"#F7F5F0",bd:"#E2DDD5",bd2:"#C8C2B8"}

export default function TasksPage() {
  const [tasks,    setTasks]    = useState<Task[]>([])
  const [projects, setProjects] = useState<{id:string;name:string}[]>([])
  const [loading,  setLoading]  = useState(true)
  const [open,     setOpen]     = useState(false)
  const [editing,  setEditing]  = useState<Task|null>(null)
  const [form,     setForm]     = useState(EMPTY)
  const [saving,   setSaving]   = useState(false)
  const [dragOver, setDragOver] = useState<string|null>(null)
  const { toast } = useToast()

  const load = useCallback(async()=>{
    setLoading(true)
    setTasks(await fetch("/api/tasks").then(r=>r.json()))
    setLoading(false)
  },[])
  useEffect(()=>{load()},[load])
  useEffect(()=>{ fetch("/api/projects").then(r=>r.json()).then(d=>setProjects(d.map((p:any)=>({id:p.id,name:p.name})))) },[])

  const openCreate=(status="TODO")=>{setEditing(null);setForm({...EMPTY,status});setOpen(true)}
  const openEdit=(t:Task)=>{
    setEditing(t)
    setForm({title:t.title,description:t.description??"",
      deadline:t.deadline?t.deadline.split("T")[0]:"",
      priority:t.priority,status:t.status,projectId:t.project?.id??"none"})
    setOpen(true)
  }
  const save=async()=>{
    if (!form.title.trim()) return toast({variant:"destructive",title:"Nomi kerak"})
    setSaving(true)
    try {
      await fetch(editing?`/api/tasks/${editing.id}`:"/api/tasks",{
        method:editing?"PUT":"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({...form,projectId:form.projectId==="none"?null:form.projectId||null,deadline:form.deadline||null})
      })
      toast({title:editing?"Yangilandi":"Yaratildi"});setOpen(false);load()
    } catch { toast({variant:"destructive",title:"Xatolik"}) }
    finally { setSaving(false) }
  }
  const del=async(id:string)=>{
    await fetch(`/api/tasks/${id}`,{method:"DELETE"})
    toast({title:"O'chirildi"});load()
  }
  const changeStatus=async(id:string,status:string)=>{
    await fetch(`/api/tasks/${id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({status})})
    load()
  }
  const onDragStart=(e:React.DragEvent,id:string)=>e.dataTransfer.setData("taskId",id)
  const onDrop=async(e:React.DragEvent,status:string)=>{
    e.preventDefault();setDragOver(null)
    const id=e.dataTransfer.getData("taskId")
    const task=tasks.find(t=>t.id===id)
    if (!task||task.status===status) return
    await changeStatus(id,status)
  }

  const colTasks=(key:string)=>tasks.filter(t=>t.status===key)
  const done=tasks.filter(t=>t.status==="DONE").length
  const pct=tasks.length?Math.round((done/tasks.length)*100):0

  return (
    <div className="space-y-5" style={{color:F.c}}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight" style={{fontFamily:"'Playfair Display',serif"}}>Vazifalar</h2>
          <p style={{fontSize:12,color:F.c3}}>{tasks.length} ta · {pct}% bajarildi</p>
        </div>
        <button onClick={()=>openCreate()} className="btn-neo-dark h-9 px-4 text-sm flex items-center gap-2">
          <Plus className="h-4 w-4"/> Yangi Vazifa
        </button>
      </div>

      {tasks.length>0&&(
        <div>
          <div className="h-px rounded-full overflow-hidden" style={{background:F.bd}}>
            <div className="progress-neo" style={{width:`${pct}%`}}/>
          </div>
          <p className="text-xs mt-1" style={{color:F.c3}}>{done}/{tasks.length}</p>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i=><div key={i} className="skeleton-neo h-64"/>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLS.map(col=>{
            const items=colTasks(col.key)
            return (
              <div key={col.key}
                className={cn("kanban-neo min-h-[400px]",dragOver===col.key&&"drag-over")}
                onDragOver={e=>{e.preventDefault();setDragOver(col.key)}}
                onDragLeave={()=>setDragOver(null)}
                onDrop={e=>onDrop(e,col.key)}>
                <div className="flex items-center justify-between px-4 py-3"
                  style={{borderBottom:`1px solid ${F.bd}`,background:col.bg}}>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full"
                      style={{background:col.key==="DONE"?"#1C1B18":col.key==="IN_PROGRESS"?"#5A5650":"#C8C2B8"}}/>
                    <span className="text-sm font-semibold" style={{color:F.c}}>{col.label}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded"
                      style={{background:F.bd,color:F.c3,fontSize:9}}>{items.length}</span>
                  </div>
                  <button onClick={()=>openCreate(col.key)}
                    className="h-7 w-7 rounded flex items-center justify-center hover:bg-[#EDE9E1] transition-colors"
                    style={{color:F.c3}}>
                    <Plus className="h-4 w-4"/>
                  </button>
                </div>
                <div className="p-3 space-y-2.5">
                  {items.map(task=>{
                    const ov=task.deadline&&new Date(task.deadline)<new Date()&&task.status!=="DONE"
                    return (
                      <div key={task.id} draggable onDragStart={e=>onDragStart(e,task.id)}
                        className="task-neo p-3.5 group">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            <GripVertical className="h-4 w-4 flex-shrink-0 mt-0.5 opacity-20 group-hover:opacity-60"
                              style={{color:F.c3}}/>
                            <p className={cn("text-sm font-medium leading-snug",task.status==="DONE"&&"line-through opacity-40")}
                              style={{color:F.c}}>{task.title}</p>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            <button onClick={()=>openEdit(task)} className="h-6 w-6 rounded flex items-center justify-center hover:bg-[#F2F0EB]" style={{color:F.c3}}>
                              <Edit className="h-3 w-3"/>
                            </button>
                            <button onClick={()=>del(task.id)} className="h-6 w-6 rounded flex items-center justify-center hover:bg-[#F2F0EB]" style={{color:F.c3}}>
                              <Trash2 className="h-3 w-3"/>
                            </button>
                          </div>
                        </div>
                        {task.description&&<p className="text-xs mt-1.5 ml-6 line-clamp-2" style={{color:F.c3}}>{task.description}</p>}
                        <div className="flex items-center gap-2 mt-2.5 ml-6 flex-wrap">
                          <span className="text-xs px-2 py-0.5 rounded"
                            style={{background:F.bg2,border:`1px solid ${F.bd}`,
                              color:task.priority==="HIGH"?F.c:task.priority==="MEDIUM"?F.c2:F.c3,
                              fontSize:9,fontWeight:600}}>
                            {task.priority==="HIGH"?"Yuqori":task.priority==="MEDIUM"?"O'rta":"Past"}
                          </span>
                          {task.deadline&&<span className="text-xs" style={{color:ov?F.c2:F.c3}}>
                            {ov?"⚠ ":""}{formatDate(task.deadline)}</span>}
                        </div>
                        {task.project&&<p className="text-xs mt-1.5 ml-6 truncate" style={{color:F.c3}}>📐 {task.project.name}</p>}
                        <div className="flex gap-1 mt-2 ml-6 opacity-0 group-hover:opacity-100 transition-opacity">
                          {COLS.filter(c=>c.key!==task.status).map(c=>(
                            <button key={c.key} onClick={()=>changeStatus(task.id,c.key)}
                              className="text-xs px-2 py-0.5 rounded transition-colors hover:bg-[#EDE9E1]"
                              style={{background:F.bg2,border:`1px solid ${F.bd}`,color:F.c3}}>
                              → {c.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                  {items.length===0&&(
                    <div onClick={()=>openCreate(col.key)}
                      className="flex flex-col items-center justify-center py-10 rounded cursor-pointer hover:bg-[#F7F5F0] transition-colors"
                      style={{border:`1px dashed ${F.bd}`,color:F.c3}}>
                      <Plus className="h-5 w-5 mb-1"/>
                      <p className="text-xs">Qo'shish</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded" style={{background:F.bg,border:`1px solid ${F.bd}`,color:F.c}}>
          <DialogHeader>
            <DialogTitle style={{color:F.c,fontFamily:"'Playfair Display',serif"}}>{editing?"Tahrirlash":"Yangi Vazifa"}</DialogTitle>
            <DialogDescription style={{color:F.c3}}>Ma'lumotlarni kiriting</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {[{f:"title",l:"Nomi *",t:"text"},{f:"deadline",l:"Deadline",t:"date"}].map(x=>(
              <div key={x.f} className="space-y-1.5">
                <label style={{fontSize:9,color:F.c3,fontWeight:600,letterSpacing:"0.14em",textTransform:"uppercase"}}>{x.l}</label>
                <input type={x.t} value={(form as any)[x.f]} onChange={e=>setForm(p=>({...p,[x.f]:e.target.value}))}
                  className="w-full h-10 px-3 text-sm"
                  style={{background:F.bg2,border:`1px solid ${F.bd}`,borderRadius:3,color:F.c,outline:"none"}}
                  onFocus={e=>{e.target.style.borderColor=F.bd2}} onBlur={e=>{e.target.style.borderColor=F.bd}}/>
              </div>
            ))}
            <div className="space-y-1.5">
              <label style={{fontSize:9,color:F.c3,fontWeight:600,letterSpacing:"0.14em",textTransform:"uppercase"}}>Tavsif</label>
              <textarea rows={2} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}
                className="w-full px-3 py-2 text-sm resize-none"
                style={{background:F.bg2,border:`1px solid ${F.bd}`,borderRadius:3,color:F.c,outline:"none"}}/>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[{f:"priority",l:"Prioritet",opts:{LOW:"Past",MEDIUM:"O'rta",HIGH:"Yuqori"}},
                {f:"status",  l:"Holat",    opts:{TODO:"Bajarilmagan",IN_PROGRESS:"Jarayonda",DONE:"Bajarildi"}}].map(s=>(
                <div key={s.f} className="space-y-1.5">
                  <label style={{fontSize:9,color:F.c3,fontWeight:600,letterSpacing:"0.14em",textTransform:"uppercase"}}>{s.l}</label>
                  <select value={(form as any)[s.f]} onChange={e=>setForm(f=>({...f,[s.f]:e.target.value}))}
                    className="w-full h-10 px-3 text-sm"
                    style={{background:F.bg2,border:`1px solid ${F.bd}`,borderRadius:3,color:F.c2,outline:"none"}}>
                    {Object.entries(s.opts).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div className="space-y-1.5">
              <label style={{fontSize:9,color:F.c3,fontWeight:600,letterSpacing:"0.14em",textTransform:"uppercase"}}>Loyiha</label>
              <select value={form.projectId} onChange={e=>setForm(f=>({...f,projectId:e.target.value}))}
                className="w-full h-10 px-3 text-sm"
                style={{background:F.bg2,border:`1px solid ${F.bd}`,borderRadius:3,color:F.c2,outline:"none"}}>
                <option value="none">— Yo'q —</option>
                {projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button onClick={()=>setOpen(false)} className="btn-neo-light h-9 px-4 text-sm">Bekor</button>
            <button onClick={save} disabled={saving} className="btn-neo-dark h-9 px-4 text-sm">
              {saving?"...":editing?"Saqlash":"Yaratish"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
