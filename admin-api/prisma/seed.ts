// prisma/seed.ts
import { PrismaClient, VipTier } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function vipLevelFromTier(tier: VipTier) {
  switch (tier) {
    case "NORMAL":
      return 1;
    case "SUPER":
      return 2;
    case "DIAMOND":
      return 3;
    case "SVIP":
      return 4;
    default:
      return 0;
  }
}

async function main() {
  // =========================================================
  // 1) Seed countries
  // =========================================================
  const countries = [
    { code: "PK", name: "Pakistan", flagEmoji: "🇵🇰", sortOrder: 1 },
    { code: "PH", name: "Philippines", flagEmoji: "🇵🇭", sortOrder: 2 },
    { code: "IN", name: "India", flagEmoji: "🇮🇳", sortOrder: 3 },
    { code: "BD", name: "Bangladesh", flagEmoji: "🇧🇩", sortOrder: 4 },
  ];

  for (const c of countries) {
    await prisma.country.upsert({
      where: { code: c.code },
      update: {
        name: c.name,
        flagEmoji: c.flagEmoji,
        isActive: true,
        sortOrder: c.sortOrder,
      },
      create: c,
    });
  }

  console.log("Seeded countries ✅");

  // =========================================================
  // 2) Seed admin user
  // =========================================================
  const adminPassword = "admin123";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {
      role: "ADMIN",
      passwordHash,
      vipTier: "NONE",
      vipLevel: 0,
      vipExpiresAt: null,
    },
    create: {
      username: "admin",
      email: "admin@goldlive.local",
      passwordHash,
      role: "ADMIN",
      vipTier: "NONE",
      vipLevel: 0,
      vipExpiresAt: null,
      wallet: {
        create: { balance: 0 },
      },
    },
    include: { wallet: true },
  });

  console.log("Admin user ready ✅");
  console.log("  username:", admin.username);
  console.log("  password:", adminPassword);
  console.log("  id:", admin.id);

  // =========================================================
  // 3) Seed VIP privileges (global definitions)
  // =========================================================
  const vipPrivileges = [
    { key: "daily_coins", label: "Collect Coins", defaultValue: "+3,500/d", icon: "star-outline", sortOrder: 1 },
    { key: "live_tag", label: "Live Float Tag", defaultValue: "+1/d", icon: "pricetag-outline", sortOrder: 2 },
    { key: "platform_speaker", label: "Platform Speaker", defaultValue: "+1/d", icon: "megaphone-outline", sortOrder: 3 },
    { key: "entry_vehicle", label: "Entry Vehicle", defaultValue: "Unlock", icon: "car-outline", sortOrder: 4 },
    { key: "vip_badge", label: "VIP Badge", defaultValue: "Unlock", icon: "ribbon-outline", sortOrder: 5 },
    { key: "exclusive_data_card", label: "Exclusive data card", defaultValue: "Unlock", icon: "card-outline", sortOrder: 6 },
    { key: "invisible_visitor", label: "Invisible visitor", defaultValue: "Unlock", icon: "eye-off-outline", sortOrder: 7 },
  ];

  for (const p of vipPrivileges) {
    await prisma.vipPrivilege.upsert({
      where: { key: p.key },
      update: {
        label: p.label,
        defaultValue: p.defaultValue,
        icon: p.icon,
        isActive: true,
        sortOrder: p.sortOrder,
      },
      create: {
        key: p.key,
        label: p.label,
        defaultValue: p.defaultValue,
        icon: p.icon,
        isActive: true,
        sortOrder: p.sortOrder,
      },
    });
  }

  console.log("VIP privileges seeded ✅");

  const allPrivileges = await prisma.vipPrivilege.findMany({
    select: { id: true, key: true },
  });
  const privIdByKey = new Map(allPrivileges.map((p) => [p.key, p.id] as const));

  // =========================================================
  // Helpers for VIP plans
  // =========================================================
  async function upsertPlan(input: {
    tier: VipTier;
    name: string;
    description: string;
    sortOrder: number;
    packages: Array<{
      label: string;
      durationMonths: number; // 1,3,6,12
      priceCoins: number;
      sortOrder: number;
    }>;
    privileges: Array<{
      key: string;
      valueOverride?: string;
      locked?: boolean;
      sortOrder: number;
    }>;
  }) {
    const plan = await prisma.vipPlan.upsert({
      where: { tier: input.tier },
      update: {
        name: input.name,
        description: input.description,
        sortOrder: input.sortOrder,
        isActive: true,
      },
      create: {
        tier: input.tier,
        name: input.name,
        description: input.description,
        sortOrder: input.sortOrder,
        isActive: true,
      },
    });

    // Packages: upsert by (planId + durationMonths)
    for (const pkg of input.packages) {
      const existing = await prisma.vipPlanPackage.findFirst({
        where: { planId: plan.id, durationMonths: pkg.durationMonths },
        select: { id: true },
      });

      if (existing) {
        await prisma.vipPlanPackage.update({
          where: { id: existing.id },
          data: {
            label: pkg.label,
            priceCoins: pkg.priceCoins,
            sortOrder: pkg.sortOrder,
            isActive: true,
          },
        });
      } else {
        await prisma.vipPlanPackage.create({
          data: {
            planId: plan.id,
            label: pkg.label,
            durationMonths: pkg.durationMonths,
            priceCoins: pkg.priceCoins,
            sortOrder: pkg.sortOrder,
            isActive: true,
          },
        });
      }
    }

    // Plan privileges: upsert by (planId + privilegeId)
    for (const pl of input.privileges) {
      const privilegeId = privIdByKey.get(pl.key);
      if (!privilegeId) continue;

      const existing = await prisma.vipPlanPrivilege.findFirst({
        where: { planId: plan.id, privilegeId },
        select: { id: true },
      });

      if (existing) {
        await prisma.vipPlanPrivilege.update({
          where: { id: existing.id },
          data: {
            valueOverride: pl.valueOverride ?? null,
            locked: pl.locked ?? false,
            sortOrder: pl.sortOrder,
          },
        });
      } else {
        await prisma.vipPlanPrivilege.create({
          data: {
            planId: plan.id,
            privilegeId,
            valueOverride: pl.valueOverride ?? null,
            locked: pl.locked ?? false,
            sortOrder: pl.sortOrder,
          },
        });
      }
    }

    return plan;
  }

  // =========================================================
  // 4) Seed VIP plans + packages + privileges
  // =========================================================
  await upsertPlan({
    tier: "NORMAL",
    name: "Normal VIP",
    description: "Get VIP & enjoy privileges.",
    sortOrder: 1,
    packages: [
      { label: "Monthly", durationMonths: 1, priceCoins: 95000, sortOrder: 1 },
      { label: "3 Months", durationMonths: 3, priceCoins: 270000, sortOrder: 2 },
      { label: "6 Months", durationMonths: 6, priceCoins: 510000, sortOrder: 3 },
      { label: "Yearly", durationMonths: 12, priceCoins: 950000, sortOrder: 4 },
    ],
    privileges: [
      { key: "daily_coins", valueOverride: "+3,500/d", sortOrder: 1 },
      { key: "live_tag", valueOverride: "+1/d", sortOrder: 2 },
      { key: "platform_speaker", valueOverride: "+1/d", sortOrder: 3 },
      { key: "entry_vehicle", valueOverride: "Unlock", sortOrder: 4 },
      { key: "vip_badge", valueOverride: "Normal VIP", sortOrder: 5 },
      { key: "exclusive_data_card", locked: true, sortOrder: 6 },
      { key: "invisible_visitor", locked: true, sortOrder: 7 },
    ],
  });

  await upsertPlan({
    tier: "SUPER",
    name: "Super VIP",
    description: "Extra privileges for active hosts.",
    sortOrder: 2,
    packages: [
      { label: "Monthly", durationMonths: 1, priceCoins: 295000, sortOrder: 1 },
      { label: "3 Months", durationMonths: 3, priceCoins: 840000, sortOrder: 2 },
      { label: "6 Months", durationMonths: 6, priceCoins: 1590000, sortOrder: 3 },
      { label: "Yearly", durationMonths: 12, priceCoins: 2950000, sortOrder: 4 },
    ],
    privileges: [
      { key: "daily_coins", valueOverride: "+7,000/d", sortOrder: 1 },
      { key: "live_tag", valueOverride: "+2/d", sortOrder: 2 },
      { key: "platform_speaker", valueOverride: "+2/d", sortOrder: 3 },
      { key: "entry_vehicle", valueOverride: "Premium", sortOrder: 4 },
      { key: "vip_badge", valueOverride: "Super VIP", sortOrder: 5 },
      { key: "exclusive_data_card", sortOrder: 6 },
      { key: "invisible_visitor", sortOrder: 7 },
    ],
  });

  await upsertPlan({
    tier: "DIAMOND",
    name: "Diamond VIP",
    description: "High level VIP for core users.",
    sortOrder: 3,
    packages: [
      { label: "Monthly", durationMonths: 1, priceCoins: 595000, sortOrder: 1 },
      { label: "3 Months", durationMonths: 3, priceCoins: 1695000, sortOrder: 2 },
      { label: "6 Months", durationMonths: 6, priceCoins: 3213000, sortOrder: 3 },
      { label: "Yearly", durationMonths: 12, priceCoins: 5950000, sortOrder: 4 },
    ],
    privileges: [
      { key: "daily_coins", valueOverride: "+12,000/d", sortOrder: 1 },
      { key: "live_tag", valueOverride: "+3/d", sortOrder: 2 },
      { key: "platform_speaker", valueOverride: "+3/d", sortOrder: 3 },
      { key: "entry_vehicle", valueOverride: "Diamond", sortOrder: 4 },
      { key: "vip_badge", valueOverride: "Diamond", sortOrder: 5 },
      { key: "exclusive_data_card", sortOrder: 6 },
      { key: "invisible_visitor", sortOrder: 7 },
    ],
  });

  await upsertPlan({
    tier: "SVIP",
    name: "SVIP",
    description: "Top level VIP with max privileges.",
    sortOrder: 4,
    packages: [
      { label: "Monthly", durationMonths: 1, priceCoins: 995000, sortOrder: 1 },
      { label: "3 Months", durationMonths: 3, priceCoins: 2835000, sortOrder: 2 },
      { label: "6 Months", durationMonths: 6, priceCoins: 5373000, sortOrder: 3 },
      { label: "Yearly", durationMonths: 12, priceCoins: 9950000, sortOrder: 4 },
    ],
    privileges: [
      { key: "daily_coins", valueOverride: "+20,000/d", sortOrder: 1 },
      { key: "live_tag", valueOverride: "Multiple", sortOrder: 2 },
      { key: "platform_speaker", valueOverride: "Priority", sortOrder: 3 },
      { key: "entry_vehicle", valueOverride: "SVIP Exclusive", sortOrder: 4 },
      { key: "vip_badge", valueOverride: "SVIP", sortOrder: 5 },
      { key: "exclusive_data_card", sortOrder: 6 },
      { key: "invisible_visitor", sortOrder: 7 },
    ],
  });

  console.log("VIP plans + packages + privileges seeded ✅");

  // Optional: if you want admin to start with VIP for testing (comment out if not needed)
  // await prisma.user.update({
  //   where: { id: admin.id },
  //   data: {
  //     vipTier: "NORMAL",
  //     vipLevel: vipLevelFromTier("NORMAL"),
  //     vipExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  //   },
  // });

  // console.log("Admin VIP enabled for testing ✅");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
