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
  DRAFT:     { label: "Qoralama",   color: "bg-[#1a1a1a] text-[#666] border border-[#333]" },
  ACTIVE:    { label: "Faol",       color: "bg-[#1a1a1a] text-[#aaa] border border-[#444]" },
  PENDING:   { label: "Kutilmoqda", color: "bg-[#1a1a1a] text-[#888] border border-[#333]" },
  COMPLETED: { label: "Tugallandi", color: "bg-[#1a1a1a] text-[#ccc] border border-[#444]" },
  CANCELLED: { label: "Bekor",      color: "bg-[#1a1a1a] text-[#444] border border-[#222]" },
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
        <div className="h-12 rounded-2xl bg-[#111] border border-[#222] animate-pulse" />
        <div className="h-[600px] rounded-3xl bg-[#111] border border-[#222] animate-pulse" />
      </div>
    )
  }
  if (!contract) return (
    <div className="flex flex-col items-center py-24 text-[#444]">
      <p className="text-lg font-semibold text-[#555]">Shartnoma topilmadi</p>
      <Link href="/contracts">
        <Button variant="ghost" className="mt-4 gap-2 text-[#888]"><ArrowLeft className="h-4 w-4" />Orqaga</Button>
      </Link>
    </div>
  )

  const sm = STATUS_META[contract.status] ?? STATUS_META.DRAFT

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #contract-print, #contract-print * { visibility: visible; }
          #contract-print { position: fixed; top: 0; left: 0; width: 100%; background: white !important; }
          body { background: white !important; margin: 0; padding: 0; }
          #contract-print { padding: 20mm; box-shadow: none !important; border: none !important; border-radius: 0 !important; }
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          #contract-print h1, #contract-print h2, #contract-print h3 { color: #111 !important; }
          #contract-print p, #contract-print span, #contract-print td { color: #1a1a1a !important; }
          .print-grid-2 { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 16px !important; }
          @page { margin: 15mm; size: A4; }
        }
      `}</style>

      <div className="max-w-4xl space-y-4 page-enter">

        {/* ── Toolbar (hidden on print) ── */}
        <div className="flex items-center justify-between gap-3 no-print">
          <Link href="/contracts">
            <Button variant="ghost" size="sm" className="gap-1 -ml-2 text-[#888] hover:text-white">
              <ArrowLeft className="h-4 w-4" />Orqaga
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Select value={contract.status} onValueChange={changeStatus}>
              <SelectTrigger className="h-9 w-36 rounded-xl border-[#333] bg-[#111] text-white text-sm">
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
            <Button onClick={handlePrint} className="btn-primary gap-2 rounded-xl h-9">
              <Printer className="h-4 w-4" />PDF yuklab olish
            </Button>
            <Button variant="ghost" size="icon" onClick={del}
              className="h-9 w-9 rounded-xl text-[#444] hover:bg-[#1a1a1a] hover:text-[#888]">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* ── Contract Document ── */}
        <div id="contract-print"
          className="bg-[#0d0d0d] rounded-3xl border border-[#222] overflow-hidden shadow-xl">

          {/* ─ Header ─ */}
          <div className="bg-[#111] border-b border-[#222] px-8 py-8 text-white text-center relative overflow-hidden">
            <div className="absolute right-4 top-4 opacity-10 pointer-events-none">
              <svg width="160" height="160" viewBox="0 0 200 200">
                <polygon points="100,10 190,55 190,145 100,190 10,145 10,55" fill="none" stroke="white" strokeWidth="1.5"/>
                <polygon points="100,30 170,65 170,135 100,170 30,135 30,65" fill="none" stroke="white" strokeWidth="1"/>
                <circle cx="100" cy="100" r="40" fill="none" stroke="white" strokeWidth="0.7"/>
              </svg>
            </div>
            <div className="relative z-10">
              <div className="flex justify-center mb-4">
                <div className="h-14 w-14 rounded-2xl bg-[#1a1a1a] border border-[#333] flex items-center justify-center text-3xl">🏛️</div>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">ARXITEKTURA XIZMATLARI SHARTNOMASI</h1>
              <p className="text-[#666] mt-2 text-sm font-semibold">Shartnoma № {contract.contractNumber}</p>
              <p className="text-[#444] text-xs mt-1">Tuzilgan sana: {formatDate(contract.createdAt)}</p>
              <span className={cn("inline-block mt-3 px-3 py-1 rounded-full text-xs font-bold no-print", sm.color)}>
                {sm.label}
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">

            {/* ─ Parties ─ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 print-grid-2">
              {/* Buyurtmachi */}
              <div className="p-5 rounded-2xl bg-[#111] border border-[#222]">
                <h3 className="font-bold text-white mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                  <span className="h-6 w-6 rounded-lg bg-[#222] border border-[#333] text-[#888] flex items-center justify-center text-xs flex-shrink-0 font-bold">1</span>
                  Buyurtmachi
                </h3>
                <div className="space-y-2 text-sm text-[#aaa]">
                  <div>
                    <p className="text-xs text-[#444] mb-0.5">Ism-sharif</p>
                    <p className="font-bold text-white">{contract.clientName}</p>
                  </div>
                  {contract.clientPassport && (
                    <div>
                      <p className="text-xs text-[#444] mb-0.5">Pasport</p>
                      <p>{contract.clientPassport}</p>
                    </div>
                  )}
                  {contract.clientPhone && (
                    <div>
                      <p className="text-xs text-[#444] mb-0.5">Telefon</p>
                      <p>{contract.clientPhone}</p>
                    </div>
                  )}
                  {contract.clientAddress && (
                    <div>
                      <p className="text-xs text-[#444] mb-0.5">Manzil</p>
                      <p>{contract.clientAddress}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Ijrochi */}
              <div className="p-5 rounded-2xl bg-[#111] border border-[#222]">
                <h3 className="font-bold text-white mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                  <span className="h-6 w-6 rounded-lg bg-[#222] border border-[#333] text-[#888] flex items-center justify-center text-xs flex-shrink-0 font-bold">2</span>
                  Ijrochi (Arxitektor)
                </h3>
                <div className="space-y-2 text-sm text-[#aaa]">
                  <div>
                    <p className="text-xs text-[#444] mb-0.5">Ism-sharif</p>
                    <p className="font-bold text-white">{contract.architectName}</p>
                  </div>
                  {contract.architectPhone && (
                    <div>
                      <p className="text-xs text-[#444] mb-0.5">Telefon</p>
                      <p>{contract.architectPhone}</p>
                    </div>
                  )}
                  {contract.architectAddress && (
                    <div>
                      <p className="text-xs text-[#444] mb-0.5">Manzil</p>
                      <p>{contract.architectAddress}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ─ Project Info ─ */}
            <div className="p-5 rounded-2xl bg-[#111] border border-[#222]">
              <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">
                📐 Loyiha Ma'lumotlari
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs text-[#444] mb-0.5">Loyiha nomi</p>
                  <p className="font-semibold text-white">{contract.projectName}</p>
                </div>
                {contract.projectType && (
                  <div>
                    <p className="text-xs text-[#444] mb-0.5">Loyiha turi</p>
                    <p className="font-semibold text-white">{contract.projectType}</p>
                  </div>
                )}
                {contract.projectAddress && (
                  <div>
                    <p className="text-xs text-[#444] mb-0.5">Manzil</p>
                    <p className="font-semibold text-white">{contract.projectAddress}</p>
                  </div>
                )}
                {contract.startDate && (
                  <div>
                    <p className="text-xs text-[#444] mb-0.5">Boshlanish sanasi</p>
                    <p className="font-semibold text-white">{formatDate(contract.startDate)}</p>
                  </div>
                )}
                {contract.endDate && (
                  <div>
                    <p className="text-xs text-[#444] mb-0.5">Tugash sanasi</p>
                    <p className="font-semibold text-white">{formatDate(contract.endDate)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* ─ Work Items ─ */}
            <div>
              <h3 className="font-bold text-white mb-3 text-sm uppercase tracking-wider">
                📋 Bajarilishi Kerak Bo'lgan Ishlar
              </h3>
              <div className="rounded-2xl overflow-hidden border border-[#222]">
                <pre className="p-5 text-sm text-[#aaa] whitespace-pre-wrap font-mono bg-[#111] leading-relaxed">
                  {contract.workItems}
                </pre>
              </div>
            </div>

            {/* ─ Payment ─ */}
            <div>
              <h3 className="font-bold text-white mb-3 text-sm uppercase tracking-wider">
                💳 To'lov Shartlari
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-[#111] border border-[#222] text-center">
                  <p className="text-xs text-[#444] uppercase tracking-wider mb-1 font-semibold">Jami Summa</p>
                  <p className="text-3xl font-bold text-white">
                    {formatCurrency(contract.totalAmount)}
                  </p>
                </div>
                {contract.advanceAmount > 0 && (
                  <div className="p-5 rounded-2xl bg-[#111] border border-[#222] text-center">
                    <p className="text-xs text-[#444] uppercase tracking-wider mb-1 font-semibold">Avans To'lov</p>
                    <p className="text-3xl font-bold text-white">
                      {formatCurrency(contract.advanceAmount)}
                    </p>
                    <p className="text-xs text-[#444] mt-1">
                      Qoldiq: {formatCurrency(contract.totalAmount - contract.advanceAmount)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ─ Terms ─ */}
            {contract.terms && (
              <div>
                <h3 className="font-bold text-white mb-3 text-sm uppercase tracking-wider">
                  📄 Shartnoma Shartlari
                </h3>
                <div className="p-5 rounded-2xl border border-[#222] bg-[#111]">
                  <pre className="text-sm text-[#888] whitespace-pre-wrap leading-relaxed">
                    {contract.terms}
                  </pre>
                </div>
              </div>
            )}

            {/* ─ Signatures ─ */}
            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-[#222]">
              {[
                { label: "Buyurtmachi", name: contract.clientName },
                { label: "Ijrochi (Arxitektor)", name: contract.architectName },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <p className="text-xs text-[#444] uppercase tracking-wider mb-6 font-semibold">{s.label}</p>
                  <div className="border-b-2 border-dashed border-[#333] mb-2 h-10" />
                  <p className="text-sm font-semibold text-[#aaa]">{s.name}</p>
                  <p className="text-xs text-[#333] mt-0.5">Imzo / Sana</p>
                </div>
              ))}
            </div>

            {/* ─ Stamp ─ */}
            <div className="flex justify-center mt-2">
              <div className="h-28 w-28 rounded-full border-4 border-dashed border-[#222] flex flex-col items-center justify-center gap-1">
                <span className="text-xl opacity-20">🏛️</span>
                <p className="text-xs text-[#333] text-center leading-tight font-medium">Muhr<br/>joyi</p>
              </div>
            </div>

            {/* ─ Footer ─ */}
            <p className="text-center text-xs text-[#333] pt-2">
              Arxitektor Kundaligi · Shartnoma #{contract.contractNumber} · {formatDate(contract.createdAt)}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
