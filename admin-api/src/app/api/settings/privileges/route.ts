// admin-api/src/app/api/settings/privileges/route.ts
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
      invisibleVisitor: settings?.invisibleVisitor ?? false,
      mysteryLive: settings?.mysteryLive ?? false,
      mysteryRank: settings?.mysteryRank ?? false,
      invisibleOnline: settings?.invisibleOnline ?? false,
      exclusiveEmail: settings?.exclusiveEmail ?? false,
      hideLiveLevel: settings?.hideLiveLevel ?? false,
    });
  } catch (error) {
    console.error("[GET /api/settings/privileges]", error);
    return NextResponse.json(
      { error: "Failed to load privilege settings" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      invisibleVisitor,
      mysteryLive,
      mysteryRank,
      invisibleOnline,
      exclusiveEmail,
      hideLiveLevel,
    } = body ?? {};

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const settings = await getOrCreateUserSettings(String(userId));

    await prisma.userSettings.update({
      where: { id: settings.id },
      data: {
        invisibleVisitor: !!invisibleVisitor,
        mysteryLive: !!mysteryLive,
        mysteryRank: !!mysteryRank,
        invisibleOnline: !!invisibleOnline,
        exclusiveEmail: !!exclusiveEmail,
        hideLiveLevel: !!hideLiveLevel,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST /api/settings/privileges]", error);
    return NextResponse.json(
      { error: "Failed to update privilege settings" },
      { status: 500 }
    );
  }
}
