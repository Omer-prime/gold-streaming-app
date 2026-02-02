// admin-api/live-socket-server.cjs

require("dotenv").config();
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
const userSocketById = new Map();  // userId -> socket.id (last seen)
const pkTimers = new Map();        // battleId -> timeout

function clampInt(n, min, max) {
  const x = Number(n);
  if (!Number.isFinite(x)) return min;
  return Math.max(min, Math.min(max, x | 0));
}

function normalizePkSide(v) {
  const s = String(v || "").toUpperCase();
  return s === "OPPONENT" ? "OPPONENT" : s === "HOST" ? "HOST" : null;
}

async function getStream(streamId) {
  return prisma.stream.findUnique({
    where: { id: streamId },
    select: { hostId: true, isLive: true },
  });
}

async function getStreamHostId(streamId) {
  const s = await getStream(streamId);
  if (!s?.isLive) return null;
  return s.hostId;
}

async function setViewers(streamId, count) {
  const viewers = Math.max(0, count | 0);
  viewersByStream.set(streamId, viewers);

  await prisma.stream
    .update({ where: { id: streamId }, data: { viewers } })
    .catch(() => null);

  const hostId = await getStreamHostId(streamId);
  if (hostId) {
    await prisma.user
      .update({ where: { id: hostId }, data: { liveViewers: viewers } })
      .catch(() => null);
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

function clearPkTimer(battleId) {
  const t = pkTimers.get(battleId);
  if (t) clearTimeout(t);
  pkTimers.delete(battleId);
}

async function findActivePkBattle(streamId) {
  return prisma.pKBattle.findFirst({
    where: { streamId, status: "ACTIVE" },
    select: {
      id: true,
      hostId: true,
      opponentId: true,
      streamId: true,
      status: true,
      hostScore: true,
      opponentScore: true,
      durationSec: true,
      startedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

async function finalizePkBattle(battleId) {
  // DB is the truth: compute winner from stored scores
  const ended = await prisma.$transaction(async (tx) => {
    const b = await tx.pKBattle.findUnique({
      where: { id: battleId },
      select: {
        id: true,
        streamId: true,
        status: true,
        hostId: true,
        opponentId: true,
        hostScore: true,
        opponentScore: true,
      },
    });

    if (!b || b.status !== "ACTIVE") return null;

    let winnerSide = null;
    if (b.hostScore > b.opponentScore) winnerSide = "HOST";
    else if (b.opponentScore > b.hostScore) winnerSide = "OPPONENT";
    else winnerSide = null; // tie

    const loserSide =
      winnerSide === "HOST" ? "OPPONENT" : winnerSide === "OPPONENT" ? "HOST" : null;

    // keep legacy hostWon updated too
    const hostWon =
      winnerSide === "HOST" ? true : winnerSide === "OPPONENT" ? false : null;

    const updated = await tx.pKBattle.update({
      where: { id: battleId },
      data: {
        status: "ENDED",
        endedAt: new Date(),
        winnerSide: winnerSide,
        hostWon: hostWon,
      },
      select: {
        id: true,
        streamId: true,
        hostId: true,
        opponentId: true,
        hostScore: true,
        opponentScore: true,
        winnerSide: true,
        endedAt: true,
      },
    });

    return {
      ...updated,
      loserSide,
    };
  });

  if (!ended) return null;

  io.to(roomName(ended.streamId)).emit("pkEnded", {
    battleId: ended.id,
    streamId: ended.streamId,
    hostId: ended.hostId,
    opponentId: ended.opponentId,
    hostScore: ended.hostScore,
    opponentScore: ended.opponentScore,
    winnerSide: ended.winnerSide,
    loserSide: ended.loserSide,
    endedAt: ended.endedAt ? new Date(ended.endedAt).getTime() : Date.now(),
  });

  clearPkTimer(ended.id);
  return ended;
}

io.on("connection", (socket) => {
  socket.data.left = false;

  socket.on("joinLive", async (payload, cb) => {
    try {
      const { streamId, userId, name, role } = payload || {};
      if (!streamId || !userId) return cb?.({ error: "streamId & userId required" });

      socket.data.streamId = streamId;
      socket.data.userId = userId;
      socket.data.name = (name || "Guest").slice(0, 40);
      socket.data.role = role === "host" ? "host" : "viewer";
      socket.data.left = false;

      userSocketById.set(userId, socket.id);
      socket.join(roomName(streamId));

      if (socket.data.role === "viewer") await incViewers(streamId);

      cb?.({ ok: true });

      // optional system feed
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
      if (streamId && socket.data?.role === "viewer" && !socket.data.left) {
        socket.data.left = true; // prevent double decrement
        await decViewers(streamId);
      }
      if (streamId) socket.leave(roomName(streamId));
      cb?.({ ok: true });
    } catch {
      cb?.({ ok: true });
    }
  });

  // CHAT
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

  // FOLLOW
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

  // GIFTS ✅ routes to correct PK side if ACTIVE
  socket.on("sendGift", async (payload, cb) => {
    try {
      const { streamId, senderId, giftId, quantity, targetSide, pkBattleId } = payload || {};
      if (!streamId || !senderId || !giftId) return cb?.({ error: "missing fields" });

      const qty = clampInt(quantity || 1, 1, 999);
      const side = normalizePkSide(targetSide); // "HOST" | "OPPONENT" | null

      const [gift, stream] = await Promise.all([
        prisma.gift.findUnique({
          where: { id: Number(giftId) },
          select: {
            id: true,
            name: true,
            price: true,
            isActive: true,
            thumbnailUrl: true,
            mediaType: true,
            mediaUrl: true,
            iconUrl: true,
          },
        }),
        getStream(streamId),
      ]);

      if (!gift || !gift.isActive) return cb?.({ error: "gift not found" });
      if (!stream?.isLive) return cb?.({ error: "stream not live" });

      // Determine PK context (ACTIVE only)
      let activeBattle = null;

      if (pkBattleId) {
        const b = await prisma.pKBattle.findUnique({
          where: { id: String(pkBattleId) },
          select: {
            id: true,
            streamId: true,
            status: true,
            hostId: true,
            opponentId: true,
            hostScore: true,
            opponentScore: true,
          },
        });
        if (b && b.status === "ACTIVE" && b.streamId === streamId) activeBattle = b;
      }

      if (!activeBattle) {
        activeBattle = await findActivePkBattle(streamId);
      }

      const total = gift.price * qty;

      // Who receives coins?
      let receiverId = stream.hostId; // default
      let effectivePkBattleId = null;
      let effectiveTargetSide = null;

      if (activeBattle && side) {
        effectivePkBattleId = activeBattle.id;
        effectiveTargetSide = side;

        if (side === "OPPONENT" && activeBattle.opponentId) receiverId = activeBattle.opponentId;
        else receiverId = activeBattle.hostId;
      }

      if (senderId === receiverId) return cb?.({ error: "cannot send gift to self" });

      const result = await prisma.$transaction(async (tx) => {
        const senderWallet = await tx.wallet.upsert({
          where: { userId: senderId },
          create: { userId: senderId, balance: 0 },
          update: {},
          select: { id: true, balance: true, userId: true },
        });

        if (senderWallet.balance < total) throw new Error("INSUFFICIENT_BALANCE");

        const receiverWallet = await tx.wallet.upsert({
          where: { userId: receiverId },
          create: { userId: receiverId, balance: 0 },
          update: {},
          select: { id: true, balance: true, userId: true },
        });

        const senderAfter = senderWallet.balance - total;
        const receiverAfter = receiverWallet.balance + total;

        await tx.wallet.update({ where: { id: senderWallet.id }, data: { balance: senderAfter } });
        await tx.wallet.update({ where: { id: receiverWallet.id }, data: { balance: receiverAfter } });

        // Optional but strongly recommended ledger entries (your schema supports it)
        await tx.walletLedger.create({
          data: {
            userId: senderId,
            walletId: senderWallet.id,
            type: "GIFT_SENT",
            delta: -total,
            balanceAfter: senderAfter,
            title: `Gift sent: ${gift.name} x${qty}`,
            metaJson: { streamId, giftId: gift.id, qty, to: receiverId, pkBattleId: effectivePkBattleId, targetSide: effectiveTargetSide },
          },
        });

        await tx.walletLedger.create({
          data: {
            userId: receiverId,
            walletId: receiverWallet.id,
            type: "GIFT_RECEIVED",
            delta: total,
            balanceAfter: receiverAfter,
            title: `Gift received: ${gift.name} x${qty}`,
            metaJson: { streamId, giftId: gift.id, qty, from: senderId, pkBattleId: effectivePkBattleId, targetSide: effectiveTargetSide },
          },
        });

        const gt = await tx.giftTransaction.create({
          data: {
            streamId,
            giftId: gift.id,
            senderId,
            receiverId: receiverId,
            // walletId: receiver wallet is the most meaningful for "received" transactions
            walletId: receiverWallet.id,
            quantity: qty,
            unitPrice: gift.price,
            totalPrice: total,
            pkBattleId: effectivePkBattleId,
            targetSide: effectiveTargetSide,
          },
          select: { id: true, createdAt: true },
        });

        await tx.user.update({ where: { id: senderId }, data: { totalCoinsSpent: { increment: total } } });
        await tx.user.update({ where: { id: receiverId }, data: { totalCoinsReceived: { increment: total } } });

        // Update PK scores in DB (real-time truth)
        let pkScore = null;
        if (effectivePkBattleId && effectiveTargetSide) {
          const updatedBattle = await tx.pKBattle.update({
            where: { id: effectivePkBattleId },
            data:
              effectiveTargetSide === "OPPONENT"
                ? { opponentScore: { increment: total } }
                : { hostScore: { increment: total } },
            select: { id: true, hostScore: true, opponentScore: true, hostId: true, opponentId: true, streamId: true },
          });

          pkScore = {
            battleId: updatedBattle.id,
            hostScore: updatedBattle.hostScore,
            opponentScore: updatedBattle.opponentScore,
            hostId: updatedBattle.hostId,
            opponentId: updatedBattle.opponentId,
            streamId: updatedBattle.streamId,
          };
        }

        return { giftTransactionId: gt.id, at: gt.createdAt.getTime(), receiverId, pkScore };
      });

      io.to(roomName(streamId)).emit("gift", {
        id: result.giftTransactionId,
        streamId,
        senderId,
        receiverId: result.receiverId,
        pkBattleId: effectivePkBattleId,
        targetSide: effectiveTargetSide,
        gift: {
          id: gift.id,
          name: gift.name,
          price: gift.price,
          thumbnailUrl: gift.thumbnailUrl,
          mediaType: gift.mediaType,
          mediaUrl: gift.mediaUrl,
          iconUrl: gift.iconUrl,
        },
        quantity: qty,
        total,
        at: result.at,
        senderName: socket.data?.name || "Guest",
      });

      // Realtime scoreboard update
      if (result.pkScore) {
        io.to(roomName(streamId)).emit("pkScore", {
          battleId: result.pkScore.battleId,
          streamId: result.pkScore.streamId,
          hostId: result.pkScore.hostId,
          opponentId: result.pkScore.opponentId,
          hostScore: result.pkScore.hostScore,
          opponentScore: result.pkScore.opponentScore,
          at: Date.now(),
        });
      }

      cb?.({ ok: true });
    } catch (e) {
      if (String(e?.message) === "INSUFFICIENT_BALANCE") return cb?.({ error: "Insufficient balance" });
      console.error("sendGift error", e);
      cb?.({ error: "gift failed" });
    }
  });

  // PK (invite/accept + auto-end + winner)
  socket.on("pkInvite", async (payload, cb) => {
    try {
      const { streamId, hostId, opponentId, durationSec } = payload || {};
      if (!streamId || !hostId || !opponentId) return cb?.({ error: "missing fields" });

      // Only allow the real stream host to invite
      const streamHostId = await getStreamHostId(streamId);
      if (!streamHostId) return cb?.({ error: "stream not live" });
      if (streamHostId !== hostId) return cb?.({ error: "only host can invite" });
      if (socket.data?.userId !== hostId) return cb?.({ error: "auth mismatch" });

      // Block multiple active/pending battles for same stream
      const existing = await prisma.pKBattle.findFirst({
        where: { streamId, status: { in: ["PENDING", "ACTIVE"] } },
        select: { id: true, status: true },
        orderBy: { createdAt: "desc" },
      });
      if (existing) return cb?.({ error: "pk already running/pending" });

      const oppSocketId = userSocketById.get(opponentId);
      if (!oppSocketId) return cb?.({ error: "opponent not online" });

      const battle = await prisma.pKBattle.create({
        data: {
          type: "FRIEND",
          status: "PENDING",
          hostId,
          opponentId,
          streamId,
          durationSec: clampInt(durationSec || 180, 30, 600),
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
        select: { id: true, streamId: true, status: true, durationSec: true, hostId: true, opponentId: true },
      });
      if (!battle || battle.status !== "PENDING") return cb?.({ error: "invalid battle" });

      // Only opponent can accept/decline
      if (!battle.opponentId || socket.data?.userId !== battle.opponentId) {
        return cb?.({ error: "only opponent can respond" });
      }

      if (!accept) {
        await prisma.pKBattle.update({
          where: { id: battleId },
          data: { status: "CANCELED", endedAt: new Date() },
        });
        clearPkTimer(battleId);
        io.to(roomName(battle.streamId)).emit("pkCanceled", { battleId });
        return cb?.({ ok: true });
      }

      const started = await prisma.pKBattle.update({
        where: { id: battleId },
        data: { status: "ACTIVE", startedAt: new Date() },
        select: {
          id: true,
          startedAt: true,
          durationSec: true,
          hostId: true,
          opponentId: true,
          streamId: true,
          hostScore: true,
          opponentScore: true,
        },
      });

      io.to(roomName(started.streamId)).emit("pkStarted", {
        battleId: started.id,
        hostId: started.hostId,
        opponentId: started.opponentId,
        startedAt: started.startedAt.getTime(),
        durationSec: started.durationSec || 180,
        hostScore: started.hostScore || 0,
        opponentScore: started.opponentScore || 0,
      });

      // Auto-end
      clearPkTimer(started.id);
      pkTimers.set(
        started.id,
        setTimeout(async () => {
          try {
            await finalizePkBattle(started.id);
          } catch (e) {
            console.error("auto-end pk error", e);
          }
        }, (started.durationSec || 180) * 1000)
      );

      cb?.({ ok: true });
    } catch (e) {
      console.error("pkRespond error", e);
      cb?.({ error: "pk respond failed" });
    }
  });

  // Optional: allow host to force-end PK
  socket.on("pkForceEnd", async (payload, cb) => {
    try {
      const { battleId } = payload || {};
      if (!battleId) return cb?.({ error: "battleId required" });

      const b = await prisma.pKBattle.findUnique({
        where: { id: battleId },
        select: { id: true, hostId: true, status: true },
      });
      if (!b || b.status !== "ACTIVE") return cb?.({ error: "invalid battle" });

      if (socket.data?.userId !== b.hostId) return cb?.({ error: "only host can end" });

      await finalizePkBattle(battleId);
      cb?.({ ok: true });
    } catch (e) {
      console.error("pkForceEnd error", e);
      cb?.({ error: "pk end failed" });
    }
  });

  socket.on("disconnect", async () => {
    const streamId = socket.data?.streamId;
    const userId = socket.data?.userId;

    if (userId && userSocketById.get(userId) === socket.id) {
      userSocketById.delete(userId);
    }

    if (streamId && socket.data?.role === "viewer" && !socket.data.left) {
      socket.data.left = true;
      await decViewers(streamId);
    }
  });
});

server.listen(PORT, () => {
  console.log(`✅ Live socket server running on :${PORT}`);
});
