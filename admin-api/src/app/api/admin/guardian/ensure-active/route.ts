// admin-api/src/app/api/admin/guardian/ensure-active/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function createDefaultPlan(tier: "SILVER" | "GOLD" | "DIAMOND", sortOrder: number) {
  return prisma.guardianPlan.create({
    data: {
      tier,
      name: `Guardian of ${tier.charAt(0) + tier.slice(1).toLowerCase()}`,
      description: "",
      isActive: true,
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
}

export async function POST() {
  try {
    const now = new Date();

    const totalPlans = await prisma.guardianPlan.count();

    let created = 0;
    let enabledOne = false;

    // If no plans exist at all, seed defaults
    if (totalPlans === 0) {
      await prisma.$transaction(async () => {
        await createDefaultPlan("SILVER", 0);
        await createDefaultPlan("GOLD", 1);
        await createDefaultPlan("DIAMOND", 2);
      });
      created = 3;
    }

    // If plans exist but none active, activate the first one (safe minimal fix)
    const activePlansCount = await prisma.guardianPlan.count({ where: { isActive: true } });
    if (activePlansCount === 0) {
      const first = await prisma.guardianPlan.findFirst({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: { id: true },
      });

      if (first) {
        await prisma.guardianPlan.update({
          where: { id: first.id },
          data: { isActive: true },
        });
        enabledOne = true;
      }
    }

    // Ensure packages for active plans are active (common reason for “empty packages”)
    await prisma.guardianPlanPackage.updateMany({
      where: { plan: { isActive: true } },
      data: { isActive: true },
    });

    const [totalPlansAfter, activePlansAfter, activePackagesAfter] = await Promise.all([
      prisma.guardianPlan.count(),
      prisma.guardianPlan.count({ where: { isActive: true } }),
      prisma.guardianPlanPackage.count({ where: { isActive: true, plan: { isActive: true } } }),
    ]);

    return NextResponse.json({
      ok: true,
      at: now.toISOString(),
      created,
      enabledOne,
      meta: {
        totalPlans: totalPlansAfter,
        activePlans: activePlansAfter,
        activePackages: activePackagesAfter,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Error" }, { status: 400 });
  }
}
