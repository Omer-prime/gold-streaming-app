// admin-api/src/app/api/settings/language/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUserSettings } from "@/lib/userSettings";
import { AppLanguage } from "@prisma/client";

// codes used by mobile + API
type LangCode =
  | "system"
  | "en"
  | "zh-Hant"
  | "vi"
  | "hi"
  | "id"
  | "ar"
  | "ur"
  | "pt"
  | "tr"
  | "bn"
  | "th"
  | "ne"
  | "fr"
  | "es";

const CODE_TO_ENUM: Record<LangCode, AppLanguage> = {
  system: AppLanguage.SYSTEM,
  en: AppLanguage.EN,
  "zh-Hant": AppLanguage.ZH_HANT,
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

const ENUM_TO_CODE: Record<AppLanguage, LangCode> = {
  [AppLanguage.SYSTEM]: "system",
  [AppLanguage.EN]: "en",
  [AppLanguage.ZH_HANT]: "zh-Hant",
  [AppLanguage.VI]: "vi",
  [AppLanguage.HI]: "hi",
  [AppLanguage.ID]: "id",
  [AppLanguage.AR]: "ar",
  [AppLanguage.UR]: "ur",
  [AppLanguage.PT]: "pt",
  [AppLanguage.TR]: "tr",
  [AppLanguage.BN]: "bn",
  [AppLanguage.TH]: "th",
  [AppLanguage.NE]: "ne",
  [AppLanguage.FR]: "fr",
  [AppLanguage.ES]: "es",
};

function parseLangCode(v: unknown): LangCode | null {
  const s = String(v ?? "");
  return (Object.keys(CODE_TO_ENUM) as LangCode[]).includes(s as LangCode)
    ? (s as LangCode)
    : null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const settings = await prisma.userSettings.findUnique({ where: { userId } });

    const code =
      settings?.language ? ENUM_TO_CODE[settings.language] : "system";

    return NextResponse.json({ language: code });
  } catch (error) {
    console.error("[GET /api/settings/language]", error);
    return NextResponse.json(
      { error: "Failed to load language" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, language } = body ?? {};

    if (!userId || !language) {
      return NextResponse.json(
        { error: "userId and language are required" },
        { status: 400 }
      );
    }

    const code = parseLangCode(language);
    if (!code) {
      return NextResponse.json({ error: "Unsupported language" }, { status: 400 });
    }

    const settings = await getOrCreateUserSettings(String(userId));

    const updated = await prisma.userSettings.update({
      where: { id: settings.id },
      data: { language: CODE_TO_ENUM[code] }, // ✅ Prisma enum
    });

    return NextResponse.json({ language: ENUM_TO_CODE[updated.language] });
  } catch (error) {
    console.error("[POST /api/settings/language]", error);
    return NextResponse.json(
      { error: "Failed to update language" },
      { status: 500 }
    );
  }
}
