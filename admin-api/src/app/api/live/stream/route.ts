import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/live/stream?streamId=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const streamId = searchParams.get("streamId");

    if (!streamId) {
      return NextResponse.json({ error: "streamId is required" }, { status: 400 });
    }

    const stream = await prisma.stream.findUnique({
      where: { id: streamId },
      select: { id: true, isLive: true, viewers: true, title: true },
    });

    if (!stream || !stream.isLive) {
      return NextResponse.json({ isLive: false, viewers: 0, title: null }, { status: 200 });
    }

    return NextResponse.json({
      isLive: true,
      viewers: stream.viewers ?? 0,
      title: stream.title ?? null,
    });
  } catch (e) {
    console.error("GET /api/live/stream error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
