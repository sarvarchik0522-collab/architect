import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const schema = z.object({
  amount: z.number().positive(),
  date:   z.string().optional(),
  note:   z.string().optional().nullable(),
})

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id

  // Verify ownership
  const debt = await prisma.debt.findFirst({ where: { id: params.id, userId } })
  if (!debt) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const body = await req.json()
  const data = schema.parse(body)

  // Create payment
  const payment = await prisma.debtPayment.create({
    data: {
      amount: data.amount,
      date:   data.date ? new Date(data.date) : new Date(),
      note:   data.note || null,
      debtId: params.id,
    },
  })

  // Recalculate paidAmount and status
  const allPayments = await prisma.debtPayment.findMany({ where: { debtId: params.id } })
  const paidAmount  = allPayments.reduce((sum, p) => sum + p.amount, 0)
  const status =
    paidAmount >= debt.amount
      ? "PAID"
      : paidAmount > 0
      ? "PARTIAL"
      : "PENDING"

  await prisma.debt.update({ where: { id: params.id }, data: { paidAmount, status } })

  return NextResponse.json(payment, { status: 201 })
}
