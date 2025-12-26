import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_PACKAGES = [
  { id: "p1", coins: 100, price: 1.99, currency: "USD", title: "Starter" },
  { id: "p2", coins: 550, price: 9.99, currency: "USD", title: "Value Pack" },
  { id: "p3", coins: 1200, price: 19.99, currency: "USD", title: "Popular" },
  { id: "p4", coins: 2500, price: 39.99, currency: "USD", title: "Mega" },
];

export async function GET() {
  // later: fetch from DB (admin configurable)
  return NextResponse.json({ packages: DEFAULT_PACKAGES });
}
