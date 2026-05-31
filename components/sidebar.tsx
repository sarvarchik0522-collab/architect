"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { LogOut, ChevronLeft, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

const NAV = [
  { href: "/dashboard",  label: "Dashboard",    emoji: "🏠", color: "#C9933A" },
  { href: "/projects",   label: "Loyihalar",    emoji: "📐", color: "#3B82F6" },
  { href: "/diary",      label: "Kundalik",     emoji: "📖", color: "#2E8B82" },
  { href: "/clients",    label: "Mijozlar",     emoji: "👥", color: "#8B5CF6" },
  { href: "/tasks",      label: "Vazifalar",    emoji: "✅", color: "#F43F5E" },
  { href: "/documents",  label: "Hujjatlar",    emoji: "📁", color: "#06B6D4" },
  { href: "/finance",    label: "Moliya",       emoji: "💰", color: "#22C55E" },
  { href: "/reports",    label: "Hisobotlar",   emoji: "📊", color: "#F97316" },
  { href: "/contracts",  label: "Shartnomalar", emoji: "📜", color: "#A78BFA" },
  { href: "/search",     label: "Qidiruv",      emoji: "🔍", color: "#94A3B8" },
]

/* Uzbek arch logo SVG */
function ArchLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <polygon points="24,3 45,13 45,35 24,45 3,35 3,13"
        stroke="#C9933A" strokeWidth="1.5" opacity="0.9"/>
      <path d="M10 46 L10 26 Q10 10 24 10 Q38 10 38 26 L38 46"
        stroke="#C9933A" strokeWidth="1.8"/>
      <path d="M16 46 L16 28 Q16 15 24 15 Q32 15 32 28 L32 46"
        stroke="#2E8B82" strokeWidth="1"/>
      <polygon points="24,6 28,10 24,14 20,10" fill="#C9933A" opacity="0.8"/>
      <circle cx="24" cy="22" r="4" fill="none" stroke="#C9933A" strokeWidth="1" opacity="0.7"/>
    </svg>
  )
}

