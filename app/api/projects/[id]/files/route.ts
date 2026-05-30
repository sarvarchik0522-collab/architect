import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id
  const project = await prisma.project.findFirst({ where: { id: params.id, userId } })
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const formData = await req.formData()
  const file = formData.get("file") as File
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const dir = path.join(process.cwd(), "public", "uploads", "projects", params.id)
  await mkdir(dir, { recursive: true })
  const uniqueName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`
  await writeFile(path.join(dir, uniqueName), buffer)

  const pf = await prisma.projectFile.create({
    data: {
      name: uniqueName, originalName: file.name,
      path: `/uploads/projects/${params.id}/${uniqueName}`,
      size: file.size, mimeType: file.type, projectId: params.id,
    },
  })
  return NextResponse.json(pf, { status: 201 })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { fileId } = await req.json()
  await prisma.projectFile.delete({ where: { id: fileId } })
  return NextResponse.json({ success: true })
}
