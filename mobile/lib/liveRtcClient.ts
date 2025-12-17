import { io, Socket } from "socket.io-client";
import * as mediasoupClient from "mediasoup-client";
import { MediaStream, mediaDevices } from "react-native-webrtc";
import { API_BASE_URL } from "../src/config";
import { ensureWebRTCGlobals } from "./webrtcGlobals";

type JoinResp = { rtpCapabilities: any; producerIds: string[] };

type SocketAck<T> = (res: T | { error: string }) => void;

function socketCall<T = any>(socket: Socket, event: string, payload: any) {
  return new Promise<T>((resolve, reject) => {
    socket.emit(event, payload, ((res: any) => {
      if (!res) return resolve(res);
      if (res?.error) return reject(new Error(String(res.error)));
      resolve(res as T);
    }) as SocketAck<T>);
  });
}

export async function startBroadcast(params: {
  streamId: string;
  userId: string;
  name: string;
}) {
  ensureWebRTCGlobals();

  const socket = io(API_BASE_URL, {
    path: "/socket.io",
    transports: ["websocket"],
  });

  const join = await socketCall<JoinResp>(socket, "join", {
    streamId: params.streamId,
    userId: params.userId,
    name: params.name,
    role: "host",
  });

  const device = new mediasoupClient.Device();
  await device.load({ routerRtpCapabilities: join.rtpCapabilities });

  const sendTransportOpts = await socketCall<any>(socket, "createWebRtcTransport", {
    streamId: params.streamId,
    direction: "send",
  });

  const sendTransport = device.createSendTransport(sendTransportOpts);

  sendTransport.on(
    "connect",
    (
      { dtlsParameters }: { dtlsParameters: any },
      cb: () => void,
      errCb: (err: any) => void
    ) => {
      socketCall(socket, "connectTransport", {
        streamId: params.streamId,
        transportId: sendTransport.id,
        dtlsParameters,
      })
        .then(() => cb())
        .catch(errCb);
    }
  );

  sendTransport.on(
    "produce",
    (
      {
        kind,
        rtpParameters,
        appData,
      }: { kind: any; rtpParameters: any; appData: any },
      cb: (p: { id: string }) => void,
      errCb: (err: any) => void
    ) => {
      socketCall<{ id: string }>(socket, "produce", {
        streamId: params.streamId,
        transportId: sendTransport.id,
        kind,
        rtpParameters,
        appData,
      })
        .then((res) => cb({ id: res.id }))
        .catch(errCb);
    }
  );

  const localStream: MediaStream = await mediaDevices.getUserMedia({
    audio: true,
    video: { facingMode: "user", width: 720, height: 1280, frameRate: 24 },
  });

  const videoTrack = localStream.getVideoTracks()[0];
  const audioTrack = localStream.getAudioTracks()[0];

  if (videoTrack) await sendTransport.produce({ track: videoTrack, appData: { media: "video" } });
  if (audioTrack) await sendTransport.produce({ track: audioTrack, appData: { media: "audio" } });

  const stop = async () => {
    try { localStream.getTracks().forEach((t) => t.stop()); } catch {}
    try { sendTransport.close(); } catch {}
    try { socket.emit("leave"); } catch {}
    try { socket.disconnect(); } catch {}
  };

  return {
    socket,
    localStream,
    sendChat: (text: string) =>
      socket.emit("chat", {
        streamId: params.streamId,
        userId: params.userId,
        name: params.name,
        text,
      }),
    onChat: (fn: (msg: any) => void) => socket.on("chat", fn),
    onSystem: (fn: (msg: any) => void) => socket.on("system", fn),
    onViewerCount: (fn: (msg: any) => void) => socket.on("viewerCount", fn),
    stop,
  };
}

export async function joinBroadcast(params: {
  streamId: string;
  userId: string;
  name: string;
}) {
  ensureWebRTCGlobals();

  const socket = io(API_BASE_URL, {
    path: "/socket.io",
    transports: ["websocket"],
  });

  const join = await socketCall<JoinResp>(socket, "join", {
    streamId: params.streamId,
    userId: params.userId,
    name: params.name,
    role: "viewer",
  });

  const device = new mediasoupClient.Device();
  await device.load({ routerRtpCapabilities: join.rtpCapabilities });

  const recvTransportOpts = await socketCall<any>(socket, "createWebRtcTransport", {
    streamId: params.streamId,
    direction: "recv",
  });

  const recvTransport = device.createRecvTransport(recvTransportOpts);

  recvTransport.on(
    "connect",
    (
      { dtlsParameters }: { dtlsParameters: any },
      cb: () => void,
      errCb: (err: any) => void
    ) => {
      socketCall(socket, "connectTransport", {
        streamId: params.streamId,
        transportId: recvTransport.id,
        dtlsParameters,
      })
        .then(() => cb())
        .catch(errCb);
    }
  );

  const remoteStream = new MediaStream();

  async function consumeProducer(producerId: string) {
    const consumeRes = await socketCall<any>(socket, "consume", {
      streamId: params.streamId,
      transportId: recvTransport.id,
      producerId,
      rtpCapabilities: device.rtpCapabilities,
    });

    const consumer = await recvTransport.consume({
      id: consumeRes.id,
      producerId: consumeRes.producerId,
      kind: consumeRes.kind,
      rtpParameters: consumeRes.rtpParameters,
    });

    remoteStream.addTrack(consumer.track);

    await socketCall(socket, "resume", {
      streamId: params.streamId,
      consumerId: consumer.id,
    });
  }

  for (const pid of join.producerIds || []) {
    try { await consumeProducer(pid); } catch {}
  }

  socket.on("newProducer", async ({ producerId }) => {
    try { await consumeProducer(producerId); } catch {}
  });

  const stop = async () => {
    try { recvTransport.close(); } catch {}
    try { socket.emit("leave"); } catch {}
    try { socket.disconnect(); } catch {}
  };

  return {
    socket,
    remoteStream,
    sendChat: (text: string) =>
      socket.emit("chat", {
        streamId: params.streamId,
        userId: params.userId,
        name: params.name,
        text,
      }),
    onChat: (fn: (msg: any) => void) => socket.on("chat", fn),
    onSystem: (fn: (msg: any) => void) => socket.on("system", fn),
    onViewerCount: (fn: (msg: any) => void) => socket.on("viewerCount", fn),
    stop,
  };
}
