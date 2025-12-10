// src/app/api/profile/rewards/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RewardItem = {
  id: string;
  title: string;
  subtitle: string;
  rewardPoints: number;
  current: number;
  target: number;
  goAction?: string; // tells mobile app which screen to open
};

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

    // ----- PK record (same as before) -----
    const { start, end } = getTodayWindow();
    const battles = await prisma.pKBattle.findMany({
      where: {
        createdAt: { gte: start, lt: end },
        OR: [{ hostId: userId }, { opponentId: userId }],
      },
      orderBy: { createdAt: "asc" },
    });

    let wins = 0;
    let currentStreak = 0;
    let highestStreak = 0;

    for (const b of battles) {
      const isHost = b.hostId === userId;
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
    }

    const pkRecord = {
      highestStreak,
      effectiveWins: wins,
    };

    // ----- Tasks (still static, now with goAction) -----

    const pkMission: RewardItem[] = [
      {
        id: "team-pk-once",
        title: "Complete a round of Team PK",
        subtitle: "Can only be achieved once",
        rewardPoints: 100,
        current: 0,
        target: 1,
        goAction: "OPEN_PK_AREA", // e.g. navigate to PK rooms
      },
      {
        id: "rocket-host-video",
        title: "Rocket Host Video Collection",
        subtitle: "Upload video and pass review",
        rewardPoints: 10000,
        current: 0,
        target: 1,
        goAction: "OPEN_ROCKET_HOST_EVENT", // open Rocket Host event screen
      },
      {
        id: "daily-fan-power-10",
        title: "Daily Fan Power Points increased by 10",
        subtitle: "Increase by 10 points today",
        rewardPoints: 100,
        current: 0,
        target: 10,
        goAction: "OPEN_ACTIVITY_CENTER",
      },
      {
        id: "daily-fan-power-50",
        title: "Daily Fan Power Points increased by 50",
        subtitle: "Increase by 50 points today",
        rewardPoints: 200,
        current: 0,
        target: 50,
        goAction: "OPEN_ACTIVITY_CENTER",
      },
    ];

    const activity: RewardItem[] = [
      {
        id: "activity-video",
        title: "Upload video and pass review",
        subtitle: "(0/1)",
        rewardPoints: 10000,
        current: 0,
        target: 1,
        goAction: "OPEN_ROCKET_HOST_EVENT",
      },
      {
        id: "activity-fan-power-10",
        title: "Daily Fan Power Points increased by 10",
        subtitle: "(0/10)",
        rewardPoints: 100,
        current: 0,
        target: 10,
        goAction: "OPEN_ACTIVITY_CENTER",
      },
      {
        id: "activity-fan-power-50",
        title: "Daily Fan Power Points increased by 50",
        subtitle: "(0/50)",
        rewardPoints: 200,
        current: 0,
        target: 50,
        goAction: "OPEN_ACTIVITY_CENTER",
      },
      {
        id: "activity-fan-power-100",
        title: "Daily Fan Power Points increased by 100",
        subtitle: "(0/100)",
        rewardPoints: 200,
        current: 0,
        target: 100,
        goAction: "OPEN_ACTIVITY_CENTER",
      },
    ];

    const fanClub: RewardItem[] = [
      {
        id: "fanclub-challenge",
        title: "Fan Club Challenges",
        subtitle:
          "Tips for hosts:\n1. Send Lucky Boxes in LIVE room to grow your Fan Club.\n2. Set Party room seats for Fan Club members only.",
        rewardPoints: 500,
        current: 0,
        target: 1,
        goAction: "OPEN_FANCLUB_CENTER",
      },
      {
        id: "fanclub-fan-power-10",
        title: "Daily Fan Power Points increased by 10",
        subtitle: "(0/10)",
        rewardPoints: 100,
        current: 0,
        target: 10,
        goAction: "OPEN_FANCLUB_CENTER",
      },
      {
        id: "fanclub-fan-power-50",
        title: "Daily Fan Power Points increased by 50",
        subtitle: "(0/50)",
        rewardPoints: 200,
        current: 0,
        target: 50,
        goAction: "OPEN_FANCLUB_CENTER",
      },
      {
        id: "fanclub-fan-power-100",
        title: "Daily Fan Power Points increased by 100",
        subtitle: "(0/100)",
        rewardPoints: 200,
        current: 0,
        target: 100,
        goAction: "OPEN_FANCLUB_CENTER",
      },
    ];

    const invite: RewardItem[] = [
      {
        id: "invite-daily-fan-power-100",
        title: "Daily Fan Power Points increased by 100",
        subtitle: "(0/100)",
        rewardPoints: 200,
        current: 0,
        target: 100,
        goAction: "OPEN_INVITE_CENTER",
      },
      {
        id: "invite-one-person",
        title: "Invite one person can earn up to $22.3",
        subtitle: "The more you invite, the more rewards you will get",
        rewardPoints: 223000,
        current: 0,
        target: 1,
        goAction: "OPEN_INVITE_CENTER",
      },
      {
        id: "vip-daily-rewards",
        title: "VIP daily rewards",
        subtitle: "Extra daily rewards for VIPs",
        rewardPoints: 35000,
        current: 0,
        target: 1,
        goAction: "OPEN_VIP_CENTER", // this is your VIP screen
      },
      {
        id: "on-mic-30",
        title: "On the mic for 30 mins",
        subtitle: "Time in party and live rooms both count",
        rewardPoints: 200,
        current: 0,
        target: 30,
        goAction: "OPEN_LIVE_ROOMS",
      },
      {
        id: "on-mic-60",
        title: "On the mic for 60 mins",
        subtitle: "Send 5 lucky gifts.",
        rewardPoints: 300,
        current: 0,
        target: 60,
        goAction: "OPEN_LIVE_ROOMS",
      },
    ];

    return NextResponse.json({
      dailyResetNote:
        "Daily tasks: Tasks refresh daily at 00:00:00 (UTC+8).",
      weeklyResetNote:
        "Weekly tasks: Tasks refresh every Monday at 00:00:00 (UTC+8).",
      pkRecord,
      pkMission,
      activity,
      fanClub,
      invite,
    } as const);
  } catch (err) {
    console.error("rewards route error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/* ---------- helpers ---------- */

function getTodayWindow() {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const d = now.getUTCDate();
  const start = new Date(Date.UTC(y, m, d));
  const end = new Date(Date.UTC(y, m, d + 1));
  return { start, end };
}
