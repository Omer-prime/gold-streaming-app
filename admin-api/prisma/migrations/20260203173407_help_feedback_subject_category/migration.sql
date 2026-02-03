-- CreateEnum
CREATE TYPE "HelpFeedbackCategory" AS ENUM ('GENERAL', 'BUG', 'PAYMENT', 'ACCOUNT', 'STREAM', 'REPORT');

-- AlterTable
ALTER TABLE "HelpFeedback" ADD COLUMN     "category" "HelpFeedbackCategory" NOT NULL DEFAULT 'GENERAL',
ADD COLUMN     "subject" TEXT;

-- CreateIndex
CREATE INDEX "HelpFeedback_category_createdAt_idx" ON "HelpFeedback"("category", "createdAt");
