import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const schema = z.object({
  date: z.string().optional(),
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  workDone: z.string().optional().nullable(),
  problems: z.string().optional().nullable(),
  decisions: z.string().optional().nullable(),
  mood: z.string().optional().nullable(),
})

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id
  const diary = await prisma.diary.findFirst({
    where: { id: params.id, userId },
    include: { projects: { include: { project: { select: { id:true, name:true } } } } },
  })
  if (!diary) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(diary)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id
  const data = schema.parse(await req.json())
  await prisma.diary.updateMany({
    where: { id: params.id, userId },
    data: { ...data, date: data.date ? new Date(data.date) : undefined },
  })
  return NextResponse.json(await prisma.diary.findUnique({ where: { id: params.id } }))
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id
  await prisma.diary.deleteMany({ where: { id: params.id, userId } })
  return NextResponse.json({ success: true })
}
