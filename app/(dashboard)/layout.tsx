import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  return (
    <div className="flex min-h-screen" style={{ background: "var(--cream)" }}>
      <Sidebar />
      <div
        className="flex-1 flex flex-col min-h-screen transition-all duration-300"
        style={{ marginLeft: 248 }}
      >
        <Header />
        <main
          className="flex-1 overflow-auto bg-arch-paper"
          style={{ minHeight: 0 }}
        >
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
