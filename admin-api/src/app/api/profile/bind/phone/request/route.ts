import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OTP_EXPIRES_MIN, canSendAgain, genCode6, hashCode } from "../../../../../lib/otp";
import { sendSmsOtp } from "../../../../../lib/sms";

export const runtime = "nodejs";

function normalizePhoneE164(countryCode: string, phone: string) {
  const cc = countryCode.trim();
  const num = phone.replace(/[^\d]/g, "");
  if (!cc.startsWith("+")) throw new Error("countryCode must start with +");
  if (num.length < 7) throw new Error("phone is too short");
  return `${cc}${num}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const userId = String(body?.userId ?? "");
    const countryCode = String(body?.countryCode ?? "+92");
    const phone = String(body?.phone ?? "");

    if (!userId) throw new Error("userId is required");

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!user) throw new Error("User not found");

    const okCooldown = await canSendAgain(userId, "PHONE");
    if (!okCooldown) throw new Error("Please wait before requesting another code");

    const phoneE164 = normalizePhoneE164(countryCode, phone);

    const code = genCode6();
    const expiresAt = new Date(Date.now() + OTP_EXPIRES_MIN * 60_000);

    await prisma.verificationCode.create({
      data: {
        userId,
        channel: "PHONE",
        destination: phoneE164,
        codeHash: hashCode(code),
        expiresAt,
      },
    });

    await sendSmsOtp(phoneE164, code);

    return NextResponse.json({
      ok: true,
      phoneE164,
      expiresAt: expiresAt.toISOString(),
      // dev helper if SMS_DEV_MODE=true
      devCode: String(process.env.SMS_DEV_MODE ?? "false") === "true" ? code : undefined,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Error" }, { status: 400 });
  }
}
