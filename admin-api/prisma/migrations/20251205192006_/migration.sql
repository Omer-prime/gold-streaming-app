-- CreateEnum
CREATE TYPE "VipTier" AS ENUM ('NONE', 'NORMAL', 'SUPER', 'DIAMOND', 'SVIP');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "faceVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "liveCoverUrl" TEXT,
ADD COLUMN     "vipExpiresAt" TIMESTAMP(3),
ADD COLUMN     "vipTier" "VipTier" NOT NULL DEFAULT 'NONE';
