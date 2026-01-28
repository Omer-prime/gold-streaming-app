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

function parseYMD(v: string | null) {
  if (!v) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!y || mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  return { y, mo, d, raw: v.trim() };
}

/**
 * tzOffset minutes should be JS getTimezoneOffset():
 * - Pakistan (UTC+5) => -300
 * - UTC => 0
 */
function computeRange(period: RankPeriod, y: number, mo: number, d: number, tzOffsetMin: number) {
  const offsetMs = tzOffsetMin * 60_000;

  // local midnight converted into UTC timestamp:
  // UTC = local + offset
  const localMidnightUtc = new Date(Date.UTC(y, mo - 1, d, 0, 0, 0) + offsetMs);

  if (period === "daily") {
    const start = localMidnightUtc;
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    return { start, end };
  }

  if (period === "weekly") {
    // ISO week (Mon-Sun) based on selected date
    const dow = new Date(Date.UTC(y, mo - 1, d)).getUTCDay(); // 0..6
    const iso = dow === 0 ? 7 : dow; // 1..7
    const diff = iso - 1; // days since Monday
    const weekStartUtcMidnight = new Date(Date.UTC(y, mo - 1, d - diff, 0, 0, 0) + offsetMs);
    const weekEnd = new Date(weekStartUtcMidnight.getTime() + 7 * 24 * 60 * 60 * 1000);
    return { start: weekStartUtcMidnight, end: weekEnd };
  }

  // monthly
  const monthStart = new Date(Date.UTC(y, mo - 1, 1, 0, 0, 0) + offsetMs);
  const nextMonthStart = new Date(Date.UTC(y, mo, 1, 0, 0, 0) + offsetMs);
  return { start: monthStart, end: nextMonthStart };
}

function displayName(u: any) {
  const n = String(u?.nickname ?? "").trim();
  if (n) return n;
  const un = String(u?.username ?? "").trim();
  if (un) return un;
  return "User";
}

function flagFromCountryCode(code?: string | null) {
  const c = String(code ?? "").trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(c)) return null;
  const A = 0x1f1e6;
  const base = "A".charCodeAt(0);
  const first = A + (c.charCodeAt(0) - base);
  const second = A + (c.charCodeAt(1) - base);
  return String.fromCodePoint(first, second);
}

/**
 * Admin detection WITHOUT depending on any specific Prisma field.
 * (So it won't break your schema.)
 */
