// admin-api/src/app/api/profile/live-data/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ScopeParam = "user" | "country" | "global";
type RangeParam = "daily" | "weekly" | "monthly";

// NOTE: keep for backward compatibility (older clients may still send mode)
// In your current usage, you can ignore this.
type ModeParam = "live" | "pk";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const userId = searchParams.get("userId") ?? undefined;

    const scopeParamRaw = (searchParams.get("scope") ?? "user").toLowerCase();
    const scopeParam: ScopeParam =
      scopeParamRaw === "global"
        ? "global"
        : scopeParamRaw === "country"
        ? "country"
        : "user";

    const rangeParamRaw = (searchParams.get("range") ?? "daily").toLowerCase();
    const rangeParam: RangeParam =
      rangeParamRaw === "weekly"
        ? "weekly"
        : rangeParamRaw === "monthly"
        ? "monthly"
        : "daily";

    const dateParam = searchParams.get("date") ?? undefined; // YYYY-MM-DD

    // optional overrides (future)
    const countryIdStr = searchParams.get("countryId") ?? undefined;
    const countryCode = (searchParams.get("countryCode") ?? undefined)?.toUpperCase();

    // backward compat param (optional)
    const modeParam = (searchParams.get("mode") ?? "live").toLowerCase() as ModeParam;
    const modeFilter = modeParam === "pk" ? "PK" : undefined; // Stream.mode filter

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        countryId: true,
        country: { select: { id: true, code: true, name: true, flagEmoji: true } },
      },
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

    // resolve country (for country scope)
    let country: { id: number; code: string; name: string; flagEmoji: string | null } | null =
      null;
    let countryId: number | null = null;

    if (scopeParam === "country") {
      if (countryIdStr && !Number.isNaN(Number(countryIdStr))) {
        countryId = Number(countryIdStr);
        country = await prisma.country.findUnique({
          where: { id: countryId },
          select: { id: true, code: true, name: true, flagEmoji: true },
        });
      } else if (countryCode) {
        country = await prisma.country.findUnique({
          where: { code: countryCode },
          select: { id: true, code: true, name: true, flagEmoji: true },
        });
        countryId = country?.id ?? null;
      } else {
        countryId = user.countryId ?? null;
        country = user.country ?? null;
      }

      if (!countryId) {
        return NextResponse.json(
          { error: "User country is not set. Please set country first." },
          { status: 400 }
        );
      }
    }

    // ---------- WHERE builders ----------
    const pointsWhere: any = { createdAt: { gte: start, lt: end } };
    const streamWhere: any = {
      startedAt: { not: null, lte: end },
      OR: [{ endedAt: null }, { endedAt: { gte: start } }],
    };
    const giftWhere: any = { createdAt: { gte: start, lt: end } };
    const followWhere: any = { createdAt: { gte: start, lt: end } };
    const fanClubMemberWhere: any = { createdAt: { gte: start, lt: end } };

    if (scopeParam === "user") {
      pointsWhere.userId = userId;
      streamWhere.hostId = userId;
      giftWhere.receiverId = userId;
      followWhere.followingId = userId;
      fanClubMemberWhere.fanClub = { ownerId: userId };
    }

    if (scopeParam === "country") {
      pointsWhere.user = { countryId };
      streamWhere.host = { countryId };
      giftWhere.receiver = { countryId };
      followWhere.following = { countryId };
      fanClubMemberWhere.fanClub = { owner: { countryId } };
    }

    // global scope => keep only time filters

    if (modeFilter) {
      streamWhere.mode = modeFilter;
      giftWhere.stream = { mode: modeFilter };
    }

    // 1) Won points
    const pointsAgg = await prisma.userPointLedger.aggregate({
      where: pointsWhere,
      _sum: { delta: true },
    });
    const wonPoints = pointsAgg._sum.delta ?? 0;

    // 2) Stream durations + avg viewers
    const streams = await prisma.stream.findMany({
      where: streamWhere,
      select: { mode: true, startedAt: true, endedAt: true, viewers: true },
      orderBy: { startedAt: "desc" },
      take: 5000, // safety cap for global
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

      if (s.mode === "PARTY") partyDurationSeconds += overlap;
      else liveDurationSeconds += overlap;

      if (typeof s.viewers === "number") {
        totalViewers += s.viewers;
        viewerSamples += 1;
      }
    }

    const averageOnlineUsers =
      viewerSamples > 0 ? Math.round(totalViewers / viewerSamples) : 0;

    // 3) Earnings from gifts
    const gifts = await prisma.giftTransaction.findMany({
      where: giftWhere,
      select: { totalPrice: true, stream: { select: { mode: true } } },
      orderBy: { createdAt: "desc" },
      take: 8000, // safety cap
    });

    let liveEarnings = 0;
    let partyEarnings = 0;

    for (const g of gifts) {
      const m = g.stream?.mode ?? "SOLO";
      if (m === "PARTY") partyEarnings += g.totalPrice;
      else liveEarnings += g.totalPrice;
    }

    // 4) New fans
    const newFans = await prisma.follow.count({ where: followWhere });

    // 5) New fan club members
    const newFanClubMembers = await prisma.fanClubMember.count({
      where: fanClubMemberWhere,
    });

    const partyCrownDurationSeconds = 0;

    return NextResponse.json({
      scope: scopeParam,
      country: scopeParam === "country" ? country : null,
      range: rangeParam,
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

function getRangeWindow(range: string, base: Date) {
  const y = base.getUTCFullYear();
  const m = base.getUTCMonth();
  const d = base.getUTCDate();

  if (range === "weekly") {
    const dayOfWeek = base.getUTCDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const start = new Date(Date.UTC(y, m, d + diffToMonday));
    const end = new Date(
      Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + 7)
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

function calculateOverlapSeconds(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  const startMs = Math.max(aStart.getTime(), bStart.getTime());
  const endMs = Math.min(aEnd.getTime(), bEnd.getTime());
  if (endMs <= startMs) return 0;
  return Math.floor((endMs - startMs) / 1000);
}
