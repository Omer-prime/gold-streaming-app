// src/app/api/profile/vip/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
      select: {
        id: true,
        vipTier: true,
        vipExpiresAt: true,
        level: true,
        liveLevel: true,
      },
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

    // Static VIP plans (you can adjust coins, text, privileges easily)
    const plans = [
      {
        tier: "NORMAL" as VipTierKey,
        name: "Normal VIP",
        monthlyPriceCoins: 95000,
        description: "Get VIP & enjoy privileges.",
        privileges: [
          { key: "daily_coins", label: "Collect Coins", value: "+3,500/d" },
          { key: "live_tag", label: "Live Float Tag", value: "+1/d" },
          { key: "platform_speaker", label: "Platform Speaker", value: "+1/d" },
          { key: "entry_vehicle", label: "Entry Vehicle", value: "Unlock" },
          { key: "vip_badge", label: "VIP Badge", value: "Unlock" },
        ],
      },
      {
        tier: "SUPER" as VipTierKey,
        name: "Super VIP",
        monthlyPriceCoins: 295000,
        description: "Extra privileges for active hosts.",
        privileges: [
          { key: "daily_coins", label: "Collect Coins", value: "+7,000/d" },
          { key: "live_tag", label: "Live Float Tag", value: "+2/d" },
          { key: "platform_speaker", label: "Platform Speaker", value: "+2/d" },
          { key: "entry_vehicle", label: "Entry Vehicle", value: "Premium" },
          { key: "vip_badge", label: "VIP Badge", value: "Super VIP" },
        ],
      },
      {
        tier: "DIAMOND" as VipTierKey,
        name: "Diamond VIP",
        monthlyPriceCoins: 595000,
        description: "High level VIP for core users.",
        privileges: [
          { key: "daily_coins", label: "Collect Coins", value: "+12,000/d" },
          { key: "live_tag", label: "Live Float Tag", value: "+3/d" },
          { key: "platform_speaker", label: "Platform Speaker", value: "+3/d" },
          { key: "entry_vehicle", label: "Entry Vehicle", value: "Diamond" },
          { key: "vip_badge", label: "VIP Badge", value: "Diamond" },
        ],
      },
      {
        tier: "SVIP" as VipTierKey,
        name: "SVIP",
        monthlyPriceCoins: 995000,
        description: "Top level VIP with max privileges.",
        privileges: [
          { key: "daily_coins", label: "Collect Coins", value: "+20,000/d" },
          { key: "live_tag", label: "Live Float Tag", value: "Multiple" },
          { key: "platform_speaker", label: "Platform Speaker", value: "Priority" },
          { key: "entry_vehicle", label: "Entry Vehicle", value: "SVIP Exclusive" },
          { key: "vip_badge", label: "VIP Badge", value: "SVIP" },
        ],
      },
    ];

    return NextResponse.json(
      {
        current,
        plans,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("vip route error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
