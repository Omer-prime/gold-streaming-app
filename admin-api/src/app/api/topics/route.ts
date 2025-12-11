// admin-api/src/app/api/topics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

/* -------------------------------------------------------------------------- */
/*  GET /api/topics?category=DAILY|OFFICIAL|NORMAL|ALL                        */
/* -------------------------------------------------------------------------- */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawCategory = searchParams.get("category");

    const where: Prisma.TopicWhereInput = {
      isActive: true,
    };

    // Since your schema has no TopicCategory / category field yet,
    // we just use isTrending as a simple split:
    // DAILY   -> isTrending = true
    // OFFICIAL-> isTrending = false
    if (rawCategory && rawCategory.toUpperCase() === "DAILY") {
      where.isTrending = true;
    } else if (rawCategory && rawCategory.toUpperCase() === "OFFICIAL") {
      where.isTrending = false;
    }

    const topics = await prisma.topic.findMany({
      where,
      orderBy: [
        { isTrending: "desc" },
        { sortOrder: "asc" },
        { createdAt: "desc" },
      ],
      select: {
        id: true,
        title: true,
        description: true,
        isTrending: true,
        isActive: true,
        sortOrder: true,
        hotScore: true,
      },
    });

    // derive a simple category label for the frontend
    const categoryLabel: "DAILY" | "OFFICIAL" | "NORMAL" =
      rawCategory && rawCategory.toUpperCase() === "DAILY"
        ? "DAILY"
        : rawCategory && rawCategory.toUpperCase() === "OFFICIAL"
        ? "OFFICIAL"
        : "NORMAL";

    return NextResponse.json({
      topics: topics.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        hotCount: t.hotScore,
        category: categoryLabel, // purely for UI, not from DB
        isTrending: t.isTrending,
      })),
    });
  } catch (error) {
    console.error("[GET /api/topics]", error);
    return NextResponse.json(
      { error: "Failed to load topics" },
      { status: 500 }
    );
  }
}

/* -------------------------------------------------------------------------- */
/*  POST /api/topics  (simple admin upsert)                                   */
/*  Body: { id?, title, description?, isTrending?, isActive?, sortOrder?,     */
/*          hotScore? }                                                       */
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

    const {
      id,
      title,
      description,
      isTrending,
      isActive,
      sortOrder,
      hotScore,
    } = body as {
      id?: string;
      title?: string;
      description?: string | null;
      isTrending?: boolean;
      isActive?: boolean;
      sortOrder?: number;
      hotScore?: number;
    };

    if (!title && !id) {
      return NextResponse.json(
        { error: "title is required for create" },
        { status: 400 }
      );
    }

    if (id) {
      const updated = await prisma.topic.update({
        where: { id },
        data: {
          title: title ?? undefined,
          description: description ?? undefined,
          isTrending:
            typeof isTrending === "boolean" ? isTrending : undefined,
          isActive: typeof isActive === "boolean" ? isActive : undefined,
          sortOrder:
            typeof sortOrder === "number" && !isNaN(sortOrder)
              ? sortOrder
              : undefined,
          hotScore:
            typeof hotScore === "number" && !isNaN(hotScore)
              ? hotScore
              : undefined,
        },
      });
      return NextResponse.json({ topic: updated });
    }

    const created = await prisma.topic.create({
      data: {
        title: title!,
        description: description ?? null,
        isTrending: !!isTrending,
        isActive: typeof isActive === "boolean" ? isActive : true,
        sortOrder:
          typeof sortOrder === "number" && !isNaN(sortOrder) ? sortOrder : 0,
        hotScore:
          typeof hotScore === "number" && !isNaN(hotScore) ? hotScore : 0,
      },
    });

    return NextResponse.json({ topic: created });
  } catch (error) {
    console.error("[POST /api/topics]", error);
    return NextResponse.json(
      { error: "Failed to save topic" },
      { status: 500 }
    );
  }
}
