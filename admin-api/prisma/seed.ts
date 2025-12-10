// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // 1) Seed countries
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

  // 2) Seed admin user
  const adminPassword = "admin123";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {
      role: "ADMIN",
      passwordHash,
    },
    create: {
      username: "admin",
      email: "admin@goldlive.local",
      passwordHash,
      role: "ADMIN",
      wallet: {
        create: {
          balance: 0,
        },
      },
    },
  });

  console.log("Admin user ready ✅");
  console.log("  username:", admin.username);
  console.log("  password:", adminPassword);
  console.log("  id:", admin.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
