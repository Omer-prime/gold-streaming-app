// admin-api/src/app/api/feed/home/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

/**
 * GET /api/feed/home
 *
 * Query params:
 * - userId?: string
 * - tab?: "following" | "square" | "video"
 * - country?: string // "PK", "PH", "all", "popular"
 * - limit?: number // default 20, max 50
 * - cursor?: string // for pagination
 * - topicId?: string // filter moments by topic (Square)
 * - q?: string // search (Square + Video)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const userId = searchParams.get("userId") ?? undefined;
    const rawTab = (searchParams.get("tab") ?? "following").toLowerCase();
    const countryRaw = (searchParams.get("country") ?? "all").trim().toLowerCase();
    const countryCode = countryRaw.toUpperCase();


    const tab: "following" | "square" | "video" =
      rawTab === "square" || rawTab === "video" ? (rawTab as any) : "following";

    const countryParam = searchParams.get("country") ?? "all";
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));
    const cursor = searchParams.get("cursor") ?? undefined;

    const topicId = searchParams.get("topicId") ?? undefined;
    const q = (searchParams.get("q") ?? "").trim();

    /* ---------------------------------------------------------------------- */
    /*  FOLLOWING TAB: live rooms of hosts I follow                           */
    /* ---------------------------------------------------------------------- */
    if (tab === "following") {
      if (!userId) return NextResponse.json({ items: [], nextCursor: null });

      const hostWhere: Prisma.UserWhereInput = {
        followers: {
          some: { followerId: userId },
        },
      };

      if (countryParam && countryParam.toLowerCase() !== "all" && countryParam.toLowerCase() !== "popular") {
        hostWhere.country = { code: countryParam };
      }

      const whereStream: Prisma.StreamWhereInput = {
        isLive: true,
        host: hostWhere,
      };

      const streams = await prisma.stream.findMany({
        where: whereStream,
        orderBy: [{ viewers: "desc" }, { startedAt: "desc" }, { createdAt: "desc" }],
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        skip: cursor ? 1 : undefined,
        select: {
          id: true,
          title: true,
          viewers: true,
          thumbnailUrl: true,
          hostId: true,
          host: {
            select: {
              nickname: true,
              username: true,
              avatarUrl: true,
              country: { select: { flagEmoji: true, code: true } },
            },
          },
        },
      });

      let nextCursor: string | null = null;
      let data = streams;

      if (streams.length > limit) {
        const next = streams[streams.length - 1];
        nextCursor = next.id;
        data = streams.slice(0, limit);
      }

      const items = data.map((s) => ({
        streamId: s.id,
        hostId: s.hostId,
        roomTitle: s.title || s.host.nickname || s.host.username,
        tag: "Talent",
        viewers: s.viewers,
        countryFlag: s.host.country?.flagEmoji ?? null,
        countryCode: s.host.country?.code ?? null,
        thumbnailUrl: s.thumbnailUrl,
        hostAvatarUrl: s.host.avatarUrl ?? null,
      }));

      return NextResponse.json({ items, nextCursor });
    }

    /* ---------------------------------------------------------------------- */
    /*  SQUARE / VIDEO TABS: moments feed                                     */
    /* ---------------------------------------------------------------------- */

    const isVideoTab = tab === "video";

    const and: Prisma.MomentWhereInput[] = [];

    if (isVideoTab) {
      and.push({ type: "VIDEO", videoUrl: { not: null } });
    } else {
      and.push({ OR: [{ type: "TEXT" }, { type: "IMAGE" }] });
    }

    if (countryRaw !== "all" && countryRaw !== "popular") {
      and.push({
        user: { country: { code: countryCode } },
      });
    }

    if (!isVideoTab && topicId) {
      and.push({ topicId });
    }

    if (q.length > 0) {
      and.push({
        OR: [
          { text: { contains: q, mode: "insensitive" } },
          { topic: { title: { contains: q, mode: "insensitive" } } },
          {
            user: {
              OR: [
                { username: { contains: q, mode: "insensitive" } },
                { nickname: { contains: q, mode: "insensitive" } },
              ],
            },
          },
        ],
      });
    }

    const whereMoment: Prisma.MomentWhereInput = and.length > 0 ? { AND: and } : {};

    const moments = await prisma.moment.findMany({
      where: whereMoment,
      orderBy: [{ createdAt: "desc" }, { likeCount: "desc" }],
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : undefined,
      select: {
        id: true,
        text: true,
        imageUrl: true,
        videoUrl: true,
        thumbnailUrl: true,
        type: true,
        likeCount: true,
        commentCount: true,
        shareCount: true,
        saveCount: true,
        createdAt: true,
        topic: { select: { id: true, title: true } },
        user: {
          select: {
            id: true,
            username: true,
            nickname: true,
            avatarUrl: true,
            country: { select: { flagEmoji: true, code: true } },
          },
        },
      },
    });

    let nextCursor: string | null = null;
    let data = moments;

    if (moments.length > limit) {
      const next = moments[moments.length - 1];
      nextCursor = next.id;
      data = moments.slice(0, limit);
    }

    // liked ids
    let likedIds = new Set<string>();
    if (userId && data.length > 0) {
      const likes = await prisma.momentLike.findMany({
        where: { userId, momentId: { in: data.map((m) => m.id) } },
        select: { momentId: true },
      });
      likedIds = new Set(likes.map((l) => l.momentId));
    }

    // comments preview (only useful for square)
    const items = await Promise.all(
      data.map(async (m) => {
        let commentsPreview: { id: string; text: string; userName: string }[] = [];

        if (!isVideoTab) {
          try {
            const cmts = await prisma.momentComment.findMany({
              where: { momentId: m.id },
              orderBy: { createdAt: "asc" },
              take: 2,
              include: { user: { select: { username: true, nickname: true } } },
            });

            commentsPreview = cmts.map((c) => ({
              id: c.id,
              text: c.content,
              userName: c.user.nickname && c.user.nickname.trim().length > 0 ? c.user.nickname : c.user.username,
            }));
          } catch {
            commentsPreview = [];
          }
        }

        return {
          id: m.id,
          userId: m.user.id,
          userName: m.user.nickname || m.user.username,
          avatarUrl: m.user.avatarUrl,
          countryFlag: m.user.country?.flagEmoji ?? null,
          countryCode: m.user.country?.code ?? null,
          text: m.text,
          imageUrl: m.imageUrl,
          videoUrl: m.videoUrl,
          thumbnailUrl: m.thumbnailUrl,
          likeCount: m.likeCount,
          commentCount: m.commentCount,
          shareCount: m.shareCount,
          saveCount: m.saveCount,
          topicTitle: m.topic?.title ?? null,
          createdAt: m.createdAt.toISOString(),
          isLikedByMe: likedIds.has(m.id),
          commentsPreview,
        };
      })
    );

    // Square tab also returns topics (admin controlled) — only when not searching and not inside a topic page
    if (!isVideoTab) {
      const shouldReturnTopics = q.length === 0 && !topicId;

      const topics = shouldReturnTopics
        ? await prisma.topic.findMany({
          where: { isActive: true },
          orderBy: [{ isTrending: "desc" }, { hotScore: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
          take: 10,
          select: { id: true, title: true, hotScore: true, category: true },
        })
        : [];

      const topicDtos = topics.map((t) => ({
        id: t.id,
        title: t.title,
        hotCount: t.hotScore,
        category: t.category,
      }));

      return NextResponse.json({ topics: topicDtos, items, nextCursor });
    }

    return NextResponse.json({ items, nextCursor });
  } catch (error) {
    console.error("[GET /api/feed/home]", error);
    return NextResponse.json({ error: "Failed to load home feed" }, { status: 500 });
  }
}
