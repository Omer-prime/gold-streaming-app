// LiveRoomScreen.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config";

import {
  AudioSession,
  LiveKitRoom,
  VideoTrack,
  useTracks,
  isTrackReference,
  type TrackReferenceOrPlaceholder,
  type TrackReference,
} from "@livekit/react-native";
import { Track } from "livekit-client";

// ✅ Expo permissions for host camera/mic
import { Camera } from "expo-camera";
import { Audio } from "expo-av";

type ChatMsg = { id: string; text: string };

type TokenResp = {
  livekitUrl: string;
  roomName: string;
  token: string;
  stream: { id: string; title: string | null; hostId: string };
};

type StreamInfoResp = { isLive: boolean; viewers: number; title?: string | null };

const FILL = StyleSheet.absoluteFillObject;

/**
 * ✅ Normalize serverUrl:
 * LiveKit RN expects ws/wss for signal.
 * If backend returns https://, convert to wss://.
 */
function normalizeLiveKitUrl(url?: string | null) {
  const u = (url || "").trim();
  if (!u) return "";

  if (u.startsWith("wss://") || u.startsWith("ws://")) return u;
  if (u.startsWith("https://")) return u.replace("https://", "wss://");
  if (u.startsWith("http://")) return u.replace("http://", "ws://");

  // if backend returns domain only
  if (!u.includes("://")) return `wss://${u}`;

  return u;
}

/**
 * ✅ SAFER: pick any camera track if host identity mismatch happens.
 * You can re-enable strict hostId matching later.
 */
function pickAnyCameraTrack(tracks: TrackReferenceOrPlaceholder[]): TrackReference | null {
  const isRef = (t: TrackReferenceOrPlaceholder): t is TrackReference => isTrackReference(t);
  return tracks.find((t): t is TrackReference => isRef(t)) ?? null;
}

const DebugTracks = ({ hostId }: { hostId?: string }) => {
  const cams = useTracks([Track.Source.Camera]);
  return (
    <View style={{ position: "absolute", top: 88, left: 12, zIndex: 999 }}>
      <Text style={{ color: "#fff", fontSize: 11, fontWeight: "800" }}>
        camTracks: {cams.length} • hostId: {String(hostId || "").slice(0, 8)}
      </Text>
    </View>
  );
};

const StageVideo: React.FC<{ fallbackAvatarUrl?: string | null }> = ({ fallbackAvatarUrl }) => {
  const cameraTracks = useTracks([Track.Source.Camera]);
  const primary = useMemo(() => pickAnyCameraTrack(cameraTracks), [cameraTracks]);

  if (primary) return <VideoTrack trackRef={primary} style={FILL} />;

  if (fallbackAvatarUrl) {
    return (
      <Image source={{ uri: fallbackAvatarUrl }} style={FILL} resizeMode="cover" blurRadius={18} />
    );
  }

  return (
    <View style={[FILL, { alignItems: "center", justifyContent: "center" }]}>
      <Text style={{ color: "rgba(255,255,255,0.8)", fontWeight: "700" }}>Connecting video…</Text>
    </View>
  );
};

