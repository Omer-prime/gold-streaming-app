/*
  Warnings:

  - Added the required column `unitPrice` to the `GiftTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GiftMediaType" AS ENUM ('IMAGE', 'GIF', 'VIDEO');

-- CreateEnum
CREATE TYPE "PKBattleStatus" AS ENUM ('PENDING', 'ACTIVE', 'ENDED', 'CANCELED');

-- CreateEnum
CREATE TYPE "PKSide" AS ENUM ('HOST', 'OPPONENT');

-- AlterTable
ALTER TABLE "Gift" ADD COLUMN     "mediaType" "GiftMediaType" NOT NULL DEFAULT 'IMAGE',
ADD COLUMN     "mediaUrl" TEXT,
ADD COLUMN     "thumbnailUrl" TEXT;

-- AlterTable
ALTER TABLE "GiftTransaction" ADD COLUMN     "pkBattleId" TEXT,
ADD COLUMN     "targetSide" "PKSide",
ADD COLUMN     "unitPrice" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "PKBattle" ADD COLUMN     "durationSec" INTEGER,
ADD COLUMN     "endedAt" TIMESTAMP(3),
ADD COLUMN     "startedAt" TIMESTAMP(3),
ADD COLUMN     "status" "PKBattleStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "winnerSide" "PKSide";

-- CreateIndex
CREATE INDEX "GiftTransaction_pkBattleId_idx" ON "GiftTransaction"("pkBattleId");

-- CreateIndex
CREATE INDEX "PKBattle_status_idx" ON "PKBattle"("status");

-- AddForeignKey
ALTER TABLE "GiftTransaction" ADD CONSTRAINT "GiftTransaction_pkBattleId_fkey" FOREIGN KEY ("pkBattleId") REFERENCES "PKBattle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
