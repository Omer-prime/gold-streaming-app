import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const roomName = searchParams.get("roomName");

  if (!userId || !roomName) {
    return NextResponse.json({ error: "userId & roomName required" }, { status: 400 });
  }

  const apiKey = process.env.LIVEKIT_API_KEY!;
  const apiSecret = process.env.LIVEKIT_API_SECRET!;
  const livekitUrl = process.env.LIVEKIT_URL!;

  const at = new AccessToken(apiKey, apiSecret, { identity: userId });

  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  const jwtMaybe = at.toJwt(); // can be string or Promise<string>
  const jwt = typeof jwtMaybe === "string" ? jwtMaybe : await jwtMaybe;

  return NextResponse.json({
    version: "token-route-v3",
    tokenType: typeof jwt,
    tokenPreview: jwt.slice(0, 20),
    token: jwt,
    room: roomName,
    url: livekitUrl,
  });
}
