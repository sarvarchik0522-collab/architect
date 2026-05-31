import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ArrowRight, ChevronRight } from "lucide-react"
import { cn, formatDate, formatCurrency, PROJECT_STATUSES } from "@/lib/utils"
import { Scene3D } from "@/components/scene3d"

/* ── Uzbek arch divider ── */
function ArchDivider() {
  return (
    <svg viewBox="0 0 400 24" className="w-full" fill="none">
      <path d="M0 12 L140 12 Q150 2 160 2 Q170 2 180 12 Q190 22 200 22 Q210 22 220 12 Q230 2 240 2 Q250 2 260 12 L400 12"
        stroke="url(#dg)" strokeWidth="1" opacity="0.4"/>
      <defs>
        <linearGradient id="dg" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="transparent"/>
          <stop offset="30%" stopColor="#C9933A"/>
          <stop offset="50%" stopColor="#2E8B82"/>
          <stop offset="70%" stopColor="#C9933A"/>
          <stop offset="100%" stopColor="transparent"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

/* ── Small 8-pointed star ── */
function Star8({ size = 16, color = "#C9933A", opacity = 0.6 }: { size?: number; color?: string; opacity?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ opacity }}>
      <polygon points="8,1 10,6 15,6 11,9.5 12.5,15 8,12 3.5,15 5,9.5 1,6 6,6"
        fill={color} />
    </svg>
  )
}

