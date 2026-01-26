-- CreateEnum
CREATE TYPE "RewardCategory" AS ENUM ('PK_MISSION', 'ACTIVITY', 'FAN_CLUB', 'INVITE');

-- CreateTable
CREATE TABLE "RewardTask" (
    "id" TEXT NOT NULL,
    "category" "RewardCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "rewardPoints" INTEGER NOT NULL,
    "target" INTEGER NOT NULL,
    "goToScreen" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RewardTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RewardTask_category_isActive_sortOrder_idx" ON "RewardTask"("category", "isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "RewardTask_createdAt_idx" ON "RewardTask"("createdAt");
