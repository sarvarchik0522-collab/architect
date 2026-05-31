"use client"
import { useState, useEffect, useRef } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, ArrowRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

/* ─── Loading Mandala ─── */
function LoadingMandala() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D1A30]"
      style={{ animation: "fade-out 0.6s 1.8s ease forwards" }}>
      <style>{`
        @keyframes fade-out { to { opacity: 0; pointer-events: none; } }
        @keyframes spin-layer { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes spin-r { from{transform:rotate(0deg)} to{transform:rotate(-360deg)} }
        @keyframes pulse-ring { 0%,100%{opacity:.3;transform:scale(.95)} 50%{opacity:.8;transform:scale(1.05)} }
        @keyframes draw { from{stroke-dashoffset:600} to{stroke-dashoffset:0} }
      `}</style>
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Outer ring spinning */}
        <svg className="absolute inset-0 w-full h-full"
          style={{ animation: "spin-layer 4s linear infinite" }}
          viewBox="0 0 200 200">
          <polygon points="100,6 164,38 194,100 164,162 100,194 36,162 6,100 36,38"
            fill="none" stroke="#C9933A" strokeWidth="1.5" strokeDasharray="600"
            style={{ animation: "draw 2s ease forwards" }} />
          {[0,45,90,135,180,225,270,315].map((a, i) => {
            const r = 94, x = 100 + r * Math.cos(a * Math.PI / 180)
            const y = 100 + r * Math.sin(a * Math.PI / 180)
            return <circle key={i} cx={x} cy={y} r="4" fill="#C9933A" opacity="0.7" />
          })}
        </svg>
        {/* Inner ring counter-rotating */}
        <svg className="absolute inset-0 w-full h-full"
          style={{ animation: "spin-r 3s linear infinite" }}
          viewBox="0 0 200 200">
          <polygon points="100,22 148,52 166,100 148,148 100,178 52,148 34,100 52,52"
            fill="none" stroke="#2E8B82" strokeWidth="1" opacity="0.8" />
        </svg>
        {/* Middle star */}
        <svg className="absolute inset-0 w-full h-full"
          style={{ animation: "spin-layer 6s linear infinite" }}
          viewBox="0 0 200 200">
          <polygon points="100,42 120,80 162,80 130,104 144,144 100,122 56,144 70,104 38,80 80,80"
            fill="none" stroke="#C9933A" strokeWidth="1.2" opacity="0.6" />
        </svg>
        {/* Center glow */}
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 rounded-full border-2 border-[#C9933A]/40 flex items-center justify-center"
            style={{ animation: "pulse-ring 1.5s ease-in-out infinite" }}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C9933A] to-[#2E8B82] opacity-80" />
          </div>
        </div>
      </div>
      <p className="absolute bottom-16 text-[#C9933A]/60 text-sm tracking-[0.3em] uppercase font-medium"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}>
        Yuklanmoqda...
      </p>
    </div>
  )
}


