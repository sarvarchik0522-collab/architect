import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const schema = z.object({
  creditor:    z.string().min(1),
  phone:       z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  amount:      z.number().positive(),
  borrowedAt:  z.string().optional(),
  dueDate:     z.string().optional().nullable(),
  notes:       z.string().optional().nullable(),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id

  const debts = await prisma.debt.findMany({
    where: { userId },
    include: { payments: { orderBy: { date: "desc" } } },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(debts)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id

  const body = await req.json()
  const data = schema.parse(body)

  const debt = await prisma.debt.create({
    data: {
      ...data,
      borrowedAt: data.borrowedAt ? new Date(data.borrowedAt) : new Date(),
      dueDate:    data.dueDate ? new Date(data.dueDate) : null,
      userId,
    },
    include: { payments: true },
  })
  return NextResponse.json(debt, { status: 201 })
}
