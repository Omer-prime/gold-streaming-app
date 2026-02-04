import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function firstParam(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export async function POST(
  req: NextRequest,
  ctx: { params: Record<string, string | string[] | undefined> }
) {
  try {
    const params = ctx?.params ?? {};
    const body = await req.json().catch(() => ({} as any));

    // ✅ targetId can come from URL param, body, or query — no more “targetId required”
    const rawParam =
      firstParam(params["id"]) ??
      firstParam(params["userId"]) ??
      firstParam(params["uid"]);

    const rawBody =
      body?.targetId ??
      body?.targetUserId ??
      body?.followTargetId ??
      body?.id;

    const rawQuery =
      req.nextUrl.searchParams.get("targetId") ??
      req.nextUrl.searchParams.get("userId");

    const targetId = String(rawParam ?? rawBody ?? rawQuery ?? "").trim();

    const userId = String(
      body?.userId ?? body?.viewerId ?? body?.followerId ?? ""
    ).trim();

    const action = String(body?.action ?? "toggle").trim(); // toggle | follow | unfollow

    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
    if (!targetId) return NextResponse.json({ error: "targetId required" }, { status: 400 });
    if (userId === targetId)
      return NextResponse.json({ error: "cannot follow self" }, { status: 400 });

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

    return NextResponse.json({ ok: true, userId, targetId, ...result });
  } catch (e) {
    console.error("[POST /api/users/:id/follow]", e);
    return NextResponse.json({ error: "Failed to follow" }, { status: 500 });
  }
}
