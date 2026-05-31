"use client"
import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { Save, Lock, Eye, EyeOff } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/utils"

const C = { ink:"var(--ink)", ink2:"var(--ink2)", ink3:"var(--ink3)", cream:"var(--cream)", cream2:"var(--cream2)", stone:"var(--stone)", stone2:"var(--stone2)", white:"var(--white)", border:"rgba(200,168,112,.14)", gold:"var(--gold)" }
const inputSt={ background:C.cream, border:`1px solid ${C.border}`, borderRadius:3, color:C.ink, outline:"none" }
const labelSt={ fontSize:9, color:C.stone2, fontWeight:700, letterSpacing:".14em", textTransform:"uppercase" as const }

/* 3D tilt profile card */
function TiltCard({ children, className="" }: { children:React.ReactNode; className?:string }) {
  const ref=useRef<HTMLDivElement>(null)
  const onMove=(e:React.MouseEvent<HTMLDivElement>)=>{
    const el=ref.current; if (!el) return
    const r=el.getBoundingClientRect()
    const dx=(e.clientX-r.left-r.width/2)/(r.width/2)
    const dy=(e.clientY-r.top-r.height/2)/(r.height/2)
    el.style.transform=`perspective(900px) rotateX(${-dy*4}deg) rotateY(${dx*4}deg) translateY(-3px)`
  }
  const onLeave=()=>{ if(ref.current) ref.current.style.transform="" }
  return (
    <div ref={ref} className={`card-3d-tilt ${className}`} onMouseMove={onMove} onMouseLeave={onLeave}
      style={{transition:"transform .12s ease-out, box-shadow .4s"}}>
      {children}
    </div>
  )
}

