// LiveRoomScreen.tsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  TextInput,
  Platform,
  FlatList,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Modal,
  useWindowDimensions,
  Keyboard,
  Animated,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL, SOCKET_URL } from "../config";

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

import { Camera } from "expo-camera";
import { Audio, Video, ResizeMode } from "expo-av";
import { io, Socket } from "socket.io-client";

/* ---------------------------------- Types --------------------------------- */

type ChatBubble = {
  id: string;
  text: string;
  at: number;
  kind: "chat" | "gift" | "system";
};

type GiftMediaType = "IMAGE" | "GIF" | "VIDEO";
type Gift = {
  id: number;
  name: string;
  price: number;
  isActive?: boolean;
  mediaType?: GiftMediaType | null;
  mediaUrl?: string | null;
  thumbnailUrl?: string | null;
  iconUrl?: string | null;
};

type TokenResp = {
  livekitUrl: string;
  roomName: string;
  token: string;
  stream: { id: string; title: string | null; hostId: string };
};

type PkSide = "HOST" | "OPPONENT";

type PkState = {
  active: boolean;
  battleId: string | null;
  hostId: string | null;
  opponentId: string | null;
  startedAt: number | null;
  endsAt: number | null;
  durationSec: number;
  scoreHost: number;
  scoreOpponent: number;
};

type GiftAnimPayload = {
  id: string;
  senderName: string;
  giftName: string;
  quantity: number;
  mediaType: GiftMediaType | null;
  mediaUrl: string | null;
  thumbnailUrl: string | null;
};

type PublicUser = {
  id: string;
  username?: string | null;
  nickname?: string | null;
  avatarUrl?: string | null;
};

type PkResult = {
  battleId: string;
  winnerSide: PkSide | null;
  loserSide: PkSide | null;
  hostScore: number;
  opponentScore: number;
  at: number;
};

const FILL = StyleSheet.absoluteFillObject;

/* --------------------------------- Helpers -------------------------------- */

function normalizeLiveKitUrl(url?: string | null) {
  const u = (url || "").trim();
  if (!u) return "";
  if (u.startsWith("wss://") || u.startsWith("ws://")) return u;
  if (u.startsWith("https://")) return u.replace("https://", "wss://");
  if (u.startsWith("http://")) return u.replace("http://", "ws://");
  if (!u.includes("://")) return `wss://${u}`;
  return u;
}

function normalizeSocketBase(url?: string | null) {
  const u = (url || "").trim();
  if (!u) return "";
  if (u.startsWith("https://") || u.startsWith("http://")) return u;
  if (u.startsWith("wss://")) return u.replace("wss://", "https://");
  if (u.startsWith("ws://")) return u.replace("ws://", "http://");
  if (!u.includes("://")) return `https://${u}`;
  return u;
}

function pickAnyCameraTrack(tracks: TrackReferenceOrPlaceholder[]): TrackReference | null {
  return tracks.find((t): t is TrackReference => isTrackReference(t)) ?? null;
}

function shortId(id?: string | null) {
  if (!id) return "—";
  if (id.length <= 8) return id;
  return `${id.slice(0, 4)}…${id.slice(-4)}`;
}

function bestName(u?: PublicUser | null) {
  if (!u) return "";
  return (u.nickname || u.username || "").trim();
}

async function fetchPublicUser(userId: string): Promise<PublicUser | null> {
  // Adjust this endpoint to match your backend.
  // Expected shapes supported:
  // 1) { user: { id, username, nickname, avatarUrl } }
  // 2) { id, username, nickname, avatarUrl }
  try {
    const res = await fetch(`${API_BASE_URL}/api/users/${encodeURIComponent(userId)}`, { method: "GET" });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json) return null;
    const u = json?.user || json;
    if (!u?.id) return null;
    return { id: String(u.id), username: u.username ?? null, nickname: u.nickname ?? null, avatarUrl: u.avatarUrl ?? null };
  } catch {
    return null;
  }
}

