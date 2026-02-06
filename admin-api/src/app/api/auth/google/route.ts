import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "@/lib/prisma";
import { signAuthToken } from "@/lib/auth";



export const runtime = "nodejs";

function safeUsernameFromEmail(email: string) {
  const local = email.split("@")[0] || "user";
  return local.toLowerCase().replace(/[^a-z0-9]+/g, "") || "user";
}

async function generateUniqueUsername(base: string) {
  let attempt = 0;
  while (true) {
    const candidate = attempt === 0 ? base : `${base}${attempt}`;
    const exists = await prisma.user.findUnique({ where: { username: candidate } });
    if (!exists) return candidate;
    attempt += 1;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();

    if (typeof idToken !== "string" || !idToken.trim()) {
      return NextResponse.json({ error: "idToken is required" }, { status: 400 });
    }

    const allowed = (process.env.GOOGLE_ALLOWED_CLIENT_IDS ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (!allowed.length) {
      return NextResponse.json(
        { error: "Server is missing GOOGLE_ALLOWED_CLIENT_IDS" },
        { status: 500 }
      );
    }

    const client = new OAuth2Client();
    const ticket = await client.verifyIdToken({
      idToken,
      audience: allowed,
    });

    const payload = ticket.getPayload();
    const email = payload?.email;
    const emailVerified = payload?.email_verified;

    if (!email || !emailVerified) {
      return NextResponse.json(
        { error: "Google account email not verified." },
        { status: 401 }
      );
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      const base = safeUsernameFromEmail(email);
      const username = await generateUniqueUsername(base);

      user = await prisma.user.create({
        data: {
          username,
          email,
          passwordHash: null, // social login user
          role: "USER",
          wallet: { create: { balance: 0 } },
        },
      });
    }

    const token = signAuthToken({ sub: user.id, role: user.role });

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        profileCompleted: true, // or compute like you do in admin login
      },
      token,
    });
  } catch (e) {
    console.error("[POST /api/auth/google]", e);
    return NextResponse.json({ error: "Google login failed" }, { status: 500 });
  }
}
