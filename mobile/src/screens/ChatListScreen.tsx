// src/screens/ChatListScreen.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  TextInput,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ChatStackParamList } from "../navigation/ChatStackNavigator";
import { t } from "../i18n";

type Nav = NativeStackNavigationProp<ChatStackParamList, "ChatList">;

type ChatThreadStatus = "REQUESTED" | "ACCEPTED" | "BLOCKED";

type ConversationItem = {
  threadId: string;
  otherUserId: string;
  otherUsername: string;
  otherNickname: string | null;
  otherAvatarUrl: string | null;
  lastMessageText: string | null;
  lastMessageAt: string | null;
  unreadCount: number;

  // ✅ NEW
  status: ChatThreadStatus;
  requestedById: string | null;
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

function normalizeUrl(base: string, url: string | null) {
  if (!url) return null;
  const u = String(url).trim();
  if (!u) return null;
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  if (u.startsWith("//")) return `https:${u}`;
  if (u.startsWith("/")) return `${base}${u}`;
  return `${base}/${u}`;
}

const ChatListScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const base = useMemo(() => getApiBase(), []);

  const [myUserId, setMyUserId] = useState<string | null>(null);

  const [items, setItems] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasUser, setHasUser] = useState(true);

  const [unreadNotif, setUnreadNotif] = useState(0);
  const [loadingUnreadNotif, setLoadingUnreadNotif] = useState(false);

  // ✅ Search UI state
  const [searchMode, setSearchMode] = useState(false);
  const [q, setQ] = useState("");

  const loadMyId = useCallback(async () => {
    const uid = await AsyncStorage.getItem(USER_ID_KEY);
    setMyUserId(uid || null);
    return uid || null;
  }, []);

  const loadUnreadNotifications = useCallback(async () => {
    try {
      setLoadingUnreadNotif(true);
      const userId = await AsyncStorage.getItem(USER_ID_KEY);
      if (!userId) {
        setUnreadNotif(0);
        return;
      }

      const res = await fetch(
        `${base}/api/notifications/unread-count?userId=${encodeURIComponent(userId)}`
      );

      if (!res.ok) {
        setUnreadNotif(0);
        return;
      }

      const json = (await res.json()) as { count?: number };
      setUnreadNotif(Number(json?.count ?? 0));
    } catch (e) {
      console.error("unread notifications count error", e);
      setUnreadNotif(0);
    } finally {
      setLoadingUnreadNotif(false);
    }
  }, [base]);

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem(USER_ID_KEY);
      if (!userId) {
        setHasUser(false);
        return;
      }

      const res = await fetch(
        `${base}/api/chat/conversations?userId=${encodeURIComponent(userId)}`
      );

      if (!res.ok) {
        console.log("conversations load failed", res.status);
        return;
      }

      const json = (await res.json()) as { threads: ConversationItem[] };
      setItems(json.threads ?? []);
    } catch (e) {
      console.error("load conversations error", e);
    } finally {
      setLoading(false);
    }
  }, [base]);

  useEffect(() => {
    loadMyId();
    loadConversations();
    loadUnreadNotifications();
  }, [loadConversations, loadUnreadNotifications, loadMyId]);

  useFocusEffect(
    useCallback(() => {
      loadMyId();
      loadConversations();
      loadUnreadNotifications();
    }, [loadConversations, loadUnreadNotifications, loadMyId])
  );

  const openChat = (item: ConversationItem) => {
    navigation.navigate("ChatRoom", {
      userId: item.otherUserId,
      userName: item.otherNickname || item.otherUsername,
    });
  };

  const openNotificationsInbox = () => {
    navigation.navigate("NotificationsInbox");
  };

  const formatTime = (iso: string | null) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // ✅ Filter conversations
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((it) => {
      const name = (it.otherNickname || it.otherUsername || "").toLowerCase();
      const last = (it.lastMessageText || "").toLowerCase();
      return name.includes(s) || last.includes(s);
    });
  }, [items, q]);

  const incomingRequests = useMemo(() => {
    if (!myUserId) return [];
    return filtered.filter((t) => t.status === "REQUESTED" && t.requestedById !== myUserId);
  }, [filtered, myUserId]);

  const acceptedChats = useMemo(() => {
    return filtered.filter((t) => t.status === "ACCEPTED");
  }, [filtered]);

  const blockedChats = useMemo(() => {
    return filtered.filter((t) => t.status === "BLOCKED");
  }, [filtered]);

  if (!hasUser) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-[16px] font-semibold text-black mb-2">
            {t("chatList.loggedOut.title")}
          </Text>
          <Text className="text-[12px] text-gray-500 text-center">
            {t("chatList.loggedOut.subtitle")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderRow = (item: ConversationItem) => {
    const displayName = item.otherNickname || item.otherUsername;
    const avatar = normalizeUrl(base, item.otherAvatarUrl);

    const isRestricted = item.status === "BLOCKED";

    return (
      <Pressable
        key={item.threadId}
        onPress={() => (isRestricted ? null : openChat(item))}
        className="mb-4 flex-row items-center"
        style={{ opacity: isRestricted ? 0.55 : 1 }}
      >
        <View className="h-11 w-11 rounded-full bg-gray-200 overflow-hidden items-center justify-center">
          {avatar ? (
            <Image source={{ uri: avatar }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
          ) : (
            <MaterialCommunityIcons name="account" size={22} color="#6B7280" />
          )}
        </View>

        <View className="ml-3 flex-1">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Text className="text-[14px] font-semibold text-gray-900">{displayName}</Text>

              {item.status === "REQUESTED" && (
                <View className="ml-2 px-2 py-0.5 rounded-full bg-[#FFF7ED]">
                  <Text className="text-[10px] font-semibold text-[#9A3412]">
                    {t("chatList.badges.request")}
                  </Text>
                </View>
              )}

              {isRestricted && (
                <View className="ml-2 px-2 py-0.5 rounded-full bg-red-50">
                  <Text className="text-[10px] font-semibold text-red-600">
                    {t("chatList.badges.restricted")}
                  </Text>
                </View>
              )}
            </View>

            {!!item.lastMessageAt && (
              <Text className="text-[11px] text-gray-400">{formatTime(item.lastMessageAt)}</Text>
            )}
          </View>

          <View className="flex-row items-center justify-between mt-0.5">
            <Text className="text-[12px] text-gray-500 flex-1" numberOfLines={1}>
              {item.lastMessageText || t("chatList.states.noMessages")}
            </Text>

            {item.unreadCount > 0 && (
              <View className="ml-2 h-5 min-w-[18px] px-1 rounded-full bg-red-500 items-center justify-center">
                <Text className="text-[10px] text-white font-semibold">
                  {item.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  const nothingFound =
    incomingRequests.length === 0 && acceptedChats.length === 0 && blockedChats.length === 0;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-1 px-4 pt-4">
        {/* Header */}
        {!searchMode ? (
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-[22px] font-bold text-black">{t("chatList.title")}</Text>

            <View className="flex-row items-center">
              <Pressable hitSlop={10} onPress={() => setSearchMode(true)}>
                <Ionicons name="search" size={20} color="#111827" />
              </Pressable>

              <Pressable
                hitSlop={12}
                onPress={openNotificationsInbox}
                className="ml-4"
                style={{ position: "relative" }}
              >
                <Ionicons name="trophy-outline" size={22} color="#F59E0B" />
                {unreadNotif > 0 && (
                  <View
                    style={{
                      position: "absolute",
                      right: -4,
                      top: -4,
                      minWidth: 16,
                      height: 16,
                      borderRadius: 8,
                      paddingHorizontal: 4,
                      backgroundColor: "#EF4444",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>
                      {unreadNotif > 99 ? "99+" : unreadNotif}
                    </Text>
                  </View>
                )}
              </Pressable>
            </View>
          </View>
        ) : (
          <View className="mb-4 flex-row items-center rounded-full bg-[#F3F4F6] px-3 py-2">
            <Ionicons name="search" size={18} color="#6B7280" />
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder={t("chatList.search.placeholder")}
              placeholderTextColor="#9CA3AF"
              autoCorrect={false}
              autoCapitalize="none"
              style={{
                marginLeft: 8,
                flex: 1,
                fontSize: 14,
                color: "#111827",
                paddingVertical: Platform.OS === "android" ? 0 : 6,
              }}
            />
            {q.length > 0 && (
              <Pressable onPress={() => setQ("")} hitSlop={10}>
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </Pressable>
            )}
            <Pressable
              onPress={() => {
                setSearchMode(false);
                setQ("");
              }}
              hitSlop={10}
            >
              <Text className="ml-3 text-[13px] text-[#6C4DFF]">{t("chatList.search.cancel")}</Text>
            </Pressable>
          </View>
        )}

        {/* Notifications row */}
        <Pressable
          onPress={openNotificationsInbox}
          className="mb-5 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3"
          style={{ elevation: 2 }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-[#FFF7ED]">
                <Ionicons name="notifications-outline" size={20} color="#F97316" />
              </View>
              <View>
                <Text className="text-[14px] font-semibold text-gray-900">
                  {t("chatList.notifications.title")}
                </Text>
                <Text className="text-[12px] text-gray-500">
                  {unreadNotif > 0
                    ? t("chatList.notifications.unread", { count: unreadNotif })
                    : t("chatList.notifications.none")}
                </Text>
              </View>
            </View>

            {loadingUnreadNotif ? <ActivityIndicator size="small" /> : <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />}
          </View>
        </Pressable>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
            <Text className="mt-2 text-xs text-gray-500">{t("chatList.states.loading")}</Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            {/* Optional Unclaimed gift */}
            <View className="mb-6">
              <View className="h-20 w-20 items-center justify-center rounded-full self-start border-2 border-[#F97316]">
                <MaterialCommunityIcons name="gift" size={32} color="#F97316" />
              </View>
              <Text className="mt-3 text-[13px] font-semibold text-gray-700">
                {t("chatList.unclaimed")}
              </Text>
            </View>

            {incomingRequests.length > 0 && (
              <View className="mb-4">
                <Text className="mb-3 text-[13px] font-semibold text-gray-800">
                  {t("chatList.sections.requests", { count: incomingRequests.length })}
                </Text>
                {incomingRequests.map(renderRow)}
              </View>
            )}

            {acceptedChats.length > 0 && (
              <View className="mb-4">
                <Text className="mb-3 text-[13px] font-semibold text-gray-800">
                  {t("chatList.sections.chats")}
                </Text>
                {acceptedChats.map(renderRow)}
              </View>
            )}

            {blockedChats.length > 0 && (
              <View className="mb-4">
                <Text className="mb-3 text-[13px] font-semibold text-gray-800">
                  {t("chatList.sections.restricted")}
                </Text>
                {blockedChats.map(renderRow)}
              </View>
            )}

            {nothingFound && (
              <Text className="text-center text-[12px] text-gray-400 mt-8">
                {q.trim().length > 0 ? t("chatList.states.noSearch") : t("chatList.states.empty")}
              </Text>
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

export default ChatListScreen;
