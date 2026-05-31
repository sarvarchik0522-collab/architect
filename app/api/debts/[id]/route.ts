import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const schema = z.object({
  creditor:    z.string().min(1).optional(),
  phone:       z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  amount:      z.number().positive().optional(),
  borrowedAt:  z.string().optional().nullable(),
  dueDate:     z.string().optional().nullable(),
  notes:       z.string().optional().nullable(),
})

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id

  const debt = await prisma.debt.findFirst({
    where: { id: params.id, userId },
    include: { payments: { orderBy: { date: "desc" } } },
  })
  if (!debt) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(debt)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id

  const body = await req.json()
  const data = schema.parse(body)

  await prisma.debt.updateMany({
    where: { id: params.id, userId },
    data: {
      ...data,
      borrowedAt: data.borrowedAt !== undefined ? (data.borrowedAt ? new Date(data.borrowedAt) : new Date()) : undefined,
      dueDate:    data.dueDate !== undefined ? (data.dueDate ? new Date(data.dueDate) : null) : undefined,
    },
  })

  const updated = await prisma.debt.findFirst({
    where: { id: params.id },
    include: { payments: { orderBy: { date: "desc" } } },
  })
  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id

  await prisma.debt.deleteMany({ where: { id: params.id, userId } })
  return NextResponse.json({ success: true })
}