/* ─── Registan Arch SVG (left panel) ─── */
function RegistanArch() {
  return (
    <svg viewBox="0 0 480 700" className="w-full h-full" fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="archGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#C9933A" />
          <stop offset="50%" stopColor="#F5D08A" />
          <stop offset="100%" stopColor="#C9933A" />
        </linearGradient>
        <linearGradient id="archTurq" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2E8B82" />
          <stop offset="100%" stopColor="#1A6B64" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Main Grand Arch */}
      <path d="M80 700 L80 290 Q80 80 240 80 Q400 80 400 290 L400 700"
        stroke="url(#archGold)" strokeWidth="2.5" opacity="0.9" filter="url(#glow)" />
      {/* Inner arch */}
      <path d="M120 700 L120 300 Q120 130 240 130 Q360 130 360 300 L360 700"
        stroke="url(#archGold)" strokeWidth="1.5" opacity="0.5" />
      {/* Innermost arch */}
      <path d="M155 700 L155 315 Q155 175 240 175 Q325 175 325 315 L325 700"
        stroke="#2E8B82" strokeWidth="1" opacity="0.4" />

      {/* Keystone */}
      <polygon points="240,66 262,82 240,98 218,82" fill="url(#archGold)" opacity="0.9" />
      <circle cx="240" cy="82" r="8" fill="url(#archGold)" opacity="0.6" />

      {/* 8-sided medallion at arch center */}
      <polygon points="240,190 256,197 262,214 256,231 240,238 224,231 218,214 224,197"
        fill="none" stroke="url(#archGold)" strokeWidth="1.8" opacity="0.85" />
      <polygon points="240,198 252,203 256,214 252,225 240,230 228,225 224,214 228,203"
        fill="none" stroke="#2E8B82" strokeWidth="1" opacity="0.6" />
      <circle cx="240" cy="214" r="12" fill="none" stroke="url(#archGold)" strokeWidth="1" opacity="0.5" />
      <circle cx="240" cy="214" r="5" fill="url(#archGold)" opacity="0.7" />

      {/* Column decorations left */}
      <line x1="80" y1="700" x2="80" y2="460" stroke="url(#archGold)" strokeWidth="4" opacity="0.5" />
      <line x1="80" y1="440" x2="80" y2="400" stroke="url(#archGold)" strokeWidth="4" opacity="0.3" />
      {/* Column decorations right */}
      <line x1="400" y1="700" x2="400" y2="460" stroke="url(#archGold)" strokeWidth="4" opacity="0.5" />
      <line x1="400" y1="440" x2="400" y2="400" stroke="url(#archGold)" strokeWidth="4" opacity="0.3" />

      {/* Horizontal band */}
      <line x1="80" y1="420" x2="400" y2="420" stroke="url(#archGold)" strokeWidth="0.8" opacity="0.3" strokeDasharray="8 4" />
      <line x1="80" y1="440" x2="400" y2="440" stroke="#2E8B82" strokeWidth="0.6" opacity="0.25" strokeDasharray="6 3" />

      {/* Girih mosaic tiles (inside arch area) */}
      {[270, 310, 350, 390, 430, 470, 510, 550, 590, 630].map((y, row) =>
        [-120, -80, -40, 0, 40, 80, 120].map((dx, col) => {
          const x = 240 + dx
          const maxW = row < 3 ? 60 + row * 20 : 140
          if (Math.abs(dx) > maxW) return null
          return (
            <polygon key={`${row}-${col}`}
              points={`${x},${y-14} ${x+12},${y-8} ${x+12},${y+8} ${x},${y+14} ${x-12},${y+8} ${x-12},${y-8}`}
              fill="none" stroke="#C9933A" strokeWidth="0.4" opacity="0.12" />
          )
        })
      )}

      {/* Stars scattered */}
      {[[180, 340],[300, 360],[200, 480],[280, 460],[240, 560],[160, 530],[320, 520]].map(([sx,sy], i) => (
        <g key={i} transform={`translate(${sx},${sy})`}>
          <polygon
            points="0,-10 2.9,-4 9.5,-4 4.4,0.4 6.2,7.6 0,3.6 -6.2,7.6 -4.4,0.4 -9.5,-4 -2.9,-4"
            fill="#C9933A" opacity={0.15 + i * 0.03} />
        </g>
      ))}

      {/* Islimi vine ornament bottom */}
      <path d="M80 620 Q120 600 160 620 Q200 640 240 620 Q280 600 320 620 Q360 640 400 620"
        stroke="url(#archGold)" strokeWidth="1" opacity="0.3" fill="none" />
      <path d="M80 640 Q120 620 160 640 Q200 660 240 640 Q280 620 320 640 Q360 660 400 640"
        stroke="#2E8B82" strokeWidth="0.8" opacity="0.2" fill="none" />
    </svg>
  )
}


/* ─── Floating 3D Hex Ornament ─── */
function FloatingHex({ size = 60, delay = 0, top = "20%", right = "10%", opacity = 0.2 }: {
  size?: number; delay?: number; top?: string; right?: string; opacity?: number
}) {
  return (
    <div className="absolute pointer-events-none animate-float-3d"
      style={{ top, right, width: size, height: size, opacity, animationDelay: `${delay}s` }}>
      <svg viewBox="0 0 60 60" fill="none">
        <polygon points="30,3 57,18 57,42 30,57 3,42 3,18"
          stroke="#C9933A" strokeWidth="1.5" />
        <polygon points="30,11 49,21 49,39 30,49 11,39 11,21"
          stroke="#2E8B82" strokeWidth="1" opacity="0.7" />
        <circle cx="30" cy="30" r="9" stroke="#C9933A" strokeWidth="0.8" opacity="0.6" />
        <circle cx="30" cy="30" r="3" fill="#C9933A" opacity="0.5" />
      </svg>
    </div>
  )
}

