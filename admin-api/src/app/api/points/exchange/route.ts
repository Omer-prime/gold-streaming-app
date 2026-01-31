import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = { userId?: string; points?: number };

function int(n: any) {
  const x = Number(n);
  return Number.isFinite(x) ? Math.trunc(x) : NaN;
}

// POST /api/points/exchange
// body: { userId, points }
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as Body | null;
    const userId = body?.userId;
    const points = int(body?.points);

    if (!userId || !Number.isFinite(points) || points <= 0) {
      return NextResponse.json({ error: "userId & points (>0) required" }, { status: 400 });
    }

    const rate = int(process.env.POINTS_PER_COIN || 10); // 10 points = 1 coin default
    if (!Number.isFinite(rate) || rate <= 0) {
      return NextResponse.json({ error: "Invalid POINTS_PER_COIN" }, { status: 500 });
    }

    const coinsToAdd = Math.floor(points / rate);
    if (coinsToAdd <= 0) {
      return NextResponse.json({ error: `Not enough points. Need at least ${rate} points.` }, { status: 400 });
    }

    const pointsToSpend = coinsToAdd * rate;

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId }, select: { id: true } });
      if (!user) throw new Error("User not found");

      const balAgg = await tx.userPointLedger.aggregate({
        where: { userId },
        _sum: { delta: true },
      });
      const availablePoints = Number(balAgg._sum.delta ?? 0);

      if (availablePoints < pointsToSpend) {
        return { ok: false as const, error: "Not enough available points." };
      }

      // deduct points
      await tx.userPointLedger.create({
        data: {
          userId,
          delta: -pointsToSpend,
          reason: `EXCHANGE_TO_COINS:${coinsToAdd}`,
        },
      });

      // credit wallet coins + ledger entry
      const wallet = await tx.wallet.upsert({
        where: { userId },
        update: {},
        create: { userId, balance: 0 },
        select: { id: true, balance: true },
      });

      const newBalance = wallet.balance + coinsToAdd;

      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance, updatedAt: new Date() },
        select: { id: true, userId: true, balance: true },
      });

      await tx.walletLedger.create({
        data: {
          userId,
          walletId: wallet.id,
          type: "ADJUSTMENT",
          delta: coinsToAdd,
          balanceAfter: newBalance,
          title: "Points exchange",
          metaJson: { pointsSpent: pointsToSpend, coinsAdded: coinsToAdd, rate },
        },
      });

      return { ok: true as const, wallet: updatedWallet, pointsSpent: pointsToSpend, coinsAdded: coinsToAdd };
    });

    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

    return NextResponse.json(result);
  } catch (e: any) {
    console.error("[POST /api/points/exchange]", e);
    return NextResponse.json({ error: e?.message || "Exchange failed" }, { status: 500 });
  }
}
