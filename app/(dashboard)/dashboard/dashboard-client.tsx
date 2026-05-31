"use client"
import Link from "next/link"
import { ArrowRight, ChevronRight } from "lucide-react"
import { cn, formatDate, formatCurrency, PROJECT_STATUSES } from "@/lib/utils"

interface Project { id:string; name:string; status:string; deadline?:string|null }
interface Client  { id:string; name:string }
interface Task    { id:string; title:string; status:string; priority:string; deadline?:string|null }
interface Diary   { id:string; title:string; date:string; description?:string|null }

interface Props {
  userName:    string
  projects:    Project[]
  clients:     Client[]
  tasks:       Task[]
  todayTasks:  Task[]
  diaries:     Diary[]
  totalIncome: number
}

/* ─── Architectural wireframe building (hero) ─── */
function HeroBuilding() {
  return (
    <svg viewBox="0 0 400 280" fill="none" className="w-full h-full opacity-30">
      {/* Grid */}
      {Array.from({length:20},(_,i)=>(
        <line key={`v${i}`} x1={i*20} y1="0" x2={i*20} y2="280"
          stroke="rgba(255,255,255,0.04)" strokeWidth="0.5"/>
      ))}
      {Array.from({length:14},(_,i)=>(
        <line key={`h${i}`} x1="0" y1={i*20} x2="400" y2={i*20}
          stroke="rgba(255,255,255,0.04)" strokeWidth="0.5"/>
      ))}

      {/* Main building */}
      <rect x="80" y="20" width="240" height="220" stroke="#333" strokeWidth="1.2" fill="none"/>
      {/* Floors */}
      {[60,100,140,180].map(y => (
        <line key={y} x1="80" y1={y} x2="320" y2={y} stroke="#1e1e1e" strokeWidth="0.8"/>
      ))}
      {/* Windows */}
      {[1,2,3,4].map(row =>
        [0,1,2,3,4].map(col => {
          const x = 93 + col * 46
          const y = 28 + (row-1) * 40
          return <rect key={`w${row}${col}`} x={x} y={y} width={28} height={22}
            stroke="#2a2a2a" strokeWidth="0.8" fill="rgba(255,255,255,0.015)"/>
        })
      )}
      {/* Entrance arch */}
      <path d="M175 240 L175 218 Q200 202 225 218 L225 240" stroke="#2a2a2a" strokeWidth="0.8" fill="none"/>

      {/* Left tower */}
      <rect x="40" y="60" width="38" height="180" stroke="#222" strokeWidth="0.8" fill="none"/>
      {[80,110,140,170].map(y => (
        <rect key={y} x="49" y={y} width="20" height="16" stroke="#1e1e1e" strokeWidth="0.7" fill="none"/>
      ))}

      {/* Right tower */}
      <rect x="322" y="60" width="38" height="180" stroke="#222" strokeWidth="0.8" fill="none"/>
      {[80,110,140,170].map(y => (
        <rect key={y} x="331" y={y} width="20" height="16" stroke="#1e1e1e" strokeWidth="0.7" fill="none"/>
      ))}

      {/* Foundation */}
      <rect x="35" y="240" width="330" height="8" stroke="#222" strokeWidth="0.7" fill="none"/>
      <line x1="30" y1="248" x2="370" y2="248" stroke="#333" strokeWidth="0.8"/>

      {/* Dimension lines */}
      <line x1="25" y1="20" x2="25" y2="240" stroke="#1a1a1a" strokeWidth="0.6"/>
      <line x1="22" y1="20"  x2="28" y2="20"  stroke="#1a1a1a" strokeWidth="0.6"/>
      <line x1="22" y1="240" x2="28" y2="240" stroke="#1a1a1a" strokeWidth="0.6"/>
      <text x="18" y="135" textAnchor="middle" transform="rotate(-90 18 135)"
        style={{fontSize:7, fill:"#333", fontFamily:"monospace"}}>18.0m</text>

      {/* Width dimension */}
      <line x1="80" y1="265" x2="320" y2="265" stroke="#1a1a1a" strokeWidth="0.6"/>
      <line x1="80" y1="262" x2="80" y2="268" stroke="#1a1a1a" strokeWidth="0.6"/>
      <line x1="320" y1="262" x2="320" y2="268" stroke="#1a1a1a" strokeWidth="0.6"/>
      <text x="200" y="274" textAnchor="middle"
        style={{fontSize:7, fill:"#333", fontFamily:"monospace"}}>24.0m</text>

      {/* Section mark */}
      <circle cx="95" cy="26" r="5" stroke="#2a2a2a" strokeWidth="0.7" fill="none"/>
      <line x1="91.5" y1="26" x2="98.5" y2="26" stroke="#2a2a2a" strokeWidth="0.7"/>
      <text x="95" y="28.5" textAnchor="middle"
        style={{fontSize:5, fill:"#333", fontFamily:"monospace"}}>S1</text>
    </svg>
  )
}

