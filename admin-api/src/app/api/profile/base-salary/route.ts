import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const userId = req.headers.get("x-user-id");
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const amount = Number(body.amount || 0);
  const currency = String(body.currency || "USD");

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const created = await prisma.baseSalaryRequest.create({
    data: { userId, amount, currency, status: "PENDING" },
  });

  return NextResponse.json({ request: created }, { status: 201 });
}
