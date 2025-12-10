import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signAuthToken } from "@/lib/auth";
import { sendAppEmail } from "@/lib/email";

async function generateUniqueUsernameFromEmail(email: string) {
  const local = email.split("@")[0] || "user";
  const base = local.toLowerCase().replace(/[^a-z0-9]+/g, "") || "user";

  let attempt = 0;
  // Try base, base1, base2, ... until free
  // (very unlikely to loop many times)
  while (true) {
    const candidate =
      attempt === 0 ? base : `${base}${attempt}`;
    const exists = await prisma.user.findUnique({
      where: { username: candidate },
    });
    if (!exists) return candidate;
    attempt += 1;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body ?? {};

    if (!email || !password) {
      return NextResponse.json(
        { error: "email and password are required" },
        { status: 400 }
      );
    }

    // ensure email unique
    const existingByEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingByEmail) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const username = await generateUniqueUsernameFromEmail(email);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        role: "USER",
        wallet: {
          create: {
            balance: 0,
          },
        },
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    const token = signAuthToken({ sub: user.id, role: user.role });

    // 🎉 Welcome email
    if (user.email) {
      await sendAppEmail({
        to: user.email,
        subject: "Welcome to Gold Live",
        html: `
          <p>Hi ${user.username},</p>
          <p>Welcome to <strong>Gold Live</strong>! Your account has been created successfully.</p>
          <p>Next step: complete your profile inside the app so others can know you better.</p>
          <p style="margin-top:16px;">— Gold Live Team</p>
        `,
      });
    }

    return NextResponse.json(
      {
        user: {
          ...user,
          profileCompleted: false, // new users must complete profile
        },
        token,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/auth/register]", error);
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 }
    );
  }
}
