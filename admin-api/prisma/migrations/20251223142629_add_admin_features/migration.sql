/*
  Warnings:

  - The `protocol` column on the `Stream` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[roomName]` on the table `Stream` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "StreamProtocol" AS ENUM ('LIVEKIT', 'AGORA');

-- CreateEnum
CREATE TYPE "CurrencyTradeStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ResellerApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "BaseSalaryRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Stream" ADD COLUMN     "roomName" TEXT,
ADD COLUMN     "roomSid" TEXT,
DROP COLUMN "protocol",
ADD COLUMN     "protocol" "StreamProtocol" NOT NULL DEFAULT 'LIVEKIT';

-- CreateTable
CREATE TABLE "CurrencyTrade" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "fromCurrency" TEXT NOT NULL,
    "toCurrency" TEXT NOT NULL,
    "fromAmount" INTEGER NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "toAmount" INTEGER NOT NULL,
    "status" "CurrencyTradeStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "note" TEXT,

    CONSTRAINT "CurrencyTrade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResellerApplication" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "ResellerApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "note" TEXT,

    CONSTRAINT "ResellerApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BaseSalaryRequest" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "BaseSalaryRequestStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "note" TEXT,

    CONSTRAINT "BaseSalaryRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CurrencyTrade_userId_createdAt_idx" ON "CurrencyTrade"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "CurrencyTrade_status_createdAt_idx" ON "CurrencyTrade"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ResellerApplication_userId_key" ON "ResellerApplication"("userId");

-- CreateIndex
CREATE INDEX "ResellerApplication_status_createdAt_idx" ON "ResellerApplication"("status", "createdAt");

-- CreateIndex
CREATE INDEX "BaseSalaryRequest_userId_createdAt_idx" ON "BaseSalaryRequest"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "BaseSalaryRequest_status_createdAt_idx" ON "BaseSalaryRequest"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Stream_roomName_key" ON "Stream"("roomName");

-- AddForeignKey
ALTER TABLE "CurrencyTrade" ADD CONSTRAINT "CurrencyTrade_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResellerApplication" ADD CONSTRAINT "ResellerApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BaseSalaryRequest" ADD CONSTRAINT "BaseSalaryRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
