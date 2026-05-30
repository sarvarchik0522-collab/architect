import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const schema = z.object({
  name: z.string().min(1).optional(),
  clientId: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  deadline: z.string().optional().nullable(),
  status: z.string().optional(),
  description: z.string().optional().nullable(),
  budget: z.number().optional().nullable(),
})

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id
  const project = await prisma.project.findFirst({
    where: { id: params.id, userId },
    include: {
      client: true,
      files:  { orderBy: { createdAt: "desc" } },
      notes:  { orderBy: { createdAt: "desc" } },
      tasks:  { orderBy: { order: "asc" } },
    },
  })
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(project)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id
  const data = schema.parse(await req.json())
  const count = await prisma.project.updateMany({
    where: { id: params.id, userId },
    data: {
      ...data,
      startDate: data.startDate !== undefined ? (data.startDate ? new Date(data.startDate) : null) : undefined,
      deadline:  data.deadline  !== undefined ? (data.deadline  ? new Date(data.deadline)  : null) : undefined,
      clientId:  data.clientId  !== undefined ? (data.clientId  || null) : undefined,
    },
  })
  if (count.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const updated = await prisma.project.findUnique({ where: { id: params.id }, include: { client: { select: { id: true, name: true } } } })
  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id
  await prisma.project.deleteMany({ where: { id: params.id, userId } })
  return NextResponse.json({ success: true })
}
