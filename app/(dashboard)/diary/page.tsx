"use client"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Plus, BookOpen, ChevronLeft, ChevronRight, Edit, Trash2, Calendar, Smile } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface Diary {
  id:string; date:string; title:string; description:string|null
  workDone:string|null; problems:string|null; decisions:string|null; mood:string|null
  projects: { project: { id:string; name:string } }[]
}

const MOODS = [
  { v:"GREAT",   label:"😄", name:"Ajoyib",  bg:"bg-emerald-50 dark:bg-emerald-950/40", ring:"ring-emerald-400" },
  { v:"GOOD",    label:"🙂", name:"Yaxshi",  bg:"bg-blue-50 dark:bg-blue-950/40",     ring:"ring-blue-400" },
  { v:"NEUTRAL", label:"😐", name:"Oddiy",   bg:"bg-slate-50 dark:bg-slate-800",       ring:"ring-slate-400" },
  { v:"BAD",     label:"😞", name:"Yomon",   bg:"bg-red-50 dark:bg-red-950/40",        ring:"ring-red-400" },
]
const MONTHS_UZ = ["Yanvar","Fevral","Mart","Aprel","May","Iyun","Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr"]
const DAYS_UZ   = ["Yak","Du","Se","Cho","Pa","Ju","Sha"]
const EMPTY = { date: new Date().toISOString().split("T")[0], title:"", description:"", workDone:"", problems:"", decisions:"", mood:"" }

