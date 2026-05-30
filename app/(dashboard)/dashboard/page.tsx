import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { FolderKanban, Users, CheckSquare, TrendingUp, BookOpen, Clock, ArrowRight } from "lucide-react"
import { cn, formatDate, formatCurrency, PROJECT_STATUSES } from "@/lib/utils"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id

  const today = new Date()
  const todayStart = new Date(today.setHours(0, 0, 0, 0))
  const todayEnd   = new Date(today.setHours(23, 59, 59, 999))

  const [projects, clients, tasks, todayTasks, diaries, incomes] = await Promise.all([
    prisma.project.findMany({ where: { userId } }),
    prisma.client.findMany({ where: { userId } }),
    prisma.task.findMany({ where: { userId } }),
    prisma.task.findMany({ where: { userId, deadline: { gte: todayStart, lte: todayEnd } }, take: 6, orderBy: { priority: "desc" } }),
    prisma.diary.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 5 }),
    prisma.income.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 10 }),
  ])

  const activeProjects    = projects.filter(p => p.status !== "COMPLETED").length
  const completedProjects = projects.filter(p => p.status === "COMPLETED").length
  const pendingTasks      = tasks.filter(t => t.status !== "DONE").length
  const totalIncome       = incomes.reduce((s, i) => s + i.amount, 0)

  const stats = [
    { title: "Faol Loyihalar",   value: activeProjects,           sub: `${completedProjects} tugallangan`, icon: FolderKanban, color: "text-blue-600",   bg: "bg-blue-50 dark:bg-blue-950/40",   href: "/projects" },
    { title: "Mijozlar",         value: clients.length,           sub: "Jami mijozlar",                    icon: Users,        color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/40", href: "/clients" },
    { title: "Bajarilmagan",     value: pendingTasks,             sub: "Vazifa qoldi",                    icon: CheckSquare,  color: "text-orange-600",  bg: "bg-orange-50 dark:bg-orange-950/40",  href: "/tasks" },
    { title: "Jami Daromad",     value: formatCurrency(totalIncome), sub: "Oxirgi to'lovlar",             icon: TrendingUp,   color: "text-purple-600",  bg: "bg-purple-50 dark:bg-purple-950/40",  href: "/finance", isString: true },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Xush kelibsiz, {session?.user?.name?.split(" ")[0]} 👋</h2>
        <p className="text-muted-foreground text-sm mt-0.5">
          {new Date().toLocaleDateString("uz-UZ", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Link key={s.title} href={s.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-muted-foreground">{s.title}</p>
                    <p className={cn("font-bold mt-0.5", s.isString ? "text-lg leading-tight" : "text-3xl")}>{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
                  </div>
                  <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0", s.bg)}>
                    <s.icon className={cn("h-5 w-5", s.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* 3 col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today tasks */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              Bugungi Deadline
              {todayTasks.length > 0 && <Badge variant="secondary">{todayTasks.length}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {todayTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Bugun deadline yo'q 🎉</p>
            ) : todayTasks.map(t => (
              <div key={t.id} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/50">
                <div className={cn("h-2 w-2 rounded-full flex-shrink-0",
                  t.priority === "HIGH" ? "bg-red-500" : t.priority === "MEDIUM" ? "bg-blue-500" : "bg-slate-400")} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{t.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.status === "DONE" ? "✅ Bajarildi" : t.status === "IN_PROGRESS" ? "🔄 Jarayonda" : "📋 Kutilmoqda"}
                  </p>
                </div>
              </div>
            ))}
            <Link href="/tasks" className="flex items-center gap-1 text-xs text-blue-600 hover:underline pt-1">
              Barchasi <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Active projects */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-blue-500" />
              Faol Loyihalar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {projects.filter(p => p.status !== "COMPLETED").slice(0, 5).map(p => {
              const s = PROJECT_STATUSES[p.status as keyof typeof PROJECT_STATUSES]
              const overdue = p.deadline && new Date(p.deadline) < new Date() && p.status !== "COMPLETED"
              return (
                <Link key={p.id} href={`/projects/${p.id}`}>
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      {p.deadline && (
                        <p className={cn("text-xs", overdue ? "text-red-500 font-medium" : "text-muted-foreground")}>
                          {overdue ? "⚠️ " : "📅 "}{formatDate(p.deadline)}
                        </p>
                      )}
                    </div>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium ml-2 flex-shrink-0", s?.color)}>
                      {s?.label}
                    </span>
                  </div>
                </Link>
              )
            })}
            {projects.filter(p => p.status !== "COMPLETED").length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">Faol loyiha yo'q</p>
            )}
            <Link href="/projects" className="flex items-center gap-1 text-xs text-blue-600 hover:underline pt-1">
              Barchasi <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Diary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-emerald-500" />
              Oxirgi Kundaliklar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {diaries.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Kundalik yo'q</p>
            ) : diaries.map(d => (
              <Link key={d.id} href={`/diary/${d.id}`}>
                <div className="p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                  <p className="text-sm font-medium truncate">{d.title}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(d.date)}</p>
                  {d.description && <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{d.description}</p>}
                </div>
              </Link>
            ))}
            <Link href="/diary" className="flex items-center gap-1 text-xs text-blue-600 hover:underline pt-1">
              Barchasi <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Status breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Loyihalar Holati</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {Object.entries(PROJECT_STATUSES).map(([key, val]) => {
              const count = projects.filter(p => p.status === key).length
              return (
                <Link key={key} href={`/projects?status=${key}`}>
                  <div className="text-center p-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors cursor-pointer">
                    <p className="text-2xl font-bold">{count}</p>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", val.color)}>{val.label}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
