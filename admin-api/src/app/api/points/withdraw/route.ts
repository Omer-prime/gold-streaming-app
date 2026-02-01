import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  userId?: string;
  points?: number;
  method?: string;
  account?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as Body | null;

    const userId = body?.userId?.trim();
    const points = Math.trunc(Number(body?.points));
    const method = (body?.method || "").trim();
    const account = (body?.account || "").trim();

    if (!userId || !Number.isFinite(points) || points <= 0) {
      return NextResponse.json({ error: "userId & points (>0) required" }, { status: 400 });
    }
    if (!method || !account) {
      return NextResponse.json({ error: "method & account required" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId }, select: { id: true } });
      if (!user) return { ok: false as const, error: "User not found" };

      // available points = SUM(delta)
      const balAgg = await tx.userPointLedger.aggregate({
        where: { userId },
        _sum: { delta: true },
      });
      const available = Number(balAgg._sum.delta ?? 0);

      if (available < points) return { ok: false as const, error: "Not enough available points" };

      // Create withdrawal request (you need this model/table)
      const wd = await tx.pointWithdrawal.create({
        data: {
          userId,
          points,
          method,
          account,
          status: "PENDING",
        },
        select: { id: true },
      });

      // Hold points immediately (reserve)
      await tx.userPointLedger.create({
        data: {
          userId,
          delta: -points,
          reason: `WITHDRAW_REQUEST:${wd.id}`,
        },
      });

      return { ok: true as const, withdrawalId: wd.id };
    });

    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

    return NextResponse.json({ ok: true, withdrawalId: result.withdrawalId });
  } catch (e) {
    console.error("[POST /api/points/withdraw/request]", e);
    return NextResponse.json({ error: "Failed to submit withdrawal request" }, { status: 500 });
  }
}
