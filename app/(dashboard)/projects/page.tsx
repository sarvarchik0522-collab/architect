"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { Plus, Search, MoreVertical, Edit, Trash2, ChevronRight } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { cn, formatDate, formatCurrency, PROJECT_STATUSES } from "@/lib/utils"

const C = { ink:"var(--ink)", ink2:"var(--ink2)", ink3:"var(--ink3)", cream:"var(--cream)", cream2:"var(--cream2)", stone:"var(--stone)", stone2:"var(--stone2)", gold:"var(--gold)", white:"var(--white)", border:"rgba(200,168,112,.14)" }

interface Project {
  id:string; name:string; address:string|null; phone:string|null
  startDate:string|null; deadline:string|null; status:string
  description:string|null; budget:number|null
  client:{id:string;name:string}|null
  _count:{files:number;notes:number;tasks:number}
}

const EMPTY = {name:"",clientId:"none",phone:"",email:"",address:"",startDate:"",deadline:"",status:"NEW",description:"",budget:""}

function TiltCard({ children, className="" }: { children:React.ReactNode; className?:string }) {
  const ref = useRef<HTMLDivElement>(null)
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el=ref.current; if (!el) return
    const r=el.getBoundingClientRect()
    const dx=(e.clientX-r.left-r.width/2)/(r.width/2)
    const dy=(e.clientY-r.top-r.height/2)/(r.height/2)
    el.style.transform=`perspective(900px) rotateX(${-dy*7}deg) rotateY(${dx*7}deg) translateY(-6px)`
    el.style.setProperty("--mx",`${(dx+1)/2*100}%`)
    el.style.setProperty("--my",`${(dy+1)/2*100}%`)
  }
  const onLeave=()=>{ if(ref.current) ref.current.style.transform="" }
  return (
    <div ref={ref} className={cn("project-card-3d card-3d-tilt",className)}
      onMouseMove={onMove} onMouseLeave={onLeave}
      style={{ transition:"transform .12s ease-out, box-shadow .45s" }}>
      {children}
    </div>
  )
}

