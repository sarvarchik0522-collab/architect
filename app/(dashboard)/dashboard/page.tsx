import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { FolderKanban, Users, CheckSquare, TrendingUp, ArrowRight, BookOpen, Clock, ChevronRight, BarChart3, FileSignature } from "lucide-react"
import { cn, formatDate, formatCurrency, PROJECT_STATUSES } from "@/lib/utils"

// Milliy geometrik SVG ornament
function GirihBg() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <svg className="absolute right-0 top-0 opacity-[0.07] animate-rotate-slow" width="400" height="400" viewBox="0 0 200 200">
        <polygon points="100,10 190,55 190,145 100,190 10,145 10,55" fill="none" stroke="currentColor" strokeWidth="1"/>
        <polygon points="100,25 175,62 175,138 100,175 25,138 25,62" fill="none" stroke="currentColor" strokeWidth="0.7"/>
        <polygon points="100,40 160,70 160,130 100,160 40,130 40,70" fill="none" stroke="currentColor" strokeWidth="0.5"/>
        <circle cx="100" cy="100" r="35" fill="none" stroke="currentColor" strokeWidth="0.5"/>
        <line x1="100" y1="10" x2="100" y2="190" stroke="currentColor" strokeWidth="0.3"/>
        <line x1="10" y1="100" x2="190" y2="100" stroke="currentColor" strokeWidth="0.3"/>
        <line x1="10" y1="55" x2="190" y2="145" stroke="currentColor" strokeWidth="0.3"/>
        <line x1="190" y1="55" x2="10" y2="145" stroke="currentColor" strokeWidth="0.3"/>
      </svg>
      <svg className="absolute left-4 bottom-4 opacity-[0.05] animate-counter" width="200" height="200" viewBox="0 0 100 100">
        <polygon points="50,5 95,27 95,73 50,95 5,73 5,27" fill="none" stroke="currentColor" strokeWidth="1"/>
        <polygon points="50,15 85,32 85,68 50,85 15,68 15,32" fill="none" stroke="currentColor" strokeWidth="0.6"/>
        <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="0.6"/>
      </svg>
    </div>
  )
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const userId  = (session?.user as any)?.id

  const today      = new Date()
  const todayStart = new Date(today); todayStart.setHours(0,0,0,0)
  const todayEnd   = new Date(today); todayEnd.setHours(23,59,59,999)

  const [projects, clients, tasks, todayTasks, diaries, incomes] = await Promise.all([
    prisma.project.findMany({ where: { userId } }),
    prisma.client.findMany({ where: { userId } }),
    prisma.task.findMany({ where: { userId } }),
    prisma.task.findMany({ where: { userId, deadline: { gte: todayStart, lte: todayEnd } }, take: 5, orderBy: { priority: "desc" } }),
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

  const STATS = [
    { title: "Faol Loyihalar",  value: activeProjects,  sub: `${completedProjects} tugallangan`,
      icon: FolderKanban, grad: "from-blue-700 to-blue-900",   bg: "bg-blue-50 dark:bg-blue-950/30",   text: "text-blue-600", href: "/projects" },
    { title: "Mijozlar",        value: clients.length,  sub: "Jami bazada",
      icon: Users,        grad: "from-violet-700 to-violet-900", bg: "bg-violet-50 dark:bg-violet-950/30", text: "text-violet-600", href: "/clients" },
    { title: "Vazifalar",       value: pendingTasks,    sub: `${taskProgress}% bajarildi`,
      icon: CheckSquare,  grad: "from-rose-600 to-rose-800",   bg: "bg-rose-50 dark:bg-rose-950/30",   text: "text-rose-600", href: "/tasks", progress: taskProgress },
    { title: "Daromad",         value: null, valueStr: formatCurrency(totalIncome), sub: "Oxirgi 10 ta",
      icon: TrendingUp,   grad: "from-emerald-600 to-emerald-800", bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-600", href: "/finance" },
  ]

  return (
    <div className="space-y-8 page-enter">
      {/* ── Hero banner ── */}
      <div className={cn(
        "relative overflow-hidden rounded-3xl p-8 text-white",
        "bg-gradient-to-br from-[#8a5a00] via-[#6b3f00] to-[#1a3a6b]"
      )}>
        <GirihBg />

        <div className="relative z-10 flex flex-col sm:flex-row items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-amber-200/70 text-xs font-medium tracking-wider uppercase">Faol</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-1">
              {greeting}, {firstName}! 👋
            </h2>
            <p className="text-amber-200/70 text-sm capitalize">
              {today.toLocaleDateString("uz-UZ", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}
            </p>
          </div>
          {/* Quick links */}
          <div className="flex gap-2 flex-wrap">
            {[
              { href: "/reports",   label: "Hisobot", icon: BarChart3 },
              { href: "/contracts", label: "Shartnoma", icon: FileSignature },
            ].map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}>
                <div className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-4 py-2.5 transition-all cursor-pointer">
                  <Icon className="h-4 w-4 text-amber-200" />
                  <span className="text-sm font-medium text-white">{label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom quick stats */}
        <div className="relative z-10 flex flex-wrap gap-4 mt-6 pt-6 border-t border-white/10">
          {[
            { label: "Faol loyiha",    value: activeProjects,     emoji: "📐" },
            { label: "Bugun deadline", value: todayTasks.length,  emoji: "⏰" },
            { label: "Bajarilmagan",   value: pendingTasks,       emoji: "📋" },
            { label: "Jami mijoz",     value: clients.length,     emoji: "👥" },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/15">
              <span className="text-2xl">{s.emoji}</span>
              <div>
                <p className="text-xl font-bold leading-none">{s.value}</p>
                <p className="text-xs text-amber-200/70 mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {STATS.map((s, i) => (
          <Link key={s.title} href={s.href}>
            <div className={cn("stat-card bg-white dark:bg-[#120e04] border border-[#e8d8b0] dark:border-[#2a1e08] p-5 animate-card")}
              style={{ animationDelay: `${i * 0.1}s` }}>
              {/* Gold top line */}
              <div className={cn("absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r", s.grad)} />
              {/* Corner ornament */}
              <div className="absolute top-2 right-2 opacity-10">
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <polygon points="12,2 22,7 22,17 12,22 2,17 2,7" fill="none" stroke="currentColor" strokeWidth="1"/>
                  <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="0.7"/>
                </svg>
              </div>

              <div className="flex items-start justify-between mb-3">
                <div className={cn("stat-icon h-11 w-11 rounded-2xl flex items-center justify-center shadow-md bg-gradient-to-br", s.grad)}>
                  <s.icon className="h-5 w-5 text-white" />
                </div>
                <ArrowRight className="h-4 w-4 text-amber-300/40 mt-1" />
              </div>

              <p className="text-xs font-semibold text-amber-800/60 dark:text-amber-400/60 mb-1">{s.title}</p>
              <p className={cn("font-bold text-[#3d2800] dark:text-amber-100", s.valueStr ? "text-lg leading-tight" : "text-3xl")}>
                {s.valueStr ?? s.value}
              </p>
              <p className="text-xs text-amber-700/50 dark:text-amber-500/50 mt-1">{s.sub}</p>

              {s.progress !== undefined && (
                <div className="mt-3 h-1.5 bg-amber-100 dark:bg-amber-950/50 rounded-full overflow-hidden">
                  <div className={cn("h-full bg-gradient-to-r rounded-full transition-all duration-1000", s.grad)}
                    style={{ width: `${s.progress}%` }} />
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* ── 3 columns ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today tasks */}
        <div className="card-gold">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8d8b0]/60 dark:border-[#2a1e08]/60">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center text-base">⏰</div>
              <div>
                <p className="text-sm font-bold text-[#3d2800] dark:text-amber-100">Bugungi Deadline</p>
                <p className="text-xs text-amber-700/50">{todayTasks.length} ta vazifa</p>
              </div>
            </div>
            <Link href="/tasks"><span className="text-xs text-amber-600 hover:text-amber-800 font-medium flex items-center gap-1">Barchasi <ChevronRight className="h-3 w-3"/></span></Link>
          </div>
          <div className="p-4 space-y-2">
            {todayTasks.length === 0 ? (
              <div className="text-center py-8 text-amber-400/50">
                <div className="text-3xl mb-2">🎉</div>
                <p className="text-sm font-medium">Bugun deadline yo'q!</p>
              </div>
            ) : todayTasks.map(t => (
              <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-amber-50/60 dark:hover:bg-amber-950/20 transition-colors group">
                <div className={cn("h-2 w-2 rounded-full flex-shrink-0",
                  t.priority==="HIGH" ? "bg-red-500" : t.priority==="MEDIUM" ? "bg-blue-500" : "bg-slate-300")} />
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-medium truncate text-[#3d2800] dark:text-amber-100", t.status==="DONE" && "line-through opacity-50")}>{t.title}</p>
                  <p className="text-xs text-amber-600/50">{t.status==="DONE"?"✅ Bajarildi":t.status==="IN_PROGRESS"?"🔄 Jarayonda":"📋 Kutilmoqda"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active projects */}
        <div className="card-gold">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8d8b0]/60 dark:border-[#2a1e08]/60">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-base">📐</div>
              <div>
                <p className="text-sm font-bold text-[#3d2800] dark:text-amber-100">Faol Loyihalar</p>
                <p className="text-xs text-amber-700/50">{activeProjects} ta loyiha</p>
              </div>
            </div>
            <Link href="/projects"><span className="text-xs text-amber-600 hover:text-amber-800 font-medium flex items-center gap-1">Barchasi <ChevronRight className="h-3 w-3"/></span></Link>
          </div>
          <div className="p-4 space-y-2">
            {projects.filter(p => p.status !== "COMPLETED").slice(0, 5).map(p => {
              const s = PROJECT_STATUSES[p.status as keyof typeof PROJECT_STATUSES]
              const overdue = p.deadline && new Date(p.deadline) < new Date()
              return (
                <Link key={p.id} href={`/projects/${p.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-amber-50/60 dark:hover:bg-amber-950/20 transition-colors cursor-pointer group">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#3d2800] dark:text-amber-100 truncate group-hover:text-amber-700 transition-colors">{p.name}</p>
                      {p.deadline && <p className={cn("text-xs", overdue ? "text-red-500" : "text-amber-600/50")}>
                        {overdue ? "⚠️" : "📅"} {formatDate(p.deadline)}
                      </p>}
                    </div>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-semibold ml-2 flex-shrink-0", s?.color)}>{s?.label}</span>
                  </div>
                </Link>
              )
            })}
            {!projects.filter(p => p.status !== "COMPLETED").length && (
              <p className="text-center text-amber-400/50 py-6 text-sm">Faol loyiha yo'q</p>
            )}
          </div>
        </div>

        {/* Diary */}
        <div className="card-gold">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8d8b0]/60 dark:border-[#2a1e08]/60">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-base">📖</div>
              <div>
                <p className="text-sm font-bold text-[#3d2800] dark:text-amber-100">Oxirgi Kundalik</p>
                <p className="text-xs text-amber-700/50">{diaries.length} ta yozuv</p>
              </div>
            </div>
            <Link href="/diary"><span className="text-xs text-amber-600 hover:text-amber-800 font-medium flex items-center gap-1">Barchasi <ChevronRight className="h-3 w-3"/></span></Link>
          </div>
          <div className="p-4 space-y-2">
            {diaries.map(d => (
              <Link key={d.id} href={`/diary/${d.id}`}>
                <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-amber-50/60 dark:hover:bg-amber-950/20 transition-colors cursor-pointer group">
                  <div className="flex-shrink-0 w-11 text-center bg-emerald-100/70 dark:bg-emerald-950/40 rounded-xl py-1.5">
                    <p className="text-base font-bold text-emerald-700 dark:text-emerald-400 leading-none">{new Date(d.date).getDate()}</p>
                    <p className="text-[9px] text-emerald-600/70 uppercase font-semibold">
                      {new Date(d.date).toLocaleString("uz-UZ",{month:"short"})}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-sm font-medium text-[#3d2800] dark:text-amber-100 truncate group-hover:text-amber-700 transition-colors">{d.title}</p>
                    {d.description && <p className="text-xs text-amber-600/50 line-clamp-1">{d.description}</p>}
                  </div>
                </div>
              </Link>
            ))}
            {!diaries.length && <p className="text-center text-amber-400/50 py-6 text-sm">Yozuv yo'q</p>}
          </div>
        </div>
      </div>

      {/* ── Project status breakdown ── */}
      <div className="card-gold">
        <div className="px-6 py-4 border-b border-[#e8d8b0]/60 dark:border-[#2a1e08]/60">
          <div className="flex items-center gap-3">
            <span className="text-xl">📊</span>
            <div>
              <p className="text-sm font-bold text-[#3d2800] dark:text-amber-100">Loyihalar Holati</p>
              <p className="text-xs text-amber-700/50">Barcha loyihalar statistikasi</p>
            </div>
          </div>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {Object.entries(PROJECT_STATUSES).map(([key, val]) => {
              const count = projects.filter(p => p.status === key).length
              const pct   = projects.length ? Math.round((count / projects.length) * 100) : 0
              return (
                <Link key={key} href={`/projects?status=${key}`}>
                  <div className="group text-center p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 hover:bg-amber-100/60 dark:hover:bg-amber-950/40 border border-transparent hover:border-amber-200 dark:hover:border-amber-800/40 transition-all cursor-pointer">
                    <p className="text-3xl font-bold text-[#3d2800] dark:text-amber-100 group-hover:text-amber-700 transition-colors">{count}</p>
                    <span className={cn("inline-block text-xs px-2 py-0.5 rounded-full font-semibold mt-1 mb-1", val.color)}>{val.label}</span>
                    <div className="h-1 bg-amber-200/40 dark:bg-amber-900/30 rounded-full mt-1.5 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-500 to-blue-600 rounded-full transition-all duration-700" style={{ width:`${pct}%` }} />
                    </div>
                    <p className="text-[10px] text-amber-500/60 mt-1">{pct}%</p>
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
