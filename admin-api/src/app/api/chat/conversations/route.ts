// src/app/api/chat/conversations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/chat/conversations?userId=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const threads = await prisma.chatThread.findMany({
      where: { OR: [{ userAId: userId }, { userBId: userId }] },
      orderBy: { updatedAt: "desc" },
      include: {
        userA: { select: { id: true, username: true, nickname: true, avatarUrl: true } },
        userB: { select: { id: true, username: true, nickname: true, avatarUrl: true } },
        messages: {
          where: { isRead: false, senderId: { not: userId } },
          select: { id: true },
        },
      },
    });

    const data = threads.map((t) => {
      const isUserA = t.userAId === userId;
      const other = isUserA ? t.userB : t.userA;

      return {
        threadId: t.id,
        otherUserId: other.id,
        otherUsername: other.username,
        otherNickname: other.nickname,
        otherAvatarUrl: other.avatarUrl,
        lastMessageText: t.lastMessageText,
        lastMessageAt: t.lastMessageAt ? t.lastMessageAt.toISOString() : null,
        unreadCount: t.messages.length,

     
        status: t.status,
        requestedById: t.requestedById ?? null,
      };
    });

    return NextResponse.json({ threads: data }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/chat/conversations]", error);
    return NextResponse.json({ error: "Failed to load conversations" }, { status: 500 });
  }
}
