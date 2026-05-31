import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const schema = z.object({
  contractNumber:   z.string().min(1),
  title:            z.string().min(1),
  clientName:       z.string().min(1),
  clientPhone:      z.string().optional().nullable(),
  clientEmail:      z.string().optional().nullable(),
  clientAddress:    z.string().optional().nullable(),
  clientPassport:   z.string().optional().nullable(),
  architectName:    z.string().min(1),
  architectPhone:   z.string().optional().nullable(),
  architectAddress: z.string().optional().nullable(),
  projectName:      z.string().min(1),
  projectAddress:   z.string().optional().nullable(),
  projectType:      z.string().optional().nullable(),
  startDate:        z.string().optional().nullable(),
  endDate:          z.string().optional().nullable(),
  totalAmount:      z.number().positive(),
  advanceAmount:    z.number().optional().nullable(),
  workItems:        z.string().min(1),
  terms:            z.string().optional().nullable(),
  status:           z.string().default("DRAFT"),
  projectId:        z.string().optional().nullable(),
  clientId:         z.string().optional().nullable(),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id

  const contracts = await prisma.contract.findMany({
    where: { userId },
    include: {
      project: { select: { id: true, name: true } },
      client:  { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(contracts)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id

  const data = schema.parse(await req.json())
  const contract = await prisma.contract.create({
    data: {
      ...data,
      userId,
      startDate:  data.startDate ? new Date(data.startDate) : null,
      endDate:    data.endDate   ? new Date(data.endDate)   : null,
      projectId:  data.projectId || null,
      clientId:   data.clientId  || null,
    },
    include: {
      project: { select: { id: true, name: true } },
      client:  { select: { id: true, name: true } },
    },
  })
  return NextResponse.json(contract, { status: 201 })
}
