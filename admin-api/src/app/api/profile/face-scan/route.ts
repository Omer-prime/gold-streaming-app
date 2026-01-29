import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function stripDataUrl(b64: string) {
  const idx = b64.indexOf("base64,");
  return idx >= 0 ? b64.slice(idx + "base64,".length) : b64;
}

// POST /api/profile/face-scan
// body: { userId, imageBase64 }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    const userId = (body?.userId as string | undefined)?.trim();
    let imageBase64 = body?.imageBase64 as string | undefined;

    if (!userId || !imageBase64) {
      return NextResponse.json(
        { error: "userId and imageBase64 are required" },
        { status: 400 }
      );
    }

    imageBase64 = stripDataUrl(imageBase64);

    if (imageBase64.length < 1000) {
      return NextResponse.json({ error: "Invalid image data." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, faceVerifiedAt: true },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // ✅ If already verified, do NOT create new pending request
    if (user.faceVerifiedAt) {
      return NextResponse.json(
        {
          ok: true,
          status: "APPROVED",
          applicationId: "verified",
          verifiedAt: user.faceVerifiedAt.toISOString(),
        },
        { status: 200 }
      );
    }

    // Update existing pending OR create a new one
    const existingPending = await prisma.liveApplication.findFirst({
      where: { userId, status: "PENDING" },
      orderBy: { createdAt: "desc" },
    });

    const application = existingPending
      ? await prisma.liveApplication.update({
          where: { id: existingPending.id },
          data: { faceImageBase64: imageBase64 },
        })
      : await prisma.liveApplication.create({
          data: { userId, status: "PENDING", faceImageBase64: imageBase64 },
        });

    return NextResponse.json(
      { ok: true, status: application.status, applicationId: application.id },
      { status: 200 }
    );
  } catch (err) {
    console.error("Face scan upload API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
