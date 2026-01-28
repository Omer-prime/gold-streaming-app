import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/live/heartbeat
// body: { userId, streamId, viewers? }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    const userId = body?.userId as string | undefined;
    const streamId = body?.streamId as string | undefined;

    const viewersRaw = body?.viewers;
    const viewers =
      typeof viewersRaw === "number" && Number.isFinite(viewersRaw)
        ? Math.max(0, Math.floor(viewersRaw))
        : undefined;

    if (!userId || !streamId) {
      return NextResponse.json(
        { error: "userId and streamId are required" },
        { status: 400 }
      );
    }

    const stream = await prisma.stream.findUnique({
      where: { id: streamId },
      select: { id: true, hostId: true, isLive: true },
    });

    if (!stream) return NextResponse.json({ error: "Stream not found" }, { status: 404 });
    if (stream.hostId !== userId) return NextResponse.json({ error: "Not stream host" }, { status: 403 });

    await prisma.stream.update({
      where: { id: streamId },
      data: {
        updatedAt: new Date(),
        ...(typeof viewers === "number" ? { viewers } : {}),
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        isLive: true,
        lastLiveAt: new Date(),
        ...(typeof viewers === "number" ? { liveViewers: viewers } : {}),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[POST /api/live/heartbeat]", e);
    return NextResponse.json({ error: "Failed to heartbeat" }, { status: 500 });
  }
}
