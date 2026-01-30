import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type Provider = "facebook" | "instagram" | "tiktok" | "google";

function providerField(p: Provider) {
  if (p === "facebook") return "facebookId";
  if (p === "instagram") return "instagramId";
  if (p === "tiktok") return "tiktokId";
  return "googleId";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const userId = String(body?.userId ?? "");
    const provider = String(body?.provider ?? "") as Provider;
    const providerId = String(body?.providerId ?? "").trim();

    if (!userId) throw new Error("userId is required");
    if (!provider || !["facebook", "instagram", "tiktok", "google"].includes(provider))
      throw new Error("Invalid provider");
    if (!providerId) throw new Error("providerId is required");

    const field = providerField(provider);

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { [field]: providerId },
      select: { id: true, [field]: true },
    });

    return NextResponse.json({ ok: true, user: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Error" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const userId = String(body?.userId ?? "");
    const provider = String(body?.provider ?? "") as Provider;

    if (!userId) throw new Error("userId is required");
    if (!provider || !["facebook", "instagram", "tiktok", "google"].includes(provider))
      throw new Error("Invalid provider");

    const field = providerField(provider);

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { [field]: null },
      select: { id: true, [field]: true },
    });

    return NextResponse.json({ ok: true, user: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Error" }, { status: 400 });
  }
}
