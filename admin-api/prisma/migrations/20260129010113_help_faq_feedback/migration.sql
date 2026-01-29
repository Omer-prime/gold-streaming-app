-- CreateEnum
CREATE TYPE "HelpFeedbackType" AS ENUM ('GENERAL', 'BUG', 'PAYMENT', 'ACCOUNT', 'STREAM', 'REPORT');

-- CreateEnum
CREATE TYPE "HelpFeedbackStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'CLOSED');

-- CreateTable
CREATE TABLE "HelpCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HelpCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HelpFaq" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "HelpFaq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HelpFeedback" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "HelpFeedbackType" NOT NULL DEFAULT 'GENERAL',
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "status" "HelpFeedbackStatus" NOT NULL DEFAULT 'OPEN',
    "adminReply" TEXT,
    "repliedAt" TIMESTAMP(3),
    "repliedById" TEXT,

    CONSTRAINT "HelpFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HelpCategory_slug_key" ON "HelpCategory"("slug");

-- CreateIndex
CREATE INDEX "HelpCategory_isActive_sortOrder_idx" ON "HelpCategory"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "HelpFaq_categoryId_isActive_sortOrder_idx" ON "HelpFaq"("categoryId", "isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "HelpFaq_categoryId_question_key" ON "HelpFaq"("categoryId", "question");

-- CreateIndex
CREATE INDEX "HelpFeedback_userId_createdAt_idx" ON "HelpFeedback"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "HelpFeedback_status_createdAt_idx" ON "HelpFeedback"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "HelpFaq" ADD CONSTRAINT "HelpFaq_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "HelpCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpFaq" ADD CONSTRAINT "HelpFaq_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpFaq" ADD CONSTRAINT "HelpFaq_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpFeedback" ADD CONSTRAINT "HelpFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpFeedback" ADD CONSTRAINT "HelpFeedback_repliedById_fkey" FOREIGN KEY ("repliedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
