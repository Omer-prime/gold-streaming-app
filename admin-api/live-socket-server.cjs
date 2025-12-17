const http = require("http");
const { Server } = require("socket.io");
const mediasoup = require("mediasoup");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const PORT = process.env.LIVE_SOCKET_PORT || 4001;

// IMPORTANT for WebRTC on VM:
// - Set ANNOUNCED_IP = your VM public IP
// - Open UDP ports in firewall (see notes below)
const ANNOUNCED_IP = process.env.ANNOUNCED_IP || undefined;

const RTC_MIN_PORT = Number(process.env.RTC_MIN_PORT || 40000);
const RTC_MAX_PORT = Number(process.env.RTC_MAX_PORT || 40100);

const server = http.createServer();
const io = new Server(server, {
  path: "/socket.io",
  cors: { origin: "*", methods: ["GET", "POST"] },
});

const roomName = (streamId) => `stream:${streamId}`;

// ---------------- Viewer counts (your existing logic) ----------------
const viewersByStream = new Map(); // streamId -> number
const hostByStream = new Map(); // streamId -> hostId

async function ensureHostCached(streamId) {
  if (hostByStream.has(streamId)) return hostByStream.get(streamId);
  const s = await prisma.stream.findUnique({
    where: { id: streamId },
    select: { hostId: true },
  });
  if (s?.hostId) hostByStream.set(streamId, s.hostId);
  return s?.hostId || null;
}

async function syncViewerSnapshot(streamId) {
  const viewers = viewersByStream.get(streamId) || 0;
  const hostId = await ensureHostCached(streamId);

  await prisma.stream
    .update({ where: { id: streamId }, data: { viewers } })
    .catch(() => null);

  if (hostId) {
    await prisma.user
      .update({ where: { id: hostId }, data: { liveViewers: viewers } })
      .catch(() => null);
  }
}

function broadcastViewerCount(streamId) {
  io.to(roomName(streamId)).emit("viewerCount", {
    streamId,
    count: viewersByStream.get(streamId) || 0,
  });
}

// ---------------- mediasoup (SFU) ----------------
const mediaCodecs = [
  // Audio
  {
    kind: "audio",
    mimeType: "audio/opus",
    clockRate: 48000,
    channels: 2,
  },
  // Video (VP8 safest for mobile WebRTC)
  {
    kind: "video",
    mimeType: "video/VP8",
    clockRate: 90000,
    parameters: {},
  },
];

const rooms = new Map(); // streamId -> { worker, router, peers, producers }

async function getOrCreateRoom(streamId) {
  if (rooms.has(streamId)) return rooms.get(streamId);

  const worker = await mediasoup.createWorker({
    rtcMinPort: RTC_MIN_PORT,
    rtcMaxPort: RTC_MAX_PORT,
  });

  worker.on("died", () => {
    console.error("mediasoup worker died for room", streamId);
    rooms.delete(streamId);
  });

  const router = await worker.createRouter({ mediaCodecs });

  const room = {
    worker,
    router,
    peers: new Map(),     // socket.id -> peer
    producers: new Map(), // producerId -> producer
  };

  rooms.set(streamId, room);
  return room;
}

function getPeer(streamId, socketId) {
  const room = rooms.get(streamId);
  if (!room) return null;
  return room.peers.get(socketId) || null;
}

async function cleanupPeer(socket) {
  const streamId = socket.data?.streamId;
  if (!streamId) return;

  const room = rooms.get(streamId);
  if (!room) return;

  const peer = room.peers.get(socket.id);
  if (peer) {
    // close consumers
    for (const c of peer.consumers.values()) {
      try { c.close(); } catch {}
    }
    // close producers
    for (const p of peer.producers.values()) {
      try { p.close(); } catch {}
      room.producers.delete(p.id);
    }
    // close transports
    for (const t of peer.transports.values()) {
      try { t.close(); } catch {}
    }
    room.peers.delete(socket.id);
  }

  // viewer count decrement
  if (socket.data.role === "viewer") {
    const next = Math.max(0, (viewersByStream.get(streamId) || 0) - 1);
    viewersByStream.set(streamId, next);
    await syncViewerSnapshot(streamId);
    broadcastViewerCount(streamId);
  }

  // if room empty => close worker
  if (room.peers.size === 0) {
    try { room.worker.close(); } catch {}
    rooms.delete(streamId);
    viewersByStream.delete(streamId);
    hostByStream.delete(streamId);
  }
}

