import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null);
  const updated = await prisma.rewardTask.update({
    where: { id: params.id },
    data: {
      title: body?.title,
      subtitle: body?.subtitle ?? null,
      rewardPoints: body?.rewardPoints != null ? Number(body.rewardPoints) : undefined,
      target: body?.target != null ? Number(body.target) : undefined,
      goToScreen: body?.goToScreen ?? undefined,
      isActive: body?.isActive != null ? Boolean(body.isActive) : undefined,
      sortOrder: body?.sortOrder != null ? Number(body.sortOrder) : undefined,
      category: body?.category ?? undefined,
    },
  });
  return NextResponse.json({ task: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.rewardTask.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
