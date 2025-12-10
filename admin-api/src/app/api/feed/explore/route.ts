// admin-api/src/app/api/feed/explore/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

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

    const countryParam = searchParams.get("country") ?? "all";
    const q = (searchParams.get("q") ?? "").trim();
    const limit = Math.min(
      50,
      Math.max(1, Number(searchParams.get("limit")) || 20)
    );
    const cursor = searchParams.get("cursor") ?? undefined;

    if (tab === "following" && !userId) {
      return NextResponse.json({ items: [], nextCursor: null });
    }

    // ---------------- BASE WHERE ----------------
    const where: Prisma.UserWhereInput = {
      role: "HOST",
    };

    // 👉 only live hosts for Explore / Following / Near
    if (tab !== "new") {
      where.isLive = true;
    }

    // country filter
    if (
      countryParam &&
      countryParam.toLowerCase() !== "all" &&
      countryParam.toLowerCase() !== "popular"
    ) {
      where.country = { code: countryParam };
    }

    // search filter
    if (q.length > 0) {
      where.OR = [
        { username: { contains: q, mode: "insensitive" } },
        { nickname: { contains: q, mode: "insensitive" } },
      ];
    }

    // Following tab
    if (tab === "following" && userId) {
      where.followers = {
        some: {
          followerId: userId,
        },
      };
    }

    // Near tab
    if (tab === "near" && userId) {
      const me = await prisma.user.findUnique({
        where: { id: userId },
        select: { countryId: true },
      });

      if (me?.countryId) {
        where.countryId = me.countryId;
      }
    }

    // ---------------- ORDER / RANKING ----------------
    let orderBy:
      | Prisma.UserOrderByWithRelationInput
      | Prisma.UserOrderByWithRelationInput[];

    if (tab === "new") {
      orderBy = { createdAt: "desc" };
    } else {
      orderBy = [
        { isLive: "desc" },
        { liveViewers: "desc" },
        { followersCount: "desc" },
        { totalCoinsReceived: "desc" },
        { lastLiveAt: "desc" },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      orderBy,
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : undefined,
      select: {
        id: true,
        username: true,
        nickname: true,
        avatarUrl: true,

        isLive: true,
        liveViewers: true,
        followersCount: true,
        totalCoinsReceived: true,
        lastLiveAt: true,

        country: {
          select: {
            code: true,
            flagEmoji: true,
          },
        },
      },
    });

    let nextCursor: string | null = null;
    let data = users;

    if (users.length > limit) {
      const next = users[users.length - 1];
      nextCursor = next.id;
      data = users.slice(0, limit);
    }

    const items = data.map((u) => ({
      id: u.id,
      displayName: u.nickname || u.username,
      avatarUrl: u.avatarUrl,
      countryCode: u.country?.code ?? null,
      countryFlag: u.country?.flagEmoji ?? null,
      isLive: u.isLive,
      liveViewers: u.liveViewers,
      followersCount: u.followersCount,
      coins: u.totalCoinsReceived,
      lastLiveAt: u.lastLiveAt,
    }));

    return NextResponse.json({ items, nextCursor });
  } catch (error) {
    console.error("[GET /api/feed/explore]", error);
    return NextResponse.json(
      { error: "Failed to load explore feed" },
      { status: 500 }
    );
  }
}
