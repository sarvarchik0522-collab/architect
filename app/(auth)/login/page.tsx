"use client"
import { useState, useEffect, useRef } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, ArrowRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ShaderBg } from "@/components/shader-bg"

/* ═══════════════════════════════════════
   Doric Temple — detailed SVG drawing
═══════════════════════════════════════ */
function DoricTemple() {
  const cols = [82, 178, 274, 370]
  const SHAFT = 200
  return (
    <svg viewBox="0 0 460 500" fill="none" className="w-full h-full" style={{ maxHeight: "100%" }}>
      {/* Blueprint grid */}
      {Array.from({ length: 24 }, (_, i) => (
        <line key={`v${i}`} x1={i * 20} y1={0} x2={i * 20} y2={500}
          stroke="rgba(26,24,20,.04)" strokeWidth="0.5" />
      ))}
      {Array.from({ length: 26 }, (_, i) => (
        <line key={`h${i}`} x1={0} y1={i * 20} x2={460} y2={i * 20}
          stroke="rgba(26,24,20,.04)" strokeWidth="0.5" />
      ))}

      {/* ── PEDIMENT ── */}
      <path d="M42 108 L231 14 L420 108"
        stroke="var(--ink)" strokeWidth="2" strokeLinecap="round"
        className="draw-path" />
      {/* Raking cornice */}
      <path d="M48 114 L231 22 L414 114"
        stroke="var(--stone)" strokeWidth="0.8" opacity="0.5" />
      {/* Tympanum fill */}
      <path d="M50 112 L231 20 L412 112 Z"
        fill="var(--ink)" fillOpacity="0.025" />

      {/* Acroteria */}
      {[231, 44, 418].map((x, i) => (
        <g key={i}>
          <polygon points={`${x},${i === 0 ? 6 : 107} ${x + 7},${i === 0 ? 16 : 117} ${x - 7},${i === 0 ? 16 : 117}`}
            fill="var(--ink)" opacity="0.6" />
          <circle cx={x} cy={i === 0 ? 4 : 105} r="3"
            fill="var(--gold)" opacity="0.8" />
        </g>
      ))}

      {/* ── ENTABLATURE ── */}
      {/* Cornice top */}
      <line x1="36" y1="108" x2="426" y2="108" stroke="var(--ink)" strokeWidth="2" />
      <line x1="40" y1="112" x2="422" y2="112" stroke="var(--ink)" strokeWidth="1.2" />
      <line x1="44" y1="116" x2="418" y2="116" stroke="var(--stone)" strokeWidth="0.6" opacity="0.5" />

      {/* Frieze band with triglyphs + metopes */}
      <rect x="44" y="116" width="374" height="38"
        stroke="var(--ink)" strokeWidth="0.8" fill="none" />
      {/* Triglyphs */}
      {[52, 96, 140, 184, 228, 272, 316, 360, 404].map((x, i) => (
        <g key={i}>
          <rect x={x} y={116} width={14} height={38}
            fill="var(--ink)" fillOpacity="0.07" stroke="none" />
          {[3, 6.5, 10].map((dx, j) => (
            <line key={j} x1={x + dx} y1={116} x2={x + dx} y2={154}
              stroke="var(--ink)" strokeWidth="0.9" opacity="0.45" />
          ))}
          <rect x={x} y={150} width={14} height={4}
            fill="var(--ink)" fillOpacity="0.18" />
        </g>
      ))}
      {/* Metope rosettes */}
      {[70, 114, 158, 202, 246, 290, 334, 378].map((x, i) => (
        <g key={i}>
          <circle cx={x + 14} cy={135} r={8}
            stroke="var(--stone)" strokeWidth="0.5" fill="none" opacity="0.5" />
          <circle cx={x + 14} cy={135} r={3}
            fill="var(--stone)" fillOpacity="0.4" />
        </g>
      ))}

      {/* Architrave - 3 fascias */}
      <rect x="44" y="154" width="374" height="8"
        fill="var(--ink)" fillOpacity="0.06"
        stroke="var(--ink)" strokeWidth="0.8" />
      <line x1="44" y1="158" x2="418" y2="158"
        stroke="var(--stone)" strokeWidth="0.4" opacity="0.4" />
      <rect x="44" y="162" width="374" height="5"
        fill="var(--ink)" fillOpacity="0.04"
        stroke="var(--ink)" strokeWidth="0.6" />

      {/* ── 4 DORIC COLUMNS ── */}
      {cols.map((cx, i) => (
        <g key={i}>
          {/* Abacus */}
          <rect x={cx - 26} y={167} width={52} height={5}
            fill="var(--ink)" fillOpacity="0.85" />
          {/* Echinus */}
          <path d={`M${cx - 22} 172 Q${cx} 178 ${cx + 22} 172 L${cx + 22} 180 L${cx - 22} 180 Z`}
            fill="var(--ink)" fillOpacity="0.12"
            stroke="var(--ink)" strokeWidth="0.7" />
          <rect x={cx - 22} y={172} width={44} height={8}
            stroke="var(--stone)" strokeWidth="0.5" fill="none" opacity="0.5" />
          {/* Neck rings */}
          {[0, 2.5, 5].map((dy, j) => (
            <line key={j} x1={cx - 16} y1={180 + dy} x2={cx + 16} y2={180 + dy}
              stroke="var(--ink)" strokeWidth="0.6" opacity="0.3" />
          ))}

          {/* Shaft with entasis curve */}
          <path d={`M${cx - 17} 185 C${cx - 15} ${185 + SHAFT * 0.5} ${cx - 13} ${185 + SHAFT} ${cx - 13} ${185 + SHAFT}`}
            stroke="var(--stone)" strokeWidth="0.4" opacity="0.4" />
          <path d={`M${cx + 17} 185 C${cx + 15} ${185 + SHAFT * 0.5} ${cx + 13} ${185 + SHAFT} ${cx + 13} ${185 + SHAFT}`}
            stroke="var(--stone)" strokeWidth="0.4" opacity="0.4" />
          <line x1={cx - 17} y1={185} x2={cx - 13} y2={185 + SHAFT}
            stroke="var(--ink)" strokeWidth="0.9" />
          <line x1={cx + 17} y1={185} x2={cx + 13} y2={185 + SHAFT}
            stroke="var(--ink)" strokeWidth="0.9" />

          {/* Fluting lines */}
          {[-11, -7.5, -4, -0.5, 3, 6.5, 10].map((dx, j) => (
            <line key={j}
              x1={cx + dx} y1={185}
              x2={cx + dx * 0.76} y2={185 + SHAFT}
              stroke="var(--ink)" strokeWidth="0.3" opacity="0.22" />
          ))}

          {/* Base — torus + plinth */}
          <ellipse cx={cx} cy={185 + SHAFT} rx={15} ry={2.5}
            fill="none" stroke="var(--stone)" strokeWidth="0.5" opacity="0.4" />
          <rect x={cx - 18} y={185 + SHAFT} width={36} height={4.5}
            stroke="var(--ink)" strokeWidth="0.8" fill="none" />
          <rect x={cx - 22} y={185 + SHAFT + 4.5} width={44} height={3}
            stroke="var(--ink)" strokeWidth="0.7" fill="none" />
          <rect x={cx - 26} y={185 + SHAFT + 7.5} width={52} height={5}
            fill="var(--ink)" fillOpacity="0.82" />

          {/* Axis dashed line */}
          <line x1={cx} y1={165} x2={cx} y2={185 + SHAFT + 20}
            stroke="var(--stone)" strokeWidth="0.4"
            strokeDasharray="4 3" opacity="0.3" />
          {/* Axis label */}
          <circle cx={cx} cy={185 + SHAFT + 28} r={7}
            stroke="var(--stone)" strokeWidth="0.6" fill="none" opacity="0.5" />
          <text x={cx} y={185 + SHAFT + 31.5} textAnchor="middle"
            style={{ fontSize: 6.5, fill: "var(--stone2)", fontFamily: "monospace" }}>
            {String.fromCharCode(65 + i)}
          </text>
        </g>
      ))}

      {/* ── STYLOBATE (3 steps) ── */}
      {[0, 1, 2].map(s => (
        <rect key={s}
          x={24 - s * 8} y={185 + SHAFT + 12 + s * 10}
          width={414 + s * 16} height={9}
          stroke="var(--ink)" strokeWidth={1.2 - s * 0.2}
          fill="none" />
      ))}

      {/* ── DIMENSION ANNOTATIONS ── */}
      {/* Left height arrow */}
      <line x1="16" y1="14" x2="16" y2={185 + SHAFT + 12}
        stroke="var(--gold)" strokeWidth="0.7" opacity="0.6" />
      {[14, 185 + SHAFT + 12].map((y, i) => (
        <line key={i} x1="13" y1={y} x2="19" y2={y}
          stroke="var(--gold)" strokeWidth="0.7" opacity="0.6" />
      ))}
      <text x="9" y={(14 + 185 + SHAFT + 12) / 2} textAnchor="middle"
        transform={`rotate(-90 9 ${(14 + 185 + SHAFT + 12) / 2})`}
        style={{ fontSize: 7, fill: "var(--gold)", fontFamily: "monospace" }}>
        13.6m
      </text>

      {/* Width arrow */}
      <line x1={cols[0] - 26} y1="476" x2={cols[3] + 26} y2="476"
        stroke="var(--gold)" strokeWidth="0.7" opacity="0.6" />
      {[cols[0] - 26, cols[3] + 26].map((x, i) => (
        <line key={i} x1={x} y1="473" x2={x} y2="479"
          stroke="var(--gold)" strokeWidth="0.7" opacity="0.6" />
      ))}
      <text x={231} y="487" textAnchor="middle"
        style={{ fontSize: 7, fill: "var(--gold)", fontFamily: "monospace" }}>
        21.4m — BOSH FASAD
      </text>

      {/* Scale bar */}
      <g transform="translate(150, 494)">
        <line x1="0" y1="0" x2="80" y2="0" stroke="var(--stone)" strokeWidth="0.7" />
        {[0, 40, 80].map((x, i) => (
          <line key={i} x1={x} y1="-2.5" x2={x} y2="2.5" stroke="var(--stone)" strokeWidth="0.7" />
        ))}
        <text x="40" y="9" textAnchor="middle"
          style={{ fontSize: 5.5, fill: "var(--stone2)", fontFamily: "monospace" }}>
          0 — 5 — 10m  M1:100
        </text>
      </g>
    </svg>
  )
}

