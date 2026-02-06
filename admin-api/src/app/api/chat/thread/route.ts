// src/app/api/chat/thread/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET /api/chat/thread?userId=...&peerId=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const peerId = searchParams.get("peerId");

    if (!userId || !peerId) {
      return NextResponse.json({ error: "userId and peerId are required" }, { status: 400 });
    }
    if (userId === peerId) return NextResponse.json({ thread: null }, { status: 200 });

    const [userAId, userBId] = userId < peerId ? [userId, peerId] : [peerId, userId];

    const thread = await prisma.chatThread.findUnique({
      where: { userAId_userBId: { userAId, userBId } },
      select: { id: true, status: true, requestedById: true },
    });

    return NextResponse.json({ thread: thread ?? null }, { status: 200 });
  } catch (e) {
    console.error("[GET /api/chat/thread]", e);
    return NextResponse.json({ error: "Failed to load thread" }, { status: 500 });
  }
}

// PATCH /api/chat/thread
// Body: { userId, peerId, action: "accept" | "decline" | "restrict" | "unrestrict" }
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const userId = body?.userId as string | undefined;
    const peerId = body?.peerId as string | undefined;
    const action = body?.action as string | undefined;

    if (!userId || !peerId || !action) {
      return NextResponse.json({ error: "userId, peerId and action are required" }, { status: 400 });
    }
    if (userId === peerId) return NextResponse.json({ thread: null }, { status: 200 });

    // full-block check (either direction)
    const blocked = await prisma.userBlock.findFirst({
      where: { OR: [{ userId, blockedId: peerId }, { userId: peerId, blockedId: userId }] },
      select: { id: true },
    });
    if (blocked) {
      return NextResponse.json({ error: "This user is blocked." }, { status: 403 });
    }

    const [userAId, userBId] = userId < peerId ? [userId, peerId] : [peerId, userId];

    let thread = await prisma.chatThread.findUnique({
      where: { userAId_userBId: { userAId, userBId } },
    });

    const now = new Date();

    if (action === "restrict") {
      if (!thread) {
        thread = await prisma.chatThread.create({
          data: {
            userAId,
            userBId,
            status: "BLOCKED",
            requestedById: null,
            lastMessageText: null,
            lastMessageAt: null,
          },
        });
      } else {
        thread = await prisma.chatThread.update({
          where: { id: thread.id },
          data: { status: "BLOCKED", requestedById: null, updatedAt: now },
        });
      }
      return NextResponse.json(
        { thread: { id: thread.id, status: thread.status, requestedById: thread.requestedById } },
        { status: 200 }
      );
    }

    if (action === "unrestrict") {
      if (!thread) return NextResponse.json({ thread: null }, { status: 200 });

      thread = await prisma.chatThread.update({
        where: { id: thread.id },
        data: { status: "ACCEPTED", requestedById: null, updatedAt: now },
      });

      return NextResponse.json(
        { thread: { id: thread.id, status: thread.status, requestedById: thread.requestedById } },
        { status: 200 }
      );
    }

    if (!thread) return NextResponse.json({ error: "Thread not found" }, { status: 404 });

    if (action === "accept") {
      // only receiver can accept
      if (thread.status !== "REQUESTED") {
        return NextResponse.json({ thread: { id: thread.id, status: thread.status, requestedById: thread.requestedById } }, { status: 200 });
      }
      if (thread.requestedById === userId) {
        return NextResponse.json({ error: "You cannot accept your own request" }, { status: 400 });
      }

      thread = await prisma.chatThread.update({
        where: { id: thread.id },
        data: { status: "ACCEPTED", requestedById: null, updatedAt: now },
      });

      return NextResponse.json({ thread: { id: thread.id, status: thread.status, requestedById: thread.requestedById } }, { status: 200 });
    }

    if (action === "decline") {
      // treat decline as BLOCKED (simple + no schema change)
      if (thread.status === "REQUESTED" && thread.requestedById === userId) {
        return NextResponse.json({ error: "You cannot decline your own request" }, { status: 400 });
      }

      thread = await prisma.chatThread.update({
        where: { id: thread.id },
        data: { status: "BLOCKED", requestedById: null, updatedAt: now },
      });

      return NextResponse.json({ thread: { id: thread.id, status: thread.status, requestedById: thread.requestedById } }, { status: 200 });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e) {
    console.error("[PATCH /api/chat/thread]", e);
    return NextResponse.json({ error: "Failed to update thread" }, { status: 500 });
  }
}
