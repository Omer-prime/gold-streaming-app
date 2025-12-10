// admin-api/src/app/api/settings/language/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUserSettings } from "@/lib/userSettings";

const ALLOWED_LANGUAGES = [
  "system",
  "en",
  "zh-Hant",
  "vi",
  "hi",
  "id",
  "ar",
  "ur",
  "pt",
  "tr",
  "bn",
  "th",
  "ne",
  "fr",
  "es",
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const settings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    return NextResponse.json({
      language: settings?.language ?? "system",
    });
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

    const langCode = String(language);
    if (!ALLOWED_LANGUAGES.includes(langCode)) {
      return NextResponse.json(
        { error: "Unsupported language" },
        { status: 400 }
      );
    }

    const settings = await getOrCreateUserSettings(String(userId));

    const updated = await prisma.userSettings.update({
      where: { id: settings.id },
      data: { language: langCode },
    });

    return NextResponse.json({ language: updated.language });
  } catch (error) {
    console.error("[POST /api/settings/language]", error);
    return NextResponse.json(
      { error: "Failed to update language" },
      { status: 500 }
    );
  }
}
