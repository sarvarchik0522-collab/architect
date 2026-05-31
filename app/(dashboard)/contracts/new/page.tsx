"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { cn, formatCurrency } from "@/lib/utils"

interface WorkItem { name: string; unit: string; qty: number; price: number }

/* Warm palette */
const C = { ink:"var(--ink)", ink3:"var(--ink3)", cream:"var(--cream)", cream2:"var(--cream2)", stone:"var(--stone)", stone2:"var(--stone2)", white:"var(--white)", border:"rgba(200,168,112,.14)", gold:"var(--gold)" }
const inputSt = { background:C.cream, border:`1px solid ${C.border}`, borderRadius:3, color:C.ink, outline:"none" } as React.CSSProperties
const labelSt = { fontSize:9, color:C.stone2, fontWeight:700, letterSpacing:".14em", textTransform:"uppercase" as const }

const EMPTY_FORM = {
  contractNumber: `SH-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
  title: "", status: "DRAFT",
  clientName: "", clientPhone: "", clientEmail: "", clientAddress: "", clientPassport: "",
  architectName: "", architectPhone: "", architectAddress: "",
  projectName: "", projectAddress: "", projectType: "",
  startDate: "", endDate: "",
  totalAmount: 0, advanceAmount: 0,
  terms: `1. Arxitektor kelishilgan muddatda loyiha ishlarini bajarish majburiyatini oladi.\n2. Buyurtmachi avans to'lovini shartnoma imzolangandan so'ng 3 ish kuni ichida to'laydi.\n3. Loyiha yakunlangandan so'ng qolgan to'lov 5 ish kuni ichida amalga oshiriladi.\n4. Kechikish holati ikki tomon kelishuviga ko'ra hal etiladi.`,
  projectId: "none", clientId: "none",
}

export default function NewContractPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [form,     setForm]     = useState({ ...EMPTY_FORM })
  const [items,    setItems]    = useState<WorkItem[]>([
    { name: "", unit: "dona", qty: 1, price: 0 }
  ])
  const [saving,   setSaving]   = useState(false)
  const [clients,  setClients]  = useState<{ id: string; name: string; phone?: string; address?: string }[]>([])
  const [projects, setProjects] = useState<{ id: string; name: string; address?: string }[]>([])

  useEffect(() => {
    fetch("/api/clients").then(r => r.json()).then(setClients)
    fetch("/api/projects").then(r => r.json()).then(d => setProjects(d.map((p: any) => ({ id: p.id, name: p.name, address: p.address }))))
  }, [])

  const totalAmount = items.reduce((s, it) => s + it.qty * it.price, 0)

  const addItem = () => setItems(it => [...it, { name:"", unit:"dona", qty:1, price:0 }])
  const removeItem = (i: number) => setItems(it => it.filter((_,idx) => idx !== i))
  const updateItem = (i: number, field: keyof WorkItem, val: string | number) =>
    setItems(it => it.map((item, idx) => idx === i ? { ...item, [field]: val } : item))

  const fillFromClient = (clientId: string) => {
    const c = clients.find(c => c.id === clientId)
    if (c) setForm(f => ({ ...f, clientId, clientName: c.name, clientPhone: c.phone ?? "", clientAddress: "" }))
  }
  const fillFromProject = (projectId: string) => {
    const p = projects.find(p => p.id === projectId)
    if (p) setForm(f => ({ ...f, projectId, projectName: p.name, projectAddress: p.address ?? "" }))
  }

  const save = async () => {
    if (!form.clientName || !form.projectName || !form.architectName) {
      return toast({ variant:"destructive", title:"Mijoz, loyiha va arxitektor nomi kiritilishi shart" })
    }
    setSaving(true)
    try {
      const workItemsText = items.map((it, i) =>
        `${i+1}. ${it.name} — ${it.qty} ${it.unit} × ${formatCurrency(it.price)} = ${formatCurrency(it.qty * it.price)}`
      ).join("\n")

      const res = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({
          ...form,
          totalAmount,
          advanceAmount: form.advanceAmount || 0,
          workItems: workItemsText,
          projectId: form.projectId === "none" ? null : form.projectId || null,
          clientId:  form.clientId  === "none" ? null : form.clientId  || null,
          startDate: form.startDate || null,
          endDate:   form.endDate   || null,
        }),
      })
      if (!res.ok) throw new Error()
      const contract = await res.json()
      toast({ title:"✅ Shartnoma yaratildi" })
      router.push(`/contracts/${contract.id}`)
    } catch {
      toast({ variant:"destructive", title:"Xatolik" })
    } finally { setSaving(false) }
  }

  const inputCls = "h-10 px-3 text-sm rounded-sm"
  const labelCls = "text-[9px] font-bold uppercase tracking-wider"

  return (
    <div className="max-w-4xl space-y-6 anim-page">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <Link href="/contracts">
          <button className="btn-outline h-9 px-3 text-sm flex items-center gap-1.5">
            <ArrowLeft className="h-4 w-4" /> Orqaga
          </button>
        </Link>
        <button onClick={save} disabled={saving} className="btn-ink h-9 px-4 text-sm flex items-center gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Saqlanmoqda..." : "Shartnomani Saqlash"}
        </button>
      </div>

      <div className="card-premium p-6 space-y-6">
        <div className="flex items-center gap-3 pb-4" style={{ borderBottom:`1px solid rgba(200,168,112,.12)` }}>
          <div style={{ width:16, height:1, background:"var(--gold)", opacity:.6 }}/>
          <span className="text-xl">📜</span>
          <div>
            <h2 className="text-xl font-black tracking-tight"
              style={{ fontFamily:"'Playfair Display',serif", color:C.ink }}>Yangi Shartnoma</h2>
            <p className="text-xs" style={{ color:C.stone2 }}>Barcha maydonlarni to'ldiring</p>
          </div>
        </div>

        {/* Contract info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className={labelCls} style={{ color:C.stone2 }}>Shartnoma raqami *</label>
            <input value={form.contractNumber} onChange={e => setForm(f => ({...f, contractNumber: e.target.value}))}
              className={`w-full ${inputCls}`} style={inputSt}
              onFocus={e=>{e.target.style.borderColor=C.stone2}} onBlur={e=>{e.target.style.borderColor=C.border}}/>
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <label className={labelCls} style={{ color:C.stone2 }}>Sarlavha *</label>
            <input placeholder="Loyiha arxitektura xizmatlari shartnomasi" value={form.title}
              onChange={e => setForm(f => ({...f, title: e.target.value}))}
              className={`w-full ${inputCls}`} style={inputSt}
              onFocus={e=>{e.target.style.borderColor=C.stone2}} onBlur={e=>{e.target.style.borderColor=C.border}}/>
          </div>
        </div>

        {/* 2 columns: Client + Architect */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Client */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2" style={{ borderBottom:`1px solid rgba(200,168,112,.12)` }}>
              <span>👤</span>
              <p style={{ ...labelSt, color:C.stone2 }}>Buyurtmachi</p>
            </div>
            <div className="space-y-1.5">
              <label style={labelSt} className="block" style={{ color:C.stone2 }}>Bazadan tanlash</label>
              <Select value={form.clientId} onValueChange={fillFromClient}>
                <SelectTrigger className="h-10 rounded-sm text-sm" style={{ background:C.cream, border:`1px solid ${C.border}`, color:C.ink3 }}>
                  <SelectValue placeholder="Mijoz tanlang"/>
                </SelectTrigger>
                <SelectContent style={{ background:C.white, border:`1px solid ${C.border}` }}>
                  <SelectItem value="none" style={{ color:C.stone2 }}>— Qo'lda kiritish —</SelectItem>
                  {clients.map(c => <SelectItem key={c.id} value={c.id} style={{ color:C.ink3 }}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {[
              { field:"clientName",    label:"Ism-familiya *",  placeholder:"Toshmatov Bobur" },
              { field:"clientPassport",label:"Pasport seriya",  placeholder:"AA 1234567" },
              { field:"clientPhone",   label:"Telefon",         placeholder:"+998 90 123 45 67" },
              { field:"clientAddress", label:"Manzil",          placeholder:"Toshkent, Chilonzor 14" },
            ].map(f => (
              <div key={f.field} className="space-y-1.5">
                <label style={labelSt} className="block" style={{ color:C.stone2 }}>{f.label}</label>
                <input placeholder={f.placeholder} value={(form as any)[f.field]}
                  onChange={e => setForm(prev => ({...prev, [f.field]: e.target.value}))}
                  className="w-full h-10 px-3 text-sm" style={inputSt}
                  onFocus={e=>{e.target.style.borderColor=C.stone2}} onBlur={e=>{e.target.style.borderColor=C.border}}/>
              </div>
            ))}
          </div>

          {/* Architect */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2" style={{ borderBottom:`1px solid rgba(200,168,112,.12)` }}>
              <span>🏛️</span>
              <p style={{ ...labelSt, color:C.stone2 }}>Arxitektor (Ijrochi)</p>
            </div>
            {[
              { field:"architectName",    label:"Ism-familiya *",  placeholder:"Sarvarbek Mamatov" },
              { field:"architectPhone",   label:"Telefon",         placeholder:"+998 90 000 00 00" },
              { field:"architectAddress", label:"Manzil/Studiya",  placeholder:"Toshkent, Yunusobod 19" },
            ].map(f => (
              <div key={f.field} className="space-y-1.5">
                <label style={labelSt} className="block" style={{ color:C.stone2 }}>{f.label}</label>
                <input placeholder={f.placeholder} value={(form as any)[f.field]}
                  onChange={e => setForm(prev => ({...prev, [f.field]: e.target.value}))}
                  className="w-full h-10 px-3 text-sm" style={inputSt}
                  onFocus={e=>{e.target.style.borderColor=C.stone2}} onBlur={e=>{e.target.style.borderColor=C.border}}/>
              </div>
            ))}
          </div>
        </div>

        {/* Project info */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2" style={{ borderBottom:`1px solid rgba(200,168,112,.12)` }}>
            <span>📐</span>
            <p style={{ ...labelSt, color:C.stone2 }}>Loyiha ma'lumotlari</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label style={labelSt} className="block" style={{ color:C.stone2 }}>Loyihadan tanlash</label>
              <Select value={form.projectId} onValueChange={fillFromProject}>
                <SelectTrigger className="h-10 rounded-sm text-sm" style={{ background:C.cream, border:`1px solid ${C.border}`, color:C.ink3 }}>
                  <SelectValue placeholder="Loyiha tanlang"/>
                </SelectTrigger>
                <SelectContent style={{ background:C.white, border:`1px solid ${C.border}` }}>
                  <SelectItem value="none" style={{ color:C.stone2 }}>— Qo'lda kiritish —</SelectItem>
                  {projects.map(p => <SelectItem key={p.id} value={p.id} style={{ color:C.ink3 }}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {[
              { f:"projectType",    l:"Loyiha turi",    ph:"Turar-joy, Savdo markazi..." },
              { f:"projectName",    l:"Loyiha nomi *",  ph:"Loyiha nomi" },
              { f:"projectAddress", l:"Manzil",         ph:"Qurilish manzili" },
            ].map(x=>(
              <div key={x.f} className="space-y-1.5">
                <label style={labelSt} className="block" style={{ color:C.stone2 }}>{x.l}</label>
                <input placeholder={x.ph} value={(form as any)[x.f]}
                  onChange={e=>setForm(f=>({...f,[x.f]:e.target.value}))}
                  className="w-full h-10 px-3 text-sm" style={inputSt}
                  onFocus={e=>{e.target.style.borderColor=C.stone2}} onBlur={e=>{e.target.style.borderColor=C.border}}/>
              </div>
            ))}
            {[{f:"startDate",l:"Boshlanish"},{f:"endDate",l:"Tugash"}].map(x=>(
              <div key={x.f} className="space-y-1.5">
                <label style={labelSt} className="block" style={{ color:C.stone2 }}>{x.l}</label>
                <input type="date" value={(form as any)[x.f]}
                  onChange={e=>setForm(f=>({...f,[x.f]:e.target.value}))}
                  className="w-full h-10 px-3 text-sm" style={inputSt}/>
              </div>
            ))}
          </div>
        </div>

        {/* Work items */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2" style={{ borderBottom:`1px solid rgba(200,168,112,.12)` }}>
            <span>📋</span>
            <p style={{ ...labelSt, color:C.stone2 }}>Ish turlari va narxlar</p>
          </div>
          <div className="overflow-x-auto rounded-sm" style={{ border:`1px solid ${C.border}` }}>
            <table className="table-arch w-full text-sm">
              <thead>
                <tr>
                  {["#","Ish turi","Birlik","Miqdor","Narx (so'm)","Jami",""].map(h => (
                    <th key={h} className="text-left pb-2 px-3 text-xs font-bold whitespace-nowrap"
                      style={{ background:C.cream2, color:C.stone2, padding:"10px 12px", letterSpacing:".1em", textTransform:"uppercase" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i} className="group" style={{ borderBottom:`1px solid rgba(200,168,112,.06)` }}>
                    <td className="py-2 px-3 font-bold" style={{ color:C.stone, fontSize:11 }}>{i+1}</td>
                    <td className="py-2 px-2 min-w-[200px]">
                      <input value={item.name} placeholder="Loyiha eskizi, 3D vizualizatsiya..."
                        onChange={e => updateItem(i,"name",e.target.value)}
                        className="w-full h-9 px-3 text-sm" style={inputSt}/>
                    </td>
                    <td className="py-2 px-2 w-24">
                      <Select value={item.unit} onValueChange={v => updateItem(i,"unit",v)}>
                        <SelectTrigger className="h-9 text-sm w-20 rounded-sm" style={{ background:C.cream, border:`1px solid ${C.border}`, color:C.ink3 }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent style={{ background:C.white, border:`1px solid ${C.border}` }}>
                          {["dona","m²","m","soat","varaq","to'plam"].map(u => <SelectItem key={u} value={u} style={{ color:C.ink3 }}>{u}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-2 px-2 w-24">
                      <input type="number" value={item.qty} min={1}
                        onChange={e => updateItem(i,"qty",+e.target.value)}
                        className="w-20 h-9 px-3 text-sm" style={inputSt}/>
                    </td>
                    <td className="py-2 px-2 w-36">
                      <input type="number" value={item.price} min={0} placeholder="0"
                        onChange={e => updateItem(i,"price",+e.target.value)}
                        className="w-full h-9 px-3 text-sm" style={inputSt}/>
                    </td>
                    <td className="py-2 px-2 font-bold whitespace-nowrap"
                      style={{ color:C.ink, fontFamily:"'Playfair Display',serif" }}>
                      {formatCurrency(item.qty * item.price)}
                    </td>
                    <td className="py-2 px-1">
                      {items.length > 1 && (
                        <button onClick={() => removeItem(i)}
                          className="h-7 w-7 rounded flex items-center justify-center transition-colors"
                          style={{ color:C.stone, opacity:0 }}
                          onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background=C.cream2;(e.currentTarget as HTMLElement).style.opacity="1"}}
                          onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="transparent"}}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between">
            <button onClick={addItem}
              className="btn-outline h-8 px-3 text-xs flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Ish turi qo'shish
            </button>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color:C.stone2 }}>Avans to'lov</p>
                <input type="number" value={form.advanceAmount} min={0} placeholder="0"
                  onChange={e => setForm(f => ({...f, advanceAmount: +e.target.value}))}
                  className="h-9 w-40 text-sm text-right mt-1 px-3" style={inputSt}/>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color:C.stone2 }}>Jami summa</p>
                <p className="text-xl font-black mt-1"
                  style={{ color:C.ink, fontFamily:"'Playfair Display',serif" }}>
                  {formatCurrency(totalAmount)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-2" style={{ borderBottom:`1px solid rgba(200,168,112,.12)` }}>
            <span>📄</span>
            <p style={{ ...labelSt, color:C.stone2 }}>Shartnoma shartlari</p>
          </div>
          <textarea value={form.terms} rows={6} placeholder="Shartnoma shartlari..."
            onChange={e => setForm(f => ({...f, terms: e.target.value}))}
            className="w-full px-3 py-2 text-sm resize-none" style={inputSt}/>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <label style={labelSt} className="block" style={{ color:C.stone2 }}>Holat</label>
            <Select value={form.status} onValueChange={v => setForm(f => ({...f, status: v}))}>
              <SelectTrigger className="h-10 w-40 rounded-sm text-sm" style={{ background:C.cream, border:`1px solid ${C.border}`, color:C.ink3 }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent style={{ background:C.white, border:`1px solid ${C.border}` }}>
                <SelectItem value="DRAFT" style={{ color:C.ink3 }}>Qoralama</SelectItem>
                <SelectItem value="PENDING" style={{ color:C.ink3 }}>Kutilmoqda</SelectItem>
                <SelectItem value="ACTIVE" style={{ color:C.ink3 }}>Faol</SelectItem>
                <SelectItem value="COMPLETED" style={{ color:C.ink3 }}>Tugallandi</SelectItem>
                <SelectItem value="CANCELLED" style={{ color:C.ink3 }}>Bekor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <button onClick={save} disabled={saving}
            className="btn-ink h-10 px-5 text-sm flex items-center gap-2">
            <Save className="h-4 w-4" />
            {saving ? "Saqlanmoqda..." : "Shartnomani Saqlash"}
          </button>
        </div>
      </div>
    </div>
  )
}
