"use client"
import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Download, Printer, Edit, Trash2, CheckCircle, Clock, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { cn, formatDate, formatCurrency } from "@/lib/utils"

const STATUS_META: Record<string, { label: string; color: string }> = {
  DRAFT:     { label:"Qoralama",   color:"bg-slate-100 text-slate-600" },
  ACTIVE:    { label:"Faol",       color:"bg-green-100 text-green-700" },
  PENDING:   { label:"Kutilmoqda", color:"bg-yellow-100 text-yellow-700" },
  COMPLETED: { label:"Tugallandi", color:"bg-blue-100 text-blue-700" },
  CANCELLED: { label:"Bekor",      color:"bg-red-100 text-red-600" },
}


export default function ContractDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [contract, setContract] = useState<any>(null)
  const [loading,  setLoading]  = useState(true)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch(`/api/contracts/${params.id}`).then(r => r.json()).then(d => { setContract(d); setLoading(false) })
  }, [params.id])

  const changeStatus = async (status: string) => {
    await fetch(`/api/contracts/${params.id}`, {
      method:"PUT", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ status })
    })
    setContract((c: any) => ({ ...c, status }))
    toast({ title:"Holat yangilandi ✓" })
  }

  const del = async () => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return
    await fetch(`/api/contracts/${params.id}`, { method:"DELETE" })
    toast({ title:"O'chirildi" }); router.push("/contracts")
  }

  const handlePrint = () => window.print()

  if (loading) return <div className="space-y-4"><div className="skeleton h-16 rounded-2xl" /><div className="skeleton h-96 rounded-2xl" /></div>
  if (!contract) return null

  const sm = STATUS_META[contract.status] ?? STATUS_META.DRAFT

  return (
    <div className="max-w-4xl space-y-4 page-enter">
      {/* Toolbar — no print */}
      <div className="flex items-center justify-between gap-3 no-print">
        <Link href="/contracts">
          <Button variant="ghost" size="sm" className="gap-1 -ml-2 text-amber-700"><ArrowLeft className="h-4 w-4"/>Orqaga</Button>
        </Link>
        <div className="flex items-center gap-2">
          <Select value={contract.status} onValueChange={changeStatus}>
            <SelectTrigger className="h-9 w-36 rounded-xl border-[#e8d8b0] dark:border-[#2a1e08] text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Qoralama</SelectItem>
              <SelectItem value="PENDING">Kutilmoqda</SelectItem>
              <SelectItem value="ACTIVE">Faol</SelectItem>
              <SelectItem value="COMPLETED">Tugallandi</SelectItem>
              <SelectItem value="CANCELLED">Bekor</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handlePrint} className="btn-gold text-white gap-2 rounded-xl h-9">
            <Printer className="h-4 w-4"/>PDF / Chop etish
          </Button>
          <Button variant="ghost" size="icon" onClick={del} className="h-9 w-9 rounded-xl text-red-400 hover:bg-red-50">
            <Trash2 className="h-4 w-4"/>
          </Button>
        </div>
      </div>

      {/* Contract document */}
      <div ref={printRef} className="bg-white dark:bg-[#0e0b04] rounded-3xl border border-[#e8d8b0] dark:border-[#2a1e08] overflow-hidden print:border-0 print:rounded-none" id="contract-print">

        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1a3a6b] to-[#0d2348] px-8 py-8 text-white print:bg-white print:text-black print:border-b-2 print:border-amber-600">
          <div className="absolute inset-0 pointer-events-none opacity-10">
            <svg className="absolute right-4 top-4 animate-rotate-slow" width="180" height="180" viewBox="0 0 200 200">
              <polygon points="100,10 190,55 190,145 100,190 10,145 10,55" fill="none" stroke="currentColor" strokeWidth="1.5"/>
              <polygon points="100,30 170,65 170,135 100,170 30,135 30,65" fill="none" stroke="currentColor" strokeWidth="1"/>
              <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="0.7"/>
            </svg>
          </div>
          <div className="relative z-10 text-center">
            <div className="flex justify-center mb-3">
              <div className="h-14 w-14 rounded-2xl bg-white/15 border border-white/30 flex items-center justify-center text-3xl">🏛️</div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight print:text-[#1a3a6b]">ARXITEKTURA XIZMATLARI SHARTNOMASI</h1>
            <p className="text-blue-200/80 mt-1 print:text-gray-500">Shartnoma № {contract.contractNumber}</p>
            <p className="text-blue-200/60 text-sm print:text-gray-400">Tuzilgan sana: {formatDate(contract.createdAt)}</p>
            <span className={cn("inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold no-print", sm.color)}>{sm.label}</span>
          </div>
        </div>

        <div className="p-8 space-y-8 print:p-6">
          {/* Parties */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client */}
            <div className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 print:border print:border-gray-200 print:bg-gray-50">
              <h3 className="font-bold text-[#3d2800] dark:text-amber-100 mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                <span className="h-6 w-6 rounded-lg bg-[#1a3a6b] text-white flex items-center justify-center text-xs flex-shrink-0">1</span>
                Buyurtmachi
              </h3>
              <div className="space-y-1.5 text-sm">
                <p><span className="text-amber-600/60 text-xs">Ism:</span><br/><strong className="text-[#3d2800] dark:text-amber-100">{contract.clientName}</strong></p>
                {contract.clientPassport && <p><span className="text-amber-600/60 text-xs">Pasport:</span><br/><span>{contract.clientPassport}</span></p>}
                {contract.clientPhone   && <p><span className="text-amber-600/60 text-xs">Tel:</span> {contract.clientPhone}</p>}
                {contract.clientAddress && <p><span className="text-amber-600/60 text-xs">Manzil:</span> {contract.clientAddress}</p>}
              </div>
            </div>

            {/* Architect */}
            <div className="p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 print:border print:border-gray-200 print:bg-gray-50">
              <h3 className="font-bold text-[#3d2800] dark:text-amber-100 mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                <span className="h-6 w-6 rounded-lg bg-amber-500 text-white flex items-center justify-center text-xs flex-shrink-0">2</span>
                Ijrochi (Arxitektor)
              </h3>
              <div className="space-y-1.5 text-sm">
                <p><span className="text-amber-600/60 text-xs">Ism:</span><br/><strong className="text-[#3d2800] dark:text-amber-100">{contract.architectName}</strong></p>
                {contract.architectPhone   && <p><span className="text-amber-600/60 text-xs">Tel:</span> {contract.architectPhone}</p>}
                {contract.architectAddress && <p><span className="text-amber-600/60 text-xs">Manzil:</span> {contract.architectAddress}</p>}
              </div>
            </div>
          </div>

          {/* Project info */}
          <div className="p-5 rounded-2xl bg-slate-50/60 dark:bg-slate-900/30 border border-[#e8d8b0] dark:border-[#2a1e08] print:border print:border-gray-200">
            <h3 className="font-bold text-[#3d2800] dark:text-amber-100 mb-4 text-sm uppercase tracking-wider">📐 Loyiha ma'lumotlari</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div><p className="text-xs text-amber-600/50">Loyiha nomi</p><p className="font-semibold text-[#3d2800] dark:text-amber-100">{contract.projectName}</p></div>
              {contract.projectType    && <div><p className="text-xs text-amber-600/50">Turi</p><p className="font-semibold text-[#3d2800] dark:text-amber-100">{contract.projectType}</p></div>}
              {contract.projectAddress && <div><p className="text-xs text-amber-600/50">Manzil</p><p className="font-semibold text-[#3d2800] dark:text-amber-100">{contract.projectAddress}</p></div>}
              {contract.startDate      && <div><p className="text-xs text-amber-600/50">Boshlanish</p><p className="font-semibold text-[#3d2800] dark:text-amber-100">{formatDate(contract.startDate)}</p></div>}
              {contract.endDate        && <div><p className="text-xs text-amber-600/50">Tugash</p><p className="font-semibold text-[#3d2800] dark:text-amber-100">{formatDate(contract.endDate)}</p></div>}
            </div>
          </div>

          {/* Work items */}
          <div>
            <h3 className="font-bold text-[#3d2800] dark:text-amber-100 mb-4 text-sm uppercase tracking-wider">📋 Bajarilishi kerak bo'lgan ishlar</h3>
            <div className="rounded-2xl overflow-hidden border border-[#e8d8b0] dark:border-[#2a1e08] print:border-gray-200">
              <pre className="p-5 text-sm text-[#3d2800] dark:text-amber-100 whitespace-pre-wrap font-mono bg-amber-50/40 dark:bg-amber-950/10 leading-relaxed print:bg-gray-50">{contract.workItems}</pre>
            </div>
          </div>

          {/* Payment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-center print:border-gray-200">
              <p className="text-xs text-emerald-600/60 uppercase tracking-wider mb-1">Jami Summa</p>
              <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(contract.totalAmount)}</p>
            </div>
            {contract.advanceAmount > 0 && (
              <div className="p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-center print:border-gray-200">
                <p className="text-xs text-blue-600/60 uppercase tracking-wider mb-1">Avans To'lov</p>
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">{formatCurrency(contract.advanceAmount)}</p>
                <p className="text-xs text-blue-500/50 mt-1">Qoldiq: {formatCurrency(contract.totalAmount - contract.advanceAmount)}</p>
              </div>
            )}
          </div>

          {/* Terms */}
          {contract.terms && (
            <div>
              <h3 className="font-bold text-[#3d2800] dark:text-amber-100 mb-3 text-sm uppercase tracking-wider">📄 Shartnoma Shartlari</h3>
              <div className="p-5 rounded-2xl border border-[#e8d8b0] dark:border-[#2a1e08] bg-amber-50/30 dark:bg-amber-950/10 print:border-gray-200">
                <pre className="text-sm text-[#3d2800] dark:text-amber-100 whitespace-pre-wrap leading-relaxed">{contract.terms}</pre>
              </div>
            </div>
          )}

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-6 border-t border-[#e8d8b0] dark:border-[#2a1e08] print:border-gray-300">
            {[
              { label:"Buyurtmachi", name: contract.clientName },
              { label:"Ijrochi (Arxitektor)", name: contract.architectName },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-xs text-amber-600/50 uppercase tracking-wider mb-6">{s.label}</p>
                <div className="border-b-2 border-dashed border-[#e8d8b0] dark:border-[#2a1e08] print:border-gray-400 mb-1 h-10" />
                <p className="text-sm font-semibold text-[#3d2800] dark:text-amber-100">{s.name}</p>
              </div>
            ))}
          </div>

          {/* Stamp area */}
          <div className="flex justify-center mt-4 print:mt-8">
            <div className="h-24 w-24 rounded-full border-4 border-dashed border-[#e8d8b0] dark:border-[#2a1e08] print:border-gray-300 flex items-center justify-center">
              <p className="text-xs text-amber-400/30 print:text-gray-300 text-center leading-tight">Muhr<br/>joyi</p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-amber-400/40 print:text-gray-400">
            Arxitektor Kundaligi · Shartnoma #{contract.contractNumber} · {formatDate(contract.createdAt)}
          </p>
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; -webkit-print-color-adjust: exact; }
          #contract-print { border: none !important; box-shadow: none !important; }
          .card-gold, .rounded-2xl, .rounded-3xl { box-shadow: none !important; }
        }
      `}</style>
    </div>
  )
}
