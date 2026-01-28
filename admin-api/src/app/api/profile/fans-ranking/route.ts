// src/app/api/profile/fans-ranking/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RankingRangeParam = "today" | "7days" | "monthly";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const userId = searchParams.get("userId") ?? undefined;
    const rangeParamRaw = (searchParams.get("range") ?? "today").toLowerCase();
    const rangeParam: RankingRangeParam =
      rangeParamRaw === "7days" || rangeParamRaw === "monthly" ? (rangeParamRaw as any) : "today";

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const baseDate = new Date();
    const { start, end } = getRankingWindow(rangeParam, baseDate);

    // group total coins sent to this host (receiverId=userId)
    const grouped = await prisma.giftTransaction.groupBy({
      by: ["senderId"],
      where: {
        receiverId: userId,
        createdAt: { gte: start, lt: end },
      },
      _sum: { totalPrice: true },
      orderBy: { _sum: { totalPrice: "desc" } },
      take: 50,
    });

    const senderIds = grouped.map((g) => g.senderId);

    const senders = senderIds.length
      ? await prisma.user.findMany({
          where: { id: { in: senderIds } },
          select: {
            id: true,
            username: true,
            nickname: true,
            avatarUrl: true,
          },
        })
      : [];

    const senderMap = new Map(senders.map((u) => [u.id, u]));

    const list = grouped.map((g, index) => {
      const userInfo = senderMap.get(g.senderId);
      return {
        rank: index + 1,
        userId: g.senderId,
        nickname: userInfo?.nickname ?? null,
        username: userInfo?.username ?? "",
        avatarUrl: userInfo?.avatarUrl ?? null,
        coins: Number(g._sum.totalPrice ?? 0),
      };
    });

    const myIdx = list.findIndex((i) => i.userId === userId);
    const myRank = myIdx === -1 ? null : list[myIdx].rank;
    const myCoins = myIdx === -1 ? 0 : list[myIdx].coins;

    // ✅ Mobile-friendly output (prevents `items.map` crash)
    const totalContribution = list.reduce((sum, x) => sum + (x.coins ?? 0), 0);

    const items = list.map((x) => ({
      id: x.userId,
      nickname: x.nickname ?? x.username ?? "Unknown",
      avatarUrl: x.avatarUrl ?? null,
      contribution: x.coins ?? 0,
      level: 0, // you can compute real level later if you have logic
      rank: x.rank,
    }));

    return NextResponse.json(
      {
        range: rangeParam,
        myRank,
        myCoins,

        // existing format (admin / future use)
        list,

        // added format (mobile screen)
        totalContribution,
        items,
      } as const,
      { status: 200 }
    );
  } catch (err) {
    console.error("fans-ranking route error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function getRankingWindow(range: RankingRangeParam, base: Date) {
  const y = base.getUTCFullYear();
  const m = base.getUTCMonth();
  const d = base.getUTCDate();

  if (range === "7days") {
    const end = new Date(Date.UTC(y, m, d + 1));
    const start = new Date(Date.UTC(y, m, d - 6));
    return { start, end };
  }

  if (range === "monthly") {
    const start = new Date(Date.UTC(y, m, 1));
    const end = new Date(Date.UTC(y, m + 1, 1));
    return { start, end };
  }

  // today
  const start = new Date(Date.UTC(y, m, d));
  const end = new Date(Date.UTC(y, m, d + 1));
  return { start, end };
}