/* ─── Main Login Page ─── */
export default function LoginPage() {
  const [mounted,  setMounted]  = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [email,    setEmail]    = useState("architect@demo.com")
  const [password, setPassword] = useState("admin123")
  const [showPass, setShowPass] = useState(false)
  const [tiltX,    setTiltX]   = useState(0)
  const [tiltY,    setTiltY]   = useState(0)
  const heroRef = useRef<HTMLDivElement>(null)
  const router  = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 2000)
    return () => clearTimeout(t)
  }, [])

  // Mouse parallax on left panel
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = heroRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 12
    const y = ((e.clientY - rect.top)  / rect.height - 0.5) * -8
    setTiltX(x); setTiltY(y)
  }
  const handleMouseLeave = () => { setTiltX(0); setTiltY(0) }

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
    <>
      {/* Loading mandala — shows first 2s */}
      {!mounted && <LoadingMandala />}

      <div className="min-h-screen flex bg-[#0D1A30] overflow-hidden"
        style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.8s ease 0.2s" }}>

        {/* ═══ LEFT — Registan Arch Showcase ═══ */}
        <div
          ref={heroRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #0D1A30 0%, #1A2744 40%, #0A1020 100%)",
          }}>

          {/* Deep glow orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full animate-glow"
            style={{ background: "radial-gradient(circle, rgba(201,147,58,0.12), transparent 70%)" }} />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full animate-glow"
            style={{ background: "radial-gradient(circle, rgba(46,139,130,0.1), transparent 70%)", animationDelay: "1.5s" }} />

          {/* Girih bg pattern */}
          <div className="absolute inset-0 bg-girih opacity-100" />

          {/* Floating ornaments */}
          <FloatingHex size={56} delay={0}   top="8%"  right="8%"  opacity={0.25} />
          <FloatingHex size={36} delay={1.5} top="15%" right="25%" opacity={0.15} />
          <FloatingHex size={72} delay={0.8} top="65%" right="4%"  opacity={0.18} />
          <FloatingHex size={44} delay={2.2} top="75%" right="30%" opacity={0.12} />
          {/* Left side */}
          <div className="absolute left-4 top-24 animate-float-3d opacity-15" style={{animationDelay:"0.5s"}}>
            <svg width="48" height="48" viewBox="0 0 48 48">
              <polygon points="24,2 46,14 46,34 24,46 2,34 2,14" stroke="#2E8B82" strokeWidth="1.2" fill="none"/>
              <circle cx="24" cy="24" r="8" stroke="#2E8B82" strokeWidth="0.8" fill="none"/>
            </svg>
          </div>
          <div className="absolute left-12 bottom-32 animate-float-3d opacity-12" style={{animationDelay:"1.8s"}}>
            <svg width="64" height="64" viewBox="0 0 64 64">
              <polygon points="32,4 60,18 60,46 32,60 4,46 4,18" stroke="#C9933A" strokeWidth="1" fill="none"/>
            </svg>
          </div>

          {/* 3D arch with mouse tilt */}
          <div className="relative w-full h-full max-w-lg mx-auto flex items-center justify-center"
            style={{
              transform: `perspective(1200px) rotateY(${tiltX}deg) rotateX(${tiltY}deg)`,
              transition: "transform 0.15s ease-out",
            }}>
            <div className="w-full h-full px-8 py-6" style={{ filter: "drop-shadow(0 0 40px rgba(201,147,58,0.25))" }}>
              <RegistanArch />
            </div>
          </div>

          {/* Bottom text */}
          <div className="absolute bottom-0 left-0 right-0 p-10 bg-gradient-to-t from-[#0D1A30] to-transparent">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#C9933A]/40 to-transparent" />
              <svg width="20" height="20" viewBox="0 0 20 20">
                <polygon points="10,1 19,5.5 19,14.5 10,19 1,14.5 1,5.5" stroke="#C9933A" strokeWidth="1" fill="none" opacity="0.7"/>
              </svg>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#2E8B82]/40 to-transparent" />
            </div>
            <h2 className="text-2xl font-bold text-[#F5ECD7] mb-1"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              Arxitektura San'ati
            </h2>
            <p className="text-[#A89070] text-sm leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Samarqand, Buxoro va Xivaning gözal meʼmoriy an'analari
              ilhomida yaratilgan professional platforma
            </p>
          </div>
        </div>

        {/* ═══ RIGHT — Login Form ═══ */}
        <div className="flex-1 flex items-center justify-center p-8 lg:p-12 relative">
          {/* Subtle pattern */}
          <div className="absolute inset-0 bg-girih opacity-40" />
          <div className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(26,39,68,0.5), transparent 80%)" }} />

          <div className="w-full max-w-sm relative z-10 animate-slide-up">

            {/* Brand mark */}
            <div className="text-center mb-10">
              <div className="flex justify-center mb-5">
                <div className="relative">
                  {/* Glow ring */}
                  <div className="absolute -inset-3 rounded-full animate-pulse-gold opacity-60"
                    style={{ background: "radial-gradient(circle, rgba(201,147,58,0.3), transparent 70%)" }} />
                  {/* Logo */}
                  <div className="relative w-20 h-20 rounded-2xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #1A2744, #243358)", border: "1px solid rgba(201,147,58,0.4)" }}>
                    <svg viewBox="0 0 48 48" width="34" height="34" fill="none">
                      {/* Arch logo */}
                      <polygon points="24,3 45,13 45,35 24,45 3,35 3,13" stroke="#C9933A" strokeWidth="1.5" opacity="0.9"/>
                      <path d="M10 46 L10 26 Q10 10 24 10 Q38 10 38 26 L38 46" stroke="#C9933A" strokeWidth="1.8"/>
                      <path d="M16 46 L16 28 Q16 15 24 15 Q32 15 32 28 L32 46" stroke="#2E8B82" strokeWidth="1"/>
                      <polygon points="24,6 28,10 24,14 20,10" fill="#C9933A" opacity="0.8"/>
                      <circle cx="24" cy="22" r="4" fill="none" stroke="#C9933A" strokeWidth="1" opacity="0.7"/>
                    </svg>
                  </div>
                </div>
              </div>

              <h1 className="text-2xl font-black text-[#F5ECD7] tracking-tight mb-1"
                style={{ fontFamily: "'Playfair Display', serif" }}>
                Arxitektor Kundaligi
              </h1>
              <p className="text-[#A89070] text-sm" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem" }}>
                Sarvarbek Tursunov — Professional Platform
              </p>
            </div>

            {/* Form card */}
            <div className="card-luxury p-7 mb-4">
              {/* Card inner girih overlay */}
              <div className="absolute inset-0 rounded-[20px] bg-girih opacity-30 pointer-events-none" />

              <div className="relative z-10">
                <h2 className="text-lg font-semibold text-[#F5ECD7] mb-1"
                  style={{ fontFamily: "'Playfair Display', serif" }}>
                  Tizimga kirish
                </h2>
                <p className="text-[#A89070] text-xs mb-6" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.9rem" }}>
                  Meʼmoriy ish kundaligingizga xush kelibsiz
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#C9933A] uppercase tracking-[0.2em]">
                      Email manzil
                    </label>
                    <input
                      type="email" required value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="architect@example.com"
                      className="input-luxury w-full h-11 px-4 text-sm outline-none"
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#C9933A] uppercase tracking-[0.2em]">
                      Parol
                    </label>
                    <div className="relative">
                      <input
                        type={showPass ? "text" : "password"} required value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="input-luxury w-full h-11 px-4 pr-11 text-sm outline-none"
                      />
                      <button type="button" onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A89070] hover:text-[#C9933A] transition-colors">
                        {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit */}
                  <button type="submit" disabled={loading}
                    className={cn(
                      "btn-luxury-gold w-full h-12 text-sm flex items-center justify-center gap-2 mt-2",
                      loading && "opacity-60 cursor-not-allowed"
                    )}>
                    {loading ? (
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3"/>
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3"/>
                      </svg>
                    ) : (
                      <><span className="font-bold tracking-wide">Kirish</span> <ArrowRight className="h-4 w-4" /></>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Demo credentials */}
            <div className="rounded-xl p-4 border border-[#C9933A]/15 bg-[#C9933A]/[0.04]">
              <p className="text-[10px] font-bold text-[#C9933A]/70 uppercase tracking-[0.2em] mb-2">
                Demo kirish ma'lumotlari
              </p>
              <p className="text-xs text-[#A89070] font-mono">📧 architect@demo.com</p>
              <p className="text-xs text-[#A89070] font-mono mt-0.5">🔑 admin123</p>
            </div>

            {/* Bottom ornament */}
            <div className="ornament-center mt-6">
              <svg width="16" height="16" viewBox="0 0 16 16">
                <polygon points="8,1 15,4.5 15,11.5 8,15 1,11.5 1,4.5"
                  stroke="#C9933A" strokeWidth="1" fill="none" opacity="0.4"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
