import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function actorName(u: { nickname: string | null; username: string }) {
  return u.nickname && u.nickname.trim().length > 0 ? u.nickname : u.username;
}

/**
 * POST /api/profile/moments/like
 * Body: { userId: string, momentId: string }
 * Toggles like and returns { liked, likeCount }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { userId, momentId } = body as { userId?: string; momentId?: string };
    if (!userId || !momentId) {
      return NextResponse.json(
        { error: "userId and momentId are required" },
        { status: 400 }
      );
    }

    const [user, moment] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, username: true, nickname: true },
      }),
      prisma.moment.findUnique({
        where: { id: momentId },
        select: { id: true, userId: true, likeCount: true },
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
        select: { id: true },
      });

      if (existing) {
        await tx.momentLike.deleteMany({ where: { userId, momentId } });

        const updated = await tx.moment.update({
          where: { id: momentId },
          data: { likeCount: { decrement: 1 } },
          select: { likeCount: true },
        });

        return { liked: false, likeCount: Math.max(updated.likeCount, 0) };
      }

      await tx.momentLike.create({ data: { userId, momentId } });

      const updated = await tx.moment.update({
        where: { id: momentId },
        data: { likeCount: { increment: 1 } },
        select: { likeCount: true },
      });

      // ✅ create notification (only when LIKE happens)
      if (moment.userId !== userId) {
        await tx.notification.create({
          data: {
            userId: moment.userId, // receiver (owner)
            type: "moment_like",
            title: "New like",
            body: `${actorName(user)} liked your post.`,
            // ✅ reuse this field as "ref id" (momentId) so app can open it
            adminNotificationId: momentId,
          } as any,
        });
      }

      return { liked: true, likeCount: Math.max(updated.likeCount, 0) };
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
