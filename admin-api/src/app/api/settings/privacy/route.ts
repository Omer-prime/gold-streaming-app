// admin-api/src/app/api/settings/privacy/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUserSettings } from "@/lib/userSettings";

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

    const settings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    return NextResponse.json({
      hideMicStatus: settings?.hideMicStatus ?? false,
    });
  } catch (error) {
    console.error("[GET /api/settings/privacy]", error);
    return NextResponse.json(
      { error: "Failed to load privacy settings" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, hideMicStatus } = body ?? {};

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const settings = await getOrCreateUserSettings(String(userId));

    await prisma.userSettings.update({
      where: { id: settings.id },
      data: { hideMicStatus: !!hideMicStatus },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST /api/settings/privacy]", error);
    return NextResponse.json(
      { error: "Failed to update privacy settings" },
      { status: 500 }
    );
  }
}
