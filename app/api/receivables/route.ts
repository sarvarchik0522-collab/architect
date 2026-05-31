import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const schema = z.object({
  name:        z.string().min(1),
  phone:       z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  totalAmount: z.number().positive(),
  dueDate:     z.string().optional().nullable(),
  notes:       z.string().optional().nullable(),
  clientId:    z.string().optional().nullable(),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id

  const receivables = await prisma.receivable.findMany({
    where: { userId },
    include: {
      client: { select: { id: true, name: true, phone: true } },
      payments: { orderBy: { date: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(receivables)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id

  const body = await req.json()
  const data = schema.parse(body)

  const receivable = await prisma.receivable.create({
    data: {
      ...data,
      dueDate:  data.dueDate ? new Date(data.dueDate) : null,
      clientId: data.clientId || null,
      userId,
    },
    include: { client: true, payments: true },
  })
  return NextResponse.json(receivable, { status: 201 })
}
