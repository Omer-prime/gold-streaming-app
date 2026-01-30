// admin-api/live-socket-server.cjs
const http = require("http");
const { Server } = require("socket.io");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const PORT = process.env.LIVE_SOCKET_PORT || 4001;

const server = http.createServer();
const io = new Server(server, {
  path: "/socket.io",
  cors: { origin: "*", methods: ["GET", "POST"] },
});

const roomName = (streamId) => `stream:${streamId}`;

const viewersByStream = new Map(); // streamId -> count
const userSocketById = new Map();  // userId -> socket.id

async function getStreamHostId(streamId) {
  const s = await prisma.stream.findUnique({
    where: { id: streamId },
    select: { hostId: true, isLive: true },
  });
  if (!s?.isLive) return null;
  return s.hostId;
}

async function setViewers(streamId, count) {
  const viewers = Math.max(0, count | 0);
  viewersByStream.set(streamId, viewers);

  await prisma.stream.update({
    where: { id: streamId },
    data: { viewers },
  }).catch(() => null);

  const hostId = await getStreamHostId(streamId);
  if (hostId) {
    await prisma.user.update({
      where: { id: hostId },
      data: { liveViewers: viewers },
    }).catch(() => null);
  }

  io.to(roomName(streamId)).emit("viewerCount", { streamId, count: viewers });
}

async function incViewers(streamId) {
  const next = (viewersByStream.get(streamId) || 0) + 1;
  await setViewers(streamId, next);
}
async function decViewers(streamId) {
  const next = Math.max(0, (viewersByStream.get(streamId) || 0) - 1);
  await setViewers(streamId, next);
}

