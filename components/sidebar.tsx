"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import {
  Building2, LayoutDashboard, FolderKanban, BookOpen,
  Users, CheckSquare, FileText, DollarSign, Search,
  LogOut, ChevronLeft, Menu, BarChart3, FileSignature,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

const NAV = [
  { href: "/dashboard",  icon: LayoutDashboard,  label: "Dashboard",    color: "text-amber-500",   bg: "bg-amber-50 dark:bg-amber-950/30" },
  { href: "/projects",   icon: FolderKanban,      label: "Loyihalar",    color: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-950/30" },
  { href: "/diary",      icon: BookOpen,           label: "Kundalik",     color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
  { href: "/clients",    icon: Users,              label: "Mijozlar",     color: "text-violet-600",  bg: "bg-violet-50 dark:bg-violet-950/30" },
  { href: "/tasks",      icon: CheckSquare,        label: "Vazifalar",    color: "text-rose-500",    bg: "bg-rose-50 dark:bg-rose-950/30" },
  { href: "/documents",  icon: FileText,           label: "Hujjatlar",    color: "text-cyan-600",    bg: "bg-cyan-50 dark:bg-cyan-950/30" },
  { href: "/finance",    icon: DollarSign,         label: "Moliya",       color: "text-green-600",   bg: "bg-green-50 dark:bg-green-950/30" },
  { href: "/reports",    icon: BarChart3,          label: "Hisobotlar",   color: "text-orange-500",  bg: "bg-orange-50 dark:bg-orange-950/30" },
  { href: "/contracts",  icon: FileSignature,      label: "Shartnomalar", color: "text-indigo-600",  bg: "bg-indigo-50 dark:bg-indigo-950/30" },
  { href: "/search",     icon: Search,             label: "Qidiruv",      color: "text-slate-500",   bg: "bg-slate-50 dark:bg-slate-800" },
]

// Decorative SVG ornament
function OrnamentSVG({ size = 32, opacity = 0.15 }: { size?: number; opacity?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" style={{ opacity }}>
      <polygon points="20,2 38,11 38,29 20,38 2,29 2,11" fill="none" stroke="currentColor" strokeWidth="1"/>
      <polygon points="20,8 32,14 32,26 20,32 8,26 8,14" fill="none" stroke="currentColor" strokeWidth="0.7"/>
      <circle cx="20" cy="20" r="5" fill="none" stroke="currentColor" strokeWidth="0.7"/>
      <line x1="20" y1="2" x2="20" y2="38" stroke="currentColor" strokeWidth="0.4"/>
      <line x1="2" y1="20" x2="38" y2="20" stroke="currentColor" strokeWidth="0.4"/>
    </svg>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [collapsed, setCollapsed] = useState(false)

  const initials = (name: string) =>
    name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full flex flex-col z-40 transition-all duration-300 ease-in-out",
        "border-r",
        // Light: ivory with islimi pattern
        "bg-[#fdf8ef] border-[#e8d8b0]",
        // Dark
        "dark:bg-[#0e0b04] dark:border-[#2a1e08]",
        collapsed ? "w-[68px]" : "w-[248px]"
      )}
      style={{ boxShadow: "4px 0 24px rgba(200,146,42,0.08)" }}
    >
      {/* Girih pattern overlay */}
      <div className="absolute inset-0 pointer-events-none bg-girih opacity-100" />

      {/* ── Logo ── */}
      <div className={cn(
        "relative z-10 flex items-center border-b border-[#e8d8b0] dark:border-[#2a1e08] h-16 px-4",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            {/* Logo with ornament */}
            <div className="relative h-10 w-10 flex-shrink-0">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 rotate-3" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center border border-amber-300/40">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              {/* Corner ornament */}
              <div className="absolute -top-1 -right-1 text-amber-500">
                <OrnamentSVG size={12} opacity={0.4} />
              </div>
            </div>
            <div className="leading-tight">
              <p className="font-bold text-sm text-[#3d2800] dark:text-amber-100 tracking-tight">Arxitektor</p>
              <p className="text-[9px] text-amber-600/70 dark:text-amber-500/70 font-semibold tracking-widest uppercase">Kundaligi</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="relative h-9 w-9">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "h-7 w-7 rounded-lg flex items-center justify-center transition-all",
            "text-amber-700/60 hover:text-amber-800 hover:bg-amber-100/60",
            "dark:text-amber-500/60 dark:hover:text-amber-400 dark:hover:bg-amber-900/30",
            collapsed && "absolute -right-3.5 top-5 bg-[#fdf8ef] dark:bg-[#0e0b04] border border-[#e8d8b0] dark:border-[#2a1e08] shadow-sm"
          )}
        >
          {collapsed ? <Menu className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="relative z-10 flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5">
        {!collapsed && (
          <p className="text-[9px] font-bold text-amber-700/50 dark:text-amber-600/50 uppercase tracking-widest px-2.5 pb-2">
            ✦ Asosiy bo'limlar
          </p>
        )}

        {NAV.map(({ href, icon: Icon, label, color, bg }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"))
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                "relative flex items-center gap-3 rounded-xl transition-all duration-200 group",
                collapsed ? "justify-center px-2 py-2.5" : "px-2.5 py-2.5",
                active
                  ? "nav-active"
                  : "hover:bg-amber-50/80 dark:hover:bg-amber-950/20"
              )}
            >
              {/* Active dot */}
              {active && !collapsed && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-amber-500 rounded-r-full" />
              )}

              {/* Icon */}
              <div className={cn(
                "flex items-center justify-center h-8 w-8 rounded-lg flex-shrink-0 transition-all",
                active ? bg : "group-hover:" + bg.split(" ")[0]
              )}>
                <Icon className={cn(
                  "h-4 w-4 transition-colors",
                  active ? color : "text-amber-700/50 dark:text-amber-600/50 group-hover:" + color
                )} />
              </div>

              {!collapsed && (
                <span className={cn(
                  "text-sm font-medium transition-colors",
                  active
                    ? "text-amber-800 dark:text-amber-300"
                    : "text-[#5a3d10]/70 dark:text-amber-200/60 group-hover:text-[#3d2800] dark:group-hover:text-amber-200"
                )}>
                  {label}
                </span>
              )}

              {/* Tooltip */}
              {collapsed && (
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#3d2800] dark:bg-amber-900 text-amber-100 text-xs rounded-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50 shadow-lg">
                  {label}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#3d2800] dark:border-r-amber-900" />
                </div>
              )}
            </Link>
          )
        })}

        {/* Ornament divider */}
        {!collapsed && (
          <div className="ornament-divider py-2 text-amber-400/40 text-xs px-2">✦</div>
        )}
      </nav>

      {/* ── User section ── */}
      <div className="relative z-10 border-t border-[#e8d8b0] dark:border-[#2a1e08] p-2.5 space-y-0.5">
        {/* Decorative ornament top */}
        {!collapsed && (
          <div className="flex justify-center mb-1 opacity-20">
            <OrnamentSVG size={20} opacity={1} />
          </div>
        )}

        <Link
          href="/profile"
          className={cn(
            "flex items-center gap-3 rounded-xl transition-all group",
            collapsed ? "justify-center px-2 py-2.5" : "px-2.5 py-2.5",
            pathname === "/profile"
              ? "bg-amber-100/60 dark:bg-amber-950/30"
              : "hover:bg-amber-50/80 dark:hover:bg-amber-950/20"
          )}
        >
          <div className="relative flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center text-white text-xs font-bold shadow-md">
              {session?.user?.name ? initials(session.user.name) : "A"}
            </div>
            <div className="absolute bottom-0 right-0 h-2 w-2 bg-emerald-400 rounded-full border-2 border-[#fdf8ef] dark:border-[#0e0b04]" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[#3d2800] dark:text-amber-200 truncate">
                {session?.user?.name ?? "Arxitektor"}
              </p>
              <p className="text-[10px] text-amber-600/60 dark:text-amber-500/50 truncate">
                {session?.user?.email}
              </p>
            </div>
          )}
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className={cn(
            "w-full flex items-center gap-3 rounded-xl transition-all",
            "text-amber-700/50 dark:text-amber-600/50 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400",
            collapsed ? "justify-center px-2 py-2.5" : "px-2.5 py-2.5"
          )}
        >
          <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0">
            <LogOut className="h-4 w-4" />
          </div>
          {!collapsed && <span className="text-sm font-medium">Chiqish</span>}
        </button>
      </div>
    </aside>
  )
}
