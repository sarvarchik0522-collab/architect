"use client"
import { useRef, useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, ChevronRight } from "lucide-react"
import { cn, formatDate, formatCurrency, PROJECT_STATUSES } from "@/lib/utils"
import { Scene3D } from "@/components/scene3d"

interface Project { id:string; name:string; status:string; deadline?:string|null }
interface Client  { id:string; name:string }
interface Task    { id:string; title:string; status:string; priority:string; deadline?:string|null }
interface Diary   { id:string; title:string; date:string; description?:string|null }

/* ─── 3D tilt card hook ─── */
function useTilt(ref: React.RefObject<HTMLDivElement>) {
  useEffect(() => {
    const el = ref.current; if (!el) return
    const onMove = (e: MouseEvent) => {
      const r  = el.getBoundingClientRect()
      const dx = (e.clientX - r.left  - r.width  / 2) / (r.width  / 2)
      const dy = (e.clientY - r.top   - r.height / 2) / (r.height / 2)
      el.style.transform = `perspective(900px) rotateX(${-dy*8}deg) rotateY(${dx*8}deg) translateY(-5px)`
      el.style.setProperty("--mx", `${(dx+1)/2*100}%`)
      el.style.setProperty("--my", `${(dy+1)/2*100}%`)
    }
    const onLeave = () => { el.style.transform = "" }
    el.addEventListener("mousemove", onMove as any)
    el.addEventListener("mouseleave", onLeave)
    return () => {
      el.removeEventListener("mousemove", onMove as any)
      el.removeEventListener("mouseleave", onLeave)
    }
  }, [ref])
}

/* ─── Frieze SVG divider ─── */
function Frieze({ className="" }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 16" className={cn("w-full", className)} fill="none">
      <line x1="0" y1="1" x2="600" y2="1" stroke="rgba(200,168,112,.2)" strokeWidth=".5"/>
      {Array.from({length:30},(_,i)=>{
        const x=i*20+2
        return (
          <g key={i}>
            <rect x={x}   y={3}  width={4} height={6} fill="rgba(200,168,112,.07)"/>
            <line x1={x+1.5} y1={3} x2={x+1.5} y2={9} stroke="rgba(200,168,112,.18)" strokeWidth=".5"/>
            <line x1={x+3}   y1={3} x2={x+3}   y2={9} stroke="rgba(200,168,112,.18)" strokeWidth=".5"/>
          </g>
        )
      })}
      <line x1="0" y1="15" x2="600" y2="15" stroke="rgba(200,168,112,.15)" strokeWidth=".5"/>
    </svg>
  )
}

/* ─── Column silhouette (right side of hero) ─── */
function ColumnSilhouette() {
  return (
    <div className="absolute right-0 top-0 bottom-0 flex items-end pointer-events-none overflow-hidden"
      style={{ width: "38%", opacity: .08 }}>
      <svg viewBox="0 0 280 420" fill="none" className="w-full h-full">
        {[50,130,210].map((cx,i)=>(
          <g key={i}>
            <rect x={cx-2} y={4}  width={44} height={5}  fill="var(--ink)"/>
            <path d={`M${cx+2} 9 Q${cx+22} 14 ${cx+42} 9 L${cx+42} 16 L${cx+2} 16 Z`}
              fill="var(--ink)" opacity=".4"/>
            <rect x={cx+6} y={16} width={32} height={295}
              stroke="var(--ink)" strokeWidth="2" fill="none"/>
            {[8,13,18,23,28,33].map(dx=>(
              <line key={dx} x1={cx+dx} y1={16} x2={cx+dx*.9+1} y2={311}
                stroke="var(--ink)" strokeWidth=".5" opacity=".4"/>
            ))}
            <rect x={cx+4} y={311} width={36} height={5}  fill="var(--ink)" opacity=".8"/>
            <rect x={cx}   y={316} width={44} height={4}  fill="var(--ink)" opacity=".7"/>
            <rect x={cx-2} y={320} width={48} height={6}  fill="var(--ink)"/>
          </g>
        ))}
      </svg>
    </div>
  )
}

