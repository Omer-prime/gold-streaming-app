// src/app/api/gifts/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/gifts  -> active gifts for the app
export async function GET() {
  try {
    const gifts = await prisma.gift.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" },
      select: {
        id: true,
        name: true,
        iconUrl: true,
        price: true,
      },
    });

    return NextResponse.json({ gifts });
  } catch (error) {
    console.error("[GET /api/gifts]", error);
    return NextResponse.json(
      { error: "Failed to load gifts" },
      { status: 500 }
    );
  }
}
