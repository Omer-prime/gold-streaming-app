import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { VipTier } from "@prisma/client";

export const dynamic = "force-dynamic";

async function assertAdmin(req: NextRequest) {
  const token = req.cookies.get("gl_auth_token")?.value;
  if (!token) throw new Error("NO_TOKEN");

  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET_MISSING");

  const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
  if (payload.role !== "ADMIN") throw new Error("NOT_ADMIN");
}

function monthlyPriceFromPackages(packages: any[]): number {
  const monthly =
    packages?.find((p) => Number(p.durationMonths) === 1) ??
    packages?.find((p) => (p.label ?? "").toLowerCase().includes("month")) ??
    packages?.[0];

  return Number(monthly?.priceCoins ?? 0) || 0;
}

function mapPlanForUi(plan: any) {
  return {
    id: String(plan.id),
    tier: plan.tier,
    name: plan.name,
    description: plan.description ?? "",
    monthlyPriceCoins: monthlyPriceFromPackages(plan.packages ?? []),
    privileges: (plan.planPrivileges ?? []).map((pp: any) => ({
      key: pp?.privilege?.key ?? "",
      label: pp?.privilege?.label ?? "",
      value: pp?.valueOverride ?? pp?.privilege?.defaultValue ?? "",
      locked: Boolean(pp?.locked ?? false),
    })),
    isActive: Boolean(plan.isActive),
    sortOrder: Number(plan.sortOrder ?? 0) || 0,
  };
}

export async function GET(req: NextRequest) {
  try {
    await assertAdmin(req);

    const plans = await prisma.vipPlan.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        packages: { orderBy: { sortOrder: "asc" } },
        planPrivileges: {
          orderBy: { sortOrder: "asc" },
          include: { privilege: true },
        },
      },
    });

    return NextResponse.json({ plans: plans.map(mapPlanForUi) }, { status: 200 });
  } catch (e: any) {
    const msg = e?.message || "Unauthorized";
    return NextResponse.json(
      { error: msg },
      { status: msg === "NOT_ADMIN" ? 403 : 401 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await assertAdmin(req);

    const body = await req.json().catch(() => null);
    const tier = body?.tier as VipTier;
    const name = String(body?.name ?? "").trim();

    if (!tier || !name) {
      return NextResponse.json(
        { error: "tier and name are required" },
        { status: 400 }
      );
    }

    const monthlyPriceCoins = Number(body?.monthlyPriceCoins ?? 0) || 0;

    const created = await prisma.$transaction(async (tx) => {
      const plan = await tx.vipPlan.create({
        data: {
          tier,
          name,
          description: body?.description ?? null,
          sortOrder: Number(body?.sortOrder ?? 0) || 0,
          isActive: Boolean(body?.isActive ?? true),
        },
      });

      // create monthly package (durationMonths=1) so your UI "monthlyPriceCoins" works
      await tx.vipPlanPackage.create({
        data: {
          planId: plan.id,
          label: "Monthly",
          durationMonths: 1,
          priceCoins: monthlyPriceCoins,
          isActive: true,
          sortOrder: 0,
        },
      });

      return plan;
    });

    return NextResponse.json({ plan: created }, { status: 201 });
  } catch (e: any) {
    const msg = e?.message || "Unauthorized";
    return NextResponse.json(
      { error: msg },
      { status: msg === "NOT_ADMIN" ? 403 : 401 }
    );
  }
}
