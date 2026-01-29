/*
  Warnings:

  - The values [IN_PROGRESS] on the enum `HelpFeedbackStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [GENERAL,BUG,PAYMENT,ACCOUNT,STREAM,REPORT] on the enum `HelpFeedbackType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `name` on the `HelpCategory` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `HelpCategory` table. All the data in the column will be lost.
  - You are about to drop the column `answer` on the `HelpFaq` table. All the data in the column will be lost.
  - You are about to drop the column `question` on the `HelpFaq` table. All the data in the column will be lost.
  - You are about to drop the column `adminReply` on the `HelpFeedback` table. All the data in the column will be lost.
  - You are about to drop the column `subject` on the `HelpFeedback` table. All the data in the column will be lost.
  - The `language` column on the `UserSettings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[key]` on the table `HelpCategory` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `key` to the `HelpCategory` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "HelpCategoryKey" AS ENUM ('FREQUENT', 'LIVESTREAM', 'RECHARGE', 'REPORT', 'ACCOUNT');

-- CreateEnum
CREATE TYPE "AppLanguage" AS ENUM ('system', 'en', 'zh-Hant', 'vi', 'hi', 'id', 'ar', 'ur', 'pt', 'tr', 'bn', 'th', 'ne', 'fr', 'es');

-- AlterEnum
BEGIN;
CREATE TYPE "HelpFeedbackStatus_new" AS ENUM ('OPEN', 'REPLIED', 'CLOSED');
ALTER TABLE "HelpFeedback" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "HelpFeedback" ALTER COLUMN "status" TYPE "HelpFeedbackStatus_new" USING ("status"::text::"HelpFeedbackStatus_new");
ALTER TYPE "HelpFeedbackStatus" RENAME TO "HelpFeedbackStatus_old";
ALTER TYPE "HelpFeedbackStatus_new" RENAME TO "HelpFeedbackStatus";
DROP TYPE "HelpFeedbackStatus_old";
ALTER TABLE "HelpFeedback" ALTER COLUMN "status" SET DEFAULT 'OPEN';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "HelpFeedbackType_new" AS ENUM ('MY_FEEDBACK', 'MESSAGE_FEEDBACK');
ALTER TABLE "HelpFeedback" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "HelpFeedback" ALTER COLUMN "type" TYPE "HelpFeedbackType_new" USING ("type"::text::"HelpFeedbackType_new");
ALTER TYPE "HelpFeedbackType" RENAME TO "HelpFeedbackType_old";
ALTER TYPE "HelpFeedbackType_new" RENAME TO "HelpFeedbackType";
DROP TYPE "HelpFeedbackType_old";
ALTER TABLE "HelpFeedback" ALTER COLUMN "type" SET DEFAULT 'MY_FEEDBACK';
COMMIT;

-- DropIndex
DROP INDEX "HelpCategory_slug_key";

-- DropIndex
DROP INDEX "HelpFaq_categoryId_question_key";

-- AlterTable
ALTER TABLE "HelpCategory" DROP COLUMN "name",
DROP COLUMN "slug",
ADD COLUMN     "key" "HelpCategoryKey" NOT NULL;

-- AlterTable
ALTER TABLE "HelpFaq" DROP COLUMN "answer",
DROP COLUMN "question";

-- AlterTable
ALTER TABLE "HelpFeedback" DROP COLUMN "adminReply",
DROP COLUMN "subject",
ADD COLUMN     "replyText" TEXT,
ADD COLUMN     "screenshots" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "type" SET DEFAULT 'MY_FEEDBACK';

-- AlterTable
ALTER TABLE "UserSettings" DROP COLUMN "language",
ADD COLUMN     "language" "AppLanguage" NOT NULL DEFAULT 'system';

-- CreateTable
CREATE TABLE "HelpCategoryTranslation" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "language" "AppLanguage" NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "HelpCategoryTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HelpFaqTranslation" (
    "id" TEXT NOT NULL,
    "faqId" TEXT NOT NULL,
    "language" "AppLanguage" NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,

    CONSTRAINT "HelpFaqTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HelpCategoryTranslation_language_idx" ON "HelpCategoryTranslation"("language");

-- CreateIndex
CREATE UNIQUE INDEX "HelpCategoryTranslation_categoryId_language_key" ON "HelpCategoryTranslation"("categoryId", "language");

-- CreateIndex
CREATE INDEX "HelpFaqTranslation_language_idx" ON "HelpFaqTranslation"("language");

-- CreateIndex
CREATE UNIQUE INDEX "HelpFaqTranslation_faqId_language_key" ON "HelpFaqTranslation"("faqId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "HelpCategory_key_key" ON "HelpCategory"("key");

-- CreateIndex
CREATE INDEX "HelpFaq_createdAt_idx" ON "HelpFaq"("createdAt");

-- CreateIndex
CREATE INDEX "HelpFeedback_type_createdAt_idx" ON "HelpFeedback"("type", "createdAt");

-- AddForeignKey
ALTER TABLE "HelpCategoryTranslation" ADD CONSTRAINT "HelpCategoryTranslation_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "HelpCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpFaqTranslation" ADD CONSTRAINT "HelpFaqTranslation_faqId_fkey" FOREIGN KEY ("faqId") REFERENCES "HelpFaq"("id") ON DELETE CASCADE ON UPDATE CASCADE;
