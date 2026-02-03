import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    const userId = String(body?.userId ?? "");
    const type = String(body?.type ?? "MESSAGE_FEEDBACK");
    const category = String(body?.category ?? "GENERAL");
    const subject = body?.subject ? String(body.subject) : null;
    const message = String(body?.message ?? "");

    if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });
    if (!message.trim()) return NextResponse.json({ error: "message is required" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const row = await prisma.helpFeedback.create({
      data: {
        userId,
        type: type as any,
        category: category as any,
        subject,
        message: message.trim(),
        status: "OPEN",
      },
      select: { id: true, createdAt: true },
    });

    return NextResponse.json({ ok: true, id: row.id, createdAt: row.createdAt });
  } catch (e) {
    console.error("help/feedback POST error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
