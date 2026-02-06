-- CreateEnum
CREATE TYPE "ChatThreadStatus" AS ENUM ('REQUESTED', 'ACCEPTED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "ChatMessageType" AS ENUM ('TEXT', 'MOMENT_SHARE');

-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN     "metaJson" JSONB,
ADD COLUMN     "momentId" TEXT,
ADD COLUMN     "type" "ChatMessageType" NOT NULL DEFAULT 'TEXT';

-- AlterTable
ALTER TABLE "ChatThread" ADD COLUMN     "requestedById" TEXT,
ADD COLUMN     "status" "ChatThreadStatus" NOT NULL DEFAULT 'ACCEPTED';

-- CreateIndex
CREATE INDEX "ChatMessage_momentId_idx" ON "ChatMessage"("momentId");

-- CreateIndex
CREATE INDEX "ChatMessage_type_createdAt_idx" ON "ChatMessage"("type", "createdAt");

-- CreateIndex
CREATE INDEX "ChatThread_status_updatedAt_idx" ON "ChatThread"("status", "updatedAt");

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_momentId_fkey" FOREIGN KEY ("momentId") REFERENCES "Moment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
