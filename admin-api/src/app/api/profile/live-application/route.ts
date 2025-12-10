// admin-api/src/app/api/profile/live-application/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// POST /api/profile/live-application
// Body: { userId: string }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    const userId = body?.userId as string | undefined;
    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // 1) Make sure user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2) Check if user already has active application
    const existing = await prisma.liveApplication.findFirst({
      where: {
        userId,
        status: {
          in: ["PENDING", "APPROVED"],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          error: "You already have an active application.",
          application: existing,
        },
        { status: 409 }
      );
    }

    // 3) Create new application
    const application = await prisma.liveApplication.create({
      data: {
        userId,
        status: "PENDING",
      },
    });

    // 4) 🔔 Create notification: "we received your request"
    try {
      await prisma.notification.create({
        data: {
          userId,
          type: "LIVE_APPLICATION_SUBMITTED",
          title: "Verification request submitted",
          body: "We have received your real-person verification request. Please wait while our team reviews it.",
        },
      });
    } catch (err) {
      // don't break the flow if notification insertion fails
      console.error("Create submit notification error:", err);
    }

    return NextResponse.json({ application }, { status: 201 });
  } catch (err) {
    console.error("Create live application error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/profile/live-application?userId=...
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

    const application = await prisma.liveApplication.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      { application: application ?? null },
      { status: 200 }
    );
  } catch (err) {
    console.error("Get live application error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
