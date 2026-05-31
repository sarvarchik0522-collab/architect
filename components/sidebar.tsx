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
  { href:"/dashboard",  label:"Dashboard",    Icon:LayoutDashboard  },
  { href:"/projects",   label:"Loyihalar",    Icon:FolderKanban     },
  { href:"/diary",      label:"Kundalik",     Icon:BookOpen         },
  { href:"/clients",    label:"Mijozlar",     Icon:Users            },
  { href:"/tasks",      label:"Vazifalar",    Icon:CheckSquare      },
  { href:"/documents",  label:"Hujjatlar",    Icon:FileText         },
  { href:"/finance",    label:"Moliya",       Icon:DollarSign       },
  { href:"/reports",    label:"Hisobotlar",   Icon:BarChart3        },
  { href:"/contracts",  label:"Shartnomalar", Icon:FileSignature    },
  { href:"/search",     label:"Qidiruv",      Icon:Search           },
]

/* ── Doric column SVG logo mark ── */
function DoricMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size + 6} viewBox="0 0 32 38" fill="none">
      {/* Abacus */}
      <rect x="1"  y="3"  width="30" height="4" fill="var(--ink)" opacity=".88"/>
      {/* Echinus */}
      <path d="M3 7 Q16 11 29 7 L29 13 L3 13 Z"
        fill="var(--ink)" opacity=".15" stroke="var(--ink)" strokeWidth=".6"/>
      {/* Shaft */}
      <rect x="8" y="13" width="16" height="18"
        stroke="var(--ink)" strokeWidth="1.1" fill="none"/>
      {/* Flutes */}
      {[10,12.5,15,17.5,20,22.5].map(x => (
        <line key={x} x1={x} y1={13} x2={x - .4} y2={31}
          stroke="var(--ink)" strokeWidth=".3" opacity=".22"/>
      ))}
      {/* Base */}
      <rect x="6"  y="31" width="20" height="3" fill="var(--ink)" opacity=".78"/>
      <rect x="3"  y="34" width="26" height="2" fill="var(--ink)" opacity=".65"/>
      <rect x="1"  y="36" width="30" height="2.5" fill="var(--ink)" opacity=".88"/>
    </svg>
  )
}

