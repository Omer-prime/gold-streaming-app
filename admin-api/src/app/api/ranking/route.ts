import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RankType = "host" | "rich" | "gift";
type RankPeriod = "daily" | "weekly" | "monthly";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function parseType(v: string | null): RankType {
  const x = (v ?? "").toLowerCase();
  if (x === "host" || x === "rich" || x === "gift") return x;
  return "host";
}

function parsePeriod(v: string | null): RankPeriod {
  const x = (v ?? "").toLowerCase();
  if (x === "daily" || x === "weekly" || x === "monthly") return x;
  return "weekly";
}

function displayName(u: any) {
  const n = (u?.nickname ?? "").trim();
  if (n) return n;
  const un = (u?.username ?? "").trim();
  if (un) return un;
  return "User";
}

function flagFromCountryCode(code?: string | null) {
  const c = (code ?? "").trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(c)) return null;
  // Convert ISO country code to emoji flag
  const A = 0x1f1e6;
  const base = "A".charCodeAt(0);
  const first = A + (c.charCodeAt(0) - base);
  const second = A + (c.charCodeAt(1) - base);
  return String.fromCodePoint(first, second);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const type = parseType(searchParams.get("type"));
    const period = parsePeriod(searchParams.get("period"));
    const limit = clamp(parseInt(searchParams.get("limit") ?? "50", 10) || 50, 1, 100);

    // Optional: can be used later (country/region filtering)
    const region = (searchParams.get("region") ?? "global").trim();

    const userId = (searchParams.get("userId") ?? "").trim() || null;

    const p = prisma as any;

    // ---------------------------
    // 1) BUILD TOP LIST
    // ---------------------------
    let items: Array<{
      rank: number;
      userId: string;
      name: string;
      avatarUrl: string | null;
      countryFlag: string | null;
      score: number;
    }> = [];

    if (type === "host") {
      // Using user.liveLevel as host score (works now, later you can replace with real host earnings)
      const users = await p.user.findMany({
        orderBy: [{ liveLevel: "desc" }, { level: "desc" }, { createdAt: "asc" }],
        take: limit,
      });

      items = (Array.isArray(users) ? users : []).map((u: any, idx: number) => ({
        rank: idx + 1,
        userId: String(u.id),
        name: displayName(u),
        avatarUrl: u.avatarUrl ?? null,
        countryFlag: flagFromCountryCode(u.countryCode ?? null) ?? (u.countryFlag ?? null),
        score: Number(u.liveLevel ?? 0),
      }));
    }

    if (type === "gift") {
      // For now using user.level as gift score (until gift transactions are implemented)
      const users = await p.user.findMany({
        orderBy: [{ level: "desc" }, { liveLevel: "desc" }, { createdAt: "asc" }],
        take: limit,
      });

      items = (Array.isArray(users) ? users : []).map((u: any, idx: number) => ({
        rank: idx + 1,
        userId: String(u.id),
        name: displayName(u),
        avatarUrl: u.avatarUrl ?? null,
        countryFlag: flagFromCountryCode(u.countryCode ?? null) ?? (u.countryFlag ?? null),
        score: Number(u.level ?? 0),
      }));
    }

    if (type === "rich") {
      // Using wallet.balance as rich score
      const wallets = await p.wallet.findMany({
        orderBy: [{ balance: "desc" }],
        take: limit,
      });

      const walletList = Array.isArray(wallets) ? wallets : [];
      const userIds = walletList.map((w: any) => String(w.userId)).filter(Boolean);

      const users = await p.user.findMany({
        where: { id: { in: userIds } },
      });

      const userMap = new Map<string, any>();
      (Array.isArray(users) ? users : []).forEach((u: any) => userMap.set(String(u.id), u));

      items = walletList.map((w: any, idx: number) => {
        const u = userMap.get(String(w.userId));
        return {
          rank: idx + 1,
          userId: String(w.userId),
          name: displayName(u),
          avatarUrl: u?.avatarUrl ?? null,
          countryFlag: flagFromCountryCode(u?.countryCode ?? null) ?? (u?.countryFlag ?? null),
          score: Number(w?.balance ?? 0),
        };
      });
    }

    // ---------------------------
    // 2) ME (rank + distance)
    // ---------------------------
    let me: null | {
      rank: number | null;
      score: number;
      distance: number | null;
      targetRank: number | null;
      targetScore: number | null;
    } = null;

    if (userId) {
      let myScore = 0;
      let myRank: number | null = null;

      if (type === "host" || type === "gift") {
        const u = await p.user.findUnique?.({ where: { id: userId } })
          ?? await p.user.findFirst?.({ where: { id: userId } });

        if (u) {
          myScore = Number(type === "host" ? (u.liveLevel ?? 0) : (u.level ?? 0));

          const where: any = {};
          if (type === "host") where.liveLevel = { gt: myScore };
          if (type === "gift") where.level = { gt: myScore };

          const betterCount = await p.user.count({ where });
          myRank = Number(betterCount ?? 0) + 1;
        }
      }

      if (type === "rich") {
        const w = await p.wallet.findFirst?.({ where: { userId } });
        if (w) {
          myScore = Number(w.balance ?? 0);

          const betterCount = await p.wallet.count({
            where: { balance: { gt: myScore } },
          });
          myRank = Number(betterCount ?? 0) + 1;
        }
      }

      // distance logic
      let distance: number | null = null;
      let targetRank: number | null = null;
      let targetScore: number | null = null;

      if (myRank && items.length > 0) {
        const inTop = myRank <= items.length;

        if (inTop) {
          if (myRank > 1) {
            const above = items[myRank - 2]; // rank above me
            targetRank = above.rank;
            targetScore = above.score;
            distance = Math.max(0, Number(above.score) - Number(myScore));
          } else {
            distance = null;
          }
        } else {
          const last = items[items.length - 1];
          targetRank = last.rank;
          targetScore = last.score;
          distance = Math.max(0, Number(last.score) - Number(myScore));
        }
      }

      me = {
        rank: myRank,
        score: myScore,
        distance,
        targetRank,
        targetScore,
      };
    }

    return NextResponse.json({
      type,
      period,
      region,
      updatedAt: new Date().toISOString(),
      items,
      me,
      note:
        type === "gift"
          ? "Gift ranking is temporarily based on user level until gift transactions are added."
          : type === "host"
          ? "Host ranking is temporarily based on liveLevel until live-earnings are added."
          : undefined,
    });
  } catch (e: any) {
    console.error("GET /api/ranking error", e);
    return NextResponse.json(
      { error: "Failed to load ranking", details: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
