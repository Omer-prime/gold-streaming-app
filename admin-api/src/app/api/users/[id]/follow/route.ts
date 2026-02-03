import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, ctx: { params: { id: string } }) {
  try {
    const targetId = ctx.params.id;
    const body = await req.json().catch(() => null);

    const userId = String(body?.userId ?? "").trim(); // current logged in user id
    const action = String(body?.action ?? "toggle"); // "toggle" | "follow" | "unfollow"

    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
    if (!targetId) return NextResponse.json({ error: "targetId required" }, { status: 400 });
    if (userId === targetId) return NextResponse.json({ error: "cannot follow self" }, { status: 400 });

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.follow.findUnique({
        where: { followerId_followingId: { followerId: userId, followingId: targetId } },
        select: { id: true },
      });

      const shouldFollow =
        action === "follow" ? true : action === "unfollow" ? false : !existing;

      if (shouldFollow && !existing) {
        await tx.follow.create({ data: { followerId: userId, followingId: targetId } });
      }

      if (!shouldFollow && existing) {
        await tx.follow.delete({
          where: { followerId_followingId: { followerId: userId, followingId: targetId } },
        });
      }

      // recompute counts safely
      const [followingCount, followersCount] = await Promise.all([
        tx.follow.count({ where: { followerId: userId } }),
        tx.follow.count({ where: { followingId: targetId } }),
      ]);

      await Promise.all([
        tx.user.update({ where: { id: userId }, data: { followingCount } }),
        tx.user.update({ where: { id: targetId }, data: { followersCount } }),
      ]);

      return { isFollowing: shouldFollow, followingCount, followersCount };
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    console.error("[POST /api/users/:id/follow]", e);
    return NextResponse.json({ error: "Failed to follow" }, { status: 500 });
  }
}
