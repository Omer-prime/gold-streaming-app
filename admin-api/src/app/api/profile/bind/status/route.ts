import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function requireUserId(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) throw new Error("userId is required");
  return userId;
}

export async function GET(req: NextRequest) {
  try {
    const userId = requireUserId(req);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        phoneNumber: true,
        facebookId: true,
        instagramId: true,
        tiktokId: true,
        googleId: true,
      },
    });

    if (!user) throw new Error("User not found");

    return NextResponse.json({ ok: true, ...user });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Error" }, { status: 400 });
  }
}
