// src/app/api/streams/explore/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const countryCode = searchParams.get("country") ?? undefined; // e.g. "PK", "PH"
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.min(parseInt(limitParam, 10) || 20, 50) : 20;

    const where: any = {
      isLive: true,
    };

    if (countryCode) {
      where.host = {
        country: {
          code: countryCode,
        },
      };
    }

    const streams = await prisma.stream.findMany({
      where,
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
                name: true,
                flagEmoji: true,
              },
            },
          },
        },
      },
      orderBy: { viewers: "desc" },
      take: limit,
    });

    const data = streams.map((s) => {
      const host = s.host;
      const country = host.country;

      // naive category – later you can store on Stream or decide rule
      const category =
        s.mode === "PK"
          ? "PK Battle"
          : s.mode === "PARTY"
          ? "Party Chat"
          : "Chatting";

      return {
        id: s.id,
        title: s.title,
        thumbnailUrl: s.thumbnailUrl,
        viewers: s.viewers,
        mode: s.mode,
        category,
        host: {
          id: host.id,
          name: host.nickname || host.username,
          avatarUrl: host.avatarUrl,
          countryCode: country?.code ?? null,
          countryName: country?.name ?? null,
          flagEmoji: country?.flagEmoji ?? null,
        },
      };
    });

    return NextResponse.json({ streams: data }, { status: 200 });
  } catch (err) {
    console.error("explore streams error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
