import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { VipTier } from "@prisma/client";

function vipLevelFromTier(tier: VipTier) {
  switch (tier) {
    case "NORMAL":
      return 1;
    case "SUPER":
      return 2;
    case "DIAMOND":
      return 3;
    case "SVIP":
      return 4;
    default:
      return 0;
  }
}

function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    const userId = body?.userId as string | undefined;
    const tier = body?.tier as VipTier | undefined;
    const packageId = body?.packageId as string | undefined;

    if (!userId || !tier || !packageId) {
      return NextResponse.json(
        { error: "userId, tier, packageId are required" },
        { status: 400 }
      );
    }

    if (tier === "NONE") {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    // Load user + wallet
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, vipTier: true, vipExpiresAt: true, wallet: { select: { id: true, balance: true } } },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Ensure wallet exists (create if missing)
    const wallet =
      user.wallet ??
      (await prisma.wallet.create({ data: { userId: user.id, balance: 0 } }));

    // Validate plan + package
    const plan = await prisma.vipPlan.findUnique({
      where: { tier },
      include: { packages: true },
    });

    if (!plan || !plan.isActive) {
      return NextResponse.json({ error: "VIP plan is not available" }, { status: 400 });
    }

    const pkg = await prisma.vipPlanPackage.findFirst({
      where: { id: packageId, planId: plan.id, isActive: true },
      select: { id: true, label: true, durationMonths: true, priceCoins: true },
    });

    if (!pkg) {
      return NextResponse.json({ error: "VIP package not found" }, { status: 404 });
    }

    if (wallet.balance < pkg.priceCoins) {
      return NextResponse.json(
        { error: "Insufficient balance", balance: wallet.balance, priceCoins: pkg.priceCoins },
        { status: 400 }
      );
    }

    const now = new Date();
    const base = user.vipExpiresAt && user.vipExpiresAt > now ? user.vipExpiresAt : now;
    const newExpiresAt = addMonths(base, pkg.durationMonths);

    const newBalance = wallet.balance - pkg.priceCoins;

    const result = await prisma.$transaction(async (tx) => {
      // 1) Update wallet
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance, updatedAt: new Date() },
        select: { id: true, balance: true },
      });

      // 2) Wallet ledger entry
      await tx.walletLedger.create({
        data: {
          userId: user.id,
          walletId: wallet.id,
          type: "VIP_PURCHASE",
          delta: -pkg.priceCoins,
          balanceAfter: updatedWallet.balance,
          title: `VIP Purchase: ${plan.name} (${pkg.label})`,
          metaJson: {
            tier,
            planId: plan.id,
            packageId: pkg.id,
            durationMonths: pkg.durationMonths,
          },
        },
      });

      // 3) Update user VIP status (tier + expires + vipLevel)
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          vipTier: tier,
          vipExpiresAt: newExpiresAt,
          vipLevel: vipLevelFromTier(tier),
        },
        select: { vipTier: true, vipExpiresAt: true, vipLevel: true },
      });

      return { updatedWallet, updatedUser };
    });

    const daysLeft = Math.ceil((result.updatedUser.vipExpiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return NextResponse.json(
      {
        ok: true,
        wallet: result.updatedWallet,
        current: {
          tier: result.updatedUser.vipTier,
          vipLevel: result.updatedUser.vipLevel,
          expiresAt: result.updatedUser.vipExpiresAt.toISOString(),
          isActive: true,
          daysLeft,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("vip purchase error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
