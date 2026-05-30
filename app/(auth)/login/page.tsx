"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Building2, Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [email, setEmail]       = useState("architect@demo.com")
  const [password, setPassword] = useState("admin123")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const router  = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return toast({ variant: "destructive", title: "Email va parol kiriting" })
    setLoading(true)
    try {
      const res = await signIn("credentials", { email, password, redirect: false })
      if (res?.error) {
        toast({ variant: "destructive", title: "Email yoki parol noto'g'ri" })
      } else {
        toast({ title: "✅ Tizimga kirdingiz" })
        router.push("/dashboard")
        router.refresh()
      }
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Building2 className="h-9 w-9 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Arxitektor Kundaligi</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Professional boshqaruv platformasi</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Kirish</CardTitle>
            <CardDescription>Email va parolingizni kiriting</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="architect@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Parol</Label>
                <div className="relative">
                  <Input id="password" type={showPass ? "text" : "password"} placeholder="••••••••"
                    value={password} onChange={e => setPassword(e.target.value)} required className="pr-10" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Kirish...</> : "Kirish"}
              </Button>
            </form>

            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/40 rounded-lg border border-blue-100 dark:border-blue-900">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">🔑 Demo ma'lumotlar:</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">📧 architect@demo.com</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">🔒 admin123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
