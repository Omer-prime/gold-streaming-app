import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/points/income?userId=...&days=30
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const days = Math.min(365, Math.max(1, Number(searchParams.get("days") || 30)));

    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const rows = await prisma.userPointLedger.findMany({
      where: {
        userId,
        createdAt: { gte: since },
        delta: { gt: 0 }, // income only
      },
      select: { delta: true, reason: true },
    });

    const sumBy = { livestream: 0, party: 0, platformRewards: 0 };

    for (const r of rows) {
      const reason = (r.reason || "").toLowerCase();
      if (reason.includes("live")) sumBy.livestream += r.delta;
      else if (reason.includes("party")) sumBy.party += r.delta;
      else sumBy.platformRewards += r.delta;
    }

    return NextResponse.json({ income: sumBy, days });
  } catch (e) {
    console.error("[GET /api/points/income]", e);
    return NextResponse.json({ error: "Failed to load income" }, { status: 500 });
  }
}
