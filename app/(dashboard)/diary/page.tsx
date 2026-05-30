"use client"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Plus, BookOpen, ChevronLeft, ChevronRight, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/utils"

interface Diary {
  id:string; date:string; title:string; description:string|null
  workDone:string|null; problems:string|null; decisions:string|null; mood:string|null
  projects: { project: { id:string; name:string } }[]
}

const MOODS = [{ v:"GREAT",label:"😄"},{ v:"GOOD",label:"🙂"},{ v:"NEUTRAL",label:"😐"},{ v:"BAD",label:"😞"}]
const MONTHS_UZ = ["Yanvar","Fevral","Mart","Aprel","May","Iyun","Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr"]
const EMPTY = { date: new Date().toISOString().split("T")[0], title:"", description:"", workDone:"", problems:"", decisions:"", mood:"" }

export default function DiaryPage() {
  const [diaries, setDiaries]   = useState<Diary[]>([])
  const [loading, setLoading]   = useState(true)
  const [curMonth, setCurMonth] = useState(new Date())
  const [open, setOpen]         = useState(false)
  const [editing, setEditing]   = useState<Diary|null>(null)
  const [form, setForm]         = useState(EMPTY)
  const [saving, setSaving]     = useState(false)
  const [view, setView]         = useState<"timeline"|"list">("timeline")
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      toast({ title: editing ? "Yangilandi" : "Yaratildi" }); setOpen(false); load()
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Kundalik</h2>
          <p className="text-sm text-muted-foreground">{diaries.length} ta yozuv</p>
        </div>
        <div className="flex gap-2">
          <div className="flex border rounded-lg overflow-hidden text-sm">
            <button onClick={() => setView("timeline")} className={`px-3 py-1.5 font-medium transition-colors ${view==="timeline" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>Timeline</button>
            <button onClick={() => setView("list")}     className={`px-3 py-1.5 font-medium transition-colors ${view==="list"     ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>Ro'yxat</button>
          </div>
          <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" />Yozuv qo'shish</Button>
        </div>
      </div>

      {/* Month nav */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
        <span className="font-semibold min-w-40 text-center">{monthLabel}</span>
        <Button variant="outline" size="icon" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
        <Button variant="ghost" size="sm" onClick={() => setCurMonth(new Date())}>Bugun</Button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />)}</div>
      ) : diaries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <BookOpen className="h-16 w-16 mb-4 opacity-20" />
          <p className="text-lg font-medium">Bu oyda yozuv yo'q</p>
          <Button onClick={openCreate} variant="outline" className="mt-4 gap-2"><Plus className="h-4 w-4" />Birinchi yozuv</Button>
        </div>
      ) : view === "timeline" ? (
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-5 pl-16">
            {diaries.map(d => (
              <div key={d.id} className="relative">
                <div className="absolute -left-[42px] h-5 w-5 rounded-full border-2 border-blue-500 bg-background flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                </div>
                <div className="absolute -left-[112px] text-right w-[60px]">
                  <p className="text-sm font-bold text-muted-foreground leading-none">{new Date(d.date).getDate()}</p>
                  <p className="text-xs text-muted-foreground">{MONTHS_UZ[new Date(d.date).getMonth()].slice(0,3)}</p>
                </div>
                <Card className="hover:shadow-md transition-shadow group">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Link href={`/diary/${d.id}`}><h3 className="font-semibold hover:text-blue-600 transition-colors">{d.title}</h3></Link>
                          {d.mood && <span className="text-lg">{MOODS.find(m => m.v === d.mood)?.label}</span>}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{formatDate(d.date)}</p>
                        {d.description && <p className="text-sm text-muted-foreground line-clamp-2">{d.description}</p>}
                        {d.workDone && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">✅ {d.workDone}</p>}
                        {d.projects.length > 0 && (
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {d.projects.map(dp => <Link key={dp.project.id} href={`/projects/${dp.project.id}`}><Badge variant="outline" className="text-xs hover:bg-muted">📐 {dp.project.name}</Badge></Link>)}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(d)}><Edit className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => del(d.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {diaries.map(d => (
            <Card key={d.id} className="hover:shadow-sm transition-shadow group">
              <CardContent className="pt-3 pb-3">
                <div className="flex items-center gap-4">
                  <div className="text-center bg-blue-50 dark:bg-blue-950/50 rounded-lg px-3 py-2 flex-shrink-0 w-16">
                    <p className="text-xl font-bold text-blue-700 dark:text-blue-300 leading-none">{new Date(d.date).getDate()}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">{MONTHS_UZ[new Date(d.date).getMonth()].slice(0,3)}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/diary/${d.id}`}><h3 className="font-semibold hover:text-blue-600 transition-colors truncate">{d.title}</h3></Link>
                    {d.description && <p className="text-sm text-muted-foreground line-clamp-1">{d.description}</p>}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(d)}><Edit className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => del(d.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Tahrirlash" : "Yangi Yozuv"}</DialogTitle><DialogDescription>Kundalik yozuvini to'ldiring</DialogDescription></DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            <div className="space-y-1.5"><Label>Sana *</Label><Input type="date" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))} /></div>
            <div className="space-y-1.5">
              <Label>Kayfiyat</Label>
              <div className="flex gap-2">
                {MOODS.map(m => <button key={m.v} type="button" onClick={() => setForm(f => ({...f, mood: f.mood === m.v ? "" : m.v}))} className={`text-xl px-2 py-1 rounded-lg transition-all ${form.mood === m.v ? "bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500" : "hover:bg-muted"}`}>{m.label}</button>)}
              </div>
            </div>
            <div className="sm:col-span-2 space-y-1.5"><Label>Sarlavha *</Label><Input placeholder="Bugungi kun sarlavhasi..." value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} /></div>
            <div className="sm:col-span-2 space-y-1.5"><Label>Umumiy tavsif</Label><Textarea rows={2} placeholder="Bugun nima bo'ldi..." value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} /></div>
            <div className="sm:col-span-2 space-y-1.5"><Label>✅ Bajarilgan ishlar</Label><Textarea rows={3} placeholder="Bugun nima bajardim..." value={form.workDone} onChange={e => setForm(f => ({...f, workDone: e.target.value}))} /></div>
            <div className="space-y-1.5"><Label>⚠️ Muammolar</Label><Textarea rows={3} placeholder="Qanday to'siqlar bo'ldi..." value={form.problems} onChange={e => setForm(f => ({...f, problems: e.target.value}))} /></div>
            <div className="space-y-1.5"><Label>💡 Qarorlar</Label><Textarea rows={3} placeholder="Qanday qarorlar qabul qilindi..." value={form.decisions} onChange={e => setForm(f => ({...f, decisions: e.target.value}))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Bekor</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Saqlanmoqda..." : editing ? "Saqlash" : "Yaratish"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
