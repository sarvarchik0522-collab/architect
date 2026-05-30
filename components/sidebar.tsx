"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import {
  Building2, LayoutDashboard, FolderKanban, BookOpen,
  Users, CheckSquare, FileText, DollarSign, Search,
  User, LogOut, ChevronLeft, Menu,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const NAV = [
  { href: "/dashboard",  icon: LayoutDashboard, label: "Dashboard" },
  { href: "/projects",   icon: FolderKanban,    label: "Loyihalar" },
  { href: "/diary",      icon: BookOpen,         label: "Kundalik" },
  { href: "/clients",    icon: Users,            label: "Mijozlar" },
  { href: "/tasks",      icon: CheckSquare,      label: "Vazifalar" },
  { href: "/documents",  icon: FileText,         label: "Hujjatlar" },
  { href: "/finance",    icon: DollarSign,       label: "Moliya" },
  { href: "/search",     icon: Search,           label: "Qidiruv" },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-full bg-slate-900 dark:bg-slate-950 text-white flex flex-col z-40 transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Logo */}
      <div className={cn("flex items-center border-b border-slate-700/50 p-4", collapsed ? "justify-center" : "justify-between")}>
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div className="leading-tight">
              <p className="font-bold text-sm">Arxitektor</p>
              <p className="text-xs text-slate-400">Kundaligi</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="h-9 w-9 bg-blue-500 rounded-xl flex items-center justify-center">
            <Building2 className="h-5 w-5 text-white" />
          </div>
        )}
        {!collapsed && (
          <Button variant="ghost" size="icon" onClick={() => setCollapsed(true)}
            className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {collapsed && (
        <button onClick={() => setCollapsed(false)}
          className="flex items-center justify-center py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors">
          <Menu className="h-4 w-4" />
        </button>
      )}

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"))
          return (
            <Link key={href} href={href}
              title={collapsed ? label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group",
                active ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-700/70 hover:text-white",
                collapsed && "justify-center px-2"
              )}>
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-slate-700/50 space-y-0.5">
        <Link href="/profile" title={collapsed ? "Profil" : undefined}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-700/70 hover:text-white transition-all",
            collapsed && "justify-center px-2",
            pathname === "/profile" && "bg-blue-600 text-white"
          )}>
          <div className="h-7 w-7 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
            <User className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{session?.user?.name ?? "Foydalanuvchi"}</p>
              <p className="text-xs text-slate-400 truncate">{session?.user?.email}</p>
            </div>
          )}
        </Link>
        <button onClick={() => signOut({ callbackUrl: "/login" })}
          title={collapsed ? "Chiqish" : undefined}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-all",
            collapsed && "justify-center px-2"
          )}>
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Chiqish</span>}
        </button>
      </div>
    </aside>
  )
}