function useKeyboardHeight() {
  const [h, setH] = useState(0);

  useEffect(() => {
    const showEvt = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvt = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const subShow = Keyboard.addListener(showEvt, (e) => {
      const next = e?.endCoordinates?.height ?? 0;
      setH(next);
    });
    const subHide = Keyboard.addListener(hideEvt, () => setH(0));

    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, []);

  return h;
}

/* ------------------------------ Small Components --------------------------- */

const DebugTracks = () => {
  if (!__DEV__) return null;
  const cams = useTracks([Track.Source.Camera]);
  return (
    <View style={{ position: "absolute", top: 88, left: 12, zIndex: 999 }}>
      <Text style={{ color: "#fff", fontSize: 11, fontWeight: "800" }}>camTracks: {cams.length}</Text>
    </View>
  );
};

const StageVideo: React.FC<{ fallbackAvatarUrl?: string | null }> = ({ fallbackAvatarUrl }) => {
  const cameraTracks = useTracks([Track.Source.Camera]);
  const primary = useMemo(() => pickAnyCameraTrack(cameraTracks), [cameraTracks]);

  if (primary) return <VideoTrack trackRef={primary} style={FILL} />;

  if (fallbackAvatarUrl) {
    return <Image source={{ uri: fallbackAvatarUrl }} style={FILL} resizeMode="cover" blurRadius={18} />;
  }

  return (
    <View style={[FILL, { alignItems: "center", justifyContent: "center" }]}>
      <Text style={{ color: "rgba(255,255,255,0.8)", fontWeight: "700" }}>Connecting video…</Text>
    </View>
  );
};

const PkBattleField: React.FC<{
  pk: PkState;
  hostName: string;
  hostAvatarUrl?: string | null;
  opponentName?: string;
  opponentId?: string | null;
  opponentAvatarUrl?: string | null;
  remainingText: string | null;
}> = ({ pk, hostName, hostAvatarUrl, opponentName, opponentId, opponentAvatarUrl, remainingText }) => {
  if (!pk.active) return null;

  const leftScore = pk.scoreHost;
  const rightScore = pk.scoreOpponent;
  const total = Math.max(1, leftScore + rightScore);
  const leftPct = Math.max(0.08, Math.min(0.92, leftScore / total));

  return (
    <View style={styles.pkWrap}>
      <View style={styles.pkTopRow}>
        <View style={styles.pkSide}>
          {hostAvatarUrl ? (
            <Image source={{ uri: hostAvatarUrl }} style={styles.pkAvatar} />
          ) : (
            <View style={[styles.pkAvatar, styles.pkAvatarFallback]}>
              <Ionicons name="person" size={14} color="#fff" />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.pkName} numberOfLines={1}>
              {hostName || "—"}
            </Text>
            <Text style={styles.pkId} numberOfLines={1}>
              {shortId(pk.hostId)}
            </Text>
          </View>
          <Text style={styles.pkScore}>{leftScore}</Text>
        </View>

        <View style={styles.pkCenter}>
          <Text style={styles.pkVs}>⚔️ PK</Text>
          <Text style={styles.pkTimer}>{remainingText || "—"}</Text>
        </View>

        <View style={[styles.pkSide, { justifyContent: "flex-end" }]}>
          <Text style={styles.pkScore}>{rightScore}</Text>
          <View style={{ flex: 1, alignItems: "flex-end" }}>
            <Text style={styles.pkName} numberOfLines={1}>
              {opponentName || "Opponent"}
            </Text>
            <Text style={styles.pkId} numberOfLines={1}>
              {shortId(opponentId || pk.opponentId)}
            </Text>
          </View>
          {opponentAvatarUrl ? (
            <Image source={{ uri: opponentAvatarUrl }} style={styles.pkAvatar} />
          ) : (
            <View style={[styles.pkAvatar, styles.pkAvatarFallback]}>
              <Ionicons name="person" size={14} color="#fff" />
            </View>
          )}
        </View>
      </View>

      <View style={styles.pkBar}>
        <View style={[styles.pkBarLeft, { flex: leftPct }]} />
        <View style={[styles.pkBarRight, { flex: 1 - leftPct }]} />
      </View>
    </View>
  );
};

const PkResultOverlay: React.FC<{
  visible: boolean;
  isWinner: boolean;
  isLoser: boolean;
  isTie: boolean;
  punishmentText: string;
}> = ({ visible, isWinner, isLoser, isTie, punishmentText }) => {
  if (!visible) return null;

  return (
    <View pointerEvents="none" style={styles.pkResultOverlay}>
      <View style={[styles.pkResultCard, isWinner ? styles.pkWinCard : isLoser ? styles.pkLoseCard : styles.pkTieCard]}>
        <Text style={styles.pkResultTitle}>
          {isTie ? "DRAW" : isWinner ? "WINNER 🏆" : "LOSER 😅"}
        </Text>
        {isLoser ? <Text style={styles.pkResultSub}>{punishmentText}</Text> : null}
      </View>
    </View>
  );
};

/* -------------------------------- Main Screen ------------------------------ */

export default function LiveRoomScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const keyboardH = useKeyboardHeight();

  const params = route.params || {};
  const initialStreamId: string | undefined = params.streamId;
  const hostIdFromParams: string | undefined = params.hostId;
  const displayNameFromParams: string | undefined = params.displayName;
  const avatarUrlFromParams: string | undefined = params.avatarUrl;
  const isHostParam: boolean | undefined = params.isHost;

  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [myName, setMyName] = useState<string>(""); // ✅ used for joinLive + overlay
  const [myAvatarUrl, setMyAvatarUrl] = useState<string | null>(null);

  const [activeStreamId, setActiveStreamId] = useState<string | null>(initialStreamId ?? null);
  const [activeHostId, setActiveHostId] = useState<string | null>(hostIdFromParams ?? null);

  const [hostProfile, setHostProfile] = useState<PublicUser | null>(null);
  const [opponentProfile, setOpponentProfile] = useState<PublicUser | null>(null);

  const [lk, setLk] = useState<TokenResp | null>(null);
  const [lkErr, setLkErr] = useState<string | null>(null);
  const [lkLoading, setLkLoading] = useState(false);

  const [bubbles, setBubbles] = useState<ChatBubble[]>([]);
  const bubbleTimersRef = useRef<Record<string, any>>({});

  const [chat, setChat] = useState("");
  const [viewerCount, setViewerCount] = useState<number>(0);

  const [isRoomConnected, setIsRoomConnected] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [permReady, setPermReady] = useState<boolean>(false);

  // gifts
  const [giftModal, setGiftModal] = useState(false);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loadingGifts, setLoadingGifts] = useState(false);
  const [coinBalance, setCoinBalance] = useState<number>(0);
  const [loadingWallet, setLoadingWallet] = useState(false);

  // gift filters
  const [giftSearch, setGiftSearch] = useState("");
  const [giftTypeFilter, setGiftTypeFilter] = useState<"ALL" | GiftMediaType>("ALL");
  const [giftSort, setGiftSort] = useState<"POPULAR" | "PRICE_ASC" | "PRICE_DESC">("POPULAR");

  // follow
  const [followingHost, setFollowingHost] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);

  // PK
  const [pkModal, setPkModal] = useState(false);
  const [pkOpponentId, setPkOpponentId] = useState("");
  const [pkDurationSec, setPkDurationSec] = useState<180 | 300 | 600>(180);
  const [pkBusy, setPkBusy] = useState(false);

  const [pk, setPk] = useState<PkState>({
    active: false,
    battleId: null,
    hostId: null,
    opponentId: null,
    startedAt: null,
    endsAt: null,
    durationSec: 180,
    scoreHost: 0,
    scoreOpponent: 0,
  });

  const [pkGiftSide, setPkGiftSide] = useState<PkSide>("HOST");

  const [pkResult, setPkResult] = useState<PkResult | null>(null);
  const pkResultTimer = useRef<any>(null);

  const [forceDisconnect, setForceDisconnect] = useState(false);
  const [endingLive, setEndingLive] = useState(false);

  const socketRef = useRef<Socket | null>(null);

  const isHost = !!isHostParam || (!!myUserId && !!activeHostId && myUserId === activeHostId);
  const isViewer = !isHost;

  const hostNameFromParamsSafe = (displayNameFromParams || "").trim();
  const hostAvatarFromParams = avatarUrlFromParams || null;

  const displayHostName = useMemo(() => {
    // ✅ show real host name; if I am host, show myName
    if (isHost) return (myName || hostNameFromParamsSafe || bestName(hostProfile) || "—").trim();
    return (bestName(hostProfile) || hostNameFromParamsSafe || "—").trim();
  }, [isHost, myName, hostNameFromParamsSafe, hostProfile]);

  const displayHostAvatar = useMemo(() => {
    if (isHost) return myAvatarUrl || hostAvatarFromParams || hostProfile?.avatarUrl || null;
    return hostAvatarFromParams || hostProfile?.avatarUrl || null;
  }, [isHost, myAvatarUrl, hostAvatarFromParams, hostProfile]);

  const opponentName = useMemo(() => bestName(opponentProfile) || "", [opponentProfile]);

  const initials = useMemo(() => (displayHostName || "U").slice(0, 1).toUpperCase(), [displayHostName]);

  const bottomBarBottom = keyboardH > 0 ? keyboardH : insets.bottom;
  const chatBottom = bottomBarBottom + (isViewer ? 88 : 20);

  useFocusEffect(
    useCallback(() => {
      const parent = navigation.getParent?.();
      parent?.setOptions?.({ tabBarStyle: { display: "none" } });

      return () => {
        parent?.setOptions?.({ tabBarStyle: undefined });
      };
    }, [navigation])
  );

  // gift animation overlay
  const [giftAnim, setGiftAnim] = useState<GiftAnimPayload | null>(null);
  const giftOpacity = useRef(new Animated.Value(0)).current;
  const giftScale = useRef(new Animated.Value(0.92)).current;
  const giftTimerRef = useRef<any>(null);

  const showGiftAnim = useCallback(
    (p: GiftAnimPayload) => {
      if (giftTimerRef.current) {
        clearTimeout(giftTimerRef.current);
        giftTimerRef.current = null;
      }

      setGiftAnim(p);
      giftOpacity.setValue(0);
      giftScale.setValue(0.92);

      Animated.parallel([
        Animated.timing(giftOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.timing(giftScale, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();

      giftTimerRef.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(giftOpacity, { toValue: 0, duration: 220, useNativeDriver: true }),
          Animated.timing(giftScale, { toValue: 0.98, duration: 220, useNativeDriver: true }),
        ]).start(() => setGiftAnim(null));
      }, 1800);
    },
    [giftOpacity, giftScale]
  );

  const addBubble = useCallback((text: string, kind: ChatBubble["kind"]) => {
    const id = String(Date.now()) + "_" + Math.random().toString(16).slice(2);
    const item: ChatBubble = { id, text, at: Date.now(), kind };

    setBubbles((prev) => [item, ...prev].slice(0, 30));

    const t = setTimeout(() => {
      setBubbles((prev) => prev.filter((x) => x.id !== id));
      delete bubbleTimersRef.current[id];
    }, 9000);

    bubbleTimersRef.current[id] = t;
  }, []);

  useEffect(() => {
    AudioSession.startAudioSession();
    return () => {
      AudioSession.stopAudioSession();
    };
  }, []);

  // Load my identity (for correct name in chat/gifts)
  useEffect(() => {
    (async () => {
      const [id, n1, n2, n3, a1] = await Promise.all([
        AsyncStorage.getItem("gl_user_id"),
        AsyncStorage.getItem("gl_user_name"),
        AsyncStorage.getItem("gl_username"),
        AsyncStorage.getItem("gl_nickname"),
        AsyncStorage.getItem("gl_avatar_url"),
      ]);

      if (id) setMyUserId(id);

      const nm = (n1 || n3 || n2 || "").trim();
      if (nm) setMyName(nm);

      if (a1) setMyAvatarUrl(a1);
    })();
  }, []);

  // Fetch host profile to show real host name/avatar (viewer & host)
  useEffect(() => {
    if (!activeHostId) return;
    let alive = true;
    (async () => {
      const u = await fetchPublicUser(activeHostId);
      if (alive && u) setHostProfile(u);
    })();
    return () => {
      alive = false;
    };
  }, [activeHostId]);

  // permissions (host only)
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

  /* ---------------------- A) Ensure host stream exists --------------------- */
  useEffect(() => {
    if (!myUserId) return;

    if (isHost && !activeStreamId && !lkLoading && !lkErr) {
      let cancelled = false;

      (async () => {
        try {
          setLkLoading(true);
          const res = await fetch(`${API_BASE_URL}/api/live`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: myUserId,
              title: "My Live",
              mode: "SOLO",
              protocol: "LIVEKIT",
            }),
          });

          const json = await res.json().catch(() => null);
          if (cancelled) return;

          if (!res.ok || !json?.stream?.id) {
            setLkErr(json?.error || "Failed to start live");
            return;
          }

          setActiveStreamId(String(json.stream.id));
          setActiveHostId(myUserId);
          addBubble("✅ Live created", "system");
        } catch {
          if (!cancelled) setLkErr("Network error while starting live");
        } finally {
          if (!cancelled) setLkLoading(false);
        }
      })();

      return () => {
        cancelled = true;
      };
    }
  }, [myUserId, isHost, activeStreamId, lkLoading, lkErr, addBubble]);

  /* ----------------------- B) Fetch LiveKit token -------------------------- */
  useEffect(() => {
    if (!activeStreamId || !myUserId) return;
    let cancelled = false;

    (async () => {
      try {
        setLkErr(null);
        setLk(null);
        setLkLoading(true);

        const res = await fetch(`${API_BASE_URL}/api/live/token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: myUserId,
            streamId: activeStreamId,
            role: isHost ? "host" : "viewer",
          }),
        });

        const json = (await res.json().catch(() => null)) as TokenResp | null;
        if (cancelled) return;

        if (!res.ok || !json?.token || !json?.livekitUrl) {
          setLkErr((json as any)?.error || "Failed to get LiveKit token");
          return;
        }

        setActiveHostId(json.stream?.hostId || activeHostId);
        setLk(json);
      } catch {
        if (!cancelled) setLkErr("Network error while creating token");
      } finally {
        if (!cancelled) setLkLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStreamId, myUserId, isHost]);

  const serverUrl = useMemo(() => normalizeLiveKitUrl(lk?.livekitUrl), [lk?.livekitUrl]);
  const shouldConnect = !!lk?.token && !!serverUrl && permReady && !forceDisconnect;

  /* --------------------------- Socket.IO connect --------------------------- */

  const socketBase = useMemo(() => normalizeSocketBase(SOCKET_URL), []);
  const socketPath = "/socket.io";

  const pkRemaining = useMemo(() => {
    if (!pk.active || !pk.endsAt) return null;
    const ms = pk.endsAt - Date.now();
    const s = Math.max(0, Math.floor(ms / 1000));
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }, [pk.active, pk.endsAt]);

  useEffect(() => {
    if (!activeStreamId || !myUserId || !socketBase) return;

    const s = io(socketBase, {
      path: socketPath,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 20,
      timeout: 15000,
    });

    socketRef.current = s;

    const onConnect = () => {
      setIsSocketConnected(true);

      // ✅ IMPORTANT: viewer/host must send THEIR OWN NAME, not host name
      const joinName = (myName || "Guest").trim();

      s.emit(
        "joinLive",
        {
          streamId: activeStreamId,
          userId: myUserId,
          name: joinName,
          role: isHost ? "host" : "viewer",
        },
        (ack: any) => {
          if (ack?.error) addBubble(`⚠️ joinLive failed: ${ack.error}`, "system");
        }
      );
    };

    const onDisconnect = () => setIsSocketConnected(false);

    const onConnectError = () => {
      addBubble("⚠️ Socket connection error", "system");
    };

    const onViewerCount = (p: any) => {
      if (p?.streamId === activeStreamId) setViewerCount(Number(p?.count ?? 0));
    };

    const onSystem = (m: any) => {
      const t = String(m?.text || "").trim();
      if (t) addBubble(t, "system");
    };

    const onChat = (m: any) => {
      const line = `${m?.name || "Guest"}: ${String(m?.text || "")}`;
      addBubble(line, "chat");
    };

    const onGift = (g: any) => {
      const giftName = g?.gift?.name || "Gift";
      const qty = Number(g?.quantity || 1);

      addBubble(`🎁 ${g?.senderName || "Guest"} sent ${giftName} x${qty}`, "gift");

      showGiftAnim({
        id: String(g?.id || Date.now()),
        senderName: g?.senderName || "Guest",
        giftName,
        quantity: qty,
        mediaType: g?.gift?.mediaType ?? null,
        mediaUrl: g?.gift?.mediaUrl ?? null,
        thumbnailUrl: g?.gift?.thumbnailUrl ?? null,
      });
    };

    // ✅ realtime scoreboard from server truth
    const onPkScore = (p: any) => {
      if (!p?.battleId) return;
      setPk((prev) => {
        if (!prev.active || prev.battleId !== String(p.battleId)) return prev;
        return {
          ...prev,
          scoreHost: Number(p?.hostScore ?? prev.scoreHost),
          scoreOpponent: Number(p?.opponentScore ?? prev.scoreOpponent),
        };
      });
    };

    const onFollowEvent = () => {
      if (isHost) addBubble(`➕ New follow`, "system");
    };

    const onPkInvite = (inv: any) => {
      const battleId = String(inv?.battleId || "");
      const duration = Number(inv?.durationSec ?? 180);

      Alert.alert("PK Battle Invite", `You received a PK invite (${Math.floor(duration / 60)} min).`, [
        {
          text: "Decline",
          style: "cancel",
          onPress: () => s.emit("pkRespond", { battleId, accept: false }),
        },
        {
          text: "Accept",
          onPress: () => s.emit("pkRespond", { battleId, accept: true }),
        },
      ]);
    };

    const onPkStarted = async (p: any) => {
      const dur = Number(p?.durationSec ?? 180);
      const startedAt = Number(p?.startedAt ?? Date.now());
      const endsAt = startedAt + Math.max(10, dur) * 1000;

      const battleId = String(p?.battleId || "");

      setPk({
        active: true,
        battleId,
        hostId: String(p?.hostId || activeHostId || ""),
        opponentId: String(p?.opponentId || ""),
        startedAt,
        endsAt,
        durationSec: Math.max(10, dur),
        scoreHost: Number(p?.hostScore ?? 0),
        scoreOpponent: Number(p?.opponentScore ?? 0),
      });

      setPkGiftSide("HOST");
      addBubble(`⚔️ PK Started!`, "system");

      // Fetch opponent profile for nicer UI
      const oppId = String(p?.opponentId || "");
      if (oppId) {
        const u = await fetchPublicUser(oppId);
        if (u) setOpponentProfile(u);
      }
    };

    const showPkResult = (r: PkResult) => {
      setPkResult(r);
      if (pkResultTimer.current) clearTimeout(pkResultTimer.current);
      pkResultTimer.current = setTimeout(() => setPkResult(null), 4200);
    };

    const onPkEnded = (p: any) => {
      const battleId = String(p?.battleId || pk.battleId || "");
      const hostScore = Number(p?.hostScore ?? pk.scoreHost ?? 0);
      const opponentScore = Number(p?.opponentScore ?? pk.scoreOpponent ?? 0);

      const winnerSide = (String(p?.winnerSide || "").toUpperCase() as PkSide) || null;
      const loserSide = (String(p?.loserSide || "").toUpperCase() as PkSide) || null;

      showPkResult({
        battleId,
        winnerSide: winnerSide || null,
        loserSide: loserSide || null,
        hostScore,
        opponentScore,
        at: Date.now(),
      });

      setPk((prev) => ({ ...prev, active: false, battleId: null, endsAt: null, startedAt: null }));
      addBubble(`✅ PK Ended`, "system");
    };

    const onPkCanceled = () => {
      setPk((prev) => ({ ...prev, active: false, battleId: null, endsAt: null, startedAt: null }));
      addBubble(`❌ PK Canceled`, "system");
    };

    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);
    s.on("connect_error", onConnectError);

    s.on("viewerCount", onViewerCount);
    s.on("system", onSystem);
    s.on("chat", onChat);
    s.on("gift", onGift);
    s.on("followEvent", onFollowEvent);

    s.on("pkInvite", onPkInvite);
    s.on("pkStarted", onPkStarted);
    s.on("pkScore", onPkScore);
    s.on("pkEnded", onPkEnded);
    s.on("pkCanceled", onPkCanceled);

    return () => {
      try {
        s.emit("leaveLive", { streamId: activeStreamId, userId: myUserId });
      } catch {}
      try {
        s.off("connect", onConnect);
        s.off("disconnect", onDisconnect);
        s.off("connect_error", onConnectError);

        s.off("viewerCount", onViewerCount);
        s.off("system", onSystem);
        s.off("chat", onChat);
        s.off("gift", onGift);
        s.off("followEvent", onFollowEvent);

        s.off("pkInvite", onPkInvite);
        s.off("pkStarted", onPkStarted);
        s.off("pkScore", onPkScore);
        s.off("pkEnded", onPkEnded);
        s.off("pkCanceled", onPkCanceled);

        s.disconnect();
      } catch {}
      socketRef.current = null;
      setIsSocketConnected(false);
    };
  }, [
    activeStreamId,
    myUserId,
    myName,
    isHost,
    socketBase,
    socketPath,
    addBubble,
    showGiftAnim,
    activeHostId,
    pk.battleId,
    pk.scoreHost,
    pk.scoreOpponent,
  ]);

  useEffect(() => {
    return () => {
      const all = bubbleTimersRef.current;
      Object.keys(all).forEach((k) => {
        try {
          clearTimeout(all[k]);
        } catch {}
      });
      bubbleTimersRef.current = {};

      if (giftTimerRef.current) {
        clearTimeout(giftTimerRef.current);
        giftTimerRef.current = null;
      }

      if (pkResultTimer.current) {
        clearTimeout(pkResultTimer.current);
        pkResultTimer.current = null;
      }
    };
  }, []);

  /* -------------------------- Host heartbeat (API) -------------------------- */
  useEffect(() => {
    if (!isHost || !myUserId || !activeStreamId) return;

    let alive = true;
    const tick = async () => {
      try {
        await fetch(`${API_BASE_URL}/api/live/heartbeat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: myUserId, streamId: activeStreamId, viewers: viewerCount }),
        });
      } catch {}
    };

    tick();
    const id = setInterval(() => {
      if (!alive) return;
      if (forceDisconnect) return;
      tick();
    }, 12000);

    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [isHost, myUserId, activeStreamId, viewerCount, forceDisconnect]);

  const sendChat = () => {
    if (!isViewer) return;
    const t = chat.trim();
    if (!t || !activeStreamId || !myUserId) return;
    setChat("");
    socketRef.current?.emit("chat", { streamId: activeStreamId, userId: myUserId, text: t });
  };

  /* -------------------------------- Gifts API ------------------------------- */
  const loadWallet = useCallback(async () => {
    if (!myUserId) return;
    try {
      setLoadingWallet(true);
      const res = await fetch(`${API_BASE_URL}/api/wallet?userId=${encodeURIComponent(myUserId)}`);
      const json = await res.json().catch(() => null);
      if (!res.ok) return;
      setCoinBalance(Number(json?.wallet?.balance ?? 0));
    } finally {
      setLoadingWallet(false);
    }
  }, [myUserId]);

  const loadGifts = async () => {
    try {
      setLoadingGifts(true);
      const res = await fetch(`${API_BASE_URL}/api/gifts`, { cache: "no-store" as any });
      const json = await res.json().catch(() => null);

      const list: Gift[] = Array.isArray(json) ? json : Array.isArray(json?.gifts) ? json.gifts : [];
      setGifts(list.filter((g) => g?.isActive !== false));
    } catch {
      Alert.alert("Error", "Failed to load gifts");
    } finally {
      setLoadingGifts(false);
    }
  };

  const goToCoins = () => navigation.navigate("Coins");

  const openGifts = async () => {
    if (!isViewer) return;
    setGiftModal(true);
    await Promise.all([gifts.length === 0 ? loadGifts() : Promise.resolve(), loadWallet()]);
  };

  const sendGift = (gift: Gift) => {
    if (!isViewer) return;
    if (!activeStreamId || !myUserId) return;

    const cost = Number(gift.price ?? 0);
    if (Number.isFinite(cost) && coinBalance < cost) {
      Alert.alert("Not enough coins", "Top up coins to send this gift.", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Top up",
          onPress: () => {
            setGiftModal(false);
            goToCoins();
          },
        },
      ]);
      return;
    }

    const payload: any = {
      streamId: activeStreamId,
      senderId: myUserId,
      giftId: gift.id,
      quantity: 1,
    };

    // ✅ PK: send targetSide + pkBattleId so backend can route coins correctly
    if (pk.active && pk.battleId) {
      payload.targetSide = pkGiftSide;
      payload.pkBattleId = pk.battleId;
    }

    socketRef.current?.emit("sendGift", payload, async (resp: any) => {
      if (resp?.error) return Alert.alert("Gift", resp.error);
      await loadWallet();
    });

    setGiftModal(false);
  };

  /* -------------------------------- Follow --------------------------------- */
  const toggleFollow = () => {
    if (!isViewer) return;
    if (!myUserId || !activeHostId || followBusy) return;
    setFollowBusy(true);

    socketRef.current?.emit("toggleFollow", { followerId: myUserId, followingId: activeHostId }, (resp: any) => {
      setFollowBusy(false);
      if (resp?.error) return Alert.alert("Follow", resp.error);
      setFollowingHost(!!resp?.following);
    });
  };

  /* ---------------------------------- PK ---------------------------------- */
  const startPkInvite = () => {
    if (!isHost || !activeStreamId || !myUserId || !pkOpponentId.trim()) return;

    setPkBusy(true);
    socketRef.current?.emit(
      "pkInvite",
      { streamId: activeStreamId, hostId: myUserId, opponentId: pkOpponentId.trim(), durationSec: pkDurationSec },
      (resp: any) => {
        setPkBusy(false);
        if (resp?.error) return Alert.alert("PK", resp.error);
        setPkModal(false);
        setPkOpponentId("");
        Alert.alert("PK", "Invite sent.");
      }
    );
  };

  /* ------------------------------- End Live -------------------------------- */
  const endLive = async () => {
    if (!myUserId) return;

    if (!isHost) {
      setForceDisconnect(true);
      navigation.goBack();
      return;
    }

    if (endingLive) return;
    setEndingLive(true);

    try {
      await fetch(`${API_BASE_URL}/api/live`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: myUserId, streamId: activeStreamId }),
      });

      try {
        socketRef.current?.emit("leaveLive", { streamId: activeStreamId, userId: myUserId });
      } catch {}

      setForceDisconnect(true);
      setTimeout(() => navigation.goBack(), 150);
    } catch {
      setForceDisconnect(true);
      navigation.goBack();
    } finally {
      setEndingLive(false);
    }
  };

  const onPressClose = () => {
    if (isHost) {
      Alert.alert("End Live?", "This will end the live for everyone.", [
        { text: "Cancel", style: "cancel" },
        { text: "End Live", style: "destructive", onPress: endLive },
      ]);
    } else {
      endLive();
    }
  };

  /* ---------------------------- Gifts: filtering ---------------------------- */

  const filteredGifts = useMemo(() => {
    let list = gifts.slice();

    if (giftTypeFilter !== "ALL") {
      list = list.filter((g) => (g.mediaType || "IMAGE") === giftTypeFilter);
    }

    const q = giftSearch.trim().toLowerCase();
    if (q) {
      list = list.filter((g) => (g.name || "").toLowerCase().includes(q));
    }

    if (giftSort === "PRICE_ASC") list.sort((a, b) => (a.price || 0) - (b.price || 0));
    if (giftSort === "PRICE_DESC") list.sort((a, b) => (b.price || 0) - (a.price || 0));

    return list;
  }, [gifts, giftTypeFilter, giftSearch, giftSort]);

  /* --------------------------------- Render -------------------------------- */

  if (lkErr) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
        <View style={{ padding: 16 }}>
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "800" }}>Live error</Text>
          <Text style={{ color: "rgba(255,255,255,0.75)", marginTop: 8 }}>{lkErr}</Text>
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

  const GIFT_COLS = 4;
  const GIFT_GAP = 10;
  const SHEET_PAD = 14;
  const giftCardW = Math.floor((width - SHEET_PAD * 2 - (GIFT_COLS - 1) * GIFT_GAP) / GIFT_COLS);

  const giftPreviewUrl = giftAnim?.mediaUrl || giftAnim?.thumbnailUrl || null;

  // PK result logic: am I host side or opponent side?
  const myPkSide: PkSide | null = useMemo(() => {
    if (!myUserId) return null;
    if (pk.hostId && myUserId === pk.hostId) return "HOST";
    if (pk.opponentId && myUserId === pk.opponentId) return "OPPONENT";
    return null;
  }, [myUserId, pk.hostId, pk.opponentId]);

  const visiblePkResult = !!pkResult;
  const isTie = pkResult?.winnerSide == null;
  const isWinner = !!pkResult?.winnerSide && myPkSide != null && pkResult.winnerSide === myPkSide;
  const isLoser = !!pkResult?.loserSide && myPkSide != null && pkResult.loserSide === myPkSide;

  // simple safe punishments (client-side prompt)
  const punishmentText = "Punishment: do a short fun challenge (dance / say a line / 10 squats).";

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <LiveKitRoom
        connect={shouldConnect}
        serverUrl={serverUrl}
        token={lk?.token || ""}
        audio={true}
        video={isHost}
        onConnected={() => setIsRoomConnected(true)}
        onDisconnected={() => setIsRoomConnected(false)}
        onError={(e) => setLkErr(e?.message || "LiveKit error")}
      >
        <DebugTracks />
        <StageVideo fallbackAvatarUrl={displayHostAvatar} />

        <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
          {/* Top overlay */}
          <View style={styles.topOverlay}>
            <View style={styles.topBar}>
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                {displayHostAvatar ? (
                  <Image source={{ uri: displayHostAvatar }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={{ color: "#fff", fontWeight: "900" }}>{initials}</Text>
                  </View>
                )}

                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={styles.hostName} numberOfLines={1}>
                    {displayHostName}
                  </Text>
                  <Text style={styles.subLine} numberOfLines={1}>
                    LK: {isRoomConnected ? "Connected" : lkLoading ? "Loading…" : "Connecting"} • Socket:{" "}
                    {isSocketConnected ? "OK" : "…"} • 👥 {viewerCount}
                  </Text>
                </View>

                {pk.active ? (
                  <View style={styles.pkBadgeMini}>
                    <Text style={{ color: "#fff", fontSize: 10, fontWeight: "900" }}>
                      ⚔️ PK {pkRemaining ? `• ${pkRemaining}` : ""}
                    </Text>
                  </View>
                ) : null}

                {isHost ? (
                  <Pressable onPress={() => setPkModal(true)} style={styles.pkBtn}>
                    <Text style={{ color: "#fff", fontSize: 10, fontWeight: "900" }}>⚔️ PK</Text>
                  </Pressable>
                ) : null}
              </View>

              <Pressable onPress={onPressClose} style={styles.closeBtn}>
                {endingLive ? <ActivityIndicator color="#fff" /> : <Ionicons name="close" size={22} color="#fff" />}
              </Pressable>
            </View>

            <PkBattleField
              pk={pk}
              hostName={displayHostName}
              hostAvatarUrl={displayHostAvatar}
              opponentName={opponentName}
              opponentId={pk.opponentId || pkOpponentId || null}
              opponentAvatarUrl={opponentProfile?.avatarUrl || null}
              remainingText={pkRemaining}
            />
          </View>

          {/* Winner/Loser sticker */}
          <PkResultOverlay
            visible={visiblePkResult}
            isWinner={isWinner}
            isLoser={isLoser}
            isTie={!!isTie}
            punishmentText={punishmentText}
          />

          {/* Gift animation overlay */}
          {giftAnim ? (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.giftAnimWrap,
                {
                  opacity: giftOpacity,
                  transform: [{ scale: giftScale }],
                  bottom: chatBottom + 18,
                },
              ]}
            >
              <View style={styles.giftAnimCard}>
                <Text style={styles.giftAnimTitle} numberOfLines={1}>
                  {giftAnim.senderName} sent {giftAnim.giftName} x{giftAnim.quantity}
                </Text>

                {giftPreviewUrl ? (
                  giftAnim.mediaType === "VIDEO" ? (
                    <Video
                      source={{ uri: giftPreviewUrl }}
                      style={styles.giftAnimMedia}
                      shouldPlay
                      isLooping
                      resizeMode={ResizeMode.CONTAIN}
                      volume={0}
                    />
                  ) : (
                    <Image source={{ uri: giftPreviewUrl }} style={styles.giftAnimMedia} resizeMode="contain" />
                  )
                ) : (
                  <View style={[styles.giftAnimMedia, { alignItems: "center", justifyContent: "center" }]}>
                    <Ionicons name="gift" size={28} color="#fff" />
                  </View>
                )}
              </View>
            </Animated.View>
          ) : null}

          {/* Chat bubbles */}
          <View pointerEvents="none" style={[styles.chatWrap, { bottom: chatBottom, maxWidth: width - 20 }]}>
            <FlatList
              data={bubbles}
              keyExtractor={(i) => i.id}
              inverted
              renderItem={({ item }) => (
                <View style={styles.bubble}>
                  <Text style={{ color: "#fff", fontSize: 12 }}>{item.text}</Text>
                </View>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>

          {/* Bottom overlay - VIEWERS ONLY */}
          {isViewer ? (
            <View style={[styles.bottomOverlay, { paddingBottom: bottomBarBottom + 12 }]}>
              {pk.active ? (
                <View style={styles.pkTargetRow}>
                  <Pressable
                    onPress={() => setPkGiftSide("HOST")}
                    style={[styles.pkTargetChip, pkGiftSide === "HOST" ? styles.pkChipActive : null]}
                  >
                    <Text style={styles.pkChipText}>Send to Host</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setPkGiftSide("OPPONENT")}
                    style={[styles.pkTargetChip, pkGiftSide === "OPPONENT" ? styles.pkChipActive : null]}
                  >
                    <Text style={styles.pkChipText}>Send to Opponent</Text>
                  </Pressable>
                </View>
              ) : null}

              <View style={styles.bottomBar}>
                <Pressable
                  onPress={toggleFollow}
                  disabled={followBusy}
                  style={[
                    styles.iconBtn,
                    followingHost ? { backgroundColor: "rgba(34,197,94,0.55)" } : null,
                    followBusy ? { opacity: 0.7 } : null,
                  ]}
                >
                  <Ionicons name={followingHost ? "person" : "person-add"} size={18} color="#fff" />
                </Pressable>

                <View style={styles.inputWrap}>
                  <Ionicons name="chatbubble-ellipses-outline" size={18} color="rgba(255,255,255,0.85)" />
                  <TextInput
                    value={chat}
                    onChangeText={setChat}
                    placeholder="Say something..."
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    style={styles.input}
                    onSubmitEditing={sendChat}
                    returnKeyType="send"
                    blurOnSubmit={false}
                  />
                  <Pressable onPress={sendChat} hitSlop={10}>
                    <Ionicons name="send" size={18} color="#fff" />
                  </Pressable>
                </View>

                <Pressable onPress={openGifts} style={styles.iconBtn}>
                  <Ionicons name="gift-outline" size={20} color="#fff" />
                </Pressable>
              </View>
            </View>
          ) : null}
        </SafeAreaView>

        {/* Gifts modal (VIEWERS ONLY) */}
        <Modal visible={giftModal} transparent animationType="slide" onRequestClose={() => setGiftModal(false)}>
          <Pressable onPress={() => setGiftModal(false)} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.55)" }}>
            <Pressable style={styles.giftSheet} onPress={() => {}}>
              <View style={styles.giftHeader}>
                <Text style={{ color: "#fff", fontWeight: "900" }}>Gifts</Text>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{ flexDirection: "row", alignItems: "center", marginRight: 10 }}>
                    <Ionicons name="logo-bitcoin" size={16} color="#fff" />
                    <Text style={{ color: "#fff", fontWeight: "900", marginLeft: 6 }}>
                      {loadingWallet ? "…" : coinBalance}
                    </Text>
                  </View>

                  <Pressable
                    onPress={() => {
                      setGiftModal(false);
                      goToCoins();
                    }}
                    style={styles.topupBtn}
                  >
                    <Text style={{ color: "#111827", fontWeight: "900", fontSize: 12 }}>Top up</Text>
                  </Pressable>

                  <Pressable onPress={() => setGiftModal(false)} style={{ marginLeft: 10 }}>
                    <Ionicons name="close" size={18} color="#fff" />
                  </Pressable>
                </View>
              </View>

              <View style={styles.filtersWrap}>
                <View style={styles.searchBox}>
                  <Ionicons name="search" size={16} color="rgba(255,255,255,0.75)" />
                  <TextInput
                    value={giftSearch}
                    onChangeText={setGiftSearch}
                    placeholder="Search gifts"
                    placeholderTextColor="rgba(255,255,255,0.45)"
                    style={styles.searchInput}
                  />
                  {giftSearch ? (
                    <Pressable onPress={() => setGiftSearch("")} hitSlop={10}>
                      <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.75)" />
                    </Pressable>
                  ) : null}
                </View>

                <View style={styles.chipsRow}>
                  <Pressable
                    onPress={() => setGiftTypeFilter("ALL")}
                    style={[styles.chip, giftTypeFilter === "ALL" ? styles.chipActive : null]}
                  >
                    <Text style={styles.chipText}>All</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setGiftTypeFilter("IMAGE")}
                    style={[styles.chip, giftTypeFilter === "IMAGE" ? styles.chipActive : null]}
                  >
                    <Text style={styles.chipText}>Image</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setGiftTypeFilter("GIF")}
                    style={[styles.chip, giftTypeFilter === "GIF" ? styles.chipActive : null]}
                  >
                    <Text style={styles.chipText}>GIF</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setGiftTypeFilter("VIDEO")}
                    style={[styles.chip, giftTypeFilter === "VIDEO" ? styles.chipActive : null]}
                  >
                    <Text style={styles.chipText}>Video</Text>
                  </Pressable>

                  <View style={{ flex: 1 }} />

                  <Pressable
                    onPress={() =>
                      setGiftSort((p) => (p === "POPULAR" ? "PRICE_ASC" : p === "PRICE_ASC" ? "PRICE_DESC" : "POPULAR"))
                    }
                    style={[styles.chip, styles.sortChip]}
                  >
                    <Text style={styles.chipText}>
                      {giftSort === "POPULAR" ? "Popular" : giftSort === "PRICE_ASC" ? "Price ↑" : "Price ↓"}
                    </Text>
                  </Pressable>
                </View>

                {pk.active ? (
                  <View style={styles.pkHintRow}>
                    <Ionicons name="information-circle" size={16} color="rgba(255,255,255,0.75)" />
                    <Text style={styles.pkHintText}>
                      PK active: gifts add points to {pkGiftSide === "HOST" ? "Host" : "Opponent"} side.
                    </Text>
                  </View>
                ) : null}
              </View>

              {loadingGifts ? (
                <View style={{ paddingVertical: 20, alignItems: "center" }}>
                  <ActivityIndicator color="#fff" />
                </View>
              ) : filteredGifts.length === 0 ? (
                <View style={{ paddingVertical: 20 }}>
                  <Text style={{ color: "rgba(255,255,255,0.7)" }}>No gifts match your filters.</Text>
                </View>
              ) : (
                <FlatList
                  data={filteredGifts}
                  keyExtractor={(g) => String(g.id)}
                  numColumns={GIFT_COLS}
                  contentContainerStyle={{ paddingTop: 10, paddingBottom: 14 }}
                  renderItem={({ item, index }) => {
                    const preview = item.thumbnailUrl || item.mediaUrl || item.iconUrl || null;
                    const col = index % GIFT_COLS;
                    const mr = col === GIFT_COLS - 1 ? 0 : GIFT_GAP;
                    const mb = GIFT_GAP;

                    return (
                      <Pressable
                        onPress={() => sendGift(item)}
                        style={[styles.giftCard, { width: giftCardW, marginRight: mr, marginBottom: mb }]}
                      >
                        {preview ? (
                          <Image source={{ uri: preview }} style={styles.giftImg} />
                        ) : (
                          <View style={[styles.giftImg, { alignItems: "center", justifyContent: "center" }]}>
                            <Ionicons name="gift-outline" size={20} color="rgba(255,255,255,0.85)" />
                          </View>
                        )}
                        <Text numberOfLines={1} style={styles.giftName}>
                          {item.name}
                        </Text>
                        <Text style={styles.giftPrice}>{item.price} coins</Text>
                      </Pressable>
                    );
                  }}
                />
              )}
            </Pressable>
          </Pressable>
        </Modal>

        {/* PK invite modal (HOST ONLY) */}
        <Modal visible={pkModal} transparent animationType="fade" onRequestClose={() => setPkModal(false)}>
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 18 }}>
            <View style={styles.pkModalCard}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={{ color: "#fff", fontWeight: "900", fontSize: 16 }}>Start PK</Text>
                <Pressable onPress={() => setPkModal(false)}>
                  <Ionicons name="close" size={18} color="#fff" />
                </Pressable>
              </View>

              <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 6 }}>
                Enter opponent ID and choose duration.
              </Text>

              <View style={styles.pkInputWrap}>
                <Ionicons name="person" size={16} color="rgba(255,255,255,0.75)" />
                <TextInput
                  value={pkOpponentId}
                  onChangeText={setPkOpponentId}
                  placeholder="Opponent userId"
                  placeholderTextColor="rgba(255,255,255,0.45)"
                  style={{ color: "#fff", flex: 1 }}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.pkDurationRow}>
                {[180, 300, 600].map((d) => (
                  <Pressable
                    key={d}
                    onPress={() => setPkDurationSec(d as any)}
                    style={[styles.pkDurationChip, pkDurationSec === d ? styles.pkDurationChipActive : null]}
                  >
                    <Text style={styles.pkDurationText}>{Math.floor(d / 60)}m</Text>
                  </Pressable>
                ))}
              </View>

              <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
                <Pressable
                  onPress={() => setPkModal(false)}
                  style={{ flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 12, backgroundColor: "rgba(255,255,255,0.10)" }}
                >
                  <Text style={{ color: "rgba(255,255,255,0.9)", fontWeight: "900" }}>Cancel</Text>
                </Pressable>

                <Pressable
                  onPress={startPkInvite}
                  disabled={pkBusy || !pkOpponentId.trim()}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    alignItems: "center",
                    backgroundColor: pkBusy || !pkOpponentId.trim() ? "rgba(255,255,255,0.12)" : "rgba(99,102,241,0.9)",
                    borderRadius: 12,
                  }}
                >
                  {pkBusy ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "900" }}>Invite</Text>}
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </LiveKitRoom>
    </View>
  );
}

