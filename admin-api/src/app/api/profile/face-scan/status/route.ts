import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET /api/profile/face-scan/status?userId=...
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId")?.trim();

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, faceVerifiedAt: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ✅ If user is verified => return APPROVED (prevents showing scan screen again)
    if (user.faceVerifiedAt) {
      const iso = user.faceVerifiedAt.toISOString();
      return NextResponse.json(
        {
          exists: true,
          status: "APPROVED",
          applicationId: "verified",
          createdAt: iso,
          updatedAt: iso,
          hasImage: true,
        },
        { status: 200 }
      );
    }

    // Otherwise check latest application
    const latest = await prisma.liveApplication.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        faceImageBase64: true,
      },
    });

    if (!latest) {
      return NextResponse.json({ exists: false, status: "NONE" }, { status: 200 });
    }

    return NextResponse.json(
      {
        exists: true,
        status: latest.status,
        applicationId: latest.id,
        createdAt: latest.createdAt.toISOString(),
        updatedAt: latest.updatedAt.toISOString(),
        hasImage: !!latest.faceImageBase64,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Face scan status API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
