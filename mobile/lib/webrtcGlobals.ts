import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  MediaStream,
  MediaStreamTrack,
  mediaDevices,
} from "react-native-webrtc";

let done = false;

export function ensureWebRTCGlobals() {
  if (done) return;

  (global as any).RTCPeerConnection = RTCPeerConnection;
  (global as any).RTCIceCandidate = RTCIceCandidate;
  (global as any).RTCSessionDescription = RTCSessionDescription;
  (global as any).MediaStream = MediaStream;
  (global as any).MediaStreamTrack = MediaStreamTrack;

  (global as any).navigator = (global as any).navigator || {};
  (global as any).navigator.mediaDevices = mediaDevices;

  done = true;
}
