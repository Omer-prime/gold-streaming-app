// scripts/create-admin.cjs

const path = require("path");

// Load .env.local first (dev), then .env fallback
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const username = "gl_master_admin";
  const email = "admin@goldlive.app";
  const password = "Gl0ld!Admin#2025_Strong";

  console.log("DATABASE_URL:", process.env.DATABASE_URL ? "✅ loaded" : "❌ missing");
  console.log("Ensuring admin user exists (and password is up to date)...");
  console.log("Username:", username);
  console.log("Email:", email);

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { username },
    update: { email, passwordHash, role: "ADMIN" },
    create: {
      username,
      email,
      passwordHash,
      role: "ADMIN",
      wallet: { create: { balance: 0 } },
    },
  });

  console.log("✅ Admin ensured:", {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  });
}

main()
  .catch((err) => console.error("❌ Error creating admin:", err))
  .finally(async () => prisma.$disconnect());
