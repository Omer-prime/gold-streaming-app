import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Platform,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config";
import { t } from "../i18n";

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  createdAt: string;
  readAt: string | null;
  adminNotificationId?: string | null; // momentId here
};

function safeTimeLabel(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  // Keep it compact (no seconds)
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function typeBadgeLabel(typeRaw: string) {
  const type = String(typeRaw || "").toUpperCase();

  // You can extend mapping anytime (keeps UI clean)
  if (type.includes("LIVE_APPLICATION")) return "VERIFICATION";
  if (type.includes("MOMENT_LIKE")) return "LIKE";
  if (type.includes("MOMENT_COMMENT")) return "COMMENT";
  if (type.includes("ADMIN")) return "ADMIN";
  if (type.includes("SYSTEM")) return "SYSTEM";

  // fallback short label
  const cleaned = type.replace(/[^A-Z0-9_]/g, "").replace(/_+/g, "_");
  const first = cleaned.split("_").slice(0, 2).join("_");
  return first || "INFO";
}

function typeIconName(typeRaw: string): keyof typeof Ionicons.glyphMap {
  const type = String(typeRaw || "").toUpperCase();
  if (type.includes("LIVE_APPLICATION")) return "shield-checkmark-outline";
  if (type.includes("MOMENT_LIKE")) return "heart-outline";
  if (type.includes("MOMENT_COMMENT")) return "chatbubble-ellipses-outline";
  if (type.includes("ADMIN")) return "megaphone-outline";
  return "notifications-outline";
}

function typeIconBg(typeRaw: string) {
  const type = String(typeRaw || "").toUpperCase();
  if (type.includes("LIVE_APPLICATION")) return "#EEF2FF"; // indigo-50
  if (type.includes("MOMENT_LIKE")) return "#FFF1F2"; // rose-50
  if (type.includes("MOMENT_COMMENT")) return "#F0FDFA"; // teal-50
  if (type.includes("ADMIN")) return "#FFFBEB"; // amber-50
  return "#F1F5F9"; // slate-100
}

export default function NotificationsInboxScreen() {
  const navigation = useNavigation<any>();

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
        setErr(t("newMessageNotification.errors.missingUserId", { key: "gl_user_id" }));
        return;
      }

      const res = await fetch(
        `${API_BASE_URL}/api/notifications?userId=${encodeURIComponent(userId)}&page=1&pageSize=50`
      );

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        setItems([]);
        setErr(json?.error || t("newMessageNotification.errors.loadFailed"));
        return;
      }

      const list = (json?.notifications as NotificationItem[]) ?? [];
      setItems(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error("Notifications inbox load error", e);
      setItems([]);
      setErr(t("newMessageNotification.errors.network"));
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

  const markRead = useCallback(async (id: string) => {
    try {
      const userId = await AsyncStorage.getItem("gl_user_id");
      if (!userId) return;

      await fetch(`${API_BASE_URL}/api/notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ids: [id] }),
      });

      const nowIso = new Date().toISOString();
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, readAt: nowIso } : n)));
    } catch (e) {
      console.error("mark read error", e);
    }
  }, []);

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

  const openNotification = useCallback(
    async (item: NotificationItem) => {
      await markRead(item.id);

      if (
        (item.type === "moment_like" || item.type === "moment_comment") &&
        item.adminNotificationId
      ) {
        navigation.navigate("Profile", {
          screen: "MomentComments",
          params: {
            momentId: item.adminNotificationId,
            ownerName: t("notificationsInbox.postOwnerName"),
          },
        });
        return;
      }
    },
    [markRead, navigation]
  );

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

  const ListHeader = (
    <View>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-3 pb-2 border-b border-gray-100">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => navigation.goBack()}
            className="mr-3 h-9 w-9 items-center justify-center rounded-full"
            style={{ backgroundColor: "#F8FAFC" }}
          >
            <Ionicons name="chevron-back" size={20} color="#111827" />
          </Pressable>

          <Text className="text-[18px] font-semibold text-[#111827]">
            {t("newMessageNotification.title")}
          </Text>
        </View>

        {hasUnread && (
          <Pressable
            onPress={markAllRead}
            className="px-3 py-2 rounded-full"
            style={{ backgroundColor: "#F5F3FF" }}
          >
            <Text className="text-[12px] font-semibold text-[#6C4DFF]">
              {t("newMessageNotification.actions.markAllRead")}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Search */}
      <View className="px-4 pt-3 pb-2">
        <View
          className="flex-row items-center rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-3"
          style={{
            height: 44,
            ...(Platform.OS === "ios"
              ? {
                  shadowColor: "#000",
                  shadowOpacity: 0.04,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 6 },
                }
              : {}),
          }}
        >
          <Ionicons name="search-outline" size={18} color="#9CA3AF" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={t("newMessageNotification.inboxSearchPlaceholder")}
            placeholderTextColor="#9CA3AF"
            autoCorrect={false}
            autoCapitalize="none"
            style={{
              marginLeft: 10,
              flex: 1,
              fontSize: 13,
              color: "#111827",
              paddingVertical: Platform.OS === "android" ? 0 : 8,
            }}
          />

          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")} hitSlop={10}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </Pressable>
          )}
        </View>

        {err && <Text className="mt-2 text-[11px] text-red-500">{err}</Text>}
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <FlatList
        data={filtered}
        keyExtractor={(it) => it.id}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={{ paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListEmptyComponent={
          loading ? (
            <View className="px-4 py-10">
              <ActivityIndicator size="small" color="#6C4DFF" />
            </View>
          ) : (
            <View className="px-4 py-10">
              <Text className="text-[12px] text-[#9CA3AF]">{t("newMessageNotification.empty")}</Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <NotificationCard item={item} onPress={() => openNotification(item)} />
        )}
      />
    </SafeAreaView>
  );
}

const NotificationCard: React.FC<{
  item: NotificationItem;
  onPress: () => void;
}> = ({ item, onPress }) => {
  const isUnread = !item.readAt;
  const timeLabel = safeTimeLabel(item.createdAt);
  const badge = typeBadgeLabel(item.type);
  const icon = typeIconName(item.type);
  const iconBg = typeIconBg(item.type);

  return (
    <View className="px-4 pt-2">
      <Pressable
        onPress={onPress}
        className="rounded-2xl border px-3 py-3 active:opacity-80"
        style={{
          borderColor: "#EEF2F7",
          backgroundColor: isUnread ? "#F8FAFF" : "#FFFFFF",
        }}
      >
        <View className="flex-row">
          {/* Left icon + unread dot */}
          <View style={{ width: 44, alignItems: "center" }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: iconBg,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: "#EEF2F7",
              }}
            >
              <Ionicons name={icon} size={18} color="#111827" />
            </View>

            {isUnread && (
              <View
                style={{
                  position: "absolute",
                  top: 2,
                  right: 4,
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: "#F97316",
                  borderWidth: 2,
                  borderColor: isUnread ? "#F8FAFF" : "#FFFFFF",
                }}
              />
            )}
          </View>

          {/* Content */}
          <View style={{ flex: 1, paddingLeft: 10 }}>
            <View className="flex-row items-start justify-between">
              <Text
                className="text-[14px] font-semibold text-[#111827]"
                numberOfLines={2}
                style={{ flex: 1, paddingRight: 10 }}
              >
                {item.title}
              </Text>

              {/* Type badge (prevents long type text breaking layout) */}
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 999,
                  backgroundColor: "#F1F5F9",
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  maxWidth: 120,
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "700",
                    color: "#64748B",
                    letterSpacing: 0.3,
                  }}
                  numberOfLines={1}
                >
                  {badge}
                </Text>
              </View>
            </View>

            {!!item.body && (
              <Text className="mt-1 text-[12px] text-[#6B7280]" numberOfLines={2}>
                {item.body}
              </Text>
            )}

            <View className="mt-2 flex-row items-center justify-between">
              <Text className="text-[11px] text-[#9CA3AF]">{timeLabel}</Text>
              <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
            </View>
          </View>
        </View>
      </Pressable>
    </View>
  );
};
