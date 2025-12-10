-- CreateEnum
CREATE TYPE "LiveApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "LiveApplication" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "LiveApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LiveApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LiveApplication_userId_idx" ON "LiveApplication"("userId");

-- AddForeignKey
ALTER TABLE "LiveApplication" ADD CONSTRAINT "LiveApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
