import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ArrowRight, ChevronRight } from "lucide-react"
import { cn, formatDate, formatCurrency, PROJECT_STATUSES } from "@/lib/utils"

// Arch SVG for hero bg
function HeroArch() {
  return (
    <svg className="absolute right-0 top-0 h-full w-auto opacity-[0.08] pointer-events-none" viewBox="0 0 400 300" fill="none">
      <path d="M80 300 L80 130 Q80 40 200 40 Q320 40 320 130 L320 300" stroke="#DAA520" strokeWidth="2"/>
      <path d="M120 300 L120 140 Q120 70 200 70 Q280 70 280 140 L280 300" stroke="#DAA520" strokeWidth="1.2"/>
      <polygon points="200,32 216,42 200,52 184,42" fill="#DAA520" opacity="0.6"/>
      <polygon points="200,90 212,96 216,110 212,124 200,130 188,124 184,110 188,96" fill="none" stroke="#DAA520" strokeWidth="1.2"/>
      <circle cx="200" cy="110" r="10" fill="none" stroke="#DAA520" strokeWidth="0.8"/>
      <line x1="80" y1="300" x2="80" y2="200" stroke="#DAA520" strokeWidth="3" opacity="0.4"/>
      <line x1="320" y1="300" x2="320" y2="200" stroke="#DAA520" strokeWidth="3" opacity="0.4"/>
      <line x1="80" y1="185" x2="320" y2="185" stroke="#DAA520" strokeWidth="0.8" strokeDasharray="5 3" opacity="0.3"/>
      {[0,1,2,3,4].map(i=>(
        <line key={i} x1={100+i*45} y1="200" x2={100+i*45} y2="300" stroke="#DAA520" strokeWidth="0.4" opacity="0.2"/>
      ))}
    </svg>
  )
}

