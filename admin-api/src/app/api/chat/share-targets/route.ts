// admin-api/src/app/api/chat/share-targets/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/chat/share-targets?userId=...&limit=50
 * Returns union of (my followers + my following), unique users.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = (searchParams.get("userId") ?? "").trim();
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 50));

    if (!userId) return NextResponse.json({ items: [] });

    const links = await prisma.follow.findMany({
      where: {
        OR: [{ followerId: userId }, { followingId: userId }],
      },
      take: limit * 2,
      include: {
        follower: { select: { id: true, username: true, nickname: true, avatarUrl: true, country: { select: { flagEmoji: true } } } },
        following: { select: { id: true, username: true, nickname: true, avatarUrl: true, country: { select: { flagEmoji: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });

    const map = new Map<string, any>();

    for (const l of links) {
      const other = l.followerId === userId ? l.following : l.follower;
      if (!other) continue;
      if (other.id === userId) continue;

      if (!map.has(other.id)) {
        const displayName =
          (other.nickname && other.nickname.trim().length > 0 ? other.nickname : other.username) ?? "User";

        map.set(other.id, {
          id: other.id,
          username: other.username,
          displayName,
          avatarUrl: other.avatarUrl ?? null,
          countryFlag: other.country?.flagEmoji ?? null,
        });
      }
    }

    const items = Array.from(map.values()).slice(0, limit);
    return NextResponse.json({ items });
  } catch (e) {
    console.error("[GET /api/chat/share-targets]", e);
    return NextResponse.json({ items: [], error: "Failed to load share targets" }, { status: 500 });
  }
}
