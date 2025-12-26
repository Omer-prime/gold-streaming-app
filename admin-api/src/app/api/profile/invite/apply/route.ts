import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = { userId?: string; code?: string };

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as Body | null;
    const userId = body?.userId;
    const code = (body?.code || "").trim().toUpperCase();

    if (!userId || !code) {
      return NextResponse.json({ error: "userId & code required" }, { status: 400 });
    }

    const codeRow = await prisma.inviteCode.findUnique({
      where: { code },
      select: { userId: true },
    });

    if (!codeRow) {
      return NextResponse.json({ error: "Invalid code" }, { status: 404 });
    }

    if (codeRow.userId === userId) {
      return NextResponse.json({ error: "You cannot invite yourself" }, { status: 400 });
    }

    // prevent multiple inviter
    const existing = await prisma.invite.findFirst({
      where: { inviteeId: userId },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json({ ok: true, alreadyApplied: true });
    }

    await prisma.invite.create({
      data: {
        inviterId: codeRow.userId,
        inviteeId: userId,
        code,
        status: "REGISTERED",
      },
    });

    // optional: store on User too (for quick ref)
    await prisma.user.update({
      where: { id: userId },
      data: { inviterCode: code },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[POST /api/profile/invite/apply]", e);
    return NextResponse.json({ error: "Failed to apply code" }, { status: 500 });
  }
}
