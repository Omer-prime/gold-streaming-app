-- CreateEnum
CREATE TYPE "StoreItemType" AS ENUM ('HONOR', 'PREMIUM_ID', 'RIDE', 'PROFILE_CARD', 'AVATAR_FRAME', 'PARTY_THEME', 'CHAT_BUBBLE', 'OTHER');

-- CreateEnum
CREATE TYPE "StoreMediaType" AS ENUM ('IMAGE', 'GIF', 'VIDEO');

-- AlterEnum
ALTER TYPE "WalletLedgerType" ADD VALUE 'STORE_PURCHASE';

-- CreateTable
CREATE TABLE "StoreCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreItem" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "type" "StoreItemType" NOT NULL DEFAULT 'OTHER',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priceCoins" INTEGER NOT NULL,
    "section" TEXT,
    "sectionSortOrder" INTEGER NOT NULL DEFAULT 0,
    "mediaType" "StoreMediaType" NOT NULL DEFAULT 'IMAGE',
    "mediaUrl" TEXT,
    "thumbnailUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "durationDays" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorePurchase" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" INTEGER NOT NULL,
    "totalPrice" INTEGER NOT NULL,
    "metaJson" JSONB,

    CONSTRAINT "StorePurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserStoreItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "obtainedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastPurchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "UserStoreItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StoreCategory_slug_key" ON "StoreCategory"("slug");

-- CreateIndex
CREATE INDEX "StoreCategory_isActive_sortOrder_idx" ON "StoreCategory"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "StoreItem_categoryId_isActive_sortOrder_idx" ON "StoreItem"("categoryId", "isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "StoreItem_isFeatured_isActive_sortOrder_idx" ON "StoreItem"("isFeatured", "isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "StoreItem_section_sectionSortOrder_idx" ON "StoreItem"("section", "sectionSortOrder");

-- CreateIndex
CREATE INDEX "StorePurchase_userId_createdAt_idx" ON "StorePurchase"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "StorePurchase_itemId_createdAt_idx" ON "StorePurchase"("itemId", "createdAt");

-- CreateIndex
CREATE INDEX "UserStoreItem_userId_expiresAt_idx" ON "UserStoreItem"("userId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserStoreItem_userId_itemId_key" ON "UserStoreItem"("userId", "itemId");

-- AddForeignKey
ALTER TABLE "StoreItem" ADD CONSTRAINT "StoreItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "StoreCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorePurchase" ADD CONSTRAINT "StorePurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorePurchase" ADD CONSTRAINT "StorePurchase_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "StoreItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStoreItem" ADD CONSTRAINT "UserStoreItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStoreItem" ADD CONSTRAINT "UserStoreItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "StoreItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
