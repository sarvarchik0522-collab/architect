"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Trash2, Phone, Mail, Building, MapPin, FolderKanban, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { cn, formatDate, formatCurrency, PROJECT_STATUSES } from "@/lib/utils"

export default function ClientDetail() {
  const params = useParams(); const router = useRouter(); const { toast } = useToast()
  const [client, setClient] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/clients/${params.id}`).then(r => r.json()).then(d => { setClient(d); setLoading(false) })
  }, [params.id])

  const del = async () => {
    if (!confirm("Mijozni o'chirishni tasdiqlaysizmi?")) return
    await fetch(`/api/clients/${params.id}`, { method:"DELETE" })
    toast({ title:"Mijoz o'chirildi" }); router.push("/clients")
  }

  if (loading) return <div className="h-48 bg-[#111] border border-[#222] animate-pulse rounded-lg" />
  if (!client) return null

  const totalPayments = client.payments?.reduce((s: number, p: any) => s + p.amount, 0) ?? 0
  const initials = client.name.split(" ").map((n:string) => n[0]).join("").toUpperCase().slice(0,2)

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between gap-4">
        <Link href="/clients">
          <Button variant="ghost" size="sm" className="gap-1 -ml-2 text-[#888] hover:text-white">
            <ArrowLeft className="h-4 w-4" />Orqaga
          </Button>
        </Link>
        <Button variant="outline" size="sm" className="gap-1 border-[#333] text-[#888] hover:text-white" onClick={del}>
          <Trash2 className="h-4 w-4" />O'chirish
        </Button>
      </div>

      <div className="arch-card">
        <CardContent className="pt-5">
          <div className="flex items-start gap-4 mb-4">
            <div className="h-16 w-16 rounded-2xl bg-[#222] border border-[#333] flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">{client.name}</h2>
              {client.company && (
                <p className="text-[#555] flex items-center gap-1.5 mt-1">
                  <Building className="h-4 w-4" />{client.company}
                </p>
              )}
            </div>
            {totalPayments > 0 && (
              <div className="bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-center flex-shrink-0">
                <p className="text-xs text-[#666] font-medium">Jami to'lovlar</p>
                <p className="text-lg font-bold text-white">{formatCurrency(totalPayments)}</p>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-[#222]">
            {client.phone && (
              <a href={`tel:${client.phone}`} className="flex items-start gap-2 hover:text-[#aaa] transition-colors text-[#666]">
                <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div><p className="text-xs text-[#444]">Telefon</p><p className="text-sm font-medium text-[#aaa]">{client.phone}</p></div>
              </a>
            )}
            {client.email && (
              <a href={`mailto:${client.email}`} className="flex items-start gap-2 hover:text-[#aaa] transition-colors text-[#666]">
                <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div><p className="text-xs text-[#444]">Email</p><p className="text-sm font-medium text-[#aaa] truncate">{client.email}</p></div>
              </a>
            )}
            {client.address && (
              <div className="flex items-start gap-2 col-span-2 text-[#666]">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div><p className="text-xs text-[#444]">Manzil</p><p className="text-sm font-medium text-[#aaa]">{client.address}</p></div>
              </div>
            )}
          </div>
          {client.notes && (
            <p className="text-sm text-[#555] mt-4 pt-4 border-t border-[#222]">{client.notes}</p>
          )}
        </CardContent>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="arch-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-[#888]">
              <FolderKanban className="h-4 w-4" />Loyihalar ({client.projects?.length ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!client.projects?.length ? (
              <p className="text-sm text-[#444] text-center py-6">Loyiha yo'q</p>
            ) : (
              <div className="space-y-2">
                {client.projects.map((p: any) => {
                  const s = PROJECT_STATUSES[p.status as keyof typeof PROJECT_STATUSES]
                  return (
                    <Link key={p.id} href={`/projects/${p.id}`}>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-[#1a1a1a] border border-[#333] hover:bg-[#222] transition-colors cursor-pointer">
                        <div>
                          <p className="text-sm font-medium text-white">{p.name}</p>
                          {p.deadline && <p className="text-xs text-[#555]">{formatDate(p.deadline)}</p>}
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ml-2 bg-[#222] text-[#888] border border-[#333]">
                          {s?.label}
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </div>

        <div className="arch-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-[#888]">
              <DollarSign className="h-4 w-4" />To'lov tarixi ({client.payments?.length ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!client.payments?.length ? (
              <p className="text-sm text-[#444] text-center py-6">To'lov yo'q</p>
            ) : (
              <div className="space-y-2">
                {client.payments.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-[#1a1a1a] border border-[#333]">
                    <div>
                      <p className="text-sm font-medium text-white">+{formatCurrency(p.amount)}</p>
                      {p.description && <p className="text-xs text-[#555]">{p.description}</p>}
                    </div>
                    <p className="text-xs text-[#444]">{formatDate(p.date)}</p>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2 border-t border-[#222]">
                  <span className="text-sm font-medium text-[#888]">Jami:</span>
                  <span className="text-sm font-bold text-white">{formatCurrency(totalPayments)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </div>
      </div>
    </div>
  )
}
