-- CreateEnum
CREATE TYPE "WalletLedgerType" AS ENUM ('TOPUP', 'GIFT_SENT', 'GIFT_RECEIVED', 'ADJUSTMENT');

-- CreateTable
CREATE TABLE "WalletLedger" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "type" "WalletLedgerType" NOT NULL,
    "delta" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "title" TEXT,
    "metaJson" JSONB,

    CONSTRAINT "WalletLedger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WalletLedger_userId_createdAt_idx" ON "WalletLedger"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "WalletLedger_walletId_createdAt_idx" ON "WalletLedger"("walletId", "createdAt");

-- CreateIndex
CREATE INDEX "WalletLedger_type_createdAt_idx" ON "WalletLedger"("type", "createdAt");

-- AddForeignKey
ALTER TABLE "WalletLedger" ADD CONSTRAINT "WalletLedger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletLedger" ADD CONSTRAINT "WalletLedger_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
