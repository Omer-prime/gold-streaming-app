/*
  Warnings:

  - The values [EVENT,RECRUITMENT] on the enum `TopicCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "NotificationAudience" AS ENUM ('ALL_USERS', 'ALL_HOSTS', 'SPECIFIC_USERS');

-- AlterEnum
BEGIN;
CREATE TYPE "TopicCategory_new" AS ENUM ('DAILY', 'OFFICIAL', 'NORMAL');
ALTER TABLE "Topic" ALTER COLUMN "category" DROP DEFAULT;
ALTER TABLE "Topic" ALTER COLUMN "category" TYPE "TopicCategory_new" USING ("category"::text::"TopicCategory_new");
ALTER TYPE "TopicCategory" RENAME TO "TopicCategory_old";
ALTER TYPE "TopicCategory_new" RENAME TO "TopicCategory";
DROP TYPE "TopicCategory_old";
ALTER TABLE "Topic" ALTER COLUMN "category" SET DEFAULT 'NORMAL';
COMMIT;

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "adminNotificationId" TEXT;

-- AlterTable
ALTER TABLE "Topic" ALTER COLUMN "category" SET DEFAULT 'NORMAL';

-- CreateTable
CREATE TABLE "AdminNotification" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    "audience" "NotificationAudience" NOT NULL DEFAULT 'ALL_USERS',
    "targetUserIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "type" TEXT NOT NULL DEFAULT 'ADMIN',
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "metaJson" JSONB,

    CONSTRAINT "AdminNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdminNotification_createdById_createdAt_idx" ON "AdminNotification"("createdById", "createdAt");

-- CreateIndex
CREATE INDEX "AdminNotification_audience_createdAt_idx" ON "AdminNotification"("audience", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_adminNotificationId_idx" ON "Notification"("adminNotificationId");

-- AddForeignKey
ALTER TABLE "AdminNotification" ADD CONSTRAINT "AdminNotification_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_adminNotificationId_fkey" FOREIGN KEY ("adminNotificationId") REFERENCES "AdminNotification"("id") ON DELETE SET NULL ON UPDATE CASCADE;
