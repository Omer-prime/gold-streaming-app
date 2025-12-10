// admin-api/src/app/api/settings/blacklist/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const blocks = await prisma.userBlock.findMany({
      where: { userId },
      include: {
        blockedUser: {
          select: { id: true, username: true, nickname: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ blocks });
  } catch (error) {
    console.error("[GET /api/settings/blacklist]", error);
    return NextResponse.json(
      { error: "Failed to load blacklist" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, target } = body ?? {};

    if (!userId || !target) {
      return NextResponse.json(
        { error: "userId and target are required" },
        { status: 400 }
      );
    }

    const targetStr = String(target);

    const other = await prisma.user.findFirst({
      where: {
        OR: [{ id: targetStr }, { username: targetStr }],
      },
      select: { id: true, username: true, nickname: true },
    });

    if (!other) {
      return NextResponse.json(
        { error: "User not found with that ID/username" },
        { status: 404 }
      );
    }

    if (other.id === String(userId)) {
      return NextResponse.json(
        { error: "You cannot block yourself" },
        { status: 400 }
      );
    }

    const block = await prisma.userBlock.upsert({
      where: {
        userId_blockedId: {
          userId: String(userId),
          blockedId: other.id,
        },
      },
      create: {
        userId: String(userId),
        blockedId: other.id,
      },
      update: {},
      include: {
        blockedUser: {
          select: { id: true, username: true, nickname: true },
        },
      },
    });

    return NextResponse.json({ block });
  } catch (error) {
    console.error("[POST /api/settings/blacklist]", error);
    return NextResponse.json(
      { error: "Failed to add to blacklist" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { userId, blockedUserId } = body ?? {};

    if (!userId || !blockedUserId) {
      return NextResponse.json(
        { error: "userId and blockedUserId are required" },
        { status: 400 }
      );
    }

    await prisma.userBlock.delete({
      where: {
        userId_blockedId: {
          userId: String(userId),
          blockedId: String(blockedUserId),
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[DELETE /api/settings/blacklist]", error);
    // if not found, just return success to keep UX simple
    return NextResponse.json({ success: true });
  }
}
