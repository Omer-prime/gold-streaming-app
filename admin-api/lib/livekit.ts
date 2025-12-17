import { AccessToken } from "livekit-server-sdk";

export function getLiveKitConfig() {
  const url = process.env.LIVEKIT_URL;
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!url || !apiKey || !apiSecret) {
    throw new Error(
      "Missing LIVEKIT_URL / LIVEKIT_API_KEY / LIVEKIT_API_SECRET in env"
    );
  }

  return { url, apiKey, apiSecret };
}

export function createLiveKitToken(opts: {
  roomName: string;
  identity: string;
  name: string;
  role: "host" | "viewer";
}) {
  const { apiKey, apiSecret } = getLiveKitConfig();

  const at = new AccessToken(apiKey, apiSecret, {
    identity: opts.identity,
    name: opts.name,
    ttl: "6h",
  });

  at.addGrant({
    roomJoin: true,
    room: opts.roomName,
    canPublish: opts.role === "host",
    canSubscribe: true,
    canPublishData: true,
  });

  return at.toJwt();
}
