// admin-api/src/app/api/settings/security/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function computeSecurityLevel(user: {
  passwordHash: string | null;
  email: string | null;
  phoneNumber: string | null;
  googleId: string | null;
  facebookId: string | null;
  instagramId: string | null;
  tiktokId: string | null;
}) {
  let score = 0;
  if (user.passwordHash) score++;
  if (user.email) score++;
  if (user.phoneNumber) score++;
  if (user.googleId || user.facebookId || user.instagramId || user.tiktokId) score++;

  let label: "Low" | "Medium" | "High" = "Low";
  if (score >= 3) label = "High";
  else if (score === 2) label = "Medium";

  return { score, label };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        passwordHash: true,
        email: true,
        phoneNumber: true,
        googleId: true,
        facebookId: true,
        instagramId: true,
        tiktokId: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { score, label } = computeSecurityLevel(user);

    return NextResponse.json({
      securityLevel: label, // "Low" | "Medium" | "High"
      score,
      hasPassword: !!user.passwordHash,
      hasEmail: !!user.email,
      hasPhone: !!user.phoneNumber,
      boundGoogle: !!user.googleId,
      boundFacebook: !!user.facebookId,
      boundInstagram: !!user.instagramId,
      boundTiktok: !!user.tiktokId,
    });
  } catch (error) {
    console.error("[GET /api/settings/security]", error);
    return NextResponse.json(
      { error: "Failed to load security settings" },
      { status: 500 }
    );
  }
}
