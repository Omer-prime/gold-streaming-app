// admin-api/src/app/api/profile/devices/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const db = prisma as any;

/**
 * GET /api/profile/devices?userId=...
 * Returns all devices for this user (latest first)
 */
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

    const devices = await db.userDevice.findMany({
      where: { userId },
      orderBy: { lastActiveAt: "desc" },
      select: {
        id: true,
        deviceId: true,
        deviceName: true,
        platform: true,
        isTrusted: true,
        lastActiveAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ devices });
  } catch (error) {
    console.error("[GET /api/profile/devices]", error);
    return NextResponse.json(
      { error: "Failed to load devices" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/profile/devices
 * Upserts the current device for this user.
 *
 * Body:
 * {
 *   userId: string;
 *   deviceId: string; // client-generated
 *   deviceName?: string;
 *   platform?: string;
 *   isTrusted?: boolean;
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, deviceId, deviceName, platform, isTrusted } = body ?? {};

    if (!userId || !deviceId) {
      return NextResponse.json(
        { error: "userId and deviceId are required" },
        { status: 400 }
      );
    }

    const now = new Date();

    const device = await db.userDevice.upsert({
      where: {
        userId_deviceId: {
          userId,
          deviceId,
        },
      },
      update: {
        deviceName: typeof deviceName === "string" ? deviceName : undefined,
        platform: typeof platform === "string" ? platform : undefined,
        lastActiveAt: now,
        ...(typeof isTrusted === "boolean" ? { isTrusted } : {}),
      },
      create: {
        userId,
        deviceId,
        deviceName: typeof deviceName === "string" ? deviceName : null,
        platform: typeof platform === "string" ? platform : null,
        isTrusted: typeof isTrusted === "boolean" ? isTrusted : true,
        lastActiveAt: now,
      },
      select: {
        id: true,
        deviceId: true,
        deviceName: true,
        platform: true,
        isTrusted: true,
        lastActiveAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ device });
  } catch (error) {
    console.error("[POST /api/profile/devices]", error);
    return NextResponse.json(
      { error: "Failed to update device info" },
      { status: 500 }
    );
  }
}
