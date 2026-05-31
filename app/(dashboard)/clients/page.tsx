"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Search, Phone, Mail, Building, MoreVertical, Edit, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { cn, PROJECT_STATUSES } from "@/lib/utils"

interface Client {
  id:string; name:string; phone:string|null; email:string|null
  company:string|null; address:string|null; notes:string|null
  projects:{id:string;name:string;status:string}[]; _count:{projects:number}
}
const EMPTY = {name:"",phone:"",email:"",company:"",address:"",notes:""}
const F = {c:"#1C1B18",c2:"#5A5650",c3:"#9A968E",bg:"#FFFFFF",bg2:"#F7F5F0",bd:"#E2DDD5",bd2:"#C8C2B8"}
const initials=(n:string)=>n.split(" ").map(x=>x[0]).join("").toUpperCase().slice(0,2)

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
      toast({title:editing?"Yangilandi":"Yaratildi"});setOpen(false);load()
    } catch { toast({variant:"destructive",title:"Xatolik"}) } finally { setSaving(false) }
  }
  const del=async(id:string)=>{
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return
    await fetch(`/api/clients/${id}`,{method:"DELETE"});toast({title:"O'chirildi"});load()
  }
  const filtered=clients.filter(c=>c.name.toLowerCase().includes(search.toLowerCase())||c.company?.toLowerCase().includes(search.toLowerCase())||c.phone?.includes(search))

  return (
    <div className="space-y-5" style={{color:F.c}}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight" style={{fontFamily:"'Playfair Display',serif"}}>Mijozlar</h2>
          <p style={{fontSize:12,color:F.c3}}>{clients.length} ta mijoz</p>
        </div>
        <button onClick={openCreate} className="btn-neo-dark h-9 px-4 text-sm flex items-center gap-2">
          <Plus className="h-4 w-4"/> Yangi Mijoz
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{color:F.c3}}/>
        <input placeholder="Qidirish..." value={search} onChange={e=>setSearch(e.target.value)}
          className="w-full h-9 pl-9 pr-3 text-sm"
          style={{background:F.bg,border:`1px solid ${F.bd}`,borderRadius:3,color:F.c,outline:"none"}}
          onFocus={e=>{e.target.style.borderColor=F.bd2}} onBlur={e=>{e.target.style.borderColor=F.bd}}/>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3].map(i=><div key={i} className="skeleton-neo h-40"/>)}
        </div>
      ) : filtered.length===0 ? (
        <div className="flex flex-col items-center py-20" style={{color:F.c3}}>
          <p className="font-semibold" style={{color:F.c2}}>Mijoz topilmadi</p>
          <button onClick={openCreate} className="btn-neo-light mt-4 h-9 px-4 text-sm">Yaratish</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((c,i)=>(
            <div key={c.id} className="neo-card neo-card-3d animate-card" style={{animationDelay:`${i*0.06}s`}}>
              <div style={{height:1,background:"linear-gradient(90deg,transparent,#B8965A,transparent)",opacity:0.3}}/>
              <div className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="h-10 w-10 rounded flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{background:F.c,color:"#FFF",fontFamily:"'Playfair Display',serif"}}>
                    {initials(c.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/clients/${c.id}`}>
                        <h3 className="font-bold text-sm" style={{color:F.c,fontFamily:"'Playfair Display',serif"}}>{c.name}</h3>
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="h-6 w-6 rounded flex items-center justify-center hover:bg-[#F2F0EB] transition-colors" style={{color:F.c3,flexShrink:0}}>
                            <MoreVertical className="h-3.5 w-3.5"/>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded" style={{background:F.bg,border:`1px solid ${F.bd}`}}>
                          <DropdownMenuItem onClick={()=>openEdit(c)} style={{color:F.c2,cursor:"pointer"}}><Edit className="h-3.5 w-3.5 mr-2"/> Tahrirlash</DropdownMenuItem>
                          <DropdownMenuItem onClick={()=>del(c.id)} style={{color:F.c3,cursor:"pointer"}}><Trash2 className="h-3.5 w-3.5 mr-2"/> O'chirish</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {c.company&&<p className="text-xs flex items-center gap-1 mt-0.5" style={{color:F.c3}}><Building className="h-3 w-3"/> {c.company}</p>}
                  </div>
                </div>
                <div className="space-y-1.5">
                  {c.phone&&<a href={`tel:${c.phone}`} className="text-xs flex items-center gap-1.5 hover:opacity-70 transition-opacity" style={{color:F.c2}}><Phone className="h-3.5 w-3.5"/> {c.phone}</a>}
                  {c.email&&<a href={`mailto:${c.email}`} className="text-xs flex items-center gap-1.5 truncate hover:opacity-70 transition-opacity" style={{color:F.c2}}><Mail className="h-3.5 w-3.5"/> {c.email}</a>}
                </div>
                {c.projects.length>0&&(
                  <div className="mt-3 pt-3" style={{borderTop:`1px solid ${F.bd}`}}>
                    <p className="text-xs mb-1.5" style={{color:F.c3}}>{c._count.projects} ta loyiha</p>
                    <div className="flex flex-wrap gap-1">
                      {c.projects.slice(0,3).map(p=>(
                        <Link key={p.id} href={`/projects/${p.id}`}>
                          <span className="text-xs px-2 py-0.5 rounded"
                            style={{background:F.bg2,border:`1px solid ${F.bd}`,color:F.c2,fontSize:9}}>
                            {p.name.length>16?p.name.slice(0,16)+"…":p.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg rounded" style={{background:F.bg,border:`1px solid ${F.bd}`,color:F.c}}>
          <DialogHeader>
            <DialogTitle style={{color:F.c,fontFamily:"'Playfair Display',serif"}}>{editing?"Tahrirlash":"Yangi Mijoz"}</DialogTitle>
            <DialogDescription style={{color:F.c3}}>Ma'lumotlarni kiriting</DialogDescription>
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
                <label style={{fontSize:9,color:F.c3,fontWeight:600,letterSpacing:"0.14em",textTransform:"uppercase"}}>{x.l}</label>
                <input placeholder={x.ph} value={(form as any)[x.f]} onChange={e=>setForm(p=>({...p,[x.f]:e.target.value}))}
                  className="w-full h-10 px-3 text-sm"
                  style={{background:F.bg2,border:`1px solid ${F.bd}`,borderRadius:3,color:F.c,outline:"none"}}
                  onFocus={e=>{e.target.style.borderColor=F.bd2}} onBlur={e=>{e.target.style.borderColor=F.bd}}/>
              </div>
            ))}
            <div className="col-span-2 space-y-1.5">
              <label style={{fontSize:9,color:F.c3,fontWeight:600,letterSpacing:"0.14em",textTransform:"uppercase"}}>Izoh</label>
              <textarea rows={2} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}
                className="w-full px-3 py-2 text-sm resize-none"
                style={{background:F.bg2,border:`1px solid ${F.bd}`,borderRadius:3,color:F.c,outline:"none"}}/>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button onClick={()=>setOpen(false)} className="btn-neo-light h-9 px-4 text-sm">Bekor</button>
            <button onClick={save} disabled={saving} className="btn-neo-dark h-9 px-4 text-sm">{saving?"...":editing?"Saqlash":"Yaratish"}</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
