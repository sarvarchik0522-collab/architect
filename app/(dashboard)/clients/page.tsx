"use client"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Plus, Search, Phone, Mail, Building, MoreVertical, Edit, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { cn, PROJECT_STATUSES } from "@/lib/utils"

const C = { ink:"var(--ink)", ink3:"var(--ink3)", cream:"var(--cream)", cream2:"var(--cream2)", stone:"var(--stone)", stone2:"var(--stone2)", white:"var(--white)", border:"rgba(200,168,112,.14)" }
const initials=(n:string)=>n.split(" ").map(x=>x[0]).join("").toUpperCase().slice(0,2)
const EMPTY={name:"",phone:"",email:"",company:"",address:"",notes:""}
const inputSt={ background:C.cream, border:`1px solid ${C.border}`, borderRadius:3, color:C.ink, outline:"none" }

interface Client {
  id:string; name:string; phone:string|null; email:string|null
  company:string|null; address:string|null; notes:string|null
  projects:{id:string;name:string;status:string}[]; _count:{projects:number}
}

function TiltCard({ children, className="" }: { children:React.ReactNode; className?:string }) {
  const ref=useRef<HTMLDivElement>(null)
  const onMove=(e:React.MouseEvent<HTMLDivElement>)=>{
    const el=ref.current; if (!el) return
    const r=el.getBoundingClientRect()
    const dx=(e.clientX-r.left-r.width/2)/(r.width/2)
    const dy=(e.clientY-r.top-r.height/2)/(r.height/2)
    el.style.transform=`perspective(900px) rotateX(${-dy*8}deg) rotateY(${dx*8}deg) translateY(-6px)`
    el.style.setProperty("--mx",`${(dx+1)/2*100}%`)
    el.style.setProperty("--my",`${(dy+1)/2*100}%`)
  }
  const onLeave=()=>{ if(ref.current) ref.current.style.transform="" }
  return (
    <div ref={ref} className={cn("card-3d-tilt",className)}
      onMouseMove={onMove} onMouseLeave={onLeave}
      style={{transition:"transform .12s ease-out, box-shadow .45s"}}>
      {children}
    </div>
  )
}

