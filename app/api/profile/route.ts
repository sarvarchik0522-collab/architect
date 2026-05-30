import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const profileSchema = z.object({ name:z.string().min(1), email:z.string().email() })
const passwordSchema = z.object({ currentPassword:z.string().min(6), newPassword:z.string().min(6) })

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id
  const user = await prisma.user.findUnique({ where:{id:userId}, select:{id:true,name:true,email:true,role:true,createdAt:true} })
  return NextResponse.json(user)
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id
  const body = await req.json()

  if (body.type === "password") {
    const { currentPassword, newPassword } = passwordSchema.parse(body)
    const user = await prisma.user.findUnique({ where:{id:userId} })
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 })
    const valid = await bcrypt.compare(currentPassword, user.password)
    if (!valid) return NextResponse.json({ error: "Noto'g'ri parol" }, { status: 400 })
    await prisma.user.update({ where:{id:userId}, data:{ password: await bcrypt.hash(newPassword, 12) } })
    return NextResponse.json({ success: true })
  }

  const data = profileSchema.parse(body)
  const updated = await prisma.user.update({ where:{id:userId}, data, select:{id:true,name:true,email:true,role:true} })
  return NextResponse.json(updated)
}
