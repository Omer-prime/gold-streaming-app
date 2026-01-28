import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const plans = await prisma.guardianPlan.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      packages: { orderBy: [{ durationMonths: "asc" }, { sortOrder: "asc" }] },
      planPrivileges: { orderBy: [{ sortOrder: "asc" }], include: { privilege: true } },
    },
  });
  return NextResponse.json({ plans });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const tier = body?.tier;
    const name = String(body?.name ?? "").trim();
    const isActive = Boolean(body?.isActive ?? true);
    const sortOrder = Number(body?.sortOrder ?? 0) || 0;

    if (!tier) throw new Error("tier is required");
    if (!name) throw new Error("name is required");

    const created = await prisma.guardianPlan.create({
      data: {
        tier,
        name,
        isActive,
        sortOrder,
        packages: {
          create: [
            { label: "1 Month", durationMonths: 1, priceCoins: 0, isActive: true, sortOrder: 0 },
            { label: "3 Months", durationMonths: 3, priceCoins: 0, isActive: true, sortOrder: 1 },
            { label: "6 Months", durationMonths: 6, priceCoins: 0, isActive: true, sortOrder: 2 },
            { label: "12 Months", durationMonths: 12, priceCoins: 0, isActive: true, sortOrder: 3 },
          ],
        },
      },
    });

    return NextResponse.json({ ok: true, id: created.id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Error" }, { status: 400 });
  }
}
