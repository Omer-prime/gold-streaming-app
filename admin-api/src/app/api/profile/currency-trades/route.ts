import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const userId = req.headers.get("x-user-id");
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const b = await req.json();
  const fromCurrency = String(b.fromCurrency || "USD");
  const toCurrency = String(b.toCurrency || "EUR");
  const fromAmount = Number(b.fromAmount || 0);
  const rate = Number(b.rate || 0);
  const toAmount = Number(b.toAmount || 0);

  if (!fromAmount || fromAmount <= 0 || !rate || rate <= 0 || !toAmount || toAmount <= 0) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const created = await prisma.currencyTrade.create({
    data: {
      userId,
      fromCurrency,
      toCurrency,
      fromAmount,
      rate,
      toAmount,
      status: "PENDING",
    },
  });

  return NextResponse.json({ trade: created }, { status: 201 });
}
