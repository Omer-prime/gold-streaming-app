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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ChatStackParamList } from "../navigation/ChatStackNavigator";

type Nav = NativeStackNavigationProp<ChatStackParamList, "ChatList">;

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://192.168.10.25:3000";

type ConversationItem = {
  threadId: string;
  otherUserId: string;
  otherUsername: string;
  otherNickname: string | null;
  otherAvatarUrl: string | null;
  lastMessageText: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
};

const ChatListScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();

  const [items, setItems] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasUser, setHasUser] = useState(true);

  const [unreadNotif, setUnreadNotif] = useState(0);
  const [loadingUnreadNotif, setLoadingUnreadNotif] = useState(false);

  // ✅ Search UI state
  const [searchMode, setSearchMode] = useState(false);
  const [q, setQ] = useState("");

  const loadUnreadNotifications = useCallback(async () => {
    try {
      setLoadingUnreadNotif(true);
      const userId = await AsyncStorage.getItem("gl_user_id");
      if (!userId) {
        setUnreadNotif(0);
        return;
      }

      const res = await fetch(
        `${API_BASE_URL}/api/notifications/unread-count?userId=${encodeURIComponent(
          userId
        )}`
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
  }, []);

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem("gl_user_id");
      if (!userId) {
        setHasUser(false);
        return;
      }

      const res = await fetch(
        `${API_BASE_URL}/api/chat/conversations?userId=${encodeURIComponent(
          userId
        )}`
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
  }, []);

  useEffect(() => {
    loadConversations();
    loadUnreadNotifications();
  }, [loadConversations, loadUnreadNotifications]);

  useFocusEffect(
    useCallback(() => {
      loadUnreadNotifications();
    }, [loadUnreadNotifications])
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

  if (!hasUser) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-[16px] font-semibold text-black mb-2">
            You&apos;re logged out
          </Text>
          <Text className="text-[12px] text-gray-500 text-center">
            Please log in again to view your messages.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-1 px-4 pt-4">
        {/* Header */}
        {!searchMode ? (
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-[22px] font-bold text-black">Message</Text>

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
              placeholder="Search chats..."
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
              <Text className="ml-3 text-[13px] text-[#6C4DFF]">Cancel</Text>
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
                  Notifications
                </Text>
                <Text className="text-[12px] text-gray-500">
                  {unreadNotif > 0 ? `${unreadNotif} unread` : "No new notifications"}
                </Text>
              </View>
            </View>

            {loadingUnreadNotif ? (
              <ActivityIndicator size="small" />
            ) : (
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            )}
          </View>
        </Pressable>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
            <Text className="mt-2 text-xs text-gray-500">
              Loading conversations...
            </Text>
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
                Unclaimed...
              </Text>
            </View>

            {filtered.map((item) => (
              <Pressable
                key={item.threadId}
                onPress={() => openChat(item)}
                className="mb-4 flex-row items-center"
              >
                <View className="h-11 w-11 items-center justify-center rounded-full bg-[#6C4DFF]">
                  <MaterialCommunityIcons name="account" size={22} color="#FFFFFF" />
                </View>

                <View className="ml-3 flex-1">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-[14px] font-semibold text-gray-900">
                      {item.otherNickname || item.otherUsername}
                    </Text>
                    {!!item.lastMessageAt && (
                      <Text className="text-[11px] text-gray-400">
                        {formatTime(item.lastMessageAt)}
                      </Text>
                    )}
                  </View>

                  <View className="flex-row items-center justify-between mt-0.5">
                    <Text className="text-[12px] text-gray-500 flex-1" numberOfLines={1}>
                      {item.lastMessageText || "No messages yet"}
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
            ))}

            {filtered.length === 0 && (
              <Text className="text-center text-[12px] text-gray-400 mt-8">
                {q.trim().length > 0
                  ? "No chats matched your search."
                  : "No chats yet. Start messaging your friends from their profile."}
              </Text>
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

export default ChatListScreen;
