import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, ctx: { params: { id: string } }) {
  try {
    const id = ctx.params.id;
    const body = await req.json().catch(() => null);
    const replyText = String(body?.replyText ?? "");

    if (!replyText.trim()) return NextResponse.json({ error: "replyText required" }, { status: 400 });

    const exists = await prisma.helpFeedback.findUnique({ where: { id }, select: { id: true } });
    if (!exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.helpFeedback.update({
      where: { id },
      data: {
        replyText: replyText.trim(),
        repliedAt: new Date(),
        status: "REPLIED",
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("admin/help/feedback reply error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
