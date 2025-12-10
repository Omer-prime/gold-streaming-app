// admin-api/src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signAuthToken } from "@/lib/auth";
import { sendAppEmail } from "@/lib/email";

function computeProfileCompleted(user: {
  nickname: string | null;
  dateOfBirth: Date | null;
  gender: string | null;
  countryId: number | null;
}) {
  const pieces = [
    Boolean(user.nickname && user.nickname.trim()),
    Boolean(user.dateOfBirth),
    Boolean(user.gender),
    Boolean(user.countryId),
  ];

  return pieces.every(Boolean);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { identifier, password } = body ?? {};

    if (typeof identifier !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { error: "identifier and password are required" },
        { status: 400 }
      );
    }

    // normalize inputs (avoid trailing spaces etc.)
    identifier = identifier.trim();
    password = password.trim();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "identifier and password are required" },
        { status: 400 }
      );
    }

    const isEmail = identifier.includes("@");

    // 1) Find user by username OR email (email case-insensitive-ish)
    let user = await prisma.user.findFirst({
      where: isEmail
        ? {
            OR: [
              { email: identifier },
              { email: identifier.toLowerCase() },
            ],
          }
        : {
            username: identifier,
          },
    });

    // 2) DEV ONLY: auto-create admin/admin123 if not found
    if (
      !user &&
      process.env.NODE_ENV !== "production" &&
      identifier === "admin" &&
      password === "admin123"
    ) {
      const passwordHash = await bcrypt.hash(password, 10);

      user = await prisma.user.create({
        data: {
          username: "admin",
          email: "admin@example.com",
          passwordHash,
          role: "ADMIN",
          wallet: {
            create: {
              balance: 0,
            },
          },
        },
      });

      console.log(
        "[POST /api/auth/login] Dev admin auto-created: admin / admin123"
      );
    }

    // 3) If still no user or no password hash → invalid
    if (!user) {
      console.log("[LOGIN] No user for identifier:", identifier);
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (!user.passwordHash) {
      console.log(
        "[LOGIN] User has no passwordHash (maybe social-login only):",
        user.id
      );
      return NextResponse.json(
        {
          error:
            "This account does not have a password set. Please register or contact support.",
        },
        { status: 401 }
      );
    }

    // 4) Check password
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      console.log("[LOGIN] Password mismatch for user:", user.id);
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 5) Compute if profile is completed
    const profileCompleted = computeProfileCompleted({
      nickname: user.nickname ?? null,
      dateOfBirth: user.dateOfBirth ?? null,
      gender: (user.gender as any) ?? null,
      countryId: user.countryId ?? null,
    });

    const token = signAuthToken({ sub: user.id, role: user.role });

    // 🔔 Send login notification email (best-effort)
    if (user.email) {
      const displayName = user.nickname || user.username || "there";
      try {
        await sendAppEmail({
          to: user.email,
          subject: "New login to your Gold Live account",
          html: `
          <p>Hi ${displayName},</p>
          <p>There was a new login to your Gold Live account.</p>
          <p>If this wasn't you, please change your password immediately.</p>
          <p style="margin-top:16px;">— Gold Live Team</p>
        `,
        });
      } catch (e) {
        console.warn("[LOGIN] Failed sending login email:", e);
      }
    }

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        profileCompleted,
      },
      token,
    });
  } catch (error) {
    console.error("[POST /api/auth/login]", error);
    return NextResponse.json(
      { error: "Failed to login" },
      { status: 500 }
    );
  }
}
