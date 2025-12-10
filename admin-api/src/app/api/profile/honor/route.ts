import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId query param is required" },
        { status: 400 }
      );
    }

    const [tagCount, medalCount, giftCount, vehicleCount] = await Promise.all([
      prisma.userHonor.count({
        where: { userId, item: { type: "TAG" } },
      }),
      prisma.userHonor.count({
        where: { userId, item: { type: "MEDAL" } },
      }),
      prisma.userHonor.count({
        where: { userId, item: { type: "GIFT" } },
      }),
      prisma.userHonor.count({
        where: { userId, item: { type: "VEHICLE" } },
      }),
    ]);

    return NextResponse.json({
      userId,
      tagCount,
      medalCount,
      giftCount,
      vehicleCount,
    });
  } catch (error) {
    console.error("[GET /api/profile/honor]", error);
    return NextResponse.json(
      { error: "Failed to load honor wall" },
      { status: 500 }
    );
  }
}
