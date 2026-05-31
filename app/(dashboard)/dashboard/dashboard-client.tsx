"use client"
import { useRef, useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, ChevronRight } from "lucide-react"
import { cn, formatDate, formatCurrency, PROJECT_STATUSES } from "@/lib/utils"

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

/* ─── Real-time Clock ─── */
function RealtimeClock() {
  const [time, setTime] = useState<string>("")
  const [date, setDate] = useState<string>("")
  const [secs, setSecs] = useState<number>(0)

  useEffect(() => {
    const update = () => {
      const now = new Date()
      const h = String(now.getHours()).padStart(2, "0")
      const m = String(now.getMinutes()).padStart(2, "0")
      const s = String(now.getSeconds()).padStart(2, "0")
      setTime(`${h}:${m}:${s}`)
      setSecs(now.getSeconds())
      setDate(now.toLocaleDateString("uz-UZ", {
        weekday: "long", day: "numeric", month: "long"
      }))
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  /* Analog clock */
  const now    = typeof window !== "undefined" ? new Date() : new Date(0)
  const hourDeg   = (now.getHours() % 12) / 12 * 360 + now.getMinutes() / 60 * 30
  const minDeg    = now.getMinutes() / 60 * 360 + now.getSeconds() / 60 * 6
  const secDeg    = secs / 60 * 360

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Analog clock */}
      <div className="relative" style={{ width: 110, height: 110 }}>
        {/* Outer ring */}
        <svg viewBox="0 0 110 110" className="absolute inset-0 w-full h-full">
          {/* Face */}
          <circle cx="55" cy="55" r="50"
            fill="rgba(250,248,244,0.92)"
            stroke="rgba(200,168,112,0.3)" strokeWidth="1.5" />
          {/* Cornice double ring */}
          <circle cx="55" cy="55" r="46"
            fill="none" stroke="rgba(200,168,112,0.15)" strokeWidth="0.7" />

          {/* Hour tick marks */}
          {Array.from({ length: 12 }, (_, i) => {
            const a  = (i / 12) * Math.PI * 2 - Math.PI / 2
            const x1 = 55 + 40 * Math.cos(a)
            const y1 = 55 + 40 * Math.sin(a)
            const x2 = 55 + 46 * Math.cos(a)
            const y2 = 55 + 46 * Math.sin(a)
            return (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={i % 3 === 0 ? "var(--gold)" : "var(--stone)"}
                strokeWidth={i % 3 === 0 ? "2" : "1"} />
            )
          })}

          {/* Minute ticks */}
          {Array.from({ length: 60 }, (_, i) => {
            if (i % 5 === 0) return null
            const a  = (i / 60) * Math.PI * 2 - Math.PI / 2
            const x1 = 55 + 43 * Math.cos(a)
            const y1 = 55 + 43 * Math.sin(a)
            const x2 = 55 + 46 * Math.cos(a)
            const y2 = 55 + 46 * Math.sin(a)
            return (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="rgba(168,152,128,0.4)" strokeWidth="0.5" />
            )
          })}

          {/* Hour hand */}
          <line
            x1="55" y1="55"
            x2={55 + 26 * Math.cos((hourDeg - 90) * Math.PI / 180)}
            y2={55 + 26 * Math.sin((hourDeg - 90) * Math.PI / 180)}
            stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" />

          {/* Minute hand */}
          <line
            x1="55" y1="55"
            x2={55 + 36 * Math.cos((minDeg - 90) * Math.PI / 180)}
            y2={55 + 36 * Math.sin((minDeg - 90) * Math.PI / 180)}
            stroke="var(--ink2)" strokeWidth="1.8" strokeLinecap="round" />

          {/* Second hand */}
          <line
            x1="55" y1="55"
            x2={55 + 38 * Math.cos((secDeg - 90) * Math.PI / 180)}
            y2={55 + 38 * Math.sin((secDeg - 90) * Math.PI / 180)}
            stroke="var(--gold)" strokeWidth="1" strokeLinecap="round" />
          {/* Back of second hand */}
          <line
            x1="55" y1="55"
            x2={55 - 10 * Math.cos((secDeg - 90) * Math.PI / 180)}
            y2={55 - 10 * Math.sin((secDeg - 90) * Math.PI / 180)}
            stroke="var(--gold)" strokeWidth="1" strokeLinecap="round" />

          {/* Center dot */}
          <circle cx="55" cy="55" r="3.5" fill="var(--ink)" />
          <circle cx="55" cy="55" r="1.5" fill="var(--gold)" />

          {/* Brand text */}
          <text x="55" y="73" textAnchor="middle"
            style={{ fontSize: 5, fill: "var(--stone)", letterSpacing: "0.18em",
              fontFamily: "Inter, sans-serif", fontWeight: 600 }}>
            ARCH
          </text>
        </svg>
      </div>

      {/* Digital time */}
      <div className="text-center">
        <p className="font-black tracking-tight leading-none"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.7rem",
            color: "var(--ink)",
            letterSpacing: "-0.03em",
          }}>
          {time.slice(0, 5)}
          <span style={{ fontSize: "1rem", color: "var(--gold)", marginLeft: 2 }}>
            :{time.slice(6)}
          </span>
        </p>
        <p className="capitalize" style={{
          fontSize: 10, color: "var(--stone2)", marginTop: 3,
          fontFamily: "'Cormorant Garamond', serif"
        }}>
          {date}
        </p>
      </div>
    </div>
  )
}

