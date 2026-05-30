import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id
  const folder = new URL(req.url).searchParams.get("folder")
  const docs = await prisma.document.findMany({
    where: { userId, ...(folder ? { folder } : {}) },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(docs)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id
  const formData = await req.formData()
  const file = formData.get("file") as File
  const folder = (formData.get("folder") as string) || "OTHER"
  const description = formData.get("description") as string | null
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const dir = path.join(process.cwd(), "public", "uploads", "documents", folder)
  await mkdir(dir, { recursive: true })
  const name = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`
  await writeFile(path.join(dir, name), buffer)

  const doc = await prisma.document.create({
    data: { name, originalName: file.name, path: `/uploads/documents/${folder}/${name}`, size: file.size, mimeType: file.type, folder, description: description || null, userId },
  })
  return NextResponse.json(doc, { status: 201 })
}
