// admin-api/src/app/api/admin/help/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AppLanguage, HelpCategoryKey } from "@prisma/client";

export const runtime = "nodejs";

function parseLang(raw: string | null): AppLanguage {
  const v = (raw ?? "en").trim();
  const map: Record<string, AppLanguage> = {
    system: AppLanguage.EN,
    en: AppLanguage.EN,
    "zh-Hant": AppLanguage.ZH_HANT,
    "zh-hant": AppLanguage.ZH_HANT,
    vi: AppLanguage.VI,
    hi: AppLanguage.HI,
    id: AppLanguage.ID,
    ar: AppLanguage.AR,
    ur: AppLanguage.UR,
    pt: AppLanguage.PT,
    tr: AppLanguage.TR,
    bn: AppLanguage.BN,
    th: AppLanguage.TH,
    ne: AppLanguage.NE,
    fr: AppLanguage.FR,
    es: AppLanguage.ES,
  };
  return map[v] ?? AppLanguage.EN;
}

async function ensureDefaultCategories() {
  const defaults: Array<{ key: HelpCategoryKey; enTitle: string; sortOrder: number }> = [
    { key: HelpCategoryKey.FREQUENT, enTitle: "Frequent", sortOrder: 1 },
    { key: HelpCategoryKey.LIVESTREAM, enTitle: "Livestream", sortOrder: 2 },
    { key: HelpCategoryKey.RECHARGE, enTitle: "Recharge", sortOrder: 3 },
    { key: HelpCategoryKey.REPORT, enTitle: "Report", sortOrder: 4 },
    { key: HelpCategoryKey.ACCOUNT, enTitle: "Account", sortOrder: 5 },
  ];

  for (const d of defaults) {
    const cat = await prisma.helpCategory.upsert({
      where: { key: d.key },
      create: {
        key: d.key,
        isActive: true,
        sortOrder: d.sortOrder,
      },
      update: {
        // keep sort stable if already exists
        sortOrder: d.sortOrder,
      },
      select: { id: true },
    });

    await prisma.helpCategoryTranslation.upsert({
      where: { categoryId_language: { categoryId: cat.id, language: AppLanguage.EN } },
      create: { categoryId: cat.id, language: AppLanguage.EN, title: d.enTitle },
      update: { title: d.enTitle },
    });
  }
}

export async function GET(req: NextRequest) {
  try {
    await ensureDefaultCategories();

    const { searchParams } = new URL(req.url);
    const lang = parseLang(searchParams.get("lang"));

    const cats = await prisma.helpCategory.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: {
        translations: {
          where: { language: { in: [lang, AppLanguage.EN] } },
        },
      },
    });

    const data = cats.map((c) => {
      const tLang = c.translations.find((x) => x.language === lang);
      const tEn = c.translations.find((x) => x.language === AppLanguage.EN);
      return {
        id: c.id,
        key: c.key,
        title: tLang?.title ?? tEn?.title ?? c.key,
        sortOrder: c.sortOrder,
        isActive: c.isActive,
      };
    });

    return NextResponse.json(data);
  } catch (e) {
    console.error("admin/help/categories error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
