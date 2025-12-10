// admin-api/src/app/api/notifications/unread-count/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

    const count = await prisma.notification.count({
      where: {
        userId,
        readAt: null,
      },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Unread notifications count error:", error);
    return NextResponse.json(
      { error: "Failed to load unread notifications" },
      { status: 500 }
    );
  }
}
