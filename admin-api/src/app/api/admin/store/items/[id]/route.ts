import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, ctx: { params: { id: string } }) {
  try {
    const id = ctx.params.id;
    const body = await req.json().catch(() => null);

    const updated = await prisma.storeItem.update({
      where: { id },
      data: {
        categoryId: body?.categoryId ? String(body.categoryId) : undefined,
        title: body?.title != null ? String(body.title).trim() : undefined,
        description: body?.description != null ? String(body.description) : undefined,
        priceCoins: body?.priceCoins != null ? Number(body.priceCoins) || 0 : undefined,
        section: body?.section != null ? String(body.section) : undefined,
        sectionSortOrder: body?.sectionSortOrder != null ? Number(body.sectionSortOrder) || 0 : undefined,
        mediaType: body?.mediaType ?? undefined,
        mediaUrl: body?.mediaUrl != null ? String(body.mediaUrl) : undefined,
        thumbnailUrl: body?.thumbnailUrl != null ? String(body.thumbnailUrl) : undefined,
        type: body?.type ?? undefined,
        durationDays: body?.durationDays === null ? null : body?.durationDays != null ? Number(body.durationDays) || 0 : undefined,
        isActive: body?.isActive != null ? Boolean(body.isActive) : undefined,
        isFeatured: body?.isFeatured != null ? Boolean(body.isFeatured) : undefined,
        sortOrder: body?.sortOrder != null ? Number(body.sortOrder) || 0 : undefined,
      },
    });

    return NextResponse.json({ ok: true, item: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Error" }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, ctx: { params: { id: string } }) {
  try {
    const id = ctx.params.id;
    await prisma.storeItem.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Error" }, { status: 400 });
  }
}
