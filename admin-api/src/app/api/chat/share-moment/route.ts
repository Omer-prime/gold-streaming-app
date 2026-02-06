// admin-api/src/app/api/chat/share-moment/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function canonPair(a: string, b: string) {
  return a < b ? [a, b] as const : [b, a] as const;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const userId = String(body?.userId ?? "").trim();
    const targetId = String(body?.targetId ?? "").trim();
    const momentId = String(body?.momentId ?? "").trim();
    const note = typeof body?.note === "string" ? body.note.trim() : "";

    if (!userId || !targetId || !momentId) {
      return NextResponse.json({ error: "Missing userId/targetId/momentId" }, { status: 400 });
    }
    if (userId === targetId) {
      return NextResponse.json({ error: "Cannot share to yourself" }, { status: 400 });
    }

    // ✅ must be connected (followers/following) to share
    const connected = await prisma.follow.findFirst({
      where: {
        OR: [
          { followerId: userId, followingId: targetId },
          { followerId: targetId, followingId: userId },
        ],
      },
      select: { id: true },
    });

    if (!connected) {
      return NextResponse.json({ error: "You can only share to followers/following." }, { status: 403 });
    }

    const moment = await prisma.moment.findUnique({
      where: { id: momentId },
      select: {
        id: true,
        type: true,
        text: true,
        imageUrl: true,
        videoUrl: true,
        thumbnailUrl: true,
        createdAt: true,
        user: { select: { id: true, username: true, nickname: true, avatarUrl: true } },
      },
    });

    if (!moment) return NextResponse.json({ error: "Moment not found" }, { status: 404 });

    const [userAId, userBId] = canonPair(userId, targetId);

    let thread = await prisma.chatThread.findUnique({
      where: { userAId_userBId: { userAId, userBId } },
    });

    // If blocked, stop
    if (thread?.status === "BLOCKED") {
      return NextResponse.json({ error: "Chat is blocked" }, { status: 403 });
    }

    // Create thread if first time => REQUESTED
    if (!thread) {
      thread = await prisma.chatThread.create({
        data: {
          userAId,
          userBId,
          status: "REQUESTED",
          requestedById: userId,
        },
      });
    } else {
      // ✅ If I’m replying to an incoming request, auto-accept
      if (thread.status === "REQUESTED" && thread.requestedById && thread.requestedById !== userId) {
        thread = await prisma.chatThread.update({
          where: { id: thread.id },
          data: { status: "ACCEPTED", requestedById: null },
        });
      }
    }

    const authorName =
      moment.user.nickname && moment.user.nickname.trim().length > 0 ? moment.user.nickname : moment.user.username;

    const fallbackText =
      moment.type === "VIDEO" ? "Shared a video" : "Shared a post";

    const lastText = note.length > 0 ? note : fallbackText;

    const metaJson = {
      kind: "moment",
      momentId: moment.id,
      momentType: moment.type,
      text: moment.text ?? null,
      imageUrl: moment.imageUrl ?? null,
      videoUrl: moment.videoUrl ?? null,
      thumbnailUrl: moment.thumbnailUrl ?? null,
      author: {
        id: moment.user.id,
        name: authorName,
        avatarUrl: moment.user.avatarUrl ?? null,
      },
      createdAt: moment.createdAt.toISOString(),
    };

    const msg = await prisma.chatMessage.create({
      data: {
        threadId: thread.id,
        senderId: userId,
        content: lastText,
        type: "MOMENT_SHARE",
        momentId: moment.id,
        metaJson,
      },
      select: { id: true, createdAt: true },
    });

    await prisma.chatThread.update({
      where: { id: thread.id },
      data: {
        lastMessageText: lastText,
        lastMessageAt: msg.createdAt,
      },
    });

    // increment share count
    await prisma.moment.update({
      where: { id: moment.id },
      data: { shareCount: { increment: 1 } },
    });

    return NextResponse.json({
      ok: true,
      threadId: thread.id,
      threadStatus: thread.status,
      messageId: msg.id,
    });
  } catch (e) {
    console.error("[POST /api/chat/share-moment]", e);
    return NextResponse.json({ error: "Failed to share moment" }, { status: 500 });
  }
}
