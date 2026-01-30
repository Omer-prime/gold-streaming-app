import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export const OTP_EXPIRES_MIN = Number(process.env.OTP_EXPIRES_MIN ?? 10) || 10;
export const OTP_RESEND_COOLDOWN_SEC =
  Number(process.env.OTP_RESEND_COOLDOWN_SEC ?? 60) || 60;

function secret() {
  const s = (process.env.BIND_CODE_SECRET ?? "").trim();
  if (!s) throw new Error("BIND_CODE_SECRET is missing");
  return s;
}

export function genCode6() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function hashCode(code: string) {
  return crypto.createHmac("sha256", secret()).update(code).digest("hex");
}

export async function canSendAgain(userId: string, channel: "EMAIL" | "PHONE") {
  const last = await prisma.verificationCode.findFirst({
    where: { userId, channel, consumedAt: null },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  if (!last) return true;
  const diffSec = (Date.now() - last.createdAt.getTime()) / 1000;
  return diffSec >= OTP_RESEND_COOLDOWN_SEC;
}
