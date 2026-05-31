import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id
  const contract = await prisma.contract.findFirst({
    where: { id: params.id, userId },
    include: {
      project: true,
      client:  true,
    },
  })
  if (!contract) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(contract)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id
  const body = await req.json()

  await prisma.contract.updateMany({
    where: { id: params.id, userId },
    data: {
      ...body,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate:   body.endDate   ? new Date(body.endDate)   : null,
    },
  })
  return NextResponse.json(await prisma.contract.findUnique({ where: { id: params.id } }))
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id
  await prisma.contract.deleteMany({ where: { id: params.id, userId } })
  return NextResponse.json({ success: true })
}