export default function ProjectsPage() {
  const [projects,setProjects]=useState<Project[]>([])
  const [clients, setClients] =useState<{id:string;name:string}[]>([])
  const [loading, setLoading] =useState(true)
  const [search,  setSearch]  =useState("")
  const [filter,  setFilter]  =useState("ALL")
  const [open,    setOpen]    =useState(false)
  const [editing, setEditing] =useState<Project|null>(null)
  const [form,    setForm]    =useState(EMPTY)
  const [saving,  setSaving]  =useState(false)
  const { toast }=useToast()

  const load=useCallback(async()=>{
    setLoading(true)
    setProjects(await fetch(filter!=="ALL"?`/api/projects?status=${filter}`:"/api/projects").then(r=>r.json()))
    setLoading(false)
  },[filter])
  useEffect(()=>{load()},[load])
  useEffect(()=>{fetch("/api/clients").then(r=>r.json()).then(setClients)},[])

  const openCreate=()=>{setEditing(null);setForm(EMPTY);setOpen(true)}
  const openEdit=(p:Project)=>{
    setEditing(p)
    setForm({name:p.name,clientId:p.client?.id??"none",phone:p.phone??"",email:"",address:p.address??"",
      startDate:p.startDate?p.startDate.split("T")[0]:"",deadline:p.deadline?p.deadline.split("T")[0]:"",
      status:p.status,description:p.description??"",budget:p.budget?String(p.budget):""})
    setOpen(true)
  }
  const save=async()=>{
    if (!form.name.trim()) return toast({variant:"destructive",title:"Nomi kerak"})
    setSaving(true)
    try {
      await fetch(editing?`/api/projects/${editing.id}`:"/api/projects",{
        method:editing?"PUT":"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({...form,clientId:form.clientId==="none"?null:form.clientId||null,
          budget:form.budget?Number(form.budget):null,startDate:form.startDate||null,deadline:form.deadline||null})
      })
      toast({title:editing?"Yangilandi ✓":"Yaratildi ✓"});setOpen(false);load()
    } catch { toast({variant:"destructive",title:"Xatolik"}) } finally { setSaving(false) }
  }
  const del=async(id:string)=>{
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return
    await fetch(`/api/projects/${id}`,{method:"DELETE"});toast({title:"O'chirildi"});load()
  }

  const filtered=projects.filter(p=>
    p.name.toLowerCase().includes(search.toLowerCase())||
    p.client?.name?.toLowerCase().includes(search.toLowerCase())
  )

  const labelStyle={ fontSize:9,color:C.stone2,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase" as const }
  const inputStyle={ background:C.cream,border:`1px solid ${C.border}`,borderRadius:3,color:C.ink,outline:"none",fontFamily:"Inter,sans-serif" }

  return (
    <div className="space-y-5 anim-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black tracking-tight"
            style={{ fontFamily:"'Playfair Display',serif", color:C.ink }}>Loyihalar</h2>
          <p style={{ fontSize:12, color:C.stone2 }}>{projects.length} ta loyiha</p>
        </div>
        <button onClick={openCreate} className="btn-ink h-9 px-4 text-sm flex items-center gap-2">
          <Plus className="h-4 w-4"/> Yangi Loyiha
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{color:C.stone}}/>
          <input placeholder="Qidirish..." value={search} onChange={e=>setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-sm" style={inputStyle}
            onFocus={e=>{e.target.style.borderColor=C.stone2}} onBlur={e=>{e.target.style.borderColor=C.border}}/>
        </div>
        <select value={filter} onChange={e=>setFilter(e.target.value)}
          className="h-9 px-3 text-sm" style={{...inputStyle,color:C.ink3,minWidth:130}}>
          <option value="ALL">Barchasi</option>
          {Object.entries(PROJECT_STATUSES).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* Status chips */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(PROJECT_STATUSES).map(([k,v])=>{
          const cnt=projects.filter(p=>p.status===k).length; if (!cnt) return null
          return (
            <button key={k} onClick={()=>setFilter(filter===k?"ALL":k)}
              className="px-3 py-1 text-xs font-semibold rounded-sm transition-all"
              style={{ background:filter===k?C.ink:C.cream2, color:filter===k?"var(--cream)":C.ink3,
                border:`1px solid ${filter===k?C.ink:C.border}` }}>
              {v.label} {cnt}
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3].map(i=><div key={i} className="skeleton h-48" style={{animationDelay:`${i*.1}s`}}/>)}
        </div>
      ) : filtered.length===0 ? (
        <div className="flex flex-col items-center py-20" style={{color:C.stone}}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mb-4 opacity-30">
            <rect x="6" y="14" width="36" height="28" stroke="var(--ink)" strokeWidth="1.2"/>
            <path d="M6 14 L24 4 L42 14" stroke="var(--ink)" strokeWidth="1.2"/>
          </svg>
          <p className="font-semibold" style={{color:C.ink3}}>Loyiha topilmadi</p>
          <button onClick={openCreate} className="btn-outline mt-4 h-9 px-4 text-sm flex items-center gap-2">
            <Plus className="h-4 w-4"/> Yaratish
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p,i)=>{
            const s=PROJECT_STATUSES[p.status as keyof typeof PROJECT_STATUSES]
            const ov=p.deadline&&new Date(p.deadline)<new Date()&&p.status!=="COMPLETED"
            return (
              <TiltCard key={p.id} className={`anim-cardIn`}>
                {/* Gold cornice line */}
                <div style={{ height:1.5, background:"linear-gradient(90deg,transparent,var(--gold),transparent)" }}/>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <Link href={`/projects/${p.id}`} className="flex-1 min-w-0 layer-mid">
                      <h3 className="font-bold text-sm leading-tight line-clamp-2"
                        style={{ color:C.ink, fontFamily:"'Playfair Display',serif" }}>
                        {p.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-[10px] px-2 py-0.5 rounded-sm font-semibold"
                        style={{ background:C.cream2, color:C.ink3, border:`1px solid ${C.border}` }}>
                        {s?.label}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="h-7 w-7 rounded flex items-center justify-center transition-colors"
                            style={{color:C.stone}} onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background=C.cream2}}
                            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="transparent"}}>
                            <MoreVertical className="h-3.5 w-3.5"/>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-sm"
                          style={{background:C.white,border:`1px solid ${C.border}`,boxShadow:"var(--shadow-md)"}}>
                          <DropdownMenuItem onClick={()=>openEdit(p)} style={{color:C.ink3,cursor:"pointer"}}>
                            <Edit className="h-3.5 w-3.5 mr-2"/> Tahrirlash
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={()=>del(p.id)} style={{color:C.stone2,cursor:"pointer"}}>
                            <Trash2 className="h-3.5 w-3.5 mr-2"/> O'chirish
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <div className="space-y-1.5 layer-back">
                    {p.client&&<p className="text-xs" style={{color:C.stone2}}>👤 {p.client.name}</p>}
                    {p.deadline&&<p className="text-xs" style={{color:ov?C.stone2:C.stone}}>
                      {ov?"⚠ ":"📅 "}{formatDate(p.deadline)}</p>}
                    {p.budget&&<p className="text-xs font-semibold" style={{color:C.ink2}}>
                      {formatCurrency(p.budget)}</p>}
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3"
                    style={{borderTop:`1px solid rgba(200,168,112,.08)`}}>
                    <div className="flex gap-3 text-xs" style={{color:C.stone}}>
                      <span>📁 {p._count.files}</span>
                      <span>📝 {p._count.notes}</span>
                      <span>✅ {p._count.tasks}</span>
                    </div>
                    <Link href={`/projects/${p.id}`}>
                      <span className="text-xs flex items-center gap-1" style={{color:C.stone2}}>
                        Ko'rish<ChevronRight style={{width:11,height:11}}/>
                      </span>
                    </Link>
                  </div>
                </div>
              </TiltCard>
            )
          })}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-sm"
          style={{background:C.white,border:`1px solid ${C.border}`,boxShadow:"var(--shadow-xl)"}}>
          <div style={{height:2,background:"linear-gradient(90deg,transparent,var(--gold),transparent)",marginBottom:4}}/>
          <DialogHeader>
            <DialogTitle style={{color:C.ink,fontFamily:"'Playfair Display',serif",fontWeight:800}}>
              {editing?"Loyihani tahrirlash":"Yangi Loyiha"}
            </DialogTitle>
            <DialogDescription style={{color:C.stone2}}>Ma'lumotlarni to'ldiring</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            {[
              {f:"name",l:"Nomi *",t:"text",span:2},{f:"phone",l:"Telefon",t:"text"},
              {f:"email",l:"Email",t:"email"},{f:"address",l:"Manzil",t:"text",span:2},
              {f:"startDate",l:"Boshlanish",t:"date"},{f:"deadline",l:"Deadline",t:"date"},
              {f:"budget",l:"Byudjet (so'm)",t:"number",span:2},
            ].map(x=>(
              <div key={x.f} className={`space-y-1.5${(x as any).span===2?" sm:col-span-2":""}`}>
                <label style={labelStyle}>{x.l}</label>
                <input type={x.t} value={(form as any)[x.f]} onChange={e=>setForm(p=>({...p,[x.f]:e.target.value}))}
                  className="w-full h-10 px-3 text-sm" style={{...inputStyle}}
                  onFocus={e=>{e.target.style.borderColor=C.stone2}} onBlur={e=>{e.target.style.borderColor=C.border}}/>
              </div>
            ))}
            <div className="space-y-1.5">
              <label style={labelStyle}>Mijoz</label>
              <select value={form.clientId} onChange={e=>setForm(f=>({...f,clientId:e.target.value}))}
                className="w-full h-10 px-3 text-sm" style={{...inputStyle,color:C.ink3}}>
                <option value="none">— Yo'q —</option>
                {clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label style={labelStyle}>Holat</label>
              <select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}
                className="w-full h-10 px-3 text-sm" style={{...inputStyle,color:C.ink3}}>
                {Object.entries(PROJECT_STATUSES).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <label style={labelStyle}>Tavsif</label>
              <textarea rows={2} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}
                className="w-full px-3 py-2 text-sm resize-none" style={inputStyle}
                onFocus={e=>{e.target.style.borderColor=C.stone2}} onBlur={e=>{e.target.style.borderColor=C.border}}/>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button onClick={()=>setOpen(false)} className="btn-outline h-9 px-4 text-sm">Bekor</button>
            <button onClick={save} disabled={saving} className="btn-ink h-9 px-4 text-sm">
              {saving?"Saqlanmoqda...":editing?"Saqlash":"Yaratish"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
