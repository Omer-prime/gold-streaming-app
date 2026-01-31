import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/points/summary?userId=...&days=30
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const daysRaw = searchParams.get("days") || "30";
    const days = Math.min(365, Math.max(1, Number(daysRaw)));

    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // balance = SUM(delta)
    const agg = await prisma.userPointLedger.aggregate({
      where: { userId },
      _sum: { delta: true },
    });

    const available = Number(agg._sum.delta ?? 0);

    // total earned = sum of positive deltas
    const totalEarnAgg = await prisma.userPointLedger.aggregate({
      where: { userId, delta: { gt: 0 } },
      _sum: { delta: true },
    });
    const total = Number(totalEarnAgg._sum.delta ?? 0);

    // last N days income breakdown
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const rows = await prisma.userPointLedger.findMany({
      where: { userId, createdAt: { gte: since }, delta: { gt: 0 } },
      select: { delta: true, reason: true },
      take: 5000,
    });

    const income = { livestream: 0, party: 0, platformRewards: 0 };

    for (const r of rows) {
      const d = Number(r.delta ?? 0);
      const reason = (r.reason || "").toUpperCase();

      if (reason.includes("LIVE")) income.livestream += d;
      else if (reason.includes("PARTY")) income.party += d;
      else income.platformRewards += d;
    }

    // for now we don’t have confirm/unconfirmed status in schema
    const unconfirmed = 0;

    return NextResponse.json({
      summary: {
        available,
        total,
        unconfirmed,
        income,
        days,
      },
    });
  } catch (e) {
    console.error("[GET /api/points/summary]", e);
    return NextResponse.json({ error: "Failed to load points summary" }, { status: 500 });
  }
}
