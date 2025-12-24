import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const userId = req.headers.get("x-user-id"); // replace with your auth user id
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const app = await prisma.resellerApplication.findUnique({ where: { userId } });
  return NextResponse.json({ application: app });
}

export async function POST(req: Request) {
  const userId = req.headers.get("x-user-id");
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.resellerApplication.findUnique({ where: { userId } });
  if (existing) return NextResponse.json({ application: existing });

  const created = await prisma.resellerApplication.create({
    data: { userId, status: "PENDING" },
  });
  return NextResponse.json({ application: created }, { status: 201 });
}
