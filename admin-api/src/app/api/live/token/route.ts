// admin-api/src/app/api/live/token/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AccessToken } from "livekit-server-sdk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  userId?: string;
  streamId?: string;
  role?: "host" | "viewer";
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as Body | null;

    const userId = body?.userId;
    const streamId = body?.streamId;
    const role = body?.role === "viewer" ? "viewer" : "host";

    if (!userId || !streamId) {
      return NextResponse.json(
        { error: "userId & streamId required" },
        { status: 400 }
      );
    }

    const livekitUrl = process.env.LIVEKIT_URL;
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!livekitUrl || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "LiveKit env missing (LIVEKIT_URL / LIVEKIT_API_KEY / LIVEKIT_API_SECRET)" },
        { status: 500 }
      );
    }

    // fetch stream + roomName
    const stream = await prisma.stream.findUnique({
      where: { id: streamId },
      select: { id: true, hostId: true, title: true, isLive: true, roomName: true },
    });

    if (!stream) return NextResponse.json({ error: "Stream not found" }, { status: 404 });
    if (!stream.isLive) return NextResponse.json({ error: "Stream is not live" }, { status: 400 });
    if (!stream.roomName) return NextResponse.json({ error: "Stream roomName missing" }, { status: 500 });

    // host only: enforce
    if (role === "host" && stream.hostId !== userId) {
      return NextResponse.json({ error: "Only host can publish" }, { status: 403 });
    }

    const at = new AccessToken(apiKey, apiSecret, { identity: userId });

    at.addGrant({
      roomJoin: true,
      room: stream.roomName,
      canPublish: role === "host",
      canSubscribe: true,
      canPublishData: true,
    });

    const jwtMaybe = at.toJwt();
    const token = typeof jwtMaybe === "string" ? jwtMaybe : await jwtMaybe;

    return NextResponse.json({
      livekitUrl,
      roomName: stream.roomName,
      token,
      stream: { id: stream.id, title: stream.title ?? null, hostId: stream.hostId },
    });
  } catch (e) {
    console.error("[POST /api/live/token]", e);
    return NextResponse.json({ error: "Failed to get LiveKit token" }, { status: 500 });
  }
}
