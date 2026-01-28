import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { VipTier } from "@prisma/client";

type VipTierKey = "NONE" | "NORMAL" | "SUPER" | "DIAMOND" | "SVIP";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, vipTier: true, vipExpiresAt: true, level: true, liveLevel: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const now = new Date();
    let daysLeft: number | null = null;
    let isActive = false;

    if (user.vipExpiresAt && user.vipExpiresAt > now) {
      const diffMs = user.vipExpiresAt.getTime() - now.getTime();
      daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      isActive = true;
    }

    const current = {
      tier: user.vipTier as VipTierKey,
      expiresAt: user.vipExpiresAt ? user.vipExpiresAt.toISOString() : null,
      isActive,
      daysLeft,
    };

    const plansDb = await prisma.vipPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        packages: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          select: { id: true, label: true, durationMonths: true, priceCoins: true },
        },
        planPrivileges: {
          orderBy: { sortOrder: "asc" },
          include: {
            privilege: {
              select: { key: true, label: true, defaultValue: true, icon: true, isActive: true },
            },
          },
        },
      },
    });

    const plans = plansDb.map((p) => {
      const monthly = p.packages.find((x) => x.durationMonths === 1) ?? p.packages[0];
      return {
        tier: p.tier as VipTierKey,
        name: p.name,
        description: p.description ?? "Get VIP & enjoy privileges.",
        monthlyPriceCoins: monthly?.priceCoins ?? 0, // backward compat
        packages: p.packages,
        privileges: p.planPrivileges
          .filter((pp) => pp.privilege.isActive)
          .map((pp) => ({
            key: pp.privilege.key,
            label: pp.privilege.label,
            value: pp.valueOverride ?? pp.privilege.defaultValue ?? undefined,
            icon: (pp.privilege.icon ?? undefined) as string | undefined,
            locked: pp.locked,
          })),
      };
    });

    return NextResponse.json({ current, plans }, { status: 200 });
  } catch (err) {
    console.error("vip route error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
