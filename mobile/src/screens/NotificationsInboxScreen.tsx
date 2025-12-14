// src/screens/NotificationsInboxScreen.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config";
import type { ChatStackParamList } from "../navigation/ChatStackNavigator";

type Nav = NativeStackNavigationProp<ChatStackParamList, "NotificationsInbox">;

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  createdAt: string;
  readAt: string | null;
  adminNotificationId?: string | null;
};

export default function NotificationsInboxScreen() {
  const navigation = useNavigation<Nav>();

  const [search, setSearch] = useState("");
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setErr(null);
      setLoading(true);

      const userId = await AsyncStorage.getItem("gl_user_id");
      if (!userId) {
        setItems([]);
        setErr("Missing userId (gl_user_id) in AsyncStorage");
        return;
      }

      const res = await fetch(
        `${API_BASE_URL}/api/notifications?userId=${encodeURIComponent(userId)}&page=1&pageSize=50`
      );

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        setItems([]);
        setErr(json?.error || "Failed to load notifications");
        return;
      }

      // ✅ support multiple possible response shapes
      const list =
        (json?.notifications as NotificationItem[]) ??
        (json?.items as NotificationItem[]) ??
        (json?.data?.notifications as NotificationItem[]) ??
        [];

      setItems(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error("Notifications inbox load error", e);
      setItems([]);
      setErr("Network error while loading notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const markAllRead = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem("gl_user_id");
      if (!userId) return;

      const res = await fetch(`${API_BASE_URL}/api/notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) return;

      const nowIso = new Date().toISOString();
      setItems((prev) => prev.map((n) => (n.readAt ? n : { ...n, readAt: nowIso })));
    } catch (e) {
      console.error("mark all read error", e);
    }
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (n) =>
        (n.title || "").toLowerCase().includes(q) ||
        (n.body || "").toLowerCase().includes(q) ||
        (n.type || "").toLowerCase().includes(q)
    );
  }, [items, search]);

  const hasUnread = items.some((n) => !n.readAt);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-3 pb-2 border-b border-gray-100">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => navigation.goBack()}
            className="mr-3 h-9 w-9 items-center justify-center rounded-full"
          >
            <Ionicons name="chevron-back" size={20} color="#111827" />
          </Pressable>
          <Text className="text-[18px] font-semibold text-[#111827]">Notifications</Text>
        </View>

        {hasUnread && (
          <Pressable onPress={markAllRead}>
            <Text className="text-[12px] font-semibold text-[#6C4DFF]">Mark all read</Text>
          </Pressable>
        )}
      </View>

      {/* Search */}
      <View className="px-4 pt-3">
        <View
          className="flex-row items-center rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2"
          style={{ elevation: 2 }}
        >
          <Ionicons name="search-outline" size={16} color="#9CA3AF" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search notifications..."
            placeholderTextColor="#9CA3AF"
            autoCorrect={false}
            autoCapitalize="none"
            style={{
              marginLeft: 8,
              flex: 1,
              fontSize: 13,
              color: "#111827",
              paddingVertical: Platform.OS === "android" ? 0 : 6,
            }}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={16} color="#9CA3AF" />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
      >
        {err && (
          <View className="px-4 pt-3">
            <Text className="text-[11px] text-red-500">{err}</Text>
          </View>
        )}

        {loading && items.length === 0 ? (
          <View className="px-4 py-6">
            <ActivityIndicator size="small" color="#6C4DFF" />
          </View>
        ) : filtered.length === 0 ? (
          <View className="px-4 py-6">
            <Text className="text-[12px] text-[#9CA3AF]">No notifications yet.</Text>
          </View>
        ) : (
          filtered.map((n) => <NotificationCard key={n.id} item={n} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const NotificationCard: React.FC<{ item: NotificationItem }> = ({ item }) => {
  const timeLabel = new Date(item.createdAt).toLocaleString();
  const isUnread = !item.readAt;

  return (
    <View className="px-4 pt-2">
      <View className="flex-row rounded-xl border border-[#E5E7EB] bg-white px-3 py-2">
        <View className="mr-2 mt-2">
          {isUnread && (
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#F97316" }} />
          )}
        </View>

        <View style={{ flex: 1 }}>
          <View className="flex-row items-center justify-between">
            <Text className="text-[14px] text-[#111827]" numberOfLines={2}>
              {item.title}
            </Text>
            <Text className="ml-2 text-[10px] text-[#9CA3AF]">{item.type}</Text>
          </View>

          {!!item.body && (
            <Text className="mt-1 text-[12px] text-[#6B7280]" numberOfLines={3}>
              {item.body}
            </Text>
          )}

          <Text className="mt-1 text-[11px] text-[#9CA3AF]">{timeLabel}</Text>
        </View>
      </View>
    </View>
  );
};
