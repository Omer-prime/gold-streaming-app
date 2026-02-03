import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const q = (searchParams.get("q") ?? "").trim();
    const userId = searchParams.get("userId") ?? undefined;

    const limit = Math.min(50, Math.max(5, Number(searchParams.get("limit")) || 20));
    const cursor = searchParams.get("cursor") ?? undefined;

    if (!q || q.length < 1) {
      return NextResponse.json({ items: [], nextCursor: null });
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: q, mode: "insensitive" } },
          { nickname: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : undefined,
      select: {
        id: true,
        username: true,
        nickname: true,
        avatarUrl: true,
        followersCount: true,
        isLive: true,
        liveViewers: true,
        country: { select: { code: true, flagEmoji: true } },
      },
    });

    let nextCursor: string | null = null;
    let data = users;

    if (users.length > limit) {
      const next = users[users.length - 1];
      nextCursor = next.id;
      data = users.slice(0, limit);
    }

    // following status for current user
    let followingSet = new Set<string>();
    if (userId && data.length > 0) {
      const follows = await prisma.follow.findMany({
        where: { followerId: userId, followingId: { in: data.map((u) => u.id) } },
        select: { followingId: true },
      });
      followingSet = new Set(follows.map((f) => f.followingId));
    }

    const items = data.map((u) => ({
      id: u.id,
      username: u.username,
      nickname: u.nickname ?? null,
      displayName: (u.nickname && u.nickname.trim().length > 0) ? u.nickname : u.username,
      avatarUrl: u.avatarUrl ?? null,
      followersCount: u.followersCount ?? 0,
      isLive: !!u.isLive,
      liveViewers: u.liveViewers ?? 0,
      countryCode: u.country?.code ?? null,
      countryFlag: u.country?.flagEmoji ?? null,
      isFollowing: userId ? followingSet.has(u.id) : false,
    }));

    return NextResponse.json({ items, nextCursor });
  } catch (e) {
    console.error("[GET /api/search/users]", e);
    return NextResponse.json({ error: "Failed to search users" }, { status: 500 });
  }
}
