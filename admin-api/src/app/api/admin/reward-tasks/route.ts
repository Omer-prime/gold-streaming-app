import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const tasks = await prisma.rewardTask.findMany({
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ tasks });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.title || !body?.category) {
    return NextResponse.json({ error: "title and category are required" }, { status: 400 });
  }

  const created = await prisma.rewardTask.create({
    data: {
      category: body.category,
      title: body.title,
      subtitle: body.subtitle ?? null,
      rewardPoints: Number(body.rewardPoints ?? 0),
      target: Number(body.target ?? 1),
      goToScreen: body.goToScreen ?? null,
      isActive: Boolean(body.isActive ?? true),
      sortOrder: Number(body.sortOrder ?? 0),
    },
  });

  return NextResponse.json({ task: created }, { status: 201 });
}
