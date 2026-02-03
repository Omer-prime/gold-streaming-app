-- CreateEnum
CREATE TYPE "AnalyticsScope" AS ENUM ('GLOBAL', 'COUNTRY');

-- AlterTable
ALTER TABLE "UserSettings" ADD COLUMN     "analyticsCountryId" INTEGER;

-- CreateIndex
CREATE INDEX "UserSettings_analyticsCountryId_idx" ON "UserSettings"("analyticsCountryId");

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_analyticsCountryId_fkey" FOREIGN KEY ("analyticsCountryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;
