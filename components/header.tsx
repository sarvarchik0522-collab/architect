"use client"
import { usePathname } from "next/navigation"
import { Moon, Sun, Search } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/projects":  "Loyihalar",
  "/diary":     "Kundalik",
  "/clients":   "Mijozlar (CRM)",
  "/tasks":     "Vazifalar — Kanban",
  "/documents": "Hujjatlar Markazi",
  "/finance":   "Moliya",
  "/search":    "Global Qidiruv",
  "/profile":   "Profil",
}

export function Header() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  const title = Object.entries(TITLES).find(([k]) => pathname === k || pathname.startsWith(k + "/"))?.[1] ?? "Arxitektor Kundaligi"

  return (
    <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30 flex items-center justify-between px-6">
      <div>
        <h1 className="text-lg font-semibold">{title}</h1>
        <p className="text-xs text-muted-foreground hidden sm:block">
          {new Date().toLocaleDateString("uz-UZ", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <Link href="/search">
          <Button variant="ghost" size="icon" className="h-9 w-9"><Search className="h-4 w-4" /></Button>
        </Link>
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </div>
    </header>
  )
}
