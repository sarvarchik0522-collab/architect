"use client"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, ChevronRight } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { cn, formatDate, formatCurrency, PROJECT_STATUSES } from "@/lib/utils"

interface Project {
  id:string; name:string; address:string|null; phone:string|null
  startDate:string|null; deadline:string|null; status:string
  description:string|null; budget:number|null
  client:{ id:string; name:string }|null
  _count:{ files:number; notes:number; tasks:number }
}

const EMPTY = { name:"", clientId:"none", phone:"", email:"", address:"",
  startDate:"", deadline:"", status:"NEW", description:"", budget:"" }

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
    const url = filter !== "ALL" ? `/api/projects?status=${filter}` : "/api/projects"
    setProjects(await fetch(url).then(r => r.json()))
    setLoading(false)
  }, [filter])

  useEffect(() => { load() }, [load])
  useEffect(() => { fetch("/api/clients").then(r=>r.json()).then(setClients) }, [])

  const openCreate = () => { setEditing(null); setForm(EMPTY); setOpen(true) }
  const openEdit = (p:Project) => {
    setEditing(p)
    setForm({ name:p.name, clientId:p.client?.id??"none", phone:p.phone??"", email:"",
      address:p.address??"", startDate:p.startDate?p.startDate.split("T")[0]:"",
      deadline:p.deadline?p.deadline.split("T")[0]:"", status:p.status,
      description:p.description??"", budget:p.budget?String(p.budget):"" })
    setOpen(true)
  }

  const save = async () => {
    if (!form.name.trim()) return toast({variant:"destructive",title:"Loyiha nomi kerak"})
    setSaving(true)
    try {
      const res = await fetch(editing?`/api/projects/${editing.id}`:"/api/projects", {
        method:editing?"PUT":"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({...form, clientId:form.clientId==="none"?null:form.clientId||null,
          budget:form.budget?Number(form.budget):null, startDate:form.startDate||null, deadline:form.deadline||null})
      })
      if (!res.ok) throw new Error()
      toast({title: editing?"Yangilandi":"Yaratildi"}); setOpen(false); load()
    } catch { toast({variant:"destructive",title:"Xatolik"}) }
    finally { setSaving(false) }
  }

  const del = async (id:string) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return
    await fetch(`/api/projects/${id}`,{method:"DELETE"})
    toast({title:"O'chirildi"}); load()
  }

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.client?.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5" style={{color:"#f0f0f0"}}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black tracking-tight">Loyihalar</h2>
          <p style={{fontSize:12,color:"#555"}}>{projects.length} ta loyiha</p>
        </div>
        <button onClick={openCreate} className="btn-primary h-9 px-4 text-sm flex items-center gap-2">
          <Plus className="h-4 w-4"/> Yangi Loyiha
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{color:"#444"}}/>
          <input placeholder="Qidirish..." value={search} onChange={e=>setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-sm rounded"
            style={{background:"#111",border:"1px solid #222",color:"#f0f0f0",outline:"none"}}
            onFocus={e=>{e.target.style.borderColor="#444"}} onBlur={e=>{e.target.style.borderColor="#222"}}/>
        </div>
        <select value={filter} onChange={e=>setFilter(e.target.value)}
          className="h-9 px-3 text-sm rounded"
          style={{background:"#111",border:"1px solid #222",color:"#888",outline:"none"}}>
          <option value="ALL">Barchasi</option>
          {Object.entries(PROJECT_STATUSES).map(([k,v])=>(
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {/* Status chips */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(PROJECT_STATUSES).map(([k,v])=>{
          const cnt = projects.filter(p=>p.status===k).length
          if (!cnt) return null
          return (
            <button key={k} onClick={()=>setFilter(filter===k?"ALL":k)}
              className="px-3 py-1 rounded text-xs font-medium transition-all"
              style={{
                background: filter===k?"#333":"#111",
                border:`1px solid ${filter===k?"#555":"#1e1e1e"}`,
                color: filter===k?"#f0f0f0":"#555",
              }}>
              {v.label} {cnt}
            </button>
          )
        })}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3].map(i=><div key={i} className="skeleton h-44" style={{animationDelay:`${i*0.1}s`}}/>)}
        </div>
      ) : filtered.length===0 ? (
        <div className="flex flex-col items-center justify-center py-20" style={{color:"#444"}}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mb-4 opacity-30">
            <rect x="6" y="14" width="36" height="28" stroke="#888" strokeWidth="1.2"/>
            <path d="M6 14 L24 4 L42 14" stroke="#888" strokeWidth="1.2"/>
            {[12,21,30].map(x=>[18,26].map(y=>(
              <rect key={`${x}${y}`} x={x} y={y} width="7" height="5" stroke="#666" strokeWidth="0.8" fill="none"/>
            )))}
          </svg>
          <p className="text-base font-semibold" style={{color:"#666"}}>Loyiha topilmadi</p>
          <button onClick={openCreate} className="btn-ghost mt-4 h-9 px-4 text-sm flex items-center gap-2">
            <Plus className="h-4 w-4"/> Yaratish
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p,i)=>{
            const s = PROJECT_STATUSES[p.status as keyof typeof PROJECT_STATUSES]
            const ov = p.deadline && new Date(p.deadline)<new Date() && p.status!=="COMPLETED"
            return (
              <div key={p.id} className="arch-card arch-card-lift animate-card" style={{animationDelay:`${i*0.06}s`}}>
                {/* Top line */}
                <div style={{height:1,background: p.status==="COMPLETED"?"#333":"#222"}}/>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <Link href={`/projects/${p.id}`} className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm leading-tight line-clamp-2 transition-colors"
                        style={{color:"#f0f0f0"}}>
                        {p.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-xs px-2 py-0.5 rounded font-medium"
                        style={{background:"#1a1a1a",color:"#888",border:"1px solid #2a2a2a"}}>
                        {s?.label}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="h-7 w-7 rounded flex items-center justify-center transition-colors hover:bg-[#1a1a1a]"
                            style={{color:"#444"}}>
                            <MoreVertical className="h-3.5 w-3.5"/>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded"
                          style={{background:"#111",border:"1px solid #222",color:"#f0f0f0"}}>
                          <DropdownMenuItem onClick={()=>openEdit(p)}
                            className="text-sm cursor-pointer rounded"
                            style={{color:"#ccc"}}>
                            <Edit className="h-3.5 w-3.5 mr-2"/> Tahrirlash
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={()=>del(p.id)}
                            className="text-sm cursor-pointer rounded"
                            style={{color:"#888"}}>
                            <Trash2 className="h-3.5 w-3.5 mr-2"/> O'chirish
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {p.client && (
                      <p className="text-xs flex items-center gap-1.5" style={{color:"#555"}}>
                        <span>👤</span> {p.client.name}
                      </p>
                    )}
                    {p.deadline && (
                      <p className="text-xs flex items-center gap-1.5"
                        style={{color: ov?"#888":"#555"}}>
                        <span>{ov?"⚠":"📅"}</span> {formatDate(p.deadline)}
                      </p>
                    )}
                    {p.budget && (
                      <p className="text-xs font-semibold" style={{color:"#aaa"}}>
                        {formatCurrency(p.budget)}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3"
                    style={{borderTop:"1px solid #1a1a1a"}}>
                    <div className="flex gap-3 text-xs" style={{color:"#444"}}>
                      <span>📁 {p._count.files}</span>
                      <span>📝 {p._count.notes}</span>
                      <span>✅ {p._count.tasks}</span>
                    </div>
                    <Link href={`/projects/${p.id}`}>
                      <span className="text-xs flex items-center gap-1 transition-colors"
                        style={{color:"#555"}}>
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

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded"
          style={{background:"#0f0f0f",border:"1px solid #222",color:"#f0f0f0"}}>
          <DialogHeader>
            <DialogTitle style={{color:"#f0f0f0",fontWeight:700}}>
              {editing?"Loyihani tahrirlash":"Yangi Loyiha"}
            </DialogTitle>
            <DialogDescription style={{color:"#555"}}>Ma'lumotlarni to'ldiring</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            {[
              {field:"name",      label:"Nomi *",       ph:"Loyiha nomi",      span:2},
              {field:"phone",     label:"Telefon",       ph:"+998 90 000 00 00",span:1},
              {field:"email",     label:"Email",         ph:"email@example.com",span:1},
              {field:"address",   label:"Manzil",        ph:"Toshkent, ...",    span:2},
              {field:"startDate", label:"Boshlanish",    ph:"",type:"date",      span:1},
              {field:"deadline",  label:"Deadline",      ph:"",type:"date",      span:1},
              {field:"budget",    label:"Byudjet (so'm)",ph:"0",type:"number",   span:2},
            ].map(f=>(
              <div key={f.field} className={`space-y-1.5${f.span===2?" sm:col-span-2":""}`}>
                <label className="text-xs font-semibold uppercase tracking-wider" style={{color:"#555"}}>
                  {f.label}
                </label>
                <input type={f.type||"text"} placeholder={f.ph}
                  value={(form as any)[f.field]}
                  onChange={e=>setForm(prev=>({...prev,[f.field]:e.target.value}))}
                  className="w-full h-10 px-3 text-sm rounded"
                  style={{background:"#0d0d0d",border:"1px solid #222",color:"#f0f0f0",outline:"none"}}
                  onFocus={e=>{e.target.style.borderColor="#555"}}
                  onBlur={e=>{e.target.style.borderColor="#222"}}/>
              </div>
            ))}
            {/* Mijoz select */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{color:"#555"}}>
                Mijoz
              </label>
              <select value={form.clientId} onChange={e=>setForm(f=>({...f,clientId:e.target.value}))}
                className="w-full h-10 px-3 text-sm rounded"
                style={{background:"#0d0d0d",border:"1px solid #222",color:"#888",outline:"none"}}>
                <option value="none">— Yo'q —</option>
                {clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            {/* Holat */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{color:"#555"}}>
                Holat
              </label>
              <select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}
                className="w-full h-10 px-3 text-sm rounded"
                style={{background:"#0d0d0d",border:"1px solid #222",color:"#888",outline:"none"}}>
                {Object.entries(PROJECT_STATUSES).map(([k,v])=>(
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            {/* Description */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{color:"#555"}}>
                Tavsif
              </label>
              <textarea rows={2} placeholder="Loyiha haqida..."
                value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}
                className="w-full px-3 py-2 text-sm rounded resize-none"
                style={{background:"#0d0d0d",border:"1px solid #222",color:"#f0f0f0",outline:"none"}}
                onFocus={e=>{e.target.style.borderColor="#555"}}
                onBlur={e=>{e.target.style.borderColor="#222"}}/>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button onClick={()=>setOpen(false)} className="btn-ghost h-9 px-4 text-sm">Bekor</button>
            <button onClick={save} disabled={saving} className="btn-primary h-9 px-4 text-sm">
              {saving?"Saqlanmoqda...":editing?"Saqlash":"Yaratish"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
