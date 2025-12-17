import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "../src/config";

export function createLiveSocket(): Socket {
  return io(SOCKET_URL, {
    path: "/socket.io",
    transports: ["websocket"],
  });
}
