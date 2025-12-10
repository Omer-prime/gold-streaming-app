// src/app/api/settings/notifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUserSettings } from "@/lib/userSettings";

export const dynamic = "force-dynamic";

// GET /api/settings/notifications?userId=...
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

    // make sure row exists
    const settings = await getOrCreateUserSettings(String(userId));

    return NextResponse.json({
      notifyLiveAlerts: settings.notifyLiveAlerts,
      notifyMessages: settings.notifyMessages,
      notifySound: settings.notifySound,
      notifyVibrate: settings.notifyVibrate,
      allowFromMutual: settings.allowFromMutual,
      allowFromFollowing: settings.allowFromFollowing,
      allowFromStrangers: settings.allowFromStrangers,
    });
  } catch (error) {
    console.error("[GET /api/settings/notifications]", error);
    return NextResponse.json(
      { error: "Failed to load notification settings" },
      { status: 500 }
    );
  }
}

// POST /api/settings/notifications
// Body: { userId, notifyLiveAlerts?, notifyMessages?, notifySound?, ... }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    const userId = body?.userId as string | undefined;
    const {
      notifyLiveAlerts,
      notifyMessages,
      notifySound,
      notifyVibrate,
      allowFromMutual,
      allowFromFollowing,
      allowFromStrangers,
    } = body ?? {};

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const current = await getOrCreateUserSettings(String(userId));

    const data: Record<string, boolean> = {
      notifyLiveAlerts:
        typeof notifyLiveAlerts === "boolean"
          ? notifyLiveAlerts
          : current.notifyLiveAlerts,
      notifyMessages:
        typeof notifyMessages === "boolean"
          ? notifyMessages
          : current.notifyMessages,
      notifySound:
        typeof notifySound === "boolean" ? notifySound : current.notifySound,
      notifyVibrate:
        typeof notifyVibrate === "boolean"
          ? notifyVibrate
          : current.notifyVibrate,
      allowFromMutual:
        typeof allowFromMutual === "boolean"
          ? allowFromMutual
          : current.allowFromMutual,
      allowFromFollowing:
        typeof allowFromFollowing === "boolean"
          ? allowFromFollowing
          : current.allowFromFollowing,
      allowFromStrangers:
        typeof allowFromStrangers === "boolean"
          ? allowFromStrangers
          : current.allowFromStrangers,
    };

    const updated = await prisma.userSettings.update({
      where: { id: current.id },
      data,
    });

    return NextResponse.json(
      {
        notifyLiveAlerts: updated.notifyLiveAlerts,
        notifyMessages: updated.notifyMessages,
        notifySound: updated.notifySound,
        notifyVibrate: updated.notifyVibrate,
        allowFromMutual: updated.allowFromMutual,
        allowFromFollowing: updated.allowFromFollowing,
        allowFromStrangers: updated.allowFromStrangers,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[POST /api/settings/notifications]", error);
    return NextResponse.json(
      { error: "Failed to update notification settings" },
      { status: 500 }
    );
  }
}
