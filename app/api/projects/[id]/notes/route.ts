import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id
  const project = await prisma.project.findFirst({ where: { id: params.id, userId } })
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const { content } = await req.json()
  const note = await prisma.projectNote.create({ data: { content, projectId: params.id } })
  return NextResponse.json(note, { status: 201 })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id
  const project = await prisma.project.findFirst({ where: { id: params.id, userId } })
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const { noteId } = await req.json()
  await prisma.projectNote.delete({ where: { id: noteId } })
  return NextResponse.json({ success: true })
}
