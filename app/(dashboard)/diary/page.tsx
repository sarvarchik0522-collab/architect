"use client"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Plus, BookOpen, ChevronLeft, ChevronRight, Edit, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/utils"

interface Diary {
  id:string; date:string; title:string; description:string|null
  workDone:string|null; problems:string|null; decisions:string|null; mood:string|null
  projects:{ project:{ id:string; name:string } }[]
}

const MOODS = [{v:"GREAT",e:"😄"},{v:"GOOD",e:"🙂"},{v:"NEUTRAL",e:"😐"},{v:"BAD",e:"😞"}]
const MONTHS = ["Yanvar","Fevral","Mart","Aprel","May","Iyun","Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr"]
const EMPTY = { date:new Date().toISOString().split("T")[0], title:"", description:"", workDone:"", problems:"", decisions:"", mood:"" }

export default function DiaryPage() {
  const [diaries,  setDiaries]  = useState<Diary[]>([])
  const [loading,  setLoading]  = useState(true)
  const [curMonth, setCurMonth] = useState(new Date())
  const [open,     setOpen]     = useState(false)
  const [editing,  setEditing]  = useState<Diary|null>(null)
  const [form,     setForm]     = useState(EMPTY)
  const [saving,   setSaving]   = useState(false)
  const [view,     setView]     = useState<"timeline"|"list">("timeline")
  const { toast } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    const m = curMonth.getMonth()+1, y = curMonth.getFullYear()
    setDiaries(await fetch(`/api/diary?month=${m}&year=${y}`).then(r=>r.json()))
    setLoading(false)
  },[curMonth])
  useEffect(()=>{ load() },[load])

  const openCreate = () => { setEditing(null); setForm({...EMPTY,date:new Date().toISOString().split("T")[0]}); setOpen(true) }
  const openEdit = (d:Diary) => {
    setEditing(d)
    setForm({date:d.date.split("T")[0],title:d.title,description:d.description??"",
      workDone:d.workDone??"",problems:d.problems??"",decisions:d.decisions??"",mood:d.mood??""})
    setOpen(true)
  }
  const save = async () => {
    if (!form.title.trim()) return toast({variant:"destructive",title:"Sarlavha kerak"})
    setSaving(true)
    try {
      await fetch(editing?`/api/diary/${editing.id}`:"/api/diary",{
        method:editing?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)
      })
      toast({title:editing?"Yangilandi":"Yaratildi"}); setOpen(false); load()
    } catch { toast({variant:"destructive",title:"Xatolik"}) }
    finally { setSaving(false) }
  }
  const del = async (id:string) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return
    await fetch(`/api/diary/${id}`,{method:"DELETE"})
    toast({title:"O'chirildi"}); load()
  }

  const monthLabel = `${MONTHS[curMonth.getMonth()]} ${curMonth.getFullYear()}`
  const prev = () => setCurMonth(d=>new Date(d.getFullYear(),d.getMonth()-1))
  const next = () => setCurMonth(d=>new Date(d.getFullYear(),d.getMonth()+1))

  return (
    <div className="space-y-5" style={{color:"#f0f0f0"}}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-black tracking-tight">Kundalik</h2>
          <p style={{fontSize:12,color:"#555"}}>{diaries.length} ta yozuv</p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded overflow-hidden" style={{border:"1px solid #222"}}>
            {(["timeline","list"] as const).map(v=>(
              <button key={v} onClick={()=>setView(v)}
                className="px-3 py-1.5 text-xs font-medium transition-colors"
                style={{background:view===v?"#222":"transparent",color:view===v?"#f0f0f0":"#555"}}>
                {v==="timeline"?"Timeline":"Ro'yxat"}
              </button>
            ))}
          </div>
          <button onClick={openCreate} className="btn-primary h-9 px-4 text-sm flex items-center gap-2">
            <Plus className="h-4 w-4"/> Yozuv
          </button>
        </div>
      </div>

      {/* Month nav */}
      <div className="flex items-center gap-3">
        <button onClick={prev} className="btn-ghost h-8 w-8 flex items-center justify-center rounded">
          <ChevronLeft className="h-4 w-4"/>
        </button>
        <span className="font-semibold text-sm min-w-36 text-center" style={{color:"#ccc"}}>{monthLabel}</span>
        <button onClick={next} className="btn-ghost h-8 w-8 flex items-center justify-center rounded">
          <ChevronRight className="h-4 w-4"/>
        </button>
        <button onClick={()=>setCurMonth(new Date())}
          className="text-xs px-3 py-1.5 rounded transition-colors"
          style={{color:"#555",border:"1px solid #1e1e1e"}}>
          Bugun
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="skeleton h-24"/>)}</div>
      ) : diaries.length===0 ? (
        <div className="flex flex-col items-center py-20" style={{color:"#444"}}>
          <BookOpen className="h-10 w-10 mb-3 opacity-20"/>
          <p className="font-semibold" style={{color:"#666"}}>Bu oyda yozuv yo'q</p>
          <button onClick={openCreate} className="btn-ghost mt-4 h-9 px-4 text-sm">Qo'shish</button>
        </div>
      ) : view==="timeline" ? (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-px" style={{background:"#1e1e1e"}}/>
          <div className="space-y-4 pl-16">
            {diaries.map((d,i)=>(
              <div key={d.id} className="relative animate-card" style={{animationDelay:`${i*0.06}s`}}>
                {/* Timeline dot */}
                <div className="absolute -left-[42px] top-5 h-4 w-4 rounded-full flex items-center justify-center"
                  style={{background:"#111",border:"1px solid #333"}}>
                  <div className="h-1.5 w-1.5 rounded-full" style={{background:"#666"}}/>
                </div>
                {/* Date label */}
                <div className="absolute -left-[110px] w-[62px] text-right top-4">
                  <p className="font-black text-sm leading-none" style={{color:"#555"}}>{new Date(d.date).getDate()}</p>
                  <p className="text-xs" style={{color:"#333"}}>{MONTHS[new Date(d.date).getMonth()].slice(0,3)}</p>
                </div>

                <div className="arch-card group">
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Link href={`/diary/${d.id}`}>
                            <h3 className="font-bold text-sm hover:opacity-70 transition-opacity" style={{color:"#f0f0f0"}}>{d.title}</h3>
                          </Link>
                          {d.mood&&<span className="text-base">{MOODS.find(m=>m.v===d.mood)?.e}</span>}
                        </div>
                        {d.description&&<p className="text-xs line-clamp-2 mt-1" style={{color:"#555"}}>{d.description}</p>}
                        {d.workDone&&<p className="text-xs mt-1 line-clamp-1" style={{color:"#444"}}>✅ {d.workDone}</p>}
                        {d.projects.length>0&&(
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {d.projects.map(dp=>(
                              <Link key={dp.project.id} href={`/projects/${dp.project.id}`}>
                                <span className="text-xs px-2 py-0.5 rounded"
                                  style={{background:"#1a1a1a",border:"1px solid #222",color:"#666"}}>
                                  {dp.project.name}
                                </span>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button onClick={()=>openEdit(d)} className="h-7 w-7 rounded flex items-center justify-center hover:bg-[#1e1e1e]" style={{color:"#555"}}>
                          <Edit className="h-3.5 w-3.5"/>
                        </button>
                        <button onClick={()=>del(d.id)} className="h-7 w-7 rounded flex items-center justify-center hover:bg-[#1e1e1e]" style={{color:"#555"}}>
                          <Trash2 className="h-3.5 w-3.5"/>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {diaries.map((d,i)=>(
            <div key={d.id} className="arch-card flex items-center gap-4 p-4 group animate-card"
              style={{animationDelay:`${i*0.05}s`}}>
              <div className="w-12 text-center flex-shrink-0">
                <p className="font-black text-lg leading-none" style={{color:"#666"}}>{new Date(d.date).getDate()}</p>
                <p className="text-xs" style={{color:"#333"}}>{MONTHS[new Date(d.date).getMonth()].slice(0,3)}</p>
              </div>
              <div style={{width:1,height:32,background:"#1a1a1a"}}/>
              <div className="flex-1 min-w-0">
                <Link href={`/diary/${d.id}`}>
                  <h3 className="font-semibold text-sm truncate hover:opacity-70" style={{color:"#f0f0f0"}}>{d.title}</h3>
                </Link>
                {d.description&&<p className="text-xs line-clamp-1 mt-0.5" style={{color:"#555"}}>{d.description}</p>}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={()=>openEdit(d)} className="h-7 w-7 rounded flex items-center justify-center hover:bg-[#1e1e1e]" style={{color:"#555"}}>
                  <Edit className="h-3.5 w-3.5"/>
                </button>
                <button onClick={()=>del(d.id)} className="h-7 w-7 rounded flex items-center justify-center hover:bg-[#1e1e1e]" style={{color:"#555"}}>
                  <Trash2 className="h-3.5 w-3.5"/>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded"
          style={{background:"#0f0f0f",border:"1px solid #222",color:"#f0f0f0"}}>
          <DialogHeader>
            <DialogTitle style={{color:"#f0f0f0"}}>{editing?"Tahrirlash":"Yangi Yozuv"}</DialogTitle>
            <DialogDescription style={{color:"#555"}}>Kundalik yozuvini to'ldiring</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{color:"#555"}}>Sana</label>
              <input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}
                className="w-full h-10 px-3 text-sm rounded"
                style={{background:"#0d0d0d",border:"1px solid #222",color:"#f0f0f0",outline:"none"}}/>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{color:"#555"}}>Kayfiyat</label>
              <div className="flex gap-2 h-10 items-center">
                {MOODS.map(m=>(
                  <button key={m.v} type="button" onClick={()=>setForm(f=>({...f,mood:f.mood===m.v?"":m.v}))}
                    className="text-xl px-1 py-0.5 rounded transition-all"
                    style={{background:form.mood===m.v?"#222":"transparent",
                      border:`1px solid ${form.mood===m.v?"#444":"transparent"}`}}>
                    {m.e}
                  </button>
                ))}
              </div>
            </div>
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{color:"#555"}}>Sarlavha *</label>
              <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}
                placeholder="Bugungi kun sarlavhasi"
                className="w-full h-10 px-3 text-sm rounded"
                style={{background:"#0d0d0d",border:"1px solid #222",color:"#f0f0f0",outline:"none"}}/>
            </div>
            {[
              {field:"description",label:"Tavsif",         ph:"Bugun nima bo'ldi..."},
              {field:"workDone",   label:"Bajarilgan ishlar",ph:"Bugun bajardim..."},
              {field:"problems",   label:"Muammolar",       ph:"Qanday to'siqlar..."},
              {field:"decisions",  label:"Qarorlar",        ph:"Qabul qilingan qarorlar..."},
            ].map(f=>(
              <div key={f.field} className="col-span-2 sm:col-span-1 space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{color:"#555"}}>{f.label}</label>
                <textarea rows={3} placeholder={f.ph} value={(form as any)[f.field]}
                  onChange={e=>setForm(prev=>({...prev,[f.field]:e.target.value}))}
                  className="w-full px-3 py-2 text-sm rounded resize-none"
                  style={{background:"#0d0d0d",border:"1px solid #222",color:"#f0f0f0",outline:"none"}}/>
              </div>
            ))}
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