/* ─── Small floor plan icon ─── */
function FloorPlanIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="1" y="1" width="18" height="18" stroke="#333" strokeWidth="0.8"/>
      <line x1="1" y1="8"  x2="19" y2="8"  stroke="#222" strokeWidth="0.7"/>
      <line x1="1" y1="13" x2="19" y2="13" stroke="#222" strokeWidth="0.7"/>
      <line x1="8" y1="1"  x2="8"  y2="19" stroke="#222" strokeWidth="0.7"/>
    </svg>
  )
}

export function DashboardClient({ userName, projects, clients, tasks, todayTasks, diaries, totalIncome }: Props) {
  const activePr = projects.filter(p => p.status !== "COMPLETED").length
  const donePr   = projects.filter(p => p.status === "COMPLETED").length
  const pendingT = tasks.filter(t => t.status !== "DONE").length
  const doneT    = tasks.filter(t => t.status === "DONE").length
  const taskPct  = tasks.length ? Math.round((doneT / tasks.length) * 100) : 0
  const hour     = new Date().getHours()
  const greeting = hour < 12 ? "Xayrli tong" : hour < 17 ? "Xayrli kun" : "Xayrli kech"

  const STATS = [
    { label:"Faol Loyihalar", val:activePr,       sub:`${donePr} tugallangan`, href:"/projects", pct:null    },
    { label:"Mijozlar",       val:clients.length,  sub:"Jami bazada",           href:"/clients",  pct:null    },
    { label:"Vazifalar",      val:pendingT,        sub:`${taskPct}% bajarildi`, href:"/tasks",    pct:taskPct },
    { label:"Daromad",        val:null, valStr:formatCurrency(totalIncome), sub:"Jami", href:"/finance", pct:null },
  ]

  return (
    <div className="space-y-6 animate-page">

      {/* ═══ HERO ═══ */}
      <div
        className="relative overflow-hidden rounded"
        style={{
          background: "#0d0d0d",
          border: "1px solid #1e1e1e",
          minHeight: 280,
          display: "flex",
        }}
      >
        {/* Fine grid */}
        <div className="absolute inset-0 bg-fine-grid" />

        {/* Left: text */}
        <div className="relative z-10 flex flex-col justify-center px-10 py-8" style={{flex:"0 0 52%"}}>
          {/* Label */}
          <div className="flex items-center gap-2 mb-5">
            <FloorPlanIcon />
            <span style={{fontSize:9, color:"#444", letterSpacing:"0.2em", fontWeight:600, textTransform:"uppercase"}}>
              Arxitektor Kundaligi
            </span>
          </div>

          <h1
            className="font-black leading-none mb-2"
            style={{fontSize:"clamp(1.6rem,3vw,2.6rem)", letterSpacing:"-0.04em", color:"#f0f0f0"}}
          >
            {greeting},<br/>{userName.split(" ")[0]}
          </h1>
          <p style={{fontSize:13, color:"#444", marginBottom:24, lineHeight:1.5}}>
            Loyihalar, kundalik va moliya —<br/>bir professional platformada
          </p>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-2 mb-5">
            {[
              {label:"Faol loyiha", val:activePr},
              {label:"Bugun deadline", val:todayTasks.length},
              {label:"Jami mijoz", val:clients.length},
            ].map(s => (
              <div key={s.label} className="px-3 py-2 rounded"
                style={{background:"#141414", border:"1px solid #222"}}>
                <p className="font-black text-lg leading-none"
                  style={{color:"#f0f0f0", fontFamily:"Inter"}}>{s.val}</p>
                <p style={{fontSize:9, color:"#444", marginTop:2}}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Links */}
          <div className="flex gap-2">
            {[{href:"/reports",label:"Hisobot"},{href:"/contracts",label:"Shartnoma"}].map(({href,label}) => (
              <Link key={href} href={href}>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium"
                  style={{background:"#141414", border:"1px solid #222", color:"#888"}}>
                  {label} <ArrowRight className="h-3 w-3"/>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right: building wireframe */}
        <div className="relative flex-1 flex items-center justify-center p-6">
          <HeroBuilding />
        </div>
      </div>

      {/* ═══ STAT CARDS ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STATS.map((s, i) => (
          <Link key={s.label} href={s.href}>
            <div className="stat-card p-5 animate-card" style={{animationDelay:`${i*0.08}s`}}>
              <p style={{fontSize:9, color:"#444", letterSpacing:"0.14em", textTransform:"uppercase", fontWeight:600, marginBottom:8}}>
                {s.label}
              </p>
              <p className="font-black leading-none mb-1"
                style={{fontSize:s.valStr?"1.15rem":"2rem", color:"#f0f0f0"}}>
                {s.valStr ?? s.val}
              </p>
              <p style={{fontSize:10, color:"#333"}}>{s.sub}</p>
              {s.pct !== null && (
                <div className="mt-3" style={{height:1, background:"#1a1a1a", borderRadius:999}}>
                  <div style={{height:1, width:`${s.pct}%`, background:"#fff", borderRadius:999, transition:"width 1s"}}/>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* ═══ 3 COLUMNS ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Today tasks */}
        <ColCard title="Bugungi Deadline" count={todayTasks.length} href="/tasks">
          {todayTasks.length === 0 ? (
            <Empty text="Bugun deadline yo'q" />
          ) : todayTasks.map(t => (
            <div key={t.id}
              className="hover-row flex items-center gap-3 px-4 py-2.5"
              style={{borderBottom:"1px solid #111"}}>
              <div
                className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                style={{
                  background: t.priority==="HIGH" ? "#ccc" : t.priority==="MEDIUM" ? "#666" : "#333",
                }}
              />
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium truncate", t.status==="DONE" && "opacity-30 line-through")}
                  style={{color:"#ccc"}}>{t.title}</p>
                <p style={{fontSize:10, color:"#444"}}>
                  {t.status==="DONE"?"Bajarildi":t.status==="IN_PROGRESS"?"Jarayonda":"Kutilmoqda"}
                </p>
              </div>
            </div>
          ))}
        </ColCard>

        {/* Active projects */}
        <ColCard title="Faol Loyihalar" count={activePr} href="/projects">
          {projects.filter(p=>p.status!=="COMPLETED").slice(0,5).map(p => {
            const s = PROJECT_STATUSES[p.status as keyof typeof PROJECT_STATUSES]
            const ov = p.deadline && new Date(p.deadline) < new Date()
            return (
              <Link key={p.id} href={`/projects/${p.id}`}>
                <div className="hover-row flex items-center justify-between px-4 py-2.5"
                  style={{borderBottom:"1px solid #111"}}>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate" style={{color:"#ccc"}}>{p.name}</p>
                    {p.deadline && (
                      <p style={{fontSize:10, color: ov ? "#777" : "#444"}}>
                        {formatDate(p.deadline)}
                      </p>
                    )}
                  </div>
                  <span className={cn("text-[10px] px-2 py-0.5 rounded font-medium ml-2 flex-shrink-0", s?.color)}>
                    {s?.label}
                  </span>
                </div>
              </Link>
            )
          })}
          {!projects.filter(p=>p.status!=="COMPLETED").length && <Empty text="Faol loyiha yo'q" />}
        </ColCard>

        {/* Diary */}
        <ColCard title="Kundalik" count={diaries.length} href="/diary">
          {diaries.length === 0 ? (
            <Empty text="Yozuv yo'q" />
          ) : diaries.map(d => (
            <Link key={d.id} href={`/diary/${d.id}`}>
              <div className="hover-row flex items-start gap-3 px-4 py-2.5"
                style={{borderBottom:"1px solid #111"}}>
                <div className="flex-shrink-0 text-center"
                  style={{width:32, paddingTop:2}}>
                  <p className="font-black leading-none" style={{fontSize:14, color:"#888"}}>
                    {new Date(d.date).getDate()}
                  </p>
                  <p style={{fontSize:8, color:"#333", textTransform:"uppercase"}}>
                    {new Date(d.date).toLocaleString("uz-UZ",{month:"short"})}
                  </p>
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-sm font-medium truncate" style={{color:"#ccc"}}>{d.title}</p>
                  {d.description && (
                    <p className="line-clamp-1" style={{fontSize:10, color:"#444"}}>{d.description}</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </ColCard>
      </div>

      {/* ═══ STATUS BREAKDOWN ═══ */}
      <div className="arch-card">
        <div className="px-5 py-4 flex items-center gap-3"
          style={{borderBottom:"1px solid #1a1a1a"}}>
          <span style={{fontSize:9, color:"#444", letterSpacing:"0.14em", textTransform:"uppercase", fontWeight:600}}>
            Loyihalar holati
          </span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {Object.entries(PROJECT_STATUSES).map(([key, val]) => {
              const count = projects.filter(p => p.status === key).length
              const pct   = projects.length ? Math.round((count/projects.length)*100) : 0
              return (
                <Link key={key} href={`/projects?status=${key}`}>
                  <div
                    className="status-cell text-center p-3 rounded"
                    style={{background:"#0d0d0d", border:"1px solid #1a1a1a"}}
                  >
                    <p className="font-black leading-none mb-1"
                      style={{fontSize:"1.4rem", color:"#f0f0f0"}}>{count}</p>
                    <span className={cn("inline-block text-[10px] px-2 py-0.5 rounded font-semibold", val.color)}>
                      {val.label}
                    </span>
                    <div className="mt-2" style={{height:1, background:"#1a1a1a", borderRadius:999}}>
                      <div style={{height:1, width:`${pct}%`, background:"#555", borderRadius:999}}/>
                    </div>
                    <p style={{fontSize:8, color:"#333", marginTop:3}}>{pct}%</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* CSS hover styles — no event handlers */}
      <style jsx global>{`
        .hover-row:hover { background: rgba(255,255,255,0.02) !important; }
        .status-cell { transition: all .25s; }
        .status-cell:hover {
          border-color: #333 !important;
          background: #111 !important;
          transform: translateY(-3px);
        }
      `}</style>
    </div>
  )
}

function ColCard({ title, count, href, children }: {
  title:string; count:number; href:string; children:React.ReactNode
}) {
  return (
    <div className="arch-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3"
        style={{borderBottom:"1px solid #1a1a1a"}}>
        <div>
          <p className="text-sm font-bold" style={{color:"#f0f0f0"}}>{title}</p>
          <p style={{fontSize:10, color:"#444"}}>{count} ta</p>
        </div>
        <Link href={href}>
          <span className="flex items-center gap-1 text-xs font-medium"
            style={{color:"#555"}}>
            Barchasi <ChevronRight className="h-3 w-3"/>
          </span>
        </Link>
      </div>
      <div>{children}</div>
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center py-8">
      <p style={{fontSize:12, color:"#333"}}>{text}</p>
    </div>
  )
}
