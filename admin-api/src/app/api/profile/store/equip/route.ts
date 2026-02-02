import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUserSettings } from "@/lib/userSettings";

export const dynamic = "force-dynamic";

function slotForType(type: string) {
  switch (type) {
    case "AVATAR_FRAME":
      return "activeAvatarFrameItemId";
    case "PROFILE_CARD":
      return "activeProfileCardItemId";
    case "CHAT_BUBBLE":
      return "activeChatBubbleItemId";
    case "PARTY_THEME":
      return "activePartyThemeItemId";
    case "RIDE":
      return "activeRideItemId";
    case "PREMIUM_ID":
      return "activePremiumIdItemId";
    default:
      return null;
  }
}

function toAbsolute(origin: string, url?: string | null) {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${origin}${path}`;
}

function publicItem(origin: string, i: any) {
  return {
    id: i.id,
    type: i.type,
    title: i.title,
    mediaType: i.mediaType,
    mediaUrl: i.mediaUrl ?? null,
    thumbnailUrl: i.thumbnailUrl ?? null,
    mediaUrlFull: toAbsolute(origin, i.mediaUrl),
    thumbnailUrlFull: toAbsolute(origin, i.thumbnailUrl),
    durationDays: i.durationDays ?? null,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const userId = body?.userId as string | undefined;
    const itemId = body?.itemId as string | undefined;
    const origin = req.nextUrl.origin;

    if (!userId || !itemId) {
      return NextResponse.json(
        { error: "userId and itemId are required" },
        { status: 400 }
      );
    }

    const now = new Date();

    const item = await prisma.storeItem.findUnique({
      where: { id: itemId },
      select: {
        id: true,
        type: true,
        isActive: true,
        title: true,
        mediaType: true,
        mediaUrl: true,
        thumbnailUrl: true,
        durationDays: true,
      },
    });

    if (!item || !item.isActive) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const slot = slotForType(item.type);
    if (!slot) {
      return NextResponse.json(
        { error: `Item type ${item.type} cannot be equipped` },
        { status: 400 }
      );
    }

    const owned = await prisma.userStoreItem.findUnique({
      where: { userId_itemId: { userId, itemId } },
      select: { expiresAt: true },
    });

    if (!owned) {
      return NextResponse.json({ error: "You do not own this item" }, { status: 403 });
    }

    if (owned.expiresAt && owned.expiresAt <= now) {
      return NextResponse.json({ error: "Item is expired" }, { status: 403 });
    }

    await getOrCreateUserSettings(userId);

    const updated = await prisma.userSettings.update({
      where: { userId },
      data: { [slot]: itemId },
      select: {
        userId: true,
        activeAvatarFrameItemId: true,
        activeProfileCardItemId: true,
        activeChatBubbleItemId: true,
        activePartyThemeItemId: true,
        activeRideItemId: true,
        activePremiumIdItemId: true,
      },
    });

    return NextResponse.json(
      { ok: true, equipped: updated, item: publicItem(origin, item) },
      { status: 200 }
    );
  } catch (e) {
    console.error("[POST /api/profile/store/equip]", e);
    return NextResponse.json({ error: "Failed to equip item" }, { status: 500 });
  }
}
