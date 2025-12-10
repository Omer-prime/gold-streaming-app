// src/app/api/profile/pk-data/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type PKTypeParam = "random" | "friend" | "team";
type RangeParam = "today" | "7days" | "monthly";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const userId = searchParams.get("userId") ?? undefined;
    const typeParam = (searchParams.get("type") ?? "random").toLowerCase() as PKTypeParam;
    const rangeParam = (searchParams.get("range") ?? "today").toLowerCase() as RangeParam;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const base = new Date();
    const { start, end } = getPKRangeWindow(rangeParam, base);

    const prismaType =
      typeParam === "friend" ? "FRIEND" : typeParam === "team" ? "TEAM" : "RANDOM";

    const battles = await prisma.pKBattle.findMany({
      where: {
        type: prismaType as any,
        createdAt: { gte: start, lt: end },
        OR: [{ hostId: userId }, { opponentId: userId }],
      },
      include: {
        host: { select: { id: true, nickname: true, username: true } },
        opponent: { select: { id: true, nickname: true, username: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    let sessions = battles.length;
    let wins = 0;
    let highestStreak = 0;
    let currentStreak = 0;

    const history = battles.map((b) => {
      const isHost = b.hostId === userId;
      const myScore = isHost ? b.hostScore : b.opponentScore;
      const oppScore = isHost ? b.opponentScore : b.hostScore;

      let result: "win" | "lose" | "draw";
      if (b.hostWon === null) {
        result = "draw";
      } else if (b.hostWon === true && isHost) {
        result = "win";
      } else if (b.hostWon === false && !isHost) {
        result = "win";
      } else {
        result = "lose";
      }

      if (result === "win") {
        wins += 1;
        currentStreak += 1;
        if (currentStreak > highestStreak) highestStreak = currentStreak;
      } else {
        currentStreak = 0;
      }

      const opponent = isHost ? b.opponent : b.host;
      const opponentName =
        opponent?.nickname || opponent?.username || "Unknown";

      return {
        id: b.id,
        createdAt: b.createdAt.toISOString(),
        opponentName,
        result,
        score: `${myScore}:${oppScore}`,
      };
    });

    const pkScore = battles.reduce((sum, b) => {
      const isHost = b.hostId === userId;
      const myScore = isHost ? b.hostScore : b.opponentScore;
      return sum + myScore;
    }, 0);

    const winRate = sessions > 0 ? (wins / sessions) * 100 : 0;

    return NextResponse.json({
      pkType: typeParam,
      range: rangeParam,
      winRate,
      pkScore,
      sessions,
      history,
    } as const);
  } catch (err) {
    console.error("pk-data route error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/* ---------- helpers ---------- */

function getPKRangeWindow(range: RangeParam, base: Date) {
  const y = base.getUTCFullYear();
  const m = base.getUTCMonth();
  const d = base.getUTCDate();

  if (range === "7days") {
    const start = new Date(Date.UTC(y, m, d - 6));
    const end = new Date(Date.UTC(y, m, d + 1));
    return { start, end };
  }

  if (range === "monthly") {
    const start = new Date(Date.UTC(y, m, 1));
    const end = new Date(Date.UTC(y, m + 1, 1));
    return { start, end };
  }

  // today
  const start = new Date(Date.UTC(y, m, d));
  const end = new Date(Date.UTC(y, m, d + 1));
  return { start, end };
}
