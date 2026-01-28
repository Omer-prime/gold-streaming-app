import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function requireUserId(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) throw new Error("userId is required");
  return userId;
}

export async function GET(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    const now = new Date();

    const plans = await prisma.guardianPlan.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: {
        packages: {
          where: { isActive: true },
          orderBy: [{ durationMonths: "asc" }, { sortOrder: "asc" }],
        },
        planPrivileges: {
          orderBy: [{ sortOrder: "asc" }],
          include: { privilege: true },
        },
      },
    });

    const myGuardianBond = await prisma.guardianBond.findFirst({
      where: { guardedId: userId, status: "ACTIVE", endsAt: { gt: now } },
      orderBy: [{ endsAt: "desc" }],
      include: {
        guardian: { select: { id: true, username: true, nickname: true, avatarUrl: true } },
        plan: true,
        package: true,
      },
    });

    const myGuardingBonds = await prisma.guardianBond.findMany({
      where: { guardianId: userId, status: "ACTIVE", endsAt: { gt: now } },
      orderBy: [{ endsAt: "desc" }],
      include: {
        guarded: { select: { id: true, username: true, nickname: true, avatarUrl: true } },
        plan: true,
        package: true,
      },
    });

    const shapedPlans = plans.map((p) => ({
      id: p.id,
      tier: p.tier,
      name: p.name,
      description: p.description ?? "",
      packages: p.packages.map((x) => ({
        id: x.id,
        label: x.label,
        durationMonths: x.durationMonths,
        priceCoins: x.priceCoins,
      })),
      privileges: p.planPrivileges.map((l) => ({
        key: l.privilege.key,
        label: l.privilege.label,
        value: l.valueOverride ?? l.privilege.defaultValue ?? "",
        locked: l.locked,
        icon: l.privilege.icon ?? null,
      })),
    }));

    return NextResponse.json({
      plans: shapedPlans,
      myGuardian: myGuardianBond
        ? {
            id: myGuardianBond.id,
            tier: myGuardianBond.tier,
            startedAt: myGuardianBond.startedAt,
            endsAt: myGuardianBond.endsAt,
            guardian: myGuardianBond.guardian,
            plan: {
              id: myGuardianBond.planId,
              name: myGuardianBond.plan.name,
            },
            package: {
              id: myGuardianBond.packageId,
              label: myGuardianBond.package.label,
              durationMonths: myGuardianBond.package.durationMonths,
              priceCoins: myGuardianBond.package.priceCoins,
            },
          }
        : null,
      myGuarding: myGuardingBonds.map((b) => ({
        id: b.id,
        tier: b.tier,
        startedAt: b.startedAt,
        endsAt: b.endsAt,
        guarded: b.guarded,
        plan: { id: b.planId, name: b.plan.name },
        package: {
          id: b.packageId,
          label: b.package.label,
          durationMonths: b.package.durationMonths,
          priceCoins: b.package.priceCoins,
        },
      })),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Error" }, { status: 400 });
  }
}
