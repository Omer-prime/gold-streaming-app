// src/app/api/profile/complete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function slugifyNickname(nickname: string) {
  return nickname
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 12);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      userId,      // 👈 optional: existing user id
      nickname,
      dob,         // "YYYY-MM-DD"
      gender,      // "male" | "female" | "other"
      inviter,
      countryId,   // number
    } = body ?? {};

    if (!nickname || !dob || !gender || !countryId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const dateOfBirth = new Date(dob);
    if (Number.isNaN(dateOfBirth.getTime())) {
      return NextResponse.json(
        { error: "Invalid date of birth" },
        { status: 400 }
      );
    }

    const genderEnum =
      gender === "male"
        ? "MALE"
        : gender === "female"
        ? "FEMALE"
        : "OTHER";

    let user;

    if (userId) {
      // ✅ UPDATE EXISTING USER (email login / already registered)
      const existing = await prisma.user.findUnique({
        where: { id: String(userId) },
      });

      if (!existing) {
        return NextResponse.json(
          { error: "User not found for given userId" },
          { status: 404 }
        );
      }

      user = await prisma.user.update({
        where: { id: String(userId) },
        data: {
          // only generate username if they don't have one already
          username:
            existing.username ??
            `${slugifyNickname(nickname) || "user"}${Math.floor(
              1000 + Math.random() * 9000
            )}`,
          nickname,
          dateOfBirth,
          gender: genderEnum,
          inviterCode: inviter || null,
          country: {
            connect: { id: Number(countryId) },
          },
        },
        select: {
          id: true,
          username: true,
          nickname: true,
          role: true,
        },
      });
    } else {
      // ✅ CREATE NEW USER (for social login flows where user doesn't exist yet)
      const base = slugifyNickname(nickname) || "user";
      const randomSuffix = Math.floor(1000 + Math.random() * 9000); // 4 digits
      const username = `${base}${randomSuffix}`;

      user = await prisma.user.create({
        data: {
          username,
          nickname,
          dateOfBirth,
          gender: genderEnum,
          inviterCode: inviter || null,
          country: {
            connect: { id: Number(countryId) },
          },
          role: "USER",
        },
        select: {
          id: true,
          username: true,
          nickname: true,
          role: true,
        },
      });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("POST /api/profile/complete error", error);
    return NextResponse.json(
      { error: "Failed to complete profile" },
      { status: 500 }
    );
  }
}
