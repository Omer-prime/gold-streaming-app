// admin-api/src/app/api/live/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StreamMode, StreamProtocol } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseMode(input: unknown): StreamMode {
  if (typeof input !== "string") return StreamMode.SOLO;
  return Object.values(StreamMode).includes(input as StreamMode)
    ? (input as StreamMode)
    : StreamMode.SOLO;
}

function parseProtocol(input: unknown): StreamProtocol {
  if (input === "CAMERA_ONLY" || input === "DEFAULT" || input == null) {
    return StreamProtocol.LIVEKIT;
  }
  if (typeof input !== "string") return StreamProtocol.LIVEKIT;
  return Object.values(StreamProtocol).includes(input as StreamProtocol)
    ? (input as StreamProtocol)
    : StreamProtocol.LIVEKIT;
}

function makeRoomName(userId: string) {
  return `gl_${userId}_${Date.now()}`;
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
        email: true,
        avatarUrl: true,
        liveCoverUrl: true,
        role: true,
        level: true,
        faceVerifiedAt: true,
      },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const latestApp = await prisma.liveApplication.findFirst({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: { status: true },
    });

    const applicationStatus = (latestApp?.status ?? "NONE") as
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
        protocol: true,
        roomName: true,
        roomSid: true,
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
        name: user.nickname || user.username || user.email || "Host",
        avatarUrl: user.avatarUrl,
        liveCoverUrl: user.liveCoverUrl,
      },
      activeStream: activeStream
        ? { ...activeStream, room: activeStream.roomName }
        : null,
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

    const mode = parseMode(body?.mode);
    const protocol = parseProtocol(body?.protocol);

    if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const latestApp = await prisma.liveApplication.findFirst({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: { status: true },
    });

    const approved = user.role === "HOST" || latestApp?.status === "APPROVED";
    if (!approved) return NextResponse.json({ error: "Not approved to go live" }, { status: 403 });

    let existing = await prisma.stream.findFirst({
      where: { hostId: userId, isLive: true },
      orderBy: { startedAt: "desc" },
      select: {
        id: true,
        title: true,
        viewers: true,
        mode: true,
        protocol: true,
        roomName: true,
        roomSid: true,
        thumbnailUrl: true,
        startedAt: true,
      },
    });

    if (existing && !existing.roomName) {
      existing = await prisma.stream.update({
        where: { id: existing.id },
        data: { roomName: makeRoomName(userId) },
        select: {
          id: true,
          title: true,
          viewers: true,
          mode: true,
          protocol: true,
          roomName: true,
          roomSid: true,
          thumbnailUrl: true,
          startedAt: true,
        },
      });
    }

    const stream =
      existing ??
      (await prisma.stream.create({
        data: {
          hostId: userId,
          title,
          mode,
          protocol,
          isLive: true,
          viewers: 0,
          startedAt: new Date(),
          roomName: makeRoomName(userId),
        },
        select: {
          id: true,
          title: true,
          viewers: true,
          mode: true,
          protocol: true,
          roomName: true,
          roomSid: true,
          thumbnailUrl: true,
          startedAt: true,
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

    return NextResponse.json({
      stream: { ...stream, room: stream.roomName },
    });
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
        ? await prisma.stream.findUnique({
            where: { id: streamId },
            select: { id: true, isLive: true },
          })
        : await prisma.stream.findFirst({
            where: { hostId: userId, isLive: true },
            orderBy: { startedAt: "desc" },
            select: { id: true, isLive: true },
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
