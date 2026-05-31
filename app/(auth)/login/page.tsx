"use client"
import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, ArrowRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

/* ═══ Doric Temple Facade SVG ═══ */
function TempleFacade() {
  const cols = [100, 195, 305, 400]
  const SHAFT_H = 210
  return (
    <svg viewBox="0 0 500 480" fill="none" className="w-full h-full">
      {/* Subtle bg grid */}
      {Array.from({length:26},(_,i)=>(
        <line key={`v${i}`} x1={i*20} y1="0" x2={i*20} y2="480" stroke="#1C1B18" strokeWidth="0.3" opacity="0.06"/>
      ))}
      {Array.from({length:24},(_,i)=>(
        <line key={`h${i}`} x1="0" y1={i*20} x2="500" y2={i*20} stroke="#1C1B18" strokeWidth="0.3" opacity="0.06"/>
      ))}

      {/* ── PEDIMENT (triangle) ── */}
      <path d="M50 110 L250 20 L450 110" stroke="#1C1B18" strokeWidth="1.8" className="draw-path"/>
      {/* Raking cornice lines */}
      <path d="M56 116 L250 28 L444 116" stroke="#C8C2B8" strokeWidth="0.7" opacity="0.6"/>
      {/* Tympanum (pediment fill area) */}
      <path d="M58 112 L250 24 L442 112 Z" fill="#1C1B18" opacity="0.02"/>
      {/* Acroterion at apex */}
      <polygon points="250,12 256,22 244,22" fill="#1C1B18" opacity="0.7"/>
      <polygon points="52,108 60,114 44,114" fill="#1C1B18" opacity="0.5"/>
      <polygon points="448,108 456,114 440,114" fill="#1C1B18" opacity="0.5"/>

      {/* ── ENTABLATURE ── */}
      {/* Cornice */}
      <line x1="40" y1="110" x2="460" y2="110" stroke="#1C1B18" strokeWidth="2"/>
      <line x1="44" y1="114" x2="456" y2="114" stroke="#1C1B18" strokeWidth="1.2"/>
      <line x1="48" y1="118" x2="452" y2="118" stroke="#C8C2B8" strokeWidth="0.7"/>

      {/* Frieze with triglyphs */}
      <rect x="48" y="118" width="404" height="36" stroke="#1C1B18" strokeWidth="0.8" fill="none"/>
      {/* Triglyphs */}
      {[60,110,160,210,260,310,360,410].map((x,i)=>(
        <g key={i}>
          <rect x={x} y={118} width={14} height={36} fill="#1C1B18" opacity="0.07"/>
          <line x1={x+4} y1={118} x2={x+4} y2={154} stroke="#1C1B18" strokeWidth="1" opacity="0.5"/>
          <line x1={x+7} y1={118} x2={x+7} y2={154} stroke="#1C1B18" strokeWidth="1" opacity="0.5"/>
          <line x1={x+10} y1={118} x2={x+10} y2={154} stroke="#1C1B18" strokeWidth="1" opacity="0.5"/>
          <rect x={x} y={150} width={14} height={4} fill="#1C1B18" opacity="0.2"/>
        </g>
      ))}
      {/* Metopes (decorative squares between triglyphs) */}
      {[74,124,174,224,274,324,374].map((x,i)=>(
        <g key={i}>
          <rect x={x} y={122} width={36} height={28} stroke="#C8C2B8" strokeWidth="0.5" fill="none"/>
          {/* Simple rosette in metope */}
          <circle cx={x+18} cy={136} r={6} stroke="#C8C2B8" strokeWidth="0.5" fill="none"/>
          <circle cx={x+18} cy={136} r={2} fill="#C8C2B8" opacity="0.5"/>
        </g>
      ))}
      {/* Architrave */}
      <rect x="48" y="154" width="404" height="16" stroke="#1C1B18" strokeWidth="0.8" fill="#1C1B18" fillOpacity="0.03"/>
      <line x1="48" y1="162" x2="452" y2="162" stroke="#C8C2B8" strokeWidth="0.4"/>
      <line x1="48" y1="154" x2="452" y2="154" stroke="#1C1B18" strokeWidth="1.2"/>

      {/* ── 4 DORIC COLUMNS ── */}
      {cols.map((cx,i)=>(
        <g key={i}>
          {/* Capital – Abacus */}
          <rect x={cx-24} y={170} width={48} height={5} fill="#1C1B18" opacity="0.85"/>
          {/* Capital – Echinus (curved) */}
          <path d={`M${cx-20} 175 Q${cx} 180 ${cx+20} 175 L${cx+20} 182 L${cx-20} 182 Z`}
            fill="#1C1B18" opacity="0.15" stroke="#1C1B18" strokeWidth="0.6"/>
          <rect x={cx-20} y={175} width={40} height={7} stroke="#1C1B18" strokeWidth="0.7" fill="none" opacity="0.4"/>
          {/* Neck */}
          <rect x={cx-18} y={182} width={36} height={4} stroke="#1C1B18" strokeWidth="0.5" fill="none" opacity="0.3"/>

          {/* Shaft outline */}
          <path d={`M${cx-16} 186 L${cx-14} ${186+SHAFT_H} L${cx+14} ${186+SHAFT_H} L${cx+16} 186 Z`}
            stroke="#1C1B18" strokeWidth="1" fill="none"/>
          {/* Entasis (slight curve on shaft - simulated) */}
          <path d={`M${cx-16} 186 Q${cx-15} ${186+SHAFT_H/2} ${cx-14} ${186+SHAFT_H}`}
            stroke="#C8C2B8" strokeWidth="0.4"/>
          <path d={`M${cx+16} 186 Q${cx+15} ${186+SHAFT_H/2} ${cx+14} ${186+SHAFT_H}`}
            stroke="#C8C2B8" strokeWidth="0.4"/>
          {/* Fluting lines */}
          {[-10,-7,-4,-1,2,5,8].map((dx,j)=>(
            <line key={j}
              x1={cx+dx} y1={186}
              x2={cx+dx*0.87} y2={186+SHAFT_H}
              stroke="#1C1B18" strokeWidth="0.3" opacity="0.25"/>
          ))}

          {/* Base – Torus/Scotia */}
          <ellipse cx={cx} cy={186+SHAFT_H} rx={16} ry={2} stroke="#1C1B18" strokeWidth="0.5" fill="none" opacity="0.3"/>
          <rect x={cx-18} y={186+SHAFT_H} width={36} height={4} stroke="#1C1B18" strokeWidth="0.7" fill="none"/>
          <rect x={cx-22} y={186+SHAFT_H+4} width={44} height={3} stroke="#1C1B18" strokeWidth="0.7" fill="none"/>
          <rect x={cx-24} y={186+SHAFT_H+7} width={48} height={5} fill="#1C1B18" opacity="0.8"/>
        </g>
      ))}

      {/* ── STYLOBATE (steps) ── */}
      <rect x="28"  y={186+SHAFT_H+12} width={444} height={10} stroke="#1C1B18" strokeWidth="1.2" fill="none"/>
      <rect x="16"  y={186+SHAFT_H+22} width={468} height={10} stroke="#1C1B18" strokeWidth="1"   fill="none"/>
      <rect x="4"   y={186+SHAFT_H+32} width={492} height={10} stroke="#1C1B18" strokeWidth="0.8" fill="none"/>

      {/* ── DIMENSION ANNOTATIONS ── */}
      {/* Left height */}
      <line x1="12" y1="20" x2="12" y2={186+SHAFT_H+12} stroke="#B8965A" strokeWidth="0.6"/>
      <line x1="9"  y1="20" x2="15" y2="20" stroke="#B8965A" strokeWidth="0.6"/>
      <line x1="9"  y1={186+SHAFT_H+12} x2="15" y2={186+SHAFT_H+12} stroke="#B8965A" strokeWidth="0.6"/>
      <text x="6" y={100} textAnchor="middle" transform={`rotate(-90 6 100)`}
        style={{ fontSize: 7, fill: "#B8965A", fontFamily: "monospace" }}>12.8m</text>

      {/* Column width */}
      <line x1={cols[0]-24} y1="465" x2={cols[3]+24} y2="465" stroke="#B8965A" strokeWidth="0.6"/>
      {[cols[0]-24, cols[3]+24].map((x,i)=>(
        <line key={i} x1={x} y1="462" x2={x} y2="468" stroke="#B8965A" strokeWidth="0.6"/>
      ))}
      <text x={250} y="474" textAnchor="middle"
        style={{ fontSize: 7, fill: "#B8965A", fontFamily: "monospace" }}>
        20.0m — FASAD
      </text>

      {/* Axis labels */}
      {cols.map((cx,i)=>(
        <g key={i}>
          <circle cx={cx} cy={186+SHAFT_H+50} r={6} stroke="#C8C2B8" strokeWidth="0.7" fill="none"/>
          <text x={cx} y={186+SHAFT_H+53.5} textAnchor="middle"
            style={{ fontSize: 6, fill: "#9A968E", fontFamily: "monospace" }}>
            {String.fromCharCode(65+i)}
          </text>
        </g>
      ))}
      {/* Axis lines */}
      {cols.map((cx,i)=>(
        <line key={i} x1={cx} y1="170" x2={cx} y2={186+SHAFT_H+44}
          stroke="#E2DDD5" strokeWidth="0.5" strokeDasharray="4 3"/>
      ))}

      {/* ── Scale bar ── */}
      <g transform="translate(180, 472)">
        <line x1="0" y1="0" x2="60" y2="0" stroke="#C8C2B8" strokeWidth="0.8"/>
        <line x1="0" y1="-3" x2="0"  y2="3" stroke="#C8C2B8" strokeWidth="0.8"/>
        <line x1="30" y1="-2" x2="30" y2="2" stroke="#C8C2B8" strokeWidth="0.7"/>
        <line x1="60" y1="-3" x2="60" y2="3" stroke="#C8C2B8" strokeWidth="0.8"/>
        <text x="30" y="8" textAnchor="middle"
          style={{ fontSize: 6, fill: "#9A968E", fontFamily: "monospace" }}>0——5——10m</text>
      </g>
    </svg>
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
    if (!email || !password) { toast({ variant:"destructive", title:"Ma'lumotlarni kiriting" }); return }
    setLoading(true)
    try {
      const res = await signIn("credentials", { email, password, redirect: false })
      if (res?.error) toast({ variant:"destructive", title:"Email yoki parol noto'g'ri" })
      else { router.push("/dashboard"); router.refresh() }
    } finally { setLoading(false) }
  }

  return (
    <div
      className="min-h-screen flex"
      style={{
        opacity: mounted ? 1 : 0,
        transition: "opacity 0.5s ease",
        background: "#F7F5F0",
      }}
    >
      {/* ══ LEFT: Temple Facade ══ */}
      <div
        className="hidden lg:flex lg:w-[56%] relative overflow-hidden flex-col"
        style={{ background: "#F2F0EB", borderRight: "1px solid #E2DDD5" }}
      >
        {/* Fine grid bg */}
        <div className="absolute inset-0 bg-neo-grid" style={{ opacity: 0.6 }} />

        {/* Subtle top gold line */}
        <div style={{ height: 2, background: "linear-gradient(90deg,transparent,#B8965A,transparent)" }} />

        {/* Temple drawing */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-10 py-8">
          <TempleFacade />
        </div>

        {/* Bottom label */}
        <div
          className="relative z-10 px-12 py-8"
          style={{ borderTop: "1px solid #E2DDD5" }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div style={{ height: 1, width: 24, background: "#C8C2B8" }} />
            <span style={{ fontSize: 8, color: "#9A968E", letterSpacing: "0.22em", fontWeight: 600, textTransform: "uppercase" }}>
              Professional Platform
            </span>
          </div>
          <h2
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", color: "#1C1B18" }}
          >
            Arxitektor Kundaligi
          </h2>
          <p className="mt-1" style={{ fontSize: 13, color: "#9A968E" }}>
            Loyihalar · Kundalik · Moliya · CRM
          </p>
        </div>
      </div>

      {/* ══ RIGHT: Login form ══ */}
      <div
        className="flex-1 flex items-center justify-center p-8 lg:p-16 relative"
        style={{ background: "#FFFFFF" }}
      >
        {/* Dot grid */}
        <div className="absolute inset-0 bg-neo-dots" style={{ opacity: 0.6 }} />

        <div className="relative z-10 w-full max-w-sm animate-slide-up">

          {/* Gold cornice top */}
          <div className="mb-8">
            <div style={{ height: 2, background: "linear-gradient(90deg,transparent,#B8965A 50%,transparent)", marginBottom: 20 }} />
            <div className="flex items-center gap-3 mb-5">
              <div
                className="h-11 w-11 rounded flex items-center justify-center flex-shrink-0"
                style={{ border: "1px solid #E2DDD5", background: "#F7F5F0" }}
              >
                <svg width="24" height="24" viewBox="0 0 32 36" fill="none">
                  <rect x="2" y="4" width="28" height="3" fill="#1C1B18" opacity="0.9"/>
                  <path d="M5 7 Q16 9 27 7 L27 10 L5 10 Z" fill="#1C1B18" opacity="0.7"/>
                  <rect x="9" y="10" width="14" height="18" stroke="#1C1B18" strokeWidth="1.2"/>
                  {[11,13,15,17,19,21].map(x=>(
                    <line key={x} x1={x} y1={10} x2={x} y2={28} stroke="#1C1B18" strokeWidth="0.4" opacity="0.3"/>
                  ))}
                  <rect x="7"  y="28" width="18" height="2.5" fill="#1C1B18" opacity="0.8"/>
                  <rect x="4"  y="30" width="24" height="2"   fill="#1C1B18" opacity="0.6"/>
                  <rect x="2"  y="32" width="28" height="2.5" fill="#1C1B18" opacity="0.9"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-black tracking-tight" style={{ color: "#1C1B18", fontFamily: "'Playfair Display', serif" }}>
                  ARXITEKTOR KUNDALIGI
                </p>
                <p className="text-xs" style={{ color: "#9A968E" }}>
                  Sarvarbek Mamatov
                </p>
              </div>
            </div>

            <h1 className="text-2xl font-black tracking-tight mb-1.5"
              style={{ color: "#1C1B18", fontFamily: "'Playfair Display', serif" }}>
              Kirish
            </h1>
            <p className="text-sm" style={{ color: "#9A968E" }}>Hisobingizga kiring</p>

            {/* Decorative divider */}
            <div className="mt-4 flex items-center gap-2">
              <div style={{ flex: 1, height: 1, background: "#E2DDD5" }} />
              <svg width="12" height="12" viewBox="0 0 12 12">
                <polygon points="6,1 11,3.5 11,8.5 6,11 1,8.5 1,3.5"
                  stroke="#C8C2B8" strokeWidth="0.8" fill="none"/>
              </svg>
              <div style={{ flex: 1, height: 1, background: "#E2DDD5" }} />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.14em]"
                style={{ color: "#9A968E" }}>
                Email manzil
              </label>
              <input
                type="email" required value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="architect@example.com"
                className="w-full h-11 px-4 text-sm"
                style={{
                  background: "#FAFAF8",
                  border: "1px solid #D8D3CB",
                  borderRadius: 3,
                  color: "#1C1B18",
                  outline: "none",
                }}
                onFocus={e => { e.target.style.borderColor = "#9A968E" }}
                onBlur={e => { e.target.style.borderColor = "#D8D3CB" }}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.14em]"
                style={{ color: "#9A968E" }}>
                Parol
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"} required value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 px-4 pr-11 text-sm"
                  style={{
                    background: "#FAFAF8",
                    border: "1px solid #D8D3CB",
                    borderRadius: 3,
                    color: "#1C1B18",
                    outline: "none",
                  }}
                  onFocus={e => { e.target.style.borderColor = "#9A968E" }}
                  onBlur={e => { e.target.style.borderColor = "#D8D3CB" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#C8C2B8" }}
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-neo-dark w-full h-11 text-sm flex items-center justify-center gap-2 mt-2"
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3"/>
                </svg>
              ) : (
                <><span className="font-semibold tracking-wide">Kirish</span><ArrowRight className="h-4 w-4"/></>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-5 p-4 rounded" style={{ background: "#F7F5F0", border: "1px solid #E2DDD5" }}>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] mb-2" style={{ color: "#C8C2B8" }}>
              Demo
            </p>
            <p className="text-xs font-mono" style={{ color: "#9A968E" }}>📧 architect@demo.com</p>
            <p className="text-xs font-mono mt-0.5" style={{ color: "#9A968E" }}>🔑 admin123</p>
          </div>

          {/* Bottom ornament */}
          <div className="mt-6">
            <div style={{ height: 1, background: "linear-gradient(90deg,transparent,#C8C2B8,transparent)" }} />
          </div>
        </div>
      </div>
    </div>
  )
}
