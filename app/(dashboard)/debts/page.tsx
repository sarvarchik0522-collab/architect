"use client"
import { useState, useEffect, useCallback } from "react"
import { Banknote, Plus, Pencil, Trash2, ChevronDown, ChevronUp, FileText, Printer } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { formatDate, formatCurrency } from "@/lib/utils"
import { exportReceivablesReport, printReceivablesPDF } from "@/lib/export"

const C = {
  ink:"var(--ink)", ink2:"var(--ink2)", ink3:"var(--ink3)",
  cream:"var(--cream)", cream2:"var(--cream2)",
  stone:"var(--stone)", stone2:"var(--stone2)",
  white:"var(--white)", border:"rgba(200,168,112,.14)",
  gold:"var(--gold)", gold2:"var(--gold2)",
}
const inputSt = {
  background: C.cream, border: `1px solid ${C.border}`,
  borderRadius: 3, color: C.ink, outline: "none",
}
const lbl = {
  fontSize: 9, color: C.stone2, fontWeight: 700,
  letterSpacing: ".14em", textTransform: "uppercase" as const,
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Kutilmoqda", color: "rgba(200,168,112,.25)" },
  PARTIAL: { label: "Qisman",     color: "rgba(90,140,200,.2)"   },
  PAID:    { label: "To'liq",     color: "rgba(80,180,120,.2)"   },
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? STATUS_MAP.PENDING
  return (
    <span style={{
      display: "inline-block", padding: "2px 8px", borderRadius: 2,
      fontSize: 11, fontWeight: 600,
      background: s.color, color: C.ink,
      border: `1px solid rgba(0,0,0,.06)`,
    }}>{s.label}</span>
  )
}


function ProgressBar({ paid, total }: { paid: number; total: number }) {
  const pct = total > 0 ? Math.min(100, (paid / total) * 100) : 0
  return (
    <div style={{ height: 6, background: C.cream2, borderRadius: 3, overflow: "hidden", marginTop: 4 }}>
      <div style={{
        height: "100%", width: `${pct}%`, borderRadius: 3, transition: "width .4s",
        background: pct >= 100
          ? "rgba(80,180,120,.7)"
          : pct > 0
          ? "rgba(200,168,112,.7)"
          : "transparent",
      }} />
    </div>
  )
}

function GoldCornice() {
  return (
    <div style={{
      height: 2, borderRadius: 1, marginBottom: 4,
      background: "linear-gradient(90deg,transparent,var(--gold),var(--gold2),var(--gold),transparent)",
    }} />
  )
}


