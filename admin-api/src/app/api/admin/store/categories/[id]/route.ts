import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function PATCH(req: NextRequest, ctx: { params: { id: string } }) {
  try {
    const id = ctx.params.id;
    const body = await req.json().catch(() => null);

    const name = String(body?.name ?? "").trim();
    const slug = slugify(String(body?.slug ?? name));
    const icon = body?.icon ? String(body.icon) : null;
    const isActive = Boolean(body?.isActive ?? true);
    const sortOrder = Number(body?.sortOrder ?? 0) || 0;

    if (!name) throw new Error("name is required");
    if (!slug) throw new Error("slug is required");

    const updated = await prisma.storeCategory.update({
      where: { id },
      data: { name, slug, icon, isActive, sortOrder },
    });

    return NextResponse.json({ ok: true, category: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Error" }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, ctx: { params: { id: string } }) {
  try {
    const id = ctx.params.id;
    await prisma.storeCategory.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Error" }, { status: 400 });
  }
}
