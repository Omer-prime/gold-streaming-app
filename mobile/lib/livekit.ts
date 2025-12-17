import { AudioSession, registerGlobals } from "@livekit/react-native";

let globalsReady = false;

export function ensureLiveKitGlobals() {
  if (globalsReady) return;
  registerGlobals();
  globalsReady = true;
}

export async function startLiveKitAudio() {
  try {
    await AudioSession.startAudioSession();
  } catch {}
}

export async function stopLiveKitAudio() {
  try {
    await AudioSession.stopAudioSession();
  } catch {}
}
