// scripts/create-admin-user.cjs

const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, "..", ".env"),
});

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  // Usage:
  // node scripts/create-admin-user.cjs <username> <email> <password>
  const username = process.argv[2] || "leao";
  const email = process.argv[3] || "leao@goldlive.app";
  const password = process.argv[4] || "5641casa";

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { username },
    update: {
      email,
      passwordHash,
      role: "ADMIN",
    },
    create: {
      username,
      email,
      passwordHash,
      role: "ADMIN",
      wallet: { create: { balance: 0 } },
    },
  });

  console.log("✅ Admin ensured:");
  console.log({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  });
}

main()
  .catch((err) => {
    console.error("❌ Error creating admin:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
