// admin-api/src/app/api/chat/threads/accept/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const userId = String(body?.userId ?? "").trim();
    const threadId = String(body?.threadId ?? "").trim();

    if (!userId || !threadId) {
      return NextResponse.json({ error: "Missing userId/threadId" }, { status: 400 });
    }

    const thread = await prisma.chatThread.findUnique({
      where: { id: threadId },
      select: { id: true, userAId: true, userBId: true, status: true },
    });

    if (!thread) return NextResponse.json({ error: "Thread not found" }, { status: 404 });

    const isMember = thread.userAId === userId || thread.userBId === userId;
    if (!isMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const updated = await prisma.chatThread.update({
      where: { id: threadId },
      data: { status: "ACCEPTED", requestedById: null },
      select: { id: true, status: true },
    });

    return NextResponse.json({ ok: true, threadId: updated.id, status: updated.status });
  } catch (e) {
    console.error("[POST /api/chat/threads/accept]", e);
    return NextResponse.json({ error: "Failed to accept request" }, { status: 500 });
  }
}
