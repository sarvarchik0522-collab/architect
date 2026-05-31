import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")
  return (
    <div className="flex min-h-screen bg-[#fdf6e3] dark:bg-[#080501]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen transition-all duration-300" style={{ marginLeft: "240px" }}>
        <Header />
        <main className="flex-1 p-6 overflow-auto bg-arch-pattern">
          {children}
        </main>
      </div>
    </div>
  )
}