// Small 8-sided ornament
function Hex8({ size=40, opacity=0.5 }: { size?:number; opacity?:number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" style={{opacity}}>
      <polygon points="20,2 38,11 38,29 20,38 2,29 2,11" stroke="#DAA520" strokeWidth="1.2"/>
      <polygon points="20,8 32,14 32,26 20,32 8,26 8,14" stroke="#DAA520" strokeWidth="0.7"/>
      <circle cx="20" cy="20" r="6" stroke="#DAA520" strokeWidth="0.7"/>
      <circle cx="20" cy="20" r="2" fill="#DAA520"/>
    </svg>
  )
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id

  const today = new Date()
  const todayStart = new Date(today); todayStart.setHours(0,0,0,0)
  const todayEnd   = new Date(today); todayEnd.setHours(23,59,59,999)

  const [projects, clients, tasks, todayTasks, diaries, incomes] = await Promise.all([
    prisma.project.findMany({ where:{ userId } }),
    prisma.client.findMany({ where:{ userId } }),
    prisma.task.findMany({ where:{ userId } }),
    prisma.task.findMany({ where:{ userId, deadline:{ gte:todayStart, lte:todayEnd } }, take:5, orderBy:{ priority:"desc" } }),
    prisma.diary.findMany({ where:{ userId }, orderBy:{ date:"desc" }, take:4 }),
    prisma.income.findMany({ where:{ userId }, orderBy:{ date:"desc" }, take:10 }),
  ])

  const activePr = projects.filter(p=>p.status!=="COMPLETED").length
  const donePr   = projects.filter(p=>p.status==="COMPLETED").length
  const pendingT = tasks.filter(t=>t.status!=="DONE").length
  const doneT    = tasks.filter(t=>t.status==="DONE").length
  const totalInc = incomes.reduce((s,i)=>s+i.amount,0)
  const taskPct  = tasks.length ? Math.round((doneT/tasks.length)*100) : 0

  const hour = new Date().getHours()
  const greeting = hour<12 ? "Xayrli tong" : hour<17 ? "Xayrli kun" : "Xayrli kech"
  const fname = session?.user?.name?.split(" ")[0] ?? "Sarvarbek"

  const STATS = [
    { title:"Faol Loyihalar",  val:activePr,  sub:`${donePr} tugallangan`,   grad:"from-[#0A2342] to-[#1A3A6B]",   glow:"rgba(10,35,66,0.4)",  href:"/projects" },
    { title:"Mijozlar",        val:clients.length, sub:"Jami bazada",         grad:"from-[#6D28D9] to-[#4C1D95]",   glow:"rgba(109,40,217,0.4)", href:"/clients" },
    { title:"Vazifalar",       val:pendingT,  sub:`${taskPct}% bajarildi`,   grad:"from-[#B91C1C] to-[#7F1D1D]",   glow:"rgba(185,28,28,0.4)",  href:"/tasks", pct:taskPct },
    { title:"Daromad",         val:null, valStr:formatCurrency(totalInc), sub:"Oxirgi 10 ta", grad:"from-[#065F46] to-[#064E3B]", glow:"rgba(6,95,70,0.4)", href:"/finance" },
  ]

  return (
    <div className="space-y-7 page-enter">

      {/* ─── HERO ─── */}
      <div className="relative overflow-hidden rounded-3xl text-white"
        style={{background:"linear-gradient(135deg,#0A1628 0%,#0e2040 40%,#1a0800 100%)"}}>
        <HeroArch />
        {/* Floating hexes */}
        <div className="absolute top-4 left-8 animate-float pointer-events-none"><Hex8 size={32} opacity={0.15}/></div>
        <div className="absolute bottom-4 left-1/3 animate-float-slow pointer-events-none" style={{animationDelay:"1.5s"}}><Hex8 size={24} opacity={0.1}/></div>

        <div className="relative z-10 p-8">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"/>
                <span className="text-[#DAA520]/60 text-xs tracking-[0.2em] uppercase font-medium">Faol rejim</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight mb-1">{greeting}, {fname}! 👋</h2>
              <p className="text-[#DAA520]/50 text-sm">Bugungi vazifalar va loyihalarni ko'ring</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {[{href:"/reports",label:"📊 Hisobot"},{href:"/contracts",label:"📜 Shartnoma"}].map(({href,label})=>(
                <Link key={href} href={href}>
                  <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#DAA520]/10 border border-[#DAA520]/20 hover:bg-[#DAA520]/18 transition-all text-sm font-medium text-white/80 hover:text-white">
                    {label}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Gold divider */}
          <div className="mt-6 pt-5 border-t border-[#DAA520]/10 flex flex-wrap gap-4">
            {[
              { label:"Faol loyiha",    v:activePr,          emoji:"📐" },
              { label:"Bugun deadline", v:todayTasks.length, emoji:"⏰" },
              { label:"Bajarilmagan",  v:pendingT,          emoji:"📋" },
              { label:"Jami mijoz",     v:clients.length,    emoji:"👥" },
            ].map(s=>(
              <div key={s.label} className="flex items-center gap-3 bg-white/[0.05] backdrop-blur-sm rounded-xl px-4 py-3 border border-[#DAA520]/12">
                <span className="text-xl">{s.emoji}</span>
                <div>
                  <p className="text-xl font-bold leading-none">{s.v}</p>
                  <p className="text-xs text-[#DAA520]/50 mt-0.5">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── STAT CARDS ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s,i)=>(
          <Link key={s.title} href={s.href}>
            <div className={cn("stat-card bg-white dark:bg-[#100d04] border border-[#B8860B]/15 dark:border-[#DAA520]/10 p-5 animate-card")}
              style={{animationDelay:`${i*.09}s`}}>
              {/* Gold top line */}
              <div className={cn("absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r",s.grad)}/>
              {/* Corner hex */}
              <div className="absolute top-2 right-2 opacity-10"><Hex8 size={28} opacity={1}/></div>
              <div className="flex items-start justify-between mb-3">
                <div className={cn("stat-icon h-11 w-11 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg",s.grad)}
                  style={{boxShadow:`0 8px 20px ${s.glow}`}}>
                  <span className="text-xl">{["📐","👥","✅","💰"][i]}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-[#B8860B]/25 mt-1"/>
              </div>
              <p className="text-xs font-bold text-[#B8860B]/50 dark:text-amber-500/50 uppercase tracking-wider mb-1">{s.title}</p>
              <p className={cn("font-bold text-[#2a1500] dark:text-amber-100", s.valStr?"text-lg leading-tight":"text-3xl")}>
                {s.valStr ?? s.val}
              </p>
              <p className="text-xs text-[#B8860B]/40 mt-1">{s.sub}</p>
              {s.pct!==undefined && (
                <div className="mt-3 h-1.5 bg-[#B8860B]/10 rounded-full overflow-hidden">
                  <div className={cn("h-full bg-gradient-to-r rounded-full transition-all duration-1000",s.grad)} style={{width:`${s.pct}%`}}/>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* ─── 3 COLUMNS ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Today Tasks */}
        <ColCard title="Bugungi Deadline" emoji="⏰" count={todayTasks.length} href="/tasks" sub="bugungi">
          {todayTasks.length===0
            ? <EmptyState emoji="🎉" text="Bugun deadline yo'q!"/>
            : todayTasks.map(t=>(
              <div key={t.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#B8860B]/[0.04] transition-colors">
                <div className={cn("h-2 w-2 rounded-full flex-shrink-0",
                  t.priority==="HIGH"?"bg-red-500":t.priority==="MEDIUM"?"bg-blue-500":"bg-slate-300")}/>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-medium truncate text-[#2a1500] dark:text-amber-100",t.status==="DONE"&&"line-through opacity-50")}>{t.title}</p>
                  <p className="text-xs text-[#B8860B]/40">{t.status==="DONE"?"✅":t.status==="IN_PROGRESS"?"🔄":"📋"} {t.status==="DONE"?"Bajarildi":t.status==="IN_PROGRESS"?"Jarayonda":"Kutilmoqda"}</p>
                </div>
              </div>
            ))}
        </ColCard>

        {/* Active Projects */}
        <ColCard title="Faol Loyihalar" emoji="📐" count={activePr} href="/projects" sub="faol">
          {projects.filter(p=>p.status!=="COMPLETED").slice(0,5).map(p=>{
            const s=PROJECT_STATUSES[p.status as keyof typeof PROJECT_STATUSES]
            const ov=p.deadline&&new Date(p.deadline)<new Date()
            return (
              <Link key={p.id} href={`/projects/${p.id}`}>
                <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#B8860B]/[0.04] transition-colors cursor-pointer group">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#2a1500] dark:text-amber-100 truncate group-hover:text-[#B8860B] transition-colors">{p.name}</p>
                    {p.deadline&&<p className={cn("text-xs",ov?"text-red-500":"text-[#B8860B]/40")}>{ov?"⚠️ ":"📅 "}{formatDate(p.deadline)}</p>}
                  </div>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-semibold ml-2 flex-shrink-0",s?.color)}>{s?.label}</span>
                </div>
              </Link>
            )
          })}
          {!projects.filter(p=>p.status!=="COMPLETED").length&&<EmptyState emoji="📐" text="Faol loyiha yo'q"/>}
        </ColCard>

        {/* Diary */}
        <ColCard title="Kundalik" emoji="📖" count={diaries.length} href="/diary" sub="oxirgi">
          {diaries.length===0
            ? <EmptyState emoji="📖" text="Yozuv yo'q"/>
            : diaries.map(d=>(
              <Link key={d.id} href={`/diary/${d.id}`}>
                <div className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#B8860B]/[0.04] transition-colors cursor-pointer group">
                  <div className="w-10 text-center bg-emerald-50 dark:bg-emerald-950/30 rounded-xl py-1.5 flex-shrink-0">
                    <p className="text-sm font-bold text-emerald-700 leading-none">{new Date(d.date).getDate()}</p>
                    <p className="text-[9px] text-emerald-500 uppercase">{new Date(d.date).toLocaleString("uz-UZ",{month:"short"})}</p>
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-sm font-medium text-[#2a1500] dark:text-amber-100 truncate group-hover:text-[#B8860B] transition-colors">{d.title}</p>
                    {d.description&&<p className="text-xs text-[#B8860B]/40 line-clamp-1">{d.description}</p>}
                  </div>
                </div>
              </Link>
            ))}
        </ColCard>
      </div>

      {/* ─── STATUS BREAKDOWN ─── */}
      <div className="arch-card">
        <div className="px-6 py-4 border-b border-[#B8860B]/10 flex items-center gap-3">
          <Hex8 size={28} opacity={0.4}/>
          <div>
            <p className="text-sm font-bold text-[#2a1500] dark:text-amber-100">Loyihalar Holati</p>
            <p className="text-xs text-[#B8860B]/40">Statistika</p>
          </div>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {Object.entries(PROJECT_STATUSES).map(([key,val])=>{
              const cnt=projects.filter(p=>p.status===key).length
              const pct=projects.length?Math.round((cnt/projects.length)*100):0
              return (
                <Link key={key} href={`/projects?status=${key}`}>
                  <div className="group text-center p-4 rounded-2xl bg-[#B8860B]/[0.04] hover:bg-[#B8860B]/[0.08] border border-transparent hover:border-[#B8860B]/20 transition-all cursor-pointer">
                    <p className="text-3xl font-bold text-[#2a1500] dark:text-amber-100 group-hover:text-[#B8860B] transition-colors">{cnt}</p>
                    <span className={cn("inline-block text-xs px-2 py-0.5 rounded-full font-semibold mt-1 mb-2",val.color)}>{val.label}</span>
                    <div className="h-1 bg-[#B8860B]/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#B8860B] to-[#0A2342] rounded-full transition-all duration-700" style={{width:`${pct}%`}}/>
                    </div>
                    <p className="text-[10px] text-[#B8860B]/30 mt-1">{pct}%</p>
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

function ColCard({ title,emoji,count,href,sub,children }: { title:string;emoji:string;count:number;href:string;sub:string;children:React.ReactNode }) {
  return (
    <div className="arch-card">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#B8860B]/10">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-[#B8860B]/8 border border-[#B8860B]/15 flex items-center justify-center text-base">{emoji}</div>
          <div>
            <p className="text-sm font-bold text-[#2a1500] dark:text-amber-100">{title}</p>
            <p className="text-xs text-[#B8860B]/40">{count} ta {sub}</p>
          </div>
        </div>
        <Link href={href}>
          <span className="text-xs text-[#B8860B] hover:text-[#966B08] font-medium flex items-center gap-1">
            Barchasi <ChevronRight className="h-3 w-3"/>
          </span>
        </Link>
      </div>
      <div className="p-4 space-y-1">{children}</div>
    </div>
  )
}
function EmptyState({ emoji,text }: { emoji:string;text:string }) {
  return (
    <div className="text-center py-8 text-[#B8860B]/30">
      <div className="text-3xl mb-2">{emoji}</div>
      <p className="text-sm font-medium">{text}</p>
    </div>
  )
}