/* ═══════════════════════════════════════
   3D Tilt card — JS mousemove tilt
═══════════════════════════════════════ */
function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current; if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width  / 2
    const cy = rect.top  + rect.height / 2
    const dx = (e.clientX - cx) / (rect.width  / 2)
    const dy = (e.clientY - cy) / (rect.height / 2)
    const rotX = -dy * 10
    const rotY =  dx * 10
    el.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(12px)`
    el.style.setProperty("--mx", `${(dx + 1) / 2 * 100}%`)
    el.style.setProperty("--my", `${(dy + 1) / 2 * 100}%`)
  }
  const onLeave = () => {
    if (ref.current)
      ref.current.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0px)"
  }

  return (
    <div ref={ref} className={`card-3d-tilt ${className}`}
      onMouseMove={onMove} onMouseLeave={onLeave}
      style={{ transition: "transform .12s ease-out", willChange: "transform" }}>
      {children}
    </div>
  )
}

export default function LoginPage() {
  const [mounted,  setMounted]  = useState(false)
  const [email,    setEmail]    = useState("architect@demo.com")
  const [password, setPassword] = useState("admin123")
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const router   = useRouter()
  const { toast } = useToast()

  useEffect(() => { setMounted(true) }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast({ variant: "destructive", title: "Ma'lumotlarni kiriting" }); return
    }
    setLoading(true)
    try {
      const res = await signIn("credentials", { email, password, redirect: false })
      if (res?.error) toast({ variant: "destructive", title: "Email yoki parol noto'g'ri" })
      else { router.push("/dashboard"); router.refresh() }
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex overflow-hidden"
      style={{ opacity: mounted ? 1 : 0, transition: "opacity .5s ease", background: "var(--cream)" }}>

      {/* ══════════ LEFT — Temple drawing ══════════ */}
      <div className="hidden lg:flex lg:w-[56%] relative overflow-hidden flex-col"
        style={{ background: "var(--cream2)", borderRight: "1px solid rgba(200,168,112,.15)" }}>

        {/* ShaderBg as animated background */}
        <div className="absolute inset-0">
          <ShaderBg style={{ width: "100%", height: "100%" }} />
        </div>

        {/* Gold cornice top */}
        <div className="relative z-10" style={{
          height: 3,
          background: "linear-gradient(90deg,transparent,var(--gold),var(--gold2),var(--gold),transparent)"
        }} />

        {/* Frieze band */}
        <div className="relative z-10 frieze-band py-2 px-10">
          <div className="flex items-center gap-2">
            <div style={{ width: 24, height: 1, background: "var(--stone)" }} />
            <span style={{ fontSize: 8, color: "var(--stone2)", letterSpacing: "0.22em",
              fontWeight: 600, textTransform: "uppercase" }}>
              ARXITEKTURA · PROFESSIONAL PLATFORM
            </span>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,var(--stone),transparent)" }} />
          </div>
        </div>

        {/* Main drawing */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-8 py-4">
          <div className="w-full max-w-lg anim-fadeScale d2">
            <DoricTemple />
          </div>
        </div>

        {/* Bottom label */}
        <div className="relative z-10 px-10 pb-8 pt-4"
          style={{ borderTop: "1px solid rgba(200,168,112,.12)" }}>
          <div className="flex items-center gap-3 mb-2">
            <div style={{ width: 20, height: 1, background: "var(--stone)" }} />
            <span style={{ fontSize: 8, color: "var(--stone2)", letterSpacing: "0.2em",
              fontWeight: 600, textTransform: "uppercase" }}>
              Professional Platform
            </span>
          </div>
          <h2 className="text-2xl font-bold anim-fadeLeft"
            style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic",
              color: "var(--ink)", letterSpacing: "-0.02em" }}>
            Arxitektor Kundaligi
          </h2>
          <p className="mt-1 anim-fadeLeft d2"
            style={{ fontSize: 13, color: "var(--stone2)", fontFamily: "'Cormorant Garamond',serif" }}>
            Loyihalar · Kundalik · Moliya · Shartnomalar
          </p>
        </div>
      </div>

      {/* ══════════ RIGHT — Login form ══════════ */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16 relative"
        style={{ background: "var(--white)" }}>

        {/* Subtle dots bg */}
        <div className="absolute inset-0 bg-arch-dots" style={{ opacity: .5 }} />

        {/* Parallax floating shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[
            { x:"10%", y:"15%", s:80,  d:5, shape:"hexagon" },
            { x:"85%", y:"20%", s:50,  d:8, shape:"circle" },
            { x:"15%", y:"75%", s:60,  d:6, shape:"diamond" },
            { x:"80%", y:"70%", s:90,  d:4, shape:"hexagon" },
            { x:"50%", y:"5%",  s:40,  d:7, shape:"circle" },
          ].map((o, i) => (
            <div key={i}
              className="absolute anim-floatSlow"
              style={{
                left: o.x, top: o.y,
                width: o.s, height: o.s,
                animationDelay: `${i * 0.8}s`,
                background: "rgba(200,168,112,.06)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(200,168,112,.12)",
                borderRadius: o.shape === "circle" ? "50%" : o.shape === "diamond" ? "4px" : "12px",
                transform: o.shape === "diamond" ? "rotate(45deg)" : undefined,
              }} />
          ))}
        </div>

        {/* Form card */}
        <div className="relative z-10 w-full max-w-sm">

          {/* Brand */}
          <div className="mb-9 anim-fadeUp">
            {/* Gold cornice line */}
            <div style={{ height: 2, marginBottom: 20,
              background: "linear-gradient(90deg,transparent,var(--gold) 40%,transparent)" }} />

            <div className="flex items-center gap-3 mb-5">
              {/* Column icon */}
              <div className="flex-shrink-0" style={{
                width: 44, height: 44, borderRadius: 5,
                border: "1px solid rgba(200,168,112,.2)",
                background: "var(--cream)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="22" height="30" viewBox="0 0 22 30" fill="none">
                  <rect x="1" y="1" width="20" height="3" fill="var(--ink)" opacity=".85" />
                  <path d="M2 4 Q11 6.5 20 4 L20 9 L2 9 Z"
                    fill="var(--ink)" opacity=".12" stroke="var(--ink)" strokeWidth=".5" />
                  <rect x="5" y="9" width="12" height="16" stroke="var(--ink)" strokeWidth=".9" fill="none" />
                  {[7,9,11,13,15].map(x => (
                    <line key={x} x1={x} y1={9} x2={x - .5} y2={25} stroke="var(--ink)" strokeWidth=".25" opacity=".25" />
                  ))}
                  <rect x="4"  y="25" width="14" height="2.5" fill="var(--ink)" opacity=".8" />
                  <rect x="2"  y="27" width="18" height="2"   fill="var(--ink)" opacity=".9" />
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 800, color: "var(--ink)",
                  letterSpacing: "0.12em", fontFamily: "Inter, sans-serif" }}>
                  ARXITEKTOR KUNDALIGI
                </p>
                <p style={{ fontSize: 10, color: "var(--stone2)",
                  fontFamily: "'Cormorant Garamond', serif" }}>
                  Sarvarbek Mamatov
                </p>
              </div>
            </div>

            <h1 className="font-black leading-none mb-2"
              style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem",
                letterSpacing: "-0.03em", color: "var(--ink)" }}>
              Kirish
            </h1>
            <p style={{ fontSize: 13, color: "var(--stone2)", fontFamily: "'Cormorant Garamond',serif",
              fontSize: "1.05rem" as any }}>
              Hisobingizga xush kelibsiz
            </p>

            {/* Ornament divider */}
            <div className="flex items-center gap-3 mt-4">
              <div style={{ flex:1, height:1, background:"var(--cream3)" }} />
              <svg width="12" height="12" viewBox="0 0 12 12">
                <polygon points="6,1 11,3.5 11,8.5 6,11 1,8.5 1,3.5"
                  stroke="var(--stone)" strokeWidth=".7" fill="none" opacity=".5" />
              </svg>
              <div style={{ flex:1, height:1, background:"var(--cream3)" }} />
            </div>
          </div>

          {/* Form inside 3D tilt card */}
          <TiltCard className="anim-cardIn d1">
            <div className="p-7">
              {/* Inner cornice */}
              <div style={{ height:1.5, marginBottom:20, borderRadius:99,
                background:"linear-gradient(90deg,transparent,rgba(200,168,112,.3),transparent)" }} />
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div className="space-y-1.5">
                  <label style={{ fontSize: 9, fontWeight: 700, color: "var(--stone2)",
                    letterSpacing: "0.16em", textTransform: "uppercase" }}>
                    Email manzil
                  </label>
                  <input
                    type="email" required value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="architect@example.com"
                    className="w-full h-11 px-4 text-sm layer-mid"
                    style={{ background: "var(--cream)", border: "1px solid rgba(200,168,112,.18)",
                      borderRadius: 4, color: "var(--ink)", outline: "none" }}
                    onFocus={e  => { e.target.style.borderColor = "var(--stone2)" }}
                    onBlur={e   => { e.target.style.borderColor = "rgba(200,168,112,.18)" }}
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label style={{ fontSize: 9, fontWeight: 700, color: "var(--stone2)",
                    letterSpacing: "0.16em", textTransform: "uppercase" }}>
                    Parol
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"} required value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-11 px-4 pr-11 text-sm"
                      style={{ background: "var(--cream)", border: "1px solid rgba(200,168,112,.18)",
                        borderRadius: 4, color: "var(--ink)", outline: "none" }}
                      onFocus={e => { e.target.style.borderColor = "var(--stone2)" }}
                      onBlur={e  => { e.target.style.borderColor = "rgba(200,168,112,.18)" }}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--stone)" }}>
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button type="submit" disabled={loading}
                  className="btn-ink w-full h-11 text-sm flex items-center justify-center gap-2 mt-2 layer-front"
                  style={{ borderRadius: 4, opacity: loading ? .7 : 1 }}>
                  {loading
                    ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity=".2" />
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" />
                      </svg>
                    : <><span className="font-semibold tracking-wide">Kirish</span><ArrowRight className="h-4 w-4" /></>
                  }
                </button>
              </form>
            </div>
          </TiltCard>

          {/* Demo */}
          <div className="mt-4 px-4 py-3 rounded anim-fadeUp d5"
            style={{ background: "var(--cream)", border: "1px solid rgba(200,168,112,.15)" }}>
            <p style={{ fontSize: 8, fontWeight: 700, color: "var(--stone)",
              letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 5 }}>
              Demo kirish
            </p>
            <p style={{ fontSize: 11, fontFamily: "monospace", color: "var(--stone2)" }}>
              📧 architect@demo.com
            </p>
            <p style={{ fontSize: 11, fontFamily: "monospace", color: "var(--stone2)", marginTop: 2 }}>
              🔑 admin123
            </p>
          </div>

          <div className="mt-5" style={{ height: 1,
            background: "linear-gradient(90deg,transparent,var(--cream3),transparent)" }} />
        </div>
      </div>
    </div>
  )
}
