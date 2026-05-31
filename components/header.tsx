"use client"
import { usePathname } from "next/navigation"
import { Moon, Sun, Search } from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

const PAGES: Record<string, { title: string; sub: string; emoji: string }> = {
  "/dashboard":  { title: "Dashboard",       sub: "Umumiy ko'rinish",        emoji: "🏠" },
  "/projects":   { title: "Loyihalar",        sub: "Loyiha boshqaruvi",       emoji: "📐" },
  "/diary":      { title: "Kundalik",         sub: "Har kunlik yozuvlar",     emoji: "📖" },
  "/clients":    { title: "Mijozlar",         sub: "CRM tizimi",              emoji: "👥" },
  "/tasks":      { title: "Vazifalar",        sub: "Kanban board",            emoji: "✅" },
  "/documents":  { title: "Hujjatlar",        sub: "Fayl saqlash",            emoji: "📁" },
  "/finance":    { title: "Moliya",           sub: "Daromad va xarajatlar",   emoji: "💰" },
  "/reports":    { title: "Hisobotlar",       sub: "Tahlil va statistika",    emoji: "📊" },
  "/contracts":  { title: "Shartnomalar",     sub: "Shartnoma generatori",    emoji: "📜" },
  "/search":     { title: "Qidiruv",          sub: "Global qidiruv tizimi",   emoji: "🔍" },
  "/profile":    { title: "Profil",           sub: "Sozlamalar",              emoji: "👤" },
}

export function Header() {
  const pathname  = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted,  setMounted]  = useState(false)
  const [dateStr,  setDateStr]  = useState("")
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    setDateStr(new Date().toLocaleDateString("uz-UZ", {
      weekday: "long", year: "numeric", month: "long", day: "numeric"
    }))
  }, [])

  useEffect(() => {
    const el = document.querySelector("main")
    if (!el) return
    const handler = () => setScrolled(el.scrollTop > 20)
    el.addEventListener("scroll", handler)
    return () => el.removeEventListener("scroll", handler)
  }, [])

  const found = Object.entries(PAGES).find(
    ([k]) => pathname === k || pathname.startsWith(k + "/")
  )
  const page = found?.[1] ?? { title: "Arxitektor Kundaligi", sub: "", emoji: "🏛️" }

  return (
    <header
      className={cn(
        "h-16 sticky top-0 z-30 flex items-center justify-between px-6 transition-all duration-300",
        scrolled ? "shadow-[0_4px_32px_rgba(0,0,0,0.4)]" : ""
      )}
      style={{
        background: scrolled
          ? "rgba(13,26,48,0.96)"
          : "linear-gradient(90deg, rgba(13,26,48,0.92), rgba(17,31,56,0.94))",
        backdropFilter: "blur(20px) saturate(150%)",
        WebkitBackdropFilter: "blur(20px) saturate(150%)",
        borderBottom: "1px solid rgba(201,147,58,0.1)",
      }}>

      {/* Subtle girih overlay */}
      <div className="absolute inset-0 bg-girih opacity-30 pointer-events-none" />

      {/* Top shimmer line */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(201,147,58,0.3), rgba(46,139,130,0.2), transparent)" }} />

      {/* ── Left: Page title ── */}
      <div className="relative z-10 flex items-center gap-3">
        {/* Page emoji badge */}
        <div className="hidden sm:flex h-9 w-9 rounded-xl items-center justify-center text-lg flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, rgba(26,39,68,0.8), rgba(36,51,88,0.6))",
            border: "1px solid rgba(201,147,58,0.18)",
          }}>
          {page.emoji}
        </div>

        <div>
          <h1 className="text-base font-black text-[#F5ECD7] leading-none tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            {page.title}
          </h1>
          <p className="text-[10px] text-[#C9933A]/50 hidden sm:block mt-0.5 capitalize"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.72rem" }}>
            {page.sub || dateStr}
          </p>
        </div>
      </div>

      {/* ── Right: actions ── */}
      <div className="relative z-10 flex items-center gap-2">

        {/* Date badge — desktop only */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl mr-2"
          style={{
            background: "rgba(201,147,58,0.06)",
            border: "1px solid rgba(201,147,58,0.1)",
          }}>
          <div className="dot-gold" style={{ width: 5, height: 5 }} />
          <span className="text-[10px] text-[#C9933A]/60 font-medium capitalize"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.72rem" }}>
            {dateStr}
          </span>
        </div>

        {/* Search */}
        <Link href="/search">
          <button className="h-9 w-9 rounded-xl flex items-center justify-center transition-all
            text-[#A89070] hover:text-[#C9933A]"
            style={{
              background: "rgba(201,147,58,0.05)",
              border: "1px solid rgba(201,147,58,0.1)",
            }}>
            <Search className="h-4 w-4" />
          </button>
        </Link>

        {/* Theme toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-9 w-9 rounded-xl flex items-center justify-center transition-all
              text-[#A89070] hover:text-[#C9933A] relative overflow-hidden"
            style={{
              background: "rgba(46,139,130,0.06)",
              border: "1px solid rgba(46,139,130,0.12)",
            }}>
            <Sun  className="h-4 w-4 absolute transition-all rotate-0 scale-100 dark:-rotate-90 dark:scale-0" />
            <Moon className="h-4 w-4 absolute transition-all rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
          </button>
        )}
      </div>
    </header>
  )
}
