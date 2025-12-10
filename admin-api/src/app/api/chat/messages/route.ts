// src/app/api/chat/messages/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUserSettings } from "@/lib/userSettings";

export const dynamic = "force-dynamic";

// GET /api/chat/messages?userId=...&peerId=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const peerId = searchParams.get("peerId");

    if (!userId || !peerId) {
      return NextResponse.json(
        { error: "userId and peerId are required" },
        { status: 400 }
      );
    }

    const thread = await prisma.chatThread.findFirst({
      where: {
        OR: [
          { userAId: userId, userBId: peerId },
          { userAId: peerId, userBId: userId },
        ],
      },
    });

    if (!thread) {
      return NextResponse.json({ messages: [] }, { status: 200 });
    }

    // mark incoming messages as read
    await prisma.chatMessage.updateMany({
      where: {
        threadId: thread.id,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    });

    const messages = await prisma.chatMessage.findMany({
      where: { threadId: thread.id },
      orderBy: { createdAt: "asc" },
      take: 100,
    });

    const data = messages.map((m) => ({
      id: m.id,
      senderId: m.senderId,
      content: m.content,
      createdAt: m.createdAt.toISOString(),
      isMine: m.senderId === userId,
    }));

    return NextResponse.json({ messages: data }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/chat/messages]", error);
    return NextResponse.json(
      { error: "Failed to load messages" },
      { status: 500 }
    );
  }
}

// POST /api/chat/messages
// Body: { senderId, receiverId, content }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    const senderId = body?.senderId as string | undefined;
    const receiverId = body?.receiverId as string | undefined;
    const contentRaw = body?.content as string | undefined;
    const content = contentRaw?.trim() ?? "";

    if (!senderId || !receiverId || !content) {
      return NextResponse.json(
        { error: "senderId, receiverId and non-empty content are required" },
        { status: 400 }
      );
    }

    if (senderId === receiverId) {
      return NextResponse.json(
        { error: "Cannot send message to yourself" },
        { status: 400 }
      );
    }

    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { id: true, username: true, nickname: true },
    });

    if (!sender) {
      return NextResponse.json(
        { error: "Sender not found" },
        { status: 404 }
      );
    }

    const now = new Date();
    const [userAId, userBId] =
      senderId < receiverId
        ? [senderId, receiverId]
        : [receiverId, senderId];

    const thread = await prisma.chatThread.upsert({
      where: {
        userAId_userBId: {
          userAId,
          userBId,
        },
      },
      update: {
        lastMessageText: content,
        lastMessageAt: now,
      },
      create: {
        userAId,
        userBId,
        lastMessageText: content,
        lastMessageAt: now,
      },
    });

    const message = await prisma.chatMessage.create({
      data: {
        threadId: thread.id,
        senderId,
        content,
      },
    });

    // create notification for receiver if they allow message notifications
    try {
      const settings = await getOrCreateUserSettings(receiverId);
      if (settings.notifyMessages) {
        const displayName =
          sender.nickname || sender.username || "Someone";

        await prisma.notification.create({
          data: {
            userId: receiverId,
            type: "MESSAGE",
            title: `New message from ${displayName}`,
            body:
              content.length > 120
                ? content.slice(0, 117) + "..."
                : content,
          },
        });
      }
    } catch (inner) {
      console.error(
        "[POST /api/chat/messages] notification creation failed",
        inner
      );
    }

    return NextResponse.json(
      {
        message: {
          id: message.id,
          threadId: thread.id,
          senderId: message.senderId,
          content: message.content,
          createdAt: message.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/chat/messages]", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
