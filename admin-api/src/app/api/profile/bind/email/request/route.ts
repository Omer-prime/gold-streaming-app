import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OTP_EXPIRES_MIN, canSendAgain, genCode6, hashCode } from "../../../../../lib/otp";
import { sendEmailOtp } from "../../../../../lib/mailer";

export const runtime = "nodejs";

function isEmail(x: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const userId = String(body?.userId ?? "");
    const email = String(body?.email ?? "").trim().toLowerCase();

    if (!userId) throw new Error("userId is required");
    if (!email || !isEmail(email)) throw new Error("Valid email is required");

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!user) throw new Error("User not found");

    const okCooldown = await canSendAgain(userId, "EMAIL");
    if (!okCooldown) throw new Error("Please wait before requesting another code");

    const code = genCode6();
    const expiresAt = new Date(Date.now() + OTP_EXPIRES_MIN * 60_000);

    await prisma.verificationCode.create({
      data: {
        userId,
        channel: "EMAIL",
        destination: email,
        codeHash: hashCode(code),
        expiresAt,
      },
    });

    await sendEmailOtp(email, code);

    return NextResponse.json({
      ok: true,
      expiresAt: expiresAt.toISOString(),
      // dev helper (optional)
      devCode: String(process.env.SMS_DEV_MODE ?? "false") === "true" ? code : undefined,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Error" }, { status: 400 });
  }
}
