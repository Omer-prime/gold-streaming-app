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
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { API_BASE_URL } from "../config";
import { t } from "../i18n";

type Nav = NativeStackNavigationProp<ProfileStackParamList>;

type TopTab = "host" | "rich" | "gift";
type PeriodTab = "daily" | "weekly" | "monthly";

const TOP_TABS: TopTab[] = ["host", "rich", "gift"];
const PERIOD_TABS: PeriodTab[] = ["daily", "weekly", "monthly"];

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
  return num.toLocaleString();
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

function toAbsoluteUrl(base: string, url?: string | null) {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const b = (base || "").replace(/\/+$/, "");
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${b}${path}`;
}

const RankingScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();

  const apiBase = useMemo(
    () => String(API_BASE_URL || "").replace(/\/+$/, ""),
    []
  );

  const [topTab, setTopTab] = useState<TopTab>("host");
  const [periodTab, setPeriodTab] = useState<PeriodTab>("weekly");

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateOpen, setDateOpen] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date());

  const [items, setItems] = useState<RankingRow[]>([]);
  const [me, setMe] = useState<RankingMe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const iconName = useMemo(() => {
    if (topTab === "host") return "videocam-outline";
    if (topTab === "rich") return "cash-outline";
    return "gift-outline";
  }, [topTab]);

  const calendarLabel = useMemo(() => {
    if (periodTab === "daily") {
      return selectedDate.toLocaleDateString(undefined, {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
    }
    if (periodTab === "weekly") {
      const s = startOfWeekMonday(selectedDate);
      const e = addDays(s, 6);
      const sTxt = s.toLocaleDateString(undefined, {
        month: "short",
        day: "2-digit",
      });
      const eTxt = e.toLocaleDateString(undefined, {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
      return `${sTxt} - ${eTxt}`;
    }
    return selectedDate.toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });
  }, [periodTab, selectedDate]);

  const load = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      const userId = await AsyncStorage.getItem("gl_user_id");

      const params = new URLSearchParams();
      params.set("type", topTab);
      params.set("period", periodTab);
      params.set("limit", "50");
      params.set("date", formatLocalYMD(selectedDate));
      params.set("tzOffset", String(new Date().getTimezoneOffset()));
      if (userId) params.set("userId", userId);

      const res = await fetch(`${apiBase}/api/ranking?${params.toString()}`);
      const json = await res.json().catch(() => null);

      if (!res.ok) {
        setItems([]);
        setMe(null);
        setError(json?.error || t("ranking.errors.loadFailed"));
        return;
      }

      const list = Array.isArray(json?.items) ? json.items : [];
      const mapped: RankingRow[] = list.map((r: any) => ({
        rank: Number(r.rank ?? 0),
        userId: String(r.userId ?? ""),
        name: String(r.name ?? t("ranking.labels.userFallback")),
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
      setError(t("ranking.errors.network"));
    } finally {
      setLoading(false);
    }
  }, [apiBase, topTab, periodTab, selectedDate]);

  useFocusEffect(
    React.useCallback(() => {
      load();
    }, [load])
  );

  const onPickDate = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === "android") {
      setDateOpen(false);
      if (event.type === "set" && date) setSelectedDate(date);
      return;
    }
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
      <View className="flex-row items-center px-4 pt-3 pb-2 border-b border-gray-100">
        <Pressable
          onPress={navigation.goBack}
          className="mr-3 h-9 w-9 items-center justify-center rounded-full"
        >
          <Ionicons name="chevron-back" size={20} color="#111827" />
        </Pressable>

        <Text className="flex-1 text-center text-[18px] font-semibold text-[#111827]">
          {t("ranking.title")}
        </Text>

        <Pressable
          className="h-9 w-9 items-center justify-center rounded-full"
          onPress={load}
        >
          <Ionicons name="refresh-outline" size={20} color="#9CA3AF" />
        </Pressable>
      </View>

      {/* Top tabs */}
      <View className="flex-row items-center justify-center mt-2">
        {TOP_TABS.map((tab) => {
          const active = tab === topTab;
          return (
            <Pressable
              key={tab}
              onPress={() => setTopTab(tab)}
              className="mx-3 pb-1"
            >
              <Text
                className={`text-[14px] ${
                  active ? "text-[#4F46E5] font-semibold" : "text-[#6B7280]"
                }`}
              >
                {t(`ranking.tabs.${tab}`)}
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
              className={`mx-1 rounded-full px-3 py-1.5 ${
                active ? "bg-[#4F46E5]" : "bg-gray-100"
              }`}
            >
              <Text
                className={`text-[11px] ${
                  active ? "text-white font-semibold" : "text-[#374151]"
                }`}
              >
                {t(`ranking.period.${tab}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Filters row */}
      <View className="px-4 mt-3 mb-2 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Ionicons name="location-outline" size={16} color="#9CA3AF" />
          <Text className="ml-1 text-[12px] text-[#6B7280]">
            {t("ranking.filters.region")}
          </Text>
        </View>

        <Pressable onPress={openCalendar} className="flex-row items-center" hitSlop={10}>
          <Ionicons name="calendar-outline" size={16} color="#9CA3AF" />
          <Text className="ml-1 text-[12px] text-[#6B7280]">
            {t("ranking.filters.periodLabel", {
              period: t(`ranking.period.${periodTab}`),
              range: calendarLabel,
            })}
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
                <Text style={{ fontSize: 16, fontWeight: "800", color: "#111827" }}>
                  {t("ranking.datePicker.selectDate")}
                </Text>
                <Pressable onPress={commitIosDate} hitSlop={10}>
                  <Text style={{ color: "#4F46E5", fontWeight: "800" }}>
                    {t("common.done")}
                  </Text>
                </Pressable>
              </View>

              <DateTimePicker value={tempDate} mode="date" display="spinner" onChange={onPickDate} />
            </Pressable>
          </Pressable>
        </Modal>
      )}

      {/* Loading / error */}
      {loading && items.length === 0 && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#4F46E5" />
          <Text className="mt-2 text-[12px] text-gray-500">{t("ranking.states.loading")}</Text>
        </View>
      )}

      {!loading && !!error && items.length === 0 && (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-[13px] text-red-500 text-center">{error}</Text>
          <Pressable onPress={load} className="mt-3 rounded-full bg-[#4F46E5] px-4 py-2">
            <Text className="text-white text-[12px] font-semibold">
              {t("ranking.states.retry")}
            </Text>
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

              <View className="h-10 w-10 rounded-full bg-[#E5E7EB] items-center justify-center mr-3 overflow-hidden">
                {item.avatarUrl ? (
                  <Image
                    source={{ uri: toAbsoluteUrl(apiBase, item.avatarUrl) ?? item.avatarUrl }}
                    style={{ width: "100%", height: "100%" }}
                  />
                ) : (
                  <Text className="text-[15px] font-semibold text-[#4B5563]">
                    {item.name?.[0]?.toUpperCase?.() ?? "U"}
                  </Text>
                )}
              </View>

              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="text-[14px] font-semibold text-[#111827]" numberOfLines={1}>
                    {item.name}
                  </Text>
                  {!!item.countryFlag && (
                    <Text className="ml-2 text-[13px]">{item.countryFlag}</Text>
                  )}
                </View>

                <Text className="mt-0.5 text-[11px] text-[#6B7280]">
                  {t("ranking.labels.id", { id: item.userId?.slice?.(-6) ?? "------" })}
                </Text>
              </View>

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

          <View className="mt-2 items-center">
            {me?.distance != null ? (
              <Text className="text-[11px] text-[#6B7280]">
                {t("ranking.distance.label", { distance: formatNumber(me.distance) })}
              </Text>
            ) : (
              <Text className="text-[11px] text-[#6B7280]">{t("ranking.distance.top")}</Text>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default RankingScreen;
