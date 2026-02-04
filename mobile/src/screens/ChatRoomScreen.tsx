// src/screens/ChatRoomScreen.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ChatStackParamList } from "../navigation/ChatStackNavigator";

type Nav = NativeStackNavigationProp<ChatStackParamList, "ChatRoom">;
type ChatRoute = RouteProp<ChatStackParamList, "ChatRoom">;

type UiMessage = {
  id: string;
  content: string;
  createdAt: string;
  isMine: boolean;
};

const USER_ID_KEY = "gl_user_id";

function getApiBase() {
  const raw =
    (process.env.EXPO_PUBLIC_API_URL ??
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

  if (!res.ok) {
    throw new Error(json?.error || `Request failed (HTTP ${res.status})`);
  }
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
  merged.sort((a, b) => {
    const ta = new Date(a.createdAt).getTime();
    const tb = new Date(b.createdAt).getTime();
    return ta - tb;
  });
  return merged;
}

const ChatRoomScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<ChatRoute>();

  const peerUserId = route.params?.userId;
  const userName = route.params?.userName ?? "User";

  const base = useMemo(() => getApiBase(), []);
  const scrollRef = useRef<ScrollView | null>(null);

  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState("");
  const [errorText, setErrorText] = useState<string | null>(null);

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
          return;
        }

        const url = `${base}/api/chat/messages?userId=${encodeURIComponent(
          uid
        )}&peerId=${encodeURIComponent(peerUserId)}&take=100`;

        const json = (await fetchJsonLoose(url)) as { messages: UiMessage[] };
        const incoming = Array.isArray(json?.messages) ? json.messages : [];

        setMessages((prev) => mergeUniqueById(prev, incoming));
      } catch (e: any) {
        if (!silent) {
          setErrorText(e?.message || "Failed to load messages");
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [base, loadMyId, myUserId, peerUserId]
  );

  // initial + focus reload
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

  // simple polling (near real-time)
  useFocusEffect(
    useCallback(() => {
      const id = setInterval(() => {
        loadMessages({ silent: true }).catch(() => {});
      }, 4000);

      return () => clearInterval(id);
    }, [loadMessages])
  );

  // scroll to bottom on new message count
  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages.length]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMessages();
    setRefreshing(false);
  }, [loadMessages]);

  const handleSend = useCallback(async () => {
    if (!peerUserId) return;

    const uid = myUserId ?? (await loadMyId());
    if (!uid) return;

    const trimmed = text.trim();
    if (!trimmed) return;

    setSending(true);
    try {
      const res = await fetch(`${base}/api/chat/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          senderId: uid,
          receiverId: peerUserId,
          content: trimmed,
        }),
      });

      const raw = await res.text();
      let json: any = null;
      try {
        json = raw ? JSON.parse(raw) : null;
      } catch {
        json = null;
      }

      if (!res.ok) {
        setErrorText(json?.error || `Send failed (HTTP ${res.status})`);
        return;
      }

      const m = json?.message as { id: string; content: string; createdAt: string } | undefined;
      if (m?.id) {
        setMessages((prev) =>
          mergeUniqueById(prev, [
            ...prev,
            { id: m.id, content: m.content, createdAt: m.createdAt, isMine: true },
          ])
        );
      } else {
        // fallback: reload
        await loadMessages();
      }

      setText("");
    } catch (e: any) {
      setErrorText(e?.message || "Send failed");
    } finally {
      setSending(false);
    }
  }, [base, loadMessages, loadMyId, myUserId, peerUserId, text]);

  if (!myUserId && !loading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-[16px] font-semibold text-black mb-2">
            You&apos;re logged out
          </Text>
          <Text className="text-[12px] text-gray-500 text-center">
            Please login again to use chat.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
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
              <Text className="text-[16px] font-semibold text-black">
                {userName}
              </Text>
              <Text className="text-[11px] text-gray-400">Online</Text>
            </View>

            <Ionicons
              name="call-outline"
              size={20}
              color="#6C4DFF"
              style={{ marginRight: 16 }}
            />
            <Ionicons name="ellipsis-vertical" size={18} color="#6B7280" />
          </View>

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
              <Text className="mt-2 text-xs text-gray-500">
                Loading messages...
              </Text>
            </View>
          ) : (
            <ScrollView
              ref={scrollRef}
              className="flex-1 px-4"
              contentContainerStyle={{ paddingVertical: 12 }}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            >
              {messages.map((m) => {
                const bubbleBase = "mb-3 max-w-[80%] rounded-2xl px-3 py-2";
                const alignClass = m.isMine ? "self-end" : "self-start";
                const colorClass = m.isMine ? "bg-[#6C4DFF]" : "bg-gray-100";

                return (
                  <View
                    key={m.id}
                    className={`${bubbleBase} ${alignClass} ${colorClass}`}
                  >
                    <Text
                      className={`text-[13px] ${
                        m.isMine ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {m.content}
                    </Text>
                  </View>
                );
              })}

              {messages.length === 0 && (
                <Text className="text-center text-[12px] text-gray-400 mt-6">
                  Say hi to {userName} 👋
                </Text>
              )}
            </ScrollView>
          )}

          {/* Input */}
          <View className="flex-row items-center border-t border-gray-100 bg-white px-3 py-2">
            <Pressable className="mr-2">
              <Ionicons name="add-circle-outline" size={24} color="#6C4DFF" />
            </Pressable>

            <View className="flex-1 flex-row items-center rounded-full bg-gray-100 px-3 py-2">
              <TextInput
                placeholder="Type a message..."
                placeholderTextColor="#9CA3AF"
                className="flex-1 text-[14px] text-gray-900"
                value={text}
                onChangeText={setText}
                editable={!sending}
              />
              <Pressable disabled={sending}>
                <Ionicons name="happy-outline" size={22} color="#9CA3AF" />
              </Pressable>
            </View>

            <Pressable
              className="ml-2"
              onPress={handleSend}
              disabled={sending || !text.trim()}
            >
              <Ionicons
                name="send"
                size={22}
                color={sending || !text.trim() ? "#9CA3AF" : "#6C4DFF"}
              />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatRoomScreen;
