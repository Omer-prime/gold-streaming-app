// src/app/api/admin/countries/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma"; // <- relative import from src/app/api/admin/countries

export const dynamic = "force-dynamic";

// GET  /api/admin/countries  -> full list for admin
export async function GET() {
  try {
    const countries = await prisma.country.findMany({
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ countries });
  } catch (error) {
    console.error("[GET /api/admin/countries]", error);
    return NextResponse.json(
      { error: "Failed to load countries" },
      { status: 500 }
    );
  }
}

// POST /api/admin/countries  -> create new
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { code, name, flagEmoji, sortOrder, isActive } = body ?? {};

    if (!code || !name) {
      return NextResponse.json(
        { error: "code and name are required" },
        { status: 400 }
      );
    }

    const country = await prisma.country.create({
      data: {
        code,
        name,
        flagEmoji: flagEmoji ?? null,
        sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
        isActive: typeof isActive === "boolean" ? isActive : true,
      },
    });

    return NextResponse.json({ country }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/countries]", error);
    return NextResponse.json(
      { error: "Failed to create country" },
      { status: 500 }
    );
  }
}
