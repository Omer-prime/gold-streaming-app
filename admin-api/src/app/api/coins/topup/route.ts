import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  userId?: string;
  packageId?: string;
};

const PACKAGE_MAP: Record<string, { coins: number; title: string }> = {
  p1: { coins: 100, title: "Starter" },
  p2: { coins: 550, title: "Value Pack" },
  p3: { coins: 1200, title: "Popular" },
  p4: { coins: 2500, title: "Mega" },
};

export async function POST(req: NextRequest) {
  try {
    const mode = (process.env.COIN_TOPUP_MODE || "TEST").toUpperCase();
    if (mode !== "TEST") {
      return NextResponse.json(
        { error: "Topup disabled (set COIN_TOPUP_MODE=TEST to enable test topups)" },
        { status: 403 }
      );
    }

    const body = (await req.json().catch(() => null)) as Body | null;
    const userId = body?.userId;
    const packageId = body?.packageId;

    if (!userId || !packageId) {
      return NextResponse.json({ error: "userId & packageId required" }, { status: 400 });
    }

    const pack = PACKAGE_MAP[packageId];
    if (!pack) {
      return NextResponse.json({ error: "Invalid packageId" }, { status: 400 });
    }

    const coinsToAdd = pack.coins;

    const result = await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.upsert({
        where: { userId },
        update: {},
        create: { userId, balance: 0 },
        select: { id: true, userId: true, balance: true },
      });

      const newBalance = wallet.balance + coinsToAdd;

      const updated = await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance, updatedAt: new Date() },
        select: { id: true, userId: true, balance: true },
      });

      await tx.walletLedger.create({
        data: {
          userId,
          walletId: wallet.id,
          type: "TOPUP",
          delta: coinsToAdd,
          balanceAfter: newBalance,
          title: `Top up (${pack.title})`,
          metaJson: { packageId, coins: coinsToAdd, mode: "TEST" },
        },
      });

      return updated;
    });

    return NextResponse.json({ ok: true, wallet: result });
  } catch (e) {
    console.error("[POST /api/coins/topup]", e);
    return NextResponse.json({ error: "Topup failed" }, { status: 500 });
  }
}
