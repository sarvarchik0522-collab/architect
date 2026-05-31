"use client"
import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, ArrowRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

/* ─── Building Elevation SVG ─── */
function BuildingElevation() {
  const floors  = 8
  const cols    = 5
  const fH      = 52   // floor height
  const fW      = 280  // building width
  const wW      = 28   // window width
  const wH      = 22   // window height
  const wGapX   = (fW - cols * wW) / (cols + 1)
  const totalH  = floors * fH + 60 // + foundation

  return (
    <svg
      viewBox={`0 0 ${fW + 120} ${totalH + 40}`}
      className="w-full h-full"
      fill="none"
      style={{ maxHeight: "100%" }}
    >
      {/* Grid bg lines */}
      {Array.from({ length: 20 }, (_, i) => (
        <line key={`v${i}`} x1={i * 20} y1="0" x2={i * 20} y2={totalH + 40}
          stroke="rgba(255,255,255,0.025)" strokeWidth="0.5" />
      ))}
      {Array.from({ length: 30 }, (_, i) => (
        <line key={`h${i}`} x1="0" y1={i * 20} x2={fW + 120} y2={i * 20}
          stroke="rgba(255,255,255,0.025)" strokeWidth="0.5" />
      ))}

      {/* Structural axis labels A–E */}
      {Array.from({ length: cols }, (_, c) => {
        const x = 60 + wGapX + c * (wW + wGapX) + wW / 2
        return (
          <g key={`axis${c}`}>
            <circle cx={x} cy={8} r={7} stroke="#2a2a2a" strokeWidth="0.8" fill="none" className="draw-path"/>
            <text x={x} y={12} textAnchor="middle"
              style={{ fontSize: 7, fill: "#444", fontFamily: "monospace", letterSpacing: "0.05em" }}>
              {String.fromCharCode(65 + c)}
            </text>
            <line x1={x} y1={16} x2={x} y2={totalH + 20}
              stroke="#1a1a1a" strokeWidth="0.6" strokeDasharray="4 3"/>
          </g>
        )
      })}

      {/* Building outline */}
      <rect
        x={60} y={20} width={fW} height={floors * fH}
        stroke="#333" strokeWidth="1.2" fill="none"
        className="draw-path"
      />

      {/* Floor lines + labels */}
      {Array.from({ length: floors }, (_, f) => {
        const y = 20 + f * fH
        const floorNum = floors - f
        return (
          <g key={`fl${f}`}>
            {/* Floor separator */}
            {f > 0 && (
              <line x1={60} y1={y} x2={60 + fW} y2={y}
                stroke="#222" strokeWidth="0.7" />
            )}
            {/* Floor label left */}
            <text x={52} y={y + fH / 2 + 3} textAnchor="end"
              style={{ fontSize: 7, fill: "#444", fontFamily: "monospace" }}>
              {floorNum}F
            </text>
            {/* Dimension arrow left */}
            <line x1={40} y1={y} x2={40} y2={y + fH}
              stroke="#2a2a2a" strokeWidth="0.7" />
            <line x1={37} y1={y} x2={43} y2={y} stroke="#2a2a2a" strokeWidth="0.7"/>
            <line x1={37} y1={y + fH} x2={43} y2={y + fH} stroke="#2a2a2a" strokeWidth="0.7"/>
            <text x={36} y={y + fH / 2 + 3} textAnchor="end"
              style={{ fontSize: 6, fill: "#333", fontFamily: "monospace" }}>
              3.2m
            </text>

            {/* Windows */}
            {Array.from({ length: cols }, (_, c) => {
              const wx = 60 + wGapX + c * (wW + wGapX)
              const wy = y + (fH - wH) / 2
              // Ground floor: entrance arch instead of windows
              if (f === floors - 1 && c === 2) {
                return (
                  <g key={`w${f}-${c}`}>
                    <path d={`M${wx} ${y + fH} L${wx} ${wy + 4} Q${wx + wW / 2} ${wy - 4} ${wx + wW} ${wy + 4} L${wx + wW} ${y + fH}`}
                      stroke="#333" strokeWidth="0.9" fill="none"/>
                  </g>
                )
              }
              return (
                <rect key={`w${f}-${c}`}
                  x={wx} y={wy} width={wW} height={wH}
                  stroke="#2a2a2a" strokeWidth="0.8" fill="rgba(255,255,255,0.02)"
                />
              )
            })}
          </g>
        )
      })}

      {/* Parapet / roofline */}
      <rect x={60} y={14} width={fW} height={6}
        stroke="#333" strokeWidth="0.8" fill="none" />
      <line x1={60} y1={14} x2={60 + fW} y2={14} stroke="#333" strokeWidth="1"/>

      {/* Foundation */}
      <rect x={55} y={20 + floors * fH} width={fW + 10} height={8}
        stroke="#2a2a2a" strokeWidth="0.8" fill="none"/>
      <rect x={50} y={20 + floors * fH + 8} width={fW + 20} height={4}
        stroke="#222" strokeWidth="0.7" fill="none"/>

      {/* Total height dimension - right side */}
      <line x1={60 + fW + 12} y1={20} x2={60 + fW + 12} y2={20 + floors * fH}
        stroke="#2a2a2a" strokeWidth="0.7"/>
      <line x1={60 + fW + 9} y1={20} x2={60 + fW + 15} y2={20}
        stroke="#2a2a2a" strokeWidth="0.7"/>
      <line x1={60 + fW + 9} y1={20 + floors * fH} x2={60 + fW + 15} y2={20 + floors * fH}
        stroke="#2a2a2a" strokeWidth="0.7"/>
      <text x={60 + fW + 20} y={20 + floors * fH / 2 + 3} textAnchor="start"
        style={{ fontSize: 6.5, fill: "#444", fontFamily: "monospace" }}>
        25.6m
      </text>

      {/* Section marks */}
      {[80, 60 + fW - 20].map((x, i) => (
        <g key={`s${i}`}>
          <circle cx={x} cy={22} r={5} stroke="#2a2a2a" strokeWidth="0.7" fill="none"/>
          <line cx={x} cy={22} x1={x - 3.5} y1={22} x2={x + 3.5} y2={22} stroke="#2a2a2a" strokeWidth="0.7"/>
          <text x={x} y={24.5} textAnchor="middle"
            style={{ fontSize: 5, fill: "#333", fontFamily: "monospace" }}>
            S{i + 1}
          </text>
        </g>
      ))}

      {/* Ground line */}
      <line x1={40} y1={20 + floors * fH + 12} x2={60 + fW + 30} y2={20 + floors * fH + 12}
        stroke="#333" strokeWidth="0.8"/>

      {/* Scale bar */}
      <g>
        <line x1={65} y1={totalH + 30} x2={65 + 50} y2={totalH + 30}
          stroke="#333" strokeWidth="0.8"/>
        <line x1={65} y1={totalH + 27} x2={65} y2={totalH + 33} stroke="#333" strokeWidth="0.8"/>
        <line x1={65 + 50} y1={totalH + 27} x2={65 + 50} y2={totalH + 33} stroke="#333" strokeWidth="0.8"/>
        <line x1={65 + 25} y1={totalH + 28} x2={65 + 25} y2={totalH + 32} stroke="#2a2a2a" strokeWidth="0.7"/>
        <text x={65 + 25} y={totalH + 38} textAnchor="middle"
          style={{ fontSize: 6, fill: "#444", fontFamily: "monospace" }}>
          0——5——10m
        </text>
      </g>

      {/* Title block bottom */}
      <rect x={60 + fW - 80} y={totalH + 18} width={80} height={18}
        stroke="#1e1e1e" strokeWidth="0.7" fill="none"/>
      <text x={60 + fW - 40} y={totalH + 29} textAnchor="middle"
        style={{ fontSize: 6, fill: "#555", fontFamily: "monospace", letterSpacing: "0.08em" }}>
        FASAD — M 1:100
      </text>
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
    if (!email || !password) {
      toast({ variant: "destructive", title: "Ma'lumotlarni kiriting" })
      return
    }
    setLoading(true)
    try {
      const res = await signIn("credentials", { email, password, redirect: false })
      if (res?.error) {
        toast({ variant: "destructive", title: "Email yoki parol noto'g'ri" })
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } finally { setLoading(false) }
  }

  return (
    <div
      className="min-h-screen flex overflow-hidden"
      style={{
        opacity: mounted ? 1 : 0,
        transition: "opacity 0.4s ease",
        background: "#080808",
      }}
    >
      {/* ════ LEFT PANEL — Building drawing ════ */}
      <div
        className="hidden lg:flex lg:w-[56%] relative overflow-hidden flex-col items-center justify-center"
        style={{ background: "#0a0a0a", borderRight: "1px solid #1a1a1a" }}
      >
        {/* Grid bg */}
        <div className="absolute inset-0 bg-arch-grid" style={{ opacity: 0.8 }} />

        {/* Building SVG */}
        <div className="relative z-10 w-full h-full flex items-center justify-center px-12 py-8">
          <BuildingElevation />
        </div>

        {/* Bottom label */}
        <div
          className="absolute bottom-0 left-0 right-0 px-10 py-8"
          style={{ background: "linear-gradient(to top, #080808 40%, transparent)" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div style={{ height: 1, width: 32, background: "#2a2a2a" }} />
            <span style={{ fontSize: 9, color: "#333", letterSpacing: "0.22em", fontWeight: 600 }}>
              ARXITEKTURA
            </span>
          </div>
          <h2
            className="text-2xl font-black tracking-tight"
            style={{ color: "#f0f0f0", letterSpacing: "-0.04em" }}
          >
            Professional Platform
          </h2>
          <p className="mt-1" style={{ fontSize: 13, color: "#444" }}>
            Loyihalar · Kundalik · Moliya · CRM
          </p>
        </div>
      </div>

      {/* ════ RIGHT PANEL — Login form ════ */}
      <div
        className="flex-1 flex items-center justify-center p-8 lg:p-16 relative"
        style={{ background: "#080808" }}
      >
        {/* Dot grid */}
        <div className="absolute inset-0 bg-dot-grid" style={{ opacity: 0.6 }} />

        <div className="relative z-10 w-full max-w-sm animate-slide-up">

          {/* Logo */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              {/* Arch icon */}
              <div
                className="h-11 w-11 rounded flex items-center justify-center flex-shrink-0"
                style={{ background: "#111", border: "1px solid #222" }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M3 22 L3 12 Q3 3 12 3 Q21 3 21 12 L21 22"
                    stroke="#fff" strokeWidth="1.2" strokeLinecap="round"/>
                  <path d="M6 22 L6 13 Q6 6 12 6 Q18 6 18 13 L18 22"
                    stroke="#555" strokeWidth="0.8"/>
                  <rect x="10" y="1.5" width="4" height="3" fill="#fff" opacity="0.5"/>
                  {[8, 13, 17].map(x => (
                    <rect key={x} x={x} y="14" width="2" height="2.5"
                      stroke="#333" strokeWidth="0.7" fill="none"/>
                  ))}
                </svg>
              </div>
              <div>
                <p className="text-sm font-black tracking-tight" style={{ color: "#f0f0f0" }}>
                  ARXITEKTOR KUNDALIGI
                </p>
                <p className="text-xs" style={{ color: "#444" }}>
                  Sarvarbek Tursunov
                </p>
              </div>
            </div>
            <div style={{ height: 1, background: "#161616", marginBottom: 28 }} />
            <h1 className="text-2xl font-black tracking-tight mb-1.5" style={{ color: "#f0f0f0" }}>
              Kirish
            </h1>
            <p className="text-sm" style={{ color: "#444" }}>
              Hisobingizga kiring
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.15em]"
                style={{ color: "#555" }}>
                Email manzil
              </label>
              <input
                type="email" required value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="architect@example.com"
                className="w-full h-11 px-4 text-sm"
                style={{
                  background: "#0d0d0d",
                  border: "1px solid #222",
                  borderRadius: 5,
                  color: "#f0f0f0",
                  outline: "none",
                  fontFamily: "Inter, sans-serif",
                }}
                onFocus={e => { e.target.style.borderColor = "#555" }}
                onBlur={e => { e.target.style.borderColor = "#222" }}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.15em]"
                style={{ color: "#555" }}>
                Parol
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"} required value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 px-4 pr-11 text-sm"
                  style={{
                    background: "#0d0d0d",
                    border: "1px solid #222",
                    borderRadius: 5,
                    color: "#f0f0f0",
                    outline: "none",
                    fontFamily: "Inter, sans-serif",
                  }}
                  onFocus={e => { e.target.style.borderColor = "#555" }}
                  onBlur={e => { e.target.style.borderColor = "#222" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "#333" }}
                >
                  {showPass
                    ? <EyeOff className="h-4 w-4" />
                    : <Eye className="h-4 w-4" />
                  }
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-11 text-sm flex items-center justify-center gap-2 mt-2"
              style={{ borderRadius: 5, opacity: loading ? 0.6 : 1 }}
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3"/>
                </svg>
              ) : (
                <><span className="font-bold">Kirish</span><ArrowRight className="h-4 w-4"/></>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div
            className="mt-5 p-4 rounded"
            style={{ background: "#0d0d0d", border: "1px solid #1a1a1a" }}
          >
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] mb-2"
              style={{ color: "#333" }}>
              Demo
            </p>
            <p className="text-xs font-mono" style={{ color: "#444" }}>
              📧 architect@demo.com
            </p>
            <p className="text-xs font-mono mt-0.5" style={{ color: "#444" }}>
              🔑 admin123
            </p>
          </div>

          {/* Bottom mark */}
          <div className="mt-6 flex items-center gap-3">
            <div style={{ height: 1, flex: 1, background: "#111" }} />
            <span style={{ fontSize: 8, color: "#222", letterSpacing: "0.2em" }}>ARCH·2025</span>
            <div style={{ height: 1, flex: 1, background: "#111" }} />
          </div>
        </div>
      </div>
    </div>
  )
}
