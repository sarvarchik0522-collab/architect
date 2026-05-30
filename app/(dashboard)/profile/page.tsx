"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { User, Lock, Save, Eye, EyeOff, Building2, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/utils"

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const { toast } = useToast()
  const [profile, setProfile]   = useState({ name:"", email:"", role:"", createdAt:"" })
  const [pSaving, setPSaving]   = useState(false)
  const [pass, setPass]         = useState({ current:"", new:"", confirm:"" })
  const [wSaving, setWSaving]   = useState(false)
  const [show, setShow]         = useState({ c:false, n:false, cf:false })

  useEffect(() => {
    fetch("/api/profile").then(r => r.json()).then(d => {
      if (d) setProfile({ name:d.name||"", email:d.email||"", role:d.role||"", createdAt:d.createdAt||"" })
    })
  }, [])

  const saveProfile = async () => {
    if (!profile.name.trim() || !profile.email.trim()) return toast({ variant:"destructive", title:"Ism va email kiritilishi shart" })
    setPSaving(true)
    try {
      const res = await fetch("/api/profile", { method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ name:profile.name, email:profile.email }) })
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
      const res = await fetch("/api/profile", { method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ type:"password", currentPassword:pass.current, newPassword:pass.new }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({ title:"✅ Parol o'zgartirildi" }); setPass({ current:"", new:"", confirm:"" })
    } catch (e:any) { toast({ variant:"destructive", title: e.message === "Noto'g'ri parol" ? "Joriy parol noto'g'ri" : "Xatolik" }) }
    finally { setWSaving(false) }
  }

  const avatarLetters = profile.name ? profile.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2) : "A"

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Avatar card */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
              {avatarLetters}
            </div>
            <div>
              <h3 className="text-xl font-bold">{profile.name || session?.user?.name}</h3>
              <p className="text-muted-foreground text-sm">{profile.email || session?.user?.email}</p>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{profile.role === "architect" ? "Arxitektor" : profile.role}</span>
                {profile.createdAt && <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatDate(profile.createdAt)} dan beri</span>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile info */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4" />Shaxsiy Ma'lumotlar</CardTitle>
          <CardDescription>Ismingiz va email manzilingizni yangilang</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5"><Label>Ism-familiya</Label><Input placeholder="Alisher Karimov" value={profile.name} onChange={e => setProfile(p => ({...p, name:e.target.value}))} /></div>
          <div className="space-y-1.5"><Label>Email</Label><Input type="email" placeholder="email@example.com" value={profile.email} onChange={e => setProfile(p => ({...p, email:e.target.value}))} /></div>
          <Button onClick={saveProfile} disabled={pSaving} className="gap-2"><Save className="h-4 w-4" />{pSaving ? "Saqlanmoqda..." : "Saqlash"}</Button>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2"><Lock className="h-4 w-4" />Parolni O'zgartirish</CardTitle>
          <CardDescription>Xavfsizlik uchun parolni muntazam yangilab turing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key:"c",  label:"Joriy parol",           val:pass.current,  sh:show.c,  onChange:(v:string) => setPass(p=>({...p,current:v})),  toggle:() => setShow(s=>({...s,c:!s.c})) },
            { key:"n",  label:"Yangi parol",            val:pass.new,     sh:show.n,  onChange:(v:string) => setPass(p=>({...p,new:v})),       toggle:() => setShow(s=>({...s,n:!s.n})) },
            { key:"cf", label:"Yangi parolni tasdiqlang", val:pass.confirm, sh:show.cf, onChange:(v:string) => setPass(p=>({...p,confirm:v})),   toggle:() => setShow(s=>({...s,cf:!s.cf})) },
          ].map(f => (
            <div key={f.key} className="space-y-1.5">
              <Label>{f.label}</Label>
              <div className="relative">
                <Input type={f.sh ? "text" : "password"} placeholder="••••••••" value={f.val} onChange={e => f.onChange(e.target.value)} className="pr-10" />
                <button type="button" onClick={f.toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {f.sh ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ))}
          {pass.new && pass.confirm && pass.new !== pass.confirm && <p className="text-xs text-red-500">Parollar mos kelmadi</p>}
          <Button onClick={savePassword} disabled={wSaving} variant="outline" className="gap-2"><Lock className="h-4 w-4" />{wSaving ? "O'zgartirilmoqda..." : "Parolni o'zgartirish"}</Button>
        </CardContent>
      </Card>

      {/* App info */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center"><Building2 className="h-6 w-6 text-white" /></div>
            <div><p className="font-semibold">Arxitektor Kundaligi</p><p className="text-xs text-muted-foreground">v1.0.0 · Next.js 14 + Prisma + SQLite</p></div>
          </div>
          <Separator className="my-3" />
          <p className="text-xs text-muted-foreground">Professional arxitektorlar uchun to'liq bepul, offline ishlaydigan boshqaruv platformasi. Hech qanday tashqi API yoki pullik servis ishlatilmaydi.</p>
        </CardContent>
      </Card>
    </div>
  )
}
