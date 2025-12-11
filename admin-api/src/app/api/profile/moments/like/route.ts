// admin-api/src/app/api/profile/moments/like/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * POST /api/profile/moments/like
 * Body: { userId: string, momentId: string }
 * Toggles like and returns { liked, likeCount }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { userId, momentId } = body as {
      userId?: string;
      momentId?: string;
    };

    if (!userId || !momentId) {
      return NextResponse.json(
        { error: "userId and momentId are required" },
        { status: 400 }
      );
    }

    const [user, moment] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      }),
      prisma.moment.findUnique({
        where: { id: momentId },
        select: { id: true, likeCount: true },
      }),
    ]);

    if (!user || !moment) {
      return NextResponse.json(
        { error: "User or moment not found" },
        { status: 404 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.momentLike.findFirst({
        where: { userId, momentId },
      });

      let liked: boolean;
      let likeCount: number;

      if (existing) {
        await tx.momentLike.deleteMany({
          where: { userId, momentId },
        });

        const updated = await tx.moment.update({
          where: { id: momentId },
          data: {
            likeCount: { decrement: 1 },
          },
          select: { likeCount: true },
        });

        liked = false;
        likeCount = Math.max(updated.likeCount, 0);
      } else {
        await tx.momentLike.create({
          data: { userId, momentId },
        });

        const updated = await tx.moment.update({
          where: { id: momentId },
          data: {
            likeCount: { increment: 1 },
          },
          select: { likeCount: true },
        });

        liked = true;
        likeCount = Math.max(updated.likeCount, 0);
      }

      return { liked, likeCount };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[POST /api/profile/moments/like]", error);
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 }
    );
  }
}
