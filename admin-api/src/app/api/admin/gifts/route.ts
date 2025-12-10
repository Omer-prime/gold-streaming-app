// src/app/api/admin/gifts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/admin/gifts  -> list all gifts for admin
export async function GET() {
  try {
    const gifts = await prisma.gift.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ gifts });
  } catch (error) {
    console.error("[GET /api/admin/gifts]", error);
    return NextResponse.json(
      { error: "Failed to load gifts" },
      { status: 500 }
    );
  }
}

// POST /api/admin/gifts  -> create new gift
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { name, iconUrl, price, isActive } = body ?? {};

    if (!name || typeof price !== "number" || Number.isNaN(price)) {
      return NextResponse.json(
        { error: "name and price are required" },
        { status: 400 }
      );
    }

    const gift = await prisma.gift.create({
      data: {
        name: String(name),
        iconUrl: iconUrl ? String(iconUrl) : null,
        price: Math.max(0, Math.floor(price)), // coins
        isActive: typeof isActive === "boolean" ? isActive : true,
      },
    });

    return NextResponse.json({ gift }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/gifts]", error);
    return NextResponse.json(
      { error: "Failed to create gift" },
      { status: 500 }
    );
  }
}
