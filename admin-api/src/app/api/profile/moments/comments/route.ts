// admin-api/src/app/api/moments/comments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/* -------------------------------------------------------------------------- */
/*  GET /api/moments/comments?momentId=...&limit=50                           */
/* -------------------------------------------------------------------------- */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const momentId = searchParams.get("momentId");
    const limitParam = searchParams.get("limit") ?? "50";

    if (!momentId) {
      return NextResponse.json(
        { error: "momentId is required" },
        { status: 400 }
      );
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
        // normalize to "text" for the mobile app
        text: c.content,
        createdAt: c.createdAt.toISOString(),
        user: {
          id: c.user.id,
          userName:
            c.user.nickname && c.user.nickname.trim().length > 0
              ? c.user.nickname
              : c.user.username,
          avatarUrl: c.user.avatarUrl,
        },
      })),
    });
  } catch (error) {
    console.error("[GET /api/moments/comments]", error);
    return NextResponse.json(
      { error: "Failed to load comments" },
      { status: 500 }
    );
  }
}

/* -------------------------------------------------------------------------- */
/*  POST /api/moments/comments                                                */
/*  Body: { momentId: string; userId: string; content?: string; text?: string }*/
/*  (accepts both "content" and "text" for safety)                             */
/* -------------------------------------------------------------------------- */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
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

    // accept either "content" or "text" from the client
    const raw =
      typeof content === "string"
        ? content
        : typeof text === "string"
        ? text
        : "";
    const trimmed = raw.trim();

    if (!trimmed) {
      return NextResponse.json(
        { error: "content is required" },
        { status: 400 }
      );
    }

    if (trimmed.length > 300) {
      return NextResponse.json(
        { error: "Comment too long (max 300 chars)" },
        { status: 400 }
      );
    }

    const [comment, updatedMoment] = await prisma.$transaction([
      prisma.momentComment.create({
        data: {
          momentId,
          userId,
          content: trimmed,
        },
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
      }),
      prisma.moment.update({
        where: { id: momentId },
        data: {
          commentCount: {
            increment: 1,
          },
        },
      }),
    ]);

    return NextResponse.json({
      comment: {
        id: comment.id,
        text: comment.content,
        createdAt: comment.createdAt.toISOString(),
        user: {
          id: comment.user.id,
          userName:
            comment.user.nickname &&
            comment.user.nickname.trim().length > 0
              ? comment.user.nickname
              : comment.user.username,
          avatarUrl: comment.user.avatarUrl,
        },
      },
      commentCount: updatedMoment.commentCount,
    });
  } catch (error) {
    console.error("[POST /api/moments/comments]", error);
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
}
