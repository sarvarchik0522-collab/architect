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

  if (loading) return <div className="h-48 bg-muted animate-pulse rounded-lg" />
  if (!client) return null

  const totalPayments = client.payments?.reduce((s: number, p: any) => s + p.amount, 0) ?? 0

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between gap-4">
        <Link href="/clients"><Button variant="ghost" size="sm" className="gap-1 -ml-2"><ArrowLeft className="h-4 w-4" />Orqaga</Button></Link>
        <Button variant="destructive" size="sm" className="gap-1" onClick={del}><Trash2 className="h-4 w-4" />O'chirish</Button>
      </div>

      <Card>
        <CardContent className="pt-5">
          <div className="flex items-start gap-4 mb-4">
            <div className="h-16 w-16 rounded-2xl bg-blue-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
              {client.name.split(" ").map((n:string) => n[0]).join("").toUpperCase().slice(0,2)}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{client.name}</h2>
              {client.company && <p className="text-muted-foreground flex items-center gap-1.5 mt-1"><Building className="h-4 w-4" />{client.company}</p>}
            </div>
            {totalPayments > 0 && (
              <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl px-4 py-3 text-center flex-shrink-0">
                <p className="text-xs text-emerald-600 font-medium">Jami to'lovlar</p>
                <p className="text-lg font-bold text-emerald-700">{formatCurrency(totalPayments)}</p>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            {client.phone  && <a href={`tel:${client.phone}`}       className="flex items-start gap-2 hover:text-blue-600 transition-colors"><Phone  className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" /><div><p className="text-xs text-muted-foreground">Telefon</p><p className="text-sm font-medium">{client.phone}</p></div></a>}
            {client.email  && <a href={`mailto:${client.email}`}    className="flex items-start gap-2 hover:text-blue-600 transition-colors"><Mail   className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" /><div><p className="text-xs text-muted-foreground">Email</p><p className="text-sm font-medium truncate">{client.email}</p></div></a>}
            {client.address && <div className="flex items-start gap-2 col-span-2"><MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" /><div><p className="text-xs text-muted-foreground">Manzil</p><p className="text-sm font-medium">{client.address}</p></div></div>}
          </div>
          {client.notes && <p className="text-sm text-muted-foreground mt-4 pt-4 border-t">{client.notes}</p>}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><FolderKanban className="h-4 w-4 text-blue-500" />Loyihalar ({client.projects?.length ?? 0})</CardTitle></CardHeader>
          <CardContent>
            {!client.projects?.length ? <p className="text-sm text-muted-foreground text-center py-6">Loyiha yo'q</p> :
              <div className="space-y-2">
                {client.projects.map((p: any) => {
                  const s = PROJECT_STATUSES[p.status as keyof typeof PROJECT_STATUSES]
                  return (
                    <Link key={p.id} href={`/projects/${p.id}`}>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors cursor-pointer">
                        <div><p className="text-sm font-medium">{p.name}</p>{p.deadline && <p className="text-xs text-muted-foreground">{formatDate(p.deadline)}</p>}</div>
                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ml-2", s?.color)}>{s?.label}</span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            }
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><DollarSign className="h-4 w-4 text-emerald-500" />To'lov tarixi ({client.payments?.length ?? 0})</CardTitle></CardHeader>
          <CardContent>
            {!client.payments?.length ? <p className="text-sm text-muted-foreground text-center py-6">To'lov yo'q</p> :
              <div className="space-y-2">
                {client.payments.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                    <div><p className="text-sm font-medium text-emerald-600">+{formatCurrency(p.amount)}</p>{p.description && <p className="text-xs text-muted-foreground">{p.description}</p>}</div>
                    <p className="text-xs text-muted-foreground">{formatDate(p.date)}</p>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm font-medium">Jami:</span>
                  <span className="text-sm font-bold text-emerald-600">{formatCurrency(totalPayments)}</span>
                </div>
              </div>
            }
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