export default function ClientsPage() {
  const [clients,setClients]=useState<Client[]>([])
  const [loading,setLoading]=useState(true)
  const [search, setSearch] =useState("")
  const [open,   setOpen]   =useState(false)
  const [editing,setEditing]=useState<Client|null>(null)
  const [form,   setForm]   =useState(EMPTY)
  const [saving, setSaving] =useState(false)
  const { toast }=useToast()

  const load=async()=>{setLoading(true);setClients(await fetch("/api/clients").then(r=>r.json()));setLoading(false)}
  useEffect(()=>{load()},[])

  const openCreate=()=>{setEditing(null);setForm(EMPTY);setOpen(true)}
  const openEdit=(c:Client)=>{setEditing(c);setForm({name:c.name,phone:c.phone??"",email:c.email??"",company:c.company??"",address:c.address??"",notes:c.notes??""});setOpen(true)}
  const save=async()=>{
    if (!form.name.trim()) return toast({variant:"destructive",title:"Ism kerak"})
    setSaving(true)
    try {
      await fetch(editing?`/api/clients/${editing.id}`:"/api/clients",{method:editing?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)})
      toast({title:editing?"Yangilandi ✓":"Yaratildi ✓"});setOpen(false);load()
    } catch { toast({variant:"destructive",title:"Xatolik"}) } finally { setSaving(false) }
  }
  const del=async(id:string)=>{
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return
    await fetch(`/api/clients/${id}`,{method:"DELETE"});toast({title:"O'chirildi"});load()
  }
  const filtered=clients.filter(c=>c.name.toLowerCase().includes(search.toLowerCase())||c.company?.toLowerCase().includes(search.toLowerCase())||c.phone?.includes(search))

  return (
    <div className="space-y-5 anim-page">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black tracking-tight"
            style={{fontFamily:"'Playfair Display',serif",color:C.ink}}>Mijozlar</h2>
          <p style={{fontSize:12,color:C.stone2}}>{clients.length} ta mijoz</p>
        </div>
        <button onClick={openCreate} className="btn-ink h-9 px-4 text-sm flex items-center gap-2">
          <Plus className="h-4 w-4"/> Yangi Mijoz
        </button>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{color:C.stone}}/>
        <input placeholder="Qidirish..." value={search} onChange={e=>setSearch(e.target.value)}
          className="w-full h-9 pl-9 pr-3 text-sm" style={inputSt}
          onFocus={e=>{e.target.style.borderColor=C.stone2}} onBlur={e=>{e.target.style.borderColor=C.border}}/>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3].map(i=><div key={i} className="skeleton h-44"/>)}
        </div>
      ) : filtered.length===0 ? (
        <div className="flex flex-col items-center py-20" style={{color:C.stone}}>
          <p className="font-semibold" style={{color:C.ink3}}>Mijoz topilmadi</p>
          <button onClick={openCreate} className="btn-outline mt-4 h-9 px-4 text-sm">Yaratish</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((c,i)=>(
            <TiltCard key={c.id} className="anim-cardIn">
              <div style={{height:1.5,background:"linear-gradient(90deg,transparent,var(--gold),transparent)"}}/>
              <div className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  {/* Avatar with 3D depth */}
                  <div className="relative layer-front flex-shrink-0">
                    <div className="h-11 w-11 rounded flex items-center justify-center text-sm font-black"
                      style={{background:"var(--ink)",color:"var(--cream)",
                        fontFamily:"'Playfair Display',serif",
                        boxShadow:"0 4px 12px rgba(26,24,20,.2)"}}>
                      {initials(c.name)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/clients/${c.id}`}>
                        <h3 className="font-bold text-sm layer-mid"
                          style={{color:C.ink,fontFamily:"'Playfair Display',serif"}}>{c.name}</h3>
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="h-6 w-6 rounded flex items-center justify-center transition-colors flex-shrink-0"
                            style={{color:C.stone}}
                            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background=C.cream2}}
                            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="transparent"}}>
                            <MoreVertical className="h-3.5 w-3.5"/>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-sm"
                          style={{background:C.white,border:`1px solid ${C.border}`}}>
                          <DropdownMenuItem onClick={()=>openEdit(c)} style={{color:C.ink3,cursor:"pointer"}}>
                            <Edit className="h-3.5 w-3.5 mr-2"/> Tahrirlash
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={()=>del(c.id)} style={{color:C.stone2,cursor:"pointer"}}>
                            <Trash2 className="h-3.5 w-3.5 mr-2"/> O'chirish
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {c.company&&<p className="text-xs flex items-center gap-1 mt-0.5 layer-back"
                      style={{color:C.stone2}}><Building className="h-3 w-3"/> {c.company}</p>}
                  </div>
                </div>
                <div className="space-y-1.5">
                  {c.phone&&<a href={`tel:${c.phone}`} className="text-xs flex items-center gap-1.5 hover:opacity-70 transition-opacity"
                    style={{color:C.stone2}}><Phone className="h-3.5 w-3.5"/> {c.phone}</a>}
                  {c.email&&<a href={`mailto:${c.email}`} className="text-xs flex items-center gap-1.5 truncate hover:opacity-70 transition-opacity"
                    style={{color:C.stone2}}><Mail className="h-3.5 w-3.5"/> {c.email}</a>}
                </div>
                {c.projects.length>0&&(
                  <div className="mt-3 pt-3" style={{borderTop:`1px solid rgba(200,168,112,.08)`}}>
                    <p className="text-xs mb-1.5" style={{color:C.stone}}>{c._count.projects} ta loyiha</p>
                    <div className="flex flex-wrap gap-1">
                      {c.projects.slice(0,3).map(p=>(
                        <Link key={p.id} href={`/projects/${p.id}`}>
                          <span className="text-[10px] px-2 py-0.5 rounded-sm"
                            style={{background:C.cream2,border:`1px solid ${C.border}`,color:C.ink3}}>
                            {p.name.length>16?p.name.slice(0,16)+"…":p.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TiltCard>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg rounded-sm"
          style={{background:C.white,border:`1px solid ${C.border}`,boxShadow:"var(--shadow-xl)"}}>
          <div style={{height:2,background:"linear-gradient(90deg,transparent,var(--gold),transparent)",marginBottom:4}}/>
          <DialogHeader>
            <DialogTitle style={{color:C.ink,fontFamily:"'Playfair Display',serif",fontWeight:800}}>
              {editing?"Mijoz tahrirlash":"Yangi Mijoz"}
            </DialogTitle>
            <DialogDescription style={{color:C.stone2}}>Ma'lumotlarni kiriting</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            {[
              {f:"name",l:"Ism *",ph:"Bobur Toshmatov",span:2},
              {f:"phone",l:"Telefon",ph:"+998 90 000 00 00"},
              {f:"email",l:"Email",ph:"email@example.com"},
              {f:"company",l:"Kompaniya",ph:"ABC LLC",span:2},
              {f:"address",l:"Manzil",ph:"Toshkent...",span:2},
            ].map(x=>(
              <div key={x.f} className={`space-y-1.5${(x as any).span===2?" col-span-2":""}`}>
                <label style={{fontSize:9,color:C.stone2,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase" as const}}>{x.l}</label>
                <input placeholder={x.ph} value={(form as any)[x.f]} onChange={e=>setForm(p=>({...p,[x.f]:e.target.value}))}
                  className="w-full h-10 px-3 text-sm" style={inputSt}
                  onFocus={e=>{e.target.style.borderColor=C.stone2}} onBlur={e=>{e.target.style.borderColor=C.border}}/>
              </div>
            ))}
            <div className="col-span-2 space-y-1.5">
              <label style={{fontSize:9,color:C.stone2,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase" as const}}>Izoh</label>
              <textarea rows={2} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}
                className="w-full px-3 py-2 text-sm resize-none" style={inputSt}
                onFocus={e=>{e.target.style.borderColor=C.stone2}} onBlur={e=>{e.target.style.borderColor=C.border}}/>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button onClick={()=>setOpen(false)} className="btn-outline h-9 px-4 text-sm">Bekor</button>
            <button onClick={save} disabled={saving} className="btn-ink h-9 px-4 text-sm">
              {saving?"...":editing?"Saqlash":"Yaratish"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
