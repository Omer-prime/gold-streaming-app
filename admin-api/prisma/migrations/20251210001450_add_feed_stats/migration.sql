-- AlterTable
ALTER TABLE "User" ADD COLUMN     "followersCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "followingCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isLive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastLiveAt" TIMESTAMP(3),
ADD COLUMN     "liveViewers" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalCoinsReceived" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalCoinsSpent" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "User_isLive_liveViewers_idx" ON "User"("isLive", "liveViewers");

-- CreateIndex
CREATE INDEX "User_followersCount_idx" ON "User"("followersCount");

-- CreateIndex
CREATE INDEX "User_totalCoinsReceived_idx" ON "User"("totalCoinsReceived");
