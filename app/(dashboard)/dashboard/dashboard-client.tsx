"use client"
import Link from "next/link"
import { ArrowRight, ChevronRight } from "lucide-react"
import { cn, formatDate, formatCurrency, PROJECT_STATUSES } from "@/lib/utils"

interface Project { id:string; name:string; status:string; deadline?:string|null }
interface Client  { id:string; name:string }
interface Task    { id:string; title:string; status:string; priority:string; deadline?:string|null }
interface Diary   { id:string; title:string; date:string; description?:string|null }
interface Props {
  userName:string; projects:Project[]; clients:Client[]; tasks:Task[];
  todayTasks:Task[]; diaries:Diary[]; totalIncome:number;
}

/* ─── Order Frieze divider ─── */
function FriezeDivider() {
  return (
    <svg viewBox="0 0 600 20" className="w-full" fill="none">
      <line x1="0" y1="1" x2="600" y2="1" stroke="#E2DDD5" strokeWidth="0.8"/>
      <line x1="0" y1="3" x2="600" y2="3" stroke="#B8965A" strokeWidth="0.5" opacity="0.4"/>
      {Array.from({length:30},(_,i)=>{
        const x = i*20+4
        return (
          <g key={i}>
            <rect x={x} y={5} width={5} height={10} fill="#1C1B18" opacity="0.04"/>
            <line x1={x+1.5} y1={5} x2={x+1.5} y2={15} stroke="#C8C2B8" strokeWidth="0.4"/>
            <line x1={x+3.5} y1={5} x2={x+3.5} y2={15} stroke="#C8C2B8" strokeWidth="0.4"/>
          </g>
        )
      })}
      <line x1="0" y1="17" x2="600" y2="17" stroke="#B8965A" strokeWidth="0.5" opacity="0.4"/>
      <line x1="0" y1="19" x2="600" y2="19" stroke="#E2DDD5" strokeWidth="0.8"/>
    </svg>
  )
}

/* ─── Ghosted column silhouette for hero ─── */
function ColumnSilhouette() {
  return (
    <svg viewBox="0 0 200 380" fill="none" className="w-full h-full opacity-[0.06]">
      {[40,90,140].map((cx,i)=>(
        <g key={i}>
          <rect x={cx-2} y={4} width={44} height={4} fill="#1C1B18"/>
          <path d={`M${cx+2} 8 Q${cx+22} 12 ${cx+42} 8 L${cx+42} 14 L${cx+2} 14 Z`} fill="#1C1B18" opacity="0.7"/>
          <rect x={cx+4} y={14} width={36} height={300} fill="none" stroke="#1C1B18" strokeWidth="1.5"/>
          {[-12,-7,-2,3,8,13,18,23,28].map((dx,j)=>(
            <line key={j} x1={cx+22+dx} y1={14} x2={cx+22+dx*0.87} y2={314}
              stroke="#1C1B18" strokeWidth="0.4" opacity="0.5"/>
          ))}
          <rect x={cx+2} y={314} width={40} height={5} fill="#1C1B18" opacity="0.8"/>
          <rect x={cx-2} y={319} width={48} height={4} fill="#1C1B18"/>
        </g>
      ))}
    </svg>
  )
}

