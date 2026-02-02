import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUserSettings } from "@/lib/userSettings";

export const dynamic = "force-dynamic";

function pickItem(i: any) {
  return {
    id: i.id,
    type: i.type,
    title: i.title,
    description: i.description ?? null,
    priceCoins: i.priceCoins,
    mediaType: i.mediaType,
    mediaUrl: i.mediaUrl ?? null,
    thumbnailUrl: i.thumbnailUrl ?? null,
    durationDays: i.durationDays ?? null,
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const now = new Date();

    const settings = await getOrCreateUserSettings(userId);

    const owned = await prisma.userStoreItem.findMany({
      where: {
        userId,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      orderBy: { lastPurchasedAt: "desc" },
      include: {
        item: {
          select: {
            id: true,
            type: true,
            title: true,
            description: true,
            priceCoins: true,
            mediaType: true,
            mediaUrl: true,
            thumbnailUrl: true,
            durationDays: true,
          },
        },
      },
    });

    const equippedIds = {
      AVATAR_FRAME: settings.activeAvatarFrameItemId ?? null,
      PROFILE_CARD: settings.activeProfileCardItemId ?? null,
      CHAT_BUBBLE: settings.activeChatBubbleItemId ?? null,
      PARTY_THEME: settings.activePartyThemeItemId ?? null,
      RIDE: settings.activeRideItemId ?? null,
      PREMIUM_ID: settings.activePremiumIdItemId ?? null,
    };

    const items = owned.map((row) => {
      const item = pickItem(row.item);
      const equippedForType = (equippedIds as any)[item.type] ?? null;

      return {
        ...item,
        obtainedAt: row.obtainedAt.toISOString(),
        expiresAt: row.expiresAt ? row.expiresAt.toISOString() : null,
        isEquipped: equippedForType === item.id,
      };
    });

    // group for UI
    const groups: Record<string, any[]> = {};
    for (const it of items) {
      groups[it.type] = groups[it.type] || [];
      groups[it.type].push(it);
    }

    return NextResponse.json(
      { userId, equippedIds, items, groups },
      { status: 200 }
    );
  } catch (e) {
    console.error("[GET /api/profile/store/owned]", e);
    return NextResponse.json(
      { error: "Failed to load owned items" },
      { status: 500 }
    );
  }
}
