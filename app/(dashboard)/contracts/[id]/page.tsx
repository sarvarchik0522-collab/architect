"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Printer, Trash2, FileDown } from "lucide-react"
import { exportContractToWord, printAsPDF } from "@/lib/export"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { cn, formatDate, formatCurrency } from "@/lib/utils"

const C = { ink:"var(--ink)", ink3:"var(--ink3)", cream:"var(--cream)", cream2:"var(--cream2)", stone:"var(--stone)", stone2:"var(--stone2)", white:"var(--white)", border:"rgba(200,168,112,.14)", gold:"var(--gold)" }

const STATUS_META: Record<string,{ label:string; color:string }> = {
  DRAFT:     { label:"Qoralama",   color:"bg-[var(--cream2)] text-[var(--stone2)] border border-[rgba(200,168,112,.18)]" },
  ACTIVE:    { label:"Faol",       color:"bg-[var(--cream2)] text-[var(--ink3)] border border-[rgba(200,168,112,.25)]"  },
  PENDING:   { label:"Kutilmoqda", color:"bg-[var(--cream2)] text-[var(--stone2)] border border-[rgba(200,168,112,.18)]"},
  COMPLETED: { label:"Tugallandi", color:"bg-[var(--cream2)] text-[var(--ink)] border border-[rgba(200,168,112,.3)]"    },
  CANCELLED: { label:"Bekor",      color:"bg-[var(--cream2)] text-[var(--stone)] border border-[rgba(200,168,112,.12)]" },
}

