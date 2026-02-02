import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

const MAX_QTY = 100;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    const userId = String(body?.userId ?? "").trim();
    const itemId = String(body?.itemId ?? "").trim();
    const quantityRaw = Number(body?.quantity ?? 1) || 1;
    const quantity = Math.min(MAX_QTY, Math.max(1, Math.floor(quantityRaw)));

    if (!userId) throw new Error("userId is required");
    if (!itemId) throw new Error("itemId is required");

    const now = new Date();

    const item = await prisma.storeItem.findUnique({
      where: { id: itemId },
      include: { category: true },
    });

    // ✅ also check category active
    if (!item || !item.isActive || !item.category?.isActive) {
      throw new Error("Invalid item");
    }

    const unitPrice = Number(item.priceCoins || 0);
    if (unitPrice <= 0) throw new Error("Invalid price");

    // ✅ permanent = durationDays is null (or <=0 treated as permanent)
    const durationDays = item.durationDays;
    const isTimed = durationDays != null && durationDays > 0;

    // ✅ don’t allow quantity > 1 for permanent items
    if (!isTimed && quantity !== 1) {
      throw new Error("Permanent items can only be purchased once");
    }

    const total = unitPrice * quantity;

    const result = await prisma.$transaction(async (tx) => {
      // ensure user exists (store should not allow “ghost” user ids)
      const u = await tx.user.findUnique({ where: { id: userId }, select: { id: true } });
      if (!u) throw new Error("User not found");

      const wallet = await tx.wallet.upsert({
        where: { userId },
        update: {},
        create: { userId, balance: 0 },
        select: { id: true, balance: true },
      });

      // ownership rules:
      // - permanent item: cannot buy again
      // - timed item: extend expiresAt
      const existing = await tx.userStoreItem.findUnique({
        where: { userId_itemId: { userId, itemId } },
        select: { id: true, expiresAt: true },
      });

      let nextExpiresAt: Date | null = null;

      if (!isTimed) {
        if (existing) throw new Error("Already owned");
        nextExpiresAt = null;
      } else {
        const extendDays = (durationDays as number) * quantity;
        const base = existing?.expiresAt && existing.expiresAt > now ? existing.expiresAt : now;
        nextExpiresAt = addDays(base, extendDays);
      }

      // ✅ race-safe coin deduction:
      // only decrement if balance >= total
      const dec = await tx.wallet.updateMany({
        where: { id: wallet.id, balance: { gte: total } },
        data: { balance: { decrement: total } },
      });

      if (dec.count !== 1) throw new Error("Insufficient balance");

      const updatedWallet = await tx.wallet.findUnique({
        where: { id: wallet.id },
        select: { balance: true },
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
        select: { id: true, createdAt: true },
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
          balanceAfter: updatedWallet?.balance ?? wallet.balance - total,
          title: `Store: ${item.title}`,
          metaJson: { purchaseId: purchase.id, itemId, quantity, unitPrice, totalPrice: total },
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { totalCoinsSpent: { increment: total } },
      });

      const balance = Number(updatedWallet?.balance ?? 0);

      return {
        wallet: { balance },
        expiresAt: nextExpiresAt?.toISOString() ?? null,
        purchaseId: purchase.id,
      };
    });

    // keep compatibility if any old client reads `balance` directly
    return NextResponse.json({ ok: true, balance: result.wallet.balance, ...result });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Error" }, { status: 400 });
  }
}
