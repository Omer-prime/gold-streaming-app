// admin-api/src/app/api/profile/moments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MomentType } from "@prisma/client";

export const dynamic = "force-dynamic";

/* -------------------------------------------------------------------------- */
/*  POST /api/profile/moments  – create a new moment                          */
/* -------------------------------------------------------------------------- */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    let {
      userId,
      text,
      imageUrl,
      videoUrl,
      topicId,
    }: {
      userId?: string;
      text?: string | null;
      imageUrl?: string | null;
      videoUrl?: string | null;
      topicId?: string | null;
    } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // make sure user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    let trimmedText = typeof text === "string" ? text.trim() : "";
    if (trimmedText.length > 250) {
      trimmedText = trimmedText.slice(0, 250);
    }

    const hasText = trimmedText.length > 0;
    const hasImage = typeof imageUrl === "string" && imageUrl.trim().length > 0;
    const hasVideo = typeof videoUrl === "string" && videoUrl.trim().length > 0;

    if (!hasText && !hasImage && !hasVideo) {
      return NextResponse.json(
        { error: "Text or media is required" },
        { status: 400 }
      );
    }

    let type: MomentType = MomentType.TEXT;
    if (hasVideo) type = MomentType.VIDEO;
    else if (hasImage) type = MomentType.IMAGE;

    const moment = await prisma.moment.create({
      data: {
        userId,
        type,
        text: hasText ? trimmedText : null,
        imageUrl: hasImage ? imageUrl!.trim() : null,
        videoUrl: hasVideo ? videoUrl!.trim() : null,
        // thumbnailUrl: you can fill later when you implement real uploads
        topicId: topicId && topicId.trim().length ? topicId : null,
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    return NextResponse.json({ moment });
  } catch (error) {
    console.error("[POST /api/profile/moments]", error);
    return NextResponse.json(
      { error: "Failed to post moment" },
      { status: 500 }
    );
  }
}

/* -------------------------------------------------------------------------- */
/*  GET /api/profile/moments – list moments                                   */
/*  - global feed:           GET /api/profile/moments?limit=20                */
/*  - user profile moments:  GET /api/profile/moments?userId=xxx&limit=20     */
/* -------------------------------------------------------------------------- */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || undefined;

    const limitParam = searchParams.get("limit") ?? "50";
    let limit = parseInt(limitParam, 10);
    if (isNaN(limit) || limit <= 0) limit = 50;
    if (limit > 100) limit = 100;

    const moments = await prisma.moment.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    return NextResponse.json({ moments });
  } catch (error) {
    console.error("[GET /api/profile/moments]", error);
    return NextResponse.json(
      { error: "Failed to load moments" },
      { status: 500 }
    );
  }
}
