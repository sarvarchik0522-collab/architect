"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Building2, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export default function LoginPage() {
  const [email,    setEmail]    = useState("architect@demo.com")
  const [password, setPassword] = useState("admin123")
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const router   = useRouter()
  const { toast }= useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return toast({ variant: "destructive", title: "Email va parol kiriting" })
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
    <div className="min-h-screen flex bg-white dark:bg-[#060e1e]">

      {/* ── Left panel — branding ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-violet-800 flex-col items-center justify-center p-12">

        {/* Blueprint grid overlay */}
        <div className="absolute inset-0 blueprint-grid opacity-30" />

        {/* Decorative SVG architecture */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <svg viewBox="0 0 400 400" className="w-full h-full max-w-lg animate-rotate-slow">
            <rect x="50" y="50" width="300" height="300" fill="none" stroke="white" strokeWidth="1"/>
            <rect x="100" y="100" width="200" height="200" fill="none" stroke="white" strokeWidth="0.5"/>
            <line x1="200" y1="50" x2="200" y2="350" stroke="white" strokeWidth="0.5"/>
            <line x1="50" y1="200" x2="350" y2="200" stroke="white" strokeWidth="0.5"/>
            <circle cx="200" cy="200" r="80" fill="none" stroke="white" strokeWidth="0.5"/>
            <circle cx="200" cy="200" r="40" fill="none" stroke="white" strokeWidth="0.5"/>
            <polygon points="200,80 320,260 80,260" fill="none" stroke="white" strokeWidth="0.8"/>
          </svg>
        </div>

        {/* Floating geometric shapes */}
        <div className="absolute top-20 right-16 w-24 h-24 opacity-20 animate-float">
          <svg viewBox="0 0 100 100">
            <polygon points="50,5 95,75 5,75" fill="none" stroke="white" strokeWidth="2"/>
          </svg>
        </div>
        <div className="absolute bottom-24 left-16 w-16 h-16 opacity-15 animate-float-slow">
          <svg viewBox="0 0 100 100">
            <rect x="10" y="10" width="80" height="80" fill="none" stroke="white" strokeWidth="2" transform="rotate(45 50 50)"/>
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center text-white max-w-md">
          <div className="flex justify-center mb-8">
            <div className="relative h-20 w-20">
              <div className="absolute inset-0 bg-white/20 rounded-3xl rotate-6" />
              <div className="absolute inset-0 bg-white/10 rounded-3xl -rotate-3" />
              <div className="absolute inset-0 bg-blue-500 rounded-3xl flex items-center justify-center border border-white/30">
                <Building2 className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-3 tracking-tight">Arxitektor</h1>
          <p className="text-2xl font-light text-blue-200 mb-6">Kundaligi</p>
          <p className="text-blue-200 text-base leading-relaxed">
            Professional arxitektorlar uchun loyiha boshqaruvi, CRM va moliya tizimi
          </p>

          {/* Feature list */}
          <div className="mt-8 space-y-3 text-left">
            {[
              "📐 Loyihalar boshqaruvi",
              "👥 Mijozlar CRM tizimi",
              "✅ Kanban vazifalar",
              "💰 Moliya hisoboti",
              "📖 Kundalik yozuvlari",
            ].map(f => (
              <div key={f} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/10">
                <span className="text-sm font-medium">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel — login form ── */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-10">
            <div className="h-11 w-11 bg-blue-600 rounded-2xl flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Arxitektor Kundaligi</p>
              <p className="text-xs text-slate-400">Professional platform</p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Xush kelibsiz 👋
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Davom etish uchun tizimga kiring
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <Label className="text-slate-700 dark:text-slate-300 font-medium text-sm">
                Email manzil
              </Label>
              <Input
                type="email"
                placeholder="architect@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label className="text-slate-700 dark:text-slate-300 font-medium text-sm">
                Parol
              </Label>
              <div className="relative">
                <Input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pr-11 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full h-11 rounded-xl font-semibold text-sm",
                "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
                "shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40",
                "transition-all duration-200",
                "btn-glow"
              )}
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Kirish...</>
              ) : (
                <> Kirish <ArrowRight className="h-4 w-4 ml-1" /></>
              )}
            </Button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-2xl border border-blue-100 dark:border-blue-900/40">
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-1.5">
              <span className="h-4 w-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-[8px]">i</span>
              Demo ma'lumotlar
            </p>
            <div className="space-y-1">
              <p className="text-xs text-blue-600 dark:text-blue-400 font-mono bg-white/60 dark:bg-blue-950/40 px-2 py-1 rounded-lg">
                📧 architect@demo.com
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-mono bg-white/60 dark:bg-blue-950/40 px-2 py-1 rounded-lg">
                🔑 admin123
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
