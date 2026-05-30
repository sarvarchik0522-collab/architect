import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const schema = z.object({
  name: z.string().min(1),
  clientId: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  deadline: z.string().optional().nullable(),
  status: z.string().default("NEW"),
  description: z.string().optional().nullable(),
  budget: z.number().optional().nullable(),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id
  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")
  const projects = await prisma.project.findMany({
    where: { userId, ...(status ? { status } : {}) },
    include: {
      client: { select: { id: true, name: true } },
      _count: { select: { files: true, notes: true, tasks: true } },
    },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(projects)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id
  const body = await req.json()
  const data = schema.parse(body)
  const project = await prisma.project.create({
    data: {
      ...data, userId,
      startDate: data.startDate ? new Date(data.startDate) : null,
      deadline:  data.deadline  ? new Date(data.deadline)  : null,
      clientId:  data.clientId  || null,
      budget:    data.budget    ?? null,
    },
    include: { client: { select: { id: true, name: true } } },
  })
  return NextResponse.json(project, { status: 201 })
}
