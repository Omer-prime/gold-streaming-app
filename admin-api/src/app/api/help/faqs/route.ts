import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function toCategoryKey(slug: string) {
  // "frequent" -> "FREQUENT"
  return slug.trim().toUpperCase();
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") ?? "";
    const lang = (searchParams.get("lang") ?? "en").toLowerCase();

    if (!category) {
      return NextResponse.json({ items: [] });
    }

    const catKey = toCategoryKey(category);

    const cat = await prisma.helpCategory.findFirst({
      where: { key: catKey as any, isActive: true },
      select: { id: true },
    });

    if (!cat) return NextResponse.json({ items: [] });

    const faqs = await prisma.helpFaq.findMany({
      where: { categoryId: cat.id, isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: { translations: true },
    });

    const items = faqs.map((f) => {
      const tLang = f.translations.find((x) => x.language === (lang as any));
      const tEn = f.translations.find((x) => x.language === ("EN" as any));
      const tr = tLang ?? tEn ?? f.translations[0];

      return {
        id: f.id,
        categoryId: f.categoryId,
        question: tr?.question ?? "",
        answer: tr?.answer ?? "",
      };
    });

    return NextResponse.json({ items });
  } catch (e) {
    console.error("help/faqs error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
