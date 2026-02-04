// admin-api/src/app/api/profile/visit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/profile/visit?userId=xxx&viewerId=yyy
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const viewerId = searchParams.get("viewerId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        nickname: true,
        avatarUrl: true,
        bio: true,
        role: true,
        country: { select: { flagEmoji: true, code: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // counts
    const [followerCount, followingCount] = await Promise.all([
      prisma.follow.count({ where: { followingId: userId } }),
      prisma.follow.count({ where: { followerId: userId } }),
    ]);

    // isFollowing
    let isFollowing = false;
    if (viewerId && viewerId !== userId) {
      const existing = await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: viewerId, followingId: userId } },
        select: { id: true },
      });
      isFollowing = !!existing;
    }

    return NextResponse.json({
      user: {
        id: user.id,
        userName: user.nickname && user.nickname.trim().length > 0 ? user.nickname : user.username,
        avatarUrl: user.avatarUrl ?? null,
        countryFlag: user.country?.flagEmoji ?? null,
        countryCode: user.country?.code ?? null,
        followerCount,
        followingCount,
        bio: user.bio ?? null,
        isFollowing,
      },
    });
  } catch (error) {
    console.error("[GET /api/profile/visit]", error);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}
