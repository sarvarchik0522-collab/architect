import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const schema = z.object({
  date: z.string(),
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  workDone: z.string().optional().nullable(),
  problems: z.string().optional().nullable(),
  decisions: z.string().optional().nullable(),
  mood: z.string().optional().nullable(),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id
  const { searchParams } = new URL(req.url)
  const month = searchParams.get("month")
  const year  = searchParams.get("year")

  const where: any = { userId }
  if (month && year) {
    where.date = {
      gte: new Date(+year, +month - 1, 1),
      lte: new Date(+year, +month,     0, 23, 59, 59),
    }
  }
  const diaries = await prisma.diary.findMany({
    where, orderBy: { date: "desc" },
    include: { projects: { include: { project: { select: { id:true, name:true } } } } },
  })
  return NextResponse.json(diaries)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id
  const data = schema.parse(await req.json())
  const diary = await prisma.diary.create({
    data: { ...data, date: new Date(data.date), userId },
  })
  return NextResponse.json(diary, { status: 201 })
}
