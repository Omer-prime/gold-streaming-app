// src/app/api/chat/messages/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUserSettings } from "@/lib/userSettings";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function clampTake(raw: string | null) {
  const n = Number(raw ?? "100");
  if (!Number.isFinite(n)) return 100;
  return Math.max(1, Math.min(200, Math.floor(n)));
}

// GET /api/chat/messages?userId=...&peerId=...&take=100
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const peerId = searchParams.get("peerId");
    const take = clampTake(searchParams.get("take"));

    if (!userId || !peerId) {
      return NextResponse.json({ error: "userId and peerId are required" }, { status: 400 });
    }
    if (userId === peerId) {
      return NextResponse.json({ thread: null, messages: [] }, { status: 200 });
    }

    const [userAId, userBId] = userId < peerId ? [userId, peerId] : [peerId, userId];

    const thread = await prisma.chatThread.findUnique({
      where: { userAId_userBId: { userAId, userBId } },
    });

    if (!thread) {
      return NextResponse.json({ thread: null, messages: [] }, { status: 200 });
    }

    // mark incoming messages as read
    await prisma.chatMessage.updateMany({
      where: { threadId: thread.id, senderId: { not: userId }, isRead: false },
      data: { isRead: true },
    });

    const messages = await prisma.chatMessage.findMany({
      where: { threadId: thread.id },
      orderBy: { createdAt: "asc" },
      take,
    });

    const data = messages.map((m) => ({
      id: m.id,
      senderId: m.senderId,
      content: m.content,
      createdAt: m.createdAt.toISOString(),
      isMine: m.senderId === userId,
    }));

    return NextResponse.json(
      {
        thread: { id: thread.id, status: thread.status, requestedById: thread.requestedById ?? null },
        messages: data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[GET /api/chat/messages]", error);
    return NextResponse.json({ error: "Failed to load messages" }, { status: 500 });
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
      return NextResponse.json({ error: "Cannot send message to yourself" }, { status: 400 });
    }
    if (content.length > 2000) {
      return NextResponse.json({ error: "Message is too long" }, { status: 400 });
    }

    // ✅ full-block check (either direction)
    const blocked = await prisma.userBlock.findFirst({
      where: {
        OR: [
          { userId: senderId, blockedId: receiverId },
          { userId: receiverId, blockedId: senderId },
        ],
      },
      select: { id: true },
    });
    if (blocked) {
      return NextResponse.json({ error: "You cannot message this user." }, { status: 403 });
    }

    const [sender, receiver] = await Promise.all([
      prisma.user.findUnique({ where: { id: senderId }, select: { id: true, username: true, nickname: true } }),
      prisma.user.findUnique({ where: { id: receiverId }, select: { id: true } }),
    ]);

    if (!sender) return NextResponse.json({ error: "Sender not found" }, { status: 404 });
    if (!receiver) return NextResponse.json({ error: "Receiver not found" }, { status: 404 });

    const now = new Date();
    const [userAId, userBId] =
      senderId < receiverId ? [senderId, receiverId] : [receiverId, senderId];

    let thread = await prisma.chatThread.findUnique({
      where: { userAId_userBId: { userAId, userBId } },
    });

    if (!thread) {
      // ✅ first message => REQUESTED
      thread = await prisma.chatThread.create({
        data: {
          userAId,
          userBId,
          status: "REQUESTED",
          requestedById: senderId,
          lastMessageText: content,
          lastMessageAt: now,
        },
      });
    } else {
      if (thread.status === "BLOCKED") {
        return NextResponse.json({ error: "Chat is restricted." }, { status: 403 });
      }

      // ✅ if receiver replies to a request => auto-accept
      const shouldAutoAccept =
        thread.status === "REQUESTED" &&
        !!thread.requestedById &&
        thread.requestedById !== senderId;

      thread = await prisma.chatThread.update({
        where: { id: thread.id },
        data: {
          lastMessageText: content,
          lastMessageAt: now,
          status: shouldAutoAccept ? "ACCEPTED" : thread.status,
          requestedById: shouldAutoAccept ? null : thread.requestedById,
        },
      });
    }

    const message = await prisma.chatMessage.create({
      data: { threadId: thread.id, senderId, content },
    });

    // ✅ create notification (request vs normal message)
    try {
      const settings = await getOrCreateUserSettings(receiverId);
      if (Boolean((settings as any).notifyMessages)) {
        const displayName = sender.nickname || sender.username || "Someone";
        const isRequest = thread.status === "REQUESTED" && thread.requestedById === senderId;

        await prisma.notification.create({
          data: {
            userId: receiverId,
            type: "MESSAGE",
            title: isRequest ? `Message request from ${displayName}` : `New message from ${displayName}`,
            body: content.length > 120 ? content.slice(0, 117) + "..." : content,
          },
        });
      }
    } catch (inner) {
      console.error("[POST /api/chat/messages] notification creation failed", inner);
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
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
