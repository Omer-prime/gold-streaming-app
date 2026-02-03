// admin-api/src/app/api/admin/help/faqs/[id]/route.ts
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

export async function PUT(req: NextRequest, ctx: { params: { id: string } }) {
  try {
    const id = ctx.params.id;
    const body = await req.json().catch(() => null);

    const lang = parseLang(body?.lang ?? "en");
    const question = String(body?.question ?? "").trim();
    const answer = String(body?.answer ?? "");
    const sortOrder = Number(body?.sortOrder ?? 0);
    const isActive = body?.isActive;

    if (!question) return NextResponse.json({ error: "question required" }, { status: 400 });

    const exists = await prisma.helpFaq.findUnique({ where: { id }, select: { id: true } });
    if (!exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.$transaction([
      prisma.helpFaq.update({
        where: { id },
        data: {
          ...(Number.isFinite(sortOrder) ? { sortOrder } : {}),
          ...(typeof isActive === "boolean" ? { isActive } : {}),
        },
      }),
      prisma.helpFaqTranslation.upsert({
        where: { faqId_language: { faqId: id, language: lang } },
        create: { faqId: id, language: lang, question, answer },
        update: { question, answer },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("admin/help/faqs PUT error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
