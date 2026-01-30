import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashCode } from "../../../../../lib/otp";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const userId = String(body?.userId ?? "");
    const phoneE164 = String(body?.phoneE164 ?? "").trim();
    const code = String(body?.code ?? "").trim();

    if (!userId) throw new Error("userId is required");
    if (!phoneE164) throw new Error("phoneE164 is required");
    if (!code) throw new Error("code is required");

    const now = new Date();

    const record = await prisma.verificationCode.findFirst({
      where: {
        userId,
        channel: "PHONE",
        destination: phoneE164,
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

    await prisma.$transaction([
      prisma.verificationCode.update({
        where: { id: record.id },
        data: { consumedAt: now },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { phoneNumber: phoneE164 },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Error" }, { status: 400 });
  }
}
