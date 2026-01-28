import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

export const dynamic = "force-dynamic";

async function assertAdmin(req: NextRequest) {
  const token = req.cookies.get("gl_auth_token")?.value;
  if (!token) throw new Error("NO_TOKEN");

  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET_MISSING");

  const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
  if (payload.role !== "ADMIN") throw new Error("NOT_ADMIN");
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await assertAdmin(req);

    const body = await req.json().catch(() => null);
    const planId = params.id;

    const monthlyPriceCoins = Number(body?.monthlyPriceCoins ?? 0) || 0;

    const updated = await prisma.$transaction(async (tx) => {
      // 1) update plan base fields (NO monthlyPriceCoins here — not in schema)
      const plan = await tx.vipPlan.update({
        where: { id: planId },
        data: {
          name: body?.name,
          description: body?.description ?? null,
          sortOrder: Number(body?.sortOrder ?? 0) || 0,
          isActive: Boolean(body?.isActive ?? true),
        },
      });

      // 2) upsert monthly package (durationMonths=1)
      const existingMonthly = await tx.vipPlanPackage.findFirst({
        where: { planId, durationMonths: 1 },
      });

      if (existingMonthly) {
        await tx.vipPlanPackage.update({
          where: { id: existingMonthly.id },
          data: {
            priceCoins: monthlyPriceCoins,
            isActive: true,
          },
        });
      } else {
        await tx.vipPlanPackage.create({
          data: {
            planId,
            label: "Monthly",
            durationMonths: 1,
            priceCoins: monthlyPriceCoins,
            isActive: true,
            sortOrder: 0,
          },
        });
      }

      // 3) replace privileges (use planId + valueOverride per schema)
      if (Array.isArray(body?.privileges)) {
        await tx.vipPlanPrivilege.deleteMany({ where: { planId } });

        for (let i = 0; i < body.privileges.length; i++) {
          const p = body.privileges[i];
          const key = String(p?.key ?? "").trim();
          const label = String(p?.label ?? "").trim();
          if (!key || !label) continue;

          const priv = await tx.vipPrivilege.upsert({
            where: { key },
            update: { label },
            create: {
              key,
              label,
              isActive: true,
              sortOrder: i,
            },
          });

          await tx.vipPlanPrivilege.create({
            data: {
              planId,
              privilegeId: priv.id,
              sortOrder: i,
              valueOverride: p?.value ? String(p.value) : null,
              locked: Boolean(p?.locked ?? false),
            },
          });
        }
      }

      return plan;
    });

    return NextResponse.json({ plan: updated }, { status: 200 });
  } catch (e: any) {
    const msg = e?.message || "Unauthorized";
    return NextResponse.json(
      { error: msg },
      { status: msg === "NOT_ADMIN" ? 403 : 401 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await assertAdmin(req);

    const updated = await prisma.vipPlan.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return NextResponse.json({ plan: updated }, { status: 200 });
  } catch (e: any) {
    const msg = e?.message || "Unauthorized";
    return NextResponse.json(
      { error: msg },
      { status: msg === "NOT_ADMIN" ? 403 : 401 }
    );
  }
}
