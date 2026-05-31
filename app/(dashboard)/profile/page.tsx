"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Save, Lock, Eye, EyeOff, Building2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/utils"

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const { toast } = useToast()
  const [profile, setProfile] = useState({ name:"", email:"", role:"", createdAt:"" })
  const [pSaving, setPSaving] = useState(false)
  const [pass,    setPass]    = useState({ current:"", new:"", confirm:"" })
  const [wSaving, setWSaving] = useState(false)
  const [show,    setShow]    = useState({ c:false, n:false, cf:false })

  useEffect(()=>{
    fetch("/api/profile").then(r=>r.json()).then(d=>{
      if (d) setProfile({ name:d.name??"", email:d.email??"", role:d.role??"", createdAt:d.createdAt??"" })
    })
  },[])

  const saveProfile = async () => {
    if (!profile.name||!profile.email) return toast({variant:"destructive",title:"Ism va email kerak"})
    setPSaving(true)
    try {
      const res = await fetch("/api/profile",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:profile.name,email:profile.email})})
      if (!res.ok) throw new Error()
      await update({name:profile.name,email:profile.email})
      toast({title:"Profil yangilandi"})
    } catch { toast({variant:"destructive",title:"Xatolik"}) }
    finally { setPSaving(false) }
  }

  const savePassword = async () => {
    if (!pass.current||!pass.new) return toast({variant:"destructive",title:"Barcha maydonlar"})
    if (pass.new!==pass.confirm) return toast({variant:"destructive",title:"Parollar mos emas"})
    if (pass.new.length<6) return toast({variant:"destructive",title:"Parol kamida 6 ta belgi"})
    setWSaving(true)
    try {
      const res = await fetch("/api/profile",{method:"PUT",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({type:"password",currentPassword:pass.current,newPassword:pass.new})})
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({title:"Parol o'zgartirildi"}); setPass({current:"",new:"",confirm:""})
    } catch(e:any) {
      toast({variant:"destructive",title:e.message==="Noto'g'ri parol"?"Joriy parol noto'g'ri":"Xatolik"})
    } finally { setWSaving(false) }
  }

  const inp = (value:string, onChange:(v:string)=>void, ph:string, type="text") => (
    <input type={type} placeholder={ph} value={value} onChange={e=>onChange(e.target.value)}
      className="w-full h-10 px-3 text-sm rounded"
      style={{background:"#0d0d0d",border:"1px solid #222",color:"#f0f0f0",outline:"none"}}
      onFocus={e=>{e.target.style.borderColor="#555"}} onBlur={e=>{e.target.style.borderColor="#222"}}/>
  )

  return (
    <div className="max-w-xl space-y-4" style={{color:"#f0f0f0"}}>
      <h2 className="text-xl font-black tracking-tight">Profil</h2>

      {/* Avatar card */}
      <div className="arch-card p-5">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded flex items-center justify-center font-black text-lg"
            style={{background:"#1a1a1a",border:"1px solid #2a2a2a",color:"#888"}}>
            {profile.name ? profile.name.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2) : "ST"}
          </div>
          <div>
            <h3 className="font-black text-lg tracking-tight" style={{color:"#f0f0f0"}}>{profile.name||session?.user?.name}</h3>
            <p className="text-sm" style={{color:"#555"}}>{profile.email||session?.user?.email}</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs px-2 py-0.5 rounded" style={{background:"#1a1a1a",border:"1px solid #222",color:"#555"}}>
                {profile.role==="architect"?"Arxitektor":profile.role||"Arxitektor"}
              </span>
              {profile.createdAt&&(
                <span className="text-xs" style={{color:"#444"}}>{formatDate(profile.createdAt)} dan beri</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile info */}
      <div className="arch-card p-5 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider" style={{color:"#888"}}>Shaxsiy Ma'lumotlar</h3>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{color:"#555"}}>Ism-familiya</label>
            {inp(profile.name, v=>setProfile(p=>({...p,name:v})), "Sarvarbek Tursunov")}
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{color:"#555"}}>Email</label>
            {inp(profile.email, v=>setProfile(p=>({...p,email:v})), "email@example.com", "email")}
          </div>
          <button onClick={saveProfile} disabled={pSaving} className="btn-primary h-9 px-4 text-sm flex items-center gap-2">
            <Save className="h-3.5 w-3.5"/>
            {pSaving?"Saqlanmoqda...":"Saqlash"}
          </button>
        </div>
      </div>

      {/* Password */}
      <div className="arch-card p-5 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider" style={{color:"#888"}}>Parolni O'zgartirish</h3>
        <div className="space-y-3">
          {[
            {k:"current",label:"Joriy parol",    sk:"c" as "c"},
            {k:"new",    label:"Yangi parol",     sk:"n" as "n"},
            {k:"confirm",label:"Yangi (tasdiqlash)",sk:"cf" as "cf"},
          ].map(f=>(
            <div key={f.k} className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{color:"#555"}}>{f.label}</label>
              <div className="relative">
                <input type={show[f.sk]?"text":"password"} placeholder="••••••••"
                  value={(pass as any)[f.k]} onChange={e=>setPass(p=>({...p,[f.k]:e.target.value}))}
                  className="w-full h-10 px-3 pr-10 text-sm rounded"
                  style={{background:"#0d0d0d",border:"1px solid #222",color:"#f0f0f0",outline:"none"}}
                  onFocus={e=>{e.target.style.borderColor="#555"}}
                  onBlur={e=>{e.target.style.borderColor="#222"}}/>
                <button type="button" onClick={()=>setShow(s=>({...s,[f.sk]:!s[f.sk]}))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{color:"#444"}}>
                  {show[f.sk]?<EyeOff className="h-4 w-4"/>:<Eye className="h-4 w-4"/>}
                </button>
              </div>
            </div>
          ))}
          {pass.new&&pass.confirm&&pass.new!==pass.confirm&&(
            <p className="text-xs" style={{color:"#888"}}>⚠ Parollar mos emas</p>
          )}
          <button onClick={savePassword} disabled={wSaving}
            className="btn-ghost h-9 px-4 text-sm flex items-center gap-2">
            <Lock className="h-3.5 w-3.5"/>
            {wSaving?"O'zgartirilmoqda...":"Parolni o'zgartirish"}
          </button>
        </div>
      </div>

      {/* App info */}
      <div className="arch-card p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-9 w-9 rounded flex items-center justify-center"
            style={{background:"#1a1a1a",border:"1px solid #222"}}>
            <Building2 className="h-4 w-4" style={{color:"#666"}}/>
          </div>
          <div>
            <p className="text-sm font-bold" style={{color:"#f0f0f0"}}>Arxitektor Kundaligi</p>
            <p className="text-xs" style={{color:"#444"}}>v1.0.0 · Next.js + Prisma + SQLite</p>
          </div>
        </div>
        <div style={{height:1,background:"#1a1a1a",marginBottom:12}}/>
        <p className="text-xs" style={{color:"#444",lineHeight:1.6}}>
          100% bepul · Offline ishlaydi · Hech qanday tashqi API yo'q<br/>
          Sarvarbek Tursunov uchun maxsus yaratilgan professional platforma
        </p>
      </div>
    </div>
  )
}
