import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const schema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  deadline: z.string().optional().nullable(),
  priority: z.string().default("MEDIUM"),
  status: z.string().default("TODO"),
  projectId: z.string().optional().nullable(),
  order: z.number().default(0),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id
  const tasks = await prisma.task.findMany({
    where: { userId },
    include: { project: { select: { id:true, name:true } } },
    orderBy: [{ status:"asc" }, { order:"asc" }, { createdAt:"desc" }],
  })
  return NextResponse.json(tasks)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id
  const data = schema.parse(await req.json())
  const task = await prisma.task.create({
    data: { ...data, userId, deadline: data.deadline ? new Date(data.deadline) : null, projectId: data.projectId || null },
    include: { project: { select: { id:true, name:true } } },
  })
  return NextResponse.json(task, { status: 201 })
}
