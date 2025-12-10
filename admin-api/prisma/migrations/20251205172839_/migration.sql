-- CreateEnum
CREATE TYPE "PKType" AS ENUM ('RANDOM', 'FRIEND', 'TEAM');

-- CreateTable
CREATE TABLE "PKBattle" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" "PKType" NOT NULL,
    "hostId" TEXT NOT NULL,
    "opponentId" TEXT,
    "streamId" TEXT,
    "hostScore" INTEGER NOT NULL DEFAULT 0,
    "opponentScore" INTEGER NOT NULL DEFAULT 0,
    "hostWon" BOOLEAN,

    CONSTRAINT "PKBattle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PKBattle_hostId_idx" ON "PKBattle"("hostId");

-- CreateIndex
CREATE INDEX "PKBattle_opponentId_idx" ON "PKBattle"("opponentId");

-- CreateIndex
CREATE INDEX "PKBattle_type_idx" ON "PKBattle"("type");

-- CreateIndex
CREATE INDEX "PKBattle_createdAt_idx" ON "PKBattle"("createdAt");

-- AddForeignKey
ALTER TABLE "PKBattle" ADD CONSTRAINT "PKBattle_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PKBattle" ADD CONSTRAINT "PKBattle_opponentId_fkey" FOREIGN KEY ("opponentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PKBattle" ADD CONSTRAINT "PKBattle_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "Stream"("id") ON DELETE SET NULL ON UPDATE CASCADE;