/* ---------------------------------- Styles -------------------------------- */

const styles = StyleSheet.create({
  topOverlay: {
    paddingTop: 6,
    paddingBottom: 10,
    paddingHorizontal: 12,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  avatar: { width: 34, height: 34, borderRadius: 17, marginRight: 10 },
  avatarFallback: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  hostName: { color: "#fff", fontSize: 12, fontWeight: "800" },
  subLine: { color: "rgba(255,255,255,0.7)", fontSize: 10 },
  closeBtn: { height: 40, width: 40, alignItems: "center", justifyContent: "center" },

  pkBtn: {
    marginLeft: 10,
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  pkBadgeMini: {
    marginLeft: 10,
    backgroundColor: "rgba(239,68,68,0.75)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },

  /* PK Battlefield */
  pkWrap: {
    marginTop: 10,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 14,
    padding: 10,
  },
  pkTopRow: { flexDirection: "row", alignItems: "center" },
  pkSide: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  pkCenter: { width: 92, alignItems: "center", justifyContent: "center" },
  pkVs: { color: "#fff", fontWeight: "900", fontSize: 12 },
  pkTimer: { color: "rgba(255,255,255,0.8)", fontWeight: "800", fontSize: 11, marginTop: 2 },
  pkAvatar: { width: 26, height: 26, borderRadius: 13, backgroundColor: "rgba(255,255,255,0.10)" },
  pkAvatarFallback: { alignItems: "center", justifyContent: "center" },
  pkName: { color: "#fff", fontWeight: "900", fontSize: 11 },
  pkId: { color: "rgba(255,255,255,0.65)", fontSize: 10, marginTop: 1 },
  pkScore: { color: "#fff", fontWeight: "900", fontSize: 14 },
  pkBar: {
    height: 10,
    marginTop: 10,
    borderRadius: 999,
    overflow: "hidden",
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  pkBarLeft: { backgroundColor: "rgba(34,197,94,0.85)" },
  pkBarRight: { backgroundColor: "rgba(239,68,68,0.85)" },

  chatWrap: { position: "absolute", left: 10, width: "90%", maxHeight: 320 },
  bubble: {
    marginBottom: 8,
    backgroundColor: "rgba(0,0,0,0.38)",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  bottomOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 12,
    paddingTop: 10,
    backgroundColor: "rgba(0,0,0,0.28)",
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  pkTargetRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  pkTargetChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  pkChipActive: {
    backgroundColor: "rgba(99,102,241,0.35)",
    borderColor: "rgba(99,102,241,0.8)",
  },
  pkChipText: { color: "#fff", fontWeight: "900", fontSize: 12 },

  iconBtn: {
    height: 46,
    width: 46,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },

  inputWrap: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    minHeight: 46,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  input: { flex: 1, marginLeft: 8, color: "#fff", fontSize: 14, paddingVertical: 0 },

  giftSheet: {
    backgroundColor: "#111827",
    padding: 14,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: 520,
  },
  giftHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  topupBtn: {
    backgroundColor: "#FBBF24",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },

  filtersWrap: { marginTop: 12 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  searchInput: { flex: 1, color: "#fff", paddingVertical: 0 },
  chipsRow: { flexDirection: "row", gap: 8, marginTop: 10, alignItems: "center" },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  chipActive: { backgroundColor: "rgba(99,102,241,0.35)", borderColor: "rgba(99,102,241,0.8)" },
  sortChip: { backgroundColor: "rgba(255,255,255,0.06)" },
  chipText: { color: "#fff", fontWeight: "900", fontSize: 11 },

  pkHintRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 },
  pkHintText: { color: "rgba(255,255,255,0.75)", fontSize: 11, fontWeight: "700" },

  giftCard: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 14,
    padding: 10,
    alignItems: "center",
  },
  giftImg: {
    width: "100%",
    height: 54,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  giftName: { color: "#fff", fontSize: 11, fontWeight: "800", marginTop: 8 },
  giftPrice: { color: "rgba(255,255,255,0.7)", fontSize: 10, marginTop: 2 },

  giftAnimWrap: {
    position: "absolute",
    right: 12,
    width: 180,
  },
  giftAnimCard: {
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  giftAnimTitle: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 11,
    marginBottom: 8,
  },
  giftAnimMedia: {
    width: "100%",
    height: 110,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  pkInputWrap: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  pkDurationRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  pkDurationChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  pkDurationChipActive: {
    borderColor: "rgba(99,102,241,0.9)",
    backgroundColor: "rgba(99,102,241,0.35)",
  },
  pkDurationText: { color: "#fff", fontWeight: "900", fontSize: 12 },

  pkModalCard: {
    backgroundColor: "#0B1220",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },

  pkResultOverlay: {
    position: "absolute",
    top: 120,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 9999,
  },
  pkResultCard: {
    minWidth: 220,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
  },
  pkWinCard: { backgroundColor: "rgba(34,197,94,0.22)", borderColor: "rgba(34,197,94,0.65)" },
  pkLoseCard: { backgroundColor: "rgba(239,68,68,0.22)", borderColor: "rgba(239,68,68,0.65)" },
  pkTieCard: { backgroundColor: "rgba(255,255,255,0.10)", borderColor: "rgba(255,255,255,0.18)" },
  pkResultTitle: { color: "#fff", fontWeight: "900", fontSize: 16 },
  pkResultSub: { marginTop: 6, color: "rgba(255,255,255,0.85)", fontWeight: "800", fontSize: 12, textAlign: "center" },
});
