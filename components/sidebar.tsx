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
  { href:"/dashboard",  label:"Dashboard",    Icon:LayoutDashboard },
  { href:"/projects",   label:"Loyihalar",    Icon:FolderKanban },
  { href:"/diary",      label:"Kundalik",     Icon:BookOpen },
  { href:"/clients",    label:"Mijozlar",     Icon:Users },
  { href:"/tasks",      label:"Vazifalar",    Icon:CheckSquare },
  { href:"/documents",  label:"Hujjatlar",    Icon:FileText },
  { href:"/finance",    label:"Moliya",       Icon:DollarSign },
  { href:"/reports",    label:"Hisobotlar",   Icon:BarChart3 },
  { href:"/contracts",  label:"Shartnomalar", Icon:FileSignature },
  { href:"/search",     label:"Qidiruv",      Icon:Search },
]

/* ─── Doric Column Logo ─── */
function DoricLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size + 4} viewBox="0 0 32 36" fill="none">
      {/* Capital abacus */}
      <rect x="2" y="4" width="28" height="3" fill="#1C1B18" opacity="0.9"/>
      {/* Capital echinus */}
      <path d="M5 7 Q16 9 27 7 L27 10 L5 10 Z" fill="#1C1B18" opacity="0.7"/>
      {/* Shaft */}
      <rect x="9" y="10" width="14" height="18" fill="none" stroke="#1C1B18" strokeWidth="1.2"/>
      {/* Fluting lines */}
      {[11,13,15,17,19,21].map(x => (
        <line key={x} x1={x} y1={10} x2={x} y2={28} stroke="#1C1B18" strokeWidth="0.4" opacity="0.3"/>
      ))}
      {/* Base */}
      <rect x="7"  y="28" width="18" height="2.5" fill="#1C1B18" opacity="0.8"/>
      <rect x="4"  y="30" width="24" height="2"   fill="#1C1B18" opacity="0.6"/>
      <rect x="2"  y="32" width="28" height="2.5" fill="#1C1B18" opacity="0.9"/>
    </svg>
  )
}

/* ─── Greek key mini motif ─── */
function GreekKey() {
  return (
    <svg viewBox="0 0 240 12" className="w-full" fill="none">
      <line x1="0" y1="1" x2="240" y2="1" stroke="#C8C2B8" strokeWidth="0.5"/>
      {Array.from({ length: 12 }, (_, i) => {
        const x = i * 20
        return (
          <g key={i}>
            <rect x={x+2} y={3} width={4} height={4} stroke="#C8C2B8" strokeWidth="0.5" fill="none"/>
            <rect x={x+8} y={3} width={4} height={4} stroke="#C8C2B8" strokeWidth="0.5" fill="none"/>
          </g>
        )
      })}
      <line x1="0" y1="11" x2="240" y2="11" stroke="#C8C2B8" strokeWidth="0.5"/>
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
        width: collapsed ? 64 : 248,
        background: "#FAFAF8",
        borderRight: "1px solid #E2DDD5",
        boxShadow: "2px 0 16px rgba(28,27,24,0.06)",
      }}
    >
      {/* Gold top accent line */}
      <div style={{ height: 2, background: "linear-gradient(90deg,transparent,#B8965A,transparent)" }}/>

      {/* ── Logo ── */}
      <div
        className={cn("flex items-center border-b h-16 px-4", collapsed && "justify-center")}
        style={{ borderColor: "#E2DDD5" }}
      >
        {!collapsed && (
          <div className="flex items-center gap-3 flex-1">
            <DoricLogo size={28} />
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#1C1B18", letterSpacing: "0.12em", lineHeight: 1.1, fontFamily: "Inter, sans-serif" }}>
                ARXITEKTOR
              </p>
              <p style={{ fontSize: 8, color: "#9A968E", letterSpacing: "0.2em", fontWeight: 500 }}>
                KUNDALIGI
              </p>
            </div>
          </div>
        )}
        {collapsed && <DoricLogo size={22} />}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "h-7 w-7 rounded flex items-center justify-center transition-colors flex-shrink-0",
            "hover:bg-[#EDE9E1]",
            collapsed && "absolute -right-3.5 top-4 border border-[#E2DDD5] bg-[#FAFAF8]"
          )}
          style={{ color: "#9A968E" }}
        >
          {collapsed ? <Menu className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {!collapsed && (
          <p style={{ fontSize: 8, color: "#C8C2B8", letterSpacing: "0.22em", fontWeight: 600,
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
                className={cn("nav-neo flex items-center gap-3 px-3 py-2.5 cursor-pointer group relative")}
                style={{
                  background: active ? "#1C1B18" : "transparent",
                  borderRadius: 3,
                }}
              >
                {/* Gold left line on hover (not active) */}
                {!active && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ width: 2, height: 14, background: "#B8965A" }}
                  />
                )}

                <Icon
                  className={cn("h-4 w-4 flex-shrink-0 transition-colors",
                    collapsed && "mx-auto"
                  )}
                  style={{ color: active ? "#F7F5F0" : "#9A968E" }}
                />

                {!collapsed && (
                  <span className="text-sm font-medium transition-colors"
                    style={{ color: active ? "#F7F5F0" : "#5A5650" }}>
                    {label}
                  </span>
                )}

                {/* Tooltip */}
                {collapsed && (
                  <div
                    className="absolute left-full ml-3 px-3 py-1.5 rounded text-xs font-medium
                      whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    style={{
                      background: "#1C1B18",
                      color: "#F7F5F0",
                      boxShadow: "0 4px 12px rgba(28,27,24,0.2)",
                    }}
                  >
                    {label}
                    <span
                      className="absolute right-full top-1/2 -translate-y-1/2"
                      style={{ borderWidth: 4, borderStyle: "solid",
                        borderColor: "transparent #1C1B18 transparent transparent" }}
                    />
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* ── Greek key ornament ── */}
      {!collapsed && (
        <div className="px-3 py-2">
          <GreekKey />
        </div>
      )}

      {/* ── User ── */}
      <div className="p-2 space-y-0.5" style={{ borderTop: "1px solid #E2DDD5" }}>
        <Link href="/profile">
          <div
            className={cn("nav-neo flex items-center gap-3 px-3 py-2.5 cursor-pointer",
              pathname === "/profile" && "active",
              collapsed && "justify-center"
            )}
          >
            <div
              className="h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
              style={{ background: "#1C1B18", color: "#F7F5F0" }}
            >
              {session?.user?.name ? initials(session.user.name) : "SM"}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold truncate" style={{ color: "#1C1B18" }}>
                  {session?.user?.name ?? "Sarvarbek Mamatov"}
                </p>
                <p className="text-[10px] truncate" style={{ color: "#9A968E" }}>
                  {session?.user?.email}
                </p>
              </div>
            )}
          </div>
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className={cn(
            "nav-neo w-full flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors",
            collapsed && "justify-center"
          )}
          style={{ color: "#9A968E" }}
        >
          <LogOut className={cn("h-4 w-4 flex-shrink-0", collapsed && "mx-auto")} />
          {!collapsed && <span className="text-sm font-medium" style={{ color: "#9A968E" }}>Chiqish</span>}
        </button>
      </div>
    </aside>
  )
}
