"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Save, Lock, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/utils"

const F = {c:"#1C1B18",c2:"#5A5650",c3:"#9A968E",bg:"#FFFFFF",bg2:"#F7F5F0",bd:"#E2DDD5",bd2:"#C8C2B8",gold:"#B8965A"}

export default function ProfilePage() {
  const { data:session, update } = useSession()
  const { toast } = useToast()
  const [profile,setProfile]=useState({name:"",email:"",role:"",createdAt:""})
  const [pSaving,setPSaving]=useState(false)
  const [pass,   setPass]  =useState({current:"",new:"",confirm:""})
  const [wSaving,setWSaving]=useState(false)
  const [show,   setShow]  =useState({c:false,n:false,cf:false})

  useEffect(()=>{
    fetch("/api/profile").then(r=>r.json()).then(d=>{
      if(d) setProfile({name:d.name??"",email:d.email??"",role:d.role??"",createdAt:d.createdAt??""})
    })
  },[])

  const saveProfile=async()=>{
    if (!profile.name||!profile.email) return toast({variant:"destructive",title:"Ism va email kerak"})
    setPSaving(true)
    try {
      await fetch("/api/profile",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:profile.name,email:profile.email})})
      await update({name:profile.name,email:profile.email})
      toast({title:"Profil yangilandi"})
    } catch { toast({variant:"destructive",title:"Xatolik"}) } finally { setPSaving(false) }
  }

  const savePassword=async()=>{
    if (!pass.current||!pass.new) return toast({variant:"destructive",title:"Barcha maydonlar kerak"})
    if (pass.new!==pass.confirm) return toast({variant:"destructive",title:"Parollar mos emas"})
    if (pass.new.length<6) return toast({variant:"destructive",title:"Kamida 6 ta belgi"})
    setWSaving(true)
    try {
      const res=await fetch("/api/profile",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:"password",currentPassword:pass.current,newPassword:pass.new})})
      const data=await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({title:"Parol o'zgartirildi"});setPass({current:"",new:"",confirm:""})
    } catch(e:any) { toast({variant:"destructive",title:e.message==="Noto'g'ri parol"?"Joriy parol noto'g'ri":"Xatolik"})
    } finally { setWSaving(false) }
  }

  const inp=(val:string,onChange:(v:string)=>void,ph:string,type="text")=>(
    <input type={type} placeholder={ph} value={val} onChange={e=>onChange(e.target.value)}
      className="w-full h-10 px-3 text-sm"
      style={{background:F.bg2,border:`1px solid ${F.bd}`,borderRadius:3,color:F.c,outline:"none"}}
      onFocus={e=>{e.target.style.borderColor=F.bd2}} onBlur={e=>{e.target.style.borderColor=F.bd}}/>
  )

  return (
    <div className="max-w-xl space-y-4" style={{color:F.c}}>
      <h2 className="text-xl font-bold tracking-tight" style={{fontFamily:"'Playfair Display',serif"}}>Profil</h2>

      {/* Avatar card */}
      <div className="neo-card p-5">
        <div style={{height:2,background:`linear-gradient(90deg,transparent,${F.gold},transparent)`,marginBottom:16}}/>
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded flex items-center justify-center font-black text-lg"
            style={{background:F.c,color:"#FFF",fontFamily:"'Playfair Display',serif"}}>
            {profile.name?profile.name.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2):"SM"}
          </div>
          <div>
            <h3 className="font-black text-lg" style={{color:F.c,fontFamily:"'Playfair Display',serif"}}>
              {profile.name||session?.user?.name}
            </h3>
            <p className="text-sm" style={{color:F.c3}}>{profile.email||session?.user?.email}</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs px-2 py-0.5 rounded"
                style={{background:F.bg2,border:`1px solid ${F.bd}`,color:F.c2,fontSize:9}}>
                {profile.role==="architect"?"Arxitektor":profile.role||"Arxitektor"}
              </span>
              {profile.createdAt&&<span className="text-xs" style={{color:F.c3}}>{formatDate(profile.createdAt)} dan beri</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Profile info */}
      <div className="neo-card p-5 space-y-4">
        <p className="text-xs font-bold uppercase tracking-[0.14em]" style={{color:F.c3}}>Shaxsiy Ma'lumotlar</p>
        <div className="space-y-1.5">
          <label style={{fontSize:9,color:F.c3,fontWeight:600,letterSpacing:"0.14em",textTransform:"uppercase"}}>Ism-familiya</label>
          {inp(profile.name,v=>setProfile(p=>({...p,name:v})),"Sarvarbek Mamatov")}
        </div>
        <div className="space-y-1.5">
          <label style={{fontSize:9,color:F.c3,fontWeight:600,letterSpacing:"0.14em",textTransform:"uppercase"}}>Email</label>
          {inp(profile.email,v=>setProfile(p=>({...p,email:v})),"email@example.com","email")}
        </div>
        <button onClick={saveProfile} disabled={pSaving} className="btn-neo-dark h-9 px-4 text-sm flex items-center gap-2">
          <Save className="h-3.5 w-3.5"/>{pSaving?"Saqlanmoqda...":"Saqlash"}
        </button>
      </div>

      {/* Password */}
      <div className="neo-card p-5 space-y-4">
        <p className="text-xs font-bold uppercase tracking-[0.14em]" style={{color:F.c3}}>Parolni O'zgartirish</p>
        <div className="space-y-3">
          {([{k:"current",l:"Joriy parol",sk:"c"},{k:"new",l:"Yangi parol",sk:"n"},{k:"confirm",l:"Tasdiqlash",sk:"cf"}] as const).map(f=>(
            <div key={f.k} className="space-y-1.5">
              <label style={{fontSize:9,color:F.c3,fontWeight:600,letterSpacing:"0.14em",textTransform:"uppercase"}}>{f.l}</label>
              <div className="relative">
                <input type={show[f.sk]?"text":"password"} placeholder="••••••••"
                  value={(pass as any)[f.k]} onChange={e=>setPass(p=>({...p,[f.k]:e.target.value}))}
                  className="w-full h-10 px-3 pr-10 text-sm"
                  style={{background:F.bg2,border:`1px solid ${F.bd}`,borderRadius:3,color:F.c,outline:"none"}}
                  onFocus={e=>{e.target.style.borderColor=F.bd2}} onBlur={e=>{e.target.style.borderColor=F.bd}}/>
                <button type="button" onClick={()=>setShow(s=>({...s,[f.sk]:!s[f.sk]}))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors" style={{color:F.c3}}>
                  {show[f.sk]?<EyeOff className="h-4 w-4"/>:<Eye className="h-4 w-4"/>}
                </button>
              </div>
            </div>
          ))}
          {pass.new&&pass.confirm&&pass.new!==pass.confirm&&(
            <p className="text-xs" style={{color:F.c3}}>⚠ Parollar mos emas</p>
          )}
          <button onClick={savePassword} disabled={wSaving} className="btn-neo-light h-9 px-4 text-sm flex items-center gap-2">
            <Lock className="h-3.5 w-3.5"/>{wSaving?"O'zgartirilmoqda...":"Parolni o'zgartirish"}
          </button>
        </div>
      </div>

      {/* App info */}
      <div className="neo-card p-5">
        <div style={{height:1,background:`linear-gradient(90deg,transparent,${F.gold},transparent)`,marginBottom:12,opacity:0.4}}/>
        <p className="font-bold text-sm" style={{color:F.c,fontFamily:"'Playfair Display',serif"}}>Arxitektor Kundaligi</p>
        <p className="text-xs mt-0.5" style={{color:F.c3}}>v1.0.0 · Next.js + Prisma + SQLite</p>
        <div style={{height:1,background:F.bd,margin:"12px 0"}}/>
        <p className="text-xs leading-relaxed" style={{color:F.c3}}>
          100% bepul · Offline ishlaydi · Sarvarbek Mamatov uchun yaratilgan
        </p>
      </div>
    </div>
  )
}
