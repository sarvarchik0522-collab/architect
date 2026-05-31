"use client"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Plus, BookOpen, ChevronLeft, ChevronRight, Edit, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/utils"

const C = { ink:"var(--ink)", ink3:"var(--ink3)", cream:"var(--cream)", cream2:"var(--cream2)", stone:"var(--stone)", stone2:"var(--stone2)", white:"var(--white)", border:"rgba(200,168,112,.14)" }
const MOODS=[{v:"GREAT",e:"😄"},{v:"GOOD",e:"🙂"},{v:"NEUTRAL",e:"😐"},{v:"BAD",e:"😞"}]
const MN=["Yanvar","Fevral","Mart","Aprel","May","Iyun","Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr"]
const EMPTY={date:new Date().toISOString().split("T")[0],title:"",description:"",workDone:"",problems:"",decisions:"",mood:""}
const inputSt={ background:C.cream, border:`1px solid ${C.border}`, borderRadius:3, color:C.ink, outline:"none" }

interface Diary {
  id:string; date:string; title:string; description:string|null
  workDone:string|null; problems:string|null; decisions:string|null; mood:string|null
  projects:{project:{id:string;name:string}}[]
}

export default function DiaryPage() {
  const [diaries,  setDiaries]  =useState<Diary[]>([])
  const [loading,  setLoading]  =useState(true)
  const [cur,      setCur]      =useState(new Date())
  const [open,     setOpen]     =useState(false)
  const [editing,  setEditing]  =useState<Diary|null>(null)
  const [form,     setForm]     =useState(EMPTY)
  const [saving,   setSaving]   =useState(false)
  const [view,     setView]     =useState<"timeline"|"list">("timeline")
  const { toast }=useToast()

  const load=useCallback(async()=>{
    setLoading(true)
    setDiaries(await fetch(`/api/diary?month=${cur.getMonth()+1}&year=${cur.getFullYear()}`).then(r=>r.json()))
    setLoading(false)
  },[cur])
  useEffect(()=>{load()},[load])

  const openCreate=()=>{setEditing(null);setForm({...EMPTY,date:new Date().toISOString().split("T")[0]});setOpen(true)}
  const openEdit=(d:Diary)=>{setEditing(d);setForm({date:d.date.split("T")[0],title:d.title,description:d.description??"",workDone:d.workDone??"",problems:d.problems??"",decisions:d.decisions??"",mood:d.mood??""});setOpen(true)}
  const save=async()=>{
    if (!form.title.trim()) return toast({variant:"destructive",title:"Sarlavha kerak"})
    setSaving(true)
    try {
      await fetch(editing?`/api/diary/${editing.id}`:"/api/diary",{method:editing?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)})
      toast({title:editing?"Yangilandi ✓":"Yaratildi ✓"});setOpen(false);load()
    } catch { toast({variant:"destructive",title:"Xatolik"}) } finally { setSaving(false) }
  }
  const del=async(id:string)=>{
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return
    await fetch(`/api/diary/${id}`,{method:"DELETE"});toast({title:"O'chirildi"});load()
  }

  const ml=`${MN[cur.getMonth()]} ${cur.getFullYear()}`

  return (
    <div className="space-y-5 anim-page">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-black tracking-tight"
            style={{fontFamily:"'Playfair Display',serif",color:C.ink}}>Kundalik</h2>
          <p style={{fontSize:12,color:C.stone2}}>{diaries.length} ta yozuv</p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-sm overflow-hidden" style={{border:`1px solid ${C.border}`}}>
            {(["timeline","list"] as const).map(v=>(
              <button key={v} onClick={()=>setView(v)}
                className="px-3 py-1.5 text-xs font-semibold transition-colors"
                style={{background:view===v?C.ink:C.cream2,color:view===v?"var(--cream)":C.stone2}}>
                {v==="timeline"?"Timeline":"Ro'yxat"}
              </button>
            ))}
          </div>
          <button onClick={openCreate} className="btn-ink h-9 px-4 text-sm flex items-center gap-2">
            <Plus className="h-4 w-4"/> Yozuv
          </button>
        </div>
      </div>

      {/* Month nav */}
      <div className="flex items-center gap-3">
        {[
          {icon:ChevronLeft,  fn:()=>setCur(d=>new Date(d.getFullYear(),d.getMonth()-1))},
          {icon:ChevronRight, fn:()=>setCur(d=>new Date(d.getFullYear(),d.getMonth()+1))},
        ].map(({icon:Icon},i)=>(
          <button key={i} onClick={i===0?()=>setCur(d=>new Date(d.getFullYear(),d.getMonth()-1)):()=>setCur(d=>new Date(d.getFullYear(),d.getMonth()+1))}
            className="btn-outline h-8 w-8 flex items-center justify-center rounded-sm">
            <Icon className="h-4 w-4"/>
          </button>
        ))}
        <span className="font-semibold text-sm min-w-40 text-center"
          style={{color:C.ink,fontFamily:"'Playfair Display',serif"}}>{ml}</span>
        <button onClick={()=>setCur(new Date())}
          className="btn-outline text-xs h-8 px-3 rounded-sm"
          style={{color:C.stone2}}>Bugun</button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="skeleton h-24"/>)}</div>
      ) : diaries.length===0 ? (
        <div className="flex flex-col items-center py-20" style={{color:C.stone}}>
          <BookOpen className="h-10 w-10 mb-3 opacity-30"/>
          <p className="font-semibold" style={{color:C.ink3}}>Bu oyda yozuv yo'q</p>
          <button onClick={openCreate} className="btn-outline mt-4 h-9 px-4 text-sm">Qo'shish</button>
        </div>
      ) : view==="timeline" ? (
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-px"
            style={{background:"linear-gradient(180deg,var(--gold),rgba(200,168,112,.1))"}}/>
          <div className="space-y-4 pl-16">
            {diaries.map((d,i)=>(
              <div key={d.id} className="relative anim-cardIn" style={{animationDelay:`${i*.06}s`}}>
                {/* Timeline dot */}
                <div className="absolute -left-[42px] top-4 h-5 w-5 rounded-full flex items-center justify-center"
                  style={{background:C.white,border:`1px solid rgba(200,168,112,.3)`,
                    boxShadow:"0 0 0 3px rgba(200,168,112,.1)"}}>
                  <div className="h-2 w-2 rounded-full" style={{background:"var(--gold)"}}/>
                </div>
                {/* Date */}
                <div className="absolute -left-[112px] w-[64px] text-right top-3.5">
                  <p className="font-black text-sm leading-none"
                    style={{color:C.stone2,fontFamily:"'Playfair Display',serif"}}>{new Date(d.date).getDate()}</p>
                  <p className="text-[9px]" style={{color:C.stone,textTransform:"uppercase"}}>
                    {MN[new Date(d.date).getMonth()].slice(0,3)}
                  </p>
                </div>

                <div className="card-premium group">
                  <div style={{height:1,background:"linear-gradient(90deg,transparent,rgba(200,168,112,.2),transparent)"}}/>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Link href={`/diary/${d.id}`}>
                            <h3 className="font-bold text-sm hover:opacity-70 transition-opacity"
                              style={{color:C.ink,fontFamily:"'Playfair Display',serif"}}>{d.title}</h3>
                          </Link>
                          {d.mood&&<span className="text-base">{MOODS.find(m=>m.v===d.mood)?.e}</span>}
                        </div>
                        {d.description&&<p className="text-xs line-clamp-2" style={{color:C.stone2}}>{d.description}</p>}
                        {d.workDone&&<p className="text-xs mt-1 line-clamp-1" style={{color:C.stone}}>✅ {d.workDone}</p>}
                        {d.projects.length>0&&(
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {d.projects.map(dp=>(
                              <Link key={dp.project.id} href={`/projects/${dp.project.id}`}>
                                <span className="text-[10px] px-2 py-0.5 rounded-sm"
                                  style={{background:C.cream2,border:`1px solid ${C.border}`,color:C.ink3}}>
                                  {dp.project.name}
                                </span>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        {[{Icon:Edit,fn:()=>openEdit(d)},{Icon:Trash2,fn:()=>del(d.id)}].map(({Icon,fn},j)=>(
                          <button key={j} onClick={fn}
                            className="h-7 w-7 rounded flex items-center justify-center transition-colors"
                            style={{color:C.stone}}
                            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background=C.cream2}}
                            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="transparent"}}>
                            <Icon className="h-3.5 w-3.5"/>
                          </button>
                        ))}
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
            <div key={d.id} className="card-premium flex items-center gap-4 p-4 group anim-cardIn"
              style={{animationDelay:`${i*.05}s`}}>
              <div className="w-11 text-center flex-shrink-0">
                <p className="font-black text-lg leading-none"
                  style={{color:C.stone2,fontFamily:"'Playfair Display',serif"}}>{new Date(d.date).getDate()}</p>
                <p className="text-[8px]" style={{color:C.stone,textTransform:"uppercase"}}>
                  {MN[new Date(d.date).getMonth()].slice(0,3)}
                </p>
              </div>
              <div style={{width:1,height:28,background:"rgba(200,168,112,.2)"}}/>
              <div className="flex-1 min-w-0">
                <Link href={`/diary/${d.id}`}>
                  <h3 className="font-semibold text-sm truncate hover:opacity-70 transition-opacity"
                    style={{color:C.ink}}>{d.title}</h3>
                </Link>
                {d.description&&<p className="text-xs line-clamp-1 mt-0.5" style={{color:C.stone2}}>{d.description}</p>}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {[{Icon:Edit,fn:()=>openEdit(d)},{Icon:Trash2,fn:()=>del(d.id)}].map(({Icon,fn},j)=>(
                  <button key={j} onClick={fn}
                    className="h-7 w-7 rounded flex items-center justify-center transition-colors"
                    style={{color:C.stone}}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background=C.cream2}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="transparent"}}>
                    <Icon className="h-3.5 w-3.5"/>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-sm"
          style={{background:C.white,border:`1px solid ${C.border}`,boxShadow:"var(--shadow-xl)"}}>
          <div style={{height:2,background:"linear-gradient(90deg,transparent,var(--gold),transparent)",marginBottom:4}}/>
          <DialogHeader>
            <DialogTitle style={{color:C.ink,fontFamily:"'Playfair Display',serif",fontWeight:800}}>
              {editing?"Tahrirlash":"Yangi Yozuv"}
            </DialogTitle>
            <DialogDescription style={{color:C.stone2}}>Kundalik yozuvini to'ldiring</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1.5">
              <label style={{fontSize:9,color:C.stone2,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase" as const}}>Sana</label>
              <input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}
                className="w-full h-10 px-3 text-sm" style={inputSt}/>
            </div>
            <div className="space-y-1.5">
              <label style={{fontSize:9,color:C.stone2,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase" as const}}>Kayfiyat</label>
              <div className="flex gap-2 h-10 items-center">
                {MOODS.map(m=>(
                  <button key={m.v} type="button" onClick={()=>setForm(f=>({...f,mood:f.mood===m.v?"":m.v}))}
                    className="text-xl px-1 py-0.5 rounded transition-all"
                    style={{background:form.mood===m.v?C.cream3:"transparent",
                      border:`1px solid ${form.mood===m.v?C.border:"transparent"}`}}>
                    {m.e}
                  </button>
                ))}
              </div>
            </div>
            <div className="col-span-2 space-y-1.5">
              <label style={{fontSize:9,color:C.stone2,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase" as const}}>Sarlavha *</label>
              <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}
                className="w-full h-10 px-3 text-sm" style={inputSt}/>
            </div>
            {[
              {f:"description",l:"Tavsif",r:2},{f:"workDone",l:"✅ Bajarilgan ishlar",r:3},
              {f:"problems",l:"⚠️ Muammolar",r:3},{f:"decisions",l:"💡 Qarorlar",r:3},
            ].map(x=>(
              <div key={x.f} className="col-span-2 sm:col-span-1 space-y-1.5">
                <label style={{fontSize:9,color:C.stone2,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase" as const}}>{x.l}</label>
                <textarea rows={x.r} value={(form as any)[x.f]} onChange={e=>setForm(p=>({...p,[x.f]:e.target.value}))}
                  className="w-full px-3 py-2 text-sm resize-none" style={inputSt}/>
              </div>
            ))}
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
