// src/app/api/countries/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/countries  -> public list for the app
export async function GET() {
  try {
    const countries = await prisma.country.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        code: true,
        name: true,
        flagEmoji: true,
      },
    });

    return NextResponse.json({ countries });
  } catch (error) {
    console.error("[GET /api/countries]", error);
    return NextResponse.json(
      { error: "Failed to load countries" },
      { status: 500 }
    );
  }
}