/* ─── Individual tilt stat card ─── */
function StatCard({ s, i }: {
  s: { label:string; val:string|number; sub:string; href:string; pct?:number|null }
  i: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  useTilt(ref)
  return (
    <Link href={s.href}>
      <div ref={ref} className="stat-card-3d anim-cardIn cursor-pointer"
        style={{ animationDelay: `${i * .09}s`, padding: 20 }}>
        <p style={{ fontSize:8, color:"var(--stone2)", letterSpacing:".14em",
          textTransform:"uppercase", fontWeight:700, marginBottom:10 }}>
          {s.label}
        </p>
        <p className="font-black leading-none mb-1.5"
          style={{ fontSize: typeof s.val==="number" && s.val>99 ? "1.4rem":"2.2rem",
            fontFamily:"'Playfair Display',serif", color:"var(--ink)" }}>
          {s.val}
        </p>
        <p style={{ fontSize:10, color:"var(--stone2)" }}>{s.sub}</p>
        {s.pct != null && (
          <div className="mt-3" style={{ height:2, background:"var(--cream3)", borderRadius:99 }}>
            <div className="progress-bar"
              style={{ width:`${s.pct}%`, height:2, borderRadius:99 }}/>
          </div>
        )}
        <div className="mt-3 flex items-center gap-1">
          <div style={{ flex:1, height:1,
            background:"linear-gradient(90deg,rgba(200,168,112,.2),transparent)" }}/>
          <ArrowRight style={{ width:12, height:12, color:"var(--stone)" }}/>
        </div>
      </div>
    </Link>
  )
}

/* ─── Col card with 3D ─── */
function ColCard({ title,count,href,children }: {
  title:string; count:number; href:string; children:React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  useTilt(ref)
  return (
    <div ref={ref} className="card-3d-tilt overflow-hidden" style={{ cursor:"default" }}>
      <div className="flex items-center justify-between px-4 py-3 layer-back"
        style={{ borderBottom:"1px solid rgba(200,168,112,.1)", background:"var(--cream)" }}>
        <div>
          <p className="text-sm font-black"
            style={{ fontFamily:"'Playfair Display',serif", color:"var(--ink)" }}>{title}</p>
          <p style={{ fontSize:10, color:"var(--stone2)" }}>{count} ta</p>
        </div>
        <Link href={href}>
          <span className="flex items-center gap-1 text-xs font-medium layer-mid"
            style={{ color:"var(--stone2)" }}>
            Barchasi<ChevronRight style={{ width:12, height:12 }}/>
          </span>
        </Link>
      </div>
      <div className="layer-back">{children}</div>
    </div>
  )
}

export function DashboardClient({
  userName, projects, clients, tasks, todayTasks, diaries, totalIncome
}: {
  userName:string; projects:Project[]; clients:Client[]; tasks:Task[];
  todayTasks:Task[]; diaries:Diary[]; totalIncome:number;
}) {
  const activePr = projects.filter(p=>p.status!=="COMPLETED").length
  const donePr   = projects.filter(p=>p.status==="COMPLETED").length
  const pendingT = tasks.filter(t=>t.status!=="DONE").length
  const doneT    = tasks.filter(t=>t.status==="DONE").length
  const taskPct  = tasks.length ? Math.round((doneT/tasks.length)*100) : 0
  const hour     = new Date().getHours()
  const greeting = hour<12?"Xayrli tong":hour<17?"Xayrli kun":"Xayrli kech"
  const fname    = userName.split(" ")[0]

  const STATS = [
    { label:"Faol Loyihalar", val:activePr,       sub:`${donePr} tugallangan`, href:"/projects"        },
    { label:"Mijozlar",       val:clients.length,  sub:"Jami bazada",           href:"/clients"         },
    { label:"Vazifalar",      val:pendingT,        sub:`${taskPct}% bajarildi`, href:"/tasks",pct:taskPct },
    { label:"Daromad",        val:formatCurrency(totalIncome), sub:"Jami",      href:"/finance"         },
  ]

  const rowStyle = { borderBottom:"1px solid rgba(200,168,112,.07)" }
  const hoverClass = "hover:bg-[var(--cream)] transition-colors"

  return (
    <div className="space-y-7 anim-page">

      {/* ══════════ HERO BANNER ══════════ */}
      <div
        className="relative overflow-hidden rounded-sm"
        style={{
          background: "var(--ink2)",
          border: "1px solid rgba(200,168,112,.12)",
          boxShadow: "var(--shadow-3d)",
          minHeight: 320,
        }}
      >
        {/* Gold cornice */}
        <div style={{ height:2, background:
          "linear-gradient(90deg,transparent,var(--gold),var(--gold2),var(--gold),transparent)" }}/>

        {/* Frieze band */}
        <div className="frieze-band px-8 py-1.5"
          style={{ background:"rgba(200,168,112,.04)", borderColor:"rgba(200,168,112,.12)" }}>
          <span style={{ fontSize:8, color:"var(--stone)", letterSpacing:".22em",
            fontWeight:600, textTransform:"uppercase" }}>
            ARXITEKTOR KUNDALIGI · PROFESSIONAL PLATFORM
          </span>
        </div>

        {/* Column silhouettes */}
        <ColumnSilhouette />

        {/* Three.js canvas */}
        <div className="absolute right-0 top-0 bottom-0"
          style={{ width:"42%", opacity: .7 }}>
          <Scene3D variant="dashboard" className="canvas-hero" />
        </div>

        {/* Text */}
        <div className="relative z-10 px-10 py-10" style={{ maxWidth:"58%" }}>
          {/* Stagger reveal */}
          <div className="flex items-center gap-2 mb-5 anim-fadeLeft d1">
            <div style={{ width:20, height:1, background:"var(--gold)", opacity:.6 }}/>
            <span style={{ fontSize:9, color:"var(--stone)", letterSpacing:".22em",
              fontWeight:600, textTransform:"uppercase" }}>
              Faol rejim
            </span>
          </div>

          <h1 className="font-black leading-none anim-fadeUp d2"
            style={{
              fontFamily:"'Playfair Display',serif",
              fontSize:"clamp(1.8rem,3.5vw,3rem)",
              letterSpacing:"-.03em",
              color:"var(--cream)",
            }}>
            {greeting},<br/>
            <span className="text-shimmer-gold">{fname}</span>!
          </h1>

          <p className="mt-3 anim-fadeUp d3"
            style={{ fontSize:14, color:"var(--stone2)",
              fontFamily:"'Cormorant Garamond',serif", lineHeight:1.6 }}>
            Loyihalaringiz, kundaligingiz va moliyaviy<br/>
            hisobotlaringiz bir joyda
          </p>

          {/* Quick pills */}
          <div className="flex flex-wrap gap-3 mt-6 anim-fadeUp d4">
            {[
              { label:"Faol loyiha",     val:activePr          },
              { label:"Bugun deadline",  val:todayTasks.length  },
              { label:"Jami mijoz",      val:clients.length     },
            ].map(s=>(
              <div key={s.label} className="glass-gold px-4 py-2.5 rounded-sm">
                <p className="font-black leading-none"
                  style={{ fontSize:"1.3rem", color:"var(--cream)",
                    fontFamily:"'Playfair Display',serif" }}>{s.val}</p>
                <p style={{ fontSize:9, color:"var(--stone)", marginTop:2 }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Quick links */}
          <div className="flex gap-2 mt-5 anim-fadeUp d5">
            {[
              { href:"/reports",   label:"📊 Hisobot"   },
              { href:"/contracts", label:"📜 Shartnoma" },
            ].map(({href,label})=>(
              <Link key={href} href={href}>
                <div className="glass-dark flex items-center gap-1.5 px-3 py-2 rounded-sm
                  text-xs font-medium transition-all hover:scale-105"
                  style={{ color:"var(--stone2)" }}>
                  {label}<ArrowRight style={{width:12,height:12}}/>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom frieze */}
        <div className="absolute bottom-0 left-0 right-0">
          <Frieze />
        </div>
      </div>

      {/* ══════════ STAT CARDS ══════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s, i) => <StatCard key={s.label} s={s} i={i} />)}
      </div>

      {/* ══════════ 3 COLUMNS ══════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Today tasks */}
        <ColCard title="Bugungi Deadline" count={todayTasks.length} href="/tasks">
          {todayTasks.length===0 ? (
            <div className="flex items-center justify-center py-10">
              <p style={{ fontSize:12, color:"var(--stone)" }}>Bugun deadline yo'q 🎉</p>
            </div>
          ) : todayTasks.map(t=>(
            <div key={t.id} className={cn("flex items-center gap-3 px-4 py-2.5",hoverClass)}
              style={rowStyle}>
              <div className="h-2 w-2 rounded-full flex-shrink-0" style={{
                background: t.priority==="HIGH"?"var(--ink)":t.priority==="MEDIUM"?"var(--stone2)":"var(--stone)",
                boxShadow: t.priority==="HIGH"?"0 0 6px rgba(26,24,20,.3)":"none",
              }}/>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium truncate",
                  t.status==="DONE"&&"line-through opacity-40")}
                  style={{ color:"var(--ink)" }}>{t.title}</p>
                <p style={{ fontSize:10, color:"var(--stone2)" }}>
                  {t.status==="DONE"?"✅ Bajarildi":t.status==="IN_PROGRESS"?"🔄 Jarayonda":"📋 Kutilmoqda"}
                </p>
              </div>
            </div>
          ))}
        </ColCard>

        {/* Active projects */}
        <ColCard title="Faol Loyihalar" count={projects.filter(p=>p.status!=="COMPLETED").length} href="/projects">
          {projects.filter(p=>p.status!=="COMPLETED").slice(0,5).map(p=>{
            const s=PROJECT_STATUSES[p.status as keyof typeof PROJECT_STATUSES]
            const ov=p.deadline&&new Date(p.deadline)<new Date()
            return (
              <Link key={p.id} href={`/projects/${p.id}`}>
                <div className={cn("flex items-center justify-between px-4 py-2.5",hoverClass)}
                  style={rowStyle}>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate" style={{ color:"var(--ink)" }}>
                      {p.name}
                    </p>
                    {p.deadline&&(
                      <p style={{ fontSize:10, color:ov?"var(--stone2)":"var(--stone)" }}>
                        {formatDate(p.deadline)}
                      </p>
                    )}
                  </div>
                  <span className={cn("text-[10px] px-2 py-0.5 rounded-sm font-semibold ml-2 flex-shrink-0", s?.color)}>
                    {s?.label}
                  </span>
                </div>
              </Link>
            )
          })}
          {!projects.filter(p=>p.status!=="COMPLETED").length&&(
            <div className="flex items-center justify-center py-10">
              <p style={{ fontSize:12, color:"var(--stone)" }}>Faol loyiha yo'q</p>
            </div>
          )}
        </ColCard>

        {/* Diary */}
        <ColCard title="Kundalik" count={diaries.length} href="/diary">
          {diaries.length===0 ? (
            <div className="flex items-center justify-center py-10">
              <p style={{ fontSize:12, color:"var(--stone)" }}>Yozuv yo'q</p>
            </div>
          ) : diaries.map(d=>(
            <Link key={d.id} href={`/diary/${d.id}`}>
              <div className={cn("flex items-start gap-3 px-4 py-2.5",hoverClass)} style={rowStyle}>
                <div className="flex-shrink-0 w-10 text-center py-1 rounded-sm"
                  style={{ background:"var(--cream2)", border:"1px solid rgba(200,168,112,.15)" }}>
                  <p className="font-black leading-none"
                    style={{ fontSize:13, color:"var(--ink)",
                      fontFamily:"'Playfair Display',serif" }}>
                    {new Date(d.date).getDate()}
                  </p>
                  <p style={{ fontSize:7, color:"var(--stone2)", textTransform:"uppercase" }}>
                    {new Date(d.date).toLocaleString("uz-UZ",{month:"short"})}
                  </p>
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-sm font-medium truncate" style={{ color:"var(--ink)" }}>
                    {d.title}
                  </p>
                  {d.description&&(
                    <p className="line-clamp-1" style={{ fontSize:10, color:"var(--stone2)" }}>
                      {d.description}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </ColCard>
      </div>

      {/* ══════════ FRIEZE DIVIDER ══════════ */}
      <Frieze />

      {/* ══════════ STATUS BREAKDOWN ══════════ */}
      <div className="card-premium">
        {/* Cornice header */}
        <div className="px-6 py-4 flex items-center gap-4"
          style={{ borderBottom:"1px solid rgba(200,168,112,.1)",
            background:"var(--cream)" }}>
          <div style={{ width:24, height:1, background:"var(--gold)", opacity:.6 }}/>
          <p style={{ fontSize:9, color:"var(--stone2)", letterSpacing:".14em",
            textTransform:"uppercase", fontWeight:700 }}>
            Loyihalar Holati
          </p>
          <div style={{ flex:1, height:1,
            background:"linear-gradient(90deg,rgba(200,168,112,.2),transparent)" }}/>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {Object.entries(PROJECT_STATUSES).map(([key,val])=>{
              const cnt=projects.filter(p=>p.status===key).length
              const pct=projects.length?Math.round((cnt/projects.length)*100):0
              return (
                <Link key={key} href={`/projects?status=${key}`}>
                  <div
                    className="text-center p-4 rounded-sm anim-cardIn status-box"
                    style={{
                      background:"var(--cream)",
                      border:"1px solid rgba(200,168,112,.1)",
                      transition:"all .35s cubic-bezier(.23,1,.32,1)",
                    }}
                    onMouseEnter={e=>{
                      const t=e.currentTarget as HTMLElement
                      t.style.transform="perspective(600px) rotateX(6deg) translateY(-6px)"
                      t.style.borderColor="rgba(200,168,112,.35)"
                      t.style.boxShadow="var(--shadow-lg)"
                    }}
                    onMouseLeave={e=>{
                      const t=e.currentTarget as HTMLElement
                      t.style.transform=""
                      t.style.borderColor="rgba(200,168,112,.1)"
                      t.style.boxShadow=""
                    }}
                  >
                    <p className="font-black leading-none mb-2"
                      style={{ fontSize:"1.8rem", color:"var(--ink)",
                        fontFamily:"'Playfair Display',serif" }}>{cnt}</p>
                    <span className={cn("inline-block text-[10px] px-2 py-0.5 rounded-sm font-bold",val.color)}>
                      {val.label}
                    </span>
                    <div className="mt-2" style={{ height:1.5, background:"var(--cream3)", borderRadius:99 }}>
                      <div className="progress-bar"
                        style={{ width:`${pct}%`, height:1.5, borderRadius:99 }}/>
                    </div>
                    <p style={{ fontSize:8, color:"var(--stone)", marginTop:3 }}>{pct}%</p>
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