export default function DiaryPage() {
  const [diaries,  setDiaries]  = useState<Diary[]>([])
  const [loading,  setLoading]  = useState(true)
  const [curMonth, setCurMonth] = useState(new Date())
  const [open,     setOpen]     = useState(false)
  const [editing,  setEditing]  = useState<Diary|null>(null)
  const [form,     setForm]     = useState(EMPTY)
  const [saving,   setSaving]   = useState(false)
  const [view,     setView]     = useState<"timeline"|"calendar">("timeline")
  const { toast } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    const m = curMonth.getMonth() + 1
    const y = curMonth.getFullYear()
    const data = await fetch(`/api/diary?month=${m}&year=${y}`).then(r => r.json())
    setDiaries(data); setLoading(false)
  }, [curMonth])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setEditing(null); setForm({ ...EMPTY, date: new Date().toISOString().split("T")[0] }); setOpen(true) }
  const openEdit = (d: Diary) => {
    setEditing(d)
    setForm({ date: d.date.split("T")[0], title: d.title, description: d.description ?? "",
      workDone: d.workDone ?? "", problems: d.problems ?? "", decisions: d.decisions ?? "", mood: d.mood ?? "" })
    setOpen(true)
  }

  const save = async () => {
    if (!form.title.trim()) return toast({ variant:"destructive", title:"Sarlavha kiritilishi shart" })
    setSaving(true)
    try {
      const res = await fetch(editing ? `/api/diary/${editing.id}` : "/api/diary", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      toast({ title: editing ? "Yangilandi ✓" : "Yaratildi ✓" }); setOpen(false); load()
    } catch { toast({ variant:"destructive", title:"Xatolik" }) }
    finally { setSaving(false) }
  }

  const del = async (id: string) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return
    await fetch(`/api/diary/${id}`, { method:"DELETE" })
    toast({ title:"O'chirildi" }); load()
  }

  const prevMonth = () => setCurMonth(d => new Date(d.getFullYear(), d.getMonth() - 1))
  const nextMonth = () => setCurMonth(d => new Date(d.getFullYear(), d.getMonth() + 1))
  const monthLabel = `${MONTHS_UZ[curMonth.getMonth()]} ${curMonth.getFullYear()}`

  const getMoodInfo = (mood: string | null) => MOODS.find(m => m.v === mood)

  return (
    <div className="space-y-8 page-enter arch-pattern">

      {/* ── Header ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-8 text-white">
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none hidden lg:block">
          <svg width="180" height="180" viewBox="0 0 180 180" className="animate-float-slow">
            <rect x="20" y="20" width="140" height="180" rx="8" fill="none" stroke="white" strokeWidth="1.5"/>
            <line x1="20" y1="48" x2="160" y2="48" stroke="white" strokeWidth="1"/>
            <line x1="40" y1="68" x2="140" y2="68" stroke="white" strokeWidth="0.5" strokeDasharray="3 2"/>
            <line x1="40" y1="84" x2="120" y2="84" stroke="white" strokeWidth="0.5" strokeDasharray="3 2"/>
            <line x1="40" y1="100" x2="130" y2="100" stroke="white" strokeWidth="0.5" strokeDasharray="3 2"/>
            <line x1="40" y1="116" x2="110" y2="116" stroke="white" strokeWidth="0.5" strokeDasharray="3 2"/>
            <circle cx="32" cy="68" r="3" fill="white" opacity="0.6"/>
            <circle cx="32" cy="84" r="3" fill="white" opacity="0.6"/>
            <circle cx="32" cy="100" r="3" fill="white" opacity="0.6"/>
            <circle cx="32" cy="116" r="3" fill="white" opacity="0.6"/>
          </svg>
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-10 w-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Kundalik</h2>
                <p className="text-emerald-200 text-sm">{diaries.length} ta yozuv · {monthLabel}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex border border-white/20 rounded-xl overflow-hidden bg-white/10">
              <button onClick={() => setView("timeline")}
                className={cn("px-4 py-2 text-sm font-medium transition-colors",
                  view === "timeline" ? "bg-white text-emerald-800" : "text-white hover:bg-white/10")}>
                Timeline
              </button>
              <button onClick={() => setView("calendar")}
                className={cn("px-4 py-2 text-sm font-medium transition-colors",
                  view === "calendar" ? "bg-white text-emerald-800" : "text-white hover:bg-white/10")}>
                Ro'yxat
              </button>
            </div>
            <Button onClick={openCreate} className="bg-white text-emerald-700 hover:bg-emerald-50 gap-2 rounded-xl h-10 px-5 font-semibold shadow-lg">
              <Plus className="h-4 w-4" /> Yozuv
            </Button>
          </div>
        </div>
      </div>

      {/* ── Month nav ── */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={prevMonth} className="h-10 w-10 rounded-xl">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="font-bold text-lg min-w-44 text-center text-slate-800 dark:text-white">{monthLabel}</span>
        <Button variant="outline" size="icon" onClick={nextMonth} className="h-10 w-10 rounded-xl">
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setCurMonth(new Date())} className="rounded-xl text-slate-500 hover:text-slate-800">
          Bugun
        </Button>
        {/* Mood summary */}
        <div className="ml-auto flex gap-2">
          {MOODS.map(m => {
            const count = diaries.filter(d => d.mood === m.v).length
            if (!count) return null
            return (
              <div key={m.v} className={cn("flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium", m.bg)}>
                <span>{m.label}</span><span className="font-bold">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="skeleton h-28 rounded-2xl" style={{ animationDelay: `${i*0.1}s` }} />)}
        </div>
      ) : diaries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <div className="h-20 w-20 rounded-3xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mb-4 animate-float">
            <BookOpen className="h-10 w-10 text-emerald-300" />
          </div>
          <p className="text-lg font-semibold text-slate-500">Bu oyda yozuv yo'q</p>
          <Button onClick={openCreate} className="mt-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2">
            <Plus className="h-4 w-4" /> Birinchi yozuv
          </Button>
        </div>
      ) : view === "timeline" ? (
        /* ── Timeline ── */
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-300 via-emerald-200 to-transparent dark:from-emerald-800 dark:via-emerald-900" />
          <div className="space-y-6 pl-20">
            {diaries.map((d, i) => {
              const moodInfo = getMoodInfo(d.mood)
              const dayNum = new Date(d.date).getDate()
              const dayName = DAYS_UZ[new Date(d.date).getDay()]
              return (
                <div key={d.id} className="relative animate-slide-left"
                  style={{ animationDelay: `${i * 0.08}s` }}>
                  {/* Timeline dot */}
                  <div className="absolute -left-[52px] top-5 flex flex-col items-center">
                    <div className={cn(
                      "h-10 w-10 rounded-xl bg-white dark:bg-slate-900 border-2 border-emerald-300 dark:border-emerald-700",
                      "flex flex-col items-center justify-center shadow-sm timeline-dot"
                    )}>
                      <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 leading-none">{dayNum}</span>
                      <span className="text-[9px] text-emerald-500 uppercase font-medium">{dayName}</span>
                    </div>
                  </div>

                  {/* Card */}
                  <div className="diary-card bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 group">
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Link href={`/diary/${d.id}`}>
                              <h3 className="font-bold text-slate-800 dark:text-white hover:text-emerald-600 transition-colors text-base">
                                {d.title}
                              </h3>
                            </Link>
                            {moodInfo && (
                              <span className={cn("text-xs px-2 py-0.5 rounded-lg font-medium", moodInfo.bg)}>
                                {moodInfo.label} {moodInfo.name}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mb-2">{formatDate(d.date)}</p>
                          {d.description && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{d.description}</p>
                          )}
                          <div className="flex flex-wrap gap-3 mt-3">
                            {d.workDone && (
                              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-lg">
                                <span>✅</span><span className="line-clamp-1 max-w-36">{d.workDone.slice(0,40)}{d.workDone.length > 40 ? '...' : ''}</span>
                              </div>
                            )}
                            {d.problems && (
                              <div className="flex items-center gap-1.5 text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 px-2.5 py-1 rounded-lg">
                                <span>⚠️</span><span className="line-clamp-1 max-w-36">{d.problems.slice(0,40)}{d.problems.length > 40 ? '...' : ''}</span>
                              </div>
                            )}
                          </div>
                          {d.projects.length > 0 && (
                            <div className="flex gap-1.5 mt-2 flex-wrap">
                              {d.projects.map(dp => (
                                <Link key={dp.project.id} href={`/projects/${dp.project.id}`}>
                                  <span className="text-xs px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 hover:bg-blue-100 transition-colors">
                                    📐 {dp.project.name}
                                  </span>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/30" onClick={() => openEdit(d)}>
                            <Edit className="h-3.5 w-3.5 text-slate-400" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30" onClick={() => del(d.id)}>
                            <Trash2 className="h-3.5 w-3.5 text-red-400" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        /* ── List view ── */
        <div className="space-y-3">
          {diaries.map((d, i) => {
            const moodInfo = getMoodInfo(d.mood)
            return (
              <div key={d.id} className="animate-slide-up" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all group hover:shadow-md hover:shadow-emerald-500/5">
                  <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex flex-col items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                    <span className="text-xl font-bold leading-none">{new Date(d.date).getDate()}</span>
                    <span className="text-[10px] font-medium opacity-80">{MONTHS_UZ[new Date(d.date).getMonth()].slice(0,3)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link href={`/diary/${d.id}`}>
                        <h3 className="font-bold text-slate-800 dark:text-white hover:text-emerald-600 transition-colors truncate">{d.title}</h3>
                      </Link>
                      {moodInfo && <span>{moodInfo.label}</span>}
                    </div>
                    {d.description && <p className="text-sm text-slate-400 line-clamp-1 mt-0.5">{d.description}</p>}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={() => openEdit(d)}>
                      <Edit className="h-3.5 w-3.5 text-slate-400" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={() => del(d.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-red-400" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Dialog ── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{editing ? "Tahrirlash" : "Yangi Yozuv"}</DialogTitle>
            <DialogDescription>Kundalik yozuvini to'ldiring</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            <div className="space-y-1.5"><Label>Sana *</Label>
              <Input type="date" value={form.date} className="rounded-xl h-11"
                onChange={e => setForm(f => ({...f, date: e.target.value}))} /></div>
            <div className="space-y-1.5">
              <Label>Kayfiyat</Label>
              <div className="flex gap-2">
                {MOODS.map(m => (
                  <button key={m.v} type="button" onClick={() => setForm(f => ({...f, mood: f.mood === m.v ? "" : m.v}))}
                    className={cn("text-2xl p-2 rounded-xl transition-all border-2",
                      form.mood === m.v ? cn("ring-2", m.ring, m.bg, "border-transparent scale-110") : "border-slate-100 dark:border-slate-800 hover:scale-105")}>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2 space-y-1.5"><Label>Sarlavha *</Label>
              <Input placeholder="Bugungi kun sarlavhasi..." value={form.title} className="rounded-xl h-11"
                onChange={e => setForm(f => ({...f, title: e.target.value}))} /></div>
            <div className="sm:col-span-2 space-y-1.5"><Label>Tavsif</Label>
              <Textarea rows={2} placeholder="Bugun nima bo'ldi..." value={form.description} className="rounded-xl resize-none"
                onChange={e => setForm(f => ({...f, description: e.target.value}))} /></div>
            <div className="sm:col-span-2 space-y-1.5"><Label>✅ Bajarilgan ishlar</Label>
              <Textarea rows={3} placeholder="Bugun nima bajardim..." value={form.workDone} className="rounded-xl resize-none"
                onChange={e => setForm(f => ({...f, workDone: e.target.value}))} /></div>
            <div className="space-y-1.5"><Label>⚠️ Muammolar</Label>
              <Textarea rows={3} placeholder="Qanday to'siqlar..." value={form.problems} className="rounded-xl resize-none"
                onChange={e => setForm(f => ({...f, problems: e.target.value}))} /></div>
            <div className="space-y-1.5"><Label>💡 Qarorlar</Label>
              <Textarea rows={3} placeholder="Qabul qilingan qarorlar..." value={form.decisions} className="rounded-xl resize-none"
                onChange={e => setForm(f => ({...f, decisions: e.target.value}))} /></div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl">Bekor</Button>
            <Button onClick={save} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
              {saving ? "Saqlanmoqda..." : editing ? "Saqlash" : "Yaratish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
