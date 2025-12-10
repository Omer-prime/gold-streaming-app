// admin-api/src/app/api/profile/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function computeProfileCompletion(user: {
  nickname: string | null;
  dateOfBirth: Date | null;
  gender: string | null;
  countryId: number | null;
  avatarUrl: string | null;
  bio: string | null;
}) {
  // you can tune which fields count towards completion
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

/**
 * GET /api/profile/me?userId=xxx
 * Returns profile + wallet + stats for the current user
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId query param is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        country: true,
        wallet: true,
      },
    });

    // ⚠️ Do NOT 404 – return an empty profile shape instead so mobile
    // doesn't show "failed to load".
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
      });
    }

    const [
      friendsCount,
      followingCount,
      followersCount,
      visitorsCount,
      points,
    ] = await Promise.all([
      prisma.friendship.count({
        where: {
          OR: [{ userAId: userId }, { userBId: userId }],
        },
      }),
      prisma.follow.count({ where: { followerId: userId } }),
      prisma.follow.count({ where: { followingId: userId } }),
      prisma.profileVisit.count({ where: { visitedId: userId } }),
      prisma.userPointLedger.aggregate({
        where: { userId },
        _sum: { delta: true },
      }),
    ]);

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
      wallet: {
        balance: user.wallet?.balance ?? 0,
      },
      stats: {
        friends: friendsCount,
        following: followingCount,
        followers: followersCount,
        visitors: visitorsCount,
        points: points._sum.delta ?? 0,
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
 * Body: { userId, nickname?, avatarUrl?, bio?, dateOfBirth?, interestTags?, profilePhotos? }
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      nickname,
      avatarUrl,
      bio,
      dateOfBirth,
      interestTags,
      profilePhotos,
    } = body ?? {};

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const data: Record<string, unknown> = {};

    if (typeof nickname === "string") {
      data.nickname = nickname.trim() || null;
    }
    if (typeof avatarUrl === "string") {
      data.avatarUrl = avatarUrl;
    }
    if (typeof bio === "string") {
      data.bio = bio;
    }
    if (dateOfBirth) {
      const parsed = new Date(dateOfBirth);
      if (!isNaN(parsed.getTime())) {
        data.dateOfBirth = parsed;
      }
    }
    if (Array.isArray(interestTags)) {
      data.interestTags = interestTags.map((t: any) => String(t));
    }
    if (Array.isArray(profilePhotos)) {
      data.profilePhotos = profilePhotos.map((p: any) => String(p));
    }

    if (!Object.keys(data).length) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
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
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error("[PUT /api/profile/me]", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
