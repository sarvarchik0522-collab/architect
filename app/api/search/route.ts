import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? ""
  if (q.length < 2) return NextResponse.json({ projects:[], clients:[], diaries:[], tasks:[] })

  const [projects, clients, diaries, tasks] = await Promise.all([
    prisma.project.findMany({
      where: { userId, OR: [{ name:{contains:q} }, { description:{contains:q} }, { address:{contains:q} }] },
      include: { client:{select:{name:true}} }, take: 6,
    }),
    prisma.client.findMany({
      where: { userId, OR: [{ name:{contains:q} }, { company:{contains:q} }, { phone:{contains:q} }, { email:{contains:q} }] },
      take: 6,
    }),
    prisma.diary.findMany({
      where: { userId, OR: [{ title:{contains:q} }, { description:{contains:q} }, { workDone:{contains:q} }] },
      take: 6,
    }),
    prisma.task.findMany({
      where: { userId, OR: [{ title:{contains:q} }, { description:{contains:q} }] },
      include: { project:{select:{id:true,name:true}} }, take: 6,
    }),
  ])
  return NextResponse.json({ projects, clients, diaries, tasks })
}
