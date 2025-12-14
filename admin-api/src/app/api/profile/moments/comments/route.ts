import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function actorName(u: { nickname: string | null; username: string }) {
  return u.nickname && u.nickname.trim().length > 0 ? u.nickname : u.username;
}

/* -------------------------------------------------------------------------- */
/*  GET /api/moments/comments?momentId=...&limit=50                           */
/* -------------------------------------------------------------------------- */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const momentId = searchParams.get("momentId");
    const limitParam = searchParams.get("limit") ?? "50";

    if (!momentId) {
      return NextResponse.json({ error: "momentId is required" }, { status: 400 });
    }

    let limit = parseInt(limitParam, 10);
    if (Number.isNaN(limit) || limit <= 0) limit = 50;
    if (limit > 100) limit = 100;

    const comments = await prisma.momentComment.findMany({
      where: { momentId },
      orderBy: { createdAt: "asc" },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            nickname: true,
            avatarUrl: true,
          },
        },
      },
    });

    return NextResponse.json({
      comments: comments.map((c) => ({
        id: c.id,
        text: c.content,
        createdAt: c.createdAt.toISOString(),
        user: {
          id: c.user.id,
          userName: actorName({ username: c.user.username, nickname: c.user.nickname }),
          avatarUrl: c.user.avatarUrl,
        },
      })),
    });
  } catch (error) {
    console.error("[GET /api/moments/comments]", error);
    return NextResponse.json({ error: "Failed to load comments" }, { status: 500 });
  }
}

/* -------------------------------------------------------------------------- */
/*  POST /api/moments/comments                                                */
/* -------------------------------------------------------------------------- */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { momentId, userId, content, text } = body as {
      momentId?: string;
      userId?: string;
      content?: string;
      text?: string;
    };

    if (!momentId || !userId) {
      return NextResponse.json(
        { error: "momentId and userId are required" },
        { status: 400 }
      );
    }

    const raw =
      typeof content === "string" ? content : typeof text === "string" ? text : "";
    const trimmed = raw.trim();

    if (!trimmed) {
      return NextResponse.json({ error: "content is required" }, { status: 400 });
    }
    if (trimmed.length > 300) {
      return NextResponse.json(
        { error: "Comment too long (max 300 chars)" },
        { status: 400 }
      );
    }

    const [actor, moment] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, username: true, nickname: true },
      }),
      prisma.moment.findUnique({
        where: { id: momentId },
        select: { id: true, userId: true },
      }),
    ]);

    if (!actor || !moment) {
      return NextResponse.json(
        { error: "User or moment not found" },
        { status: 404 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const comment = await tx.momentComment.create({
        data: { momentId, userId, content: trimmed },
        include: {
          user: { select: { id: true, username: true, nickname: true, avatarUrl: true } },
        },
      });

      const updatedMoment = await tx.moment.update({
        where: { id: momentId },
        data: { commentCount: { increment: 1 } },
        select: { commentCount: true },
      });

      // ✅ notify owner (not self)
      if (moment.userId !== userId) {
        await tx.notification.create({
          data: {
            userId: moment.userId,
            type: "moment_comment",
            title: "New comment",
            body: `${actorName(actor)} commented: ${trimmed.slice(0, 80)}${trimmed.length > 80 ? "..." : ""}`,
            adminNotificationId: momentId,
          } as any,
        });
      }

      return { comment, updatedMoment };
    });

    return NextResponse.json({
      comment: {
        id: result.comment.id,
        text: result.comment.content,
        createdAt: result.comment.createdAt.toISOString(),
        user: {
          id: result.comment.user.id,
          userName: actorName({
            username: result.comment.user.username,
            nickname: result.comment.user.nickname,
          }),
          avatarUrl: result.comment.user.avatarUrl,
        },
      },
      commentCount: result.updatedMoment.commentCount,
    });
  } catch (error) {
    console.error("[POST /api/moments/comments]", error);
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
  }
}
