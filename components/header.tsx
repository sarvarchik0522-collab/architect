"use client"
import { usePathname } from "next/navigation"
import { Moon, Sun, Search, Bell, ChevronRight } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"

const TITLES: Record<string, { title: string; sub: string; emoji: string }> = {
  "/dashboard": { title: "Dashboard",           sub: "Umumiy ko'rinish",             emoji: "🏠" },
  "/projects":  { title: "Loyihalar",            sub: "Barcha loyihalar",              emoji: "📐" },
  "/diary":     { title: "Kundalik",             sub: "Har kunlik yozuvlar",           emoji: "📖" },
  "/clients":   { title: "Mijozlar",             sub: "CRM tizimi",                    emoji: "👥" },
  "/tasks":     { title: "Vazifalar",            sub: "Kanban board",                  emoji: "✅" },
  "/documents": { title: "Hujjatlar Markazi",   sub: "Fayl saqlash tizimi",           emoji: "📁" },
  "/finance":   { title: "Moliya",               sub: "Daromad va xarajatlar",         emoji: "💰" },
  "/search":    { title: "Global Qidiruv",       sub: "Barcha ma'lumotlarni qidirish", emoji: "🔍" },
  "/profile":   { title: "Profil",               sub: "Shaxsiy ma'lumotlar",           emoji: "👤" },
}

const today = new Date().toLocaleDateString("uz-UZ", {
  weekday: "long", year: "numeric", month: "long", day: "numeric"
})

export function Header() {
  const pathname  = usePathname()
  const { theme, setTheme } = useTheme()

  const found = Object.entries(TITLES).find(([k]) =>
    pathname === k || pathname.startsWith(k + "/")
  )
  const page = found?.[1] ?? { title: "Arxitektor Kundaligi", sub: "", emoji: "🏛️" }

  // Breadcrumbs
  const segments = pathname.split("/").filter(Boolean)

  return (
    <header className={cn(
      "h-16 sticky top-0 z-30 flex items-center justify-between px-6",
      "bg-white/80 dark:bg-[#0a1628]/80 backdrop-blur-xl",
      "border-b border-slate-100 dark:border-slate-800/60"
    )}>
      {/* Left — Title + breadcrumb */}
      <div className="flex items-center gap-4">
        {/* Page icon */}
        <div className="hidden sm:flex h-9 w-9 rounded-xl bg-slate-50 dark:bg-slate-800 items-center justify-center text-lg flex-shrink-0">
          {page.emoji}
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            {segments.length > 1 && (
              <>
                <Link
                  href={`/${segments[0]}`}
                  className="text-xs text-slate-400 hover:text-blue-500 transition-colors capitalize"
                >
                  {TITLES[`/${segments[0]}`]?.title ?? segments[0]}
                </Link>
                <ChevronRight className="h-3 w-3 text-slate-300" />
              </>
            )}
            <h1 className="text-base font-bold text-slate-800 dark:text-white leading-tight">
              {page.title}
            </h1>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:block capitalize">
            {page.sub ? page.sub : today}
          </p>
        </div>
      </div>

      {/* Right — Actions */}
      <div className="flex items-center gap-1">
        {/* Date badge */}
        <div className="hidden lg:flex items-center gap-2 mr-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{today}</span>
        </div>

        {/* Search */}
        <Link href="/search">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <Search className="h-4 w-4" />
          </Button>
        </Link>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-9 w-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all relative overflow-hidden"
        >
          <Sun  className="h-4 w-4 absolute transition-all rotate-0 scale-100 dark:-rotate-90 dark:scale-0" />
          <Moon className="h-4 w-4 absolute transition-all rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
        </Button>
      </div>
    </header>
  )
}
