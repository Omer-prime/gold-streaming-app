import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, ctx: { params: { id: string } }) {
  try {
    const id = ctx.params.id;
    const body = await req.json().catch(() => null);

    const name = String(body?.name ?? "").trim();
    const description = String(body?.description ?? "");
    const isActive = Boolean(body?.isActive ?? true);
    const sortOrder = Number(body?.sortOrder ?? 0) || 0;

    const packages = Array.isArray(body?.packages) ? body.packages : [];
    const privileges = Array.isArray(body?.privileges) ? body.privileges : [];

    const updated = await prisma.$transaction(async (tx) => {
      const plan = await tx.guardianPlan.update({
        where: { id },
        data: { name, description, isActive, sortOrder },
      });

      // packages upsert by (planId + durationMonths)
      for (const p of packages) {
        const durationMonths = Number(p?.durationMonths ?? 0);
        if (![1, 3, 6, 12].includes(durationMonths)) continue;

        const priceCoins = Number(p?.priceCoins ?? 0) || 0;
        const label = String(p?.label ?? `${durationMonths} Months`);
        const pkgActive = Boolean(p?.isActive ?? true);
        const pkgSort = Number(p?.sortOrder ?? 0) || 0;

        const existing = await tx.guardianPlanPackage.findFirst({
          where: { planId: id, durationMonths },
          select: { id: true },
        });

        if (existing) {
          await tx.guardianPlanPackage.update({
            where: { id: existing.id },
            data: { label, priceCoins, isActive: pkgActive, sortOrder: pkgSort },
          });
        } else {
          await tx.guardianPlanPackage.create({
            data: { planId: id, label, durationMonths, priceCoins, isActive: pkgActive, sortOrder: pkgSort },
          });
        }
      }

      // privileges: upsert GuardianPrivilege by key, then upsert link
      const privilegeIds: string[] = [];
      for (let i = 0; i < privileges.length; i++) {
        const pv = privileges[i];
        const key = String(pv?.key ?? "").trim();
        const label = String(pv?.label ?? "").trim() || key;
        const value = String(pv?.value ?? "");
        const locked = Boolean(pv?.locked ?? false);
        const icon = pv?.icon ? String(pv.icon) : null;

        if (!key) continue;

        const priv = await tx.guardianPrivilege.upsert({
          where: { key },
          create: { key, label, icon, defaultValue: "" },
          update: { label, icon },
        });

        privilegeIds.push(priv.id);

        await tx.guardianPlanPrivilege.upsert({
          where: { planId_privilegeId: { planId: id, privilegeId: priv.id } },
          create: { planId: id, privilegeId: priv.id, valueOverride: value, locked, sortOrder: i },
          update: { valueOverride: value, locked, sortOrder: i },
        });
      }

      await tx.guardianPlanPrivilege.deleteMany({
        where: { planId: id, privilegeId: { notIn: privilegeIds } },
      });

      return plan;
    });

    return NextResponse.json({ ok: true, plan: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Error" }, { status: 400 });
  }
}
