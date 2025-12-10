// admin-api/src/app/api/feed/party/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const db = prisma as any;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const rawTab = (searchParams.get("tab") || "party").toLowerCase();
    const tab: "following" | "party" =
      rawTab === "following" ? "following" : "party";

    const userId = searchParams.get("userId") || undefined;

    const countryParam = (searchParams.get("country") || "all").toUpperCase();
    const limitParam = searchParams.get("limit");

    let limit = 30;
    if (limitParam) {
      const parsed = Number(limitParam);
      if (!Number.isNaN(parsed) && parsed > 0 && parsed <= 100) {
        limit = parsed;
      }
    }

    if (tab === "following" && !userId) {
      return NextResponse.json(
        { error: "userId is required for tab=following" },
        { status: 400 }
      );
    }

    const where: any = {
      isLive: true,
      mode: "PARTY",
    };

    // Filter by host country if given (PK, PH, etc.)
    if (countryParam && countryParam !== "ALL") {
      where.host = {
        ...(where.host || {}),
        country: {
          code: countryParam,
        },
      };
    }

    // Following tab → only hosts the user follows
    if (tab === "following" && userId) {
      where.host = {
        ...(where.host || {}),
        followers: {
          some: {
            followerId: userId,
          },
        },
      };
    }

    const streams = await db.stream.findMany({
      where,
      orderBy: [
        { viewers: "desc" },
        { createdAt: "desc" },
      ],
      take: limit,
      include: {
        host: {
          select: {
            id: true,
            nickname: true,
            username: true,
            avatarUrl: true,
            country: {
              select: {
                code: true,
                flagEmoji: true,
              },
            },
          },
        },
      },
    });

    const items = streams.map((s: any) => ({
      streamId: s.id,
      hostId: s.hostId,
      roomTitle: s.title,
      tag: s.tag || "Party",
      viewers: s.viewers ?? 0,
      countryCode: s.host?.country?.code ?? null,
      countryFlag: s.host?.country?.flagEmoji ?? null,
      thumbnailUrl: s.thumbnailUrl ?? null,
    }));

    return NextResponse.json({
      items,
      nextCursor: null, // you can add real cursor later
    });
  } catch (error) {
    console.error("[GET /api/feed/party]", error);
    return NextResponse.json(
      { error: "Failed to load party rooms" },
      { status: 500 }
    );
  }
}
