import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function randomCode(len = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    // ensure invite code exists
    let inviteCode = await prisma.inviteCode.findUnique({
      where: { userId },
      select: { code: true },
    });

    if (!inviteCode) {
      // create unique code
      for (let i = 0; i < 5; i++) {
        const code = randomCode(8);
        try {
          inviteCode = await prisma.inviteCode.create({
            data: { userId, code },
            select: { code: true },
          });
          break;
        } catch {
          // retry on collision
        }
      }
    }

    if (!inviteCode) {
      return NextResponse.json({ error: "Failed to create invite code" }, { status: 500 });
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const [inviteesCount, last7, earnedTotal, earnedToday] = await Promise.all([
      prisma.invite.count({
        where: { inviterId: userId, inviteeId: { not: null } },
      }),
      prisma.invite.findMany({
        where: { inviterId: userId, createdAt: { gte: sevenDaysAgo }, inviteeId: { not: null } },
        orderBy: { createdAt: "desc" },
        take: 30,
        select: {
          id: true,
          createdAt: true,
          status: true,
          invitee: { select: { id: true, username: true, avatarUrl: true } },
        },
      }),
      prisma.walletLedger.aggregate({
        where: {
          userId,
          type: "TOPUP", // you can change later to INVITE_REWARD when you add that
        },
        _sum: { delta: true },
      }),
      prisma.walletLedger.aggregate({
        where: {
          userId,
          type: "TOPUP",
          createdAt: { gte: startOfToday },
        },
        _sum: { delta: true },
      }),
    ]);

    // For now we keep reward as 0 unless you implement invite reward ledger
    const claimedRewards = 0;
    const availableToday = 0;

    const appUrl = process.env.APP_INVITE_BASE_URL || "https://goldilivepainelgeral.com";
    const inviteLink = `${appUrl}/invite?code=${encodeURIComponent(inviteCode.code)}`;

    return NextResponse.json({
      myId: userId,
      inviteCode: inviteCode.code,
      inviteLink,
      claimedRewards,
      inviteesCount,
      availableToday,
      last7Days: last7.map((x) => ({
        id: x.id,
        createdAt: x.createdAt,
        status: x.status,
        user: x.invitee
          ? { id: x.invitee.id, username: x.invitee.username, avatarUrl: x.invitee.avatarUrl }
          : null,
      })),
      debug: {
        topupEarnedTotal: Number(earnedTotal._sum.delta ?? 0),
        topupEarnedToday: Number(earnedToday._sum.delta ?? 0),
      },
    });
  } catch (e) {
    console.error("[GET /api/profile/invite]", e);
    return NextResponse.json({ error: "Failed to load invite data" }, { status: 500 });
  }
}
