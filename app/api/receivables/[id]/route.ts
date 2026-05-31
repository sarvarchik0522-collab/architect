import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const schema = z.object({
  name:        z.string().min(1).optional(),
  phone:       z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  totalAmount: z.number().positive().optional(),
  dueDate:     z.string().optional().nullable(),
  notes:       z.string().optional().nullable(),
  clientId:    z.string().optional().nullable(),
})

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id

  const receivable = await prisma.receivable.findFirst({
    where: { id: params.id, userId },
    include: {
      client: true,
      payments: { orderBy: { date: "desc" } },
    },
  })
  if (!receivable) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(receivable)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id

  const body = await req.json()
  const data = schema.parse(body)

  await prisma.receivable.updateMany({
    where: { id: params.id, userId },
    data: {
      ...data,
      dueDate:  data.dueDate !== undefined ? (data.dueDate ? new Date(data.dueDate) : null) : undefined,
      clientId: data.clientId !== undefined ? (data.clientId || null) : undefined,
    },
  })

  const updated = await prisma.receivable.findFirst({
    where: { id: params.id },
    include: { client: true, payments: { orderBy: { date: "desc" } } },
  })
  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id

  await prisma.receivable.deleteMany({ where: { id: params.id, userId } })
  return NextResponse.json({ success: true })
}