/* Mini 8-sided ornament */
function MiniOrnament() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <polygon points="9,1 17,4.5 17,13.5 9,17 1,13.5 1,4.5"
        stroke="#C9933A" strokeWidth="0.8" opacity="0.5"/>
      <circle cx="9" cy="9" r="3" stroke="#2E8B82" strokeWidth="0.6" opacity="0.4"/>
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
        collapsed ? "w-[68px]" : "w-[248px]"
      )}
      style={{
        background: "linear-gradient(180deg, #0D1A30 0%, #111F38 50%, #0A1525 100%)",
        borderRight: "1px solid rgba(201,147,58,0.12)",
        boxShadow: "4px 0 40px rgba(0,0,0,0.5), 2px 0 0 rgba(201,147,58,0.06)",
      }}
    >
      {/* Girih pattern overlay */}
      <div className="absolute inset-0 bg-girih pointer-events-none opacity-100" />

      {/* Top gold accent line */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, #C9933A, #2E8B82, transparent)" }} />

      {/* ── Logo ── */}
      <div className={cn(
        "relative z-10 flex items-center border-b h-16 px-4",
        "border-[rgba(201,147,58,0.1)]",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 flex-shrink-0">
              <div className="absolute inset-0 rounded-xl"
                style={{
                  background: "linear-gradient(135deg, #1A2744, #243358)",
                  border: "1px solid rgba(201,147,58,0.35)",
                  boxShadow: "0 0 20px rgba(201,147,58,0.2)",
                }}>
                <div className="w-full h-full flex items-center justify-center">
                  <ArchLogo size={26} />
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm font-black text-[#F5ECD7] leading-none tracking-tight"
                style={{ fontFamily: "'Playfair Display', serif" }}>
                Arxitektor
              </p>
              <p className="text-[9px] text-[#C9933A]/60 tracking-[0.25em] uppercase mt-0.5"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Kundaligi
              </p>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="h-9 w-9 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #1A2744, #243358)",
              border: "1px solid rgba(201,147,58,0.3)",
              boxShadow: "0 0 16px rgba(201,147,58,0.2)",
            }}>
            <ArchLogo size={22} />
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "h-7 w-7 rounded-lg flex items-center justify-center transition-all",
            "text-[#C9933A]/40 hover:text-[#C9933A] hover:bg-[#C9933A]/10",
            collapsed && "absolute -right-3.5 top-5 border border-[rgba(201,147,58,0.2)]",
          )}
          style={collapsed ? {
            background: "#0D1A30",
            boxShadow: "2px 0 8px rgba(0,0,0,0.4)",
          } : {}}>
          {collapsed ? <Menu className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="relative z-10 flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {!collapsed && (
          <p className="text-[8px] font-bold text-[#C9933A]/30 uppercase tracking-[0.3em] px-3 pb-2 pt-1"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.65rem" }}>
            ✦ Asosiy bo'limlar
          </p>
        )}

        {NAV.map(({ href, label, emoji, color }) => {
          const active = pathname === href ||
            (href !== "/dashboard" && pathname.startsWith(href + "/"))

          return (
            <Link key={href} href={href} title={collapsed ? label : undefined}>
              <div className={cn(
                "nav-luxury flex items-center gap-3 px-3 py-2.5 cursor-pointer group",
                active && "active",
                collapsed && "justify-center px-2"
              )}>
                {/* Active left border */}
                {active && !collapsed && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full"
                    style={{ background: color }} />
                )}

                {/* Emoji icon with glow */}
                <div className="flex items-center justify-center h-8 w-8 rounded-lg flex-shrink-0 transition-all"
                  style={active ? {
                    background: `${color}18`,
                    boxShadow: `0 0 12px ${color}30`,
                  } : {}}>
                  <span className="text-base leading-none">{emoji}</span>
                </div>

                {!collapsed && (
                  <span className="text-sm font-medium transition-colors"
                    style={{
                      color: active ? "#F5ECD7" : "#A89070",
                      fontFamily: active ? "'Inter', sans-serif" : "'Inter', sans-serif",
                    }}>
                    {label}
                  </span>
                )}

                {/* Active dot */}
                {active && !collapsed && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full flex-shrink-0"
                    style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
                )}

                {/* Tooltip for collapsed */}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-3 py-1.5 rounded-xl text-xs font-medium
                    whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 transition-all pointer-events-none"
                    style={{
                      background: "linear-gradient(135deg, #1A2744, #243358)",
                      border: "1px solid rgba(201,147,58,0.2)",
                      color: "#F5ECD7",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                    }}>
                    {label}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4
                      border-transparent border-r-[#1A2744]" />
                  </div>
                )}
              </div>
            </Link>
          )
        })}

        {/* Ornament divider */}
        {!collapsed && (
          <div className="ornament-center py-3 px-3">
            <MiniOrnament />
          </div>
        )}
      </nav>

      {/* ── User section ── */}
      <div className="relative z-10 p-2 space-y-0.5"
        style={{ borderTop: "1px solid rgba(201,147,58,0.1)" }}>

        {/* Gold accent line */}
        <div className="divider-gold mb-2" />

        {/* Profile */}
        <Link href="/profile">
          <div className={cn(
            "nav-luxury flex items-center gap-3 px-3 py-2.5 cursor-pointer group",
            pathname === "/profile" && "active",
            collapsed && "justify-center px-2"
          )}>
            <div className="relative flex-shrink-0">
              <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: "linear-gradient(135deg, #C9933A, #8B6020)",
                  color: "#0D1A30",
                  boxShadow: "0 0 12px rgba(201,147,58,0.4)",
                }}>
                {session?.user?.name ? initials(session.user.name) : "ST"}
              </div>
              <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2"
                style={{
                  background: "#22C55E",
                  borderColor: "#0D1A30",
                  boxShadow: "0 0 6px rgba(34,197,94,0.5)",
                }} />
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#F5ECD7] truncate">
                  {session?.user?.name ?? "Sarvarbek"}
                </p>
                <p className="text-[10px] text-[#C9933A]/50 truncate">
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
            "nav-luxury w-full flex items-center gap-3 px-3 py-2.5 cursor-pointer group",
            "text-[#A89070] hover:text-[#F43F5E] transition-colors",
            collapsed && "justify-center px-2"
          )}>
          <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0">
            <LogOut className="h-3.5 w-3.5" />
          </div>
          {!collapsed && (
            <span className="text-sm font-medium">Chiqish</span>
          )}
        </button>

        {/* Bottom brand */}
        {!collapsed && (
          <p className="text-center text-[8px] text-[#C9933A]/20 uppercase tracking-[0.25em] pb-1 pt-2"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            ✦ Sarvarbek Tursunov ✦
          </p>
        )}
      </div>
    </aside>
  )
}
