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
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        nickname: true,
        avatarUrl: true,
        bio: true,
        country: {
          select: {
            flagEmoji: true,
            code: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Follower/following counts + isFollowing
    let followerCount = 0;
    let followingCount = 0;
    let isFollowing = false;

    try {
      const anyPrisma = prisma as any;

      if (anyPrisma.userFollow?.count) {
        followerCount = await anyPrisma.userFollow.count({
          where: { followingId: userId },
        });
        followingCount = await anyPrisma.userFollow.count({
          where: { followerId: userId },
        });

        if (viewerId && viewerId !== userId && anyPrisma.userFollow?.findFirst) {
          const existing = await anyPrisma.userFollow.findFirst({
            where: {
              followerId: viewerId,
              followingId: userId,
            },
          });
          isFollowing = !!existing;
        }
      }
    } catch {
      // ignore errors, keep defaults
    }

    const bio = (user as any).bio ?? null;

    return NextResponse.json({
      user: {
        id: user.id,
        userName:
          user.nickname && user.nickname.trim().length > 0
            ? user.nickname
            : user.username,
        avatarUrl: user.avatarUrl,
        countryFlag: user.country?.flagEmoji ?? null,
        countryCode: user.country?.code ?? null,
        followerCount,
        followingCount,
        bio,
        isFollowing,
      },
    });
  } catch (error) {
    console.error("[GET /api/profile/visit]", error);
    return NextResponse.json(
      { error: "Failed to load profile" },
      { status: 500 }
    );
  }
}
