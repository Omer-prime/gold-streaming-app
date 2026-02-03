// admin-api/live-socket-server.cjs

require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const PORT = process.env.LIVE_SOCKET_PORT || 4001;

/**
 * ✅ TikTok-like gifting economics (schema-aligned)
 *
 * - Sender spends COINS from Wallet.balance
 * - Host earns POINTS (diamonds) in UserPointLedger (withdrawable)
 * - Host does NOT receive spendable coins in Wallet.balance from gifts
 *
 * GIFT_EARNINGS_RATIO: portion of gift COINS that converts to points earnings.
 *   1.0 = 100% of coin value becomes earnings (points)
 *   0.5 = 50% becomes earnings (rest is platform fee)
 *
 * COIN_TO_POINT_RATE: how many points per 1 coin (usually 1)
 */
const GIFT_EARNINGS_RATIO = Math.max(
  0,
  Math.min(1, Number(process.env.GIFT_EARNINGS_RATIO ?? "1"))
);

const COIN_TO_POINT_RATE = Math.max(
  1,
  Number(process.env.COIN_TO_POINT_RATE ?? "1")
);

// If host disconnects, wait a bit before ending stream automatically
const HOST_DISCONNECT_GRACE_SEC = Math.max(
  3,
  Math.min(60, Number(process.env.HOST_DISCONNECT_GRACE_SEC ?? "12"))
);

const server = http.createServer();
const io = new Server(server, {
  path: "/socket.io",
  cors: { origin: "*", methods: ["GET", "POST"] },
});

const roomName = (streamId) => `stream:${streamId}`;

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

/* -------------------------------------------------------------------------- */
/*  In-memory tracking                                                        */
/*  (IMPORTANT: Avoid Map inc/dec race; track actual socket membership)        */
/* -------------------------------------------------------------------------- */

const userSocketById = new Map(); // userId -> socket.id (last seen)
const pkTimers = new Map(); // battleId -> timeout

const viewerSocketsByStream = new Map(); // streamId -> Set(socket.id)
const hostSocketsByStream = new Map(); // streamId -> Set(socket.id)

const viewerPersistTimers = new Map(); // streamId -> timeout
const hostDisconnectTimers = new Map(); // streamId -> timeout

function getSet(map, key) {
  let s = map.get(key);
  if (!s) {
    s = new Set();
    map.set(key, s);
  }
  return s;
}

function removeFromAllStreams(socket) {
  const { streamId, role } = socket.data || {};
  if (!streamId) return;

  const viewers = viewerSocketsByStream.get(streamId);
  const hosts = hostSocketsByStream.get(streamId);

  if (role === "viewer" && viewers) viewers.delete(socket.id);
  if (role === "host" && hosts) hosts.delete(socket.id);

  if (viewers && viewers.size === 0) viewerSocketsByStream.delete(streamId);
  if (hosts && hosts.size === 0) hostSocketsByStream.delete(streamId);

  schedulePersistViewers(streamId);
}

async function persistViewers(streamId) {
  const viewers = viewerSocketsByStream.get(streamId)?.size || 0;

  // Update stream viewers
  await prisma.stream
    .update({ where: { id: streamId }, data: { viewers } })
    .catch(() => null);

  // Update host liveViewers too
  const hostId = await getStreamHostId(streamId);
  if (hostId) {
    await prisma.user
      .update({ where: { id: hostId }, data: { liveViewers: viewers } })
      .catch(() => null);
  }

  io.to(roomName(streamId)).emit("viewerCount", { streamId, count: viewers });
}

