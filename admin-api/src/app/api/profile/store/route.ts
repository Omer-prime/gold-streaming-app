import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function requireUserId(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) throw new Error("userId is required");
  return userId;
}

export async function GET(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    const now = new Date();

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
    let whereItems: any = { isActive: true };
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
      orderBy: [
        { sectionSortOrder: "asc" },
        { sortOrder: "asc" },
        { createdAt: "desc" },
      ],
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

    // group into sections (like your UI)
    const map = new Map<string, any[]>();
    for (const it of items) {
      const key = (it.section || "Items").trim() || "Items";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push({
        id: it.id,
        title: it.title,
        priceCoins: it.priceCoins,
        mediaUrl: it.mediaUrl,
        thumbnailUrl: it.thumbnailUrl,
        type: it.type,
        durationDays: it.durationDays,
        category: it.category,
      });
    }

    const sections = Array.from(map.entries()).map(([title, list]) => ({ title, items: list }));

    return NextResponse.json({
      meta: {
        now: now.toISOString(),
        totalCategories: categories.length,
        totalItems: items.length,
      },
      categories,
      sections,
      wallet,
      ownedItemIds: owned.map((x) => x.itemId),
      owned: owned, // optional (has expiresAt)
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Error" }, { status: 400 });
  }
}
