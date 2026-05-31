import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import {
  FolderKanban, Users, CheckSquare, TrendingUp,
  ArrowRight, BookOpen, Clock, Zap, Target,
  Building2, Calendar, BarChart3, ChevronRight
} from "lucide-react"
import { cn, formatDate, formatCurrency, PROJECT_STATUSES } from "@/lib/utils"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const userId  = (session?.user as any)?.id

  const today      = new Date()
  const todayStart = new Date(today); todayStart.setHours(0, 0, 0, 0)
  const todayEnd   = new Date(today); todayEnd.setHours(23, 59, 59, 999)

  const [projects, clients, tasks, todayTasks, diaries, incomes] = await Promise.all([
    prisma.project.findMany({ where: { userId } }),
    prisma.client.findMany({ where: { userId } }),
    prisma.task.findMany({ where: { userId } }),
    prisma.task.findMany({
      where: { userId, deadline: { gte: todayStart, lte: todayEnd } },
      take: 5, orderBy: { priority: "desc" }
    }),
    prisma.diary.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 4 }),
    prisma.income.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 10 }),
  ])

  const activeProjects    = projects.filter(p => p.status !== "COMPLETED").length
  const completedProjects = projects.filter(p => p.status === "COMPLETED").length
  const pendingTasks      = tasks.filter(t => t.status !== "DONE").length
  const doneTasks         = tasks.filter(t => t.status === "DONE").length
  const totalIncome       = incomes.reduce((s, i) => s + i.amount, 0)
  const taskProgress      = tasks.length ? Math.round((doneTasks / tasks.length) * 100) : 0

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Xayrli tong" : hour < 17 ? "Xayrli kun" : "Xayrli kech"
  const firstName = session?.user?.name?.split(" ")[0] ?? "Arxitektor"

  return (
    <div className="space-y-8 page-enter arch-bg-pattern">

      {/* ── Hero greeting ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-violet-700 p-8 text-white">
        {/* Decorative shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
          <svg viewBox="0 0 200 200" className="w-full h-full animate-rotate-slow">
            <polygon points="100,10 190,55 190,145 100,190 10,145 10,55" fill="none" stroke="white" strokeWidth="1.5"/>
            <polygon points="100,30 170,65 170,135 100,170 30,135 30,65" fill="none" stroke="white" strokeWidth="1"/>
            <polygon points="100,50 150,75 150,125 100,150 50,125 50,75" fill="none" stroke="white" strokeWidth="0.5"/>
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 w-48 h-48 opacity-5">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="1"/>
            <circle cx="50" cy="50" r="25" fill="none" stroke="white" strokeWidth="1"/>
            <circle cx="50" cy="50" r="10" fill="none" stroke="white" strokeWidth="1"/>
          </svg>
        </div>
        <div className="absolute top-4 right-4 w-32 h-32 opacity-8">
          <svg viewBox="0 0 100 100" className="w-full h-full animate-float-slow">
            <rect x="10" y="10" width="80" height="80" fill="none" stroke="white" strokeWidth="1" strokeDasharray="4 2"/>
            <rect x="25" y="25" width="50" height="50" fill="none" stroke="white" strokeWidth="0.5"/>
            <line x1="50" y1="10" x2="50" y2="90" stroke="white" strokeWidth="0.5" opacity="0.5"/>
            <line x1="10" y1="50" x2="90" y2="50" stroke="white" strokeWidth="0.5" opacity="0.5"/>
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-blue-200 text-sm font-medium">Online</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-1">
            {greeting}, {firstName}! 👋
          </h2>
          <p className="text-blue-200 text-sm">
            {new Date().toLocaleDateString("uz-UZ", {
              weekday: "long", year: "numeric", month: "long", day: "numeric"
            })}
          </p>

          {/* Quick stats row */}
          <div className="flex flex-wrap gap-4 mt-6">
            {[
              { label: "Faol loyihalar", value: activeProjects, icon: "📐" },
              { label: "Bugungi deadline", value: todayTasks.length, icon: "⏰" },
              { label: "Bajarilmagan", value: pendingTasks, icon: "📋" },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/20">
                <span className="text-xl">{s.icon}</span>
                <div>
                  <p className="text-xl font-bold leading-none">{s.value}</p>
                  <p className="text-xs text-blue-200">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Faol Loyihalar",
            value: activeProjects,
            sub: `${completedProjects} ta tugallangan`,
            icon: FolderKanban,
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-50 dark:bg-blue-950/40",
            border: "border-blue-100 dark:border-blue-900/40",
            gradient: "from-blue-500 to-blue-600",
            href: "/projects",
          },
          {
            title: "Mijozlar",
            value: clients.length,
            sub: "Jami bazada",
            icon: Users,
            color: "text-violet-600 dark:text-violet-400",
            bg: "bg-violet-50 dark:bg-violet-950/40",
            border: "border-violet-100 dark:border-violet-900/40",
            gradient: "from-violet-500 to-violet-600",
            href: "/clients",
          },
          {
            title: "Vazifalar",
            value: pendingTasks,
            sub: `${taskProgress}% bajarildi`,
            icon: CheckSquare,
            color: "text-orange-600 dark:text-orange-400",
            bg: "bg-orange-50 dark:bg-orange-950/40",
            border: "border-orange-100 dark:border-orange-900/40",
            gradient: "from-orange-500 to-orange-600",
            href: "/tasks",
            progress: taskProgress,
          },
          {
            title: "Daromad",
            value: null,
            valueStr: formatCurrency(totalIncome),
            sub: "Oxirgi to'lovlar",
            icon: TrendingUp,
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-50 dark:bg-emerald-950/40",
            border: "border-emerald-100 dark:border-emerald-900/40",
            gradient: "from-emerald-500 to-emerald-600",
            href: "/finance",
          },
        ].map((card, i) => (
          <Link key={card.title} href={card.href}>
            <div
              className={cn(
                "stat-card relative rounded-2xl border p-5 cursor-pointer overflow-hidden",
                card.border
              )}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {/* Top gradient line */}
              <div className={cn("absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r", card.gradient)} />

              <div className="flex items-start justify-between mb-3">
                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", card.bg)}>
                  <card.icon className={cn("h-5 w-5", card.color)} />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 transition-colors mt-1" />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{card.title}</p>
                <p className={cn(
                  "font-bold text-slate-800 dark:text-white",
                  card.valueStr ? "text-lg leading-tight" : "text-3xl"
                )}>
                  {card.valueStr ?? card.value}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{card.sub}</p>
              </div>

              {/* Progress bar for tasks */}
              {card.progress !== undefined && (
                <div className="mt-3">
                  <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full bg-gradient-to-r rounded-full transition-all duration-1000", card.gradient)}
                      style={{ width: `${card.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Today's tasks ── */}
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center">
                <Clock className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-white">Bugungi Deadline</p>
                <p className="text-xs text-slate-400">{todayTasks.length} ta vazifa</p>
              </div>
            </div>
            <Link href="/tasks">
              <span className="text-xs text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1">
                Barchasi <ChevronRight className="h-3 w-3" />
              </span>
            </Link>
          </div>
          <div className="p-4 space-y-2">
            {todayTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <div className="h-12 w-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-3">
                  <Zap className="h-5 w-5 text-slate-300" />
                </div>
                <p className="text-sm font-medium">Bugun deadline yo'q</p>
                <p className="text-xs mt-0.5">Yaxshi kun! 🎉</p>
              </div>
            ) : todayTasks.map(task => (
              <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                <div className={cn(
                  "h-2 w-2 rounded-full flex-shrink-0",
                  task.priority === "HIGH"   ? "bg-red-500" :
                  task.priority === "MEDIUM" ? "bg-blue-500" : "bg-slate-300"
                )} />
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-medium truncate",
                    task.status === "DONE" ? "line-through text-slate-400" : "text-slate-700 dark:text-slate-200"
                  )}>
                    {task.title}
                  </p>
                  <p className="text-xs text-slate-400">
                    {task.status === "DONE" ? "✅ Bajarildi" :
                     task.status === "IN_PROGRESS" ? "🔄 Jarayonda" : "📋 Kutilmoqda"}
                  </p>
                </div>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0",
                  task.priority === "HIGH" ? "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400" :
                  task.priority === "MEDIUM" ? "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400" :
                  "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                )}>
                  {task.priority === "HIGH" ? "Yuqori" : task.priority === "MEDIUM" ? "O'rta" : "Past"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Active projects ── */}
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                <Building2 className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-white">Faol Loyihalar</p>
                <p className="text-xs text-slate-400">{activeProjects} ta loyiha</p>
              </div>
            </div>
            <Link href="/projects">
              <span className="text-xs text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1">
                Barchasi <ChevronRight className="h-3 w-3" />
              </span>
            </Link>
          </div>
          <div className="p-4 space-y-2">
            {projects.filter(p => p.status !== "COMPLETED").slice(0, 5).map(project => {
              const s = PROJECT_STATUSES[project.status as keyof typeof PROJECT_STATUSES]
              const overdue = project.deadline && new Date(project.deadline) < new Date()
              return (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={cn("h-2 w-2 rounded-full flex-shrink-0", s?.color.includes("blue") ? "bg-blue-500" : s?.color.includes("green") ? "bg-green-500" : s?.color.includes("yellow") ? "bg-yellow-500" : s?.color.includes("orange") ? "bg-orange-500" : s?.color.includes("purple") ? "bg-purple-500" : "bg-slate-400")} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate group-hover:text-blue-600 transition-colors">
                          {project.name}
                        </p>
                        {project.deadline && (
                          <p className={cn("text-xs", overdue ? "text-red-500" : "text-slate-400")}>
                            {overdue ? "⚠️" : "📅"} {formatDate(project.deadline)}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium ml-2 flex-shrink-0", s?.color)}>
                      {s?.label}
                    </span>
                  </div>
                </Link>
              )
            })}
            {projects.filter(p => p.status !== "COMPLETED").length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <FolderKanban className="h-8 w-8 mb-2 opacity-30" />
                <p className="text-sm">Faol loyiha yo'q</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Recent diary ── */}
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-white">Oxirgi Kundaliklar</p>
                <p className="text-xs text-slate-400">{diaries.length} ta yozuv</p>
              </div>
            </div>
            <Link href="/diary">
              <span className="text-xs text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1">
                Barchasi <ChevronRight className="h-3 w-3" />
              </span>
            </Link>
          </div>
          <div className="p-4 space-y-2">
            {diaries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <BookOpen className="h-8 w-8 mb-2 opacity-30" />
                <p className="text-sm">Kundalik yozuvi yo'q</p>
              </div>
            ) : diaries.map(diary => (
              <Link key={diary.id} href={`/diary/${diary.id}`}>
                <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                  <div className="flex-shrink-0 w-10 text-center bg-emerald-50 dark:bg-emerald-950/40 rounded-xl py-1.5">
                    <p className="text-base font-bold text-emerald-700 dark:text-emerald-400 leading-none">
                      {new Date(diary.date).getDate()}
                    </p>
                    <p className="text-[9px] text-emerald-500 font-medium uppercase">
                      {new Date(diary.date).toLocaleString("uz-UZ", { month: "short" })}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate group-hover:text-emerald-600 transition-colors">
                      {diary.title}
                    </p>
                    {diary.description && (
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{diary.description}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Project status breakdown ── */}
      <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
              <Target className="h-4 w-4 text-slate-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-white">Loyihalar Holati</p>
              <p className="text-xs text-slate-400">Barcha loyihalar bo'yicha statistika</p>
            </div>
          </div>
          <Link href="/projects">
            <span className="text-xs text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1">
              Ko'rish <ChevronRight className="h-3 w-3" />
            </span>
          </Link>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {Object.entries(PROJECT_STATUSES).map(([key, val]) => {
              const count = projects.filter(p => p.status === key).length
              const pct   = projects.length ? Math.round((count / projects.length) * 100) : 0
              return (
                <Link key={key} href={`/projects?status=${key}`}>
                  <div className="group text-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all duration-200 cursor-pointer border border-transparent hover:border-blue-100 dark:hover:border-blue-900/40">
                    <p className="text-3xl font-bold text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors">
                      {count}
                    </p>
                    <span className={cn("inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-1 mb-1", val.color)}>
                      {val.label}
                    </span>
                    <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{pct}%</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
