import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET() {
  const categories = await prisma.storeCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json({ categories });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const name = String(body?.name ?? "").trim();
    const slug = slugify(String(body?.slug ?? name));
    const icon = body?.icon ? String(body.icon) : null;
    const isActive = Boolean(body?.isActive ?? true);
    const sortOrder = Number(body?.sortOrder ?? 0) || 0;

    if (!name) throw new Error("name is required");
    if (!slug) throw new Error("slug is required");

    const created = await prisma.storeCategory.create({
      data: { name, slug, icon, isActive, sortOrder },
    });

    return NextResponse.json({ ok: true, id: created.id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Error" }, { status: 400 });
  }
}
