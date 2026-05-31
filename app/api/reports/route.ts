import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id

  const { searchParams } = new URL(req.url)
  const type  = searchParams.get("type")  ?? "monthly"  // weekly | monthly | yearly
  const year  = parseInt(searchParams.get("year")  ?? String(new Date().getFullYear()))
  const month = parseInt(searchParams.get("month") ?? String(new Date().getMonth() + 1))
  const week  = parseInt(searchParams.get("week")  ?? "1")

  let startDate: Date, endDate: Date

  if (type === "weekly") {
    const firstDay = new Date(year, month - 1, 1)
    const weekStart = (week - 1) * 7
    startDate = new Date(firstDay)
    startDate.setDate(firstDay.getDate() + weekStart)
    endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 6)
    endDate.setHours(23, 59, 59, 999)
  } else if (type === "monthly") {
    startDate = new Date(year, month - 1, 1)
    endDate   = new Date(year, month, 0, 23, 59, 59, 999)
  } else {
    startDate = new Date(year, 0, 1)
    endDate   = new Date(year, 11, 31, 23, 59, 59, 999)
  }

  const [incomes, expenses, projects, tasks, diaries, clients, newClients] = await Promise.all([
    prisma.income.findMany({
      where: { userId, date: { gte: startDate, lte: endDate } },
      include: { project: { select: { id: true, name: true } }, client: { select: { id: true, name: true } } },
      orderBy: { date: "desc" },
    }),
    prisma.expense.findMany({
      where: { userId, date: { gte: startDate, lte: endDate } },
      orderBy: { date: "desc" },
    }),
    prisma.project.findMany({
      where: { userId, updatedAt: { gte: startDate, lte: endDate } },
      include: { client: { select: { name: true } } },
    }),
    prisma.task.findMany({
      where: { userId, updatedAt: { gte: startDate, lte: endDate } },
    }),
    prisma.diary.findMany({
      where: { userId, date: { gte: startDate, lte: endDate } },
      orderBy: { date: "desc" },
    }),
    prisma.client.findMany({ where: { userId } }),
    prisma.client.findMany({
      where: { userId, createdAt: { gte: startDate, lte: endDate } },
    }),
  ])

  const totalIncome  = incomes.reduce((s, i) => s + i.amount, 0)
  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0)
  const profit       = totalIncome - totalExpense

  // Active clients = those with payments in period
  const activeClientIds = [...new Set(incomes.map(i => i.clientId).filter(Boolean))]
  const activeClients = clients.filter(c => activeClientIds.includes(c.id))

  // Projects by status
  const projectsByStatus = projects.reduce((acc: Record<string, number>, p) => {
    acc[p.status] = (acc[p.status] ?? 0) + 1
    return acc
  }, {})

  // Tasks summary
  const tasksDone       = tasks.filter(t => t.status === "DONE").length
  const tasksInProgress = tasks.filter(t => t.status === "IN_PROGRESS").length
  const tasksTodo       = tasks.filter(t => t.status === "TODO").length

  // Income by category
  const incomeByCategory = incomes.reduce((acc: Record<string, number>, i) => {
    const cat = i.category ?? "OTHER"
    acc[cat] = (acc[cat] ?? 0) + i.amount
    return acc
  }, {})

  // Expense by category
  const expenseByCategory = expenses.reduce((acc: Record<string, number>, e) => {
    const cat = e.category ?? "OTHER"
    acc[cat] = (acc[cat] ?? 0) + e.amount
    return acc
  }, {})

  // Income by project
  const incomeByProject = incomes.reduce((acc: Record<string, { name: string; amount: number }>, i) => {
    if (i.project) {
      const key = i.project.id
      acc[key] = acc[key] ?? { name: i.project.name, amount: 0 }
      acc[key].amount += i.amount
    }
    return acc
  }, {})

  return NextResponse.json({
    period: { type, year, month, week, startDate, endDate },
    finance: { totalIncome, totalExpense, profit, incomeByCategory, expenseByCategory, incomeByProject },
    projects: { total: projects.length, byStatus: projectsByStatus, list: projects },
    tasks: { total: tasks.length, done: tasksDone, inProgress: tasksInProgress, todo: tasksTodo },
    diary: { total: diaries.length, list: diaries },
    clients: { total: clients.length, active: activeClients.length, newInPeriod: newClients.length, activeList: activeClients },
    incomes,
    expenses,
  })
}
