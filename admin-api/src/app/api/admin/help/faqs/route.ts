// admin-api/src/app/api/admin/help/faqs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AppLanguage } from "@prisma/client";

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

function pageParams(sp: URLSearchParams) {
  const page = Math.max(1, Number(sp.get("page") ?? 1));
  const limit = Math.min(100, Math.max(5, Number(sp.get("limit") ?? 20)));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lang = parseLang(searchParams.get("lang"));
    const categoryId = searchParams.get("categoryId") ?? "";
    const { page, limit, skip } = pageParams(searchParams);

    if (!categoryId) {
      return NextResponse.json({ items: [], page, limit, total: 0, totalPages: 1 });
    }

    const where = { categoryId };
    const total = await prisma.helpFaq.count({ where });

    const faqs = await prisma.helpFaq.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      skip,
      take: limit,
      include: {
        translations: {
          where: { language: { in: [lang, AppLanguage.EN] } },
        },
      },
    });

    const items = faqs.map((f) => {
      const tLang = f.translations.find((x) => x.language === lang);
      const tEn = f.translations.find((x) => x.language === AppLanguage.EN);
      const tr = tLang ?? tEn ?? f.translations[0];
      return {
        id: f.id,
        categoryId: f.categoryId,
        isActive: f.isActive,
        sortOrder: f.sortOrder,
        question: tr?.question ?? "",
        answer: tr?.answer ?? "",
      };
    });

    return NextResponse.json({
      items,
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (e) {
    console.error("admin/help/faqs GET error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    const lang = parseLang(body?.lang ?? "en");
    const categoryId = String(body?.categoryId ?? "");
    const question = String(body?.question ?? "").trim();
    const answer = String(body?.answer ?? "");
    const isActive = body?.isActive !== false;
    const sortOrderInput = Number(body?.sortOrder ?? 0);

    if (!categoryId) return NextResponse.json({ error: "categoryId required" }, { status: 400 });
    if (!question) return NextResponse.json({ error: "question required" }, { status: 400 });

    let sortOrder = Number.isFinite(sortOrderInput) && sortOrderInput > 0 ? sortOrderInput : 0;

    if (!sortOrder) {
      const max = await prisma.helpFaq.aggregate({
        where: { categoryId },
        _max: { sortOrder: true },
      });
      sortOrder = (max._max.sortOrder ?? 0) + 1;
    }

    const faq = await prisma.helpFaq.create({
      data: {
        categoryId,
        sortOrder,
        isActive,
        translations: {
          create: {
            language: lang,
            question,
            answer,
          },
        },
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, id: faq.id });
  } catch (e) {
    console.error("admin/help/faqs POST error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
