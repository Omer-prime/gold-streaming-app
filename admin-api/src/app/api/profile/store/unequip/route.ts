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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const userId = body?.userId as string | undefined;
    const type = body?.type as string | undefined;

    if (!userId || !type) {
      return NextResponse.json(
        { error: "userId and type are required" },
        { status: 400 }
      );
    }

    const slot = slotForType(type);
    if (!slot) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    await getOrCreateUserSettings(userId);

    const updated = await prisma.userSettings.update({
      where: { userId },
      data: { [slot]: null },
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

    return NextResponse.json({ ok: true, equipped: updated }, { status: 200 });
  } catch (e) {
    console.error("[POST /api/profile/store/unequip]", e);
    return NextResponse.json(
      { error: "Failed to unequip item" },
      { status: 500 }
    );
  }
}
