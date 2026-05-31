"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import {
  Building2, LayoutDashboard, FolderKanban, BookOpen,
  Users, CheckSquare, FileText, DollarSign, Search,
  LogOut, ChevronLeft, Menu, Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

const NAV = [
  { href: "/dashboard",  icon: LayoutDashboard, label: "Dashboard",   color: "text-blue-500" },
  { href: "/projects",   icon: FolderKanban,    label: "Loyihalar",   color: "text-violet-500" },
  { href: "/diary",      icon: BookOpen,         label: "Kundalik",    color: "text-emerald-500" },
  { href: "/clients",    icon: Users,            label: "Mijozlar",    color: "text-orange-500" },
  { href: "/tasks",      icon: CheckSquare,      label: "Vazifalar",   color: "text-pink-500" },
  { href: "/documents",  icon: FileText,         label: "Hujjatlar",   color: "text-cyan-500" },
  { href: "/finance",    icon: DollarSign,       label: "Moliya",      color: "text-green-500" },
  { href: "/search",     icon: Search,           label: "Qidiruv",     color: "text-yellow-500" },
]

export function Sidebar() {
  const pathname  = usePathname()
  const { data: session } = useSession()
  const [collapsed, setCollapsed] = useState(false)

  const initials = (name: string) =>
    name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full flex flex-col z-40 transition-all duration-300 ease-in-out",
        "bg-white dark:bg-[#0a1628] border-r border-slate-100 dark:border-slate-800/60",
        collapsed ? "w-[70px]" : "w-[240px]"
      )}
      style={{ boxShadow: "4px 0 24px rgba(0,0,0,0.04)" }}
    >
      {/* ── Logo ── */}
      <div className={cn(
        "flex items-center border-b border-slate-100 dark:border-slate-800/60 h-16 px-4",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="relative h-9 w-9 flex-shrink-0">
              <div className="absolute inset-0 bg-blue-600 rounded-xl rotate-3 opacity-80" />
              <div className="absolute inset-0 bg-blue-500 rounded-xl flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="leading-tight">
              <p className="font-bold text-sm text-slate-900 dark:text-white tracking-tight">Arxitektor</p>
              <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">Kundaligi</p>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="relative h-9 w-9">
            <div className="absolute inset-0 bg-blue-600 rounded-xl rotate-3 opacity-80" />
            <div className="absolute inset-0 bg-blue-500 rounded-xl flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "h-7 w-7 rounded-lg flex items-center justify-center",
            "text-slate-400 hover:text-slate-600 hover:bg-slate-100",
            "dark:hover:text-slate-300 dark:hover:bg-slate-800",
            "transition-all duration-200",
            collapsed && "absolute -right-3 top-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm"
          )}
        >
          {collapsed
            ? <Menu className="h-3.5 w-3.5" />
            : <ChevronLeft className="h-3.5 w-3.5" />
          }
        </button>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {/* Section label */}
        {!collapsed && (
          <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-widest px-2 pb-2">
            Asosiy
          </p>
        )}

        {NAV.map(({ href, icon: Icon, label, color }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"))
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                "relative flex items-center gap-3 rounded-xl transition-all duration-200 group",
                collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5",
                active
                  ? "nav-active text-blue-600 dark:text-blue-400"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-700 dark:hover:text-slate-200"
              )}
            >
              {/* Active indicator */}
              {active && !collapsed && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-500 rounded-r-full" />
              )}

              {/* Icon container */}
              <div className={cn(
                "flex items-center justify-center h-8 w-8 rounded-lg flex-shrink-0 transition-all duration-200",
                active
                  ? "bg-blue-50 dark:bg-blue-950/50"
                  : "group-hover:bg-slate-100 dark:group-hover:bg-slate-800"
              )}>
                <Icon className={cn(
                  "h-4 w-4 transition-all duration-200",
                  active ? color : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                )} />
              </div>

              {!collapsed && (
                <span className={cn(
                  "text-sm font-medium transition-all duration-200",
                  active ? "text-blue-700 dark:text-blue-400" : ""
                )}>
                  {label}
                </span>
              )}

              {/* Tooltip for collapsed */}
              {collapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 dark:bg-slate-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                  {label}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900 dark:border-r-slate-700" />
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* ── User section ── */}
      <div className="border-t border-slate-100 dark:border-slate-800/60 p-3 space-y-1">
        {/* Profile link */}
        <Link
          href="/profile"
          title={collapsed ? "Profil" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-xl transition-all duration-200 group",
            collapsed ? "justify-center px-2 py-2.5" : "px-2 py-2.5",
            pathname === "/profile"
              ? "bg-blue-50 dark:bg-blue-950/30 text-blue-600"
              : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
          )}
        >
          <div className="relative flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
              {session?.user?.name ? initials(session.user.name) : "A"}
            </div>
            <div className="absolute bottom-0 right-0 h-2 w-2 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-900" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                {session?.user?.name ?? "Arxitektor"}
              </p>
              <p className="text-[10px] text-slate-400 truncate">{session?.user?.email}</p>
            </div>
          )}
        </Link>

        {/* Logout */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          title={collapsed ? "Chiqish" : undefined}
          className={cn(
            "w-full flex items-center gap-3 rounded-xl transition-all duration-200",
            "text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500",
            collapsed ? "justify-center px-2 py-2.5" : "px-2 py-2.5"
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
