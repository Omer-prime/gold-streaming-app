import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const userId = searchParams.get("userId") ?? undefined;
    const tabRaw = (searchParams.get("tab") ?? "explore").toLowerCase();
    const tab: "explore" | "following" | "new" | "near" =
      tabRaw === "following" || tabRaw === "new" || tabRaw === "near"
        ? (tabRaw as any)
        : "explore";

    const countryParam = (searchParams.get("country") ?? "popular").toLowerCase();
    const q = (searchParams.get("q") ?? "").trim();
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));

    if (tab === "following" && !userId) {
      return NextResponse.json({ items: [], nextCursor: null });
    }

    const where: Prisma.StreamWhereInput = {
      isLive: true,
    };

    // country filter
    if (countryParam !== "all" && countryParam !== "popular") {
      where.host = {
        country: { code: countryParam.toUpperCase() },
      };
    }

    // search filter
    if (q.length > 0) {
      where.host = {
        ...(where.host as any),
        OR: [
          { username: { contains: q, mode: "insensitive" } },
          { nickname: { contains: q, mode: "insensitive" } },
        ],
      };
    }

    // following filter
    if (tab === "following" && userId) {
      where.host = {
        ...(where.host as any),
        followers: { some: { followerId: userId } },
      };
    }

    // near filter = same country as me
    if (tab === "near" && userId) {
      const me = await prisma.user.findUnique({
        where: { id: userId },
        select: { countryId: true },
      });

      if (typeof me?.countryId === "number") {
        where.host = {
          ...(where.host as any),
          countryId: me.countryId,
        };
      }
    }

    const streams = await prisma.stream.findMany({
      where,
      orderBy: [{ viewers: "desc" }, { startedAt: "desc" }],
      take: limit,
      select: {
        id: true,
        hostId: true,
        title: true,
        mode: true,
        viewers: true,
        startedAt: true,
        thumbnailUrl: true,
        host: {
          select: {
            id: true,
            username: true,
            nickname: true,
            avatarUrl: true,
            liveCoverUrl: true,
            followersCount: true,
            totalCoinsReceived: true,
            country: { select: { code: true, flagEmoji: true } },
          },
        },
      },
    });

    const items = streams.map((s) => ({
      id: s.host.id,
      displayName: s.host.nickname || s.host.username,
      avatarUrl: s.host.avatarUrl,
      liveCoverUrl: s.host.liveCoverUrl ?? null,
      countryCode: s.host.country?.code ?? null,
      countryFlag: s.host.country?.flagEmoji ?? null,
      isLive: true,
      liveViewers: s.viewers ?? 0,
      followersCount: s.host.followersCount ?? 0,
      coins: s.host.totalCoinsReceived ?? 0,
      streamId: s.id,
      activeStreamId: s.id,
      streamTitle: s.title ?? null,
      streamMode: s.mode ?? null,
      thumbnailUrl: s.thumbnailUrl ?? null,
      startedAt: s.startedAt ?? null,
    }));

    return NextResponse.json({ items, nextCursor: null });
  } catch (error) {
    console.error("[GET /api/feed/explore]", error);
    return NextResponse.json({ error: "Failed to load explore feed" }, { status: 500 });
  }
}
