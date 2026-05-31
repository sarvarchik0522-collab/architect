"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

// Arch SVG decorations
const ArchDecor = () => (
  <svg viewBox="0 0 400 600" className="w-full h-full" fill="none">
    {/* Grand arch */}
    <path d="M60 580 L60 220 Q60 80 200 80 Q340 80 340 220 L340 580" stroke="#DAA520" strokeWidth="2" fill="none" opacity="0.6"/>
    {/* Inner arch */}
    <path d="M100 580 L100 230 Q100 120 200 120 Q300 120 300 230 L300 580" stroke="#B8860B" strokeWidth="1" fill="none" opacity="0.4"/>
    {/* Keystone */}
    <polygon points="200,72 220,95 200,105 180,95" fill="#DAA520" opacity="0.5"/>
    {/* 8-sided medallion */}
    <polygon points="200,160 218,168 226,186 218,204 200,212 182,204 174,186 182,168" fill="none" stroke="#DAA520" strokeWidth="1.5" opacity="0.7"/>
    <circle cx="200" cy="186" r="14" fill="none" stroke="#DAA520" strokeWidth="1" opacity="0.5"/>
    <circle cx="200" cy="186" r="6" fill="#DAA520" opacity="0.4"/>
    {/* Column lines */}
    <line x1="60" y1="580" x2="60" y2="420" stroke="#B8860B" strokeWidth="3" opacity="0.4"/>
    <line x1="340" y1="580" x2="340" y2="420" stroke="#B8860B" strokeWidth="3" opacity="0.4"/>
    {/* Decorative bands */}
    <line x1="60" y1="400" x2="340" y2="400" stroke="#DAA520" strokeWidth="0.8" strokeDasharray="6 3" opacity="0.35"/>
    <line x1="60" y1="420" x2="340" y2="420" stroke="#DAA520" strokeWidth="0.8" strokeDasharray="6 3" opacity="0.35"/>
    {/* Grid pattern */}
    {[0,1,2,3,4,5].map(i => (
      <line key={i} x1={80+i*50} y1="440" x2={80+i*50} y2="580" stroke="#B8860B" strokeWidth="0.4" opacity="0.2"/>
    ))}
    {[0,1,2,3].map(i => (
      <line key={i} x1="60" y1={460+i*40} x2="340" y2={460+i*40} stroke="#B8860B" strokeWidth="0.4" opacity="0.2"/>
    ))}
    {/* Stars */}
    {[[130,300],[270,300],[160,350],[240,350],[200,380]].map(([x,y],i) => (
      <polygon key={i} points={`${x},${y-8} ${x+2},${y-3} ${x+8},${y-3} ${x+3},${y+1} ${x+5},${y+7} ${x},${y+3} ${x-5},${y+7} ${x-3},${y+1} ${x-8},${y-3} ${x-2},${y-3}`}
        fill="#DAA520" opacity="0.4"/>
    ))}
  </svg>
)

