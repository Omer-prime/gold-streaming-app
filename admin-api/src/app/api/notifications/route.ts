// admin-api/src/app/api/notifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/notifications?userId=...&page=1&pageSize=20&onlyUnread=1
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const pageParam = searchParams.get("page") ?? "1";
    const pageSizeParam = searchParams.get("pageSize") ?? "20";
    const onlyUnread = searchParams.get("onlyUnread") === "1";

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const page = Math.max(1, Number(pageParam) || 1);
    const pageSize = Math.max(1, Math.min(50, Number(pageSizeParam) || 20));
    const skip = (page - 1) * pageSize;

    const where: any = { userId };
    if (onlyUnread) {
      where.readAt = null;
    }

    const [total, unreadCount, notifications] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: { userId, readAt: null },
      }),
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
    ]);

    return NextResponse.json({
      notifications,
      total,
      unreadCount,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("List notifications error:", error);
    return NextResponse.json(
      { error: "Failed to load notifications" },
      { status: 500 }
    );
  }
}

// POST /api/notifications  -> mark notifications as read
// Body: { userId: string; ids?: string[] }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const userId = body?.userId as string | undefined;
    const ids = body?.ids as string[] | undefined;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const where: any = { userId, readAt: null };
    if (Array.isArray(ids) && ids.length > 0) {
      where.id = { in: ids };
    }

    const now = new Date();

    const result = await prisma.notification.updateMany({
      where,
      data: { readAt: now },
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, readAt: null },
    });

    return NextResponse.json({
      updated: result.count,
      unreadCount,
    });
  } catch (error) {
    console.error("Mark notifications read error:", error);
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 }
    );
  }
}
