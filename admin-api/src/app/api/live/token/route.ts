import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is missing in env`);
  return v;
}

function buildToken(params: {
  identity: string;
  name?: string | null;
  room: string;
  canPublish?: boolean;
  canSubscribe?: boolean;
}) {
  const apiKey = mustEnv("LIVEKIT_API_KEY");
  const apiSecret = mustEnv("LIVEKIT_API_SECRET");

  const at = new AccessToken(apiKey, apiSecret, {
    identity: params.identity,
    name: params.name ?? undefined,
    ttl: 60 * 60, // 1 hour
  });

  at.addGrant({
    roomJoin: true,
    room: params.room,
    canPublish: params.canPublish ?? true,
    canSubscribe: params.canSubscribe ?? true,
    canPublishData: true,
  });

  return at.toJwt();
}

// GET /api/livekit/token?userId=...&room=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const room = searchParams.get("room");

    if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });
    if (!room) return NextResponse.json({ error: "room is required" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const token = buildToken({
      identity: user.id,
      name: user.name ?? user.email ?? "user",
      room,
    });

    return NextResponse.json({ token });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "token error" }, { status: 500 });
  }
}

// POST /api/livekit/token  { userId, room }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const userId = body?.userId;
    const room = body?.room;

    if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });
    if (!room) return NextResponse.json({ error: "room is required" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const token = buildToken({
      identity: user.id,
      name: user.name ?? user.email ?? "user",
      room,
    });

    return NextResponse.json({ token });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "token error" }, { status: 500 });
  }
}
