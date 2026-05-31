"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Printer, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { cn, formatDate, formatCurrency } from "@/lib/utils"

const STATUS_META: Record<string, { label: string; color: string }> = {
  DRAFT:     { label: "Qoralama",   color: "bg-slate-100 text-slate-600" },
  ACTIVE:    { label: "Faol",       color: "bg-green-100 text-green-700" },
  PENDING:   { label: "Kutilmoqda", color: "bg-yellow-100 text-yellow-700" },
  COMPLETED: { label: "Tugallandi", color: "bg-blue-100 text-blue-700" },
  CANCELLED: { label: "Bekor",      color: "bg-red-100 text-red-600" },
}

export default function ContractDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [contract, setContract] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetch(`/api/contracts/${params.id}`)
      .then(r => r.json())
      .then(d => { setContract(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [params.id])

  const changeStatus = async (status: string) => {
    await fetch(`/api/contracts/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    setContract((c: any) => ({ ...c, status }))
    toast({ title: "Holat yangilandi ✓" })
  }

  const del = async () => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return
    await fetch(`/api/contracts/${params.id}`, { method: "DELETE" })
    toast({ title: "O'chirildi" })
    router.push("/contracts")
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl">
        <div className="h-12 rounded-2xl bg-amber-100/50 dark:bg-amber-900/20 animate-pulse" />
        <div className="h-[600px] rounded-3xl bg-amber-100/30 dark:bg-amber-900/10 animate-pulse" />
      </div>
    )
  }
  if (!contract) return (
    <div className="flex flex-col items-center py-24 text-amber-400/50">
      <p className="text-lg font-semibold">Shartnoma topilmadi</p>
      <Link href="/contracts"><Button variant="ghost" className="mt-4 gap-2"><ArrowLeft className="h-4 w-4" />Orqaga</Button></Link>
    </div>
  )

  const sm = STATUS_META[contract.status] ?? STATUS_META.DRAFT


  return (
    <>
      {/* ── Print styles injected in head ── */}
      <style>{`
        @media print {
          /* Hide everything except the contract doc */
          body * { visibility: hidden; }
          #contract-print, #contract-print * { visibility: visible; }
          #contract-print { position: fixed; top: 0; left: 0; width: 100%; background: white !important; }

          /* Reset colors for print */
          body { background: white !important; margin: 0; padding: 0; }
          #contract-print { padding: 20mm; box-shadow: none !important; border: none !important; border-radius: 0 !important; }

          /* Force color printing */
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;

          /* Typography */
          #contract-print h1, #contract-print h2, #contract-print h3 { color: #1a3a6b !important; }
          #contract-print p, #contract-print span, #contract-print td { color: #1a1a1a !important; }

          /* Grid for print */
          .print-grid-2 { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 16px !important; }

          @page {
            margin: 15mm;
            size: A4;
          }
        }
      `}</style>

      <div className="max-w-4xl space-y-4 page-enter">

        {/* ── Toolbar (hidden on print) ── */}
        <div className="flex items-center justify-between gap-3 no-print" style={{ printVisibility: "hidden" } as any}>
          <Link href="/contracts">
            <Button variant="ghost" size="sm" className="gap-1 -ml-2 text-amber-700 hover:text-amber-900">
              <ArrowLeft className="h-4 w-4" />Orqaga
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Select value={contract.status} onValueChange={changeStatus}>
              <SelectTrigger className="h-9 w-36 rounded-xl border-[#e8d8b0] dark:border-[#2a1e08] text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Qoralama</SelectItem>
                <SelectItem value="PENDING">Kutilmoqda</SelectItem>
                <SelectItem value="ACTIVE">Faol</SelectItem>
                <SelectItem value="COMPLETED">Tugallandi</SelectItem>
                <SelectItem value="CANCELLED">Bekor</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handlePrint} className="btn-gold text-white gap-2 rounded-xl h-9">
              <Printer className="h-4 w-4" />PDF yuklab olish
            </Button>
            <Button variant="ghost" size="icon" onClick={del}
              className="h-9 w-9 rounded-xl text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* ── Contract Document ── */}
        <div id="contract-print"
          className="bg-white dark:bg-[#0e0b04] rounded-3xl border border-[#e8d8b0] dark:border-[#2a1e08] overflow-hidden shadow-xl">

          {/* ─ Header ─ */}
          <div className="contract-header bg-gradient-to-br from-[#0A2342] to-[#1a3a6b] px-8 py-8 text-white text-center relative overflow-hidden">
            {/* Decorative rings */}
            <div className="absolute right-4 top-4 opacity-10 pointer-events-none">
              <svg width="160" height="160" viewBox="0 0 200 200">
                <polygon points="100,10 190,55 190,145 100,190 10,145 10,55" fill="none" stroke="white" strokeWidth="1.5"/>
                <polygon points="100,30 170,65 170,135 100,170 30,135 30,65" fill="none" stroke="white" strokeWidth="1"/>
                <circle cx="100" cy="100" r="40" fill="none" stroke="white" strokeWidth="0.7"/>
              </svg>
            </div>
            <div className="relative z-10">
              <div className="flex justify-center mb-4">
                <div className="h-14 w-14 rounded-2xl bg-white/15 border border-white/30 flex items-center justify-center text-3xl">🏛️</div>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">ARXITEKTURA XIZMATLARI SHARTNOMASI</h1>
              <p className="text-blue-200/80 mt-2 text-sm font-semibold">Shartnoma № {contract.contractNumber}</p>
              <p className="text-blue-200/60 text-xs mt-1">Tuzilgan sana: {formatDate(contract.createdAt)}</p>
              <span className={cn("inline-block mt-3 px-3 py-1 rounded-full text-xs font-bold no-print", sm.color)}>
                {sm.label}
              </span>
            </div>
          </div>


          <div className="p-6 sm:p-8 space-y-8">

            {/* ─ Parties ─ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 print-grid-2">
              {/* Buyurtmachi */}
              <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                <h3 className="font-bold text-[#0A2342] dark:text-amber-100 mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                  <span className="h-6 w-6 rounded-lg bg-[#0A2342] text-white flex items-center justify-center text-xs flex-shrink-0 font-bold">1</span>
                  Buyurtmachi
                </h3>
                <div className="space-y-2 text-sm text-[#3d2800] dark:text-amber-100">
                  <div>
                    <p className="text-xs text-[#B8860B]/60 mb-0.5">Ism-sharif</p>
                    <p className="font-bold">{contract.clientName}</p>
                  </div>
                  {contract.clientPassport && (
                    <div>
                      <p className="text-xs text-[#B8860B]/60 mb-0.5">Pasport</p>
                      <p>{contract.clientPassport}</p>
                    </div>
                  )}
                  {contract.clientPhone && (
                    <div>
                      <p className="text-xs text-[#B8860B]/60 mb-0.5">Telefon</p>
                      <p>{contract.clientPhone}</p>
                    </div>
                  )}
                  {contract.clientAddress && (
                    <div>
                      <p className="text-xs text-[#B8860B]/60 mb-0.5">Manzil</p>
                      <p>{contract.clientAddress}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Ijrochi */}
              <div className="p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
                <h3 className="font-bold text-[#0A2342] dark:text-amber-100 mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                  <span className="h-6 w-6 rounded-lg bg-[#B8860B] text-white flex items-center justify-center text-xs flex-shrink-0 font-bold">2</span>
                  Ijrochi (Arxitektor)
                </h3>
                <div className="space-y-2 text-sm text-[#3d2800] dark:text-amber-100">
                  <div>
                    <p className="text-xs text-[#B8860B]/60 mb-0.5">Ism-sharif</p>
                    <p className="font-bold">{contract.architectName}</p>
                  </div>
                  {contract.architectPhone && (
                    <div>
                      <p className="text-xs text-[#B8860B]/60 mb-0.5">Telefon</p>
                      <p>{contract.architectPhone}</p>
                    </div>
                  )}
                  {contract.architectAddress && (
                    <div>
                      <p className="text-xs text-[#B8860B]/60 mb-0.5">Manzil</p>
                      <p>{contract.architectAddress}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ─ Project Info ─ */}
            <div className="p-5 rounded-2xl bg-slate-50/60 dark:bg-slate-900/30 border border-[#e8d8b0] dark:border-[#2a1e08]">
              <h3 className="font-bold text-[#0A2342] dark:text-amber-100 mb-4 text-sm uppercase tracking-wider">
                📐 Loyiha Ma'lumotlari
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs text-[#B8860B]/60 mb-0.5">Loyiha nomi</p>
                  <p className="font-semibold text-[#3d2800] dark:text-amber-100">{contract.projectName}</p>
                </div>
                {contract.projectType && (
                  <div>
                    <p className="text-xs text-[#B8860B]/60 mb-0.5">Loyiha turi</p>
                    <p className="font-semibold text-[#3d2800] dark:text-amber-100">{contract.projectType}</p>
                  </div>
                )}
                {contract.projectAddress && (
                  <div>
                    <p className="text-xs text-[#B8860B]/60 mb-0.5">Manzil</p>
                    <p className="font-semibold text-[#3d2800] dark:text-amber-100">{contract.projectAddress}</p>
                  </div>
                )}
                {contract.startDate && (
                  <div>
                    <p className="text-xs text-[#B8860B]/60 mb-0.5">Boshlanish sanasi</p>
                    <p className="font-semibold text-[#3d2800] dark:text-amber-100">{formatDate(contract.startDate)}</p>
                  </div>
                )}
                {contract.endDate && (
                  <div>
                    <p className="text-xs text-[#B8860B]/60 mb-0.5">Tugash sanasi</p>
                    <p className="font-semibold text-[#3d2800] dark:text-amber-100">{formatDate(contract.endDate)}</p>
                  </div>
                )}
              </div>
            </div>


            {/* ─ Work Items ─ */}
            <div>
              <h3 className="font-bold text-[#0A2342] dark:text-amber-100 mb-3 text-sm uppercase tracking-wider">
                📋 Bajarilishi Kerak Bo'lgan Ishlar
              </h3>
              <div className="rounded-2xl overflow-hidden border border-[#e8d8b0] dark:border-[#2a1e08]">
                <pre className="p-5 text-sm text-[#3d2800] dark:text-amber-100 whitespace-pre-wrap font-mono bg-amber-50/40 dark:bg-amber-950/10 leading-relaxed">
                  {contract.workItems}
                </pre>
              </div>
            </div>

            {/* ─ Payment ─ */}
            <div>
              <h3 className="font-bold text-[#0A2342] dark:text-amber-100 mb-3 text-sm uppercase tracking-wider">
                💳 To'lov Shartlari
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-center">
                  <p className="text-xs text-emerald-600/70 uppercase tracking-wider mb-1 font-semibold">Jami Summa</p>
                  <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">
                    {formatCurrency(contract.totalAmount)}
                  </p>
                </div>
                {contract.advanceAmount > 0 && (
                  <div className="p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-center">
                    <p className="text-xs text-blue-600/70 uppercase tracking-wider mb-1 font-semibold">Avans To'lov</p>
                    <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">
                      {formatCurrency(contract.advanceAmount)}
                    </p>
                    <p className="text-xs text-blue-500/60 mt-1">
                      Qoldiq: {formatCurrency(contract.totalAmount - contract.advanceAmount)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ─ Terms ─ */}
            {contract.terms && (
              <div>
                <h3 className="font-bold text-[#0A2342] dark:text-amber-100 mb-3 text-sm uppercase tracking-wider">
                  📄 Shartnoma Shartlari
                </h3>
                <div className="p-5 rounded-2xl border border-[#e8d8b0] dark:border-[#2a1e08] bg-amber-50/30 dark:bg-amber-950/10">
                  <pre className="text-sm text-[#3d2800] dark:text-amber-100 whitespace-pre-wrap leading-relaxed">
                    {contract.terms}
                  </pre>
                </div>
              </div>
            )}

            {/* ─ Signatures ─ */}
            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-[#e8d8b0] dark:border-[#2a1e08]">
              {[
                { label: "Buyurtmachi", name: contract.clientName },
                { label: "Ijrochi (Arxitektor)", name: contract.architectName },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <p className="text-xs text-[#B8860B]/60 uppercase tracking-wider mb-6 font-semibold">{s.label}</p>
                  <div className="border-b-2 border-dashed border-[#B8860B]/30 dark:border-[#B8860B]/20 mb-2 h-10" />
                  <p className="text-sm font-semibold text-[#3d2800] dark:text-amber-100">{s.name}</p>
                  <p className="text-xs text-[#B8860B]/40 mt-0.5">Imzo / Sana</p>
                </div>
              ))}
            </div>

            {/* ─ Stamp ─ */}
            <div className="flex justify-center mt-2">
              <div className="h-28 w-28 rounded-full border-4 border-dashed border-[#B8860B]/20 dark:border-[#B8860B]/15 flex flex-col items-center justify-center gap-1">
                <span className="text-xl opacity-30">🏛️</span>
                <p className="text-xs text-[#B8860B]/30 text-center leading-tight font-medium">Muhr<br/>joyi</p>
              </div>
            </div>

            {/* ─ Footer ─ */}
            <p className="text-center text-xs text-[#B8860B]/30 pt-2">
              Arxitektor Kundaligi · Shartnoma #{contract.contractNumber} · {formatDate(contract.createdAt)}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
