// admin-api/src/app/api/profile/face-scan/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    const userId = body?.userId as string | undefined;
    const imageBase64 = body?.imageBase64 as string | undefined;

    if (!userId || !imageBase64) {
      return NextResponse.json(
        { error: "userId and imageBase64 are required" },
        { status: 400 }
      );
    }

    // 1) Make sure user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // 2) Find latest PENDING application or create a new one
    const existingPending = await prisma.liveApplication.findFirst({
      where: {
        userId,
        status: "PENDING",
      },
      orderBy: { createdAt: "desc" },
    });

    let application;
    if (existingPending) {
      application = await prisma.liveApplication.update({
        where: { id: existingPending.id },
        data: {
          faceImageBase64: imageBase64,
        },
      });
    } else {
      application = await prisma.liveApplication.create({
        data: {
          userId,
          status: "PENDING",
          faceImageBase64: imageBase64,
        },
      });
    }

    return NextResponse.json(
      {
        ok: true,
        application,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Face scan API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
