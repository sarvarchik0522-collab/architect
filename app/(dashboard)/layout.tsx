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
    <div className="flex min-h-screen" style={{ background: "#0D1A30" }}>
      <Sidebar />
      <div
        className="flex-1 flex flex-col min-h-screen transition-all duration-300"
        style={{ marginLeft: "248px" }}
      >
        <Header />
        <main
          className="flex-1 overflow-auto"
          style={{
            background:
              "linear-gradient(160deg, #0D1A30 0%, #111F38 50%, #0A1525 100%)",
          }}
        >
          {/* Uzbek pattern overlay on main content */}
          <div className="relative min-h-full">
            <div
              className="absolute inset-0 bg-girih pointer-events-none"
              style={{ opacity: 0.5 }}
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at 30% 20%, rgba(46,139,130,0.04) 0%, transparent 60%), " +
                  "radial-gradient(ellipse at 70% 80%, rgba(201,147,58,0.04) 0%, transparent 60%)",
              }}
            />
            <div className="relative z-10 p-6">{children}</div>
          </div>
        </main>
      </div>
    </div>
  )
}
