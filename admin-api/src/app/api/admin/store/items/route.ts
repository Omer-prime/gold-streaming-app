import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const categoryId = (req.nextUrl.searchParams.get("categoryId") || "").trim();

  const items = await prisma.storeItem.findMany({
    where: categoryId ? { categoryId } : undefined,
    orderBy: [{ sectionSortOrder: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
    include: { category: true },
  });

  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    const categoryId = String(body?.categoryId ?? "");
    const title = String(body?.title ?? "").trim();
    const priceCoins = Number(body?.priceCoins ?? 0) || 0;

    if (!categoryId) throw new Error("categoryId is required");
    if (!title) throw new Error("title is required");

    const created = await prisma.storeItem.create({
      data: {
        categoryId,
        title,
        description: body?.description ? String(body.description) : null,
        priceCoins,
        section: body?.section ? String(body.section) : null,
        sectionSortOrder: Number(body?.sectionSortOrder ?? 0) || 0,
        mediaType: body?.mediaType ?? "IMAGE",
        mediaUrl: body?.mediaUrl ? String(body.mediaUrl) : null,
        thumbnailUrl: body?.thumbnailUrl ? String(body.thumbnailUrl) : null,
        type: body?.type ?? "OTHER",
        durationDays: body?.durationDays != null ? Number(body.durationDays) || 0 : null,
        isActive: Boolean(body?.isActive ?? true),
        isFeatured: Boolean(body?.isFeatured ?? false),
        sortOrder: Number(body?.sortOrder ?? 0) || 0,
      },
    });

    return NextResponse.json({ ok: true, id: created.id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Error" }, { status: 400 });
  }
}
