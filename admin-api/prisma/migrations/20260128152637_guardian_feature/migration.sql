-- CreateEnum
CREATE TYPE "GuardianTier" AS ENUM ('NONE', 'SILVER', 'GOLD', 'DIAMOND');

-- CreateEnum
CREATE TYPE "GuardianBondStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELED');

-- AlterEnum
ALTER TYPE "WalletLedgerType" ADD VALUE 'GUARDIAN_PURCHASE';

-- CreateTable
CREATE TABLE "GuardianPlan" (
    "id" TEXT NOT NULL,
    "tier" "GuardianTier" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuardianPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuardianPlanPackage" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "durationMonths" INTEGER NOT NULL,
    "priceCoins" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuardianPlanPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuardianPrivilege" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "defaultValue" TEXT,
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuardianPrivilege_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuardianPlanPrivilege" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "privilegeId" TEXT NOT NULL,
    "valueOverride" TEXT,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GuardianPlanPrivilege_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuardianBond" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "guardianId" TEXT NOT NULL,
    "guardedId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "tier" "GuardianTier" NOT NULL,
    "status" "GuardianBondStatus" NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "priceCoins" INTEGER NOT NULL,

    CONSTRAINT "GuardianBond_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GuardianPlan_tier_key" ON "GuardianPlan"("tier");

-- CreateIndex
CREATE INDEX "GuardianPlan_isActive_sortOrder_idx" ON "GuardianPlan"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "GuardianPlanPackage_planId_isActive_sortOrder_idx" ON "GuardianPlanPackage"("planId", "isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "GuardianPlanPackage_durationMonths_idx" ON "GuardianPlanPackage"("durationMonths");

-- CreateIndex
CREATE UNIQUE INDEX "GuardianPrivilege_key_key" ON "GuardianPrivilege"("key");

-- CreateIndex
CREATE INDEX "GuardianPrivilege_isActive_sortOrder_idx" ON "GuardianPrivilege"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "GuardianPlanPrivilege_planId_sortOrder_idx" ON "GuardianPlanPrivilege"("planId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "GuardianPlanPrivilege_planId_privilegeId_key" ON "GuardianPlanPrivilege"("planId", "privilegeId");

-- CreateIndex
CREATE INDEX "GuardianBond_guardianId_status_endsAt_idx" ON "GuardianBond"("guardianId", "status", "endsAt");

-- CreateIndex
CREATE INDEX "GuardianBond_guardedId_status_endsAt_idx" ON "GuardianBond"("guardedId", "status", "endsAt");

-- CreateIndex
CREATE INDEX "GuardianBond_planId_idx" ON "GuardianBond"("planId");

-- CreateIndex
CREATE INDEX "GuardianBond_packageId_idx" ON "GuardianBond"("packageId");

-- AddForeignKey
ALTER TABLE "GuardianPlanPackage" ADD CONSTRAINT "GuardianPlanPackage_planId_fkey" FOREIGN KEY ("planId") REFERENCES "GuardianPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuardianPlanPrivilege" ADD CONSTRAINT "GuardianPlanPrivilege_planId_fkey" FOREIGN KEY ("planId") REFERENCES "GuardianPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuardianPlanPrivilege" ADD CONSTRAINT "GuardianPlanPrivilege_privilegeId_fkey" FOREIGN KEY ("privilegeId") REFERENCES "GuardianPrivilege"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuardianBond" ADD CONSTRAINT "GuardianBond_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuardianBond" ADD CONSTRAINT "GuardianBond_guardedId_fkey" FOREIGN KEY ("guardedId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuardianBond" ADD CONSTRAINT "GuardianBond_planId_fkey" FOREIGN KEY ("planId") REFERENCES "GuardianPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuardianBond" ADD CONSTRAINT "GuardianBond_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "GuardianPlanPackage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