io.on("connection", (socket) => {
  socket.on("joinLive", async (payload, cb) => {
    try {
      const { streamId, userId, name, role } = payload || {};
      if (!streamId || !userId) return cb?.({ error: "streamId & userId required" });

      // attach socket data
      socket.data.streamId = streamId;
      socket.data.userId = userId;
      socket.data.name = name || "Guest";
      socket.data.role = role === "host" ? "host" : "viewer";

      userSocketById.set(userId, socket.id);

      socket.join(roomName(streamId));

      // viewer count (only viewers)
      if (socket.data.role === "viewer") await incViewers(streamId);

      cb?.({ ok: true });

      io.to(roomName(streamId)).emit("system", {
        text: `${socket.data.name} joined`,
        at: Date.now(),
      });
    } catch (e) {
      console.error("joinLive error", e);
      cb?.({ error: "join failed" });
    }
  });

  socket.on("leaveLive", async (_, cb) => {
    try {
      const streamId = socket.data?.streamId;
      if (streamId && socket.data?.role === "viewer") await decViewers(streamId);

      cb?.({ ok: true });
    } catch {
      cb?.({ ok: true });
    }
  });

  // CHAT (persist to Message table)
  socket.on("chat", async (payload, cb) => {
    try {
      const { streamId, userId, text } = payload || {};
      if (!streamId || !userId || !text) return cb?.({ error: "missing fields" });

      const msg = await prisma.message.create({
        data: {
          streamId,
          senderId: userId,
          content: String(text).slice(0, 500),
        },
        select: { id: true, createdAt: true, content: true, senderId: true },
      });

      io.to(roomName(streamId)).emit("chat", {
        id: msg.id,
        userId: msg.senderId,
        text: msg.content,
        at: msg.createdAt.getTime(),
        name: socket.data?.name || "Guest",
      });

      cb?.({ ok: true });
    } catch (e) {
      console.error("chat error", e);
      cb?.({ error: "chat failed" });
    }
  });

  // FOLLOW toggle
  socket.on("toggleFollow", async (payload, cb) => {
    try {
      const { followerId, followingId } = payload || {};
      if (!followerId || !followingId) return cb?.({ error: "missing fields" });
      if (followerId === followingId) return cb?.({ error: "invalid" });

      const existing = await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId, followingId } },
        select: { id: true },
      });

      const result = await prisma.$transaction(async (tx) => {
        if (existing) {
          await tx.follow.delete({
            where: { followerId_followingId: { followerId, followingId } },
          });
          await tx.user.update({
            where: { id: followerId },
            data: { followingCount: { decrement: 1 } },
          });
          await tx.user.update({
            where: { id: followingId },
            data: { followersCount: { decrement: 1 } },
          });
          return { following: false };
        } else {
          await tx.follow.create({ data: { followerId, followingId } });
          await tx.user.update({
            where: { id: followerId },
            data: { followingCount: { increment: 1 } },
          });
          await tx.user.update({
            where: { id: followingId },
            data: { followersCount: { increment: 1 } },
          });
          return { following: true };
        }
      });

      // notify host (optional)
      const hostSocketId = userSocketById.get(followingId);
      if (hostSocketId) {
        io.to(hostSocketId).emit("followEvent", {
          followerId,
          followingId,
          following: result.following,
          at: Date.now(),
        });
      }

      cb?.({ ok: true, ...result });
    } catch (e) {
      console.error("toggleFollow error", e);
      cb?.({ error: "follow failed" });
    }
  });

  // GIFTS (persist + wallet updates)
  socket.on("sendGift", async (payload, cb) => {
    try {
      const { streamId, senderId, giftId, quantity, targetSide } = payload || {};
      if (!streamId || !senderId || !giftId) return cb?.({ error: "missing fields" });

      const qty = Math.max(1, Math.min(999, Number(quantity || 1) | 0));

      const [gift, hostId] = await Promise.all([
        prisma.gift.findUnique({ where: { id: Number(giftId) }, select: { id: true, name: true, price: true, thumbnailUrl: true, isActive: true } }),
        getStreamHostId(streamId),
      ]);

      if (!gift || !gift.isActive) return cb?.({ error: "gift not found" });
      if (!hostId) return cb?.({ error: "stream not live" });
      if (senderId === hostId) return cb?.({ error: "host cannot send gift to self" });

      const total = gift.price * qty;

      const result = await prisma.$transaction(async (tx) => {
        const senderWallet = await tx.wallet.upsert({
          where: { userId: senderId },
          create: { userId: senderId, balance: 0 },
          update: {},
          select: { id: true, balance: true },
        });

        if (senderWallet.balance < total) {
          throw new Error("INSUFFICIENT_BALANCE");
        }

        const receiverWallet = await tx.wallet.upsert({
          where: { userId: hostId },
          create: { userId: hostId, balance: 0 },
          update: {},
          select: { id: true, balance: true },
        });

        const senderAfter = senderWallet.balance - total;
        const receiverAfter = receiverWallet.balance + total;

        await tx.wallet.update({ where: { id: senderWallet.id }, data: { balance: senderAfter } });
        await tx.wallet.update({ where: { id: receiverWallet.id }, data: { balance: receiverAfter } });

        await tx.walletLedger.create({
          data: {
            userId: senderId,
            walletId: senderWallet.id,
            type: "GIFT_SENT",
            delta: -total,
            balanceAfter: senderAfter,
            title: `Sent ${gift.name} x${qty}`,
            metaJson: { streamId, giftId: gift.id, quantity: qty },
          },
        });

        await tx.walletLedger.create({
          data: {
            userId: hostId,
            walletId: receiverWallet.id,
            type: "GIFT_RECEIVED",
            delta: total,
            balanceAfter: receiverAfter,
            title: `Received ${gift.name} x${qty}`,
            metaJson: { streamId, giftId: gift.id, quantity: qty },
          },
        });

        const gt = await tx.giftTransaction.create({
          data: {
            streamId,
            giftId: gift.id,
            senderId,
            receiverId: hostId,
            walletId: senderWallet.id,
            quantity: qty,
            unitPrice: gift.price,
            totalPrice: total,
            targetSide: targetSide || null,
          },
          select: { id: true, createdAt: true },
        });

        await tx.user.update({
          where: { id: senderId },
          data: { totalCoinsSpent: { increment: total } },
        });
        await tx.user.update({
          where: { id: hostId },
          data: { totalCoinsReceived: { increment: total } },
        });

        return { giftTransactionId: gt.id, at: gt.createdAt.getTime() };
      });

      io.to(roomName(streamId)).emit("gift", {
        id: result.giftTransactionId,
        streamId,
        senderId,
        receiverId: hostId,
        gift: {
          id: gift.id,
          name: gift.name,
          price: gift.price,
          thumbnailUrl: gift.thumbnailUrl,
        },
        quantity: qty,
        total,
        at: result.at,
        senderName: socket.data?.name || "Guest",
      });

      cb?.({ ok: true });
    } catch (e) {
      if (String(e?.message) === "INSUFFICIENT_BALANCE") {
        return cb?.({ error: "Insufficient balance" });
      }
      console.error("sendGift error", e);
      cb?.({ error: "gift failed" });
    }
  });

  // PK (basic invite/accept)
  socket.on("pkInvite", async (payload, cb) => {
    try {
      const { streamId, hostId, opponentId, durationSec } = payload || {};
      if (!streamId || !hostId || !opponentId) return cb?.({ error: "missing fields" });

      const oppSocketId = userSocketById.get(opponentId);
      if (!oppSocketId) return cb?.({ error: "opponent not online" });

      const battle = await prisma.pKBattle.create({
        data: {
          type: "FRIEND",
          status: "PENDING",
          hostId,
          opponentId,
          streamId,
          durationSec: Math.max(30, Math.min(600, Number(durationSec || 180) | 0)),
        },
        select: { id: true, durationSec: true },
      });

      io.to(oppSocketId).emit("pkInvite", {
        battleId: battle.id,
        hostId,
        streamId,
        durationSec: battle.durationSec,
        at: Date.now(),
      });

      cb?.({ ok: true, battleId: battle.id });
    } catch (e) {
      console.error("pkInvite error", e);
      cb?.({ error: "pk invite failed" });
    }
  });

  socket.on("pkRespond", async (payload, cb) => {
    try {
      const { battleId, accept } = payload || {};
      if (!battleId) return cb?.({ error: "battleId required" });

      const battle = await prisma.pKBattle.findUnique({
        where: { id: battleId },
        select: { id: true, hostId: true, opponentId: true, streamId: true, status: true, durationSec: true },
      });
      if (!battle || battle.status !== "PENDING") return cb?.({ error: "invalid battle" });

      if (!accept) {
        await prisma.pKBattle.update({
          where: { id: battleId },
          data: { status: "CANCELED", endedAt: new Date() },
        });
        io.to(roomName(battle.streamId)).emit("pkCanceled", { battleId });
        return cb?.({ ok: true });
      }

      const started = await prisma.pKBattle.update({
        where: { id: battleId },
        data: { status: "ACTIVE", startedAt: new Date() },
        select: { id: true, startedAt: true, durationSec: true, hostId: true, opponentId: true, streamId: true },
      });

      io.to(roomName(started.streamId)).emit("pkStarted", {
        battleId: started.id,
        hostId: started.hostId,
        opponentId: started.opponentId,
        startedAt: started.startedAt.getTime(),
        durationSec: started.durationSec || 180,
      });

      cb?.({ ok: true });
    } catch (e) {
      console.error("pkRespond error", e);
      cb?.({ error: "pk respond failed" });
    }
  });

  socket.on("disconnect", async () => {
    const streamId = socket.data?.streamId;
    const userId = socket.data?.userId;

    if (userId && userSocketById.get(userId) === socket.id) {
      userSocketById.delete(userId);
    }
    if (streamId && socket.data?.role === "viewer") {
      await decViewers(streamId);
    }
  });
});

server.listen(PORT, () => {
  console.log(`✅ Live socket server running on :${PORT}`);
});
