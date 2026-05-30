import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const schema = z.object({ date:z.string(), amount:z.number().positive(), description:z.string().optional().nullable(), category:z.string().optional().nullable(), projectId:z.string().optional().nullable(), clientId:z.string().optional().nullable() })

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id
  const sp = new URL(req.url).searchParams
  const year = sp.get("year"); const month = sp.get("month")
  const where: any = { userId }
  if (year && month) { where.date = { gte: new Date(+year, +month-1, 1), lte: new Date(+year, +month, 0, 23,59,59) } }
  else if (year)     { where.date = { gte: new Date(+year, 0, 1), lte: new Date(+year, 11, 31, 23,59,59) } }
  const incomes = await prisma.income.findMany({ where, include: { project:{select:{id:true,name:true}}, client:{select:{id:true,name:true}} }, orderBy: { date:"desc" } })
  return NextResponse.json(incomes)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id
  const data = schema.parse(await req.json())
  const income = await prisma.income.create({ data: { ...data, date: new Date(data.date), userId, projectId: data.projectId||null, clientId: data.clientId||null }, include: { project:{select:{id:true,name:true}}, client:{select:{id:true,name:true}} } })
  return NextResponse.json(income, { status: 201 })
}
