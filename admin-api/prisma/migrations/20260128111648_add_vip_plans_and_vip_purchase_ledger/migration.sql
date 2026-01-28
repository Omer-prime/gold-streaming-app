-- AlterEnum
ALTER TYPE "WalletLedgerType" ADD VALUE 'VIP_PURCHASE';

-- CreateTable
CREATE TABLE "VipPlan" (
    "id" TEXT NOT NULL,
    "tier" "VipTier" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VipPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VipPlanPackage" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "durationMonths" INTEGER NOT NULL,
    "priceCoins" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VipPlanPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VipPrivilege" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "defaultValue" TEXT,
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VipPrivilege_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VipPlanPrivilege" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "privilegeId" TEXT NOT NULL,
    "valueOverride" TEXT,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "VipPlanPrivilege_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VipPlan_tier_key" ON "VipPlan"("tier");

-- CreateIndex
CREATE INDEX "VipPlan_isActive_sortOrder_idx" ON "VipPlan"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "VipPlanPackage_planId_isActive_sortOrder_idx" ON "VipPlanPackage"("planId", "isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "VipPrivilege_key_key" ON "VipPrivilege"("key");

-- CreateIndex
CREATE INDEX "VipPrivilege_isActive_sortOrder_idx" ON "VipPrivilege"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "VipPlanPrivilege_planId_sortOrder_idx" ON "VipPlanPrivilege"("planId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "VipPlanPrivilege_planId_privilegeId_key" ON "VipPlanPrivilege"("planId", "privilegeId");

-- AddForeignKey
ALTER TABLE "VipPlanPackage" ADD CONSTRAINT "VipPlanPackage_planId_fkey" FOREIGN KEY ("planId") REFERENCES "VipPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VipPlanPrivilege" ADD CONSTRAINT "VipPlanPrivilege_planId_fkey" FOREIGN KEY ("planId") REFERENCES "VipPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VipPlanPrivilege" ADD CONSTRAINT "VipPlanPrivilege_privilegeId_fkey" FOREIGN KEY ("privilegeId") REFERENCES "VipPrivilege"("id") ON DELETE CASCADE ON UPDATE CASCADE;