/* ── Greek key meander divider ── */
function GreekKeyDivider() {
  return (
    <svg viewBox="0 0 220 14" className="w-full" fill="none">
      <line x1="0" y1="1" x2="220" y2="1" stroke="rgba(200,168,112,.25)" strokeWidth=".5"/>
      {Array.from({ length: 11 }, (_, i) => {
        const x = i * 20 + 2
        return (
          <g key={i}>
            <rect x={x}    y={3}  width={4}  height={4} stroke="rgba(200,168,112,.2)" strokeWidth=".5" fill="none"/>
            <rect x={x+8}  y={3}  width={4}  height={4} stroke="rgba(200,168,112,.2)" strokeWidth=".5" fill="none"/>
            <rect x={x+4}  y={7}  width={4}  height={4} stroke="rgba(200,168,112,.15)" strokeWidth=".4" fill="none"/>
          </g>
        )
      })}
      <line x1="0" y1="13" x2="220" y2="13" stroke="rgba(200,168,112,.25)" strokeWidth=".5"/>
    </svg>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [collapsed, setCollapsed] = useState(false)

  const initials = (n: string) => n.split(" ").map(x => x[0]).join("").toUpperCase().slice(0, 2)

  return (
    <aside
      className="fixed left-0 top-0 h-full flex flex-col z-40 transition-all duration-300"
      style={{
        width: collapsed ? 64 : 248,
        background: "var(--white)",
        borderRight: "1px solid rgba(200,168,112,.14)",
        boxShadow: "2px 0 20px rgba(26,24,20,.06)",
      }}
    >
      {/* Gold cornice top */}
      <div style={{ height: 2, flexShrink: 0,
        background: "linear-gradient(90deg,transparent,var(--gold),var(--gold2),var(--gold),transparent)" }} />

      {/* ── Logo ── */}
      <div
        className={cn("flex items-center border-b h-14 px-3.5 flex-shrink-0",
          collapsed && "justify-center")}
        style={{ borderColor: "rgba(200,168,112,.12)" }}
      >
        {!collapsed && (
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <DoricMark size={26} />
            <div className="min-w-0">
              <p style={{ fontSize: 10, fontWeight: 800, color: "var(--ink)",
                letterSpacing: "0.12em", fontFamily: "Inter, sans-serif", lineHeight: 1 }}>
                ARXITEKTOR
              </p>
              <p style={{ fontSize: 8, color: "var(--stone2)",
                letterSpacing: "0.18em", fontFamily: "Inter, sans-serif" }}>
                KUNDALIGI
              </p>
            </div>
          </div>
        )}
        {collapsed && <DoricMark size={22} />}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "h-7 w-7 rounded flex items-center justify-center transition-colors flex-shrink-0",
            "hover:bg-[var(--cream2)]",
            collapsed && "absolute -right-3.5 top-[18px] z-50",
          )}
          style={{
            color: "var(--stone2)",
            ...(collapsed ? {
              background: "var(--white)",
              border: "1px solid rgba(200,168,112,.18)",
              boxShadow: "2px 0 8px rgba(26,24,20,.06)",
            } : {}),
          }}
        >
          {collapsed ? <Menu className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* ── Frieze band under logo ── */}
      {!collapsed && (
        <div className="flex-shrink-0 px-3 py-1.5 frieze-band">
          <span style={{ fontSize: 8, color: "var(--stone)", letterSpacing: "0.14em",
            textTransform: "uppercase", fontWeight: 600 }}>
            Navigatsiya
          </span>
        </div>
      )}

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname === href ||
            (href !== "/dashboard" && pathname.startsWith(href + "/"))
          return (
            <Link key={href} href={href} title={collapsed ? label : undefined}>
              <div
                className={cn(
                  "nav-item flex items-center gap-3 px-2.5 py-2.5 cursor-pointer group",
                  active && "active",
                  collapsed && "justify-center px-2",
                )}
                style={{
                  background: active ? "var(--ink)" : undefined,
                  position: "relative",
                }}
              >
                <Icon
                  className={cn("h-4 w-4 flex-shrink-0 transition-colors")}
                  style={{ color: active ? "var(--cream)" : "var(--stone2)" }}
                />
                {!collapsed && (
                  <span className="text-sm font-medium transition-colors"
                    style={{ color: active ? "var(--cream)" : "var(--ink3)" }}>
                    {label}
                  </span>
                )}
                {/* Active gold dot */}
                {active && !collapsed && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full flex-shrink-0"
                    style={{ background: "var(--gold)", boxShadow: "0 0 6px var(--gold)" }} />
                )}
                {/* Tooltip */}
                {collapsed && (
                  <div
                    className="absolute left-full ml-3 px-3 py-1.5 rounded text-xs font-medium
                      whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 transition-opacity
                      pointer-events-none"
                    style={{
                      background: "var(--ink)", color: "var(--cream)",
                      boxShadow: "0 4px 16px rgba(26,24,20,.2)",
                    }}
                  >
                    {label}
                    <span
                      className="absolute right-full top-1/2 -translate-y-1/2"
                      style={{ borderWidth: 4, borderStyle: "solid",
                        borderColor: "transparent var(--ink) transparent transparent" }}
                    />
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* ── Greek key divider ── */}
      {!collapsed && (
        <div className="px-3 py-1 flex-shrink-0">
          <GreekKeyDivider />
        </div>
      )}

      {/* ── User section ── */}
      <div className="flex-shrink-0 p-2 space-y-0.5"
        style={{ borderTop: "1px solid rgba(200,168,112,.1)" }}>

        {/* Profile */}
        <Link href="/profile">
          <div
            className={cn(
              "nav-item flex items-center gap-3 px-2.5 py-2.5 cursor-pointer",
              pathname === "/profile" && "active",
              collapsed && "justify-center",
            )}
          >
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0
                text-xs font-black"
              style={{ background: "var(--ink)", color: "var(--cream)",
                boxShadow: "0 2px 8px rgba(26,24,20,.15)",
                fontFamily: "'Playfair Display', serif" }}
            >
              {session?.user?.name ? initials(session.user.name) : "SM"}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold truncate" style={{ color: "var(--ink)" }}>
                  {session?.user?.name ?? "Sarvarbek Mamatov"}
                </p>
                <p className="text-[10px] truncate" style={{ color: "var(--stone2)" }}>
                  {session?.user?.email}
                </p>
              </div>
            )}
          </div>
        </Link>

        {/* Logout */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className={cn(
            "nav-item w-full flex items-center gap-3 px-2.5 py-2.5 cursor-pointer",
            collapsed && "justify-center",
          )}
          style={{ color: "var(--stone2)" }}
        >
          <LogOut className={cn("h-4 w-4 flex-shrink-0")} />
          {!collapsed && (
            <span className="text-sm font-medium" style={{ color: "var(--stone2)" }}>
              Chiqish
            </span>
          )}
        </button>

        {/* Brand footer */}
        {!collapsed && (
          <p className="text-center py-1"
            style={{ fontSize: 7, color: "var(--stone)",
              letterSpacing: "0.2em", textTransform: "uppercase" }}>
            ✦ SARVARBEK MAMATOV ✦
          </p>
        )}
      </div>
    </aside>
  )
}
