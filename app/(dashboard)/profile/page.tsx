"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { User, Lock, Save, Eye, EyeOff, Building2, Calendar, Shield, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { cn, formatDate } from "@/lib/utils"

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const { toast } = useToast()
  const [profile,  setProfile]  = useState({ name:"", email:"", role:"", createdAt:"" })
  const [pSaving,  setPSaving]  = useState(false)
  const [pass,     setPass]     = useState({ current:"", new:"", confirm:"" })
  const [wSaving,  setWSaving]  = useState(false)
  const [show,     setShow]     = useState({ c:false, n:false, cf:false })

  useEffect(() => {
    fetch("/api/profile").then(r => r.json()).then(d => {
      if (d) setProfile({ name:d.name??"", email:d.email??"", role:d.role??"", createdAt:d.createdAt??"" })
    })
  }, [])

  const saveProfile = async () => {
    if (!profile.name.trim() || !profile.email.trim()) return toast({ variant:"destructive", title:"Ism va email kiritilishi shart" })
    setPSaving(true)
    try {
      const res = await fetch("/api/profile", {
        method:"PUT", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ name:profile.name, email:profile.email })
      })
      if (!res.ok) throw new Error()
      await update({ name:profile.name, email:profile.email })
      toast({ title:"✅ Profil yangilandi" })
    } catch { toast({ variant:"destructive", title:"Xatolik" }) }
    finally { setPSaving(false) }
  }

  const savePassword = async () => {
    if (!pass.current || !pass.new) return toast({ variant:"destructive", title:"Barcha maydonlarni to'ldiring" })
    if (pass.new !== pass.confirm)  return toast({ variant:"destructive", title:"Yangi parollar mos kelmadi" })
    if (pass.new.length < 6)        return toast({ variant:"destructive", title:"Parol kamida 6 ta belgi" })
    setWSaving(true)
    try {
      const res = await fetch("/api/profile", {
        method:"PUT", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ type:"password", currentPassword:pass.current, newPassword:pass.new })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({ title:"✅ Parol o'zgartirildi" }); setPass({ current:"", new:"", confirm:"" })
    } catch (e:any) {
      toast({ variant:"destructive", title: e.message === "Noto'g'ri parol" ? "Joriy parol noto'g'ri" : "Xatolik" })
    } finally { setWSaving(false) }
  }

  const avatarLetters = profile.name ? profile.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2) : "A"
  const passFilled = pass.new && pass.confirm
  const passMatch  = pass.new === pass.confirm

  return (
    <div className="space-y-6 max-w-2xl page-enter arch-pattern">

      {/* ── Hero profile card ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-violet-800 p-8 text-white">
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none hidden lg:block">
          <svg width="160" height="160" viewBox="0 0 160 160" className="animate-rotate-slow">
            <circle cx="80" cy="80" r="60" fill="none" stroke="white" strokeWidth="1" strokeDasharray="3 3"/>
            <circle cx="80" cy="80" r="40" fill="none" stroke="white" strokeWidth="0.7"/>
            <circle cx="80" cy="40" r="16" fill="none" stroke="white" strokeWidth="1"/>
            <path d="M50 120 Q80 95 110 120" fill="none" stroke="white" strokeWidth="1"/>
          </svg>
        </div>
        <div className="relative z-10 flex items-center gap-6">
          {/* Big avatar */}
          <div className="relative flex-shrink-0">
            <div className="h-20 w-20 rounded-3xl bg-white/20 border-2 border-white/40 flex items-center justify-center text-white font-bold text-2xl shadow-2xl backdrop-blur-sm">
              {avatarLetters}
            </div>
            <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-emerald-400 rounded-full border-2 border-white flex items-center justify-center">
              <div className="h-2 w-2 bg-white rounded-full" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold">{profile.name || session?.user?.name}</h2>
            <p className="text-blue-200 text-sm">{profile.email || session?.user?.email}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="flex items-center gap-1.5 text-xs bg-white/15 border border-white/20 px-3 py-1 rounded-full">
                <Building2 className="h-3 w-3" />
                {profile.role === "architect" ? "Arxitektor" : profile.role}
              </span>
              {profile.createdAt && (
                <span className="flex items-center gap-1.5 text-xs bg-white/15 border border-white/20 px-3 py-1 rounded-full">
                  <Calendar className="h-3 w-3" />
                  {formatDate(profile.createdAt)} dan beri
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Profile info ── */}
      <div className="profile-card bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
              <User className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-white">Shaxsiy Ma'lumotlar</p>
              <p className="text-xs text-slate-400">Ismingiz va email manzilingizni yangilang</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-slate-600 dark:text-slate-300 text-sm font-medium">Ism-familiya</Label>
              <Input
                placeholder="Alisher Karimov"
                value={profile.name}
                onChange={e => setProfile(p => ({...p, name: e.target.value}))}
                className="rounded-xl h-11 border-slate-200 dark:border-slate-700"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-600 dark:text-slate-300 text-sm font-medium">Email manzil</Label>
              <Input
                type="email"
                placeholder="email@example.com"
                value={profile.email}
                onChange={e => setProfile(p => ({...p, email: e.target.value}))}
                className="rounded-xl h-11 border-slate-200 dark:border-slate-700"
              />
            </div>
            <Button onClick={saveProfile} disabled={pSaving} className="btn-primary-3d text-white rounded-xl gap-2">
              <Save className="h-4 w-4" />
              {pSaving ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Password ── */}
      <div className="profile-card bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-9 w-9 rounded-xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center">
              <Lock className="h-4 w-4 text-orange-500" />
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-white">Parolni O'zgartirish</p>
              <p className="text-xs text-slate-400">Xavfsizlik uchun parolni muntazam yangilab turing</p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { key:"c",  label:"Joriy parol",          val:pass.current, sh:show.c,  onChange:(v:string)=>setPass(p=>({...p,current:v})), toggle:()=>setShow(s=>({...s,c:!s.c})) },
              { key:"n",  label:"Yangi parol",           val:pass.new,    sh:show.n,  onChange:(v:string)=>setPass(p=>({...p,new:v})),     toggle:()=>setShow(s=>({...s,n:!s.n})) },
              { key:"cf", label:"Yangi parolni tasdiqlang", val:pass.confirm,sh:show.cf, onChange:(v:string)=>setPass(p=>({...p,confirm:v})), toggle:()=>setShow(s=>({...s,cf:!s.cf})) },
            ].map(f => (
              <div key={f.key} className="space-y-1.5">
                <Label className="text-slate-600 dark:text-slate-300 text-sm font-medium">{f.label}</Label>
                <div className="relative">
                  <Input
                    type={f.sh ? "text" : "password"}
                    placeholder="••••••••"
                    value={f.val}
                    onChange={e => f.onChange(e.target.value)}
                    className={cn(
                      "rounded-xl h-11 pr-11 border-slate-200 dark:border-slate-700",
                      f.key === "cf" && passFilled && !passMatch && "border-red-300 dark:border-red-700 focus:ring-red-500/20",
                      f.key === "cf" && passFilled && passMatch && "border-emerald-300 dark:border-emerald-700 focus:ring-emerald-500/20",
                    )}
                  />
                  <button type="button" onClick={f.toggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                    {f.sh ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {f.key === "cf" && passFilled && !passMatch && (
                  <p className="text-xs text-red-500 flex items-center gap-1">⚠️ Parollar mos kelmadi</p>
                )}
                {f.key === "cf" && passFilled && passMatch && (
                  <p className="text-xs text-emerald-500 flex items-center gap-1">✅ Parollar mos keldi</p>
                )}
              </div>
            ))}

            <Button onClick={savePassword} disabled={wSaving} variant="outline"
              className="rounded-xl gap-2 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/20">
              <Shield className="h-4 w-4" />
              {wSaving ? "O'zgartirilmoqda..." : "Parolni o'zgartirish"}
            </Button>
          </div>
        </div>
      </div>

      {/* ── App info ── */}
      <div className="profile-card bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
        <div className="p-5">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 bg-gradient-to-br from-blue-600 to-violet-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                Arxitektor Kundaligi
                <span className="text-xs bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">v1.0.0</span>
              </p>
              <p className="text-xs text-slate-400">Next.js 14 + Prisma + SQLite</p>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon:"📐", label:"Loyihalar boshqaruvi" },
              { icon:"👥", label:"CRM tizimi" },
              { icon:"✅", label:"Kanban vazifalar" },
              { icon:"💰", label:"Moliya hisoboti" },
              { icon:"📖", label:"Kundalik yozuvlari" },
              { icon:"🔍", label:"Global qidiruv" },
            ].map(f => (
              <div key={f.label} className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>{f.icon}</span><span>{f.label}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            100% bepul · Offline ishlaydi · Hech qanday tashqi API yo'q
          </p>
        </div>
      </div>
    </div>
  )
}