// ---------------- Socket Events ----------------
io.on("connection", (socket) => {
  // JOIN (returns rtpCapabilities + existing producers)
  socket.on("join", async (payload, cb) => {
    try {
      const { streamId, userId, name, role } = payload || {};
      if (!streamId || !userId) return cb?.({ error: "streamId and userId required" });

      const room = await getOrCreateRoom(streamId);

      socket.data.streamId = streamId;
      socket.data.userId = userId;
      socket.data.role = role || "viewer";
      socket.data.name = name || "Guest";

      socket.join(roomName(streamId));

      // register peer
      room.peers.set(socket.id, {
        socketId: socket.id,
        userId,
        name: socket.data.name,
        role: socket.data.role,
        transports: new Map(),
        producers: new Map(),
        consumers: new Map(),
      });

      // viewer count (only viewers)
      if (socket.data.role === "viewer") {
        viewersByStream.set(streamId, (viewersByStream.get(streamId) || 0) + 1);
        await syncViewerSnapshot(streamId);
        broadcastViewerCount(streamId);
      }

      io.to(roomName(streamId)).emit("system", {
        text: `${socket.data.name} joined`,
        at: Date.now(),
      });

      // send router caps + current producerIds
      const producerIds = Array.from(room.producers.keys());

      cb?.({
        rtpCapabilities: room.router.rtpCapabilities,
        producerIds,
      });
    } catch (e) {
      console.error("join error", e);
      cb?.({ error: "join failed" });
    }
  });

  // CREATE TRANSPORT
  socket.on("createWebRtcTransport", async (payload, cb) => {
    try {
      const { streamId, direction } = payload || {};
      if (!streamId) return cb?.({ error: "streamId required" });

      const room = await getOrCreateRoom(streamId);
      const peer = getPeer(streamId, socket.id);
      if (!peer) return cb?.({ error: "peer not joined" });

      const transport = await room.router.createWebRtcTransport({
        listenIps: [{ ip: "0.0.0.0", announcedIp: ANNOUNCED_IP }],
        enableUdp: true,
        enableTcp: true,
        preferUdp: true,
        initialAvailableOutgoingBitrate: 800000,
      });

      transport.on("dtlsstatechange", (state) => {
        if (state === "closed") {
          try { transport.close(); } catch {}
        }
      });

      peer.transports.set(transport.id, transport);

      cb?.({
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
      });
    } catch (e) {
      console.error("createWebRtcTransport error", e);
      cb?.({ error: "transport create failed" });
    }
  });

  // CONNECT TRANSPORT
  socket.on("connectTransport", async (payload, cb) => {
    try {
      const { streamId, transportId, dtlsParameters } = payload || {};
      const peer = getPeer(streamId, socket.id);
      if (!peer) return cb?.({ error: "peer not found" });

      const transport = peer.transports.get(transportId);
      if (!transport) return cb?.({ error: "transport not found" });

      await transport.connect({ dtlsParameters });
      cb?.({ ok: true });
    } catch (e) {
      console.error("connectTransport error", e);
      cb?.({ error: "connect failed" });
    }
  });

  // PRODUCE (host)
  socket.on("produce", async (payload, cb) => {
    try {
      const { streamId, transportId, kind, rtpParameters, appData } = payload || {};
      const room = rooms.get(streamId);
      const peer = getPeer(streamId, socket.id);
      if (!room || !peer) return cb?.({ error: "room/peer missing" });

      const transport = peer.transports.get(transportId);
      if (!transport) return cb?.({ error: "transport not found" });

      const producer = await transport.produce({ kind, rtpParameters, appData });

      peer.producers.set(producer.id, producer);
      room.producers.set(producer.id, producer);

      producer.on("transportclose", () => {
        peer.producers.delete(producer.id);
        room.producers.delete(producer.id);
        try { producer.close(); } catch {}
      });

      // notify viewers
      socket.to(roomName(streamId)).emit("newProducer", {
        producerId: producer.id,
        kind: producer.kind,
      });

      cb?.({ id: producer.id });
    } catch (e) {
      console.error("produce error", e);
      cb?.({ error: "produce failed" });
    }
  });

  // CONSUME (viewer)
  socket.on("consume", async (payload, cb) => {
    try {
      const { streamId, transportId, producerId, rtpCapabilities } = payload || {};
      const room = rooms.get(streamId);
      const peer = getPeer(streamId, socket.id);
      if (!room || !peer) return cb?.({ error: "room/peer missing" });

      if (!room.router.canConsume({ producerId, rtpCapabilities })) {
        return cb?.({ error: "cannot consume" });
      }

      const transport = peer.transports.get(transportId);
      if (!transport) return cb?.({ error: "transport not found" });

      const consumer = await transport.consume({
        producerId,
        rtpCapabilities,
        paused: true,
      });

      peer.consumers.set(consumer.id, consumer);

      consumer.on("transportclose", () => {
        peer.consumers.delete(consumer.id);
        try { consumer.close(); } catch {}
      });

      consumer.on("producerclose", () => {
        peer.consumers.delete(consumer.id);
        try { consumer.close(); } catch {}
        socket.emit("producerClosed", { producerId });
      });

      cb?.({
        id: consumer.id,
        producerId,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters,
      });
    } catch (e) {
      console.error("consume error", e);
      cb?.({ error: "consume failed" });
    }
  });

  socket.on("resume", async (payload, cb) => {
    try {
      const { streamId, consumerId } = payload || {};
      const peer = getPeer(streamId, socket.id);
      if (!peer) return cb?.({ error: "peer missing" });

      const consumer = peer.consumers.get(consumerId);
      if (!consumer) return cb?.({ error: "consumer missing" });

      await consumer.resume();
      cb?.({ ok: true });
    } catch (e) {
      console.error("resume error", e);
      cb?.({ error: "resume failed" });
    }
  });

  // CHAT (keep your existing)
  socket.on("chat", (payload) => {
    const { streamId, userId, name, text } = payload || {};
    if (!streamId || !userId || !text) return;

    io.to(roomName(streamId)).emit("chat", {
      id: String(Date.now()),
      userId,
      name: name || "Guest",
      text: String(text).slice(0, 500),
      at: Date.now(),
    });
  });

  // LEAVE / DISCONNECT cleanup
  socket.on("leave", async (_, cb) => {
    await cleanupPeer(socket);
    cb?.({ ok: true });
  });

  socket.on("disconnect", async () => {
    await cleanupPeer(socket);
  });
});

server.listen(PORT, () => {
  console.log(`✅ Live socket + SFU server running on :${PORT}`);
  console.log(`✅ ANNOUNCED_IP=${ANNOUNCED_IP || "(not set)"}`);
  console.log(`✅ RTC ports UDP ${RTC_MIN_PORT}-${RTC_MAX_PORT}`);
});
