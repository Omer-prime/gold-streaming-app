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
      return NextResponse.json({ error: "userId and imageBase64 are required" }, { status: 400 });
    }

    imageBase64 = stripDataUrl(imageBase64);
    if (imageBase64.length < 1000) {
      return NextResponse.json({ error: "Invalid image data." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Store as data URL so RN Image can show it directly.
    // Later you can replace this with a real CDN/S3 URL without changing mobile.
    const dataUrl = `data:image/jpeg;base64,${imageBase64}`;

    await prisma.user.update({
      where: { id: userId },
      data: { liveCoverUrl: dataUrl },
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("Live cover upload error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
