import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs"; // ✅ important for Prisma
export const dynamic = "force-dynamic";

function getDisplayName(u: { nickname: string | null; username: string }) {
  return u.nickname || u.username;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        nickname: true,
        avatarUrl: true,
        liveCoverUrl: true,
        role: true,
        level: true,
        faceVerifiedAt: true,
        liveApplications: {
          take: 1,
          orderBy: { updatedAt: "desc" },
          select: { status: true },
        },
      },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const applicationStatus = (user.liveApplications?.[0]?.status ?? "NONE") as
      | "NONE"
      | "PENDING"
      | "APPROVED"
      | "REJECTED";

    const approved = user.role === "HOST" || applicationStatus === "APPROVED";

    const activeStream = await prisma.stream.findFirst({
      where: { hostId: userId, isLive: true },
      orderBy: { startedAt: "desc" },
      select: {
        id: true,
        title: true,
        startedAt: true,
        viewers: true,
        mode: true,
        roomName: true,
        thumbnailUrl: true,
      },
    });

    return NextResponse.json({
      approved,
      applicationStatus,
      requirements: {
        faceVerified: !!user.faceVerifiedAt,
        hasLivePhoto: !!user.liveCoverUrl,
        wealthLevel: user.level ?? 1,
        wealthRequired: 5,
      },
      host: {
        id: user.id,
        name: getDisplayName(user),
        avatarUrl: user.avatarUrl,
        liveCoverUrl: user.liveCoverUrl,
      },
      activeStream: activeStream ? { ...activeStream } : null,
    });
  } catch (e) {
    console.error("[GET /api/live]", e);
    return NextResponse.json({ error: "Failed to load live status" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const userId = body?.userId as string | undefined;
    const title = (body?.title as string | undefined) || "My Live";
    const mode = (body?.mode as "SOLO" | "PARTY" | "PK" | undefined) || "SOLO";

    if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        liveApplications: { take: 1, orderBy: { updatedAt: "desc" }, select: { status: true } },
      },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const appStatus = (user.liveApplications?.[0]?.status ?? "NONE") as
      | "NONE"
      | "PENDING"
      | "APPROVED"
      | "REJECTED";

    const approved = user.role === "HOST" || appStatus === "APPROVED";
    if (!approved) return NextResponse.json({ error: "Not approved to go live" }, { status: 403 });

    const existing = await prisma.stream.findFirst({
      where: { hostId: userId, isLive: true },
      orderBy: { startedAt: "desc" },
    });

    const stream =
      existing ??
      (await prisma.stream.create({
        data: {
          hostId: userId,
          title,
          mode,
          isLive: true,
          viewers: 0,
          startedAt: new Date(),
          roomName: `gl_${userId}_${Date.now()}`,
        },
      }));

    await prisma.user.update({
      where: { id: userId },
      data: {
        role: "HOST",
        isLive: true,
        liveViewers: stream.viewers ?? 0,
        lastLiveAt: new Date(),
      },
    });

    return NextResponse.json({ stream });
  } catch (e) {
    console.error("[POST /api/live]", e);
    return NextResponse.json({ error: "Failed to start live" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const userId = body?.userId as string | undefined;
    const streamId = body?.streamId as string | undefined;

    if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });

    const stream =
      (streamId
        ? await prisma.stream.findUnique({ where: { id: streamId } })
        : await prisma.stream.findFirst({
            where: { hostId: userId, isLive: true },
            orderBy: { startedAt: "desc" },
          })) ?? null;

    if (stream?.isLive) {
      await prisma.stream.update({
        where: { id: stream.id },
        data: { isLive: false, endedAt: new Date() },
      });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isLive: false, liveViewers: 0 },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[DELETE /api/live]", e);
    return NextResponse.json({ error: "Failed to end live" }, { status: 500 });
  }
}
