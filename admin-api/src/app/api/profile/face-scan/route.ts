// admin-api/src/app/api/profile/face-scan/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function stripDataUrl(b64: string) {
  const idx = b64.indexOf("base64,");
  return idx >= 0 ? b64.slice(idx + "base64,".length) : b64;
}

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

    // simple sanity check (optional)
    if (imageBase64.length < 1000) {
      return NextResponse.json({ error: "Invalid image data." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

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

    // ✅ MARK user as face-verified (your requirements check uses faceVerifiedAt)
    await prisma.user.update({
      where: { id: userId },
      data: { faceVerifiedAt: new Date() },
    });

    return NextResponse.json({ ok: true, application }, { status: 200 });
  } catch (err) {
    console.error("Face scan API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