export default function ContractDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [contract, setContract] = useState<any>(null)
  const [loading,  setLoading]  = useState(true)
  const [mounted,  setMounted]  = useState(false)

  useEffect(() => {
    setMounted(true)
    fetch(`/api/contracts/${params.id}`).then(r=>r.json()).then(d=>{
      setContract(d); setLoading(false)
    }).catch(()=>setLoading(false))
  }, [params.id])

  const changeStatus = async(status:string) => {
    await fetch(`/api/contracts/${params.id}`,{
      method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({status})
    })
    setContract((c:any)=>({...c,status}))
    toast({title:"Holat yangilandi ✓"})
  }

  const del = async() => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return
    await fetch(`/api/contracts/${params.id}`,{method:"DELETE"})
    toast({title:"O'chirildi"}); router.push("/contracts")
  }

  if (loading) return (
    <div className="space-y-4 max-w-4xl">
      <div className="skeleton h-12 rounded-sm"/>
      <div className="skeleton h-[500px] rounded-sm"/>
    </div>
  )
  if (!contract) return (
    <div className="flex flex-col items-center py-24" style={{color:C.stone}}>
      <p className="font-semibold" style={{color:C.ink3}}>Shartnoma topilmadi</p>
      <Link href="/contracts">
        <button className="btn-outline mt-4 h-9 px-4 text-sm flex items-center gap-2">
          <ArrowLeft className="h-4 w-4"/> Orqaga
        </button>
      </Link>
    </div>
  )

  const sm = STATUS_META[contract.status] ?? STATUS_META.DRAFT

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #contract-print, #contract-print * { visibility: visible; }
          #contract-print {
            position: fixed; top: 0; left: 0; width: 100%;
            background: white !important; padding: 20mm;
            box-shadow: none !important; border: none !important;
          }
          body { background: white !important; }
          @page { margin: 15mm; size: A4; }
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      `}</style>

      <div className="max-w-4xl space-y-4 anim-page">

        {/* ─── Toolbar ─── */}
        <div className="flex items-center justify-between gap-3 no-print">
          <Link href="/contracts">
            <button className="btn-outline h-9 px-3 text-sm flex items-center gap-1.5">
              <ArrowLeft className="h-4 w-4"/> Orqaga
            </button>
          </Link>
          <div className="flex items-center gap-2">
            <Select value={contract.status} onValueChange={changeStatus}>
              <SelectTrigger className="h-9 w-36 rounded-sm text-sm"
                style={{ background:C.white, border:`1px solid ${C.border}`, color:C.ink3 }}>
                <SelectValue/>
              </SelectTrigger>
              <SelectContent style={{ background:C.white, border:`1px solid ${C.border}` }}>
                {Object.entries(STATUS_META).map(([k,v])=>(
                  <SelectItem key={k} value={k} style={{color:C.ink3}}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button onClick={() => exportContractToWord(contract)}
              className="btn-outline h-9 px-3 text-sm flex items-center gap-1.5">
              <FileDown className="h-4 w-4"/> Word (.docx)
            </button>
            <button onClick={() => printAsPDF("contract-print", `shartnoma-${contract.contractNumber}`)}
              className="btn-ink h-9 px-4 text-sm flex items-center gap-2">
              <Printer className="h-4 w-4"/> PDF (To'liq)
            </button>
            <button onClick={del}
              className="h-9 w-9 rounded flex items-center justify-center transition-colors"
              style={{ color:C.stone, border:`1px solid ${C.border}` }}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background=C.cream2}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="transparent"}}>
              <Trash2 className="h-4 w-4"/>
            </button>
          </div>
        </div>

        {/* ─── Contract document ─── */}
        <div id="contract-print" className="card-premium overflow-hidden">

          {/* Gold cornice header */}
          <div style={{ height:2, background:"linear-gradient(90deg,transparent,var(--gold),var(--gold2),var(--gold),transparent)" }}/>

          {/* Document header */}
          <div className="px-8 py-8 text-center relative overflow-hidden"
            style={{ background:"linear-gradient(135deg,var(--cream2),var(--cream))", borderBottom:`1px solid rgba(200,168,112,.15)` }}>
            {/* Subtle pattern */}
            <div className="absolute inset-0 bg-arch-dots" style={{ opacity:.3 }}/>
            <div className="relative z-10">
              {/* Column icon */}
              <div className="flex justify-center mb-4">
                <div className="h-14 w-14 rounded-sm flex items-center justify-center"
                  style={{ background:C.ink, boxShadow:"0 4px 16px rgba(26,24,20,.2)" }}>
                  <svg width="24" height="28" viewBox="0 0 24 28" fill="none">
                    <rect x="1" y="1" width="22" height="3.5" fill="var(--cream)" opacity=".9"/>
                    <path d="M2 4.5 Q12 7 22 4.5 L22 8 L2 8 Z" fill="var(--cream)" opacity=".15" stroke="var(--cream)" strokeWidth=".5"/>
                    <rect x="5.5" y="8" width="13" height="16" stroke="var(--cream)" strokeWidth="1.2" fill="none"/>
                    <rect x="4" y="24" width="16" height="2" fill="var(--cream)" opacity=".8"/>
                    <rect x="2" y="26" width="20" height="2.5" fill="var(--cream)"/>
                  </svg>
                </div>
              </div>
              <h1 className="text-2xl font-black tracking-tight mb-2"
                style={{ fontFamily:"'Playfair Display',serif", color:C.ink, letterSpacing:"-.02em" }}>
                ARXITEKTURA XIZMATLARI SHARTNOMASI
              </h1>
              <p className="font-semibold mb-1" style={{ color:C.stone2, fontSize:13 }}>
                Shartnoma № {contract.contractNumber}
              </p>
              <p className="text-xs" style={{ color:C.stone }}>
                Tuzilgan sana: {formatDate(contract.createdAt)}
              </p>
              <span className={cn("inline-block mt-2 text-xs px-3 py-1 rounded-sm font-semibold no-print",sm.color)}>
                {sm.label}
              </span>
            </div>
          </div>

          <div className="p-8 space-y-7">

            {/* Parties */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Buyurtmachi */}
              <div className="rounded-sm p-5"
                style={{ background:C.cream2, border:`1px solid rgba(200,168,112,.15)` }}>
                <div style={{ height:1.5, background:"linear-gradient(90deg,transparent,var(--gold),transparent)", marginBottom:12 }}/>
                <h3 className="font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2"
                  style={{ color:C.ink, letterSpacing:".1em" }}>
                  <span className="h-6 w-6 rounded flex items-center justify-center text-xs font-black flex-shrink-0"
                    style={{ background:C.ink, color:"var(--cream)" }}>1</span>
                  Buyurtmachi
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color:C.stone2 }}>Ism-sharif</p>
                    <p className="font-bold" style={{ color:C.ink }}>{contract.clientName}</p>
                  </div>
                  {contract.clientPassport&&<div><p className="text-[9px] uppercase tracking-wider mb-0.5" style={{color:C.stone2}}>Pasport</p><p style={{color:C.ink3}}>{contract.clientPassport}</p></div>}
                  {contract.clientPhone&&<div><p className="text-[9px] uppercase tracking-wider mb-0.5" style={{color:C.stone2}}>Telefon</p><p style={{color:C.ink3}}>{contract.clientPhone}</p></div>}
                  {contract.clientAddress&&<div><p className="text-[9px] uppercase tracking-wider mb-0.5" style={{color:C.stone2}}>Manzil</p><p style={{color:C.ink3}}>{contract.clientAddress}</p></div>}
                </div>
              </div>

              {/* Ijrochi */}
              <div className="rounded-sm p-5"
                style={{ background:"rgba(250,248,244,.8)", border:`1px solid rgba(200,168,112,.15)` }}>
                <div style={{ height:1.5, background:"linear-gradient(90deg,transparent,var(--stone),transparent)", marginBottom:12 }}/>
                <h3 className="font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2"
                  style={{ color:C.ink, letterSpacing:".1em" }}>
                  <span className="h-6 w-6 rounded flex items-center justify-center text-xs font-black flex-shrink-0"
                    style={{ background:"rgba(200,168,112,.4)", color:C.ink }}>2</span>
                  Ijrochi (Arxitektor)
                </h3>
                <div className="space-y-2 text-sm">
                  <div><p className="text-[9px] uppercase tracking-wider mb-0.5" style={{color:C.stone2}}>Ism-sharif</p><p className="font-bold" style={{color:C.ink}}>{contract.architectName}</p></div>
                  {contract.architectPhone&&<div><p className="text-[9px] uppercase tracking-wider mb-0.5" style={{color:C.stone2}}>Telefon</p><p style={{color:C.ink3}}>{contract.architectPhone}</p></div>}
                  {contract.architectAddress&&<div><p className="text-[9px] uppercase tracking-wider mb-0.5" style={{color:C.stone2}}>Manzil</p><p style={{color:C.ink3}}>{contract.architectAddress}</p></div>}
                </div>
              </div>
            </div>

            {/* Project info */}
            <div className="rounded-sm p-5"
              style={{ background:C.cream2, border:`1px solid rgba(200,168,112,.15)` }}>
              <div style={{ height:1, background:"linear-gradient(90deg,transparent,rgba(200,168,112,.3),transparent)", marginBottom:12 }}/>
              <h3 className="font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2"
                style={{ color:C.ink, letterSpacing:".1em" }}>
                <span style={{ fontSize:14 }}>📐</span> Loyiha Ma'lumotlari
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <div><p className="text-[9px] uppercase tracking-wider mb-0.5" style={{color:C.stone2}}>Loyiha nomi</p><p className="font-semibold" style={{color:C.ink}}>{contract.projectName}</p></div>
                {contract.projectType&&<div><p className="text-[9px] uppercase tracking-wider mb-0.5" style={{color:C.stone2}}>Turi</p><p className="font-semibold" style={{color:C.ink3}}>{contract.projectType}</p></div>}
                {contract.projectAddress&&<div><p className="text-[9px] uppercase tracking-wider mb-0.5" style={{color:C.stone2}}>Manzil</p><p className="font-semibold" style={{color:C.ink3}}>{contract.projectAddress}</p></div>}
                {contract.startDate&&<div><p className="text-[9px] uppercase tracking-wider mb-0.5" style={{color:C.stone2}}>Boshlanish</p><p className="font-semibold" style={{color:C.ink3}}>{formatDate(contract.startDate)}</p></div>}
                {contract.endDate&&<div><p className="text-[9px] uppercase tracking-wider mb-0.5" style={{color:C.stone2}}>Tugash</p><p className="font-semibold" style={{color:C.ink3}}>{formatDate(contract.endDate)}</p></div>}
              </div>
            </div>

            {/* Work items */}
            <div>
              <div style={{ height:1, background:"linear-gradient(90deg,transparent,rgba(200,168,112,.25),transparent)", marginBottom:12 }}/>
              <h3 className="font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2"
                style={{ color:C.ink, letterSpacing:".1em" }}>
                <span style={{ fontSize:14 }}>📋</span> Bajarilishi Kerak Bo'lgan Ishlar
              </h3>
              <div className="rounded-sm overflow-hidden"
                style={{ border:`1px solid rgba(200,168,112,.18)` }}>
                <pre className="p-5 text-sm whitespace-pre-wrap leading-relaxed"
                  style={{ background:C.cream2, color:C.ink3, fontFamily:"'Cormorant Garamond',serif", fontSize:"0.9rem" }}>
                  {contract.workItems}
                </pre>
              </div>
            </div>

            {/* Payment */}
            <div>
              <div style={{ height:1, background:"linear-gradient(90deg,transparent,rgba(200,168,112,.25),transparent)", marginBottom:12 }}/>
              <h3 className="font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2"
                style={{ color:C.ink, letterSpacing:".1em" }}>
                <span style={{ fontSize:14 }}>💳</span> To'lov Shartlari
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-sm p-5 text-center"
                  style={{ background:"linear-gradient(135deg,var(--cream2),var(--cream))", border:`1px solid rgba(200,168,112,.2)` }}>
                  <p className="text-[9px] uppercase tracking-wider mb-1 font-semibold" style={{ color:C.stone2 }}>Jami Summa</p>
                  <p className="text-3xl font-black"
                    style={{ color:C.ink, fontFamily:"'Playfair Display',serif" }}>
                    {formatCurrency(contract.totalAmount)}
                  </p>
                </div>
                {contract.advanceAmount>0&&(
                  <div className="rounded-sm p-5 text-center"
                    style={{ background:C.cream2, border:`1px solid rgba(200,168,112,.15)` }}>
                    <p className="text-[9px] uppercase tracking-wider mb-1 font-semibold" style={{ color:C.stone2 }}>Avans To'lov</p>
                    <p className="text-3xl font-black"
                      style={{ color:C.ink3, fontFamily:"'Playfair Display',serif" }}>
                      {formatCurrency(contract.advanceAmount)}
                    </p>
                    <p className="text-xs mt-1" style={{ color:C.stone }}>
                      Qoldiq: {formatCurrency(contract.totalAmount-contract.advanceAmount)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Terms */}
            {contract.terms&&(
              <div>
                <div style={{ height:1, background:"linear-gradient(90deg,transparent,rgba(200,168,112,.25),transparent)", marginBottom:12 }}/>
                <h3 className="font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2"
                  style={{ color:C.ink, letterSpacing:".1em" }}>
                  <span style={{ fontSize:14 }}>📄</span> Shartnoma Shartlari
                </h3>
                <div className="rounded-sm p-5"
                  style={{ background:C.cream2, border:`1px solid rgba(200,168,112,.15)` }}>
                  <pre className="text-sm whitespace-pre-wrap leading-relaxed"
                    style={{ color:C.ink3, fontFamily:"'Cormorant Garamond',serif", fontSize:"0.9rem" }}>
                    {contract.terms}
                  </pre>
                </div>
              </div>
            )}

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-8 pt-6"
              style={{ borderTop:`1px solid rgba(200,168,112,.15)` }}>
              {[{label:"Buyurtmachi",name:contract.clientName},{label:"Ijrochi (Arxitektor)",name:contract.architectName}].map(s=>(
                <div key={s.label} className="text-center">
                  <p className="text-[9px] uppercase tracking-wider mb-6 font-semibold" style={{ color:C.stone2 }}>{s.label}</p>
                  <div className="mb-2" style={{ borderBottom:`1.5px dashed rgba(200,168,112,.3)`, height:40 }}/>
                  <p className="text-sm font-bold" style={{ color:C.ink }}>{s.name}</p>
                  <p className="text-[9px]" style={{ color:C.stone }}>Imzo / Sana</p>
                </div>
              ))}
            </div>

            {/* Stamp */}
            <div className="flex justify-center mt-2">
              <div className="h-28 w-28 rounded-full flex flex-col items-center justify-center"
                style={{ border:`3px dashed rgba(200,168,112,.2)` }}>
                <span className="text-xl opacity-30">🏛️</span>
                <p className="text-xs text-center mt-1 leading-tight font-medium"
                  style={{ color:"rgba(200,168,112,.35)" }}>Muhr<br/>joyi</p>
              </div>
            </div>

            {/* Footer */}
            <p className="text-center text-xs" style={{ color:C.stone }}>
              Arxitektor Kundaligi · Shartnoma #{contract.contractNumber} · {formatDate(contract.createdAt)}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
