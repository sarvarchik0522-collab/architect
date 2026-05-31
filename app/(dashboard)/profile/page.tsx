"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { User, Lock, Save, Eye, EyeOff, Building2, Calendar, Shield } from "lucide-react"
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
    <div className="space-y-6 max-w-2xl page-enter">

      {/* ── Hero profile card ── */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0d0d0d] border border-[#222] p-8 text-white">
        <div className="relative z-10 flex items-center gap-6">
          {/* Big avatar */}
          <div className="relative flex-shrink-0">
            <div className="h-20 w-20 rounded-3xl bg-[#1a1a1a] border-2 border-[#333] flex items-center justify-center text-white font-bold text-2xl">
              {avatarLetters}
            </div>
            <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-[#333] rounded-full border-2 border-[#0d0d0d] flex items-center justify-center">
              <div className="h-2 w-2 bg-[#888] rounded-full" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{profile.name || session?.user?.name}</h2>
            <p className="text-[#555] text-sm">{profile.email || session?.user?.email}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="flex items-center gap-1.5 text-xs bg-[#1a1a1a] border border-[#333] text-[#888] px-3 py-1 rounded-full">
                <Building2 className="h-3 w-3" />
                {profile.role === "architect" ? "Arxitektor" : profile.role}
              </span>
              {profile.createdAt && (
                <span className="flex items-center gap-1.5 text-xs bg-[#1a1a1a] border border-[#333] text-[#888] px-3 py-1 rounded-full">
                  <Calendar className="h-3 w-3" />
                  {formatDate(profile.createdAt)} dan beri
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Profile info ── */}
      <div className="arch-card">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-9 w-9 rounded-xl bg-[#1a1a1a] border border-[#333] flex items-center justify-center">
              <User className="h-4 w-4 text-[#888]" />
            </div>
            <div>
              <p className="font-bold text-white">Shaxsiy Ma'lumotlar</p>
              <p className="text-xs text-[#444]">Ismingiz va email manzilingizni yangilang</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[#888] text-sm font-medium">Ism-familiya</Label>
              <Input
                placeholder="Alisher Karimov"
                value={profile.name}
                onChange={e => setProfile(p => ({...p, name: e.target.value}))}
                className="rounded-xl h-11 border-[#333] bg-[#0d0d0d] text-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[#888] text-sm font-medium">Email manzil</Label>
              <Input
                type="email"
                placeholder="email@example.com"
                value={profile.email}
                onChange={e => setProfile(p => ({...p, email: e.target.value}))}
                className="rounded-xl h-11 border-[#333] bg-[#0d0d0d] text-white"
              />
            </div>
            <Button onClick={saveProfile} disabled={pSaving} className="btn-primary rounded-xl gap-2">
              <Save className="h-4 w-4" />
              {pSaving ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Password ── */}
      <div className="arch-card">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-9 w-9 rounded-xl bg-[#1a1a1a] border border-[#333] flex items-center justify-center">
              <Lock className="h-4 w-4 text-[#888]" />
            </div>
            <div>
              <p className="font-bold text-white">Parolni O'zgartirish</p>
              <p className="text-xs text-[#444]">Xavfsizlik uchun parolni muntazam yangilab turing</p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { key:"c",  label:"Joriy parol",             val:pass.current, sh:show.c,  onChange:(v:string)=>setPass(p=>({...p,current:v})), toggle:()=>setShow(s=>({...s,c:!s.c})) },
              { key:"n",  label:"Yangi parol",              val:pass.new,    sh:show.n,  onChange:(v:string)=>setPass(p=>({...p,new:v})),     toggle:()=>setShow(s=>({...s,n:!s.n})) },
              { key:"cf", label:"Yangi parolni tasdiqlang", val:pass.confirm,sh:show.cf, onChange:(v:string)=>setPass(p=>({...p,confirm:v})), toggle:()=>setShow(s=>({...s,cf:!s.cf})) },
            ].map(f => (
              <div key={f.key} className="space-y-1.5">
                <Label className="text-[#888] text-sm font-medium">{f.label}</Label>
                <div className="relative">
                  <Input
                    type={f.sh ? "text" : "password"}
                    placeholder="••••••••"
                    value={f.val}
                    onChange={e => f.onChange(e.target.value)}
                    className={cn(
                      "rounded-xl h-11 pr-11 border-[#333] bg-[#0d0d0d] text-white",
                      f.key === "cf" && passFilled && !passMatch && "border-[#555]",
                      f.key === "cf" && passFilled && passMatch && "border-[#444]",
                    )}
                  />
                  <button type="button" onClick={f.toggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] hover:text-[#888] transition-colors">
                    {f.sh ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {f.key === "cf" && passFilled && !passMatch && (
                  <p className="text-xs text-[#888] flex items-center gap-1">⚠️ Parollar mos kelmadi</p>
                )}
                {f.key === "cf" && passFilled && passMatch && (
                  <p className="text-xs text-[#aaa] flex items-center gap-1">✅ Parollar mos keldi</p>
                )}
              </div>
            ))}

            <Button onClick={savePassword} disabled={wSaving} variant="outline"
              className="rounded-xl gap-2 border-[#333] text-[#888] hover:bg-[#1a1a1a] hover:text-white">
              <Shield className="h-4 w-4" />
              {wSaving ? "O'zgartirilmoqda..." : "Parolni o'zgartirish"}
            </Button>
          </div>
        </div>
      </div>

      {/* ── App info ── */}
      <div className="arch-card">
        <div className="p-5">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 bg-[#1a1a1a] border border-[#333] rounded-2xl flex items-center justify-center">
              <Building2 className="h-6 w-6 text-[#888]" />
            </div>
            <div>
              <p className="font-bold text-white flex items-center gap-2">
                Arxitektor Kundaligi
                <span className="text-xs bg-[#1a1a1a] border border-[#333] text-[#666] px-2 py-0.5 rounded-full">v1.0.0</span>
              </p>
              <p className="text-xs text-[#444]">Next.js 14 + Prisma + SQLite</p>
            </div>
          </div>
          <Separator className="my-4 bg-[#222]" />
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon:"📐", label:"Loyihalar boshqaruvi" },
              { icon:"👥", label:"CRM tizimi" },
              { icon:"✅", label:"Kanban vazifalar" },
              { icon:"💰", label:"Moliya hisoboti" },
              { icon:"📖", label:"Kundalik yozuvlari" },
              { icon:"🔍", label:"Global qidiruv" },
            ].map(f => (
              <div key={f.label} className="flex items-center gap-2 text-xs text-[#555]">
                <span>{f.icon}</span><span>{f.label}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#333] mt-4 pt-3 border-t border-[#222]">
            100% bepul · Offline ishlaydi · Hech qanday tashqi API yo'q
          </p>
        </div>
      </div>
    </div>
  )
}
