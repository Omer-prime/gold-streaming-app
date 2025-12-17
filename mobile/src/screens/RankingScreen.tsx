import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  Modal,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "../navigation/ProfileStackNavigator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { API_BASE_URL } from "../config";

type Nav = NativeStackNavigationProp<ProfileStackParamList>;

const TOP_TABS: Array<"Host" | "Rich" | "Gift"> = ["Host", "Rich", "Gift"];
const PERIOD_TABS: Array<"Daily" | "Weekly" | "Monthly"> = ["Daily", "Weekly", "Monthly"];

type RankingRow = {
  rank: number;
  userId: string;
  name: string;
  avatarUrl: string | null;
  countryFlag: string | null;
  score: number;
};

type RankingMe = {
  rank: number | null;
  score: number;
  distance: number | null;
  targetRank: number | null;
  targetScore: number | null;
};

function formatNumber(n: number) {
  const num = Number(n) || 0;
  return num.toLocaleString("en-US");
}

function formatLocalYMD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfWeekMonday(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 Sun ... 6 Sat
  const diff = day === 0 ? -6 : 1 - day; // Monday start
  d.setDate(d.getDate() + diff);
  return d;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

const RankingScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();

  const [topTab, setTopTab] = useState<"Host" | "Rich" | "Gift">("Host");
  const [periodTab, setPeriodTab] = useState<"Daily" | "Weekly" | "Monthly">("Weekly");

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateOpen, setDateOpen] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date());

  const [items, setItems] = useState<RankingRow[]>([]);
  const [me, setMe] = useState<RankingMe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const iconName = useMemo(() => {
    if (topTab === "Host") return "videocam-outline";
    if (topTab === "Rich") return "cash-outline";
    return "gift-outline";
  }, [topTab]);

  const calendarLabel = useMemo(() => {
    if (periodTab === "Daily") {
      return selectedDate.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    }
    if (periodTab === "Weekly") {
      const s = startOfWeekMonday(selectedDate);
      const e = addDays(s, 6);
      const sTxt = s.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
      const eTxt = e.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
      return `${sTxt} - ${eTxt}`;
    }
    // Monthly
    return selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }, [periodTab, selectedDate]);

  const load = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      const userId = await AsyncStorage.getItem("gl_user_id");

      const type = topTab.toLowerCase(); // host|rich|gift
      const period = periodTab.toLowerCase(); // daily|weekly|monthly

      const params = new URLSearchParams();
      params.set("type", type);
      params.set("period", period);
      params.set("limit", "50");

      // ✅ calendar working
      params.set("date", formatLocalYMD(selectedDate));
      params.set("tzOffset", String(new Date().getTimezoneOffset()));

      if (userId) params.set("userId", userId);

      const res = await fetch(`${API_BASE_URL}/api/ranking?${params.toString()}`);
      const json = await res.json().catch(() => null);

      if (!res.ok) {
        setItems([]);
        setMe(null);
        setError(json?.error || "Failed to load ranking");
        return;
      }

      const list = Array.isArray(json?.items) ? json.items : [];
      const mapped: RankingRow[] = list.map((r: any) => ({
        rank: Number(r.rank ?? 0),
        userId: String(r.userId ?? ""),
        name: String(r.name ?? "User"),
        avatarUrl: r.avatarUrl ?? null,
        countryFlag: r.countryFlag ?? null,
        score: Number(r.score ?? 0),
      }));

      setItems(mapped);
      setMe(json?.me ?? null);
    } catch (e) {
      console.error("Ranking load error", e);
      setItems([]);
      setMe(null);
      setError("Network error while loading ranking");
    } finally {
      setLoading(false);
    }
  }, [topTab, periodTab, selectedDate]);

  useFocusEffect(
    React.useCallback(() => {
      load();
    }, [load])
  );

  const onPickDate = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === "android") {
      setDateOpen(false);
      if (event.type === "set" && date) {
        setSelectedDate(date);
      }
      return;
    }
    // iOS: just update temp date; Done button will commit
    if (date) setTempDate(date);
  };

  const openCalendar = () => {
    setTempDate(selectedDate);
    setDateOpen(true);
  };

  const commitIosDate = () => {
    setSelectedDate(tempDate);
    setDateOpen(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <Pressable onPress={navigation.goBack} className="mr-3 h-8 w-8 items-center justify-center">
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </Pressable>
        <Text className="flex-1 text-center text-[17px] font-semibold text-[#111827]">
          Ranking
        </Text>
        <Pressable className="w-8 items-center justify-center" onPress={load} hitSlop={10}>
          <Ionicons name="refresh-outline" size={20} color="#9CA3AF" />
        </Pressable>
      </View>

      {/* Top tabs */}
      <View className="flex-row items-center justify-center mt-2">
        {TOP_TABS.map((tab) => {
          const active = tab === topTab;
          return (
            <Pressable key={tab} onPress={() => setTopTab(tab)} className="mx-3 pb-1">
              <Text className={`text-[14px] ${active ? "text-[#4F46E5] font-semibold" : "text-[#6B7280]"}`}>
                {tab}
              </Text>
              {active && <View className="mt-1 h-[2px] rounded-full bg-[#4F46E5]" />}
            </Pressable>
          );
        })}
      </View>

      {/* Period tabs */}
      <View className="flex-row items-center justify-center mt-3">
        {PERIOD_TABS.map((tab) => {
          const active = tab === periodTab;
          return (
            <Pressable
              key={tab}
              onPress={() => setPeriodTab(tab)}
              className={`mx-1 rounded-full px-3 py-1.5 ${active ? "bg-[#4F46E5]" : "bg-gray-100"}`}
            >
              <Text className={`text-[11px] ${active ? "text-white font-semibold" : "text-[#374151]"}`}>
                {tab}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Filters row (calendar works now) */}
      <View className="px-4 mt-3 mb-2 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Ionicons name="location-outline" size={16} color="#9CA3AF" />
          <Text className="ml-1 text-[12px] text-[#6B7280]">Region</Text>
        </View>

        <Pressable onPress={openCalendar} className="flex-row items-center" hitSlop={10}>
          <Ionicons name="calendar-outline" size={16} color="#9CA3AF" />
          <Text className="ml-1 text-[12px] text-[#6B7280]">
            {periodTab}: {calendarLabel}
          </Text>
        </Pressable>
      </View>

      {/* Date picker */}
      {dateOpen && Platform.OS === "android" && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={onPickDate}
        />
      )}

      {dateOpen && Platform.OS === "ios" && (
        <Modal transparent animationType="fade" onRequestClose={() => setDateOpen(false)}>
          <Pressable
            onPress={() => setDateOpen(false)}
            style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" }}
          >
            <Pressable
              onPress={() => {}}
              style={{
                backgroundColor: "#fff",
                borderTopLeftRadius: 18,
                borderTopRightRadius: 18,
                paddingHorizontal: 16,
                paddingTop: 14,
                paddingBottom: 22,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 16, fontWeight: "800", color: "#111827" }}>Select date</Text>
                <Pressable onPress={commitIosDate} hitSlop={10}>
                  <Text style={{ color: "#4F46E5", fontWeight: "800" }}>Done</Text>
                </Pressable>
              </View>

              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={onPickDate}
              />
            </Pressable>
          </Pressable>
        </Modal>
      )}

      {/* Loading / error */}
      {loading && items.length === 0 && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#4F46E5" />
          <Text className="mt-2 text-[12px] text-gray-500">Loading ranking...</Text>
        </View>
      )}

      {!loading && !!error && items.length === 0 && (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-[13px] text-red-500 text-center">{error}</Text>
          <Pressable onPress={load} className="mt-3 rounded-full bg-[#4F46E5] px-4 py-2">
            <Text className="text-white text-[12px] font-semibold">Retry</Text>
          </Pressable>
        </View>
      )}

      {/* List */}
      {items.length > 0 && (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {items.map((item) => (
            <View
              key={`${item.userId}-${item.rank}`}
              className="mb-3 flex-row items-center rounded-2xl bg-white px-3 py-2.5 shadow-sm shadow-black/5"
            >
              <Text className="w-7 text-center text-[14px] font-semibold text-[#4B5563]">
                {item.rank}
              </Text>

              {/* Avatar */}
              <View className="h-10 w-10 rounded-full bg-[#E5E7EB] items-center justify-center mr-3 overflow-hidden">
                {item.avatarUrl ? (
                  <Image source={{ uri: item.avatarUrl }} style={{ width: "100%", height: "100%" }} />
                ) : (
                  <Text className="text-[15px] font-semibold text-[#4B5563]">
                    {item.name?.[0]?.toUpperCase?.() ?? "U"}
                  </Text>
                )}
              </View>

              {/* Info */}
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="text-[14px] font-semibold text-[#111827]" numberOfLines={1}>
                    {item.name}
                  </Text>
                  {!!item.countryFlag && <Text className="ml-2 text-[13px]">{item.countryFlag}</Text>}
                </View>

                <Text className="mt-0.5 text-[11px] text-[#6B7280]">
                  ID: {item.userId?.slice?.(-6) ?? "------"}
                </Text>
              </View>

              {/* Score */}
              <View className="items-end">
                <View className="flex-row items-center">
                  <Ionicons name={iconName as any} size={14} color="#F97316" />
                  <Text className="ml-1 text-[12px] font-semibold text-[#F97316]">
                    {formatNumber(item.score)}
                  </Text>
                </View>
              </View>
            </View>
          ))}

          {/* Distance line */}
          <View className="mt-2 items-center">
            {me?.distance != null ? (
              <Text className="text-[11px] text-[#6B7280]">
                Distance from rank is: {formatNumber(me.distance)}
              </Text>
            ) : (
              <Text className="text-[11px] text-[#6B7280]">
                You are at the top (or no higher rank available).
              </Text>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default RankingScreen;
