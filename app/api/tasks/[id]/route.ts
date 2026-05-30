import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const schema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  deadline: z.string().optional().nullable(),
  priority: z.string().optional(),
  status: z.string().optional(),
  projectId: z.string().optional().nullable(),
  order: z.number().optional(),
})

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id
  const data = schema.parse(await req.json())
  await prisma.task.updateMany({
    where: { id: params.id, userId },
    data: {
      ...data,
      deadline:  data.deadline  !== undefined ? (data.deadline  ? new Date(data.deadline) : null) : undefined,
      projectId: data.projectId !== undefined ? (data.projectId || null) : undefined,
    },
  })
  return NextResponse.json(await prisma.task.findUnique({ where: { id: params.id }, include: { project: { select: { id:true, name:true } } } }))
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id
  await prisma.task.deleteMany({ where: { id: params.id, userId } })
  return NextResponse.json({ success: true })
}
