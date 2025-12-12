// scripts/create-admin.cjs

// 1) Load .env so Prisma sees DATABASE_URL
const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, "..", ".env"),
});

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  // 🔐 CHOOSE YOUR ADMIN CREDENTIALS
  const username = "gl_master_admin";          // login username
  const email = "admin@goldlive.app";          // optional
  const password = "Gl0ld!Admin#2025_Strong";  // strong password

  console.log("Creating admin user...");
  console.log("Username:", username);
  console.log("Email:", email);
  console.log("Password:", password);

  // check if already exists
  const existing = await prisma.user.findUnique({
    where: { username },
  });

  if (existing) {
    console.log("⚠ User with this username already exists. Skipping create.");
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      passwordHash,
      role: "ADMIN",
      wallet: {
        create: { balance: 0 },
      },
    },
  });

  console.log("✅ Admin created successfully:");
  console.log({
    id: user.id,
    username: user.username,
    email: user.email,
  });
}

main()
  .catch((err) => {
    console.error("❌ Error creating admin:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