export default function LiveRoomScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { streamId, hostId, displayName, avatarUrl, isHost: isHostParam } = route.params || {};

  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [lk, setLk] = useState<TokenResp | null>(null);
  const [lkErr, setLkErr] = useState<string | null>(null);

  const [chat, setChat] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [viewerCount, setViewerCount] = useState<number>(0);
  const [streamTitle, setStreamTitle] = useState<string>("Live");
  const [checking, setChecking] = useState(true);

  const [isConnected, setIsConnected] = useState(false);

  // ✅ permissions readiness (host only)
  const [permReady, setPermReady] = useState<boolean>(false);

  // ✅ LIVE timer
  const [elapsedSec, setElapsedSec] = useState(0);

  const isHost = !!isHostParam || (!!myUserId && !!hostId && myUserId === hostId);

  // Audio session (iOS required, safe on Android)
  useEffect(() => {
    AudioSession.startAudioSession();
    return () => {
      AudioSession.stopAudioSession();
    };
  }, []);

  useEffect(() => {
    AsyncStorage.getItem("gl_user_id").then((id) => setMyUserId(id));
  }, []);

  // ✅ Start / reset timer based on connection
  useEffect(() => {
    if (!isConnected) {
      setElapsedSec(0);
      return;
    }

    const t0 = Date.now();
    const id = setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - t0) / 1000));
    }, 1000);

    return () => clearInterval(id);
  }, [isConnected]);

  const liveTimeLabel = useMemo(() => {
    const mm = String(Math.floor(elapsedSec / 60)).padStart(2, "0");
    const ss = String(elapsedSec % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }, [elapsedSec]);

  // ✅ Request permissions for HOST (otherwise camera publish fails)
  useEffect(() => {
    let alive = true;

    (async () => {
      if (!isHost) {
        if (alive) setPermReady(true);
        return;
      }

      const cam = await Camera.requestCameraPermissionsAsync();
      const mic = await Audio.requestPermissionsAsync();

      const ok = cam.status === "granted" && mic.status === "granted";
      if (alive) {
        setPermReady(ok);
        if (!ok) setLkErr("Camera/Microphone permission is required to go live.");
      }
    })();

    return () => {
      alive = false;
    };
  }, [isHost]);

  // Fetch LiveKit token
  useEffect(() => {
    if (!streamId || !myUserId) return;

    let cancelled = false;

    (async () => {
      try {
        setLkErr(null);
        setLk(null);

        const res = await fetch(`${API_BASE_URL}/api/live/token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: myUserId,
            streamId,
            role: isHost ? "host" : "viewer",
          }),
        });

        const json = (await res.json().catch(() => null)) as TokenResp | null;
        if (cancelled) return;

        if (!res.ok || !json?.token || !json?.livekitUrl) {
          setLkErr((json as any)?.error || "Failed to get LiveKit token");
          return;
        }

        setLk(json);
      } catch {
        if (!cancelled) setLkErr("Network error while creating token");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [streamId, myUserId, isHost]);

  // Poll backend for live status + viewers
  useEffect(() => {
    if (!streamId) return;

    let mounted = true;

    const load = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/live/stream?streamId=${encodeURIComponent(streamId)}`
        );
        const json = (await res.json().catch(() => null)) as StreamInfoResp | null;

        if (!mounted) return;
        if (!res.ok || !json) return;

        if (json.isLive === false) {
          Alert.alert("Live ended", "This live stream has ended.");
          navigation.goBack();
          return;
        }

        setViewerCount(Number(json.viewers ?? 0));
        if (typeof json.title === "string" && json.title.trim().length > 0) {
          setStreamTitle(json.title.trim());
        }
      } catch {
        // ignore
      } finally {
        if (mounted) setChecking(false);
      }
    };

    load();
    const t = setInterval(load, 2000);

    return () => {
      mounted = false;
      clearInterval(t);
    };
  }, [streamId, navigation]);

  // Host heartbeat (keeps you visible in Explore)
  useEffect(() => {
    if (!isHost || !streamId || !myUserId) return;

    const t = setInterval(() => {
      fetch(`${API_BASE_URL}/api/live/heartbeat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: myUserId, streamId }),
      }).catch(() => {});
    }, 10_000);

    return () => clearInterval(t);
  }, [isHost, streamId, myUserId]);

  // If host leaves screen -> end live
  useEffect(() => {
    if (!isHost || !streamId || !myUserId) return;

    return () => {
      fetch(`${API_BASE_URL}/api/live`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: myUserId, streamId }),
      }).catch(() => {});
    };
  }, [isHost, streamId, myUserId]);

  const sendChat = () => {
    const t = chat.trim();
    if (!t) return;
    setChat("");
    setMessages((prev) => [{ id: Date.now().toString(), text: `Me: ${t}` }, ...prev]);
  };

  const initials = useMemo(() => (displayName || "U").slice(0, 1).toUpperCase(), [displayName]);

  const serverUrl = useMemo(() => normalizeLiveKitUrl(lk?.livekitUrl), [lk?.livekitUrl]);

  // ✅ Do not connect until token + serverUrl + permissions ready
  const shouldConnect = !!lk?.token && !!serverUrl && permReady;

  if (lkErr) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
        <View style={{ padding: 16 }}>
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "800" }}>Live error</Text>
          <Text style={{ color: "rgba(255,255,255,0.75)", marginTop: 8 }}>{lkErr}</Text>

          {!!serverUrl && (
            <Text style={{ color: "rgba(255,255,255,0.55)", marginTop: 8, fontSize: 12 }}>
              LiveKit URL: {serverUrl}
            </Text>
          )}

          <Pressable
            onPress={() => navigation.goBack()}
            style={{
              marginTop: 16,
              backgroundColor: "rgba(255,255,255,0.15)",
              paddingVertical: 12,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "800" }}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <View style={{ flex: 1 }}>
        <LiveKitRoom
          connect={shouldConnect}
          serverUrl={serverUrl}
          token={lk?.token || ""}
          audio={true}
          video={isHost} // viewers should NOT publish camera
          onConnected={() => setIsConnected(true)}
          onDisconnected={() => {
            setIsConnected(false);
            if (!isHost) Alert.alert("Disconnected", "You left the live room.");
          }}
          onError={(e) => {
            setLkErr(e?.message || "LiveKit error");
          }}
        >
          {/* ✅ Debug overlay to confirm tracks exist */}
          <DebugTracks hostId={hostId} />

          {/* REAL live video */}
          <StageVideo fallbackAvatarUrl={avatarUrl} />

          <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
            {/* Top bar */}
            <View
              style={{
                paddingHorizontal: 12,
                paddingTop: 8,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {avatarUrl ? (
                  <Image
                    source={{ uri: avatarUrl }}
                    style={{ width: 34, height: 34, borderRadius: 17, marginRight: 10 }}
                  />
                ) : (
                  <View
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 17,
                      marginRight: 10,
                      backgroundColor: "rgba(255,255,255,0.15)",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ color: "#fff", fontWeight: "900" }}>{initials}</Text>
                  </View>
                )}

                <View style={{ maxWidth: 190 }}>
                  <Text style={{ color: "#fff", fontSize: 12, fontWeight: "800" }} numberOfLines={1}>
                    {displayName || "Host"}
                  </Text>
                  <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 10 }} numberOfLines={1}>
                    {streamTitle} • {isConnected ? "Connected" : "Connecting"} • ID:{" "}
                    {String(hostId || "").slice(0, 10)}
                  </Text>
                </View>

                <View
                  style={{
                    marginLeft: 10,
                    backgroundColor: "rgba(255,255,255,0.18)",
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 999,
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 10, fontWeight: "900" }}>
                    LIVE {isConnected ? liveTimeLabel : ""}
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    backgroundColor: "rgba(0,0,0,0.35)",
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 999,
                    marginRight: 8,
                  }}
                >
                  {checking ? (
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <ActivityIndicator color="#fff" size="small" />
                      <Text style={{ color: "#fff", fontSize: 11, fontWeight: "800", marginLeft: 6 }}>
                        …
                      </Text>
                    </View>
                  ) : (
                    <Text style={{ color: "#fff", fontSize: 11, fontWeight: "900" }}>👥 {viewerCount}</Text>
                  )}
                </View>

                <Pressable
                  onPress={() => navigation.goBack()}
                  style={{ height: 40, width: 40, alignItems: "center", justifyContent: "center" }}
                >
                  <Ionicons name="close" size={22} color="#fff" />
                </Pressable>
              </View>
            </View>

            {/* Chat (local for now) */}
            <View style={{ position: "absolute", left: 10, bottom: 150, width: "78%", maxHeight: 330 }}>
              <FlatList
                data={messages}
                keyExtractor={(i) => i.id}
                inverted
                renderItem={({ item }) => (
                  <View
                    style={{
                      marginBottom: 8,
                      backgroundColor: "rgba(0,0,0,0.35)",
                      borderRadius: 16,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                    }}
                  >
                    <Text style={{ color: "#fff", fontSize: 12 }}>{item.text}</Text>
                  </View>
                )}
                showsVerticalScrollIndicator={false}
              />
            </View>

            {/* Bottom bar */}
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}
            >
              <View
                style={{
                  paddingHorizontal: 12,
                  paddingBottom: 14,
                  paddingTop: 10,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Pressable
                  style={{
                    marginRight: 10,
                    backgroundColor: "rgba(255,255,255,0.18)",
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 999,
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "900", fontSize: 12 }}>Follow +</Text>
                </Pressable>

                <View
                  style={{
                    flex: 1,
                    backgroundColor: "rgba(0,0,0,0.35)",
                    borderRadius: 999,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Ionicons name="chatbubble-ellipses-outline" size={18} color="rgba(255,255,255,0.85)" />
                  <TextInput
                    value={chat}
                    onChangeText={setChat}
                    placeholder="Say something..."
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    style={{ flex: 1, marginLeft: 8, color: "#fff", fontSize: 13 }}
                  />
                  <Pressable onPress={sendChat} hitSlop={10}>
                    <Ionicons name="send" size={18} color="#fff" />
                  </Pressable>
                </View>

                <Pressable
                  style={{
                    marginLeft: 10,
                    height: 44,
                    width: 44,
                    borderRadius: 999,
                    backgroundColor: "rgba(0,0,0,0.35)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="gift-outline" size={22} color="#fff" />
                </Pressable>
              </View>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </LiveKitRoom>
      </View>
    </View>
  );
}
