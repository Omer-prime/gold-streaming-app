import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getIdFromCtx(req: NextRequest, ctx: any) {
  const fromParams = ctx?.params?.id;
  if (fromParams) return String(fromParams);

  // fallback (just in case)
  const pathname = new URL(req.url).pathname;
  const parts = pathname.split("/").filter(Boolean);
  const last = parts[parts.length - 1];
  return last ? String(last) : "";
}

export async function PATCH(req: NextRequest, ctx: { params: { id: string } }) {
  try {
    const id = getIdFromCtx(req, ctx);
    if (!id) return NextResponse.json({ error: "Missing item id" }, { status: 400 });

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

    // Build data WITHOUT undefined keys (Prisma-safe)
    const data: any = {};

    if (body.categoryId != null) data.categoryId = String(body.categoryId);
    if (body.title != null) data.title = String(body.title).trim();
    if (body.description !== undefined)
      data.description = body.description === null ? null : String(body.description);

    if (body.priceCoins !== undefined)
      data.priceCoins = body.priceCoins === null ? null : Number(body.priceCoins) || 0;

    if (body.section !== undefined)
      data.section = body.section === null ? null : String(body.section);

    if (body.sectionSortOrder !== undefined)
      data.sectionSortOrder = body.sectionSortOrder === null ? null : Number(body.sectionSortOrder) || 0;

    if (body.mediaType !== undefined) data.mediaType = body.mediaType;
    if (body.mediaUrl !== undefined)
      data.mediaUrl = body.mediaUrl === null ? null : String(body.mediaUrl);

    if (body.thumbnailUrl !== undefined)
      data.thumbnailUrl = body.thumbnailUrl === null ? null : String(body.thumbnailUrl);

    if (body.type !== undefined) data.type = body.type;

    if (body.durationDays !== undefined) {
      data.durationDays =
        body.durationDays === null ? null : Number(body.durationDays) || 0;
    }

    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);
    if (body.isFeatured !== undefined) data.isFeatured = Boolean(body.isFeatured);
    if (body.sortOrder !== undefined) data.sortOrder = Number(body.sortOrder) || 0;

    if (data.title !== undefined && !String(data.title).trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const updated = await prisma.storeItem.update({
      where: { id },
      data,
    });

    return NextResponse.json({ ok: true, item: updated });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Error" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest, ctx: { params: { id: string } }) {
  try {
    const id = getIdFromCtx(req, ctx);
    if (!id) return NextResponse.json({ error: "Missing item id" }, { status: 400 });

    await prisma.storeItem.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Error" },
      { status: 400 }
    );
  }
}
