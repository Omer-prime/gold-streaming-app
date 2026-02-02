// admin-api/src/app/api/profile/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUserSettings } from "@/lib/userSettings";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function computeProfileCompletion(user: {
  nickname: string | null;
  dateOfBirth: Date | null;
  gender: string | null;
  countryId: number | null;
  avatarUrl: string | null;
  bio: string | null;
}) {
  const pieces = [
    Boolean(user.nickname && user.nickname.trim()),
    Boolean(user.dateOfBirth),
    Boolean(user.gender),
    Boolean(user.countryId),
    Boolean(user.avatarUrl),
    Boolean(user.bio && user.bio.trim()),
  ];
  const completed = pieces.filter(Boolean).length;
  const total = pieces.length;
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

function toAbsolute(origin: string, url?: string | null) {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${origin}${path}`;
}

function makeEquippedIds(settings: any) {
  return {
    AVATAR_FRAME: settings?.activeAvatarFrameItemId ?? null,
    PROFILE_CARD: settings?.activeProfileCardItemId ?? null,
    CHAT_BUBBLE: settings?.activeChatBubbleItemId ?? null,
    PARTY_THEME: settings?.activePartyThemeItemId ?? null,
    RIDE: settings?.activeRideItemId ?? null,
    PREMIUM_ID: settings?.activePremiumIdItemId ?? null,
  };
}

/**
 * GET /api/profile/me?userId=xxx
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const origin = req.nextUrl.origin;

    if (!userId) {
      return NextResponse.json(
        { error: "userId query param is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { country: true, wallet: true },
    });

    if (!user) {
      return NextResponse.json({
        user: null,
        wallet: { balance: 0 },
        stats: {
          friends: 0,
          following: 0,
          followers: 0,
          visitors: 0,
          points: 0,
        },
        settings: null,
        outfit: { equippedIds: makeEquippedIds(null), equippedItems: {} },
      });
    }

    const [
      settings,
      friendsCount,
      followingCount,
      followersCount,
      visitorsCount,
      points,
    ] = await Promise.all([
      getOrCreateUserSettings(userId),
      prisma.friendship.count({
        where: { OR: [{ userAId: userId }, { userBId: userId }] },
      }),
      prisma.follow.count({ where: { followerId: userId } }),
      prisma.follow.count({ where: { followingId: userId } }),
      prisma.profileVisit.count({ where: { visitedId: userId } }),
      prisma.userPointLedger.aggregate({
        where: { userId },
        _sum: { delta: true },
      }),
    ]);

    const equippedIds = makeEquippedIds(settings);

    const equippedItemIds = Object.values(equippedIds)
      .filter(Boolean)
      .map((x) => String(x));

    const equippedItemsDb =
      equippedItemIds.length === 0
        ? []
        : await prisma.storeItem.findMany({
            where: {
              id: { in: equippedItemIds },
              isActive: true,
            },
            select: {
              id: true,
              type: true,
              title: true,
              mediaType: true,
              mediaUrl: true,
              thumbnailUrl: true,
              durationDays: true,
            },
          });

    const byId = new Map<string, any>();
    for (const it of equippedItemsDb) {
      byId.set(it.id, {
        ...it,
        mediaUrlFull: toAbsolute(origin, it.mediaUrl),
        thumbnailUrlFull: toAbsolute(origin, it.thumbnailUrl),
      });
    }

    // return by TYPE for easy client usage: equippedItems["AVATAR_FRAME"] = item
    const equippedItems: Record<string, any> = {};
    for (const [type, itemId] of Object.entries(equippedIds)) {
      if (!itemId) continue;
      const it = byId.get(String(itemId));
      if (it) equippedItems[type] = it;
    }

    const profileCompletion = computeProfileCompletion({
      nickname: user.nickname ?? null,
      dateOfBirth: user.dateOfBirth ?? null,
      gender: user.gender ?? null,
      countryId: user.countryId ?? null,
      avatarUrl: user.avatarUrl ?? null,
      bio: user.bio ?? null,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        role: user.role,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        interestTags: user.interestTags,
        profilePhotos: user.profilePhotos,
        country: user.country
          ? {
              code: user.country.code,
              name: user.country.name,
              flagEmoji: user.country.flagEmoji,
            }
          : null,
        level: user.level,
        liveLevel: user.liveLevel,
        vipLevel: user.vipLevel,
        profileCompletion,
      },
      wallet: { balance: user.wallet?.balance ?? 0 },
      stats: {
        friends: friendsCount,
        following: followingCount,
        followers: followersCount,
        visitors: visitorsCount,
        points: points._sum.delta ?? 0,
      },
      settings: {
        notifyMessages: Boolean((settings as any).notifyMessages),
      },
      outfit: {
        equippedIds,
        equippedItems,
      },
    });
  } catch (error) {
    console.error("[GET /api/profile/me]", error);
    return NextResponse.json(
      { error: "Failed to load profile" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/profile/me
 * Body: { userId, nickname?, avatarUrl?, bio?, dateOfBirth?, interestTags?, profilePhotos?, notifyMessages? }
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const {
      userId,
      nickname,
      avatarUrl,
      bio,
      dateOfBirth,
      interestTags,
      profilePhotos,
      notifyMessages,
    } = body ?? {};

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const userData: Record<string, unknown> = {};

    if (typeof nickname === "string") {
      const v = nickname.trim();
      userData.nickname = v ? v : null;
    }
    if (typeof avatarUrl === "string") {
      const v = avatarUrl.trim();
      userData.avatarUrl = v ? v : null;
    }
    if (typeof bio === "string") {
      const v = bio.trim();
      userData.bio = v ? v : null;
    }

    if (dateOfBirth === null) {
      userData.dateOfBirth = null;
    } else if (dateOfBirth) {
      const parsed = new Date(dateOfBirth);
      if (!isNaN(parsed.getTime())) userData.dateOfBirth = parsed;
    }

    if (Array.isArray(interestTags)) {
      userData.interestTags = interestTags
        .map((t: any) => String(t).trim())
        .filter(Boolean);
    }

    if (Array.isArray(profilePhotos)) {
      userData.profilePhotos = profilePhotos
        .map((p: any) => String(p).trim())
        .filter(Boolean);
    }

    const hasUserUpdate = Object.keys(userData).length > 0;
    const hasSettingsUpdate = typeof notifyMessages === "boolean";

    if (!hasUserUpdate && !hasSettingsUpdate) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const [updatedUser, updatedSettings] = await Promise.all([
      hasUserUpdate
        ? prisma.user.update({
            where: { id: userId },
            data: userData,
            select: {
              id: true,
              username: true,
              nickname: true,
              avatarUrl: true,
              bio: true,
              dateOfBirth: true,
              gender: true,
              interestTags: true,
              profilePhotos: true,
              level: true,
              liveLevel: true,
              vipLevel: true,
            },
          })
        : prisma.user.findUnique({
            where: { id: userId },
            select: {
              id: true,
              username: true,
              nickname: true,
              avatarUrl: true,
              bio: true,
              dateOfBirth: true,
              gender: true,
              interestTags: true,
              profilePhotos: true,
              level: true,
              liveLevel: true,
              vipLevel: true,
            },
          }),
      hasSettingsUpdate
        ? prisma.userSettings.upsert({
            where: { userId },
            update: { notifyMessages },
            create: { userId, notifyMessages },
          })
        : getOrCreateUserSettings(userId),
    ]);

    return NextResponse.json({
      user: updatedUser,
      settings: { notifyMessages: Boolean((updatedSettings as any).notifyMessages) },
    });
  } catch (error) {
    console.error("[PUT /api/profile/me]", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
