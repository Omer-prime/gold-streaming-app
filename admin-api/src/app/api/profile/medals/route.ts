import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type IconKind = "IONICON" | "IMAGE_URL";

function iconKind(icon?: string | null): IconKind {
  if (!icon) return "IONICON";
  return icon.startsWith("http://") || icon.startsWith("https://") ? "IMAGE_URL" : "IONICON";
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ message: "userId is required" }, { status: 400 });
    }

    const now = new Date();

    const [user, likesAgg, dbMedals] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          nickname: true,
          avatarUrl: true,
          level: true,
          exp: true,
          vipTier: true,
          vipExpiresAt: true,
          vipLevel: true,
          liveLevel: true,
          followersCount: true,
        },
      }),
      prisma.moment.aggregate({
        where: { userId },
        _sum: { likeCount: true },
      }),

      // OPTIONAL: DB medals (HonorItemType.MEDAL) + obtained (UserHonor)
      prisma.honorItem.findMany({
        where: { type: "MEDAL", isActive: true },
        orderBy: [{ name: "asc" }],
        include: {
          userHonors: {
            where: { userId },
            select: { obtainedAt: true },
          },
        },
      }),
    ]);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const totalLikes = likesAgg._sum.likeCount ?? 0;

    // --- Computed medals (match your mobile UI) ---
    const computed = [
      {
        key: "vip_normal",
        title: "Normal VIP",
        icon: "star-outline",
        iconKind: "IONICON" as const,
        obtained: user.vipTier !== "NONE" && !!user.vipExpiresAt && user.vipExpiresAt > now,
        progress: null as null | { current: number; target: number },
      },
      {
        key: "wealth_lv5",
        title: "Wealth Lv.5",
        icon: "diamond-outline",
        iconKind: "IONICON" as const,
        obtained: (user.vipLevel ?? 0) >= 5,
        progress: { current: user.vipLevel ?? 0, target: 5 },
      },
      {
        key: "livestream_lv5",
        title: "Livestream Lv.5",
        icon: "radio-outline",
        iconKind: "IONICON" as const,
        obtained: (user.liveLevel ?? 0) >= 5,
        progress: { current: user.liveLevel ?? 0, target: 5 },
      },
      {
        key: "live_star_lv1",
        title: "Live Star Lv.1",
        icon: "musical-notes-outline",
        iconKind: "IONICON" as const,
        obtained: (user.level ?? 1) >= 1,
        progress: { current: user.level ?? 1, target: 1 },
      },
      {
        key: "fans_10k",
        title: "10K Fans",
        icon: "heart-outline",
        iconKind: "IONICON" as const,
        obtained: (user.followersCount ?? 0) >= 10000,
        progress: { current: user.followersCount ?? 0, target: 10000 },
      },
      {
        key: "likes_10k",
        title: "10K Likes",
        icon: "thumbs-up-outline",
        iconKind: "IONICON" as const,
        obtained: totalLikes >= 10000,
        progress: { current: totalLikes, target: 10000 },
      },
    ];

    // --- DB medals (optional) ---
    const dbMapped = dbMedals.map((m) => ({
      key: `db_${m.id}`,
      title: m.name,
      icon: m.iconUrl ?? "ribbon-outline",
      iconKind: iconKind(m.iconUrl),
      obtained: m.userHonors.length > 0,
      obtainedAt: m.userHonors[0]?.obtainedAt ?? null,
      progress: null as null | { current: number; target: number },
      description: m.description ?? null,
    }));

    // Merge: keep computed first, then add DB medals that don't duplicate title
    const seenTitles = new Set(computed.map((x) => x.title.toLowerCase()));
    const merged = [
      ...computed.map((x) => ({ ...x, obtainedAt: null, description: null })),
      ...dbMapped.filter((x) => !seenTitles.has(x.title.toLowerCase())),
    ];

    const obtainedCount = merged.filter((m) => m.obtained).length;

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        level: user.level,
      },
      summary: {
        obtainedCount,
        total: merged.length,
        totalLikes,
        followersCount: user.followersCount ?? 0,
      },
      medals: merged,
    });
  } catch (e: any) {
    return NextResponse.json(
      { message: "Server error", detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
