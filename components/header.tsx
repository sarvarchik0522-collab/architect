"use client"
import { usePathname } from "next/navigation"
import { Moon, Sun, Search } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

const PAGES: Record<string, { title:string; emoji:string }> = {
  "/dashboard": { title:"Dashboard",       emoji:"🏠" },
  "/projects":  { title:"Loyihalar",        emoji:"📐" },
  "/diary":     { title:"Kundalik",         emoji:"📖" },
  "/clients":   { title:"Mijozlar",         emoji:"👥" },
  "/tasks":     { title:"Vazifalar",        emoji:"✅" },
  "/documents": { title:"Hujjatlar",        emoji:"📁" },
  "/finance":   { title:"Moliya",           emoji:"💰" },
  "/reports":   { title:"Hisobotlar",       emoji:"📊" },
  "/contracts": { title:"Shartnomalar",     emoji:"📜" },
  "/search":    { title:"Qidiruv",          emoji:"🔍" },
  "/profile":   { title:"Profil",           emoji:"👤" },
}

export function Header() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const found = Object.entries(PAGES).find(([k]) => pathname === k || pathname.startsWith(k + "/"))
  const page = found?.[1] ?? { title:"Arxitektor Kundaligi", emoji:"🏛️" }

  const [dateStr, setDateStr] = useState("")
  useEffect(() => {
    setDateStr(new Date().toLocaleDateString("uz-UZ", {
      weekday:"long", year:"numeric", month:"long", day:"numeric"
    }))
  }, [])

  return (
    <header className={cn(
      "h-16 sticky top-0 z-30 flex items-center justify-between px-6",
      "bg-[#fdf6e3]/92 dark:bg-[#0e0a02]/92 backdrop-blur-xl",
      "border-b border-[#B8860B]/15 dark:border-[#DAA520]/10"
    )}>
      {/* Subtle hex overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{backgroundImage:`url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolygon points='20,2 38,11 38,29 20,38 2,29 2,11' fill='none' stroke='%23B8860B' stroke-width='0.5'/%3E%3C/svg%3E")`}}/>

      {/* Left */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="hidden sm:flex h-9 w-9 rounded-xl items-center justify-center text-lg flex-shrink-0 bg-[#B8860B]/8 border border-[#B8860B]/15">
          {page.emoji}
        </div>
        <div>
          <h1 className="text-base font-bold text-[#3d2200] dark:text-amber-100 leading-none tracking-tight">
            {page.title}
          </h1>
          <p className="text-[11px] text-[#B8860B]/50 dark:text-amber-600/50 hidden sm:block capitalize mt-0.5">
            {dateStr}
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="relative z-10 flex items-center gap-1">
        <div className="hidden lg:flex items-center gap-2 mr-3 px-3 py-1.5 rounded-xl bg-[#B8860B]/6 border border-[#B8860B]/12">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"/>
          <span className="text-xs text-[#B8860B]/60 font-medium capitalize">{dateStr}</span>
        </div>
        <Link href="/search">
          <Button variant="ghost" size="icon"
            className="h-9 w-9 rounded-xl text-[#B8860B]/50 hover:text-[#B8860B] hover:bg-[#B8860B]/8 transition-all">
            <Search className="h-4 w-4"/>
          </Button>
        </Link>
        {mounted && (
          <Button variant="ghost" size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-9 w-9 rounded-xl text-[#B8860B]/50 hover:text-[#B8860B] hover:bg-[#B8860B]/8 transition-all relative overflow-hidden">
            <Sun  className="h-4 w-4 absolute transition-all rotate-0 scale-100 dark:-rotate-90 dark:scale-0"/>
            <Moon className="h-4 w-4 absolute transition-all rotate-90 scale-0 dark:rotate-0 dark:scale-100"/>
          </Button>
        )}
      </div>
    </header>
  )
}