export function DashboardClient({
  userName, projects, clients, tasks, todayTasks, diaries, totalIncome
}: Props) {
  const activePr = projects.filter(p=>p.status!=="COMPLETED").length
  const donePr   = projects.filter(p=>p.status==="COMPLETED").length
  const pendingT = tasks.filter(t=>t.status!=="DONE").length
  const doneT    = tasks.filter(t=>t.status==="DONE").length
  const taskPct  = tasks.length ? Math.round((doneT/tasks.length)*100) : 0
  const hour     = new Date().getHours()
  const greeting = hour<12?"Xayrli tong":hour<17?"Xayrli kun":"Xayrli kech"
  const fname    = userName.split(" ")[0]

  const STATS = [
    { label:"Faol Loyihalar", val:activePr,       sub:`${donePr} tugallangan`,  href:"/projects" },
    { label:"Mijozlar",       val:clients.length,  sub:"Jami bazada",            href:"/clients"  },
    { label:"Vazifalar",      val:pendingT,        sub:`${taskPct}% bajarildi`,  href:"/tasks", pct:taskPct },
    { label:"Daromad",        val:null, valStr:formatCurrency(totalIncome), sub:"Jami", href:"/finance" },
  ]

  return (
    <div className="space-y-6 animate-page">

      {/* ══ HERO ══ */}
      <div
        className="relative overflow-hidden"
        style={{ background:"#FFFFFF", border:"1px solid #E2DDD5", borderRadius:4,
          boxShadow:"0 2px 12px rgba(28,27,24,0.06)", minHeight:280 }}
      >
        {/* Gold cornice top */}
        <div style={{ height:2, background:"linear-gradient(90deg,transparent,#B8965A 30%,#D4B07A 50%,#B8965A 70%,transparent)" }}/>

        {/* Bg grid */}
        <div className="absolute inset-0 bg-neo-grid" style={{opacity:0.4}}/>

        {/* Column silhouettes right */}
        <div className="absolute right-0 top-0 h-full w-48 pointer-events-none">
          <ColumnSilhouette />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-10 py-10" style={{maxWidth:"60%"}}>
          {/* Frieze strip */}
          <div className="mb-5 w-24">
            <FriezeDivider />
          </div>

          <h1
            className="font-black leading-tight mb-2"
            style={{
              fontFamily:"'Playfair Display', serif",
              fontSize:"clamp(1.8rem,3.5vw,2.8rem)",
              letterSpacing:"-0.03em",
              color:"#1C1B18",
            }}
          >
            {greeting},<br/>
            <span style={{fontStyle:"italic", color:"#5A5650"}}>{fname}</span>!
          </h1>

          <p className="mb-6" style={{fontSize:14, color:"#9A968E", lineHeight:1.6}}>
            Loyihalaringiz, kundaligingiz va moliyaviy<br/>hisobotlaringiz bir joyda
          </p>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-3 mb-5">
            {[
              {label:"Faol loyiha",    val:activePr},
              {label:"Bugun deadline", val:todayTasks.length},
              {label:"Jami mijoz",     val:clients.length},
            ].map(s=>(
              <div key={s.label} className="px-4 py-2.5 rounded"
                style={{background:"#F7F5F0", border:"1px solid #E2DDD5"}}>
                <p className="font-black text-xl leading-none"
                  style={{color:"#1C1B18", fontFamily:"'Playfair Display',serif"}}>{s.val}</p>
                <p style={{fontSize:10, color:"#9A968E", marginTop:2}}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Quick links */}
          <div className="flex gap-2">
            {[{href:"/reports",label:"Hisobot"},{href:"/contracts",label:"Shartnoma"}].map(({href,label})=>(
              <Link key={href} href={href}>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors hover:bg-[#EDE9E1]"
                  style={{background:"#F2F0EB", border:"1px solid #E2DDD5", color:"#5A5650"}}>
                  {label} <ArrowRight className="h-3 w-3"/>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom frieze */}
        <div className="absolute bottom-0 left-0 right-0">
          <FriezeDivider />
        </div>
      </div>

      {/* ══ STAT CARDS ══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s,i)=>(
          <Link key={s.label} href={s.href}>
            <div className="stat-neo neo-card-3d p-5 animate-card" style={{animationDelay:`${i*0.09}s`}}>
              <p style={{fontSize:9, color:"#9A968E", letterSpacing:"0.14em", textTransform:"uppercase", fontWeight:600, marginBottom:10}}>
                {s.label}
              </p>
              <p className="font-black leading-none mb-1"
                style={{
                  fontSize:s.valStr?"1.2rem":"2.2rem",
                  color:"#1C1B18",
                  fontFamily:"'Playfair Display', serif",
                }}>
                {s.valStr ?? s.val}
              </p>
              <p style={{fontSize:10, color:"#9A968E"}}>{s.sub}</p>
              {s.pct !== undefined && s.pct !== null && (
                <div className="mt-3" style={{height:1, background:"#EDE9E1", borderRadius:999}}>
                  <div className="progress-neo" style={{width:`${s.pct}%`}}/>
                </div>
              )}
              <div className="mt-3 flex items-center gap-1" style={{color:"#C8C2B8"}}>
                <div style={{flex:1, height:1, background:"linear-gradient(90deg,#E2DDD5,transparent)"}}/>
                <ArrowRight className="h-3 w-3"/>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ══ 3 COLUMNS ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Today tasks */}
        <ColCard title="Bugungi Deadline" count={todayTasks.length} href="/tasks">
          {todayTasks.length===0 ? (
            <EmptyCol text="Bugun deadline yo'q" />
          ) : todayTasks.map(t=>(
            <div key={t.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#FAFAF8] transition-colors"
              style={{borderBottom:"1px solid #F2F0EB"}}>
              <div className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                style={{background:t.priority==="HIGH"?"#1C1B18":t.priority==="MEDIUM"?"#9A968E":"#C8C2B8"}}/>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium truncate",t.status==="DONE"&&"line-through opacity-40")}
                  style={{color:"#1C1B18"}}>{t.title}</p>
                <p style={{fontSize:10, color:"#9A968E"}}>
                  {t.status==="DONE"?"Bajarildi":t.status==="IN_PROGRESS"?"Jarayonda":"Kutilmoqda"}
                </p>
              </div>
            </div>
          ))}
        </ColCard>

        {/* Active projects */}
        <ColCard title="Faol Loyihalar" count={activePr} href="/projects">
          {projects.filter(p=>p.status!=="COMPLETED").slice(0,5).map(p=>{
            const s = PROJECT_STATUSES[p.status as keyof typeof PROJECT_STATUSES]
            const ov = p.deadline && new Date(p.deadline)<new Date()
            return (
              <Link key={p.id} href={`/projects/${p.id}`}>
                <div className="flex items-center justify-between px-4 py-2.5 hover:bg-[#FAFAF8] transition-colors cursor-pointer"
                  style={{borderBottom:"1px solid #F2F0EB"}}>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate" style={{color:"#1C1B18"}}>{p.name}</p>
                    {p.deadline&&<p style={{fontSize:10, color:ov?"#9A968E":"#C8C2B8"}}>{formatDate(p.deadline)}</p>}
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded ml-2 flex-shrink-0"
                    style={{background:"#F2F0EB", border:"1px solid #E2DDD5", color:"#9A968E", fontSize:9}}>
                    {s?.label}
                  </span>
                </div>
              </Link>
            )
          })}
          {!projects.filter(p=>p.status!=="COMPLETED").length && <EmptyCol text="Faol loyiha yo'q"/>}
        </ColCard>

        {/* Diary */}
        <ColCard title="Kundalik" count={diaries.length} href="/diary">
          {diaries.length===0 ? (
            <EmptyCol text="Yozuv yo'q" />
          ) : diaries.map(d=>(
            <Link key={d.id} href={`/diary/${d.id}`}>
              <div className="flex items-start gap-3 px-4 py-2.5 hover:bg-[#FAFAF8] transition-colors cursor-pointer"
                style={{borderBottom:"1px solid #F2F0EB"}}>
                <div className="flex-shrink-0 w-9 text-center py-1 rounded"
                  style={{background:"#F2F0EB", border:"1px solid #E2DDD5"}}>
                  <p className="font-black text-sm leading-none" style={{color:"#1C1B18", fontFamily:"'Playfair Display',serif"}}>
                    {new Date(d.date).getDate()}
                  </p>
                  <p style={{fontSize:7, color:"#9A968E", textTransform:"uppercase"}}>
                    {new Date(d.date).toLocaleString("uz-UZ",{month:"short"})}
                  </p>
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-sm font-medium truncate" style={{color:"#1C1B18"}}>{d.title}</p>
                  {d.description&&<p className="line-clamp-1" style={{fontSize:10, color:"#9A968E"}}>{d.description}</p>}
                </div>
              </div>
            </Link>
          ))}
        </ColCard>
      </div>

      {/* ══ FRIEZE DIVIDER ══ */}
      <FriezeDivider />

      {/* ══ STATUS BREAKDOWN ══ */}
      <div className="neo-card">
        <div className="px-5 py-4 flex items-center gap-3"
          style={{borderBottom:"1px solid #F2F0EB"}}>
          <div style={{height:1, width:24, background:"#B8965A", opacity:0.5}}/>
          <p style={{fontSize:9, color:"#9A968E", letterSpacing:"0.14em", textTransform:"uppercase", fontWeight:600}}>
            Loyihalar holati
          </p>
          <div style={{flex:1, height:1, background:"linear-gradient(90deg,#E2DDD5,transparent)"}}/>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {Object.entries(PROJECT_STATUSES).map(([key,val])=>{
              const count = projects.filter(p=>p.status===key).length
              const pct   = projects.length ? Math.round((count/projects.length)*100) : 0
              return (
                <Link key={key} href={`/projects?status=${key}`}>
                  <div className="status-box text-center p-3"
                    style={{background:"#FAFAF8", border:"1px solid #EDE9E1", borderRadius:3, transition:"all .25s"}}>
                    <p className="font-black leading-none mb-1.5"
                      style={{fontSize:"1.5rem", color:"#1C1B18", fontFamily:"'Playfair Display',serif"}}>{count}</p>
                    <span className={cn("inline-block text-[10px] px-2 py-0.5 rounded font-semibold", val.color)}>
                      {val.label}
                    </span>
                    <div className="mt-2" style={{height:1, background:"#EDE9E1", borderRadius:999}}>
                      <div className="progress-neo" style={{width:`${pct}%`}}/>
                    </div>
                    <p style={{fontSize:8, color:"#C8C2B8", marginTop:3}}>{pct}%</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .status-box:hover {
          border-color: #B8965A !important;
          background: #FFFFFF !important;
          transform: perspective(800px) rotateX(2deg) translateY(-4px);
          box-shadow: 0 8px 24px rgba(28,27,24,0.08);
        }
      `}</style>
    </div>
  )
}

function ColCard({ title,count,href,children }:{title:string;count:number;href:string;children:React.ReactNode}) {
  return (
    <div className="neo-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3"
        style={{borderBottom:"2px solid #F2F0EB", background:"#FAFAF8"}}>
        <div>
          <p className="text-sm font-bold" style={{color:"#1C1B18", fontFamily:"'Playfair Display',serif"}}>{title}</p>
          <p style={{fontSize:10, color:"#9A968E"}}>{count} ta</p>
        </div>
        <Link href={href}>
          <span className="flex items-center gap-1 text-xs font-medium"
            style={{color:"#9A968E"}}>
            Barchasi <ChevronRight className="h-3 w-3"/>
          </span>
        </Link>
      </div>
      <div>{children}</div>
    </div>
  )
}

function EmptyCol({ text }:{text:string}) {
  return (
    <div className="flex items-center justify-center py-8">
      <p style={{fontSize:12, color:"#C8C2B8"}}>{text}</p>
    </div>
  )
}