/* ─── Aerial City SVG ─── */
function AerialCity() {
  return (
    <svg
      viewBox="0 0 560 340"
      fill="none"
      className="w-full h-full"
      style={{ minHeight: 200 }}
    >
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8f4f8" />
          <stop offset="100%" stopColor="#f5f0e8" />
        </linearGradient>
        <linearGradient id="roadGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c8c0b0" stopOpacity=".6" />
          <stop offset="100%" stopColor="#b8b0a0" stopOpacity=".4" />
        </linearGradient>
        <linearGradient id="bldGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0e8d8" />
          <stop offset="100%" stopColor="#e0d4c0" />
        </linearGradient>
        <linearGradient id="bldBlue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dce8f0" />
          <stop offset="100%" stopColor="#c8dce8" />
        </linearGradient>
        <filter id="bShadow">
          <feDropShadow dx="2" dy="3" stdDeviation="3" floodColor="rgba(26,24,20,.12)" />
        </filter>
        <filter id="softShadow">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="rgba(26,24,20,.08)" />
        </filter>
      </defs>

      {/* Sky / Ground */}
      <rect x="0" y="0" width="560" height="340" fill="url(#skyGrad)" />

      {/* === GRID ROADS (aerial view) === */}
      {/* Horizontal roads */}
      {[60, 120, 190, 255, 310, 285].map((y, i) => (
        <rect key={`hr${i}`} x="0" y={y} width="560" height={i % 2 === 0 ? 14 : 10}
          fill="url(#roadGrad)" />
      ))}
      {/* Vertical roads */}
      {[70, 155, 240, 330, 420, 490].map((x, i) => (
        <rect key={`vr${i}`} x={x} y="0" width={i % 2 === 0 ? 14 : 10} height="340"
          fill="url(#roadGrad)" />
      ))}

      {/* Road center lines */}
      {[60, 190, 310].map((y, i) => (
        <line key={`rl${i}`} x1="0" y1={y + 7} x2="560" y2={y + 7}
          stroke="rgba(255,255,255,.5)" strokeWidth=".8" strokeDasharray="16 10" />
      ))}
      {[70, 240, 420].map((x, i) => (
        <line key={`vc${i}`} x1={x + 7} y1="0" x2={x + 7} y2="340"
          stroke="rgba(255,255,255,.5)" strokeWidth=".8" strokeDasharray="16 10" />
      ))}

      {/* === CITY BLOCKS (aerial view) === */}

      {/* Block 1 — top-left */}
      <g filter="url(#bShadow)">
        <rect x="8"   y="8"   width="55" height="48" rx="2" fill="url(#bldGold)" stroke="rgba(200,168,112,.4)" strokeWidth=".8" />
        <rect x="18"  y="15"  width="12" height="10" fill="rgba(200,168,112,.3)" />
        <rect x="35"  y="15"  width="12" height="10" fill="rgba(200,168,112,.3)" />
        <rect x="18"  y="30"  width="12" height="10" fill="rgba(200,168,112,.3)" />
        <rect x="35"  y="30"  width="12" height="10" fill="rgba(200,168,112,.3)" />
        {/* Roof ornament */}
        <line x1="8" y1="8" x2="63" y2="8" stroke="rgba(200,168,112,.6)" strokeWidth="1.5" />
      </g>

      {/* Block 2 — tall skyscraper */}
      <g filter="url(#bShadow)">
        <rect x="86"  y="12"  width="60" height="42" rx="1" fill="url(#bldBlue)" stroke="rgba(100,140,180,.3)" strokeWidth=".7" />
        {/* Glass curtain wall grid */}
        {[94,104,114,124,134].map(x => (
          <line key={x} x1={x} y1="12" x2={x} y2="54" stroke="rgba(100,160,200,.2)" strokeWidth=".6" />
        ))}
        {[20,28,36,44].map(y => (
          <line key={y} x1="86" y1={y} x2="146" y2={y} stroke="rgba(100,160,200,.15)" strokeWidth=".5" />
        ))}
        {/* Rooftop antenna */}
        <line x1="116" y1="12" x2="116" y2="4" stroke="rgba(26,24,20,.3)" strokeWidth="1" />
        <circle cx="116" cy="3.5" r="1.5" fill="rgba(200,168,112,.6)" />
      </g>

      {/* Block 3 — residential */}
      <g filter="url(#softShadow)">
        {[88, 102, 116, 130].map((x, i) => (
          <rect key={i} x={x} y={68} width={10} height={46} rx="1"
            fill={i % 2 === 0 ? "url(#bldGold)" : "url(#bldBlue)"}
            stroke="rgba(200,168,112,.2)" strokeWidth=".5" />
        ))}
      </g>

      {/* Block 4 — large commercial */}
      <g filter="url(#bShadow)">
        <rect x="170" y="8" width="62" height="46" rx="2" fill="#ede4d4" stroke="rgba(200,168,112,.35)" strokeWidth=".8" />
        {/* Courtyard */}
        <rect x="184" y="20" width="34" height="24" rx="1" fill="rgba(210,230,200,.5)" stroke="rgba(150,180,150,.3)" strokeWidth=".5" />
        {/* Trees in courtyard */}
        {[[193,28],[205,28],[193,36],[205,36]].map(([tx,ty],j) => (
          <circle key={j} cx={tx} cy={ty} r="4" fill="rgba(100,160,80,.4)" />
        ))}
        <line x1="170" y1="8" x2="232" y2="8" stroke="rgba(200,168,112,.6)" strokeWidth="1.5" />
      </g>

      {/* Block 5 — office tower group */}
      <g filter="url(#bShadow)">
        <rect x="258" y="5" width="64" height="50" rx="1" fill="url(#bldBlue)" stroke="rgba(100,140,180,.25)" strokeWidth=".7" />
        {[266,275,284,293,302,311].map(x => (
          <line key={x} x1={x} y1="5" x2={x} y2="55" stroke="rgba(100,160,200,.15)" strokeWidth=".5" />
        ))}
        {[13,21,29,37,45].map(y => (
          <line key={y} x1="258" y1={y} x2="322" y2={y} stroke="rgba(100,160,200,.12)" strokeWidth=".4" />
        ))}
        {/* Top structure */}
        <rect x="272" y="1" width="36" height="4" rx="1" fill="rgba(100,140,180,.5)" />
      </g>

      {/* Block 6 — cultural/museum */}
      <g filter="url(#bShadow)">
        <rect x="344" y="8" width="70" height="46" rx="3" fill="#f0e8d0" stroke="rgba(200,168,112,.4)" strokeWidth=".8" />
        {/* Colonnade suggestion */}
        {[356,370,384,398].map(x => (
          <rect key={x} x={x} y="8" width="5" height="46" rx="1"
            fill="rgba(200,168,112,.2)" stroke="rgba(200,168,112,.3)" strokeWidth=".4" />
        ))}
        <line x1="344" y1="8" x2="414" y2="8" stroke="rgba(200,168,112,.7)" strokeWidth="2" />
        <line x1="344" y1="12" x2="414" y2="12" stroke="rgba(200,168,112,.35)" strokeWidth=".7" />
      </g>

      {/* Block 7 — park/plaza */}
      <g filter="url(#softShadow)">
        <rect x="428" y="8" width="56" height="46" rx="4" fill="rgba(180,220,160,.5)" stroke="rgba(120,180,100,.3)" strokeWidth=".8" />
        {/* Path cross */}
        <line x1="428" y1="31" x2="484" y2="31" stroke="rgba(255,255,255,.6)" strokeWidth="2" />
        <line x1="456" y1="8" x2="456" y2="54" stroke="rgba(255,255,255,.6)" strokeWidth="2" />
        {/* Trees */}
        {[[438,18],[468,18],[438,42],[468,42],[456,31]].map(([tx,ty],j) => (
          <circle key={j} cx={tx} cy={ty} r={j===4?5:4} fill="rgba(80,150,60,.5)" />
        ))}
        <circle cx="456" cy="31" r="3" fill="rgba(200,168,112,.6)" />
      </g>

      {/* === ROW 2 BLOCKS === */}
      {/* Large block with details */}
      <g filter="url(#bShadow)">
        <rect x="8" y="134" width="55" height="50" rx="2" fill="url(#bldBlue)" stroke="rgba(100,140,180,.25)" strokeWidth=".7" />
        {[16,25,34,43,52].map(x => (
          <line key={x} x1={x} y1="134" x2={x} y2="184" stroke="rgba(100,160,200,.15)" strokeWidth=".5" />
        ))}
        {[142,152,162,172].map(y => (
          <line key={y} x1="8" y1={y} x2="63" y2={y} stroke="rgba(100,160,200,.12)" strokeWidth=".4" />
        ))}
      </g>

      {/* Mixed use block */}
      <g filter="url(#softShadow)">
        <rect x="86" y="130" width="62" height="54" rx="2" fill="#ede4d4" stroke="rgba(200,168,112,.3)" strokeWidth=".7" />
        <rect x="98" y="142" width="20" height="32" rx="1" fill="rgba(200,168,112,.2)" />
        <rect x="124" y="136" width="18" height="42" rx="1" fill="rgba(200,168,112,.25)" />
        <line x1="86" y1="130" x2="148" y2="130" stroke="rgba(200,168,112,.5)" strokeWidth="1.5" />
      </g>

      {/* === GRAND CENTRAL PLAZA (center-bottom) === */}
      <g filter="url(#bShadow)">
        {/* Main central building */}
        <rect x="200" y="210" width="160" height="100" rx="3" fill="#ede4d4" stroke="rgba(200,168,112,.4)" strokeWidth="1" />
        {/* Wings */}
        <rect x="174" y="235" width="26" height="60" rx="2" fill="#e8e0ce" stroke="rgba(200,168,112,.3)" strokeWidth=".7" />
        <rect x="360" y="235" width="26" height="60" rx="2" fill="#e8e0ce" stroke="rgba(200,168,112,.3)" strokeWidth=".7" />
        {/* Courtyard */}
        <rect x="228" y="234" width="104" height="64" rx="2" fill="rgba(180,220,160,.5)" stroke="rgba(150,200,130,.4)" strokeWidth=".6" />
        {/* Courtyard trees */}
        {[[248,254],[280,254],[310,254],[248,276],[280,276],[310,276]].map(([tx,ty],j) => (
          <circle key={j} cx={tx} cy={ty} r="6" fill="rgba(80,150,60,.45)" />
        ))}
        {/* Fountain */}
        <circle cx="280" cy="266" r="10" fill="rgba(100,160,220,.3)" stroke="rgba(100,160,220,.4)" strokeWidth=".7" />
        <circle cx="280" cy="266" r="5" fill="rgba(100,160,220,.5)" />
        {/* Cornice lines */}
        <line x1="200" y1="210" x2="360" y2="210" stroke="rgba(200,168,112,.6)" strokeWidth="1.5" />
        <line x1="200" y1="215" x2="360" y2="215" stroke="rgba(200,168,112,.3)" strokeWidth=".7" />
        {/* Grid pattern on facade */}
        {[216,232,248,264,280,296,312,328,344].map(x => (
          <line key={x} x1={x} y1="215" x2={x} y2="234" stroke="rgba(200,168,112,.15)" strokeWidth=".5" />
        ))}
      </g>

      {/* === MORE BUILDINGS scattered === */}
      {[
        { x:170, y:134, w:55, h:50, type:"glass" },
        { x:258, y:134, w:60, h:52, type:"warm"  },
        { x:344, y:134, w:65, h:48, type:"glass" },
        { x:428, y:134, w:52, h:50, type:"warm"  },
        { x:500, y:8,   w:52, h:46, type:"glass" },
        { x:500, y:130, w:52, h:54, type:"warm"  },
        { x:8,   y:210, w:55, h:90, type:"glass" },
        { x:86,  y:210, w:60, h:50, type:"warm"  },
        { x:86,  y:268, w:60, h:32, type:"glass" },
        { x:428, y:210, w:60, h:90, type:"warm"  },
        { x:500, y:210, w:52, h:88, type:"glass" },
        { x:8,   y:300, w:55, h:36, type:"warm"  },
        { x:170, y:300, w:160, h:36, type:"warm"  },
        { x:428, y:304, w:124, h:32, type:"glass" },
      ].map((b, i) => (
        <g key={i} filter="url(#softShadow)">
          <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="1.5"
            fill={b.type === "glass" ? "url(#bldBlue)" : "url(#bldGold)"}
            stroke={b.type === "glass" ? "rgba(100,140,180,.2)" : "rgba(200,168,112,.25)"}
            strokeWidth=".6" />
          {/* Simple window grid */}
          {Array.from({ length: Math.floor(b.w / 12) }, (_, j) => (
            <line key={j} x1={b.x + 8 + j * 12} y1={b.y} x2={b.x + 8 + j * 12} y2={b.y + b.h}
              stroke={b.type === "glass" ? "rgba(100,160,200,.1)" : "rgba(200,168,112,.12)"}
              strokeWidth=".4" />
          ))}
          {Array.from({ length: Math.floor(b.h / 12) }, (_, j) => (
            <line key={j} x1={b.x} y1={b.y + 8 + j * 12} x2={b.x + b.w} y2={b.y + 8 + j * 12}
              stroke={b.type === "glass" ? "rgba(100,160,200,.08)" : "rgba(200,168,112,.1)"}
              strokeWidth=".35" />
          ))}
        </g>
      ))}

      {/* === AERIAL PERSPECTIVE LINES (vanishing point) === */}
      <line x1="280" y1="170" x2="0"   y2="340" stroke="rgba(200,168,112,.06)" strokeWidth=".5" />
      <line x1="280" y1="170" x2="560" y2="340" stroke="rgba(200,168,112,.06)" strokeWidth=".5" />
      <line x1="280" y1="170" x2="280" y2="340" stroke="rgba(200,168,112,.04)" strokeWidth=".5" />

      {/* === COMPASS ROSE (top right) === */}
      <g transform="translate(520,285)">
        <circle cx="0" cy="0" r="20" fill="rgba(250,248,244,.85)"
          stroke="rgba(200,168,112,.3)" strokeWidth="0.8" />
        <circle cx="0" cy="0" r="15" fill="none"
          stroke="rgba(200,168,112,.15)" strokeWidth="0.5" />
        {/* N */}
        <polygon points="0,-14 3,-5 -3,-5" fill="var(--gold)" opacity=".7" />
        {/* S */}
        <polygon points="0,14 3,5 -3,5" fill="var(--stone)" opacity=".5" />
        {/* E */}
        <polygon points="14,0 5,3 5,-3" fill="var(--stone)" opacity=".4" />
        {/* W */}
        <polygon points="-14,0 -5,3 -5,-3" fill="var(--stone)" opacity=".4" />
        <text x="0" y="-8" textAnchor="middle"
          style={{ fontSize: 6, fill: "var(--ink)", fontFamily: "Inter,sans-serif", fontWeight: 700 }}>
          N
        </text>
        <circle cx="0" cy="0" r="2" fill="var(--ink)" />
      </g>

      {/* Scale bar */}
      <g transform="translate(18, 322)">
        <line x1="0" y1="0" x2="60" y2="0" stroke="rgba(26,24,20,.35)" strokeWidth=".7" />
        <line x1="0" y1="-2.5" x2="0"  y2="2.5" stroke="rgba(26,24,20,.35)" strokeWidth=".7" />
        <line x1="30" y1="-1.5" x2="30" y2="1.5" stroke="rgba(26,24,20,.35)" strokeWidth=".5" />
        <line x1="60" y1="-2.5" x2="60" y2="2.5" stroke="rgba(26,24,20,.35)" strokeWidth=".7" />
        <text x="30" y="9" textAnchor="middle"
          style={{ fontSize: 5.5, fill: "rgba(26,24,20,.5)", fontFamily: "monospace" }}>
          0 ——— 500m
        </text>
      </g>

      {/* Legend watermark */}
      <text x="280" y="330" textAnchor="middle"
        style={{ fontSize: 6, fill: "rgba(200,168,112,.35)",
          fontFamily: "monospace", letterSpacing: "0.15em" }}>
        SHAHARSOZLIK REJASI · M 1:5000
      </text>

      {/* Subtle vignette */}
      <defs>
        <radialGradient id="vign" cx="50%" cy="50%" r="70%">
          <stop offset="60%" stopColor="transparent" />
          <stop offset="100%" stopColor="rgba(230,220,200,.35)" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="560" height="340" fill="url(#vign)" />
    </svg>
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
          border: "1px solid rgba(200,168,112,.2)",
          boxShadow: "var(--shadow-lg)",
          background: "linear-gradient(160deg, #f5f0e8 0%, #ede8dc 40%, #e8f0f5 100%)",
          minHeight: 300,
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

        {/* Content row: text | city map | clock */}
        <div className="relative z-10 flex min-h-[250px]">

          {/* ── Left: greeting ── */}
          <div className="flex flex-col justify-center px-8 py-6"
            style={{ flex: "0 0 38%", minWidth: 0 }}>
            <div className="flex items-center gap-2 mb-4 anim-fadeLeft d1">
              <div style={{ width:16, height:1, background:"var(--gold)", opacity:.7 }}/>
              <span style={{ fontSize:8, color:"var(--stone2)", letterSpacing:".22em",
                fontWeight:600, textTransform:"uppercase" }}>Faol rejim</span>
            </div>
            <h1 className="font-black leading-tight anim-fadeUp d2"
              style={{
                fontFamily:"'Playfair Display',serif",
                fontSize:"clamp(1.5rem,2.5vw,2.4rem)",
                letterSpacing:"-.03em", color:"var(--ink)",
              }}>
              {greeting},<br/>
              <span className="text-shimmer-gold">{fname}</span>!
            </h1>
            <p className="mt-2 anim-fadeUp d3"
              style={{ fontSize:12, color:"var(--stone2)",
                fontFamily:"'Cormorant Garamond',serif", lineHeight:1.5 }}>
              Loyihalaringiz, kundaligingiz va<br/>moliyaviy hisobotlaringiz bir joyda
            </p>
            <div className="flex flex-wrap gap-2 mt-4 anim-fadeUp d4">
              {[
                { label:"Faol loyiha",    val:activePr          },
                { label:"Bugun deadline", val:todayTasks.length  },
                { label:"Jami mijoz",     val:clients.length     },
              ].map(s=>(
                <div key={s.label} className="px-3 py-2 rounded-sm"
                  style={{
                    background:"rgba(250,248,244,.88)",
                    border:"1px solid rgba(200,168,112,.2)",
                    boxShadow:"0 2px 6px rgba(26,24,20,.05)",
                  }}>
                  <p className="font-black leading-none"
                    style={{fontSize:"1.15rem",color:"var(--ink)",fontFamily:"'Playfair Display',serif"}}>{s.val}</p>
                  <p style={{fontSize:9,color:"var(--stone2)",marginTop:2}}>{s.label}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-3 anim-fadeUp d5">
              {[{href:"/reports",label:"📊 Hisobot"},{href:"/contracts",label:"📜 Shartnoma"}].map(({href,label})=>(
                <Link key={href} href={href}>
                  <div className="glass-cream flex items-center gap-1.5 px-3 py-1.5 rounded-sm
                    text-xs font-medium transition-all hover:scale-105"
                    style={{color:"var(--stone2)"}}>
                    {label} <ArrowRight style={{width:11,height:11}}/>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ── Center: Aerial city map ── */}
          <div className="flex-1 relative overflow-hidden py-2 pr-2">
            <div className="h-full rounded-sm overflow-hidden"
              style={{
                border:"1px solid rgba(200,168,112,.22)",
                boxShadow:"inset 0 0 16px rgba(200,168,112,.06)",
                minHeight: 220,
              }}>
              <AerialCity />
              <div className="absolute top-3 left-3 px-2 py-1 rounded-sm"
                style={{
                  background:"rgba(250,248,244,.9)",
                  border:"1px solid rgba(200,168,112,.2)",
                  fontSize:6.5, color:"var(--stone2)",
                  letterSpacing:".12em", fontFamily:"monospace",
                  backdropFilter:"blur(6px)",
                }}>
                AERIAL VIEW
              </div>
            </div>
          </div>

          {/* ── Right: Real-time clock ── */}
          <div className="flex items-center justify-center px-5 py-4 anim-fadeScale d3"
            style={{flex:"0 0 190px"}}>
            <div className="rounded-sm p-4 w-full"
              style={{
                background:"rgba(250,248,244,.9)",
                border:"1px solid rgba(200,168,112,.2)",
                boxShadow:"var(--shadow-md)",
                backdropFilter:"blur(12px)",
              }}>
              <RealtimeClock />
            </div>
          </div>
        </div>

        {/* Bottom frieze */}
        <div className="absolute bottom-0 left-0 right-0"><Frieze /></div>
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
