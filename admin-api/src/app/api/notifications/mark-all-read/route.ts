// admin-api/src/app/api/notifications/mark-all-read/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const userId = body?.userId as string | undefined;

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

    const now = new Date();

    const result = await prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: now },
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, readAt: null },
    });

    return NextResponse.json({
      success: true,
      updated: result.count,
      unreadCount,
    });
  } catch (error) {
    console.error("Mark all notifications read error:", error);
    return NextResponse.json(
      { error: "Failed to mark notifications as read" },
      { status: 500 }
    );
  }
}