export default function ProfilePage() {
  const { data:session, update }=useSession()
  const { toast }=useToast()
  const [profile,setProfile]=useState({name:"",email:"",role:"",createdAt:""})
  const [pSaving,setPSaving]=useState(false)
  const [pass,   setPass]  =useState({current:"",new:"",confirm:""})
  const [wSaving,setWSaving]=useState(false)
  const [show,   setShow]  =useState({c:false,n:false,cf:false})

  useEffect(()=>{
    fetch("/api/profile").then(r=>r.json()).then(d=>{
      if (d) setProfile({name:d.name??"",email:d.email??"",role:d.role??"",createdAt:d.createdAt??""})
    })
  },[])

  const saveProfile=async()=>{
    if (!profile.name||!profile.email) return toast({variant:"destructive",title:"Ism va email kerak"})
    setPSaving(true)
    try {
      await fetch("/api/profile",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:profile.name,email:profile.email})})
      await update({name:profile.name,email:profile.email})
      toast({title:"Profil yangilandi ✓"})
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
      toast({title:"Parol o'zgartirildi ✓"});setPass({current:"",new:"",confirm:""})
    } catch(e:any) { toast({variant:"destructive",title:e.message==="Noto'g'ri parol"?"Joriy parol noto'g'ri":"Xatolik"})
    } finally { setWSaving(false) }
  }

  const initials=(n:string)=>n.split(" ").map(x=>x[0]).join("").toUpperCase().slice(0,2)

  return (
    <div className="max-w-xl space-y-5 anim-page">
      <h2 className="text-xl font-black tracking-tight"
        style={{fontFamily:"'Playfair Display',serif",color:C.ink}}>Profil</h2>

      {/* Avatar card — 3D tilt */}
      <TiltCard>
        <div style={{height:2,background:"linear-gradient(90deg,transparent,var(--gold),transparent)"}}/>
        <div className="p-6">
          <div className="flex items-center gap-5">
            {/* 3D avatar */}
            <div className="relative layer-front flex-shrink-0">
              <div className="h-16 w-16 rounded flex items-center justify-center font-black text-xl"
                style={{background:"var(--ink)",color:"var(--cream)",
                  fontFamily:"'Playfair Display',serif",
                  boxShadow:"0 8px 24px rgba(26,24,20,.2), 0 2px 6px rgba(26,24,20,.1)"}}>
                {profile.name?initials(profile.name):"SM"}
              </div>
              {/* Shadow disc */}
              <div className="absolute -bottom-1 left-1 right-1 h-3 rounded-full"
                style={{background:"rgba(26,24,20,.12)",filter:"blur(4px)"}}/>
            </div>
            <div className="layer-mid">
              <h3 className="text-xl font-black tracking-tight"
                style={{color:C.ink,fontFamily:"'Playfair Display',serif"}}>
                {profile.name||session?.user?.name}
              </h3>
              <p className="text-sm mt-0.5" style={{color:C.stone2}}>{profile.email||session?.user?.email}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[10px] px-2 py-0.5 rounded-sm font-semibold"
                  style={{background:C.cream2,border:`1px solid ${C.border}`,color:C.ink3}}>
                  {profile.role==="architect"?"Arxitektor":profile.role||"Arxitektor"}
                </span>
                {profile.createdAt&&(
                  <span className="text-xs" style={{color:C.stone}}>
                    {formatDate(profile.createdAt)} dan beri
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </TiltCard>

      {/* Personal info */}
      <div className="card-premium p-5 space-y-4">
        <div style={{height:1,background:"linear-gradient(90deg,transparent,rgba(200,168,112,.2),transparent)",marginBottom:4}}/>
        <p style={{...labelSt,letterSpacing:".16em"}}>Shaxsiy Ma'lumotlar</p>
        <div className="space-y-3">
          {[{f:"name",l:"Ism-familiya",ph:"Sarvarbek Mamatov"},{f:"email",l:"Email",ph:"email@example.com",t:"email"}].map(x=>(
            <div key={x.f} className="space-y-1.5">
              <label style={labelSt}>{x.l}</label>
              <input type={(x as any).t||"text"} placeholder={x.ph} value={(profile as any)[x.f]}
                onChange={e=>setProfile(p=>({...p,[x.f]:e.target.value}))}
                className="w-full h-10 px-3 text-sm" style={inputSt}
                onFocus={e=>{e.target.style.borderColor=C.stone2}} onBlur={e=>{e.target.style.borderColor=C.border}}/>
            </div>
          ))}
          <button onClick={saveProfile} disabled={pSaving} className="btn-ink h-9 px-4 text-sm flex items-center gap-2">
            <Save className="h-3.5 w-3.5"/>{pSaving?"Saqlanmoqda...":"Saqlash"}
          </button>
        </div>
      </div>

      {/* Password */}
      <div className="card-premium p-5 space-y-4">
        <div style={{height:1,background:"linear-gradient(90deg,transparent,rgba(200,168,112,.2),transparent)",marginBottom:4}}/>
        <p style={{...labelSt,letterSpacing:".16em"}}>Parolni O'zgartirish</p>
        <div className="space-y-3">
          {([
            {k:"current",l:"Joriy parol",  sk:"c"  as const},
            {k:"new",    l:"Yangi parol",  sk:"n"  as const},
            {k:"confirm",l:"Tasdiqlash",   sk:"cf" as const},
          ]).map(f=>(
            <div key={f.k} className="space-y-1.5">
              <label style={labelSt}>{f.l}</label>
              <div className="relative">
                <input type={show[f.sk]?"text":"password"} placeholder="••••••••"
                  value={(pass as any)[f.k]} onChange={e=>setPass(p=>({...p,[f.k]:e.target.value}))}
                  className="w-full h-10 px-3 pr-10 text-sm" style={inputSt}
                  onFocus={e=>{e.target.style.borderColor=C.stone2}} onBlur={e=>{e.target.style.borderColor=C.border}}/>
                <button type="button" onClick={()=>setShow(s=>({...s,[f.sk]:!s[f.sk]}))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{color:C.stone}}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color=C.ink3}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color=C.stone}}>
                  {show[f.sk]?<EyeOff className="h-4 w-4"/>:<Eye className="h-4 w-4"/>}
                </button>
              </div>
            </div>
          ))}
          {pass.new&&pass.confirm&&pass.new!==pass.confirm&&(
            <p className="text-xs" style={{color:C.stone2}}>⚠ Parollar mos emas</p>
          )}
          <button onClick={savePassword} disabled={wSaving} className="btn-outline h-9 px-4 text-sm flex items-center gap-2">
            <Lock className="h-3.5 w-3.5"/>{wSaving?"O'zgartirilmoqda...":"Parolni o'zgartirish"}
          </button>
        </div>
      </div>

      {/* App info */}
      <div className="card-premium p-5">
        <div style={{height:1,background:"linear-gradient(90deg,transparent,rgba(200,168,112,.2),transparent)",marginBottom:12}}/>
        <div className="flex items-center gap-3 mb-3">
          {/* Mini column logo */}
          <div className="h-10 w-10 rounded flex items-center justify-center flex-shrink-0"
            style={{background:C.ink,boxShadow:"0 4px 12px rgba(26,24,20,.15)"}}>
            <svg width="18" height="22" viewBox="0 0 18 22" fill="none">
              <rect x="1" y="1" width="16" height="3" fill="var(--cream)" opacity=".9"/>
              <rect x="4" y="4" width="10" height="14" stroke="var(--cream)" strokeWidth=".8" fill="none"/>
              <rect x="3" y="18" width="12" height="2" fill="var(--cream)" opacity=".8"/>
              <rect x="1" y="20" width="16" height="2" fill="var(--cream)"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold" style={{color:C.ink,fontFamily:"'Playfair Display',serif"}}>
              Arxitektor Kundaligi
            </p>
            <p className="text-xs" style={{color:C.stone2}}>v1.0.0 · Next.js + Prisma + SQLite</p>
          </div>
        </div>
        <Separator style={{background:"rgba(200,168,112,.1)",margin:"12px 0"}}/>
        <p className="text-xs leading-relaxed" style={{color:C.stone2}}>
          100% bepul · Offline ishlaydi · <br/>
          Sarvarbek Mamatov uchun maxsus yaratilgan professional platforma
        </p>
      </div>
    </div>
  )
}
