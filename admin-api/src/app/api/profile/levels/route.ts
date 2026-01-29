// admin-api/src/app/api/profile/levels/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ---------- Prisma (avoid hot-reload multiple clients) ----------
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// ---------- Level thresholds (edit any time) ----------
const WEALTH_THRESHOLDS: number[] = [
  0, // unused index 0
  0, // Lv1
  3000, 9000, 20000, 40000, 70000, 110000, 160000, 220000, 300000,
  400000, 520000, 670000, 850000, 1050000, 1280000, 1540000, 1830000,
  2150000, 2500000,
];

const LIVE_THRESHOLDS: number[] = [
  0,
  0, // Lv1
  2000, 6000, 15000, 30000, 50000, 80000, 120000, 170000, 230000,
  300000, 380000, 470000, 570000, 680000, 800000, 930000, 1070000,
  1220000, 1400000,
];

type LevelType = "WEALTH" | "LIVE";

const WEALTH_BENEFITS = [
  { unlockLevel: 1, title: "Entry special effect", description: "Basic entry effect" },
  { unlockLevel: 5, title: "Nickname highlight", description: "Your name looks premium" },
  { unlockLevel: 10, title: "Exclusive frame", description: "Special avatar frame" },
  { unlockLevel: 15, title: "Luxury entrance", description: "Better entry animation" },
  { unlockLevel: 20, title: "Top spender badge", description: "Exclusive badge for top users" },
];

const LIVE_BENEFITS = [
  { unlockLevel: 1, title: "Livestream starter", description: "Starter privileges for hosts" },
  { unlockLevel: 5, title: "Room decoration", description: "Unlock basic room theme" },
  { unlockLevel: 10, title: "Featured boost", description: "Higher exposure chance" },
  { unlockLevel: 15, title: "Pro host badge", description: "Show your host status" },
  { unlockLevel: 20, title: "Elite host theme", description: "Exclusive host theme" },
];

function computeLevel(exp: number, thresholds: number[]) {
  const maxLevel = thresholds.length - 1;

  let level = 1;
  for (let i = 1; i <= maxLevel; i++) {
    if (exp >= thresholds[i]) level = i;
    else break;
  }

  const currentMin = thresholds[level] ?? 0;
  const nextLevel = level < maxLevel ? level + 1 : null;
  const nextMin = nextLevel ? thresholds[nextLevel] : null;

  const progressPct =
    nextMin && nextMin > currentMin
      ? Math.max(0, Math.min(100, ((exp - currentMin) / (nextMin - currentMin)) * 100))
      : 100;

  const expToNext = nextMin ? Math.max(0, nextMin - exp) : null;

  return { level, currentMin, nextLevel, nextMin, progressPct, expToNext, maxLevel };
}

// ---------- JWT (HS256) verification without extra libs ----------
function base64urlToBuffer(input: string) {
  let s = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = s.length % 4;
  if (pad) s += "=".repeat(4 - pad);
  return Buffer.from(s, "base64");
}

function bufferToBase64url(buf: Buffer) {
  return buf
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

function verifyJwtHs256(token: string, secret: string) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [h, p, sig] = parts;

  const header = JSON.parse(base64urlToBuffer(h).toString("utf8"));
  if (header?.alg !== "HS256") return null;

  const expected = bufferToBase64url(
    crypto.createHmac("sha256", secret).update(`${h}.${p}`).digest()
  );

  if (!safeEqual(sig, expected)) return null;

  const payload = JSON.parse(base64urlToBuffer(p).toString("utf8"));

  // optional exp check
  if (typeof payload?.exp === "number") {
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) return null;
  }

  return payload as Record<string, any>;
}

function getJwtSecret() {
  return (
    process.env.JWT_SECRET ||
    process.env.ACCESS_TOKEN_SECRET ||
    process.env.AUTH_SECRET ||
    ""
  );
}

async function getUserIdFromRequest(req: NextRequest): Promise<string | null> {
  // Dev / internal fallback
  const headerUserId = req.headers.get("x-user-id");
  if (headerUserId) return headerUserId;

  const auth = req.headers.get("authorization") || "";
  if (!auth.startsWith("Bearer ")) return null;

  const token = auth.slice("Bearer ".length).trim();
  if (!token) return null;

  const secret = getJwtSecret();
  if (!secret) {
    // If you don’t have JWT secret in env, replace this function with your existing auth logic.
    return null;
  }

  const payload = verifyJwtHs256(token, secret);
  if (!payload) return null;

  // common fields
  return (payload.userId || payload.sub || payload.id || null) as string | null;
}

// ---------- Route ----------
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const typeRaw = String(searchParams.get("type") || "WEALTH").toUpperCase();
    const type: LevelType = typeRaw === "LIVE" ? "LIVE" : "WEALTH";

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        level: true,
        liveLevel: true,
        totalCoinsSpent: true,
        totalCoinsReceived: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const exp = type === "WEALTH" ? user.totalCoinsSpent : user.totalCoinsReceived;
    const thresholds = type === "WEALTH" ? WEALTH_THRESHOLDS : LIVE_THRESHOLDS;

    const computed = computeLevel(exp, thresholds);

    // Keep DB synced (optional, but helps “same value everywhere”)
    if (type === "WEALTH" && user.level !== computed.level) {
      await prisma.user.update({ where: { id: user.id }, data: { level: computed.level } });
    }
    if (type === "LIVE" && user.liveLevel !== computed.level) {
      await prisma.user.update({ where: { id: user.id }, data: { liveLevel: computed.level } });
    }

    const benefitsConfig = type === "WEALTH" ? WEALTH_BENEFITS : LIVE_BENEFITS;

    const unlockedBenefits = benefitsConfig
      .filter((b) => b.unlockLevel <= computed.level)
      .map((b) => ({ ...b, locked: false }));

    const milestoneLevels = [5, 10, 15, 20];
    const lockedLevels = milestoneLevels
      .filter((lv) => lv > computed.level)
      .map((lv) => ({
        level: lv,
        preview: benefitsConfig
          .filter((b) => b.unlockLevel === lv)
          .map((b) => b.title),
      }));

    return NextResponse.json({
      type,
      user: { id: user.id, username: user.username },
      exp,
      currentLevel: computed.level,
      nextLevel: computed.nextLevel,
      progressPct: computed.progressPct,
      expToNext: computed.expToNext,
      maxLevel: computed.maxLevel,
      benefits: unlockedBenefits,
      lockedLevels,
    });
  } catch (e: any) {
    return NextResponse.json(
      { message: "Server error", detail: String(e?.message || e) },
      { status: 500 }
    );
  }
}