/* ── Floating SVG hex ornament (client-free, server safe) ── */
function FloatHex({ style }: { style?: React.CSSProperties }) {
  return (
    <div className="absolute pointer-events-none" style={style}>
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <polygon points="24,2 46,13 46,35 24,46 2,35 2,13"
          stroke="#C9933A" strokeWidth="1.2" opacity="0.25"/>
        <polygon points="24,9 39,17 39,31 24,39 9,31 9,17"
          stroke="#2E8B82" strokeWidth="0.8" opacity="0.18"/>
        <circle cx="24" cy="24" r="8" stroke="#C9933A" strokeWidth="0.7" opacity="0.2"/>
      </svg>
    </div>
  )
}

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
      take: 5, orderBy: { priority: "desc" },
    }),
    prisma.diary.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 4 }),
    prisma.income.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 10 }),
  ])

  const activePr   = projects.filter(p => p.status !== "COMPLETED").length
  const donePr     = projects.filter(p => p.status === "COMPLETED").length
  const pendingT   = tasks.filter(t => t.status !== "DONE").length
  const doneT      = tasks.filter(t => t.status === "DONE").length
  const totalInc   = incomes.reduce((s, i) => s + i.amount, 0)
  const taskPct    = tasks.length ? Math.round((doneT / tasks.length) * 100) : 0

  const hour     = new Date().getHours()
  const greeting = hour < 12 ? "Xayrli tong" : hour < 17 ? "Xayrli kun" : "Xayrli kech"
  const fname    = session?.user?.name?.split(" ")[0] ?? "Sarvarbek"

  const STATS = [
    {
      title: "Faol Loyihalar", val: activePr, sub: `${donePr} tugallangan`,
      color: "#3B82F6", glow: "rgba(59,130,246,0.3)", emoji: "📐",
      href: "/projects", pct: null,
    },
    {
      title: "Mijozlar", val: clients.length, sub: "Jami bazada",
      color: "#8B5CF6", glow: "rgba(139,92,246,0.3)", emoji: "👥",
      href: "/clients", pct: null,
    },
    {
      title: "Vazifalar", val: pendingT, sub: `${taskPct}% bajarildi`,
      color: "#F43F5E", glow: "rgba(244,63,94,0.3)", emoji: "✅",
      href: "/tasks", pct: taskPct,
    },
    {
      title: "Daromad", val: null, valStr: formatCurrency(totalInc), sub: "Oxirgi 10 ta",
      color: "#22C55E", glow: "rgba(34,197,94,0.3)", emoji: "💰",
      href: "/finance", pct: null,
    },
  ]

  return (
    <div className="space-y-8 animate-page-enter">

      {/* ══════════════════════════════════════
          HERO — 3D canvas + greeting
      ══════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl min-h-[360px] flex"
        style={{
          background: "linear-gradient(135deg, #0D1A30 0%, #1A2744 50%, #0A1020 100%)",
          border: "1px solid rgba(201,147,58,0.18)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,147,58,0.08)",
        }}>

        {/* Girih pattern bg */}
        <div className="absolute inset-0 bg-girih opacity-100 pointer-events-none" />

        {/* Ambient glows */}
        <div className="absolute top-0 left-1/3 w-96 h-48 pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(201,147,58,0.12), transparent 70%)", filter: "blur(30px)" }} />
        <div className="absolute bottom-0 right-1/4 w-80 h-40 pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(46,139,130,0.1), transparent 70%)", filter: "blur(25px)" }} />

        {/* Top gold shimmer line */}
        <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent, #C9933A, #2E8B82, #C9933A, transparent)" }} />

        {/* Floating hexes */}
        <FloatHex style={{ top: "8%",  right: "38%", opacity: 0.6, animation: "float-3d 6s ease-in-out infinite" }} />
        <FloatHex style={{ bottom: "12%", right: "32%", opacity: 0.4, animation: "float-3d 8s ease-in-out infinite 1s" }} />

        {/* ── Left: text ── */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-10 py-8 max-w-[55%]">

          {/* Live badge */}
          <div className="flex items-center gap-2 mb-6">
            <div className="dot-gold" />
            <span className="text-[#C9933A]/60 text-xs tracking-[0.3em] uppercase font-medium">
              Faol rejim
            </span>
          </div>

          {/* Greeting */}
          <h1 className="text-5xl xl:text-6xl font-black text-[#F5ECD7] leading-tight mb-3"
            style={{ fontFamily: "'Playfair Display', serif", letterSpacing: "-0.03em" }}>
            {greeting},<br />
            <span className="animate-shimmer-gold">{fname}</span>!
          </h1>

          <p className="text-[#A89070] text-base mb-8 leading-relaxed"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem" }}>
            Loyihalaringiz, kundaligingiz va moliyaviy hisobotlaringiz<br />
            bir joyda — professional arxitektor uchun
          </p>

          {/* Quick stat pills */}
          <div className="flex flex-wrap gap-3">
            {[
              { emoji: "📐", label: "Faol loyiha", val: activePr },
              { emoji: "⏰", label: "Bugun deadline", val: todayTasks.length },
              { emoji: "👥", label: "Mijoz", val: clients.length },
            ].map(s => (
              <div key={s.label}
                className="flex items-center gap-2 px-4 py-2 rounded-xl"
                style={{
                  background: "rgba(201,147,58,0.08)",
                  border: "1px solid rgba(201,147,58,0.18)",
                }}>
                <span className="text-lg">{s.emoji}</span>
                <div>
                  <p className="text-xl font-black text-[#F5ECD7] leading-none">{s.val}</p>
                  <p className="text-[10px] text-[#A89070]">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick links */}
          <div className="flex gap-3 mt-6">
            {[
              { href: "/reports",   label: "📊 Hisobot" },
              { href: "/contracts", label: "📜 Shartnoma" },
            ].map(({ href, label }) => (
              <Link key={href} href={href}>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                  text-[#C9933A] hover:text-[#F5D08A] transition-colors cursor-pointer"
                  style={{
                    background: "rgba(201,147,58,0.06)",
                    border: "1px solid rgba(201,147,58,0.15)",
                  }}>
                  {label} <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Right: Three.js 3D scene ── */}
        <div className="relative flex-1 min-h-[360px]" style={{ minWidth: "40%" }}>
          <Scene3D className="absolute inset-0 w-full h-full" />
        </div>
      </div>

      {/* Arch divider */}
      <ArchDivider />

      {/* ══════════════════════════════════════
          STAT CARDS
      ══════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s, i) => (
          <Link key={s.title} href={s.href}>
            <div className="stat-luxury p-5 animate-slide-up"
              style={{ animationDelay: `${i * 0.1}s` }}>

              {/* Top accent */}
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${s.color}, transparent)` }} />

              {/* Corner 8-star */}
              <div className="absolute top-3 right-3 opacity-20">
                <Star8 size={18} color={s.color} />
              </div>

              {/* Icon */}
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-2xl flex items-center justify-center text-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${s.color}22, ${s.color}11)`,
                    border: `1px solid ${s.color}30`,
                    boxShadow: `0 8px 24px ${s.glow}`,
                  }}>
                  {s.emoji}
                </div>
                <ArrowRight className="h-4 w-4 mt-1 opacity-25" style={{ color: s.color }} />
              </div>

              {/* Value */}
              <p className="text-xs font-bold uppercase tracking-[0.15em] mb-1"
                style={{ color: `${s.color}80` }}>
                {s.title}
              </p>
              <p className="font-black text-[#F5ECD7]"
                style={{
                  fontSize: s.valStr ? "1.2rem" : "2.2rem",
                  fontFamily: "'Playfair Display', serif",
                  lineHeight: 1.1,
                }}>
                {s.valStr ?? s.val}
              </p>
              <p className="text-[11px] mt-1" style={{ color: "#A89070" }}>{s.sub}</p>

              {/* Progress */}
              {s.pct !== null && (
                <div className="mt-3 h-1.5 rounded-full overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${s.pct}%`,
                      background: `linear-gradient(90deg, ${s.color}, ${s.color}aa)`,
                      boxShadow: `0 0 8px ${s.glow}`,
                    }} />
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* ══════════════════════════════════════
          3 COLUMNS
      ══════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Today tasks ── */}
        <ColCard title="Bugungi Deadline" emoji="⏰" count={todayTasks.length} href="/tasks">
          {todayTasks.length === 0 ? (
            <EmptyCol emoji="🎉" text="Bugun deadline yo'q!" />
          ) : todayTasks.map(t => (
            <div key={t.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group"
              style={{ borderBottom: "1px solid rgba(201,147,58,0.06)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(201,147,58,0.05)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              <div className="h-2 w-2 rounded-full flex-shrink-0"
                style={{
                  background: t.priority === "HIGH" ? "#F43F5E" : t.priority === "MEDIUM" ? "#3B82F6" : "#64748B",
                  boxShadow: t.priority === "HIGH" ? "0 0 6px rgba(244,63,94,0.6)" : "none",
                }} />
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium truncate text-[#F5ECD7]",
                  t.status === "DONE" && "line-through opacity-40")}>{t.title}</p>
                <p className="text-[10px] text-[#A89070]">
                  {t.status === "DONE" ? "✅ Bajarildi" : t.status === "IN_PROGRESS" ? "🔄 Jarayonda" : "📋 Kutilmoqda"}
                </p>
              </div>
            </div>
          ))}
        </ColCard>

        {/* ── Active projects ── */}
        <ColCard title="Faol Loyihalar" emoji="📐" count={activePr} href="/projects">
          {projects.filter(p => p.status !== "COMPLETED").slice(0, 5).map(p => {
            const s      = PROJECT_STATUSES[p.status as keyof typeof PROJECT_STATUSES]
            const overdue = p.deadline && new Date(p.deadline) < new Date()
            return (
              <Link key={p.id} href={`/projects/${p.id}`}>
                <div className="flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer group transition-colors"
                  style={{ borderBottom: "1px solid rgba(201,147,58,0.06)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(201,147,58,0.05)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#F5ECD7] truncate group-hover:text-[#C9933A] transition-colors">{p.name}</p>
                    {p.deadline && (
                      <p className={cn("text-[10px]", overdue ? "text-[#F43F5E]" : "text-[#A89070]")}>
                        {overdue ? "⚠️ " : "📅 "}{formatDate(p.deadline)}
                      </p>
                    )}
                  </div>
                  <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold ml-2 flex-shrink-0", s?.color)}>
                    {s?.label}
                  </span>
                </div>
              </Link>
            )
          })}
          {!projects.filter(p => p.status !== "COMPLETED").length && (
            <EmptyCol emoji="📐" text="Faol loyiha yo'q" />
          )}
        </ColCard>

        {/* ── Recent diary ── */}
        <ColCard title="Oxirgi Kundalik" emoji="📖" count={diaries.length} href="/diary">
          {diaries.length === 0 ? (
            <EmptyCol emoji="📖" text="Kundalik yozuvi yo'q" />
          ) : diaries.map(d => (
            <Link key={d.id} href={`/diary/${d.id}`}>
              <div className="flex items-start gap-3 px-3 py-2.5 rounded-xl cursor-pointer group transition-colors"
                style={{ borderBottom: "1px solid rgba(201,147,58,0.06)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(46,139,130,0.05)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <div className="flex-shrink-0 w-10 h-10 rounded-xl flex flex-col items-center justify-center"
                  style={{ background: "rgba(46,139,130,0.15)", border: "1px solid rgba(46,139,130,0.25)" }}>
                  <p className="text-sm font-black text-[#2E8B82] leading-none">{new Date(d.date).getDate()}</p>
                  <p className="text-[8px] text-[#2E8B82]/70 uppercase">
                    {new Date(d.date).toLocaleString("uz-UZ", { month: "short" })}
                  </p>
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-sm font-medium text-[#F5ECD7] truncate group-hover:text-[#2E8B82] transition-colors">{d.title}</p>
                  {d.description && <p className="text-[10px] text-[#A89070] line-clamp-1">{d.description}</p>}
                </div>
              </div>
            </Link>
          ))}
        </ColCard>
      </div>

      {/* Arch divider */}
      <ArchDivider />

      {/* ══════════════════════════════════════
          STATUS BREAKDOWN
      ══════════════════════════════════════ */}
      <div className="card-luxury">
        <div className="px-6 py-5 flex items-center gap-4"
          style={{ borderBottom: "1px solid rgba(201,147,58,0.1)" }}>
          <Star8 size={20} />
          <div>
            <h3 className="text-base font-black text-[#F5ECD7]"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              Loyihalar Holati
            </h3>
            <p className="text-[11px] text-[#A89070]">
              {projects.length} ta loyiha bo'yicha statistika
            </p>
          </div>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {Object.entries(PROJECT_STATUSES).map(([key, val]) => {
              const count = projects.filter(p => p.status === key).length
              const pct   = projects.length ? Math.round((count / projects.length) * 100) : 0
              return (
                <Link key={key} href={`/projects?status=${key}`}>
                  <div className="group text-center p-4 rounded-2xl cursor-pointer transition-all"
                    style={{
                      background: "rgba(201,147,58,0.04)",
                      border: "1px solid rgba(201,147,58,0.08)",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = "rgba(201,147,58,0.1)"
                      e.currentTarget.style.borderColor = "rgba(201,147,58,0.25)"
                      e.currentTarget.style.transform = "translateY(-4px)"
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "rgba(201,147,58,0.04)"
                      e.currentTarget.style.borderColor = "rgba(201,147,58,0.08)"
                      e.currentTarget.style.transform = ""
                    }}>
                    <p className="text-3xl font-black text-[#F5ECD7] leading-none mb-2"
                      style={{ fontFamily: "'Playfair Display', serif" }}>
                      {count}
                    </p>
                    <span className={cn("inline-block text-[10px] px-2 py-0.5 rounded-full font-bold", val.color)}>
                      {val.label}
                    </span>
                    <div className="mt-2 h-1 rounded-full overflow-hidden"
                      style={{ background: "rgba(255,255,255,0.06)" }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          background: "linear-gradient(90deg, #C9933A, #2E8B82)",
                        }} />
                    </div>
                    <p className="text-[9px] text-[#A89070]/60 mt-1">{pct}%</p>
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

/* ── Reusable column card ── */
function ColCard({ title, emoji, count, href, children }: {
  title: string; emoji: string; count: number; href: string; children: React.ReactNode
}) {
  return (
    <div className="card-luxury overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid rgba(201,147,58,0.1)" }}>
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl flex items-center justify-center text-base"
            style={{
              background: "rgba(201,147,58,0.1)",
              border: "1px solid rgba(201,147,58,0.2)",
            }}>
            {emoji}
          </div>
          <div>
            <p className="text-sm font-black text-[#F5ECD7]"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              {title}
            </p>
            <p className="text-[10px] text-[#A89070]">{count} ta</p>
          </div>
        </div>
        <Link href={href}>
          <span className="text-[11px] text-[#C9933A] hover:text-[#F5D08A] transition-colors flex items-center gap-1 font-medium">
            Barchasi <ChevronRight className="h-3 w-3" />
          </span>
        </Link>
      </div>
      <div className="py-2">{children}</div>
    </div>
  )
}

function EmptyCol({ emoji, text }: { emoji: string; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-[#A89070]/40">
      <span className="text-3xl mb-2 opacity-50">{emoji}</span>
      <p className="text-xs font-medium">{text}</p>
    </div>
  )
}
