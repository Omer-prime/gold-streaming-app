-- CreateIndex
CREATE INDEX "GiftTransaction_createdAt_idx" ON "GiftTransaction"("createdAt");

-- CreateIndex
CREATE INDEX "Stream_hostId_idx" ON "Stream"("hostId");

-- CreateIndex
CREATE INDEX "Stream_isLive_idx" ON "Stream"("isLive");

-- CreateIndex
CREATE INDEX "Stream_createdAt_idx" ON "Stream"("createdAt");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");
