"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import {
  LayoutDashboard, FolderKanban, BookOpen, Users, CheckSquare,
  FileText, DollarSign, BarChart3, FileSignature, Search,
  LogOut, ChevronLeft, Menu,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

const NAV = [
  { href: "/dashboard",  label: "Dashboard",    Icon: LayoutDashboard },
  { href: "/projects",   label: "Loyihalar",    Icon: FolderKanban },
  { href: "/diary",      label: "Kundalik",     Icon: BookOpen },
  { href: "/clients",    label: "Mijozlar",     Icon: Users },
  { href: "/tasks",      label: "Vazifalar",    Icon: CheckSquare },
  { href: "/documents",  label: "Hujjatlar",    Icon: FileText },
  { href: "/finance",    label: "Moliya",       Icon: DollarSign },
  { href: "/reports",    label: "Hisobotlar",   Icon: BarChart3 },
  { href: "/contracts",  label: "Shartnomalar", Icon: FileSignature },
  { href: "/search",     label: "Qidiruv",      Icon: Search },
]

/* Architectural arch logo */
function ArchMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M4 30 L4 16 Q4 4 16 4 Q28 4 28 16 L28 30"
        stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M8 30 L8 18 Q8 8 16 8 Q24 8 24 18 L24 30"
        stroke="#888" strokeWidth="1" strokeLinecap="round"/>
      {/* Keystone */}
      <rect x="14" y="2" width="4" height="4" fill="#fff" opacity="0.7"/>
      {/* Window row */}
      {[10, 15, 20].map(x => (
        <rect key={x} x={x} y="18" width="2.5" height="3.5" stroke="#666" strokeWidth="0.7" fill="none"/>
      ))}
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
      className={cn("fixed left-0 top-0 h-full flex flex-col z-40 transition-all duration-300")}
      style={{
        width: collapsed ? 60 : 240,
        background: "#080808",
        borderRight: "1px solid #1a1a1a",
        boxShadow: "1px 0 0 #111",
      }}
    >
      {/* Top accent line */}
      <div style={{ height: 1, background: "linear-gradient(90deg,transparent,#333,transparent)" }} />

      {/* ── Logo ── */}
      <div
        className={cn("flex items-center h-14 px-3 border-b", collapsed && "justify-center")}
        style={{ borderColor: "#1a1a1a" }}
      >
        {!collapsed && (
          <div className="flex items-center gap-3 flex-1">
            <ArchMark size={26} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#f0f0f0", letterSpacing: "0.02em", lineHeight: 1.1 }}>
                ARXITEKTOR
              </p>
              <p style={{ fontSize: 9, color: "#444", letterSpacing: "0.18em", fontWeight: 500 }}>
                KUNDALIGI
              </p>
            </div>
          </div>
        )}
        {collapsed && <ArchMark size={22} />}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "h-7 w-7 rounded flex items-center justify-center transition-colors flex-shrink-0",
            "text-[#333] hover:text-[#888] hover:bg-[#1a1a1a]",
            collapsed && "absolute -right-3.5 top-4 border border-[#1a1a1a]"
          )}
          style={collapsed ? { background: "#080808" } : {}}
        >
          {collapsed ? <Menu className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {!collapsed && (
          <p style={{ fontSize: 9, color: "#333", letterSpacing: "0.2em", fontWeight: 600,
            textTransform: "uppercase", padding: "4px 8px 8px" }}>
            Navigatsiya
          </p>
        )}

        {NAV.map(({ href, label, Icon }) => {
          const active = pathname === href ||
            (href !== "/dashboard" && pathname.startsWith(href + "/"))
          return (
            <Link key={href} href={href} title={collapsed ? label : undefined}>
              <div
                className={cn(
                  "nav-item flex items-center gap-3 px-2.5 py-2.5 cursor-pointer group relative",
                  active && "active",
                  collapsed && "justify-center px-2"
                )}
              >
                {/* Left border on active */}
                {active && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r"
                    style={{ width: 2, height: 18, background: "#fff" }}
                  />
                )}

                <Icon
                  className={cn("h-4 w-4 flex-shrink-0 transition-colors")}
                  style={{ color: active ? "#f0f0f0" : "#444" }}
                />

                {!collapsed && (
                  <span
                    className="text-sm font-medium transition-colors"
                    style={{ color: active ? "#f0f0f0" : "#555" }}
                  >
                    {label}
                  </span>
                )}

                {/* Tooltip */}
                {collapsed && (
                  <div
                    className="absolute left-full ml-3 px-3 py-1.5 rounded text-xs font-medium
                      whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    style={{
                      background: "#1f1f1f",
                      border: "1px solid #2a2a2a",
                      color: "#f0f0f0",
                      boxShadow: "0 4px 16px rgba(0,0,0,.6)",
                    }}
                  >
                    {label}
                    <span
                      className="absolute right-full top-1/2 -translate-y-1/2"
                      style={{ borderWidth: 4, borderStyle: "solid",
                        borderColor: "transparent #1f1f1f transparent transparent" }}
                    />
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* ── User ── */}
      <div className="p-2 space-y-0.5" style={{ borderTop: "1px solid #1a1a1a" }}>
        <Link href="/profile">
          <div
            className={cn(
              "nav-item flex items-center gap-3 px-2.5 py-2.5 cursor-pointer",
              pathname === "/profile" && "active",
              collapsed && "justify-center"
            )}
          >
            <div
              className="h-7 w-7 rounded flex items-center justify-center flex-shrink-0 text-xs font-bold"
              style={{ background: "#1f1f1f", border: "1px solid #2a2a2a", color: "#888" }}
            >
              {session?.user?.name ? initials(session.user.name) : "ST"}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold truncate" style={{ color: "#ccc" }}>
                  {session?.user?.name ?? "Sarvarbek Tursunov"}
                </p>
                <p className="text-[10px] truncate" style={{ color: "#444" }}>
                  {session?.user?.email}
                </p>
              </div>
            )}
          </div>
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className={cn(
            "nav-item w-full flex items-center gap-3 px-2.5 py-2.5 cursor-pointer transition-colors",
            collapsed && "justify-center"
          )}
          style={{ color: "#444" }}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && (
            <span className="text-sm font-medium" style={{ color: "#444" }}>
              Chiqish
            </span>
          )}
        </button>
      </div>
    </aside>
  )
}
