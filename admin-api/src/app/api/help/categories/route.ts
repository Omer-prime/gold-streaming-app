import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lang = (searchParams.get("lang") ?? "en").toLowerCase();

    const cats = await prisma.helpCategory.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: { translations: true },
    });

    const items = cats.map((c) => {
      const tLang = c.translations.find((x) => x.language === (lang as any));
      const tEn = c.translations.find((x) => x.language === ("EN" as any));
      const name = tLang?.title ?? tEn?.title ?? c.key;
      return {
        id: c.id,
        name,
        slug: String(c.key).toLowerCase(),
      };
    });

    return NextResponse.json({ items });
  } catch (e) {
    console.error("help/categories error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
