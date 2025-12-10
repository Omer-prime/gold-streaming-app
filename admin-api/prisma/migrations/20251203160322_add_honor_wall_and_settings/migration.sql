-- CreateEnum
CREATE TYPE "HonorItemType" AS ENUM ('TAG', 'MEDAL', 'GIFT', 'VEHICLE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "liveLevel" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "HonorItem" (
    "id" TEXT NOT NULL,
    "type" "HonorItemType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "iconUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HonorItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserHonor" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "obtainedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserHonor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserHonor_userId_idx" ON "UserHonor"("userId");

-- CreateIndex
CREATE INDEX "UserHonor_itemId_idx" ON "UserHonor"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "UserHonor_userId_itemId_key" ON "UserHonor"("userId", "itemId");

-- AddForeignKey
ALTER TABLE "UserHonor" ADD CONSTRAINT "UserHonor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserHonor" ADD CONSTRAINT "UserHonor_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "HonorItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
