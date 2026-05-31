"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Trash2, Calendar, CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

  if (loading) return <div className="h-48 bg-[#111] border border-[#222] animate-pulse rounded-lg" />
  if (!diary) return null

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between gap-4">
        <Link href="/diary">
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
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h2 className="text-2xl font-bold mb-1 text-white">{diary.title}</h2>
              <div className="flex items-center gap-3 text-[#555] text-sm">
                <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{formatDate(diary.date)}</span>
                {diary.mood && <span className="text-[#888]">{MOODS[diary.mood]}</span>}
              </div>
            </div>
          </div>
          {diary.description && (
            <p className="text-[#555] leading-relaxed">{diary.description}</p>
          )}
        </CardContent>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {diary.workDone && (
          <div className="arch-card">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm flex items-center gap-2 text-[#888]">
                <CheckCircle2 className="h-4 w-4" />Bajarilgan ishlar
              </CardTitle>
            </CardHeader>
            <CardContent><p className="text-sm whitespace-pre-line text-[#aaa]">{diary.workDone}</p></CardContent>
          </div>
        )}
        {diary.problems && (
          <div className="arch-card">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm flex items-center gap-2 text-[#888]">
                <AlertTriangle className="h-4 w-4" />Muammolar
              </CardTitle>
            </CardHeader>
            <CardContent><p className="text-sm whitespace-pre-line text-[#aaa]">{diary.problems}</p></CardContent>
          </div>
        )}
        {diary.decisions && (
          <div className="arch-card">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm flex items-center gap-2 text-[#888]">
                <Lightbulb className="h-4 w-4" />Qarorlar
              </CardTitle>
            </CardHeader>
            <CardContent><p className="text-sm whitespace-pre-line text-[#aaa]">{diary.decisions}</p></CardContent>
          </div>
        )}
      </div>

      {diary.projects?.length > 0 && (
        <div className="arch-card">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm text-[#888]">Bog'liq Loyihalar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {diary.projects.map((dp: any) => (
                <Link key={dp.project.id} href={`/projects/${dp.project.id}`}>
                  <div className="px-3 py-1.5 bg-[#1a1a1a] border border-[#333] rounded-lg text-sm font-medium text-[#888] hover:bg-[#222] transition-colors">
                    📐 {dp.project.name}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </div>
      )}
    </div>
  )
}
