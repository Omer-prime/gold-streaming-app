-- AlterTable
ALTER TABLE "UserSettings" ADD COLUMN     "activeAvatarFrameItemId" TEXT,
ADD COLUMN     "activeChatBubbleItemId" TEXT,
ADD COLUMN     "activePartyThemeItemId" TEXT,
ADD COLUMN     "activePremiumIdItemId" TEXT,
ADD COLUMN     "activeProfileCardItemId" TEXT,
ADD COLUMN     "activeRideItemId" TEXT;

-- AlterTable
ALTER TABLE "Wallet" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "UserSettings_userId_idx" ON "UserSettings"("userId");
