import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function requireUserId(req: NextRequest) {
  const userId = (req.nextUrl.searchParams.get("userId") || "").trim();
  if (!userId) throw new Error("userId is required");
  return userId;
}

function toAbsolute(origin: string, url?: string | null) {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${origin}${path}`;
}

export async function GET(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    const now = new Date();
    const origin = req.nextUrl.origin;

    // ✅ ensure user exists
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!user) throw new Error("User not found");

    const categorySlug = (req.nextUrl.searchParams.get("category") || "").trim().toLowerCase();

    const categories = await prisma.storeCategory.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { id: true, name: true, slug: true, icon: true },
    });

    // Resolve which items to show:
    // - category=popular => featured items
    // - category=<slug>  => items in that category
    // - empty => first category (if exists), else featured
    let whereItems: any = {
      isActive: true,
      category: { isActive: true }, // ✅ important
    };

    if (categorySlug === "popular") {
      whereItems.isFeatured = true;
    } else if (categorySlug) {
      const cat = categories.find((c) => c.slug === categorySlug);
      if (cat) whereItems.categoryId = cat.id;
      else whereItems.isFeatured = true;
    } else {
      if (categories[0]?.id) whereItems.categoryId = categories[0].id;
      else whereItems.isFeatured = true;
    }

    const items = await prisma.storeItem.findMany({
      where: whereItems,
      orderBy: [{ sectionSortOrder: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        description: true,
        priceCoins: true,
        section: true,
        sectionSortOrder: true,
        mediaType: true,
        mediaUrl: true,
        thumbnailUrl: true,
        isFeatured: true,
        type: true,
        durationDays: true,
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    // wallet balance
    const wallet = await prisma.wallet.upsert({
      where: { userId },
      update: {},
      create: { userId, balance: 0 },
      select: { balance: true },
    });

    // owned items
    const owned = await prisma.userStoreItem.findMany({
      where: {
        userId,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      select: { itemId: true, expiresAt: true },
    });

    const ownedMap = new Map<string, { expiresAt: string | null }>();
    for (const o of owned) ownedMap.set(o.itemId, { expiresAt: o.expiresAt ? o.expiresAt.toISOString() : null });

    // group into sections
    const map = new Map<string, any[]>();
    for (const it of items) {
      const key = (it.section || "Items").trim() || "Items";
      if (!map.has(key)) map.set(key, []);

      const ownedInfo = ownedMap.get(it.id);

      map.get(key)!.push({
        id: it.id,
        title: it.title,
        description: it.description,
        priceCoins: it.priceCoins,
        mediaType: it.mediaType,
        mediaUrl: it.mediaUrl,
        thumbnailUrl: it.thumbnailUrl,

        // optional “absolute” URLs (helps some clients)
        mediaUrlFull: toAbsolute(origin, it.mediaUrl),
        thumbnailUrlFull: toAbsolute(origin, it.thumbnailUrl),

        type: it.type,
        durationDays: it.durationDays,
        category: it.category,

        isOwned: !!ownedInfo,
        ownedExpiresAt: ownedInfo?.expiresAt ?? null,
      });
    }

    const sections = Array.from(map.entries()).map(([title, list]) => ({ title, items: list }));

    return NextResponse.json({
      meta: {
        now: now.toISOString(),
        origin,
        totalCategories: categories.length,
        totalItems: items.length,
      },
      categories,
      sections,
      wallet,
      ownedItemIds: owned.map((x) => x.itemId),
      owned, // includes expiresAt
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Error" }, { status: 400 });
  }
}
