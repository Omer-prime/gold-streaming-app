import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config";
import { CameraView, useCameraPermissions } from "expo-camera";
import { io, Socket } from "socket.io-client";
import { t } from "../i18n";

type LiveStatus = {
  approved: boolean;
  applicationStatus: "NONE" | "PENDING" | "APPROVED" | "REJECTED";
  host: { id: string; name: string; avatarUrl: string | null; liveCoverUrl: string | null };
  activeStream: null | { id: string; title: string; startedAt: string; viewers: number; mode: string };
};

type ChatMsg = { id: string; text: string };

type SocketChatPayload = {
  id: string;
  userId: string;
  name: string;
  text: string;
  at: number;
};

const HostLiveRoomScreen: React.FC = () => {
  const navigation = useNavigation<any>();


  const [perm, requestPerm] = useCameraPermissions();
  const [cameraFacing, setCameraFacing] = useState<"front" | "back">("front");

  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [ending, setEnding] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);
  const [hostName, setHostName] = useState<string>("Host");
  const [streamId, setStreamId] = useState<string | null>(null);
  const [streamTitle, setStreamTitle] = useState<string>(t("hostLiveRoom.defaults.liveTitle"));
  const [seconds, setSeconds] = useState(0);

  const [viewerCount, setViewerCount] = useState(0);

  const [chat, setChat] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([
    { id: "1", text: t("hostLiveRoom.chat.welcome") },
  ]);

  const socketRef = useRef<Socket | null>(null);

  useFocusEffect(
    useCallback(() => {
      const parent = navigation.getParent?.();
      parent?.setOptions?.({ tabBarStyle: { display: "none" } });
      return () => parent?.setOptions?.({ tabBarStyle: undefined });
    }, [navigation])
  );

  const bootstrap = useCallback(async () => {
    try {
      setLoading(true);

      const uid = await AsyncStorage.getItem("gl_user_id");
      setUserId(uid);

      if (!uid) {
        navigation.popToTop?.();
        return;
      }

      if (!perm?.granted) {
        await requestPerm();
      }

      const res = await fetch(`${API_BASE_URL}/api/live?userId=${encodeURIComponent(uid)}`);
      const json = (await res.json().catch(() => null)) as LiveStatus | null;

      if (!res.ok || !json) {
        navigation.replace("LiveApplication");
        return;
      }

      const isApproved = !!json.approved || json.applicationStatus === "APPROVED";
      if (!isApproved) {
        navigation.replace("LiveApplication");
        return;
      }

      setHostName(json.host?.name || t("hostLiveRoom.defaults.hostName"));

      if (json.activeStream?.id) {
        setStreamId(json.activeStream.id);
        setStreamTitle(json.activeStream.title || t("hostLiveRoom.defaults.liveTitle"));
        setSeconds(0);
        setViewerCount(json.activeStream.viewers ?? 0);
      } else {
        setStreamId(null);
        setSeconds(0);
        setViewerCount(0);
      }
    } catch (e) {
      console.error("bootstrap live room error", e);
      navigation.replace("LiveApplication");
    } finally {
      setLoading(false);
    }
  }, [navigation, perm?.granted, requestPerm, t]);

  useFocusEffect(
    useCallback(() => {
      bootstrap();
    }, [bootstrap])
  );

  // timer
  useEffect(() => {
    if (!streamId) return;
    const tt = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(tt);
  }, [streamId]);

  const timeLabel = useMemo(() => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }, [seconds]);

  // ✅ socket connect when streamId exists
  useEffect(() => {
    let mounted = true;

    const connect = async () => {
      if (!streamId || !userId) return;

      // avoid double connect
      if (socketRef.current?.connected) return;

      const s = io(API_BASE_URL, {
        path: "/socket.io",
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 800,
      });

      socketRef.current = s;

      s.on("connect", () => {
        s.emit("join", {
          streamId,
          userId,
          name: hostName || t("hostLiveRoom.defaults.hostName"),
          role: "host",
        });
      });

      s.on("viewerCount", (payload: { streamId: string; count: number }) => {
        if (!mounted) return;
        if (payload?.streamId === streamId) setViewerCount(payload.count ?? 0);
      });

      s.on("chat", (payload: SocketChatPayload) => {
        if (!mounted) return;
        const line = t("hostLiveRoom.chat.line", {
          name: payload?.name || t("hostLiveRoom.chat.guest"),
          text: payload?.text || "",
        });
        setMessages((prev) => [{ id: payload.id || String(Date.now()), text: line }, ...prev]);
      });

      s.on("system", (payload: { text: string }) => {
        if (!mounted) return;
        if (payload?.text) {
          setMessages((prev) => [
            { id: String(Date.now()), text: t("hostLiveRoom.chat.system", { text: payload.text }) },
            ...prev,
          ]);
        }
      });
    };

    connect();

    return () => {
      mounted = false;
    };
  }, [streamId, userId, hostName, t]);

  const startLive = async () => {
    if (!userId || starting) return;

    if (!perm?.granted) {
      await requestPerm();
      if (!perm?.granted) {
        setMessages((prev) => [
          { id: Date.now().toString(), text: t("hostLiveRoom.errors.cameraRequiredToGoLive") },
          ...prev,
        ]);
        return;
      }
    }

    try {
      setStarting(true);

      const res = await fetch(`${API_BASE_URL}/api/live`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, title: streamTitle, mode: "SOLO" }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        navigation.replace("LiveApplication");
        return;
      }

      const sid = json?.stream?.id as string | undefined;
      if (sid) {
        setStreamId(sid);
        setSeconds(0);
        setViewerCount(json?.stream?.viewers ?? 0);

        setMessages((prev) => [
          { id: Date.now().toString(), text: t("hostLiveRoom.messages.liveNow") },
          ...prev,
        ]);
      }
    } finally {
      setStarting(false);
    }
  };

  const stopLive = async () => {
    if (!userId || !streamId || ending) return;

    try {
      setEnding(true);

      // ✅ leave socket room
      try {
        socketRef.current?.emit("leave");
        socketRef.current?.disconnect();
      } catch {}
      socketRef.current = null;

      await fetch(`${API_BASE_URL}/api/live`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, streamId }),
      }).catch(() => null);
    } finally {
      setEnding(false);
      if (navigation.popToTop) navigation.popToTop();
      else navigation.navigate("ExploreMain");
    }
  };

  const confirmStop = () => {
    if (!streamId) {
      if (navigation.popToTop) navigation.popToTop();
      else navigation.goBack();
      return;
    }
    Alert.alert(t("hostLiveRoom.alerts.stopTitle"), t("hostLiveRoom.alerts.stopMsg"), [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("hostLiveRoom.actions.stop"), style: "destructive", onPress: stopLive },
    ]);
  };

  const sendChat = () => {
    const tt = chat.trim();
    if (!tt) return;

    setChat("");
    setMessages((prev) => [{ id: Date.now().toString(), text: t("hostLiveRoom.chat.meLine", { text: tt }) }, ...prev]);

    try {
      socketRef.current?.emit("chat", {
        streamId,
        userId: userId || "host",
        name: hostName || t("hostLiveRoom.defaults.hostName"),
        text: tt,
      });
    } catch {}
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator color="#fff" />
        <Text className="mt-2 text-[12px] text-white/70">{t("hostLiveRoom.states.preparing")}</Text>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {perm?.granted ? (
        <CameraView
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          facing={cameraFacing}
        />
      ) : (
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" }}>
          <Text className="text-white/70 text-[12px] mb-3">{t("hostLiveRoom.permission.required")}</Text>
          <Pressable onPress={requestPerm} className="rounded-full bg-white/15 px-4 py-2">
            <Text className="text-white text-[12px] font-semibold">{t("hostLiveRoom.permission.grant")}</Text>
          </Pressable>
        </View>
      )}

      <SafeAreaView className="flex-1" edges={["top"]}>
        <View className="px-3 pt-2 flex-row items-center justify-between">
          <Pressable onPress={() => navigation.goBack()} className="h-10 w-10 items-center justify-center">
            <Ionicons name="close" size={22} color="#fff" />
          </Pressable>

          <View className="flex-1 mx-2">
            <View className="self-center bg-black/40 rounded-full px-3 py-1 flex-row items-center">
              <Text className="text-white text-[12px] font-semibold" numberOfLines={1}>
                {hostName}
              </Text>

              {!!streamId && (
                <View className="ml-2 px-2 py-0.5 rounded-full bg-red-500">
                  <Text className="text-white text-[10px] font-bold">{t("hostLiveRoom.labels.liveBadge")}</Text>
                </View>
              )}

              {!!streamId && <Text className="ml-2 text-white/80 text-[11px]">{timeLabel}</Text>}
              {!!streamId && <Text className="ml-2 text-white/80 text-[11px]">👥 {viewerCount}</Text>}
            </View>
          </View>

          {!!streamId ? (
            <Pressable onPress={confirmStop} className="px-4 py-2 rounded-full bg-red-500">
              <Text className="text-white font-semibold text-[12px]">{t("hostLiveRoom.actions.stop")}</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => setCameraFacing((p) => (p === "front" ? "back" : "front"))}
              className="h-10 w-10 items-center justify-center"
            >
              <Ionicons name="camera-reverse-outline" size={22} color="#fff" />
            </Pressable>
          )}
        </View>

        <View style={{ position: "absolute", left: 10, bottom: 120, width: "72%", maxHeight: 320 }}>
          <FlatList
            data={messages}
            keyExtractor={(i) => i.id}
            inverted
            renderItem={({ item }) => (
              <View className="mb-2 bg-black/35 rounded-2xl px-3 py-2">
                <Text className="text-white text-[12px]">{item.text}</Text>
              </View>
            )}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {!streamId && (
          <View style={{ position: "absolute", left: 14, right: 14, bottom: 170 }}>
            <View className="bg-black/35 rounded-2xl px-3 py-3">
              <Text className="text-white/80 text-[11px] mb-2">{t("hostLiveRoom.labels.liveTitle")}</Text>
              <TextInput
                value={streamTitle}
                onChangeText={setStreamTitle}
                placeholder={t("hostLiveRoom.placeholders.liveTitle")}
                placeholderTextColor="rgba(255,255,255,0.55)"
                className="text-white text-[13px]"
              />
            </View>

            <Pressable
              disabled={starting}
              onPress={startLive}
              className={`mt-3 rounded-full py-3 ${starting ? "bg-red-500/60" : "bg-red-500"}`}
            >
              {starting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-center text-white font-semibold text-[14px]">{t("hostLiveRoom.actions.goLive")}</Text>
              )}
            </Pressable>
          </View>
        )}

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}
        >
          <View className="px-3 pb-3 pt-2 flex-row items-center">
            <View className="flex-1 bg-black/35 rounded-full px-3 py-2 flex-row items-center">
              <Ionicons name="chatbubble-ellipses-outline" size={18} color="rgba(255,255,255,0.85)" />
              <TextInput
                value={chat}
                onChangeText={setChat}
                placeholder={t("hostLiveRoom.placeholders.chat")}
                placeholderTextColor="rgba(255,255,255,0.55)"
                className="flex-1 ml-2 text-white text-[13px]"
              />
              <Pressable onPress={sendChat} hitSlop={10}>
                <Ionicons name="send" size={18} color="#fff" />
              </Pressable>
            </View>

            <Pressable className="ml-3 h-11 w-11 rounded-full bg-black/35 items-center justify-center">
              <Ionicons name="gift-outline" size={22} color="#fff" />
            </Pressable>
          </View>

          {ending && (
            <View className="px-3 pb-2">
              <Text className="text-center text-white/70 text-[11px]">{t("hostLiveRoom.states.stopping")}</Text>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

export default HostLiveRoomScreen;
