// src/app/api/admin/gifts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function toInt(v: string | null, def: number) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : def;
}

// GET /api/admin/gifts?page=1&limit=20
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = toInt(searchParams.get("page"), 1);
    const limit = Math.min(toInt(searchParams.get("limit"), 20), 100);
    const skip = (page - 1) * limit;

    const [total, gifts] = await Promise.all([
      prisma.gift.count(),
      prisma.gift.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    const pages = Math.max(1, Math.ceil(total / limit));

    return NextResponse.json({ gifts, page, limit, total, pages });
  } catch (error) {
    console.error("[GET /api/admin/gifts]", error);
    return NextResponse.json({ error: "Failed to load gifts" }, { status: 500 });
  }
}

// POST /api/admin/gifts
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    const {
      name,
      price,
      isActive,
      iconUrl,
      mediaType,
      mediaUrl,
      thumbnailUrl,
    } = body ?? {};

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const p = Number(price);
    if (!Number.isFinite(p) || p < 0) {
      return NextResponse.json({ error: "valid price is required" }, { status: 400 });
    }

    const gift = await prisma.gift.create({
      data: {
        name: name.trim(),
        price: Math.max(0, Math.floor(p)),
        isActive: typeof isActive === "boolean" ? isActive : true,

        // backward compatible
        iconUrl: iconUrl ? String(iconUrl) : null,

        // new fields
        mediaType:
          mediaType === "GIF" || mediaType === "VIDEO" || mediaType === "IMAGE"
            ? mediaType
            : "IMAGE",
        mediaUrl: mediaUrl ? String(mediaUrl) : null,
        thumbnailUrl: thumbnailUrl ? String(thumbnailUrl) : null,
      },
    });

    return NextResponse.json({ gift }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/gifts]", error);
    return NextResponse.json({ error: "Failed to create gift" }, { status: 500 });
  }
}
