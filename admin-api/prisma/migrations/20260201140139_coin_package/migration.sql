-- CreateTable
CREATE TABLE "CoinPackage" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "coins" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoinPackage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CoinPackage_isActive_sortOrder_idx" ON "CoinPackage"("isActive", "sortOrder");
