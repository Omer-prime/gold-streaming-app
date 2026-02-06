// src/screens/ChatRoomScreen.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  FlatList,
  Modal,
  Image,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  Linking,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

import type { ChatStackParamList } from "../navigation/ChatStackNavigator";
import { t } from "../i18n";

type Nav = NativeStackNavigationProp<ChatStackParamList, "ChatRoom">;
type ChatRoute = RouteProp<ChatStackParamList, "ChatRoom">;

type UiMessage = {
  id: string;
  content: string;
  createdAt: string;
  isMine: boolean;
};

type ChatThreadStatus = "REQUESTED" | "ACCEPTED" | "BLOCKED";
type ThreadMeta = {
  id: string;
  status: ChatThreadStatus;
  requestedById: string | null;
};

type PendingAttachment = {
  uri: string;
  kind: "image" | "video";
  name?: string;
  mimeType?: string;
};

const USER_ID_KEY = "gl_user_id";

function getApiBase() {
  const raw =
    (process.env.EXPO_PUBLIC_ADMIN_API_BASE_URL ??
      process.env.EXPO_PUBLIC_API_URL ??
      process.env.EXPO_PUBLIC_API_BASE_URL ??
      "").trim();
  const base = raw.replace(/\/+$/, "");
  return base || "http://192.168.10.25:3000";
}

async function fetchJsonLoose(url: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: { Accept: "application/json", ...(init?.headers ?? {}) },
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  if (!res.ok) throw new Error(json?.error || `Request failed (HTTP ${res.status})`);
  if (!json) {
    const preview = (text || "").replace(/\s+/g, " ").trim().slice(0, 160);
    throw new Error(`API returned non-JSON. Preview: ${preview || "(empty)"}`);
  }
  return json;
}

function mergeUniqueById(existing: UiMessage[], incoming: UiMessage[]) {
  const map = new Map<string, UiMessage>();
  for (const m of existing) map.set(m.id, m);
  for (const m of incoming) map.set(m.id, m);

  const merged = Array.from(map.values());
  merged.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  return merged;
}

function looksLikeUrl(s: string) {
  return /^https?:\/\/\S+/i.test(s.trim());
}
function isImageUrl(s: string) {
  return /\.(png|jpg|jpeg|gif|webp)$/i.test(s.split("?")[0]);
}
function isVideoUrl(s: string) {
  return /\.(mp4|mov|m4v|webm)$/i.test(s.split("?")[0]);
}

const EMOJIS = [
  "😀", "😁", "😂", "🤣", "😊", "😍", "😘", "😎", "🥳", "😭", "😡", "😅", "🤔", "😴",
  "👍", "👎", "🙏", "🙌", "👏", "🔥", "✨", "💯", "❤️", "💔", "🎉", "🎁", "💬", "📌",
  "📷", "🎥", "🚀", "🌟", "🥶", "😈", "🤝", "✅", "❌", "⚡", "🌈", "🍀", "🍕", "☕",
];

const ChatRoomScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<ChatRoute>();
  const insets = useSafeAreaInsets();

  const peerUserId = route.params?.userId;
  const userName = route.params?.userName ?? t("common.userFallback");

  const base = useMemo(() => getApiBase(), []);
  const listRef = useRef<FlatList<UiMessage> | null>(null);

  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [thread, setThread] = useState<ThreadMeta | null>(null);

  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState("");
  const [errorText, setErrorText] = useState<string | null>(null);

  // UI modals
  const [menuOpen, setMenuOpen] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);

  // Attachment state
  const [attachment, setAttachment] = useState<PendingAttachment | null>(null);
  const [uploading, setUploading] = useState(false);

  const isIncomingRequest =
    thread?.status === "REQUESTED" && !!myUserId && thread?.requestedById !== myUserId;

  const isOutgoingRequest =
    thread?.status === "REQUESTED" && !!myUserId && thread?.requestedById === myUserId;

  const isRestricted = thread?.status === "BLOCKED";

  const loadMyId = useCallback(async () => {
    const storedId = await AsyncStorage.getItem(USER_ID_KEY);
    setMyUserId(storedId || null);
    return storedId || null;
  }, []);

  const loadMessages = useCallback(
    async (opts?: { silent?: boolean }) => {
      const silent = Boolean(opts?.silent);
      if (!peerUserId) return;

      try {
        if (!silent) setErrorText(null);
        if (!silent) setLoading(true);

        const uid = myUserId ?? (await loadMyId());
        if (!uid) {
          setMessages([]);
          setThread(null);
          return;
        }

        const url = `${base}/api/chat/messages?userId=${encodeURIComponent(uid)}&peerId=${encodeURIComponent(
          peerUserId
        )}&take=100`;

        const json = (await fetchJsonLoose(url)) as { thread?: ThreadMeta | null; messages: any[] };

        setThread(json?.thread ?? null);

        const incomingRaw = Array.isArray(json?.messages) ? json.messages : [];
        const incoming: UiMessage[] = incomingRaw.map((m: any) => {
          const createdAt = String(m?.createdAt ?? m?.created_at ?? new Date().toISOString());
          const id = String(m?.id ?? `${createdAt}-${Math.random()}`);
          const content = String(m?.content ?? "");
          const isMineComputed =
            typeof m?.isMine === "boolean"
              ? m.isMine
              : m?.senderId && uid
                ? String(m.senderId) === String(uid)
                : false;

          return { id, content, createdAt, isMine: isMineComputed };
        });

        setMessages((prev) => mergeUniqueById(prev, incoming));
      } catch (e: any) {
        if (!silent) setErrorText(e?.message || t("chatRoom.errors.loadFailed"));
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [base, loadMyId, myUserId, peerUserId]
  );

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      (async () => {
        if (!mounted) return;
        await loadMyId();
        await loadMessages();
      })();
      return () => {
        mounted = false;
      };
    }, [loadMessages, loadMyId])
  );

  // polling
  useFocusEffect(
    useCallback(() => {
      const id = setInterval(() => {
        loadMessages({ silent: true }).catch(() => { });
      }, 4000);
      return () => clearInterval(id);
    }, [loadMessages])
  );

  // keep scrolled to bottom (inverted list => offset 0 is "bottom")
  useEffect(() => {
    if (!messages.length) return;
    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    });
  }, [messages.length]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMessages();
    setRefreshing(false);
  }, [loadMessages]);

  const patchThread = useCallback(
    async (action: "accept" | "decline" | "restrict" | "unrestrict") => {
      const uid = myUserId ?? (await loadMyId());
      if (!uid || !peerUserId) return;

      try {
        setErrorText(null);

        await fetchJsonLoose(`${base}/api/chat/thread`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: uid, peerId: peerUserId, action }),
        });

        await loadMessages();
      } catch (e: any) {
        setErrorText(e?.message || "Failed");
      }
    },
    [base, loadMessages, loadMyId, myUserId, peerUserId]
  );

  const ensureMediaPerms = useCallback(async () => {
    const lib = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!lib.granted) {
      Alert.alert("Permission needed", "Please allow media library permission to attach files.");
      return false;
    }
    return true;
  }, []);

  const ensureCameraPerms = useCallback(async () => {
    const cam = await ImagePicker.requestCameraPermissionsAsync();
    if (!cam.granted) {
      Alert.alert("Permission needed", "Please allow camera permission to take photos/videos.");
      return false;
    }
    return true;
  }, []);

  const pickFromLibrary = useCallback(async () => {
    const ok = await ensureMediaPerms();
    if (!ok) return;

    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        quality: 0.9,
      });

      if (res.canceled) return;
      const asset = res.assets?.[0];
      if (!asset?.uri) return;

      const kind = asset.type === "video" ? "video" : "image";
      setAttachment({
        uri: asset.uri,
        kind,
        name: asset.fileName ?? undefined,
        mimeType: asset.mimeType ?? undefined,
      });

      setAttachOpen(false);
    } catch (e: any) {
      Alert.alert("Failed", e?.message || "Could not open library");
    }
  }, [ensureMediaPerms]);

  const captureWithCamera = useCallback(async () => {
    const ok = await ensureCameraPerms();
    if (!ok) return;

    try {
      const res = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        quality: 0.9,
      });

      if (res.canceled) return;
      const asset = res.assets?.[0];
      if (!asset?.uri) return;

      const kind = asset.type === "video" ? "video" : "image";
      setAttachment({
        uri: asset.uri,
        kind,
        name: asset.fileName ?? undefined,
        mimeType: asset.mimeType ?? undefined,
      });

      setAttachOpen(false);
    } catch (e: any) {
      Alert.alert("Failed", e?.message || "Could not open camera");
    }
  }, [ensureCameraPerms]);

  // Try sending attachment as multipart to /api/chat/messages.
  // If backend doesn't support it, fallback to upload endpoints and send URL as content.
  const uploadAttachmentIfNeeded = useCallback(
    async (uid: string, peerId: string, att: PendingAttachment): Promise<string> => {
      const fileName =
        att.name ||
        (att.kind === "video" ? `video_${Date.now()}.mp4` : `image_${Date.now()}.jpg`);

      const filePart: any = {
        uri: att.uri,
        name: fileName,
        type:
          att.mimeType ||
          (att.kind === "video" ? "video/mp4" : "image/jpeg"),
      };

      // 1) Try sending directly to chat/messages as multipart (many backends accept this)
      try {
        const form = new FormData();
        form.append("senderId", uid);
        form.append("receiverId", peerId);
        form.append("content", (text || "").trim() || " "); // keep something
        form.append("file", filePart);

        const res = await fetch(`${base}/api/chat/messages`, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: form,
        });

        const raw = await res.text();
        let json: any = null;
        try {
          json = raw ? JSON.parse(raw) : null;
        } catch {
          json = null;
        }

        if (res.ok) {
          // If backend returns message with content containing URL, use it.
          const msg = json?.message;
          const content = String(msg?.content ?? "");
          if (content && looksLikeUrl(content)) return content;
          // Otherwise, try common fields
          const url =
            json?.url ||
            json?.file?.url ||
            json?.fileUrl ||
            msg?.fileUrl ||
            msg?.mediaUrl;
          if (url) return String(url);
          // If backend accepted but didn't return url, return empty => we still add local preview in UI.
          return "";
        }

        // if backend rejected, we try upload endpoints below
      } catch {
        // ignore, go next
      }

      // 2) Fallback upload endpoints
      const endpoints = [`${base}/api/uploads`, `${base}/api/upload`, `${base}/api/files`];

      for (const ep of endpoints) {
        try {
          const form = new FormData();
          form.append("userId", uid);
          form.append("file", filePart);

          const res = await fetch(ep, {
            method: "POST",
            headers: { Accept: "application/json" },
            body: form,
          });

          if (res.status === 404) continue;

          const raw = await res.text();
          let json: any = null;
          try {
            json = raw ? JSON.parse(raw) : null;
          } catch {
            json = null;
          }

          if (!res.ok) {
            const msg = json?.error || `Upload failed (HTTP ${res.status})`;
            throw new Error(msg);
          }

          const url = json?.url || json?.file?.url || json?.fileUrl;
          if (url) return String(url);
        } catch (e) {
          // keep trying next endpoint
        }
      }

      throw new Error(
        "Attachment selected, but your backend upload endpoint is not available. Add an upload API (or accept multipart on /api/chat/messages)."
      );
    },
    [base, text]
  );

  const handleSend = useCallback(async () => {
    if (!peerUserId) return;

    const uid = myUserId ?? (await loadMyId());
    if (!uid) return;

    const trimmed = text.trim();

    // receiver must accept first for incoming requests
    if (isIncomingRequest) return;

    // cannot send if restricted
    if (isRestricted) return;

    if (!trimmed && !attachment) return;

    setSending(true);
    setErrorText(null);

    try {
      let contentToSend = trimmed;

      // Attachment flow
      if (attachment) {
        setUploading(true);
        let uploadedUrl = "";
        try {
          uploadedUrl = await uploadAttachmentIfNeeded(uid, peerUserId, attachment);
        } finally {
          setUploading(false);
        }

        // If we got a URL, send it as the message content (UI will preview images/videos by URL)
        if (uploadedUrl) {
          contentToSend = uploadedUrl;
        } else {
          // backend accepted multipart but didn't return URL -> still show local preview for sender
          // we will insert a local "pseudo message" so user sees something immediately
          const localId = `local-${Date.now()}`;
          setMessages((prev) =>
            mergeUniqueById(prev, [
              {
                id: localId,
                content: attachment.uri,
                createdAt: new Date().toISOString(),
                isMine: true,
              },
            ])
          );
          setAttachment(null);
          setText("");
          await loadMessages({ silent: true });
          setSending(false);
          return;
        }
      }

      // Normal text (or URL for attachment)
      const res = await fetch(`${base}/api/chat/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ senderId: uid, receiverId: peerUserId, content: contentToSend }),
      });

      const raw = await res.text();
      let json: any = null;
      try {
        json = raw ? JSON.parse(raw) : null;
      } catch {
        json = null;
      }

      if (!res.ok) {
        setErrorText(json?.error || `${t("chatRoom.errors.sendFailed")} (HTTP ${res.status})`);
        return;
      }

      const m = json?.message as { id: string; content: string; createdAt: string } | undefined;
      if (m?.id) {
        setMessages((prev) =>
          mergeUniqueById(prev, [{ id: m.id, content: m.content, createdAt: m.createdAt, isMine: true }])
        );
      } else {
        await loadMessages();
      }

      setText("");
      setAttachment(null);
      await loadMessages({ silent: true });
    } catch (e: any) {
      setErrorText(e?.message || t("chatRoom.errors.sendFailed"));
    } finally {
      setSending(false);
    }
  }, [
    attachment,
    base,
    isIncomingRequest,
    isRestricted,
    loadMessages,
    loadMyId,
    myUserId,
    peerUserId,
    text,
    uploadAttachmentIfNeeded,
  ]);

  const clearLocalChat = useCallback(() => {
    Alert.alert("Clear chat", "This will only clear messages on your screen (local). Continue?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: () => setMessages([]),
      },
    ]);
  }, []);

  const openLink = useCallback(async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert("Failed", "Could not open link");
    }
  }, []);

  const renderMessage = useCallback(
    ({ item }: { item: UiMessage }) => {
      const bubbleBase = "mb-3 max-w-[80%] rounded-2xl px-3 py-2";
      const alignClass = item.isMine ? "self-end" : "self-start";
      const colorClass = item.isMine ? "bg-[#6C4DFF]" : "bg-gray-100";
      const textColor = item.isMine ? "text-white" : "text-gray-900";

      const content = item.content?.trim() ?? "";
      const isUrl = looksLikeUrl(content) || content.startsWith("file://") || content.startsWith("content://");

      // Preview image if URL looks like image (or local file URI for sender preview)
      const showImage = (looksLikeUrl(content) && isImageUrl(content)) || content.startsWith("file://");
      const showVideo = looksLikeUrl(content) && isVideoUrl(content);

      return (
        <View className={`${bubbleBase} ${alignClass} ${colorClass}`}>
          {showImage ? (
            <Pressable onPress={() => (looksLikeUrl(content) ? openLink(content) : undefined)}>
              <Image
                source={{ uri: content }}
                style={{ width: 220, height: 220, borderRadius: 14 }}
                resizeMode="cover"
              />
              {looksLikeUrl(content) && (
                <Text className={`mt-2 text-[11px] ${textColor}`} numberOfLines={1}>
                  {content}
                </Text>
              )}
            </Pressable>
          ) : showVideo ? (
            <Pressable onPress={() => openLink(content)}>
              <View className="flex-row items-center">
                <Ionicons name="play-circle" size={22} color={item.isMine ? "#FFFFFF" : "#111827"} />
                <Text className={`ml-2 text-[13px] ${textColor}`}>Video</Text>
              </View>
              <Text className={`mt-1 text-[11px] ${textColor}`} numberOfLines={1}>
                {content}
              </Text>
            </Pressable>
          ) : (
            <Text className={`text-[13px] ${textColor}`}>{content}</Text>
          )}

          {/* If it's some other URL, still clickable */}
          {!showImage && !showVideo && isUrl && looksLikeUrl(content) && (
            <Pressable onPress={() => openLink(content)} className="mt-2">
              <Text className={`text-[11px] underline ${textColor}`}>Open link</Text>
            </Pressable>
          )}
        </View>
      );
    },
    [openLink]
  );

  const keyboardBehavior = Platform.OS === "ios" ? "padding" : "height";
  const keyboardVerticalOffset = Platform.OS === "ios" ? 8 : insets.top + 56; // header-ish offset

  if (!peerUserId) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-[16px] font-semibold text-black mb-2">Chat</Text>
          <Text className="text-[12px] text-gray-500 text-center">Missing peer userId in route params.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!myUserId && !loading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-[16px] font-semibold text-black mb-2">{t("chatRoom.loggedOut.title")}</Text>
          <Text className="text-[12px] text-gray-500 text-center">{t("chatRoom.loggedOut.subtitle")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={keyboardBehavior as any}
        keyboardVerticalOffset={keyboardVerticalOffset}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} accessible={false}>
          <View className="flex-1">
            {/* Header */}
            <View className="flex-row items-center border-b border-gray-100 px-4 pt-3 pb-2">
              <Pressable
                onPress={() => navigation.goBack()}
                className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-gray-100"
              >
                <Ionicons name="chevron-back" size={20} color="#111827" />
              </Pressable>

              <View className="flex-1">
                <Text className="text-[16px] font-semibold text-black">{userName}</Text>
                <Text className="text-[11px] text-gray-400">{t("chatRoom.labels.online")}</Text>
              </View>

              <Pressable
                onPress={() => Alert.alert("Call", "Call feature not connected yet.")}
                className="mr-4"
                hitSlop={8}
              >
                <Ionicons name="call-outline" size={20} color="#6C4DFF" />
              </Pressable>

              <Pressable onPress={() => setMenuOpen(true)} hitSlop={8}>
                <Ionicons name="ellipsis-vertical" size={18} color="#6B7280" />
              </Pressable>
            </View>

            {/* Thread banners */}
            {isIncomingRequest && (
              <View className="px-4 pt-3">
                <View className="rounded-2xl bg-[#FFF7ED] border border-[#FED7AA] px-4 py-3">
                  <Text className="text-[13px] font-semibold text-[#9A3412]">
                    {t("chatRoom.request.incomingTitle")}
                  </Text>
                  <Text className="mt-1 text-[12px] text-[#9A3412]">
                    {t("chatRoom.request.incomingBody", { name: userName })}
                  </Text>

                  <View className="flex-row mt-3">
                    <Pressable
                      onPress={() => patchThread("decline")}
                      className="flex-1 h-10 rounded-xl bg-white border border-[#FED7AA] items-center justify-center mr-2"
                    >
                      <Text className="text-[13px] font-semibold text-[#9A3412]">
                        {t("chatRoom.request.decline")}
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() => patchThread("accept")}
                      className="flex-1 h-10 rounded-xl bg-[#6C4DFF] items-center justify-center"
                    >
                      <Text className="text-[13px] font-semibold text-white">
                        {t("chatRoom.request.accept")}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            )}

            {isOutgoingRequest && (
              <View className="px-4 pt-3">
                <View className="rounded-2xl bg-gray-50 border border-gray-200 px-4 py-3">
                  <Text className="text-[13px] font-semibold text-gray-800">{t("chatRoom.request.sentTitle")}</Text>
                  <Text className="mt-1 text-[12px] text-gray-600">
                    {t("chatRoom.request.sentBody", { name: userName })}
                  </Text>
                </View>
              </View>
            )}

            {isRestricted && (
              <View className="px-4 pt-3">
                <View className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3">
                  <Text className="text-[13px] font-semibold text-red-700">{t("chatRoom.restricted.title")}</Text>
                  <Text className="mt-1 text-[12px] text-red-600">{t("chatRoom.restricted.body")}</Text>

                  <Pressable
                    onPress={() => patchThread("unrestrict")}
                    className="mt-3 h-10 rounded-xl bg-white border border-red-200 items-center justify-center"
                  >
                    <Text className="text-[13px] font-semibold text-red-600">{t("chatRoom.restricted.unrestrict")}</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {!!errorText && (
              <View className="px-4 pt-3">
                <View className="rounded-2xl bg-red-50 border border-red-200 px-3 py-2">
                  <Text className="text-[11px] text-red-600">{errorText}</Text>
                </View>
              </View>
            )}

            {/* Messages */}
            {loading ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator />
                <Text className="mt-2 text-xs text-gray-500">{t("chatRoom.states.loading")}</Text>
              </View>
            ) : (
              <FlatList
                ref={(r) => {
                  listRef.current = r;
                }}
                data={[...messages].reverse()} // inverted view (latest at bottom)
                keyExtractor={(item) => item.id}
                renderItem={renderMessage}
                inverted
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                  <Text className="text-center text-[12px] text-gray-400 mt-6">
                    {t("chatRoom.states.empty", { name: userName })}
                  </Text>
                }
              />
            )}

            {/* Attachment preview */}
            {!!attachment && (
              <View className="px-3 pb-2">
                <View className="flex-row items-center rounded-2xl border border-gray-200 bg-white px-3 py-2">
                  {attachment.kind === "image" ? (
                    <Image
                      source={{ uri: attachment.uri }}
                      style={{ width: 44, height: 44, borderRadius: 10 }}
                    />
                  ) : (
                    <View className="h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
                      <Ionicons name="videocam" size={20} color="#111827" />
                    </View>
                  )}

                  <View className="flex-1 ml-3">
                    <Text className="text-[12px] font-semibold text-gray-900" numberOfLines={1}>
                      {attachment.kind === "image" ? "Image selected" : "Video selected"}
                    </Text>
                    <Text className="text-[11px] text-gray-500" numberOfLines={1}>
                      {attachment.name || attachment.uri}
                    </Text>
                  </View>

                  <Pressable onPress={() => setAttachment(null)} hitSlop={8}>
                    <Ionicons name="close-circle" size={22} color="#9CA3AF" />
                  </Pressable>
                </View>
              </View>
            )}

            {/* Input */}
            <View className="border-t border-gray-100 bg-white px-3 py-2">
              <View className="flex-row items-center">
                <Pressable
                  className="mr-2"
                  onPress={() => {
                    Keyboard.dismiss();
                    setAttachOpen(true);
                  }}
                  hitSlop={8}
                  disabled={sending || isIncomingRequest || isRestricted}
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={24}
                    color={sending || isIncomingRequest || isRestricted ? "#D1D5DB" : "#6C4DFF"}
                  />
                </Pressable>

                <View className="flex-1 flex-row items-center rounded-full bg-gray-100 px-3 py-2">
                  <TextInput
                    placeholder={t("chatRoom.input.placeholder")}
                    placeholderTextColor="#9CA3AF"
                    className="flex-1 text-[14px] text-gray-900"
                    value={text}
                    onChangeText={setText}
                    editable={!sending && !isIncomingRequest && !isRestricted}
                    multiline
                    style={{ maxHeight: 110 }}
                  />

                  <Pressable
                    onPress={() => {
                      Keyboard.dismiss();
                      setEmojiOpen(true);
                    }}
                    hitSlop={8}
                    disabled={sending || isIncomingRequest || isRestricted}
                  >
                    <Ionicons
                      name="happy-outline"
                      size={22}
                      color={sending || isIncomingRequest || isRestricted ? "#D1D5DB" : "#6B7280"}
                    />
                  </Pressable>
                </View>

                <Pressable
                  className="ml-2"
                  onPress={handleSend}
                  hitSlop={8}
                  disabled={
                    sending ||
                    uploading ||
                    isIncomingRequest ||
                    isRestricted ||
                    (!text.trim() && !attachment)
                  }
                >
                  <Ionicons
                    name="send"
                    size={22}
                    color={
                      sending ||
                        uploading ||
                        isIncomingRequest ||
                        isRestricted ||
                        (!text.trim() && !attachment)
                        ? "#9CA3AF"
                        : "#6C4DFF"
                    }
                  />
                </Pressable>
              </View>

              {(sending || uploading) && (
                <View className="mt-2 flex-row items-center justify-end">
                  <ActivityIndicator size="small" />
                  <Text className="ml-2 text-[11px] text-gray-500">
                    {uploading ? "Uploading…" : "Sending…"}
                  </Text>
                </View>
              )}
            </View>

            {/* 3-dots menu modal */}
            <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
              <Pressable className="flex-1 bg-black/30" onPress={() => setMenuOpen(false)}>
                <View className="flex-1 justify-start items-end pt-16 px-3">
                  <Pressable
                    className="w-[220px] rounded-2xl bg-white border border-gray-200 overflow-hidden"
                    onPress={() => { }}
                  >
                    <Pressable
                      className="px-4 py-3 flex-row items-center"
                      onPress={() => {
                        setMenuOpen(false);
                        clearLocalChat();
                      }}
                    >
                      <Ionicons name="trash-outline" size={18} color="#111827" />
                      <Text className="ml-3 text-[13px] text-gray-900">Clear chat (local)</Text>
                    </Pressable>

                    <View className="h-[1px] bg-gray-100" />

                    <Pressable
                      className="px-4 py-3 flex-row items-center"
                      onPress={() => {
                        setMenuOpen(false);
                        patchThread(isRestricted ? "unrestrict" : "restrict");
                      }}
                    >
                      <Ionicons name={isRestricted ? "lock-open-outline" : "lock-closed-outline"} size={18} color="#111827" />
                      <Text className="ml-3 text-[13px] text-gray-900">
                        {isRestricted ? "Unrestrict user" : "Restrict user"}
                      </Text>
                    </Pressable>

                    {isIncomingRequest && (
                      <>
                        <View className="h-[1px] bg-gray-100" />
                        <Pressable
                          className="px-4 py-3 flex-row items-center"
                          onPress={() => {
                            setMenuOpen(false);
                            patchThread("decline");
                          }}
                        >
                          <Ionicons name="close-circle-outline" size={18} color="#DC2626" />
                          <Text className="ml-3 text-[13px] text-red-600">Decline request</Text>
                        </Pressable>
                      </>
                    )}

                    <View className="h-[1px] bg-gray-100" />

                    <Pressable
                      className="px-4 py-3 flex-row items-center"
                      onPress={() => setMenuOpen(false)}
                    >
                      <Ionicons name="close-outline" size={18} color="#6B7280" />
                      <Text className="ml-3 text-[13px] text-gray-700">Cancel</Text>
                    </Pressable>
                  </Pressable>
                </View>
              </Pressable>
            </Modal>

            {/* Attach modal */}
            <Modal visible={attachOpen} transparent animationType="slide" onRequestClose={() => setAttachOpen(false)}>
              <Pressable className="flex-1 bg-black/30" onPress={() => setAttachOpen(false)}>
                <Pressable
                  className="mt-auto rounded-t-3xl bg-white px-4 pt-4 pb-6"
                  onPress={() => { }}
                >
                  <View className="items-center mb-3">
                    <View className="h-1.5 w-10 rounded-full bg-gray-200" />
                  </View>

                  <Text className="text-[14px] font-semibold text-gray-900 mb-3">Attach</Text>

                  <Pressable
                    className="h-12 rounded-2xl bg-gray-100 items-center justify-center flex-row"
                    onPress={pickFromLibrary}
                  >
                    <Ionicons name="images-outline" size={18} color="#111827" />
                    <Text className="ml-2 text-[13px] text-gray-900">Photo / Video (Library)</Text>
                  </Pressable>

                  <Pressable
                    className="h-12 rounded-2xl bg-gray-100 items-center justify-center flex-row mt-3"
                    onPress={captureWithCamera}
                  >
                    <Ionicons name="camera-outline" size={18} color="#111827" />
                    <Text className="ml-2 text-[13px] text-gray-900">Camera</Text>
                  </Pressable>

                  {attachment && (
                    <Pressable
                      className="h-12 rounded-2xl bg-red-50 items-center justify-center flex-row mt-3"
                      onPress={() => {
                        setAttachment(null);
                        setAttachOpen(false);
                      }}
                    >
                      <Ionicons name="close-circle-outline" size={18} color="#DC2626" />
                      <Text className="ml-2 text-[13px] text-red-600">Remove selected attachment</Text>
                    </Pressable>
                  )}

                  <Pressable
                    className="h-12 rounded-2xl bg-white border border-gray-200 items-center justify-center flex-row mt-4"
                    onPress={() => setAttachOpen(false)}
                  >
                    <Text className="text-[13px] text-gray-900">Cancel</Text>
                  </Pressable>
                </Pressable>
              </Pressable>
            </Modal>

            {/* Emoji modal */}
            <Modal visible={emojiOpen} transparent animationType="slide" onRequestClose={() => setEmojiOpen(false)}>
              <Pressable className="flex-1 bg-black/30" onPress={() => setEmojiOpen(false)}>
                <Pressable
                  className="mt-auto rounded-t-3xl bg-white px-4 pt-4 pb-6"
                  onPress={() => { }}
                >
                  <View className="items-center mb-3">
                    <View className="h-1.5 w-10 rounded-full bg-gray-200" />
                  </View>

                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-[14px] font-semibold text-gray-900">Emojis</Text>
                    <Pressable onPress={() => setEmojiOpen(false)} hitSlop={8}>
                      <Ionicons name="close" size={20} color="#6B7280" />
                    </Pressable>
                  </View>

                  <FlatList
                    data={EMOJIS}
                    keyExtractor={(e, idx) => `${e}-${idx}`}
                    numColumns={8}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 6 }}
                    renderItem={({ item }) => (
                      <Pressable
                        onPress={() => setText((prev) => `${prev}${item}`)}
                        className="h-11 w-11 items-center justify-center"
                      >
                        <Text style={{ fontSize: 22 }}>{item}</Text>
                      </Pressable>
                    )}
                  />
                </Pressable>
              </Pressable>
            </Modal>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatRoomScreen;
