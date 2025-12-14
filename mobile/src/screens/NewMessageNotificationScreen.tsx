import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "../navigation/ProfileStackNavigator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config";

type Nav = NativeStackNavigationProp<
  ProfileStackParamList,
  "NewMessageNotification"
>;

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  createdAt: string;
  readAt: string | null;
  adminNotificationId?: string | null;
};

const NewMessageNotificationScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();

  // settings state
  const [liveAlerts, setLiveAlerts] = useState(true);
  const [messageSwitch, setMessageSwitch] = useState(true);
  const [sound, setSound] = useState(true);
  const [vibrate, setVibrate] = useState(true);
  const [mutualFollowers, setMutualFollowers] = useState(true);
  const [myFollowing, setMyFollowing] = useState(true);
  const [stranger, setStranger] = useState(true);

  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notifError, setNotifError] = useState<string | null>(null);

  // -------- SETTINGS: LOAD ----------
  useEffect(() => {
    const load = async () => {
      try {
        const userId = await AsyncStorage.getItem("gl_user_id");
        if (!userId) return;

        const res = await fetch(
          `${API_BASE_URL}/api/settings/notifications?userId=${encodeURIComponent(
            userId
          )}`
        );
        if (!res.ok) return;
        const json = await res.json();

        setLiveAlerts(!!json.notifyLiveAlerts);
        setMessageSwitch(!!json.notifyMessages);
        setSound(!!json.notifySound);
        setVibrate(!!json.notifyVibrate);
        setMutualFollowers(!!json.allowFromMutual);
        setMyFollowing(!!json.allowFromFollowing);
        setStranger(!!json.allowFromStrangers);
      } catch (e) {
        console.error("load notification settings error", e);
      } finally {
        setLoaded(true);
      }
    };

    load();
  }, []);

  // -------- SETTINGS: SAVE ON CHANGE ----------
  useEffect(() => {
    if (!loaded) return;

    const save = async () => {
      try {
        const userId = await AsyncStorage.getItem("gl_user_id");
        if (!userId) return;

        await fetch(`${API_BASE_URL}/api/settings/notifications`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            notifyLiveAlerts: liveAlerts,
            notifyMessages: messageSwitch,
            notifySound: sound,
            notifyVibrate: vibrate,
            allowFromMutual: mutualFollowers,
            allowFromFollowing: myFollowing,
            allowFromStrangers: stranger,
          }),
        });
      } catch (e) {
        console.error("save notification settings error", e);
      }
    };

    save();
  }, [
    loaded,
    liveAlerts,
    messageSwitch,
    sound,
    vibrate,
    mutualFollowers,
    myFollowing,
    stranger,
  ]);

  // -------- NOTIFICATIONS: LOAD LIST ----------
  const loadNotifications = useCallback(async () => {
    try {
      setNotifError(null);
      setLoadingNotifications(true);

      const userId = await AsyncStorage.getItem("gl_user_id");
      if (!userId) return;

      const res = await fetch(
        `${API_BASE_URL}/api/notifications?userId=${encodeURIComponent(userId)}`
      );

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        setNotifError(json?.error || "Failed to load notifications");
        setNotifications([]);
        return;
      }

      const json = await res.json();
      setNotifications((json.notifications ?? []) as NotificationItem[]);
    } catch (e) {
      console.error("load notifications error", e);
      setNotifError("Network error while loading notifications");
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // reload when screen focuses (so new admin notifications appear)
  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [loadNotifications])
  );

  // -------- NOTIFICATIONS: MARK ALL READ ----------
  const handleMarkAllRead = async () => {
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
      setNotifications((prev) =>
        prev.map((n) => (n.readAt ? n : { ...n, readAt: nowIso }))
      );
    } catch (e) {
      console.error("mark all read error", e);
    }
  };

  const hasUnread = notifications.some((n) => !n.readAt);

  // settings rows for search
  const allRows = useMemo(
    () => [
      { key: "liveAlerts", label: "Live room opening alerts", value: liveAlerts, onValueChange: setLiveAlerts },
      { key: "messageSwitch", label: "Message notification switch", value: messageSwitch, onValueChange: setMessageSwitch },
      { key: "sound", label: "Sound", value: sound, onValueChange: setSound },
      { key: "vibrate", label: "Vibrate", value: vibrate, onValueChange: setVibrate },
      { key: "mutualFollowers", label: "Mutual followers", value: mutualFollowers, onValueChange: setMutualFollowers },
      { key: "myFollowing", label: "My Following", value: myFollowing, onValueChange: setMyFollowing },
      { key: "stranger", label: "Stranger", value: stranger, onValueChange: setStranger },
    ],
    [liveAlerts, messageSwitch, sound, vibrate, mutualFollowers, myFollowing, stranger]
  );

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allRows;
    return allRows.filter((row) => row.label.toLowerCase().includes(q));
  }, [allRows, search]);

  const isSearching = search.trim().length > 0;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-row items-center px-4 pt-3 pb-2 border-b border-gray-100">
        <Pressable
          onPress={() => navigation.goBack()}
          className="mr-3 h-9 w-9 items-center justify-center rounded-full"
        >
          <Ionicons name="chevron-back" size={20} color="#111827" />
        </Pressable>
        <Text className="text-[18px] font-semibold text-[#111827]">
          New messages notification
        </Text>
      </View>

      <View className="px-4 pt-3">
        <View className="flex-row items-center rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2">
          <Ionicons name="search-outline" size={16} color="#9CA3AF" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search notification settings"
            placeholderTextColor="#9CA3AF"
            style={{ marginLeft: 8, flex: 1, fontSize: 13, color: "#111827", paddingVertical: 0 }}
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
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={loadingNotifications} onRefresh={loadNotifications} />
        }
      >
        <SectionTitle title="Notifications" />

        {notifError && (
          <View className="px-4 pb-2">
            <Text className="text-[11px] text-red-500">{notifError}</Text>
          </View>
        )}

        {loadingNotifications && notifications.length === 0 ? (
          <View className="px-4 py-4">
            <ActivityIndicator size="small" color="#6C4DFF" />
          </View>
        ) : notifications.length === 0 ? (
          <View className="px-4 pt-2">
            <Text className="text-[12px] text-[#9CA3AF]">No notifications yet.</Text>
          </View>
        ) : (
          <>
            {hasUnread && (
              <View className="px-4 pt-1 pb-2 flex-row justify-end">
                <Pressable onPress={handleMarkAllRead}>
                  <Text className="text-[11px] text-[#6C4DFF] font-semibold">
                    Mark all as read
                  </Text>
                </Pressable>
              </View>
            )}

            {notifications.map((n) => (
              <NotificationCard key={n.id} item={n} />
            ))}
          </>
        )}

        {isSearching ? (
          <>
            <SectionTitle title="Search results" />
            {filteredRows.map((row) => (
              <SimpleToggleRow
                key={row.key}
                label={row.label}
                value={row.value}
                onValueChange={row.onValueChange}
              />
            ))}
            {filteredRows.length === 0 && (
              <View className="px-4 pt-4">
                <Text className="text-[12px] text-[#9CA3AF]">
                  No settings matched your search.
                </Text>
              </View>
            )}
          </>
        ) : (
          <>
            <SectionTitle title="Message notifications" />
            <SimpleToggleRow label="Live room opening alerts" value={liveAlerts} onValueChange={setLiveAlerts} />
            <SimpleToggleRow label="Message notification switch" value={messageSwitch} onValueChange={setMessageSwitch} />

            <SectionTitle title="Message alert settings" />
            <SimpleToggleRow label="Sound" value={sound} onValueChange={setSound} />
            <SimpleToggleRow label="Vibrate" value={vibrate} onValueChange={setVibrate} />

            <SectionTitle title="Who can send me a private message?" />
            <SimpleToggleRow label="Mutual followers" value={mutualFollowers} onValueChange={setMutualFollowers} />
            <SimpleToggleRow label="My Following" value={myFollowing} onValueChange={setMyFollowing} />
            <SimpleToggleRow label="Stranger" value={stranger} onValueChange={setStranger} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
  <View className="px-4 pt-4 pb-1">
    <Text className="text-[11px] text-[#6B7280]">{title}</Text>
  </View>
);

const SimpleToggleRow: React.FC<{
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}> = ({ label, value, onValueChange }) => (
  <View className="px-4 py-3 border-b border-[#E5E7EB] flex-row items-center justify-between">
    <Text className="text-[14px] text-[#111827]">{label}</Text>
    <Switch value={value} onValueChange={onValueChange} />
  </View>
);

const NotificationCard: React.FC<{ item: NotificationItem }> = ({ item }) => {
  const created = new Date(item.createdAt);
  const timeLabel = created.toLocaleString();
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
            <Text className="ml-2 text-[10px] text-[#9CA3AF]">
              {item.type}
            </Text>
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

export default NewMessageNotificationScreen;
