"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { LayoutDashboard, FolderKanban, BookOpen, Users, CheckSquare, FileText, DollarSign, Search, LogOut, ChevronLeft, Menu, BarChart3, FileSignature } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

const NAV = [
  { href:"/dashboard",  label:"Dashboard",    emoji:"🏠", color:"#DAA520" },
  { href:"/projects",   label:"Loyihalar",    emoji:"📐", color:"#3B82F6" },
  { href:"/diary",      label:"Kundalik",     emoji:"📖", color:"#10B981" },
  { href:"/clients",    label:"Mijozlar",     emoji:"👥", color:"#8B5CF6" },
  { href:"/tasks",      label:"Vazifalar",    emoji:"✅", color:"#F43F5E" },
  { href:"/documents",  label:"Hujjatlar",    emoji:"📁", color:"#06B6D4" },
  { href:"/finance",    label:"Moliya",       emoji:"💰", color:"#22C55E" },
  { href:"/reports",    label:"Hisobotlar",   emoji:"📊", color:"#F97316" },
  { href:"/contracts",  label:"Shartnomalar", emoji:"📜", color:"#6366F1" },
  { href:"/search",     label:"Qidiruv",      emoji:"🔍", color:"#94A3B8" },
]

// Arch logo SVG
const ArchLogo = () => (
  <svg viewBox="0 0 36 36" width="22" height="22" fill="none">
    <polygon points="18,2 34,10 34,26 18,34 2,26 2,10" stroke="white" strokeWidth="1.5" opacity="0.9"/>
    <path d="M6 34 L6 18 Q6 8 18 8 Q30 8 30 18 L30 34" stroke="white" strokeWidth="1.5" fill="none" opacity="0.8"/>
    <line x1="18" y1="8" x2="18" y2="34" stroke="white" strokeWidth="0.8" opacity="0.4"/>
  </svg>
)

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [collapsed, setCollapsed] = useState(false)
  const initials = (name: string) => name.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2)

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-full flex flex-col z-40 transition-all duration-300 ease-in-out",
      "bg-[#0A1628] border-r border-[#DAA520]/12",
      collapsed ? "w-[66px]" : "w-[240px]"
    )} style={{boxShadow:"4px 0 32px rgba(0,0,0,0.4)"}}>

      {/* Subtle hex pattern overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{backgroundImage:`url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolygon points='20,2 38,11 38,29 20,38 2,29 2,11' fill='none' stroke='%23DAA520' stroke-width='0.5'/%3E%3C/svg%3E")`}}/>

      {/* Logo */}
      <div className={cn(
        "relative z-10 flex items-center border-b border-[#DAA520]/10 h-16 px-4",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 flex-shrink-0">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#DAA520] to-[#966B08] flex items-center justify-center shadow-[0_0_20px_rgba(218,165,32,0.35)]">
                <ArchLogo />
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-none tracking-tight">Arxitektor</p>
              <p className="text-[10px] text-[#DAA520]/60 tracking-[0.2em] uppercase mt-0.5">Kundaligi</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#DAA520] to-[#966B08] flex items-center justify-center shadow-[0_0_14px_rgba(218,165,32,0.3)]">
            <ArchLogo />
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "h-7 w-7 rounded-lg flex items-center justify-center transition-all",
            "text-[#DAA520]/40 hover:text-[#DAA520] hover:bg-[#DAA520]/10",
            collapsed && "absolute -right-3.5 top-5 bg-[#0A1628] border border-[#DAA520]/20 shadow-md"
          )}>
          {collapsed ? <Menu className="h-3.5 w-3.5"/> : <ChevronLeft className="h-3.5 w-3.5"/>}
        </button>
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {!collapsed && (
          <p className="text-[9px] font-bold text-[#DAA520]/30 uppercase tracking-[0.25em] px-3 pb-2">
            ✦ Asosiy
          </p>
        )}
        {NAV.map(({ href, label, emoji, color }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"))
          return (
            <Link key={href} href={href} title={collapsed ? label : undefined}
              className={cn(
                "relative flex items-center gap-3 rounded-xl transition-all duration-200 group",
                collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5",
                active ? "nav-active" : "hover:bg-white/[0.05]"
              )}>
              {active && !collapsed && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full" style={{background:color}}/>
              )}
              <div className={cn(
                "flex items-center justify-center h-7 w-7 rounded-lg text-base flex-shrink-0 transition-all",
                active ? "shadow-md" : ""
              )} style={active ? {background:`${color}22`, boxShadow:`0 0 12px ${color}22`} : {}}>
                <span className="leading-none">{emoji}</span>
              </div>
              {!collapsed && (
                <span className={cn(
                  "text-sm font-medium transition-colors",
                  active ? "text-[#DAA520]" : "text-white/50 group-hover:text-white/80"
                )}>
                  {label}
                </span>
              )}
              {collapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#0A1628] border border-[#DAA520]/20 text-white text-xs rounded-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50 shadow-xl">
                  {label}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#0A1628]"/>
                </div>
              )}
            </Link>
          )
        })}
        {/* Ornament divider */}
        {!collapsed && (
          <div className="flex items-center gap-2 py-2 px-3 opacity-20">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#DAA520] to-transparent"/>
            <svg width="12" height="12" viewBox="0 0 12 12"><polygon points="6,1 11,3.5 11,8.5 6,11 1,8.5 1,3.5" fill="none" stroke="#DAA520" strokeWidth="1"/></svg>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#DAA520] to-transparent"/>
          </div>
        )}
      </nav>

      {/* User */}
      <div className="relative z-10 border-t border-[#DAA520]/10 p-2 space-y-0.5">
        <Link href="/profile"
          className={cn(
            "flex items-center gap-3 rounded-xl transition-all group",
            collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5",
            pathname === "/profile" ? "nav-active" : "hover:bg-white/[0.05]"
          )}>
          <div className="relative flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#DAA520] to-[#966B08] flex items-center justify-center text-white text-xs font-bold shadow-[0_0_12px_rgba(218,165,32,0.3)]">
              {session?.user?.name ? initials(session.user.name) : "ST"}
            </div>
            <div className="absolute bottom-0 right-0 h-2 w-2 bg-emerald-400 rounded-full border-2 border-[#0A1628]"/>
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white/80 truncate">{session?.user?.name ?? "Sarvarbek"}</p>
              <p className="text-[10px] text-[#DAA520]/40 truncate">{session?.user?.email}</p>
            </div>
          )}
        </Link>
        <button onClick={() => signOut({ callbackUrl: "/login" })}
          className={cn(
            "w-full flex items-center gap-3 rounded-xl transition-all",
            "text-white/30 hover:bg-red-500/10 hover:text-red-400",
            collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"
          )}>
          <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0">
            <LogOut className="h-3.5 w-3.5"/>
          </div>
          {!collapsed && <span className="text-sm font-medium">Chiqish</span>}
        </button>
      </div>
    </aside>
  )
}
