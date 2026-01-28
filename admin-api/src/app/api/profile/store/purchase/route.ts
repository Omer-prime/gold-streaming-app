import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const userId = String(body?.userId ?? "");
    const itemId = String(body?.itemId ?? "");
    const quantity = Math.max(1, Number(body?.quantity ?? 1) || 1);

    if (!userId) throw new Error("userId is required");
    if (!itemId) throw new Error("itemId is required");

    const now = new Date();

    const item = await prisma.storeItem.findUnique({
      where: { id: itemId },
      include: { category: true },
    });
    if (!item || !item.isActive) throw new Error("Invalid item");

    const unitPrice = item.priceCoins;
    const total = unitPrice * quantity;

    const result = await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.upsert({
        where: { userId },
        update: {},
        create: { userId, balance: 0 },
      });

      if (wallet.balance < total) throw new Error("Insufficient balance");

      // ownership rules:
      // - permanent item: cannot buy again
      // - timed item: extend expiresAt
      const existing = await tx.userStoreItem.findUnique({
        where: { userId_itemId: { userId, itemId } },
      });

      let nextExpiresAt: Date | null = null;

      if (!item.durationDays) {
        if (existing) throw new Error("Already owned");
        nextExpiresAt = null;
      } else {
        const extendDays = item.durationDays * quantity;
        const base = existing?.expiresAt && existing.expiresAt > now ? existing.expiresAt : now;
        nextExpiresAt = addDays(base, extendDays);
      }

      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: total } },
      });

      const purchase = await tx.storePurchase.create({
        data: {
          userId,
          itemId,
          quantity,
          unitPrice,
          totalPrice: total,
          metaJson: { category: item.category.slug, type: item.type },
        },
      });

      if (!existing) {
        await tx.userStoreItem.create({
          data: {
            userId,
            itemId,
            obtainedAt: now,
            lastPurchasedAt: now,
            expiresAt: nextExpiresAt,
          },
        });
      } else {
        // only timed items reach here
        await tx.userStoreItem.update({
          where: { userId_itemId: { userId, itemId } },
          data: {
            lastPurchasedAt: now,
            expiresAt: nextExpiresAt,
          },
        });
      }

      await tx.walletLedger.create({
        data: {
          userId,
          walletId: wallet.id,
          type: "STORE_PURCHASE",
          delta: -total,
          balanceAfter: updatedWallet.balance,
          title: `Store: ${item.title}`,
          metaJson: { purchaseId: purchase.id, itemId, quantity, unitPrice, totalPrice: total },
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { totalCoinsSpent: { increment: total } },
      });

      return { balance: updatedWallet.balance, expiresAt: nextExpiresAt?.toISOString() ?? null };
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Error" }, { status: 400 });
  }
}
