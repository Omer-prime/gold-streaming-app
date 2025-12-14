// admin-api/src/app/api/topics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TopicCategory, type Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

/**
 * GET /api/topics?category=DAILY|OFFICIAL|NORMAL|ALL&includeInactive=1&q=...
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const rawCategory = (searchParams.get("category") ?? "ALL").toUpperCase();
    const includeInactive = (searchParams.get("includeInactive") ?? "0") === "1";
    const q = (searchParams.get("q") ?? "").trim();

    const where: Prisma.TopicWhereInput = {};

    if (!includeInactive) {
      where.isActive = true;
    }

    if (rawCategory !== "ALL") {
      const isValid = Object.values(TopicCategory).includes(rawCategory as TopicCategory);
      if (isValid) where.category = rawCategory as TopicCategory;
    }

    if (q.length > 0) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    const topics = await prisma.topic.findMany({
      where,
      orderBy: [{ isTrending: "desc" }, { hotScore: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        description: true,
        isTrending: true,
        isActive: true,
        category: true,
        sortOrder: true,
        hotScore: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      topics: topics.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        hotCount: t.hotScore,
        category: t.category,
        isTrending: t.isTrending,
        isActive: t.isActive,
        sortOrder: t.sortOrder,
        updatedAt: t.updatedAt,
      })),
    });
  } catch (error) {
    console.error("[GET /api/topics]", error);
    return NextResponse.json({ error: "Failed to load topics" }, { status: 500 });
  }
}

/**
 * POST /api/topics
 * Body: { id?, title, description?, category?, isTrending?, isActive?, sortOrder?, hotScore? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const {
      id,
      title,
      description,
      category,
      isTrending,
      isActive,
      sortOrder,
      hotScore,
    }: {
      id?: string;
      title?: string;
      description?: string | null;
      category?: TopicCategory | string;
      isTrending?: boolean;
      isActive?: boolean;
      sortOrder?: number;
      hotScore?: number;
    } = body;

    const safeCategory =
      typeof category === "string" && Object.values(TopicCategory).includes(category as TopicCategory)
        ? (category as TopicCategory)
        : undefined;

    if (!id && (!title || title.trim().length === 0)) {
      return NextResponse.json({ error: "title is required for create" }, { status: 400 });
    }

    if (id) {
      const updated = await prisma.topic.update({
        where: { id },
        data: {
          title: typeof title === "string" ? title : undefined,
          description: description ?? undefined,
          category: safeCategory ?? undefined,
          isTrending: typeof isTrending === "boolean" ? isTrending : undefined,
          isActive: typeof isActive === "boolean" ? isActive : undefined,
          sortOrder: typeof sortOrder === "number" && !isNaN(sortOrder) ? sortOrder : undefined,
          hotScore: typeof hotScore === "number" && !isNaN(hotScore) ? hotScore : undefined,
        },
      });
      return NextResponse.json({ topic: updated });
    }

    const created = await prisma.topic.create({
      data: {
        title: title!.trim(),
        description: description ?? null,
        category: safeCategory ?? TopicCategory.NORMAL,
        isTrending: !!isTrending,
        isActive: typeof isActive === "boolean" ? isActive : true,
        sortOrder: typeof sortOrder === "number" && !isNaN(sortOrder) ? sortOrder : 0,
        hotScore: typeof hotScore === "number" && !isNaN(hotScore) ? hotScore : 0,
      },
    });

    return NextResponse.json({ topic: created }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/topics]", error);
    return NextResponse.json({ error: "Failed to save topic" }, { status: 500 });
  }
}
