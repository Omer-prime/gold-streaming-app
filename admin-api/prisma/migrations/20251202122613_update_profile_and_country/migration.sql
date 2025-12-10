-- CreateIndex
CREATE INDEX "Country_sortOrder_idx" ON "Country"("sortOrder");

-- CreateIndex
CREATE INDEX "GiftTransaction_streamId_idx" ON "GiftTransaction"("streamId");

-- CreateIndex
CREATE INDEX "GiftTransaction_senderId_idx" ON "GiftTransaction"("senderId");

-- CreateIndex
CREATE INDEX "GiftTransaction_receiverId_idx" ON "GiftTransaction"("receiverId");

-- CreateIndex
CREATE INDEX "GiftTransaction_walletId_idx" ON "GiftTransaction"("walletId");

-- CreateIndex
CREATE INDEX "GiftTransaction_giftId_idx" ON "GiftTransaction"("giftId");

-- CreateIndex
CREATE INDEX "Message_streamId_idx" ON "Message"("streamId");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE INDEX "User_countryId_idx" ON "User"("countryId");
