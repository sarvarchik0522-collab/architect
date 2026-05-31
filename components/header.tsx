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
  "/reports":   { title: "Hisobotlar",       sub: "Tahlil" },
  "/contracts": { title: "Shartnomalar",     sub: "Shartnoma generatori" },
  "/search":    { title: "Qidiruv",          sub: "Global qidiruv" },
  "/profile":   { title: "Profil",           sub: "Sozlamalar" },
}

/* Mini pediment ornament */
function PedimentMark() {
  return (
    <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
      <path d="M1 12 L9 1 L17 12" stroke="#B8965A" strokeWidth="0.8" fill="none"/>
      <line x1="0" y1="12" x2="18" y2="12" stroke="#B8965A" strokeWidth="1"/>
      <line x1="0" y1="13.5" x2="18" y2="13.5" stroke="#C8C2B8" strokeWidth="0.5"/>
    </svg>
  )
}

export function Header() {
  const pathname  = usePathname()
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
      className="h-14 sticky top-0 z-30 flex flex-col"
      style={{
        background: "rgba(250,250,248,0.97)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid #E2DDD5",
        boxShadow: "0 1px 8px rgba(28,27,24,0.05)",
      }}
    >
      {/* Gold top cornice line */}
      <div style={{ height: 2, background: "linear-gradient(90deg,transparent,#B8965A 30%,#D4B07A 50%,#B8965A 70%,transparent)" }}/>

      {/* Main row */}
      <div className="flex items-center justify-between flex-1 px-6">
        {/* Left: pediment + title */}
        <div className="flex items-center gap-3">
          <PedimentMark />
          <div style={{ width: 1, height: 20, background: "#E2DDD5" }}/>
          <div>
            <h1
              className="text-sm font-bold leading-none tracking-tight"
              style={{ fontFamily: "'Playfair Display', serif", color: "#1C1B18" }}
            >
              {page.title}
            </h1>
            <p className="text-[10px] hidden sm:block mt-0.5 capitalize"
              style={{ color: "#9A968E", fontFamily: "Inter, sans-serif" }}>
              {page.sub || dateStr}
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1.5">
          <div className="hidden lg:block px-3 py-1 rounded text-[10px] mr-2 capitalize"
            style={{ background: "#F2F0EB", border: "1px solid #E2DDD5", color: "#9A968E" }}>
            {dateStr}
          </div>

          <Link href="/search">
            <button
              className="h-8 w-8 rounded flex items-center justify-center transition-colors hover:bg-[#EDE9E1]"
              style={{ color: "#9A968E" }}
            >
              <Search className="h-4 w-4" />
            </button>
          </Link>

          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-8 w-8 rounded flex items-center justify-center relative overflow-hidden transition-colors hover:bg-[#EDE9E1]"
              style={{ color: "#9A968E" }}
            >
              <Sun  className="h-4 w-4 absolute transition-all rotate-0 scale-100 dark:-rotate-90 dark:scale-0" />
              <Moon className="h-4 w-4 absolute transition-all rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
