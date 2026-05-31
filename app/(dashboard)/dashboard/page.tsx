import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { DashboardClient } from "./dashboard-client"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const userId  = (session?.user as any)?.id

  const today      = new Date()
  const todayStart = new Date(today); todayStart.setHours(0,0,0,0)
  const todayEnd   = new Date(today); todayEnd.setHours(23,59,59,999)

  const [projects, clients, tasks, todayTasks, diaries, incomes] = await Promise.all([
    prisma.project.findMany({ where: { userId } }),
    prisma.client.findMany({ where: { userId } }),
    prisma.task.findMany({ where: { userId } }),
    prisma.task.findMany({
      where: { userId, deadline: { gte: todayStart, lte: todayEnd } },
      take: 5, orderBy: { priority: "desc" },
    }),
    prisma.diary.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 4 }),
    prisma.income.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 10 }),
  ])

  return (
    <DashboardClient
      userName={session?.user?.name ?? "Sarvarbek"}
      projects={JSON.parse(JSON.stringify(projects))}
      clients={JSON.parse(JSON.stringify(clients))}
      tasks={JSON.parse(JSON.stringify(tasks))}
      todayTasks={JSON.parse(JSON.stringify(todayTasks))}
      diaries={JSON.parse(JSON.stringify(diaries))}
      totalIncome={incomes.reduce((s, i) => s + i.amount, 0)}
    />
  )
}
