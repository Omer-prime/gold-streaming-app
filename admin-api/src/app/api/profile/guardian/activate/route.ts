import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function addMonths(date: Date, months: number) {
  const d = new Date(date);
  const day = d.getDate();
  d.setMonth(d.getMonth() + months);
  // handle month overflow (e.g. Jan 31 + 1 month)
  if (d.getDate() < day) d.setDate(0);
  return d;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const userId = String(body?.userId ?? "");
    const targetUserId = String(body?.targetUserId ?? "");
    const packageId = String(body?.packageId ?? "");

    if (!userId) throw new Error("userId is required");
    if (!targetUserId) throw new Error("targetUserId is required");
    if (!packageId) throw new Error("packageId is required");
    if (userId === targetUserId) throw new Error("You cannot guard yourself");

    const now = new Date();

    const pkg = await prisma.guardianPlanPackage.findUnique({
      where: { id: packageId },
      include: { plan: true },
    });
    if (!pkg || !pkg.isActive) throw new Error("Invalid package");
    if (!pkg.plan.isActive) throw new Error("Plan is disabled");

    const price = pkg.priceCoins;
    const endsAt = addMonths(now, pkg.durationMonths);

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.guardianBond.findFirst({
        where: {
          guardianId: userId,
          guardedId: targetUserId,
          status: "ACTIVE",
          endsAt: { gt: now },
        },
        select: { id: true },
      });
      if (existing) throw new Error("You are already guarding this user");

      const wallet = await tx.wallet.upsert({
        where: { userId },
        update: {},
        create: { userId, balance: 0 },
      });

      if (wallet.balance < price) throw new Error("Insufficient balance");

      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: price } },
      });

      const bond = await tx.guardianBond.create({
        data: {
          guardianId: userId,
          guardedId: targetUserId,
          planId: pkg.planId,
          packageId: pkg.id,
          tier: pkg.plan.tier,
          status: "ACTIVE",
          startedAt: now,
          endsAt,
          priceCoins: price,
        },
      });

      await tx.walletLedger.create({
        data: {
          userId,
          walletId: wallet.id,
          type: "GUARDIAN_PURCHASE",
          delta: -price,
          balanceAfter: updatedWallet.balance,
          title: `Guardian ${pkg.plan.tier} (${pkg.label})`,
          metaJson: { bondId: bond.id, guardedId: targetUserId, planId: pkg.planId, packageId: pkg.id },
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { totalCoinsSpent: { increment: price } },
      });

      return { bondId: bond.id, endsAt, balance: updatedWallet.balance };
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Error" }, { status: 400 });
  }
}
