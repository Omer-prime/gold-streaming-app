-- CreateEnum
CREATE TYPE "StreamMode" AS ENUM ('SOLO', 'PARTY', 'PK');

-- AlterTable
ALTER TABLE "Stream" ADD COLUMN     "mode" "StreamMode" NOT NULL DEFAULT 'SOLO';

-- CreateTable
CREATE TABLE "FanClub" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FanClub_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FanClubMember" (
    "id" TEXT NOT NULL,
    "fanClubId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FanClubMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FanClub_ownerId_key" ON "FanClub"("ownerId");

-- CreateIndex
CREATE INDEX "FanClub_ownerId_idx" ON "FanClub"("ownerId");

-- CreateIndex
CREATE INDEX "FanClubMember_userId_idx" ON "FanClubMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FanClubMember_fanClubId_userId_key" ON "FanClubMember"("fanClubId", "userId");

-- CreateIndex
CREATE INDEX "Stream_mode_idx" ON "Stream"("mode");

-- AddForeignKey
ALTER TABLE "FanClub" ADD CONSTRAINT "FanClub_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FanClubMember" ADD CONSTRAINT "FanClubMember_fanClubId_fkey" FOREIGN KEY ("fanClubId") REFERENCES "FanClub"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FanClubMember" ADD CONSTRAINT "FanClubMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
