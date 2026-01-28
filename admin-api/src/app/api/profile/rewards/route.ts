// src/app/api/profile/rewards/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✅ matches your mobile RewardScreen types (RewardTask + RewardApiResponse)
// Mobile expects: pkMission/activity/fanClub/invite arrays
type RewardTaskOut = {
  id: string;
  title: string;
  subtitle?: string | null;
  rewardPoints: number;
  current: number;
  target: number;
  goToScreen?: "Explore" | "VipCenter" | "Auth" | "LiveApplication" | null;
};

type RewardApiResponse = {
  dailyResetNote: string;
  weeklyResetNote: string;
  pkRecord: { highestStreak: number; effectiveWins: number };
  pkMission: RewardTaskOut[];
  activity: RewardTaskOut[];
  fanClub: RewardTaskOut[];
  invite: RewardTaskOut[];
};

type RewardCategory = "PK_MISSION" | "ACTIVITY" | "FAN_CLUB" | "INVITE";

// ------------------------
// Helpers
// ------------------------
function getTodayWindowUTC() {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const d = now.getUTCDate();
  const start = new Date(Date.UTC(y, m, d));
  const end = new Date(Date.UTC(y, m, d + 1));
  return { start, end };
}

// If you store `goToScreen` as string in DB, only allow these values to reach mobile
const allowedGoTo = new Set([
  "Explore",
  "VipCenter",
  "Auth",
  "LiveApplication",
]);

function normalizeGoTo(goToScreen: string | null): RewardTaskOut["goToScreen"] {
  if (!goToScreen) return null;
  return allowedGoTo.has(goToScreen) ? (goToScreen as any) : null;
}

/**
 * ✅ Real-time "current" values:
 * - TEAM PK task: if user has at least 1 TEAM PK battle today => current=1
 * - Upload video tasks etc: not in schema yet => keep 0 (won't crash, still works)
 * - On-mic minutes: from Stream overlaps today (SOLO+PARTY) => minutes
 */
async function computeRealtimeProgressToday(userId: string) {
  const { start, end } = getTodayWindowUTC();

  // TEAM PK sessions today (as host or opponent)
  const teamPkCount = await prisma.pKBattle.count({
    where: {
      createdAt: { gte: start, lt: end },
      type: "TEAM",
      OR: [{ hostId: userId }, { opponentId: userId }],
    },
  });

  // On-mic total seconds today (SOLO + PARTY)
  const streams = await prisma.stream.findMany({
    where: {
      hostId: userId,
      startedAt: { not: null, lte: end },
      OR: [{ endedAt: null }, { endedAt: { gte: start } }],
    },
    select: { startedAt: true, endedAt: true },
  });

  let onMicSeconds = 0;
  for (const s of streams) {
    if (!s.startedAt) continue;
    const sStart = s.startedAt;
    const sEnd = s.endedAt ?? end;

    const overlapStart = Math.max(sStart.getTime(), start.getTime());
    const overlapEnd = Math.min(sEnd.getTime(), end.getTime());
    if (overlapEnd <= overlapStart) continue;

    onMicSeconds += Math.floor((overlapEnd - overlapStart) / 1000);
  }

  const onMicMinutes = Math.floor(onMicSeconds / 60);

  return {
    teamPkCount,
    onMicMinutes,
  };
}

async function getPkRecordToday(userId: string) {
  const { start, end } = getTodayWindowUTC();

  const battles = await prisma.pKBattle.findMany({
    where: {
      createdAt: { gte: start, lt: end },
      OR: [{ hostId: userId }, { opponentId: userId }],
    },
    orderBy: { createdAt: "asc" },
    select: { hostId: true, hostWon: true },
  });

  let wins = 0;
  let currentStreak = 0;
  let highestStreak = 0;

  for (const b of battles) {
    const isHost = b.hostId === userId;
    let result: "win" | "lose" | "draw";

    if (b.hostWon === null) result = "draw";
    else if (b.hostWon === true && isHost) result = "win";
    else if (b.hostWon === false && !isHost) result = "win";
    else result = "lose";

    if (result === "win") {
      wins += 1;
      currentStreak += 1;
      if (currentStreak > highestStreak) highestStreak = currentStreak;
    } else {
      currentStreak = 0;
    }
  }

  return { highestStreak, effectiveWins: wins };
}

async function loadTasksFromDb(): Promise<
  Record<RewardCategory, Array<{
    id: string;
    category: RewardCategory;
    title: string;
    subtitle: string | null;
    rewardPoints: number;
    target: number;
    goToScreen: string | null;
    sortOrder: number;
  }>>
