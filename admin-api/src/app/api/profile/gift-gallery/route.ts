// admin-api/src/app/api/profile/gift-gallery/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/profile/gift-gallery?userId=...&limit=50
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const limit = Math.min(200, Math.max(1, Number(searchParams.get("limit") || 50)));

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // aggregate received gifts by giftId
    const agg = await prisma.giftTransaction.groupBy({
      by: ["giftId"],
      where: { receiverId: userId },
      _sum: { quantity: true, totalPrice: true },
      orderBy: { _sum: { totalPrice: "desc" } },
      take: limit,
    });

    const giftIds = agg.map((a) => a.giftId);

    const gifts = giftIds.length
      ? await prisma.gift.findMany({
          where: { id: { in: giftIds } },
          select: {
            id: true,
            name: true,
            price: true,
            iconUrl: true,
            mediaType: true,
            mediaUrl: true,
            thumbnailUrl: true,
          },
        })
      : [];

    const giftMap = new Map<number, any>(gifts.map((g) => [g.id, g]));

    const items = agg.map((a) => {
      const g = giftMap.get(a.giftId);
      const quantity = Number(a._sum.quantity ?? 0);
      const totalValueCoins = Number(a._sum.totalPrice ?? 0);

      return {
        giftId: a.giftId,
        name: String(g?.name ?? `Gift #${a.giftId}`),
        price: Number(g?.price ?? 0),
        quantity,
        totalValueCoins,
        iconUrl: g?.iconUrl ?? null,
        mediaType: g?.mediaType ?? null,
        mediaUrl: g?.mediaUrl ?? null,
        thumbnailUrl: g?.thumbnailUrl ?? null,
      };
    });

    const summary = {
      totalGifts: items.reduce((s: number, x: any) => s + (Number(x.quantity) || 0), 0),
      uniqueGifts: items.length,
      totalValueCoins: items.reduce((s: number, x: any) => s + (Number(x.totalValueCoins) || 0), 0),
    };

    return NextResponse.json({ summary, items });
  } catch (e) {
    console.error("[GET /api/profile/gift-gallery]", e);
    return NextResponse.json({ error: "Failed to load gift gallery" }, { status: 500 });
  }
}