function isAdminLike(u: any) {
  const excludeIds = String(process.env.RANKING_EXCLUDE_USER_IDS ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

  const id = String(u?.id ?? "");
  if (id && excludeIds.includes(id)) return true;

  const role = String(u?.role ?? "").toUpperCase();
  if (["ADMIN", "SUPER_ADMIN", "SUPERADMIN", "STAFF", "MODERATOR"].includes(role)) return true;

  if (u?.isAdmin === true || u?.isStaff === true || u?.isModerator === true || u?.isSuperAdmin === true) {
    return true;
  }

  const email = String(u?.email ?? "").toLowerCase();
  const username = String(u?.username ?? "").toLowerCase();
  const nickname = String(u?.nickname ?? "").toLowerCase();

  // common admin patterns
  if (email.includes("admin") || username.includes("admin") || nickname.includes("admin")) return true;

  // your admin panel emails often use your domain
  if (email.endsWith("@goldlive.app") || email.endsWith("@goldlive.app.pk")) return true;

  return false;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const type = parseType(searchParams.get("type"));
    const period = parsePeriod(searchParams.get("period"));
    const limit = clamp(parseInt(searchParams.get("limit") ?? "50", 10) || 50, 1, 100);

    const region = (searchParams.get("region") ?? "global").trim();
    const userId = (searchParams.get("userId") ?? "").trim() || null;

    const dateParam = parseYMD(searchParams.get("date"));
    const tzOffsetMin = Number(searchParams.get("tzOffset") ?? "0") || 0;

    // Default: today (UTC date) if not provided
    const today = new Date();
    const y = dateParam?.y ?? today.getUTCFullYear();
    const mo = dateParam?.mo ?? today.getUTCMonth() + 1;
    const d = dateParam?.d ?? today.getUTCDate();

    const range = computeRange(period, y, mo, d, tzOffsetMin);

    const p = prisma as any;

    // take extra so that after removing admins we still have enough
    const extraTake = clamp(limit * 6, limit, 500);

    let items: Array<{
      rank: number;
      userId: string;
      name: string;
      avatarUrl: string | null;
      countryFlag: string | null;
      score: number;
    }> = [];

    if (type === "host") {
      const users = await p.user.findMany({
        orderBy: [{ liveLevel: "desc" }, { level: "desc" }, { createdAt: "asc" }],
        take: extraTake,
      });

      const filtered = (Array.isArray(users) ? users : []).filter((u: any) => !isAdminLike(u));
      items = filtered.slice(0, limit).map((u: any, idx: number) => ({
        rank: idx + 1,
        userId: String(u.id),
        name: displayName(u),
        avatarUrl: u.avatarUrl ?? null,
        countryFlag: flagFromCountryCode(u.countryCode ?? null) ?? (u.countryFlag ?? null),
        score: Number(u.liveLevel ?? 0),
      }));
    }

    if (type === "gift") {
      const users = await p.user.findMany({
        orderBy: [{ level: "desc" }, { liveLevel: "desc" }, { createdAt: "asc" }],
        take: extraTake,
      });

      const filtered = (Array.isArray(users) ? users : []).filter((u: any) => !isAdminLike(u));
      items = filtered.slice(0, limit).map((u: any, idx: number) => ({
        rank: idx + 1,
        userId: String(u.id),
        name: displayName(u),
        avatarUrl: u.avatarUrl ?? null,
        countryFlag: flagFromCountryCode(u.countryCode ?? null) ?? (u.countryFlag ?? null),
        score: Number(u.level ?? 0),
      }));
    }

    if (type === "rich") {
      const wallets = await p.wallet.findMany({
        orderBy: [{ balance: "desc" }],
        take: extraTake,
      });

      const walletList = Array.isArray(wallets) ? wallets : [];
      const userIds = walletList.map((w: any) => String(w.userId)).filter(Boolean);

      const users = await p.user.findMany({
        where: { id: { in: userIds } },
      });

      const userMap = new Map<string, any>();
      (Array.isArray(users) ? users : []).forEach((u: any) => userMap.set(String(u.id), u));

      const filteredWallets = walletList.filter((w: any) => {
        const u = userMap.get(String(w.userId));
        if (!u) return false; // if no user record, skip
        return !isAdminLike(u);
      });

      items = filteredWallets.slice(0, limit).map((w: any, idx: number) => {
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
    // ME (rank + distance) based on CURRENT returned list (no admins)
    // ---------------------------
    let me: null | {
      rank: number | null;
      score: number;
      distance: number | null;
      targetRank: number | null;
      targetScore: number | null;
    } = null;

    if (userId) {
      // If user itself is admin-like, hide it completely
      const uMe = await p.user.findUnique?.({ where: { id: userId } }) ?? await p.user.findFirst?.({ where: { id: userId } });
      if (uMe && isAdminLike(uMe)) {
        me = null;
      } else {
        let myScore = 0;

        if (type === "host" || type === "gift") {
          if (uMe) myScore = Number(type === "host" ? (uMe.liveLevel ?? 0) : (uMe.level ?? 0));
        } else {
          const w = await p.wallet.findFirst?.({ where: { userId } });
          if (w) myScore = Number(w.balance ?? 0);
        }

        const myItem = items.find((x) => x.userId === userId) ?? null;

        let myRank: number | null = myItem ? myItem.rank : null;

        let distance: number | null = null;
        let targetRank: number | null = null;
        let targetScore: number | null = null;

        if (items.length > 0) {
          if (myItem && myItem.rank > 1) {
            const above = items[myItem.rank - 2];
            targetRank = above.rank;
            targetScore = above.score;
            distance = Math.max(0, Number(above.score) - Number(myScore));
          } else if (!myItem) {
            const last = items[items.length - 1];
            targetRank = last.rank;
            targetScore = last.score;
            distance = Math.max(0, Number(last.score) - Number(myScore));
          }
        }

        me = { rank: myRank, score: myScore, distance, targetRank, targetScore };
      }
    }

    return NextResponse.json({
      type,
      period,
      region,

      // calendar support
      selectedDate: dateParam?.raw ?? `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      tzOffsetMin,
      rangeStart: range.start.toISOString(),
      rangeEnd: range.end.toISOString(),

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