> {
  // If you added RewardTask model in Prisma (as we discussed), this will work.
  // If not migrated yet, you can keep the fallback below.
  const rows = await prisma.rewardTask.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      category: true,
      title: true,
      subtitle: true,
      rewardPoints: true,
      target: true,
      goToScreen: true,
      sortOrder: true,
    },
  });

  const grouped: any = {
    PK_MISSION: [],
    ACTIVITY: [],
    FAN_CLUB: [],
    INVITE: [],
  };

  for (const r of rows as any[]) {
    if (!grouped[r.category]) continue;
    grouped[r.category].push(r);
  }

  return grouped;
}

/**
 * ✅ Safe fallback tasks if DB is empty or rewardTask table not ready.
 * (Prevents your mobile screen from showing nothing.)
 */
function fallbackTasks(): Record<RewardCategory, RewardTaskOut[]> {
  return {
    PK_MISSION: [
      {
        id: "team-pk-once",
        title: "Complete a round of Team PK",
        subtitle: "Can only be achieved once",
        rewardPoints: 100,
        current: 0,
        target: 1,
        goToScreen: "Explore",
      },
    ],
    ACTIVITY: [],
    FAN_CLUB: [],
    INVITE: [],
  };
}

function attachRealtimeCurrent(
  tasks: RewardTaskOut[],
  realtime: { teamPkCount: number; onMicMinutes: number }
): RewardTaskOut[] {
  return tasks.map((t) => {
    // you can map by id (recommended)
    if (t.id === "team-pk-once") {
      return { ...t, current: Math.min(1, realtime.teamPkCount) };
    }
    if (t.id === "on-mic-30") {
      return { ...t, current: Math.min(t.target, realtime.onMicMinutes) };
    }
    if (t.id === "on-mic-60") {
      return { ...t, current: Math.min(t.target, realtime.onMicMinutes) };
    }

    // default keep whatever current is
    return t;
  });
}

// ------------------------
// Route
// ------------------------
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") ?? undefined;

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

    // ✅ Real-time pk record + progress today
    const [pkRecord, realtime] = await Promise.all([
      getPkRecordToday(userId),
      computeRealtimeProgressToday(userId),
    ]);

    // ✅ Load tasks from DB (admin-configurable)
    let groupedDbTasks: Record<RewardCategory, any> | null = null;
    try {
      groupedDbTasks = await loadTasksFromDb();
    } catch (e) {
      // If migrate not done / table missing, don't crash API
      groupedDbTasks = null;
      console.warn("RewardTask table not ready, using fallback tasks.");
    }

    const groupedFallback = fallbackTasks();

    // Convert DB rows -> mobile shape
    const toOut = (rows: any[] | undefined, fallback: RewardTaskOut[]) => {
      const arr = (rows && rows.length > 0
        ? rows.map((r) => ({
            id: r.id,
            title: r.title,
            subtitle: r.subtitle ?? null,
            rewardPoints: r.rewardPoints,
            current: 0, // will be filled real-time where possible
            target: r.target,
            goToScreen: normalizeGoTo(r.goToScreen),
          }))
        : fallback) as RewardTaskOut[];

      // ensure never undefined
      return Array.isArray(arr) ? arr : [];
    };

    const pkMission = toOut(groupedDbTasks?.PK_MISSION, groupedFallback.PK_MISSION);
    const activity = toOut(groupedDbTasks?.ACTIVITY, groupedFallback.ACTIVITY);
    const fanClub = toOut(groupedDbTasks?.FAN_CLUB, groupedFallback.FAN_CLUB);
    const invite = toOut(groupedDbTasks?.INVITE, groupedFallback.INVITE);

    // ✅ Attach real-time "current" values for the few tasks we can compute today
    const pkMissionRT = attachRealtimeCurrent(pkMission, realtime);
    const activityRT = attachRealtimeCurrent(activity, realtime);
    const fanClubRT = attachRealtimeCurrent(fanClub, realtime);
    const inviteRT = attachRealtimeCurrent(invite, realtime);

    const payload: RewardApiResponse = {
      dailyResetNote: "Daily tasks: Tasks refresh daily at 00:00:00 (UTC+8).",
      weeklyResetNote: "Weekly tasks: Tasks refresh every Monday at 00:00:00 (UTC+8).",
      pkRecord,
      pkMission: pkMissionRT,
      activity: activityRT,
      fanClub: fanClubRT,
      invite: inviteRT,
    };

    return NextResponse.json(payload);
  } catch (err) {
    console.error("rewards route error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
