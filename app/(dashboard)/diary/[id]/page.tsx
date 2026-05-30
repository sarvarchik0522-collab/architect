"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Trash2, Calendar, CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/utils"

const MOODS: Record<string, string> = { GREAT:"😄 Ajoyib", GOOD:"🙂 Yaxshi", NEUTRAL:"😐 Oddiy", BAD:"😞 Yomon" }

export default function DiaryDetail() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [diary, setDiary] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/diary/${params.id}`).then(r => r.json()).then(d => { setDiary(d); setLoading(false) })
  }, [params.id])

  const del = async () => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return
    await fetch(`/api/diary/${params.id}`, { method:"DELETE" })
    toast({ title:"O'chirildi" }); router.push("/diary")
  }

  if (loading) return <div className="h-48 bg-muted animate-pulse rounded-lg" />
  if (!diary) return null

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between gap-4">
        <Link href="/diary"><Button variant="ghost" size="sm" className="gap-1 -ml-2"><ArrowLeft className="h-4 w-4" />Orqaga</Button></Link>
        <Button variant="destructive" size="sm" className="gap-1" onClick={del}><Trash2 className="h-4 w-4" />O'chirish</Button>
      </div>

      <Card>
        <CardContent className="pt-5">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h2 className="text-2xl font-bold mb-1">{diary.title}</h2>
              <div className="flex items-center gap-3 text-muted-foreground text-sm">
                <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{formatDate(diary.date)}</span>
                {diary.mood && <span>{MOODS[diary.mood]}</span>}
              </div>
            </div>
          </div>
          {diary.description && <p className="text-muted-foreground leading-relaxed">{diary.description}</p>}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {diary.workDone && (
          <Card className="border-green-200 dark:border-green-900">
            <CardHeader className="pb-2 pt-4"><CardTitle className="text-sm flex items-center gap-2 text-green-700 dark:text-green-400"><CheckCircle2 className="h-4 w-4" />Bajarilgan ishlar</CardTitle></CardHeader>
            <CardContent><p className="text-sm whitespace-pre-line">{diary.workDone}</p></CardContent>
          </Card>
        )}
        {diary.problems && (
          <Card className="border-orange-200 dark:border-orange-900">
            <CardHeader className="pb-2 pt-4"><CardTitle className="text-sm flex items-center gap-2 text-orange-700 dark:text-orange-400"><AlertTriangle className="h-4 w-4" />Muammolar</CardTitle></CardHeader>
            <CardContent><p className="text-sm whitespace-pre-line">{diary.problems}</p></CardContent>
          </Card>
        )}
        {diary.decisions && (
          <Card className="border-blue-200 dark:border-blue-900">
            <CardHeader className="pb-2 pt-4"><CardTitle className="text-sm flex items-center gap-2 text-blue-700 dark:text-blue-400"><Lightbulb className="h-4 w-4" />Qarorlar</CardTitle></CardHeader>
            <CardContent><p className="text-sm whitespace-pre-line">{diary.decisions}</p></CardContent>
          </Card>
        )}
      </div>

      {diary.projects?.length > 0 && (
        <Card>
          <CardHeader className="pb-2 pt-4"><CardTitle className="text-sm">Bog'liq Loyihalar</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {diary.projects.map((dp: any) => (
                <Link key={dp.project.id} href={`/projects/${dp.project.id}`}>
                  <div className="px-3 py-1.5 bg-muted rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors">📐 {dp.project.name}</div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
