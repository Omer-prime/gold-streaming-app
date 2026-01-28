import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/wallet/ledger?userId=...&type=TOPUP&limit=20&cursor=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const type = searchParams.get("type"); // WalletLedgerType
    const limitRaw = searchParams.get("limit");
    const cursor = searchParams.get("cursor"); // ledger id cursor

    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const limit = Math.min(50, Math.max(5, Number(limitRaw || 20)));

    const where: any = { userId };
    if (type && type !== "ALL") where.type = type;

    const rows = await prisma.walletLedger.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
      ...(cursor
        ? {
            skip: 1,
            cursor: { id: cursor },
          }
        : {}),
      select: {
        id: true,
        createdAt: true,
        type: true,
        delta: true,
        balanceAfter: true,
        title: true,
        metaJson: true,
      },
    });

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? items[items.length - 1]?.id : null;

    return NextResponse.json({ items, nextCursor });
  } catch (e) {
    console.error("[GET /api/wallet/ledger]", e);
    return NextResponse.json({ error: "Failed to load ledger" }, { status: 500 });
  }
}
