import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashCode } from "../../../../../lib/otp";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const userId = String(body?.userId ?? "");
    const email = String(body?.email ?? "").trim().toLowerCase();
    const code = String(body?.code ?? "").trim();

    if (!userId) throw new Error("userId is required");
    if (!email) throw new Error("email is required");
    if (!code) throw new Error("code is required");

    const now = new Date();

    const record = await prisma.verificationCode.findFirst({
      where: {
        userId,
        channel: "EMAIL",
        destination: email,
        consumedAt: null,
        expiresAt: { gt: now },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!record) throw new Error("Invalid or expired code");

    if (record.attempts >= 5) throw new Error("Too many attempts. Request a new code.");

    const ok = record.codeHash === hashCode(code);
    await prisma.verificationCode.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });

    if (!ok) throw new Error("Invalid code");

    // success: mark consumed + update email
    await prisma.$transaction([
      prisma.verificationCode.update({
        where: { id: record.id },
        data: { consumedAt: now },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { email },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    // unique constraint email already in use
    const msg = String(e?.message || "Error");
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
