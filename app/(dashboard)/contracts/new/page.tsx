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

  const inputCls = "rounded-xl h-11 bg-[#0d0d0d] border-[#333] text-white"
  const labelCls = "text-xs font-semibold text-[#666]"

  return (
    <div className="max-w-4xl space-y-6 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <Link href="/contracts">
          <Button variant="ghost" size="sm" className="gap-1 -ml-2 text-[#888] hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Orqaga
          </Button>
        </Link>
        <Button onClick={save} disabled={saving} className="btn-primary rounded-xl gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Saqlanmoqda..." : "Shartnomani Saqlash"}
        </Button>
      </div>

      <div className="arch-card p-6 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[#222]">
          <span className="text-2xl">📜</span>
          <div>
            <h2 className="text-xl font-bold text-white">Yangi Shartnoma</h2>
            <p className="text-xs text-[#444]">Barcha maydonlarni to'ldiring</p>
          </div>
        </div>

        {/* Contract info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className={labelCls}>Shartnoma raqami *</Label>
            <Input value={form.contractNumber} onChange={e => setForm(f => ({...f, contractNumber: e.target.value}))}
              className={inputCls} />
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <Label className={labelCls}>Sarlavha *</Label>
            <Input placeholder="Loyiha arxitektura xizmatlari shartnomasi" value={form.title}
              onChange={e => setForm(f => ({...f, title: e.target.value}))}
              className={inputCls} />
          </div>
        </div>

        {/* 2 columns: Client + Architect */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Client */}
          <div className="space-y-4">
            <p className="text-xs text-[#444] font-bold uppercase tracking-widest border-b border-[#222] pb-2">👤 Buyurtmachi</p>
            <div className="space-y-1.5">
              <Label className={labelCls}>Bazadan tanlash</Label>
              <Select value={form.clientId} onValueChange={fillFromClient}>
                <SelectTrigger className="rounded-xl h-11 bg-[#0d0d0d] border-[#333] text-white"><SelectValue placeholder="Mijoz tanlang"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Qo'lda kiritish —</SelectItem>
                  {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
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
                <Label className={labelCls}>{f.label}</Label>
                <Input placeholder={f.placeholder} value={(form as any)[f.field]}
                  onChange={e => setForm(prev => ({...prev, [f.field]: e.target.value}))}
                  className={inputCls} />
              </div>
            ))}
          </div>

          {/* Architect */}
          <div className="space-y-4">
            <p className="text-xs text-[#444] font-bold uppercase tracking-widest border-b border-[#222] pb-2">🏛️ Arxitektor (Ijrochi)</p>
            {[
              { field:"architectName",    label:"Ism-familiya *",  placeholder:"Karimov Alisher" },
              { field:"architectPhone",   label:"Telefon",         placeholder:"+998 90 000 00 00" },
              { field:"architectAddress", label:"Manzil/Studiya",  placeholder:"Toshkent, Yunusobod 19" },
            ].map(f => (
              <div key={f.field} className="space-y-1.5">
                <Label className={labelCls}>{f.label}</Label>
                <Input placeholder={f.placeholder} value={(form as any)[f.field]}
                  onChange={e => setForm(prev => ({...prev, [f.field]: e.target.value}))}
                  className={inputCls} />
              </div>
            ))}
          </div>
        </div>

        {/* Project info */}
        <div className="space-y-4">
          <p className="text-xs text-[#444] font-bold uppercase tracking-widest border-b border-[#222] pb-2">📐 Loyiha ma'lumotlari</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className={labelCls}>Loyihadan tanlash</Label>
              <Select value={form.projectId} onValueChange={fillFromProject}>
                <SelectTrigger className="rounded-xl h-11 bg-[#0d0d0d] border-[#333] text-white"><SelectValue placeholder="Loyiha tanlang"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Qo'lda kiritish —</SelectItem>
                  {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className={labelCls}>Loyiha turi</Label>
              <Input placeholder="Turar-joy, Savdo markazi..." value={form.projectType}
                onChange={e => setForm(f => ({...f, projectType: e.target.value}))}
                className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <Label className={labelCls}>Loyiha nomi *</Label>
              <Input placeholder="Loyiha nomi" value={form.projectName}
                onChange={e => setForm(f => ({...f, projectName: e.target.value}))}
                className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <Label className={labelCls}>Manzil</Label>
              <Input placeholder="Qurilish manzili" value={form.projectAddress}
                onChange={e => setForm(f => ({...f, projectAddress: e.target.value}))}
                className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <Label className={labelCls}>Boshlanish sanasi</Label>
              <Input type="date" value={form.startDate} onChange={e => setForm(f => ({...f, startDate: e.target.value}))}
                className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <Label className={labelCls}>Tugash sanasi</Label>
              <Input type="date" value={form.endDate} onChange={e => setForm(f => ({...f, endDate: e.target.value}))}
                className={inputCls} />
            </div>
          </div>
        </div>

        {/* Work items */}
        <div className="space-y-4">
          <p className="text-xs text-[#444] font-bold uppercase tracking-widest border-b border-[#222] pb-2">📋 Ish turlari va narxlar</p>
          <div className="overflow-x-auto">
            <table className="table-arch w-full text-sm">
              <thead>
                <tr>
                  {["#","Ish turi","Birlik","Miqdor","Narx (so'm)","Jami",""].map(h => (
                    <th key={h} className="text-left pb-2 px-2 text-xs font-bold text-[#444] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1a]">
                {items.map((item, i) => (
                  <tr key={i} className="group">
                    <td className="py-2 px-2 text-[#444] font-bold">{i+1}</td>
                    <td className="py-2 px-2 min-w-[200px]">
                      <Input value={item.name} placeholder="Loyiha eskizi, 3D vizualizatsiya..."
                        onChange={e => updateItem(i,"name",e.target.value)}
                        className="h-9 rounded-lg bg-[#0d0d0d] border-[#333] text-white text-sm" />
                    </td>
                    <td className="py-2 px-2 w-24">
                      <Select value={item.unit} onValueChange={v => updateItem(i,"unit",v)}>
                        <SelectTrigger className="h-9 rounded-lg bg-[#0d0d0d] border-[#333] text-white text-sm w-20"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["dona","m²","m","soat","varaq","to'plam"].map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-2 px-2 w-24">
                      <Input type="number" value={item.qty} min={1}
                        onChange={e => updateItem(i,"qty",+e.target.value)}
                        className="h-9 rounded-lg bg-[#0d0d0d] border-[#333] text-white text-sm w-20" />
                    </td>
                    <td className="py-2 px-2 w-36">
                      <Input type="number" value={item.price} min={0} placeholder="0"
                        onChange={e => updateItem(i,"price",+e.target.value)}
                        className="h-9 rounded-lg bg-[#0d0d0d] border-[#333] text-white text-sm" />
                    </td>
                    <td className="py-2 px-2 font-bold text-white whitespace-nowrap">
                      {formatCurrency(item.qty * item.price)}
                    </td>
                    <td className="py-2 px-1">
                      {items.length > 1 && (
                        <button onClick={() => removeItem(i)} className="text-[#444] hover:text-[#888] opacity-0 group-hover:opacity-100 transition-opacity">
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
            <Button variant="outline" onClick={addItem} size="sm" className="gap-1.5 rounded-xl border-[#333] text-[#888] hover:text-white hover:bg-[#1a1a1a]">
              <Plus className="h-4 w-4" /> Ish turi qo'shish
            </Button>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-[#444]">Avans to'lov</p>
                <Input type="number" value={form.advanceAmount} min={0} placeholder="0"
                  onChange={e => setForm(f => ({...f, advanceAmount: +e.target.value}))}
                  className="h-9 w-40 rounded-xl bg-[#0d0d0d] border-[#333] text-white text-sm text-right mt-1" />
              </div>
              <div className="text-right">
                <p className="text-xs text-[#444]">Jami summa</p>
                <p className="text-xl font-bold text-white mt-1">{formatCurrency(totalAmount)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="space-y-3">
          <p className="text-xs text-[#444] font-bold uppercase tracking-widest border-b border-[#222] pb-2">📄 Shartnoma shartlari</p>
          <Textarea value={form.terms} rows={6} placeholder="Shartnoma shartlari..."
            onChange={e => setForm(f => ({...f, terms: e.target.value}))}
            className="rounded-xl bg-[#0d0d0d] border-[#333] text-white resize-none text-sm" />
        </div>

        {/* Status */}
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <Label className={labelCls}>Holat</Label>
            <Select value={form.status} onValueChange={v => setForm(f => ({...f, status: v}))}>
              <SelectTrigger className="w-40 h-11 rounded-xl bg-[#0d0d0d] border-[#333] text-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Qoralama</SelectItem>
                <SelectItem value="PENDING">Kutilmoqda</SelectItem>
                <SelectItem value="ACTIVE">Faol</SelectItem>
                <SelectItem value="COMPLETED">Tugallandi</SelectItem>
                <SelectItem value="CANCELLED">Bekor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={save} disabled={saving} className="btn-primary rounded-xl gap-2 h-11 px-6">
            <Save className="h-4 w-4" />
            {saving ? "Saqlanmoqda..." : "Shartnomani Saqlash"}
          </Button>
        </div>
      </div>
    </div>
  )
}