function schedulePersistViewers(streamId) {
  if (!streamId) return;
  if (viewerPersistTimers.has(streamId)) return;

  viewerPersistTimers.set(
    streamId,
    setTimeout(async () => {
      viewerPersistTimers.delete(streamId);
      try {
        await persistViewers(streamId);
      } catch {}
    }, 400) // small debounce (reduces DB spam)
  );
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
    else winnerSide = null;

    const loserSide =
      winnerSide === "HOST"
        ? "OPPONENT"
        : winnerSide === "OPPONENT"
        ? "HOST"
        : null;

    const hostWon =
      winnerSide === "HOST" ? true : winnerSide === "OPPONENT" ? false : null;

    const updated = await tx.pKBattle.update({
      where: { id: battleId },
      data: {
        status: "ENDED",
        endedAt: new Date(),
        winnerSide,
        hostWon,
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

    return { ...updated, loserSide };
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

/* -------------------------------------------------------------------------- */
/*  Stream end handling (fixes your "cross icon" issue)                        */
/* -------------------------------------------------------------------------- */

async function endStream(streamId, reason = "ENDED") {
  // Mark stream not live + reset viewers
  await prisma.stream
    .update({ where: { id: streamId }, data: { isLive: false, viewers: 0 } })
    .catch(() => null);

  // End any active PK battle (optional but best)
  const active = await findActivePkBattle(streamId).catch(() => null);
  if (active?.id) {
    await finalizePkBattle(active.id).catch(() => null);
  }

  // Clear memory
  viewerSocketsByStream.delete(streamId);
  hostSocketsByStream.delete(streamId);
  schedulePersistViewers(streamId);

  // Notify clients
  io.to(roomName(streamId)).emit("liveEnded", { streamId, reason, at: Date.now() });

  // Force everyone to leave the room (keeps socket connection alive)
  const room = io.sockets.adapter.rooms.get(roomName(streamId));
  if (room) {
    for (const sid of room) {
      const s = io.sockets.sockets.get(sid);
      if (s) {
        s.leave(roomName(streamId));
        if (s.data?.streamId === streamId) {
          s.data.streamId = null;
          s.data.role = null;
          s.data.left = true;
        }
      }
    }
  }
}

function clearHostDisconnectTimer(streamId) {
  const t = hostDisconnectTimers.get(streamId);
  if (t) clearTimeout(t);
  hostDisconnectTimers.delete(streamId);
}

function scheduleHostDisconnectAutoEnd(streamId) {
  if (!streamId) return;
  if (hostDisconnectTimers.has(streamId)) return;

  hostDisconnectTimers.set(
    streamId,
    setTimeout(async () => {
      hostDisconnectTimers.delete(streamId);

      // If host came back (has host sockets), do nothing
      const hostSet = hostSocketsByStream.get(streamId);
      if (hostSet && hostSet.size > 0) return;

      // Otherwise end the stream
      await endStream(streamId, "HOST_DISCONNECTED");
    }, HOST_DISCONNECT_GRACE_SEC * 1000)
  );
}

/* -------------------------------------------------------------------------- */
/*  Socket                                                                     */
/* -------------------------------------------------------------------------- */

io.on("connection", (socket) => {
  socket.data.left = false;

  socket.on("joinLive", async (payload, cb) => {
    try {
      const { streamId, userId, name, role } = payload || {};
      if (!streamId || !userId) return cb?.({ error: "streamId & userId required" });

      // If socket was previously in a stream, clean up
      removeFromAllStreams(socket);

      const stream = await getStream(streamId);
      if (!stream?.isLive) return cb?.({ error: "stream not live" });

      socket.data.streamId = streamId;
      socket.data.userId = String(userId);
      socket.data.name = (name || "Guest").slice(0, 40);
      socket.data.role = role === "host" ? "host" : "viewer";
      socket.data.left = false;

      userSocketById.set(String(userId), socket.id);
      socket.join(roomName(streamId));

      if (socket.data.role === "viewer") {
        getSet(viewerSocketsByStream, streamId).add(socket.id);
        schedulePersistViewers(streamId);
      } else {
        getSet(hostSocketsByStream, streamId).add(socket.id);
        clearHostDisconnectTimer(streamId); // host is back
      }

      // optional: send active PK state on join (helps resync UI)
      const activeBattle = await findActivePkBattle(streamId).catch(() => null);

      cb?.({ ok: true, activeBattle: activeBattle || null });

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
      if (streamId) {
        socket.data.left = true;
        removeFromAllStreams(socket);
        socket.leave(roomName(streamId));

        // If host left, consider auto-ending (optional)
        if (socket.data?.role === "host") {
          const hostSet = hostSocketsByStream.get(streamId);
          if (!hostSet || hostSet.size === 0) scheduleHostDisconnectAutoEnd(streamId);
        }
      }
      cb?.({ ok: true });
    } catch {
      cb?.({ ok: true });
    }
  });

  /**
   * ✅ NEW: endLive (call this when host clicks the "X" / cross icon)
   * Client: socket.emit("endLive", { streamId, hostId }, cb)
   */
  socket.on("endLive", async (payload, cb) => {
    try {
      const { streamId, hostId } = payload || {};
      if (!streamId || !hostId) return cb?.({ error: "missing fields" });

      // Only allow actual stream host to end
      const stream = await getStream(streamId);
      if (!stream?.isLive) return cb?.({ error: "stream not live" });
      if (String(stream.hostId) !== String(hostId)) return cb?.({ error: "only host can end" });
      if (String(socket.data?.userId) !== String(hostId)) return cb?.({ error: "auth mismatch" });

      await endStream(streamId, "HOST_ENDED");
      cb?.({ ok: true });
    } catch (e) {
      console.error("endLive error", e);
      cb?.({ error: "end live failed" });
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
          senderId: String(userId),
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

      const hostSocketId = userSocketById.get(String(followingId));
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

  // GIFTS ✅ (coins -> points, schema-aligned) + structured insufficient balance for Buy-Coins popup
  socket.on("sendGift", async (payload, cb) => {
    try {
      const { streamId, senderId, giftId, quantity, targetSide, pkBattleId } = payload || {};
      if (!streamId || !senderId || !giftId) return cb?.({ error: "missing fields" });

      const qty = clampInt(quantity || 1, 1, 999);
      const side = normalizePkSide(targetSide);

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

      // PK context (ACTIVE only)
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

      if (!activeBattle) activeBattle = await findActivePkBattle(streamId);

      const unitPrice = clampInt(gift.price, 0, 1_000_000_000);
      const total = unitPrice * qty; // gross coins

      let receiverId = stream.hostId;
      let effectivePkBattleId = null;
      let effectiveTargetSide = null;

      if (activeBattle && side) {
        effectivePkBattleId = activeBattle.id;
        effectiveTargetSide = side;

        if (side === "OPPONENT" && activeBattle.opponentId) receiverId = activeBattle.opponentId;
        else receiverId = activeBattle.hostId;
      }

      if (String(senderId) === String(receiverId)) {
        return cb?.({ error: "cannot send gift to self" });
      }

      // Earnings split: gross coins -> (earnings coins eq) -> points
      const earningsCoinsEq = Math.floor(total * GIFT_EARNINGS_RATIO);
      const platformFeeCoins = total - earningsCoinsEq;
      const pointsCredited = Math.max(0, earningsCoinsEq * COIN_TO_POINT_RATE);

      const result = await prisma.$transaction(async (tx) => {
        const senderWallet = await tx.wallet.upsert({
          where: { userId: String(senderId) },
          create: { userId: String(senderId), balance: 0 },
          update: {},
          select: { id: true, balance: true, userId: true },
        });

        if (senderWallet.balance < total) {
          const needed = total - senderWallet.balance;
          const err = new Error("INSUFFICIENT_BALANCE");
          err.code = "INSUFFICIENT_BALANCE";
          err.needed = needed;
          err.total = total;
          throw err;
        }

        const senderAfter = senderWallet.balance - total;

        await tx.wallet.update({
          where: { id: senderWallet.id },
          data: { balance: senderAfter },
        });

        // Sender wallet ledger (coins history)
        await tx.walletLedger.create({
          data: {
            userId: String(senderId),
            walletId: senderWallet.id,
            type: "GIFT_SENT",
            delta: -total,
            balanceAfter: senderAfter,
            title: `Gift sent: ${gift.name} x${qty}`,
            metaJson: {
              streamId,
              giftId: gift.id,
              qty,
              to: String(receiverId),
              pkBattleId: effectivePkBattleId,
              targetSide: effectiveTargetSide,
              grossCoins: total,
              earningsCoinsEq,
              platformFeeCoins,
              pointsCredited,
              coinToPointRate: COIN_TO_POINT_RATE,
              ratio: GIFT_EARNINGS_RATIO,
            },
          },
        });

        // GiftTransaction: keep gross coins + PK linkage (walletId = sender wallet)
        const gt = await tx.giftTransaction.create({
          data: {
            streamId,
            giftId: gift.id,
            senderId: String(senderId),
            receiverId: String(receiverId),
            walletId: senderWallet.id, // ✅ sender wallet (coins spent)
            quantity: qty,
            unitPrice: unitPrice,
            totalPrice: total, // gross
            pkBattleId: effectivePkBattleId,
            targetSide: effectiveTargetSide,
          },
          select: { id: true, createdAt: true },
        });

        // Receiver earns POINTS (withdrawable) — NOT coins in wallet
        if (pointsCredited > 0) {
          await tx.userPointLedger.create({
            data: {
              userId: String(receiverId),
              delta: pointsCredited,
              reason: `GIFT_EARNED:${gt.id}:${gift.name}x${qty}`,
            },
          });
        }

        // Keep your counters for ranking/leaderboards (gross coins)
        await tx.user.update({
          where: { id: String(senderId) },
          data: { totalCoinsSpent: { increment: total } },
        });

        await tx.user.update({
          where: { id: String(receiverId) },
          data: { totalCoinsReceived: { increment: total } },
        });

        // Update PK scores by GROSS gift value (matches real PK logic)
        let pkScore = null;
        if (effectivePkBattleId && effectiveTargetSide) {
          const updatedBattle = await tx.pKBattle.update({
            where: { id: effectivePkBattleId },
            data:
              effectiveTargetSide === "OPPONENT"
                ? { opponentScore: { increment: total } }
                : { hostScore: { increment: total } },
            select: {
              id: true,
              hostScore: true,
              opponentScore: true,
              hostId: true,
              opponentId: true,
              streamId: true,
            },
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

        return {
          giftTransactionId: gt.id,
          at: gt.createdAt.getTime(),
          receiverId: String(receiverId),
          pkScore,
          grossTotal: total,
          earningsCoinsEq,
          platformFeeCoins,
          pointsCredited,
        };
      });

      io.to(roomName(streamId)).emit("gift", {
        id: result.giftTransactionId,
        streamId,
        senderId: String(senderId),
        receiverId: result.receiverId,
        pkBattleId: effectivePkBattleId,
        targetSide: effectiveTargetSide,
        gift: {
          id: gift.id,
          name: gift.name,
          price: unitPrice,
          thumbnailUrl: gift.thumbnailUrl,
          mediaType: gift.mediaType,
          mediaUrl: gift.mediaUrl,
          iconUrl: gift.iconUrl,
        },
        quantity: qty,
        total: result.grossTotal, // gross coins for UI/PK
        earningsCoinsEq: result.earningsCoinsEq, // coins-equivalent earnings (before rate)
        pointsCredited: result.pointsCredited, // ✅ what host actually earns (withdrawable)
        platformFeeCoins: result.platformFeeCoins,
        coinToPointRate: COIN_TO_POINT_RATE,
        ratio: GIFT_EARNINGS_RATIO,
        at: result.at,
        senderName: socket.data?.name || "Guest",
      });

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
      if (String(e?.message) === "INSUFFICIENT_BALANCE") {
        return cb?.({
          error: "Insufficient balance",
          code: "INSUFFICIENT_BALANCE",
          needed: e.needed ?? null,
          total: e.total ?? null,
        });
      }
      console.error("sendGift error", e);
      cb?.({ error: "gift failed" });
    }
  });

  // PK (invite/accept + auto-end + winner)
  socket.on("pkInvite", async (payload, cb) => {
    try {
      const { streamId, hostId, opponentId, durationSec } = payload || {};
      if (!streamId || !hostId || !opponentId) return cb?.({ error: "missing fields" });

      const streamHostId = await getStreamHostId(streamId);
      if (!streamHostId) return cb?.({ error: "stream not live" });
      if (String(streamHostId) !== String(hostId)) return cb?.({ error: "only host can invite" });
      if (String(socket.data?.userId) !== String(hostId)) return cb?.({ error: "auth mismatch" });

      const existing = await prisma.pKBattle.findFirst({
        where: { streamId, status: { in: ["PENDING", "ACTIVE"] } },
        select: { id: true, status: true },
        orderBy: { createdAt: "desc" },
      });
      if (existing) return cb?.({ error: "pk already running/pending" });

      const oppSocketId = userSocketById.get(String(opponentId));
      if (!oppSocketId) return cb?.({ error: "opponent not online" });

      const battle = await prisma.pKBattle.create({
        data: {
          type: "FRIEND",
          status: "PENDING",
          hostId: String(hostId),
          opponentId: String(opponentId),
          streamId,
          durationSec: clampInt(durationSec || 180, 30, 600),
        },
        select: { id: true, durationSec: true },
      });

      io.to(oppSocketId).emit("pkInvite", {
        battleId: battle.id,
        hostId: String(hostId),
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
        where: { id: String(battleId) },
        select: {
          id: true,
          streamId: true,
          status: true,
          durationSec: true,
          hostId: true,
          opponentId: true,
        },
      });
      if (!battle || battle.status !== "PENDING") return cb?.({ error: "invalid battle" });

      if (!battle.opponentId || String(socket.data?.userId) !== String(battle.opponentId)) {
        return cb?.({ error: "only opponent can respond" });
      }

      if (!accept) {
        await prisma.pKBattle.update({
          where: { id: String(battleId) },
          data: { status: "CANCELED", endedAt: new Date() },
        });
        clearPkTimer(String(battleId));
        io.to(roomName(battle.streamId)).emit("pkCanceled", { battleId: String(battleId) });
        return cb?.({ ok: true });
      }

      const started = await prisma.pKBattle.update({
        where: { id: String(battleId) },
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

  socket.on("pkForceEnd", async (payload, cb) => {
    try {
      const { battleId } = payload || {};
      if (!battleId) return cb?.({ error: "battleId required" });

      const b = await prisma.pKBattle.findUnique({
        where: { id: String(battleId) },
        select: { id: true, hostId: true, status: true },
      });
      if (!b || b.status !== "ACTIVE") return cb?.({ error: "invalid battle" });

      if (String(socket.data?.userId) !== String(b.hostId)) return cb?.({ error: "only host can end" });

      await finalizePkBattle(String(battleId));
      cb?.({ ok: true });
    } catch (e) {
      console.error("pkForceEnd error", e);
      cb?.({ error: "pk end failed" });
    }
  });

  socket.on("disconnect", async () => {
    const streamId = socket.data?.streamId;
    const userId = socket.data?.userId;

    if (userId && userSocketById.get(String(userId)) === socket.id) {
      userSocketById.delete(String(userId));
    }

    // remove from tracked sets + persist
    removeFromAllStreams(socket);

    // If host disconnected, schedule auto-end (grace)
    if (streamId && socket.data?.role === "host") {
      const hostSet = hostSocketsByStream.get(streamId);
      if (!hostSet || hostSet.size === 0) {
        scheduleHostDisconnectAutoEnd(streamId);
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`✅ Live socket server running on :${PORT}`);
});
