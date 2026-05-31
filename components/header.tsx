"use client"
import { usePathname } from "next/navigation"
import { Moon, Sun, Search } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"

const PAGES: Record<string, { title: string; sub: string; emoji: string }> = {
  "/dashboard":  { title: "Dashboard",       sub: "Umumiy ko'rinish",             emoji: "🏠" },
  "/projects":   { title: "Loyihalar",        sub: "Loyihalarni boshqarish",        emoji: "📐" },
  "/diary":      { title: "Kundalik",         sub: "Har kunlik yozuvlar",           emoji: "📖" },
  "/clients":    { title: "Mijozlar",         sub: "CRM tizimi",                    emoji: "👥" },
  "/tasks":      { title: "Vazifalar",        sub: "Kanban board",                  emoji: "✅" },
  "/documents":  { title: "Hujjatlar",        sub: "Fayl saqlash tizimi",           emoji: "📁" },
  "/finance":    { title: "Moliya",           sub: "Daromad va xarajatlar",         emoji: "💰" },
  "/reports":    { title: "Hisobotlar",       sub: "Haftalik va oylik hisobotlar",  emoji: "📊" },
  "/contracts":  { title: "Shartnomalar",     sub: "Shartnoma generatori",          emoji: "📜" },
  "/search":     { title: "Qidiruv",          sub: "Barcha ma'lumotlar",            emoji: "🔍" },
  "/profile":    { title: "Profil",           sub: "Shaxsiy sozlamalar",            emoji: "👤" },
}

export function Header() {
  const pathname  = usePathname()
  const { theme, setTheme } = useTheme()

  const found = Object.entries(PAGES).find(([k]) =>
    pathname === k || pathname.startsWith(k + "/")
  )
  const page = found?.[1] ?? { title: "Arxitektor Kundaligi", sub: "", emoji: "🏛️" }

  const today = new Date().toLocaleDateString("uz-UZ", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  })

  return (
    <header className={cn(
      "h-16 sticky top-0 z-30 flex items-center justify-between px-6",
      "bg-[#fdf8ef]/90 dark:bg-[#0e0b04]/90 backdrop-blur-xl",
      "border-b border-[#e8d8b0] dark:border-[#2a1e08]"
    )}>
      {/* Subtle girih overlay */}
      <div className="absolute inset-0 bg-girih opacity-50 pointer-events-none" />

      {/* Left */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="hidden sm:flex h-9 w-9 rounded-xl bg-amber-100/60 dark:bg-amber-900/20 items-center justify-center text-lg flex-shrink-0 border border-amber-200/40 dark:border-amber-800/30">
          {page.emoji}
        </div>
        <div>
          <h1 className="text-base font-bold text-[#3d2800] dark:text-amber-100 leading-tight tracking-tight">
            {page.title}
          </h1>
          <p className="text-[11px] text-amber-700/60 dark:text-amber-500/60 hidden sm:block capitalize">
            {page.sub || today}
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="relative z-10 flex items-center gap-1">
        {/* Date badge */}
        <div className="hidden lg:flex items-center gap-2 mr-3 px-3 py-1.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/40 dark:border-amber-800/30">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-amber-700/70 dark:text-amber-400/70 font-medium capitalize">{today}</span>
        </div>

        <Link href="/search">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-amber-700/60 hover:text-amber-800 hover:bg-amber-100/60 dark:text-amber-500/60 dark:hover:text-amber-300 dark:hover:bg-amber-900/30">
            <Search className="h-4 w-4" />
          </Button>
        </Link>

        <Button
          variant="ghost" size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-9 w-9 rounded-xl text-amber-700/60 hover:text-amber-800 hover:bg-amber-100/60 dark:text-amber-500/60 dark:hover:text-amber-300 dark:hover:bg-amber-900/30 relative overflow-hidden"
        >
          <Sun  className="h-4 w-4 absolute transition-all rotate-0 scale-100 dark:-rotate-90 dark:scale-0" />
          <Moon className="h-4 w-4 absolute transition-all rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
        </Button>
      </div>
    </header>
  )
}
