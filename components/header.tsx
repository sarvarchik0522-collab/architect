"use client"
import { usePathname } from "next/navigation"
import { Moon, Sun, Search } from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

const PAGES: Record<string, { title: string; sub: string }> = {
  "/dashboard": { title:"Dashboard",    sub:"Umumiy ko'rinish"        },
  "/projects":  { title:"Loyihalar",    sub:"Loyiha boshqaruvi"        },
  "/diary":     { title:"Kundalik",     sub:"Har kunlik yozuvlar"      },
  "/clients":   { title:"Mijozlar",     sub:"CRM tizimi"               },
  "/tasks":     { title:"Vazifalar",    sub:"Kanban board"             },
  "/documents": { title:"Hujjatlar",    sub:"Fayl saqlash"             },
  "/finance":   { title:"Moliya",       sub:"Daromad va xarajatlar"    },
  "/reports":   { title:"Hisobotlar",   sub:"Tahlil va statistika"     },
  "/contracts": { title:"Shartnomalar", sub:"Shartnoma generatori"     },
  "/debts":     { title:"Hisob-kitob",  sub:"Haqdorlar va qarzlar"     },
  "/search":    { title:"Qidiruv",      sub:"Global qidiruv"           },
  "/profile":   { title:"Profil",       sub:"Sozlamalar"               },
}

/* Mini pediment mark */
function PedimentMark() {
  return (
    <svg width="20" height="15" viewBox="0 0 20 15" fill="none">
      <path d="M1 13 L10 1.5 L19 13" stroke="var(--gold)" strokeWidth=".9" />
      <line x1="0" y1="13" x2="20" y2="13" stroke="var(--gold)" strokeWidth="1.2" />
      <line x1="0" y1="14.5" x2="20" y2="14.5" stroke="rgba(200,168,112,.25)" strokeWidth=".5" />
    </svg>
  )
}

export function Header() {
  const pathname              = usePathname()
  const { theme, setTheme }   = useTheme()
  const [mounted,  setMounted]  = useState(false)
  const [dateStr,  setDateStr]  = useState("")
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    setDateStr(new Date().toLocaleDateString("uz-UZ", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    }))
  }, [])

  useEffect(() => {
    const el = document.querySelector("main")
    if (!el) return
    const fn = () => setScrolled(el.scrollTop > 10)
    el.addEventListener("scroll", fn)
    return () => el.removeEventListener("scroll", fn)
  }, [])

  const found = Object.entries(PAGES).find(([k]) =>
    pathname === k || pathname.startsWith(k + "/")
  )
  const page = found?.[1] ?? { title: "Arxitektor Kundaligi", sub: "" }

  return (
    <header
      className="sticky top-0 z-30 flex flex-col flex-shrink-0 transition-all duration-300"
      style={{
        background: scrolled
          ? "rgba(250,248,244,.97)"
          : "rgba(255,255,255,.95)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderBottom: "1px solid rgba(200,168,112,.12)",
        boxShadow: scrolled ? "0 2px 16px rgba(26,24,20,.06)" : "none",
      }}
    >
      {/* Gold cornice top */}
      <div style={{
        height: 2,
        background: "linear-gradient(90deg,transparent,var(--gold) 30%,var(--gold2) 50%,var(--gold) 70%,transparent)",
      }} />

      {/* Main row */}
      <div className="h-13 flex items-center justify-between px-6" style={{ height: 52 }}>

        {/* Left */}
        <div className="flex items-center gap-3">
          <PedimentMark />
          <div style={{ width: 1, height: 20, background: "rgba(200,168,112,.2)" }} />
          <div>
            <h1 className="text-sm font-black leading-none tracking-tight"
              style={{ fontFamily: "'Playfair Display', serif", color: "var(--ink)" }}>
              {page.title}
            </h1>
            <p className="hidden sm:block mt-0.5 capitalize"
              style={{ fontSize: 10, color: "var(--stone2)",
                fontFamily: "'Cormorant Garamond', serif" }}>
              {page.sub || dateStr}
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1.5">
          {/* Date badge */}
          <div className="hidden lg:block px-3 py-1 rounded capitalize mr-2"
            style={{ background: "var(--cream)", border: "1px solid rgba(200,168,112,.15)",
              fontSize: 10, color: "var(--stone2)" }}>
            {dateStr}
          </div>

          {/* Search */}
          <Link href="/search">
            <button
              className="h-8 w-8 rounded flex items-center justify-center transition-all hover:bg-[var(--cream2)]"
              style={{ color: "var(--stone2)" }}
            >
              <Search className="h-4 w-4" />
            </button>
          </Link>

          {/* Theme */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-8 w-8 rounded flex items-center justify-center relative overflow-hidden transition-all hover:bg-[var(--cream2)]"
              style={{ color: "var(--stone2)" }}
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