export default function LoginPage() {
  const [email, setEmail] = useState("architect@demo.com")
  const [password, setPassword] = useState("admin123")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return toast({ variant:"destructive", title:"Email va parol kiriting" })
    setLoading(true)
    try {
      const res = await signIn("credentials", { email, password, redirect: false })
      if (res?.error) toast({ variant:"destructive", title:"Email yoki parol noto'g'ri" })
      else { router.push("/dashboard"); router.refresh() }
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex bg-[#0A1628]">
      {/* LEFT — Architecture showcase */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col">
        {/* Deep gradient bg */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A1628] via-[#0e2040] to-[#1a0a00]"/>
        {/* Subtle texture */}
        <div className="absolute inset-0 opacity-[0.06]"
          style={{backgroundImage:`url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23DAA520' stroke-width='0.5'%3E%3Cpolygon points='30,3 57,18 57,42 30,57 3,42 3,18'/%3E%3Cpolygon points='30,11 49,21 49,39 30,49 11,39 11,21'/%3E%3Ccircle cx='30' cy='30' r='11'/%3E%3C/g%3E%3C/svg%3E")`}}/>
        {/* Arch illustration */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-80 h-[480px] opacity-70">
            <ArchDecor />
          </div>
        </div>
        {/* Floating 8-sided shapes */}
        <div className="absolute top-16 left-16 animate-float opacity-30">
          <svg width="60" height="60" viewBox="0 0 60 60">
            <polygon points="30,3 57,18 57,42 30,57 3,42 3,18" fill="none" stroke="#DAA520" strokeWidth="1.5"/>
            <circle cx="30" cy="30" r="10" fill="none" stroke="#DAA520" strokeWidth="1"/>
          </svg>
        </div>
        <div className="absolute top-32 right-12 animate-float-slow opacity-25">
          <svg width="48" height="48" viewBox="0 0 48 48">
            <polygon points="24,2 46,14 46,34 24,46 2,34 2,14" fill="none" stroke="#B8860B" strokeWidth="1.5"/>
          </svg>
        </div>
        <div className="absolute bottom-32 left-20 animate-float opacity-20" style={{animationDelay:"1s"}}>
          <svg width="80" height="80" viewBox="0 0 80 80">
            <polygon points="40,4 76,22 76,58 40,76 4,58 4,22" fill="none" stroke="#DAA520" strokeWidth="1"/>
            <polygon points="40,14 66,27 66,53 40,66 14,53 14,27" fill="none" stroke="#DAA520" strokeWidth="0.7"/>
          </svg>
        </div>
        {/* Bottom text */}
        <div className="absolute bottom-0 left-0 right-0 p-10 z-10">
          <div className="border-t border-[#DAA520]/20 pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-0.5 bg-gradient-to-r from-[#DAA520] to-transparent"/>
              <span className="text-[#DAA520]/60 text-xs tracking-[0.3em] uppercase font-medium">Professional Platform</span>
            </div>
            <h2 className="text-white text-2xl font-bold tracking-tight mb-2">Arxitektura San'ati</h2>
            <p className="text-[#DAA520]/50 text-sm leading-relaxed max-w-xs">
              Har bir loyiha — yangi bir asar. Sizning ishingizni professional darajada boshqaring.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT — Login form */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        {/* Subtle bg pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{backgroundImage:`url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23DAA520' stroke-width='0.5'%3E%3Cpolygon points='20,2 38,11 38,29 20,38 2,29 2,11'/%3E%3C/g%3E%3C/svg%3E")`}}/>

        <div className="w-full max-w-sm relative z-10">
          {/* Logo */}
          <div className="text-center mb-10">
            <div className="flex justify-center mb-5">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#DAA520] to-[#B8860B] flex items-center justify-center shadow-[0_0_32px_rgba(218,165,32,0.4)]">
                  <svg viewBox="0 0 40 40" width="28" height="28">
                    <polygon points="20,2 38,11 38,29 20,38 2,29 2,11" fill="none" stroke="white" strokeWidth="1.5"/>
                    <path d="M8 38 L8 20 Q8 8 20 8 Q32 8 32 20 L32 38" fill="none" stroke="white" strokeWidth="1.5"/>
                    <line x1="20" y1="8" x2="20" y2="38" stroke="white" strokeWidth="0.8" opacity="0.5"/>
                  </svg>
                </div>
                <div className="absolute -inset-1 rounded-2xl bg-[#DAA520]/20 blur-md -z-10"/>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Arxitektor Kundaligi</h1>
            <p className="text-[#DAA520]/60 text-sm mt-1">Sarvarbek Tursunov — Professional Platform</p>
          </div>

          {/* Form card */}
          <div className="rounded-2xl border border-[#DAA520]/15 bg-white/[0.04] backdrop-blur-sm p-7 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <h2 className="text-lg font-semibold text-white mb-1">Kirish</h2>
            <p className="text-[#DAA520]/50 text-sm mb-6">Tizimga kirish uchun ma'lumotlarni kiriting</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#DAA520]/70 uppercase tracking-wider">Email</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="architect@example.com"
                  className="w-full h-11 px-4 rounded-xl bg-white/[0.06] border border-[#DAA520]/20 text-white placeholder:text-white/25 focus:border-[#DAA520]/50 focus:bg-white/[0.08] outline-none transition-all text-sm"/>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#DAA520]/70 uppercase tracking-wider">Parol</label>
                <div className="relative">
                  <input type={showPass ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 px-4 pr-11 rounded-xl bg-white/[0.06] border border-[#DAA520]/20 text-white placeholder:text-white/25 focus:border-[#DAA520]/50 focus:bg-white/[0.08] outline-none transition-all text-sm"/>
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                    {showPass ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className={cn(
                  "w-full h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all mt-2",
                  "bg-gradient-to-r from-[#B8860B] to-[#966B08] text-white",
                  "shadow-[0_4px_16px_rgba(184,134,11,0.4)] hover:shadow-[0_8px_24px_rgba(184,134,11,0.5)]",
                  "hover:-translate-y-0.5 active:translate-y-0",
                  loading && "opacity-70 cursor-not-allowed"
                )}>
                {loading
                  ? <><Loader2 className="h-4 w-4 animate-spin"/> Kirish...</>
                  : <>Kirish <ArrowRight className="h-4 w-4"/></>
                }
              </button>
            </form>
          </div>

          {/* Demo creds */}
          <div className="mt-4 p-4 rounded-xl border border-[#DAA520]/10 bg-[#DAA520]/[0.04]">
            <p className="text-xs font-bold text-[#DAA520]/70 mb-2 uppercase tracking-wider">Demo kirish</p>
            <p className="text-xs text-[#DAA520]/50 font-mono">📧 architect@demo.com</p>
            <p className="text-xs text-[#DAA520]/50 font-mono mt-0.5">🔑 admin123</p>
          </div>
        </div>
      </div>
    </div>
  )
}
