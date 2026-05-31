"use client"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Plus, Search, MoreVertical, Edit, Trash2, ChevronRight } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { cn, formatDate, formatCurrency, PROJECT_STATUSES } from "@/lib/utils"

interface Project {
  id:string; name:string; address:string|null; phone:string|null
  startDate:string|null; deadline:string|null; status:string
  description:string|null; budget:number|null
  client:{id:string;name:string}|null
  _count:{files:number;notes:number;tasks:number}
}
const EMPTY = {name:"",clientId:"none",phone:"",email:"",address:"",startDate:"",deadline:"",status:"NEW",description:"",budget:""}

const F = { c:"#1C1B18", c2:"#5A5650", c3:"#9A968E", bg:"#FFFFFF", bg2:"#F7F5F0", bd:"#E2DDD5", bd2:"#C8C2B8", gold:"#B8965A" }

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [clients,  setClients]  = useState<{id:string;name:string}[]>([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState("")
  const [filter,   setFilter]   = useState("ALL")
  const [open,     setOpen]     = useState(false)
  const [editing,  setEditing]  = useState<Project|null>(null)
  const [form,     setForm]     = useState(EMPTY)
  const [saving,   setSaving]   = useState(false)
  const { toast } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    const url = filter!=="ALL" ? `/api/projects?status=${filter}` : "/api/projects"
    setProjects(await fetch(url).then(r=>r.json()))
    setLoading(false)
  }, [filter])

  useEffect(()=>{ load() },[load])
  useEffect(()=>{ fetch("/api/clients").then(r=>r.json()).then(setClients) },[])

  const openCreate = () => { setEditing(null); setForm(EMPTY); setOpen(true) }
  const openEdit = (p:Project) => {
    setEditing(p)
    setForm({name:p.name,clientId:p.client?.id??"none",phone:p.phone??"",email:"",address:p.address??"",
      startDate:p.startDate?p.startDate.split("T")[0]:"",deadline:p.deadline?p.deadline.split("T")[0]:"",
      status:p.status,description:p.description??"",budget:p.budget?String(p.budget):""})
    setOpen(true)
  }
  const save = async () => {
    if (!form.name.trim()) return toast({variant:"destructive",title:"Nomi kerak"})
    setSaving(true)
    try {
      await fetch(editing?`/api/projects/${editing.id}`:"/api/projects",{
        method:editing?"PUT":"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({...form,clientId:form.clientId==="none"?null:form.clientId||null,
          budget:form.budget?Number(form.budget):null,startDate:form.startDate||null,deadline:form.deadline||null})
      })
      toast({title:editing?"Yangilandi":"Yaratildi"}); setOpen(false); load()
    } catch { toast({variant:"destructive",title:"Xatolik"}) }
    finally { setSaving(false) }
  }
  const del = async (id:string) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return
    await fetch(`/api/projects/${id}`,{method:"DELETE"})
    toast({title:"O'chirildi"}); load()
  }

  const filtered = projects.filter(p=>
    p.name.toLowerCase().includes(search.toLowerCase())||
    p.client?.name?.toLowerCase().includes(search.toLowerCase())
  )

  const inp = (field:string, ph:string, type="text", span=1) => (
    <div className={`space-y-1.5${span===2?" sm:col-span-2":""}`}>
      <label style={{fontSize:9, color:F.c3, fontWeight:600, letterSpacing:"0.14em", textTransform:"uppercase"}}>{ph}</label>
      <input type={type} placeholder={ph} value={(form as any)[field]}
        onChange={e=>setForm(prev=>({...prev,[field]:e.target.value}))}
        className="w-full h-10 px-3 text-sm" style={{background:F.bg2,border:`1px solid ${F.bd}`,borderRadius:3,color:F.c,outline:"none"}}
        onFocus={e=>{e.target.style.borderColor=F.bd2}} onBlur={e=>{e.target.style.borderColor=F.bd}}/>
    </div>
  )

  return (
    <div className="space-y-5" style={{color:F.c}}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight" style={{fontFamily:"'Playfair Display',serif"}}>Loyihalar</h2>
          <p style={{fontSize:12,color:F.c3}}>{projects.length} ta loyiha</p>
        </div>
        <button onClick={openCreate} className="btn-neo-dark h-9 px-4 text-sm flex items-center gap-2">
          <Plus className="h-4 w-4"/> Yangi Loyiha
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{color:F.c3}}/>
          <input placeholder="Qidirish..." value={search} onChange={e=>setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-sm" style={{background:F.bg,border:`1px solid ${F.bd}`,borderRadius:3,color:F.c,outline:"none"}}
            onFocus={e=>{e.target.style.borderColor=F.bd2}} onBlur={e=>{e.target.style.borderColor=F.bd}}/>
        </div>
        <select value={filter} onChange={e=>setFilter(e.target.value)}
          className="h-9 px-3 text-sm" style={{background:F.bg,border:`1px solid ${F.bd}`,borderRadius:3,color:F.c2,outline:"none"}}>
          <option value="ALL">Barchasi</option>
          {Object.entries(PROJECT_STATUSES).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* Status chips */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(PROJECT_STATUSES).map(([k,v])=>{
          const cnt=projects.filter(p=>p.status===k).length
          if (!cnt) return null
          return (
            <button key={k} onClick={()=>setFilter(filter===k?"ALL":k)}
              className="px-3 py-1 text-xs font-medium transition-all"
              style={{background:filter===k?F.c:F.bg,border:`1px solid ${filter===k?F.c:F.bd}`,
                color:filter===k?"#FFF":F.c2,borderRadius:3}}>
              {v.label} {cnt}
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3].map(i=><div key={i} className="skeleton-neo h-44" style={{animationDelay:`${i*0.1}s`}}/>)}
        </div>
      ) : filtered.length===0 ? (
        <div className="flex flex-col items-center py-20" style={{color:F.c3}}>
          <p className="font-semibold text-base" style={{color:F.c2}}>Loyiha topilmadi</p>
          <button onClick={openCreate} className="btn-neo-light mt-4 h-9 px-4 text-sm flex items-center gap-2">
            <Plus className="h-4 w-4"/> Yaratish
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p,i)=>{
            const s=PROJECT_STATUSES[p.status as keyof typeof PROJECT_STATUSES]
            const ov=p.deadline&&new Date(p.deadline)<new Date()&&p.status!=="COMPLETED"
            return (
              <div key={p.id} className="project-neo neo-card animate-card" style={{animationDelay:`${i*0.06}s`}}>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <Link href={`/projects/${p.id}`} className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm leading-tight line-clamp-2"
                        style={{color:F.c,fontFamily:"'Playfair Display',serif"}}>{p.name}</h3>
                    </Link>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-xs px-2 py-0.5 rounded"
                        style={{background:F.bg2,border:`1px solid ${F.bd}`,color:F.c2,fontSize:9}}>{s?.label}</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="h-7 w-7 rounded flex items-center justify-center hover:bg-[#F2F0EB] transition-colors"
                            style={{color:F.c3}}>
                            <MoreVertical className="h-3.5 w-3.5"/>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded"
                          style={{background:F.bg,border:`1px solid ${F.bd}`}}>
                          <DropdownMenuItem onClick={()=>openEdit(p)} style={{color:F.c2,cursor:"pointer"}}>
                            <Edit className="h-3.5 w-3.5 mr-2"/> Tahrirlash
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={()=>del(p.id)} style={{color:F.c3,cursor:"pointer"}}>
                            <Trash2 className="h-3.5 w-3.5 mr-2"/> O'chirish
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {p.client&&<p className="text-xs flex items-center gap-1.5" style={{color:F.c3}}>👤 {p.client.name}</p>}
                    {p.deadline&&<p className="text-xs flex items-center gap-1.5" style={{color:ov?F.c2:F.c3}}>
                      {ov?"⚠ ":""}📅 {formatDate(p.deadline)}</p>}
                    {p.budget&&<p className="text-xs font-semibold" style={{color:F.c}}>{formatCurrency(p.budget)}</p>}
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3" style={{borderTop:`1px solid ${F.bd}`}}>
                    <div className="flex gap-3 text-xs" style={{color:F.c3}}>
                      <span>📁 {p._count.files}</span>
                      <span>📝 {p._count.notes}</span>
                      <span>✅ {p._count.tasks}</span>
                    </div>
                    <Link href={`/projects/${p.id}`}>
                      <span className="text-xs flex items-center gap-1" style={{color:F.c3}}>
                        Ko'rish <ChevronRight className="h-3 w-3"/>
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded"
          style={{background:F.bg,border:`1px solid ${F.bd}`,color:F.c}}>
          <DialogHeader>
            <DialogTitle style={{color:F.c,fontFamily:"'Playfair Display',serif",fontWeight:700}}>
              {editing?"Tahrirlash":"Yangi Loyiha"}
            </DialogTitle>
            <DialogDescription style={{color:F.c3}}>Ma'lumotlarni to'ldiring</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            {inp("name","Nomi *","text",2)}
            {inp("phone","Telefon")}
            {inp("email","Email","email")}
            {inp("address","Manzil","text",2)}
            {inp("startDate","Boshlanish","date")}
            {inp("deadline","Deadline","date")}
            {inp("budget","Byudjet (so'm)","number",2)}
            <div className="space-y-1.5">
              <label style={{fontSize:9,color:F.c3,fontWeight:600,letterSpacing:"0.14em",textTransform:"uppercase"}}>Mijoz</label>
              <select value={form.clientId} onChange={e=>setForm(f=>({...f,clientId:e.target.value}))}
                className="w-full h-10 px-3 text-sm" style={{background:F.bg2,border:`1px solid ${F.bd}`,borderRadius:3,color:F.c2,outline:"none"}}>
                <option value="none">— Yo'q —</option>
                {clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label style={{fontSize:9,color:F.c3,fontWeight:600,letterSpacing:"0.14em",textTransform:"uppercase"}}>Holat</label>
              <select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}
                className="w-full h-10 px-3 text-sm" style={{background:F.bg2,border:`1px solid ${F.bd}`,borderRadius:3,color:F.c2,outline:"none"}}>
                {Object.entries(PROJECT_STATUSES).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <label style={{fontSize:9,color:F.c3,fontWeight:600,letterSpacing:"0.14em",textTransform:"uppercase"}}>Tavsif</label>
              <textarea rows={2} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}
                className="w-full px-3 py-2 text-sm resize-none"
                style={{background:F.bg2,border:`1px solid ${F.bd}`,borderRadius:3,color:F.c,outline:"none"}}/>
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
