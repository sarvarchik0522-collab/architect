"use client"
import { usePathname } from "next/navigation"
import { Moon, Sun, Search } from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

const PAGES: Record<string, { title: string; sub: string }> = {
  "/dashboard": { title: "Dashboard",       sub: "Umumiy ko'rinish" },
  "/projects":  { title: "Loyihalar",        sub: "Loyiha boshqaruvi" },
  "/diary":     { title: "Kundalik",         sub: "Har kunlik yozuvlar" },
  "/clients":   { title: "Mijozlar",         sub: "CRM tizimi" },
  "/tasks":     { title: "Vazifalar",        sub: "Kanban board" },
  "/documents": { title: "Hujjatlar",        sub: "Fayl saqlash" },
  "/finance":   { title: "Moliya",           sub: "Daromad va xarajatlar" },
  "/reports":   { title: "Hisobotlar",       sub: "Tahlil va statistika" },
  "/contracts": { title: "Shartnomalar",     sub: "Shartnoma generatori" },
  "/search":    { title: "Qidiruv",          sub: "Global qidiruv" },
  "/profile":   { title: "Profil",           sub: "Sozlamalar" },
}

/* Small building icon */
function BuildingMark() {
  return (
    <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
      <rect x="1" y="8" width="14" height="11" stroke="#333" strokeWidth="1"/>
      <path d="M1 8 L8 2 L15 8" stroke="#333" strokeWidth="1"/>
      {[3,7,11].map(x => (
        <rect key={x} x={x} y="11" width="2" height="2.5" stroke="#2a2a2a" strokeWidth="0.7" fill="none"/>
      ))}
      <rect x="6" y="14" width="4" height="5" stroke="#2a2a2a" strokeWidth="0.7" fill="none"/>
    </svg>
  )
}

export function Header() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted,  setMounted]  = useState(false)
  const [dateStr,  setDateStr]  = useState("")

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => {
    setDateStr(new Date().toLocaleDateString("uz-UZ", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    }))
  }, [])

  const found = Object.entries(PAGES).find(([k]) =>
    pathname === k || pathname.startsWith(k + "/")
  )
  const page = found?.[1] ?? { title: "Arxitektor Kundaligi", sub: "" }

  return (
    <header
      className="h-14 sticky top-0 z-30 flex items-center justify-between px-6"
      style={{
        background: "rgba(8,8,8,0.97)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid #1a1a1a",
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <BuildingMark />
        <div className="w-px h-5" style={{ background: "#1f1f1f" }} />
        <div>
          <h1
            className="text-sm font-bold leading-none tracking-tight"
            style={{ color: "#f0f0f0" }}
          >
            {page.title}
          </h1>
          <p className="text-[10px] hidden sm:block mt-0.5 capitalize"
            style={{ color: "#444" }}>
            {page.sub || dateStr}
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5">
        {/* Date */}
        <div
          className="hidden lg:block px-3 py-1.5 rounded text-[10px] mr-2 capitalize"
          style={{ background: "#0f0f0f", border: "1px solid #1e1e1e", color: "#444" }}
        >
          {dateStr}
        </div>

        {/* Search */}
        <Link href="/search">
          <button
            className="h-8 w-8 rounded flex items-center justify-center transition-colors"
            style={{ color: "#444", border: "1px solid #1a1a1a" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#aaa" }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#444" }}
          >
            <Search className="h-3.5 w-3.5" />
          </button>
        </Link>

        {/* Theme */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-8 w-8 rounded flex items-center justify-center relative overflow-hidden transition-colors"
            style={{ color: "#444", border: "1px solid #1a1a1a" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#aaa" }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#444" }}
          >
            <Sun  className="h-3.5 w-3.5 absolute transition-all rotate-0 scale-100 dark:-rotate-90 dark:scale-0" />
            <Moon className="h-3.5 w-3.5 absolute transition-all rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
          </button>
        )}
      </div>
    </header>
  )
}
