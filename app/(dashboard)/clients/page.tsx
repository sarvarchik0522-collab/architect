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
  projects:{ id:string; name:string; status:string }[]
  _count:{ projects:number }
}
const EMPTY = { name:"", phone:"", email:"", company:"", address:"", notes:"" }

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState("")
  const [open,    setOpen]    = useState(false)
  const [editing, setEditing] = useState<Client|null>(null)
  const [form,    setForm]    = useState(EMPTY)
  const [saving,  setSaving]  = useState(false)
  const { toast } = useToast()

  const load = async () => {
    setLoading(true)
    setClients(await fetch("/api/clients").then(r=>r.json()))
    setLoading(false)
  }
  useEffect(()=>{ load() },[])

  const openCreate = () => { setEditing(null); setForm(EMPTY); setOpen(true) }
  const openEdit   = (c:Client) => {
    setEditing(c)
    setForm({name:c.name,phone:c.phone??"",email:c.email??"",company:c.company??"",address:c.address??"",notes:c.notes??""})
    setOpen(true)
  }
  const save = async () => {
    if (!form.name.trim()) return toast({variant:"destructive",title:"Ism kerak"})
    setSaving(true)
    try {
      await fetch(editing?`/api/clients/${editing.id}`:"/api/clients",{
        method:editing?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)
      })
      toast({title:editing?"Yangilandi":"Yaratildi"}); setOpen(false); load()
    } catch { toast({variant:"destructive",title:"Xatolik"}) }
    finally { setSaving(false) }
  }
  const del = async (id:string) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return
    await fetch(`/api/clients/${id}`,{method:"DELETE"})
    toast({title:"O'chirildi"}); load()
  }

  const filtered = clients.filter(c=>
    c.name.toLowerCase().includes(search.toLowerCase())||
    c.company?.toLowerCase().includes(search.toLowerCase())||
    c.phone?.includes(search)
  )

  const initials = (n:string) => n.split(" ").map(x=>x[0]).join("").toUpperCase().slice(0,2)

  return (
    <div className="space-y-5" style={{color:"#f0f0f0"}}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black tracking-tight">Mijozlar</h2>
          <p style={{fontSize:12,color:"#555"}}>{clients.length} ta mijoz</p>
        </div>
        <button onClick={openCreate} className="btn-primary h-9 px-4 text-sm flex items-center gap-2">
          <Plus className="h-4 w-4"/> Yangi Mijoz
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{color:"#444"}}/>
        <input placeholder="Qidirish..." value={search} onChange={e=>setSearch(e.target.value)}
          className="w-full h-9 pl-9 pr-3 text-sm rounded"
          style={{background:"#111",border:"1px solid #222",color:"#f0f0f0",outline:"none"}}
          onFocus={e=>{e.target.style.borderColor="#444"}} onBlur={e=>{e.target.style.borderColor="#222"}}/>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3].map(i=><div key={i} className="skeleton h-40"/>)}
        </div>
      ) : filtered.length===0 ? (
        <div className="flex flex-col items-center py-20" style={{color:"#444"}}>
          <p className="font-semibold" style={{color:"#666"}}>Mijoz topilmadi</p>
          <button onClick={openCreate} className="btn-ghost mt-4 h-9 px-4 text-sm">Yaratish</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((c,i)=>(
            <div key={c.id} className="arch-card arch-card-lift animate-card" style={{animationDelay:`${i*0.06}s`}}>
              <div style={{height:1,background:"#1a1a1a"}}/>
              <div className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  {/* Avatar */}
                  <div className="h-10 w-10 rounded flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{background:"#1a1a1a",border:"1px solid #2a2a2a",color:"#888"}}>
                    {initials(c.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/clients/${c.id}`}>
                        <h3 className="font-bold text-sm" style={{color:"#f0f0f0"}}>{c.name}</h3>
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="h-6 w-6 rounded flex items-center justify-center hover:bg-[#1a1a1a]"
                            style={{color:"#444",flexShrink:0}}>
                            <MoreVertical className="h-3.5 w-3.5"/>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end"
                          style={{background:"#111",border:"1px solid #222",color:"#f0f0f0"}}>
                          <DropdownMenuItem onClick={()=>openEdit(c)} style={{color:"#ccc",cursor:"pointer"}}>
                            <Edit className="h-3.5 w-3.5 mr-2"/> Tahrirlash
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={()=>del(c.id)} style={{color:"#888",cursor:"pointer"}}>
                            <Trash2 className="h-3.5 w-3.5 mr-2"/> O'chirish
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {c.company&&<p className="text-xs flex items-center gap-1 mt-0.5" style={{color:"#555"}}>
                      <Building className="h-3 w-3"/> {c.company}
                    </p>}
                  </div>
                </div>
                <div className="space-y-1.5">
                  {c.phone&&<a href={`tel:${c.phone}`} className="text-xs flex items-center gap-1.5 hover:opacity-80" style={{color:"#555"}}>
                    <Phone className="h-3.5 w-3.5"/> {c.phone}
                  </a>}
                  {c.email&&<a href={`mailto:${c.email}`} className="text-xs flex items-center gap-1.5 truncate hover:opacity-80" style={{color:"#555"}}>
                    <Mail className="h-3.5 w-3.5"/> {c.email}
                  </a>}
                </div>
                {c.projects.length>0&&(
                  <div className="mt-3 pt-3" style={{borderTop:"1px solid #1a1a1a"}}>
                    <p className="text-xs mb-1.5" style={{color:"#444"}}>{c._count.projects} ta loyiha</p>
                    <div className="flex flex-wrap gap-1">
                      {c.projects.slice(0,3).map(p=>(
                        <Link key={p.id} href={`/projects/${p.id}`}>
                          <span className="text-xs px-2 py-0.5 rounded"
                            style={{background:"#1a1a1a",border:"1px solid #222",color:"#666"}}>
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
        <DialogContent className="max-w-md rounded"
          style={{background:"#0f0f0f",border:"1px solid #222",color:"#f0f0f0"}}>
          <DialogHeader>
            <DialogTitle style={{color:"#f0f0f0"}}>{editing?"Mijoz tahrirlash":"Yangi Mijoz"}</DialogTitle>
            <DialogDescription style={{color:"#555"}}>Ma'lumotlarni kiriting</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            {[
              {field:"name",    label:"Ism *",    ph:"Bobur Toshmatov",     span:2},
              {field:"phone",   label:"Telefon",  ph:"+998 90 000 00 00",   span:1},
              {field:"email",   label:"Email",    ph:"email@example.com",   span:1},
              {field:"company", label:"Kompaniya",ph:"ABC Qurilish LLC",     span:2},
              {field:"address", label:"Manzil",   ph:"Toshkent, ...",        span:2},
            ].map(f=>(
              <div key={f.field} className={`space-y-1.5${f.span===2?" col-span-2":""}`}>
                <label className="text-xs font-semibold uppercase tracking-wider" style={{color:"#555"}}>{f.label}</label>
                <input placeholder={f.ph} value={(form as any)[f.field]}
                  onChange={e=>setForm(prev=>({...prev,[f.field]:e.target.value}))}
                  className="w-full h-10 px-3 text-sm rounded"
                  style={{background:"#0d0d0d",border:"1px solid #222",color:"#f0f0f0",outline:"none"}}
                  onFocus={e=>{e.target.style.borderColor="#555"}}
                  onBlur={e=>{e.target.style.borderColor="#222"}}/>
              </div>
            ))}
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{color:"#555"}}>Izoh</label>
              <textarea rows={2} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}
                className="w-full px-3 py-2 text-sm rounded resize-none"
                style={{background:"#0d0d0d",border:"1px solid #222",color:"#f0f0f0",outline:"none"}}/>
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
