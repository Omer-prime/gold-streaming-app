// src/app/api/profile/live-data/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ModeParam = "live" | "pk";
type RangeParam = "daily" | "weekly" | "monthly";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const userId = searchParams.get("userId") ?? undefined;
    const modeParam = (searchParams.get("mode") ?? "live").toLowerCase() as ModeParam;
    const rangeParam = (searchParams.get("range") ?? "daily").toLowerCase() as RangeParam;
    const dateParam = searchParams.get("date") ?? undefined; // "YYYY-MM-DD" (optional)

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

    const baseDate = dateParam ? new Date(dateParam) : new Date();
    if (isNaN(baseDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format, use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    const { start, end } = getRangeWindow(rangeParam, baseDate);
    const modeFilter = modeParam === "pk" ? "PK" : undefined;

    // 1) Won points
    const pointsAgg = await prisma.userPointLedger.aggregate({
      where: {
        userId,
        createdAt: { gte: start, lt: end },
      },
      _sum: { delta: true },
    });
    const wonPoints = pointsAgg._sum.delta ?? 0;

    // 2) Stream durations (LIVE + PARTY) with overlap
    const streamWhere: any = {
      hostId: userId,
      startedAt: { not: null, lte: end },
      OR: [{ endedAt: null }, { endedAt: { gte: start } }],
    };
    if (modeFilter) {
      streamWhere.mode = modeFilter;
    }

    const streams = await prisma.stream.findMany({
      where: streamWhere,
      select: {
        mode: true,
        startedAt: true,
        endedAt: true,
        viewers: true,
      },
    });

    let liveDurationSeconds = 0;
    let partyDurationSeconds = 0;
    let totalViewers = 0;
    let viewerSamples = 0;

    for (const s of streams) {
      if (!s.startedAt) continue;
      const sStart = s.startedAt;
      const sEnd = s.endedAt ?? end;

      const overlap = calculateOverlapSeconds(sStart, sEnd, start, end);
      if (overlap <= 0) continue;

      if (s.mode === "PARTY") {
        partyDurationSeconds += overlap;
      } else {
        liveDurationSeconds += overlap;
      }

      if (typeof s.viewers === "number") {
        totalViewers += s.viewers;
        viewerSamples += 1;
      }
    }

    const averageOnlineUsers =
      viewerSamples > 0 ? Math.round(totalViewers / viewerSamples) : 0;

    // 3) Earnings from gifts
    const giftWhere: any = {
      receiverId: userId,
      createdAt: { gte: start, lt: end },
    };
    if (modeFilter) {
      giftWhere.stream = { mode: modeFilter };
    }

    const gifts = await prisma.giftTransaction.findMany({
      where: giftWhere,
      select: {
        totalPrice: true,
        stream: { select: { mode: true } },
      },
    });

    let liveEarnings = 0;
    let partyEarnings = 0;

    for (const g of gifts) {
      const m = g.stream?.mode ?? "SOLO";
      if (m === "PARTY") {
        partyEarnings += g.totalPrice;
      } else {
        liveEarnings += g.totalPrice;
      }
    }

    // 4) New fans
    const newFans = await prisma.follow.count({
      where: {
        followingId: userId,
        createdAt: { gte: start, lt: end },
      },
    });

    // 5) New fan club members
    const newFanClubMembers = await prisma.fanClubMember.count({
      where: {
        createdAt: { gte: start, lt: end },
        fanClub: { ownerId: userId },
      },
    });

    // We don't yet track crown duration separately, keep 0 for now.
    const partyCrownDurationSeconds = 0;

    return NextResponse.json({
      mode: modeParam === "pk" ? "pk" : "live",
      range: ["daily", "weekly", "monthly"].includes(rangeParam)
        ? rangeParam
        : "daily",
      date: formatDateYYYYMMDD(start),
      wonPoints,
      liveDurationSeconds,
      liveEarnings,
      partyDurationSeconds,
      partyEarnings,
      newFans,
      newFanClubMembers,
      averageOnlineUsers,
      partyCrownDurationSeconds,
    } as const);
  } catch (err) {
    console.error("live-data route error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/* ---------- helpers ---------- */

function formatDateYYYYMMDD(d: Date) {
  const y = d.getUTCFullYear();
  const m = `${d.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${d.getUTCDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// daily/weekly/monthly window in UTC
function getRangeWindow(range: string, base: Date) {
  const y = base.getUTCFullYear();
  const m = base.getUTCMonth();
  const d = base.getUTCDate();

  if (range === "weekly") {
    const dayOfWeek = base.getUTCDay(); // 0 = Sun, 1 = Mon...
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const start = new Date(Date.UTC(y, m, d + diffToMonday));
    const end = new Date(
      Date.UTC(
        start.getUTCFullYear(),
        start.getUTCMonth(),
        start.getUTCDate() + 7
      )
    );
    return { start, end };
  }

  if (range === "monthly") {
    const start = new Date(Date.UTC(y, m, 1));
    const end = new Date(Date.UTC(y, m + 1, 1));
    return { start, end };
  }

  const start = new Date(Date.UTC(y, m, d));
  const end = new Date(Date.UTC(y, m, d + 1));
  return { start, end };
}

function calculateOverlapSeconds(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date
): number {
  const startMs = Math.max(aStart.getTime(), bStart.getTime());
  const endMs = Math.min(aEnd.getTime(), bEnd.getTime());
  if (endMs <= startMs) return 0;
  return Math.floor((endMs - startMs) / 1000);
}
