import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
    const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") ?? 20), 50);

    if (q.length < 2) return NextResponse.json({ users: [] });

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: q, mode: "insensitive" } },
          { nickname: { contains: q, mode: "insensitive" } },
        ],
      },
      take: limit,
      select: { id: true, username: true, nickname: true, avatarUrl: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Error" }, { status: 400 });
  }
}