/* ══════ RECEIVABLE CARD ══════ */
function ReceivableCard({
  item, onPayment, onEdit, onDelete,
}: { item: any; onPayment: (id: string) => void; onEdit: (item: any) => void; onDelete: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  const remaining = item.totalAmount - item.paidAmount
  const isOverdue = item.dueDate && new Date(item.dueDate) < new Date() && item.status !== "PAID"

  return (
    <div className="arch-card" style={{ marginBottom: 12, padding: 0, overflow: "hidden" }}>
      <GoldCornice />
      <div style={{ padding: "12px 16px" }}>
        {/* Top row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: 15, color: C.ink }}>
                {item.name}
              </span>
              <StatusBadge status={item.status} />
            </div>
            {item.phone && (
              <p style={{ fontSize: 12, color: C.stone2, marginTop: 2 }}>{item.phone}</p>
            )}
            {item.description && (
              <p style={{ fontSize: 12, color: C.stone2, marginTop: 2 }}>{item.description}</p>
            )}
          </div>
          <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
            <button onClick={() => onEdit(item)} style={{
              height: 28, width: 28, borderRadius: 3, display: "flex", alignItems: "center",
              justifyContent: "center", background: C.cream2, border: `1px solid ${C.border}`, cursor: "pointer",
            }}>
              <Pencil style={{ width: 13, height: 13, color: C.stone2 }} />
            </button>
            <button onClick={() => onDelete(item.id)} style={{
              height: 28, width: 28, borderRadius: 3, display: "flex", alignItems: "center",
              justifyContent: "center", background: C.cream2, border: `1px solid ${C.border}`, cursor: "pointer",
            }}>
              <Trash2 style={{ width: 13, height: 13, color: C.stone2 }} />
            </button>
          </div>
        </div>


        {/* Amounts */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 12 }}>
          <div>
            <p style={{ ...lbl, fontSize: 8 }}>Jami summa</p>
            <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 13, color: C.ink }}>
              {formatCurrency(item.totalAmount)}
            </p>
          </div>
          <div>
            <p style={{ ...lbl, fontSize: 8 }}>To'langan</p>
            <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 13, color: "rgba(80,180,120,.9)" }}>
              {formatCurrency(item.paidAmount)}
            </p>
          </div>
          <div>
            <p style={{ ...lbl, fontSize: 8 }}>Qoldiq</p>
            <p style={{
              fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 13,
              color: isOverdue ? "#d44" : C.ink,
            }}>
              {formatCurrency(remaining)}
            </p>
          </div>
        </div>
        <ProgressBar paid={item.paidAmount} total={item.totalAmount} />

        {/* Dates + action row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10, flexWrap: "wrap", gap: 6 }}>
          <div style={{ display: "flex", gap: 12, fontSize: 11, color: C.stone2 }}>
            {item.dueDate && (
              <span style={{ color: isOverdue ? "#d44" : C.stone2 }}>
                Muddat: {formatDate(item.dueDate)}
              </span>
            )}
            {item.client?.name && <span>Mijoz: {item.client.name}</span>}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setOpen(!open)} style={{
              height: 28, padding: "0 10px", borderRadius: 3, fontSize: 11, display: "flex", alignItems: "center",
              gap: 4, background: C.cream2, border: `1px solid ${C.border}`, cursor: "pointer", color: C.stone2,
            }}>
              {open ? <ChevronUp style={{ width: 12 }} /> : <ChevronDown style={{ width: 12 }} />}
              To'lovlar ({item.payments?.length ?? 0})
            </button>
            {item.status !== "PAID" && (
              <button onClick={() => onPayment(item.id)} style={{
                height: 28, padding: "0 10px", borderRadius: 3, fontSize: 11, display: "flex", alignItems: "center",
                gap: 4, background: C.ink, color: "var(--cream)", border: "none", cursor: "pointer", fontWeight: 600,
              }}>
                <Plus style={{ width: 12 }} /> To'lov qo'shish
              </button>
            )}
          </div>
        </div>

        {/* Payment history */}
        {open && item.payments?.length > 0 && (
          <div style={{ marginTop: 10, borderTop: `1px solid ${C.border}`, paddingTop: 8 }}>
            {item.payments.map((p: any) => (
              <div key={p.id} style={{
                display: "flex", justifyContent: "space-between", fontSize: 12,
                padding: "4px 0", borderBottom: `1px solid rgba(200,168,112,.07)`,
              }}>
                <span style={{ color: C.stone2 }}>{formatDate(p.date)}{p.note ? ` · ${p.note}` : ""}</span>
                <span style={{ fontWeight: 700, color: "rgba(80,180,120,.9)", fontFamily: "'Playfair Display',serif" }}>
                  +{formatCurrency(p.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


/* ══════ DEBT CARD ══════ */
function DebtCard({
  item, onPayment, onEdit, onDelete,
}: { item: any; onPayment: (id: string) => void; onEdit: (item: any) => void; onDelete: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  const remaining = item.amount - item.paidAmount
  const isOverdue = item.dueDate && new Date(item.dueDate) < new Date() && item.status !== "PAID"

  return (
    <div className="arch-card" style={{ marginBottom: 12, padding: 0, overflow: "hidden" }}>
      <GoldCornice />
      <div style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: 15, color: C.ink }}>
                {item.creditor}
              </span>
              <StatusBadge status={item.status} />
            </div>
            {item.phone && <p style={{ fontSize: 12, color: C.stone2, marginTop: 2 }}>{item.phone}</p>}
            {item.description && <p style={{ fontSize: 12, color: C.stone2, marginTop: 2 }}>{item.description}</p>}
          </div>
          <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
            <button onClick={() => onEdit(item)} style={{
              height: 28, width: 28, borderRadius: 3, display: "flex", alignItems: "center",
              justifyContent: "center", background: C.cream2, border: `1px solid ${C.border}`, cursor: "pointer",
            }}>
              <Pencil style={{ width: 13, height: 13, color: C.stone2 }} />
            </button>
            <button onClick={() => onDelete(item.id)} style={{
              height: 28, width: 28, borderRadius: 3, display: "flex", alignItems: "center",
              justifyContent: "center", background: C.cream2, border: `1px solid ${C.border}`, cursor: "pointer",
            }}>
              <Trash2 style={{ width: 13, height: 13, color: C.stone2 }} />
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 12 }}>
          <div>
            <p style={{ ...lbl, fontSize: 8 }}>Qarz summasi</p>
            <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 13, color: C.ink }}>
              {formatCurrency(item.amount)}
            </p>
          </div>
          <div>
            <p style={{ ...lbl, fontSize: 8 }}>Qaytarilgan</p>
            <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 13, color: "rgba(80,180,120,.9)" }}>
              {formatCurrency(item.paidAmount)}
            </p>
          </div>
          <div>
            <p style={{ ...lbl, fontSize: 8 }}>Qoldiq</p>
            <p style={{
              fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 13,
              color: isOverdue ? "#d44" : C.ink,
            }}>
              {formatCurrency(remaining)}
            </p>
          </div>
        </div>
        <ProgressBar paid={item.paidAmount} total={item.amount} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10, flexWrap: "wrap", gap: 6 }}>
          <div style={{ display: "flex", gap: 12, fontSize: 11, color: C.stone2 }}>
            <span>Olingan: {formatDate(item.borrowedAt)}</span>
            {item.dueDate && (
              <span style={{ color: isOverdue ? "#d44" : C.stone2 }}>
                Muddat: {formatDate(item.dueDate)}
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setOpen(!open)} style={{
              height: 28, padding: "0 10px", borderRadius: 3, fontSize: 11, display: "flex", alignItems: "center",
              gap: 4, background: C.cream2, border: `1px solid ${C.border}`, cursor: "pointer", color: C.stone2,
            }}>
              {open ? <ChevronUp style={{ width: 12 }} /> : <ChevronDown style={{ width: 12 }} />}
              To'lovlar ({item.payments?.length ?? 0})
            </button>
            {item.status !== "PAID" && (
              <button onClick={() => onPayment(item.id)} style={{
                height: 28, padding: "0 10px", borderRadius: 3, fontSize: 11, display: "flex", alignItems: "center",
                gap: 4, background: C.ink, color: "var(--cream)", border: "none", cursor: "pointer", fontWeight: 600,
              }}>
                <Plus style={{ width: 12 }} /> To'lov qo'shish
              </button>
            )}
          </div>
        </div>

        {open && item.payments?.length > 0 && (
          <div style={{ marginTop: 10, borderTop: `1px solid ${C.border}`, paddingTop: 8 }}>
            {item.payments.map((p: any) => (
              <div key={p.id} style={{
                display: "flex", justifyContent: "space-between", fontSize: 12,
                padding: "4px 0", borderBottom: `1px solid rgba(200,168,112,.07)`,
              }}>
                <span style={{ color: C.stone2 }}>{formatDate(p.date)}{p.note ? ` · ${p.note}` : ""}</span>
                <span style={{ fontWeight: 700, color: "rgba(80,180,120,.9)", fontFamily: "'Playfair Display',serif" }}>
                  -{formatCurrency(p.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


/* ══════ MAIN PAGE ══════ */
export default function DebtsPage() {
  const [receivables, setReceivables] = useState<any[]>([])
  const [debts,       setDebts]       = useState<any[]>([])
  const [loading,     setLoading]     = useState(true)
  const [filter,      setFilter]      = useState("ALL")
  const [debtFilter,  setDebtFilter]  = useState("ALL")
  const { toast } = useToast()

  // ── Receivable form state ──
  const emptyRec = { name: "", phone: "", description: "", totalAmount: "", dueDate: "", notes: "", clientId: "" }
  const [recOpen,   setRecOpen]   = useState(false)
  const [recForm,   setRecForm]   = useState(emptyRec)
  const [editRecId, setEditRecId] = useState<string | null>(null)
  const [saving,    setSaving]    = useState(false)

  // ── Debt form state ──
  const emptyDebt = { creditor: "", phone: "", description: "", amount: "", borrowedAt: new Date().toISOString().split("T")[0], dueDate: "", notes: "" }
  const [debtOpen,   setDebtOpen]   = useState(false)
  const [debtForm,   setDebtForm]   = useState(emptyDebt)
  const [editDebtId, setEditDebtId] = useState<string | null>(null)

  // ── Payment dialog state ──
  const emptyPay = { amount: "", date: new Date().toISOString().split("T")[0], note: "" }
  const [payOpen,    setPayOpen]    = useState(false)
  const [payTarget,  setPayTarget]  = useState<{ id: string; type: "receivable" | "debt" } | null>(null)
  const [payForm,    setPayForm]    = useState(emptyPay)

  const load = useCallback(async () => {
    setLoading(true)
    const [r, d] = await Promise.all([
      fetch("/api/receivables").then(x => x.json()),
      fetch("/api/debts").then(x => x.json()),
    ])
    setReceivables(Array.isArray(r) ? r : [])
    setDebts(Array.isArray(d) ? d : [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  /* ── Stats ── */
  const recTotal     = receivables.reduce((s, r) => s + r.totalAmount, 0)
  const recPaid      = receivables.reduce((s, r) => s + r.paidAmount, 0)
  const recRemaining = recTotal - recPaid
  const debtTotal     = debts.reduce((s, d) => s + d.amount, 0)
  const debtPaid      = debts.reduce((s, d) => s + d.paidAmount, 0)
  const debtRemaining = debtTotal - debtPaid

  /* ── Filters ── */
  const filteredRec  = filter     === "ALL" ? receivables : receivables.filter(r => r.status === filter)
  const filteredDebt = debtFilter === "ALL" ? debts       : debts.filter(d => d.status === debtFilter)


  /* ── Receivable CRUD ── */
  const openNewRec  = () => { setRecForm(emptyRec); setEditRecId(null); setRecOpen(true) }
  const openEditRec = (item: any) => {
    setRecForm({
      name: item.name, phone: item.phone ?? "", description: item.description ?? "",
      totalAmount: String(item.totalAmount),
      dueDate: item.dueDate ? item.dueDate.split("T")[0] : "",
      notes: item.notes ?? "", clientId: item.clientId ?? "",
    })
    setEditRecId(item.id)
    setRecOpen(true)
  }
  const saveRec = async () => {
    if (!recForm.name || !recForm.totalAmount) return toast({ variant: "destructive", title: "Ism va summa kerak" })
    setSaving(true)
    try {
      const body = { ...recForm, totalAmount: +recForm.totalAmount, clientId: recForm.clientId || null, dueDate: recForm.dueDate || null }
      if (editRecId) {
        await fetch(`/api/receivables/${editRecId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      } else {
        await fetch("/api/receivables", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      }
      toast({ title: editRecId ? "Yangilandi ✓" : "Qo'shildi ✓" })
      setRecOpen(false); load()
    } catch { toast({ variant: "destructive", title: "Xatolik" }) } finally { setSaving(false) }
  }
  const deleteRec = async (id: string) => {
    if (!confirm("O'chirilsinmi?")) return
    await fetch(`/api/receivables/${id}`, { method: "DELETE" }); load()
  }

  /* ── Debt CRUD ── */
  const openNewDebt  = () => { setDebtForm(emptyDebt); setEditDebtId(null); setDebtOpen(true) }
  const openEditDebt = (item: any) => {
    setDebtForm({
      creditor: item.creditor, phone: item.phone ?? "", description: item.description ?? "",
      amount: String(item.amount),
      borrowedAt: item.borrowedAt ? item.borrowedAt.split("T")[0] : new Date().toISOString().split("T")[0],
      dueDate: item.dueDate ? item.dueDate.split("T")[0] : "",
      notes: item.notes ?? "",
    })
    setEditDebtId(item.id); setDebtOpen(true)
  }
  const saveDebt = async () => {
    if (!debtForm.creditor || !debtForm.amount) return toast({ variant: "destructive", title: "Kreditor va summa kerak" })
    setSaving(true)
    try {
      const body = { ...debtForm, amount: +debtForm.amount, dueDate: debtForm.dueDate || null, borrowedAt: debtForm.borrowedAt || null }
      if (editDebtId) {
        await fetch(`/api/debts/${editDebtId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      } else {
        await fetch("/api/debts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      }
      toast({ title: editDebtId ? "Yangilandi ✓" : "Qo'shildi ✓" })
      setDebtOpen(false); load()
    } catch { toast({ variant: "destructive", title: "Xatolik" }) } finally { setSaving(false) }
  }
  const deleteDebt = async (id: string) => {
    if (!confirm("O'chirilsinmi?")) return
    await fetch(`/api/debts/${id}`, { method: "DELETE" }); load()
  }

  /* ── Payment ── */
  const openPayment = (id: string, type: "receivable" | "debt") => {
    setPayTarget({ id, type }); setPayForm(emptyPay); setPayOpen(true)
  }
  const savePayment = async () => {
    if (!payTarget || !payForm.amount) return toast({ variant: "destructive", title: "Summa kerak" })
    setSaving(true)
    try {
      const url = payTarget.type === "receivable"
        ? `/api/receivables/${payTarget.id}/payments`
        : `/api/debts/${payTarget.id}/payments`
      await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payForm, amount: +payForm.amount, date: payForm.date || undefined }) })
      toast({ title: "To'lov qo'shildi ✓" }); setPayOpen(false); load()
    } catch { toast({ variant: "destructive", title: "Xatolik" }) } finally { setSaving(false) }
  }


  const FILTERS = ["ALL", "PENDING", "PARTIAL", "PAID"]

  return (
    <div className="space-y-5 anim-page">
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 900, fontSize: 22, color: C.ink }}>
            Hisob-kitob
          </h2>
          <p style={{ fontSize: 12, color: C.stone2 }}>Haqdorlar va qarzlar</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => exportReceivablesReport(receivables, debts)}
            className="btn-outline h-9 px-3 text-sm flex items-center gap-2">
            <FileText style={{ width: 14 }} /> Word
          </button>
          <button onClick={() => printReceivablesPDF(receivables, debts)}
            className="btn-outline h-9 px-3 text-sm flex items-center gap-2">
            <Printer style={{ width: 14 }} /> PDF
          </button>
        </div>
      </div>

      <Tabs defaultValue="receivables">
        <TabsList className="rounded-sm" style={{ background: C.cream2, border: `1px solid ${C.border}` }}>
          <TabsTrigger value="receivables" className="rounded-sm text-sm" style={{ color: C.stone2 }}>
            Haqdorlar ({receivables.length})
          </TabsTrigger>
          <TabsTrigger value="debts" className="rounded-sm text-sm" style={{ color: C.stone2 }}>
            Mening Qarzlarim ({debts.length})
          </TabsTrigger>
        </TabsList>

        {/* ═══════════ TAB 1: RECEIVABLES ═══════════ */}
        <TabsContent value="receivables" className="mt-4">
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 16 }}>
            {[
              { l: "Jami haqdorlik", v: recTotal },
              { l: "Qabul qilingan", v: recPaid },
              { l: "Qoldiq",         v: recRemaining },
            ].map(s => (
              <div key={s.l} className="card-premium" style={{ padding: "14px 16px" }}>
                <p style={{ ...lbl }}>{s.l}</p>
                <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: 16, color: C.ink, marginTop: 4 }}>
                  {formatCurrency(s.v)}
                </p>
              </div>
            ))}
          </div>

          {/* Filters + add */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
            <div style={{ display: "flex", gap: 6 }}>
              {FILTERS.map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  height: 30, padding: "0 12px", borderRadius: 3, fontSize: 11, fontWeight: 600,
                  background: filter === f ? C.ink : C.cream2,
                  color: filter === f ? "var(--cream)" : C.stone2,
                  border: `1px solid ${filter === f ? C.ink : C.border}`,
                  cursor: "pointer",
                }}>
                  {f === "ALL" ? "Barchasi" : STATUS_MAP[f]?.label}
                </button>
              ))}
            </div>
            <button onClick={openNewRec} className="btn-ink h-9 px-4 text-sm flex items-center gap-2">
              <Plus style={{ width: 14 }} /> Yangi haqdor
            </button>
          </div>

          {loading ? (
            <div className="skeleton h-24 rounded-sm" />
          ) : filteredRec.length === 0 ? (
            <div className="card-premium" style={{ padding: 32, textAlign: "center" }}>
              <Banknote style={{ width: 32, height: 32, color: C.stone, margin: "0 auto 8px" }} />
              <p style={{ color: C.stone2, fontSize: 13 }}>Haqdorlar yo'q</p>
            </div>
          ) : (
            filteredRec.map(r => (
              <ReceivableCard
                key={r.id} item={r}
                onPayment={(id) => openPayment(id, "receivable")}
                onEdit={openEditRec}
                onDelete={deleteRec}
              />
            ))
          )}
        </TabsContent>

        {/* ═══════════ TAB 2: DEBTS ═══════════ */}
        <TabsContent value="debts" className="mt-4">
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 16 }}>
            {[
              { l: "Jami qarz",    v: debtTotal     },
              { l: "Qaytarilgan",  v: debtPaid      },
              { l: "Qoldiq qarz",  v: debtRemaining },
            ].map(s => (
              <div key={s.l} className="card-premium" style={{ padding: "14px 16px" }}>
                <p style={{ ...lbl }}>{s.l}</p>
                <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: 16, color: C.ink, marginTop: 4 }}>
                  {formatCurrency(s.v)}
                </p>
              </div>
            ))}
          </div>

          {/* Filters + add */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
            <div style={{ display: "flex", gap: 6 }}>
              {FILTERS.map(f => (
                <button key={f} onClick={() => setDebtFilter(f)} style={{
                  height: 30, padding: "0 12px", borderRadius: 3, fontSize: 11, fontWeight: 600,
                  background: debtFilter === f ? C.ink : C.cream2,
                  color: debtFilter === f ? "var(--cream)" : C.stone2,
                  border: `1px solid ${debtFilter === f ? C.ink : C.border}`,
                  cursor: "pointer",
                }}>
                  {f === "ALL" ? "Barchasi" : STATUS_MAP[f]?.label}
                </button>
              ))}
            </div>
            <button onClick={openNewDebt} className="btn-ink h-9 px-4 text-sm flex items-center gap-2">
              <Plus style={{ width: 14 }} /> Yangi qarz
            </button>
          </div>

          {loading ? (
            <div className="skeleton h-24 rounded-sm" />
          ) : filteredDebt.length === 0 ? (
            <div className="card-premium" style={{ padding: 32, textAlign: "center" }}>
              <Banknote style={{ width: 32, height: 32, color: C.stone, margin: "0 auto 8px" }} />
              <p style={{ color: C.stone2, fontSize: 13 }}>Qarzlar yo'q</p>
            </div>
          ) : (
            filteredDebt.map(d => (
              <DebtCard
                key={d.id} item={d}
                onPayment={(id) => openPayment(id, "debt")}
                onEdit={openEditDebt}
                onDelete={deleteDebt}
              />
            ))
          )}
        </TabsContent>
      </Tabs>


      {/* ══════ RECEIVABLE DIALOG ══════ */}
      <Dialog open={recOpen} onOpenChange={setRecOpen}>
        <DialogContent className="max-w-md rounded-sm"
          style={{ background: C.white, border: `1px solid ${C.border}`, boxShadow: "var(--shadow-xl)" }}>
          <div style={{ height: 2, background: "linear-gradient(90deg,transparent,var(--gold),transparent)", marginBottom: 4 }} />
          <DialogHeader>
            <DialogTitle style={{ color: C.ink, fontFamily: "'Playfair Display',serif", fontWeight: 800 }}>
              {editRecId ? "Haqdorni tahrirlash" : "Yangi haqdor"}
            </DialogTitle>
            <DialogDescription style={{ color: C.stone2 }}>Haqdor ma'lumotlari</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label style={lbl}>Ism *</label>
                <input value={recForm.name} onChange={e => setRecForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="To'liq ism" className="w-full h-10 px-3 text-sm" style={inputSt} />
              </div>
              <div className="space-y-1.5">
                <label style={lbl}>Telefon</label>
                <input value={recForm.phone} onChange={e => setRecForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+998..." className="w-full h-10 px-3 text-sm" style={inputSt} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label style={lbl}>Jami summa *</label>
                <input type="number" value={recForm.totalAmount} onChange={e => setRecForm(f => ({ ...f, totalAmount: e.target.value }))}
                  placeholder="0" className="w-full h-10 px-3 text-sm" style={inputSt} />
              </div>
              <div className="space-y-1.5">
                <label style={lbl}>Muddat</label>
                <input type="date" value={recForm.dueDate} onChange={e => setRecForm(f => ({ ...f, dueDate: e.target.value }))}
                  className="w-full h-10 px-3 text-sm" style={inputSt} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label style={lbl}>Tavsif</label>
              <input value={recForm.description} onChange={e => setRecForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Nima uchun qaydlanmoqda..." className="w-full h-10 px-3 text-sm" style={inputSt} />
            </div>
            <div className="space-y-1.5">
              <label style={lbl}>Izohlar</label>
              <input value={recForm.notes} onChange={e => setRecForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Qo'shimcha ma'lumot..." className="w-full h-10 px-3 text-sm" style={inputSt} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button onClick={() => setRecOpen(false)} className="btn-outline h-9 px-4 text-sm">Bekor</button>
            <button onClick={saveRec} disabled={saving} className="btn-ink h-9 px-4 text-sm">
              {saving ? "..." : editRecId ? "Saqlash" : "Qo'shish"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════ DEBT DIALOG ══════ */}
      <Dialog open={debtOpen} onOpenChange={setDebtOpen}>
        <DialogContent className="max-w-md rounded-sm"
          style={{ background: C.white, border: `1px solid ${C.border}`, boxShadow: "var(--shadow-xl)" }}>
          <div style={{ height: 2, background: "linear-gradient(90deg,transparent,var(--gold),transparent)", marginBottom: 4 }} />
          <DialogHeader>
            <DialogTitle style={{ color: C.ink, fontFamily: "'Playfair Display',serif", fontWeight: 800 }}>
              {editDebtId ? "Qarzni tahrirlash" : "Yangi qarz"}
            </DialogTitle>
            <DialogDescription style={{ color: C.stone2 }}>Qarz ma'lumotlari</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label style={lbl}>Kreditor (kimdan) *</label>
                <input value={debtForm.creditor} onChange={e => setDebtForm(f => ({ ...f, creditor: e.target.value }))}
                  placeholder="Ism yoki tashkilot" className="w-full h-10 px-3 text-sm" style={inputSt} />
              </div>
              <div className="space-y-1.5">
                <label style={lbl}>Telefon</label>
                <input value={debtForm.phone} onChange={e => setDebtForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+998..." className="w-full h-10 px-3 text-sm" style={inputSt} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label style={lbl}>Qarz summasi *</label>
                <input type="number" value={debtForm.amount} onChange={e => setDebtForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="0" className="w-full h-10 px-3 text-sm" style={inputSt} />
              </div>
              <div className="space-y-1.5">
                <label style={lbl}>Olingan sana</label>
                <input type="date" value={debtForm.borrowedAt} onChange={e => setDebtForm(f => ({ ...f, borrowedAt: e.target.value }))}
                  className="w-full h-10 px-3 text-sm" style={inputSt} />
              </div>
              <div className="space-y-1.5">
                <label style={lbl}>Muddat</label>
                <input type="date" value={debtForm.dueDate} onChange={e => setDebtForm(f => ({ ...f, dueDate: e.target.value }))}
                  className="w-full h-10 px-3 text-sm" style={inputSt} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label style={lbl}>Tavsif</label>
              <input value={debtForm.description} onChange={e => setDebtForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Qarz maqsadi..." className="w-full h-10 px-3 text-sm" style={inputSt} />
            </div>
            <div className="space-y-1.5">
              <label style={lbl}>Izohlar</label>
              <input value={debtForm.notes} onChange={e => setDebtForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Qo'shimcha ma'lumot..." className="w-full h-10 px-3 text-sm" style={inputSt} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button onClick={() => setDebtOpen(false)} className="btn-outline h-9 px-4 text-sm">Bekor</button>
            <button onClick={saveDebt} disabled={saving} className="btn-ink h-9 px-4 text-sm">
              {saving ? "..." : editDebtId ? "Saqlash" : "Qo'shish"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════ PAYMENT DIALOG ══════ */}
      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="max-w-sm rounded-sm"
          style={{ background: C.white, border: `1px solid ${C.border}`, boxShadow: "var(--shadow-xl)" }}>
          <div style={{ height: 2, background: "linear-gradient(90deg,transparent,var(--gold),transparent)", marginBottom: 4 }} />
          <DialogHeader>
            <DialogTitle style={{ color: C.ink, fontFamily: "'Playfair Display',serif", fontWeight: 800 }}>
              To'lov qo'shish
            </DialogTitle>
            <DialogDescription style={{ color: C.stone2 }}>To'lov ma'lumotlari</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label style={lbl}>Summa *</label>
                <input type="number" value={payForm.amount} onChange={e => setPayForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="0" className="w-full h-10 px-3 text-sm" style={inputSt} />
              </div>
              <div className="space-y-1.5">
                <label style={lbl}>Sana</label>
                <input type="date" value={payForm.date} onChange={e => setPayForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full h-10 px-3 text-sm" style={inputSt} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label style={lbl}>Izoh</label>
              <input value={payForm.note} onChange={e => setPayForm(f => ({ ...f, note: e.target.value }))}
                placeholder="Naqd / bank..." className="w-full h-10 px-3 text-sm" style={inputSt} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button onClick={() => setPayOpen(false)} className="btn-outline h-9 px-4 text-sm">Bekor</button>
            <button onClick={savePayment} disabled={saving} className="btn-ink h-9 px-4 text-sm">
              {saving ? "..." : "Saqlash"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
