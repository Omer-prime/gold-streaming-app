// admin-api/src/app/api/profile/live-application/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const REQUIRED_WEALTH_LEVEL = 5;

function getRequirements(user: any) {
  const faceVerified = !!user?.faceVerifiedAt;
  const hasLiveCover = !!user?.liveCoverUrl;
  const wealthLevel = Number(user?.level ?? 0);

  return {
    faceVerified,
    hasLiveCover,
    wealthLevel,
    requiredWealthLevel: REQUIRED_WEALTH_LEVEL,
    canApply: faceVerified && hasLiveCover && wealthLevel >= REQUIRED_WEALTH_LEVEL,
  };
}

// POST /api/profile/live-application
// Body: { userId: string, faceImageBase64?: string }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const userId = (body?.userId as string | undefined)?.trim();

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (user.role === "ADMIN") {
      return NextResponse.json({ error: "Admins cannot apply as host." }, { status: 403 });
    }

    // If already host, no need to apply
    if (user.role === "HOST") {
      return NextResponse.json(
        {
          error: "You are already approved as a host.",
          application: null,
          hostApproved: true,
          applicationStatus: "APPROVED",
          requirements: getRequirements(user),
        },
        { status: 200 }
      );
    }

    const requirements = getRequirements(user);
    if (!requirements.canApply) {
      const missing: string[] = [];
      if (!requirements.faceVerified) missing.push("FACE_AUTH");
      if (!requirements.hasLiveCover) missing.push("LIVE_COVER");
      if (requirements.wealthLevel < requirements.requiredWealthLevel) missing.push("WEALTH_LEVEL");

      return NextResponse.json(
        {
          error: "Complete live application conditions first.",
          missing,
          requirements,
        },
        { status: 400 }
      );
    }

    const existing = await prisma.liveApplication.findFirst({
      where: { userId, status: { in: ["PENDING", "APPROVED"] } },
      orderBy: { createdAt: "desc" },
    });

    if (existing) {
      return NextResponse.json(
        {
          error: "You already have an active application.",
          application: existing,
          hostApproved: existing.status === "APPROVED",
          applicationStatus: existing.status,
          requirements,
        },
        { status: 409 }
      );
    }

    const application = await prisma.liveApplication.create({
      data: {
        userId,
        status: "PENDING",
        faceImageBase64: body?.faceImageBase64 ?? null,
      },
    });

    // optional notification
    try {
      await prisma.notification.create({
        data: {
          userId,
          type: "LIVE_APPLICATION_SUBMITTED",
          title: "Verification request submitted",
          body: "We received your verification request. Please wait for review.",
        },
      });
    } catch (err) {
      console.error("Create submit notification error:", err);
    }

    return NextResponse.json(
      {
        application,
        hostApproved: false,
        applicationStatus: "PENDING",
        requirements,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Create live application error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/profile/live-application?userId=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = (searchParams.get("userId") ?? "").trim();

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const application = await prisma.liveApplication.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const applicationStatus = (application?.status as any) ?? "NONE";
    const hostApproved = user.role === "HOST" || applicationStatus === "APPROVED";

    return NextResponse.json(
      {
        application: application ?? null,
        applicationStatus,
        hostApproved,
        requirements: getRequirements(user),
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Get live application error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
