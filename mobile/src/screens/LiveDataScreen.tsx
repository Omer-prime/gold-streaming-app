// src/screens/LiveDataScreen.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Modal,
  Platform,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { t } from "../i18n";

type TopTab = "Live" | "Country";
type RangeTab = "Daily" | "Weekly" | "Monthly";

const API_BASE_URL =
  (process.env.EXPO_PUBLIC_API_BASE_URL || "").replace(/\/$/, "") ||
  "http://192.168.10.25:3000";

type CountryInfo = {
  id: number;
  code: string;
  name: string;
  flagEmoji?: string | null;
};

type LiveDataApiResponse = {
  scope: "user" | "country" | "global";
  country: CountryInfo | null; // present for country scope, null otherwise
  range: "daily" | "weekly" | "monthly";
  date: string; // YYYY-MM-DD

  wonPoints: number;
  liveDurationSeconds: number;
  liveEarnings: number;
  partyDurationSeconds: number;
  partyEarnings: number;
  newFans: number;
  newFanClubMembers: number;

  averageOnlineUsers: number;
  partyCrownDurationSeconds: number;
};

async function apiGetJson<T>(url: string, timeoutMs = 12000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    const json = (await res.json().catch(() => null)) as any;

    if (!res.ok) {
      const msg = json?.error || `Request failed (${res.status})`;
      throw new Error(msg);
    }

    if (!json) throw new Error(t("liveData.errors.emptyResponse"));
    if (json?.error) throw new Error(json.error);

    return json as T;
  } finally {
    clearTimeout(timer);
  }
}

const LiveDataScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();

  const [topTab, setTopTab] = useState<TopTab>("Live");
  const [range, setRange] = useState<RangeTab>("Daily");

  const [userId, setUserId] = useState<string | null>(null);

  const [data, setData] = useState<LiveDataApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = `${d.getMonth() + 1}`.padStart(2, "0");
    const day = `${d.getDate()}`.padStart(2, "0");
    return `${y}-${m}-${day}`;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [showHelp, setShowHelp] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const pollRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const id = await AsyncStorage.getItem("gl_user_id");
        if (mounted) setUserId(id);
      } catch {
        if (mounted) setUserId(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const rangeParam = useMemo(() => range.toLowerCase(), [range]); // daily/weekly/monthly
  const scopeParam = useMemo(
    () => (topTab === "Live" ? "global" : "country"),
    [topTab]
  );

  const refreshData = useCallback(async () => {
    if (!userId) {
      setErrorText(t("liveData.errors.notLoggedIn"));
      setData(null);
      return;
    }

    setLoading(true);
    setErrorText(null);

    try {
      const url =
        `${API_BASE_URL}/api/profile/live-data` +
        `?userId=${encodeURIComponent(userId)}` +
        `&scope=${encodeURIComponent(scopeParam)}` +
        `&range=${encodeURIComponent(rangeParam)}` +
        `&date=${encodeURIComponent(selectedDate)}`;

      const json = await apiGetJson<LiveDataApiResponse>(url);

      const normalized: LiveDataApiResponse = {
        ...json,
        wonPoints: Number(json.wonPoints ?? 0),
        liveDurationSeconds: Number(json.liveDurationSeconds ?? 0),
        liveEarnings: Number(json.liveEarnings ?? 0),
        partyDurationSeconds: Number(json.partyDurationSeconds ?? 0),
        partyEarnings: Number(json.partyEarnings ?? 0),
        newFans: Number(json.newFans ?? 0),
        newFanClubMembers: Number(json.newFanClubMembers ?? 0),
        averageOnlineUsers: Number(json.averageOnlineUsers ?? 0),
        partyCrownDurationSeconds: Number(json.partyCrownDurationSeconds ?? 0),
        country: json.country ?? null,
      };

      setData(normalized);
    } catch (e: any) {
      setErrorText(e?.message || t("liveData.errors.loadFailedLive"));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [userId, selectedDate, rangeParam, scopeParam]);

  useEffect(() => {
    refreshData();
  }, [topTab, range, selectedDate, refreshData]);

  useEffect(() => {
    if (!isFocused) return;

    if (pollRef.current) clearInterval(pollRef.current);

    pollRef.current = setInterval(() => {
      refreshData();
    }, 20000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;
    };
  }, [isFocused, refreshData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshData();
    } finally {
      setRefreshing(false);
    }
  }, [refreshData]);

  const wonPoints = data?.wonPoints ?? 0;
  const liveDuration = formatSeconds(data?.liveDurationSeconds ?? 0);
  const partyDuration = formatSeconds(data?.partyDurationSeconds ?? 0);
  const partyCrownDuration = formatSeconds(data?.partyCrownDurationSeconds ?? 0);
  const liveEarnings = data?.liveEarnings ?? 0;
  const partyEarnings = data?.partyEarnings ?? 0;
  const newFans = data?.newFans ?? 0;
  const newFanClubMembers = data?.newFanClubMembers ?? 0;
  const avgOnlineUsers = data?.averageOnlineUsers ?? 0;

  const avgOnlineLabel =
    range === "Daily"
      ? t("liveData.stats.avgOnline.daily")
      : range === "Weekly"
      ? t("liveData.stats.avgOnline.weekly")
      : t("liveData.stats.avgOnline.monthly");

  const handleDateChange = (_event: any, date?: Date) => {
    if (Platform.OS === "android") setShowDatePicker(false);
    if (date) {
      const y = date.getFullYear();
      const m = `${date.getMonth() + 1}`.padStart(2, "0");
      const d = `${date.getDate()}`.padStart(2, "0");
      setSelectedDate(`${y}-${m}-${d}`);
    }
  };

  const displayDate = data?.date ?? selectedDate;

  const countryLabel =
    topTab === "Country"
      ? data?.country
        ? `${data.country.flagEmoji ?? ""} ${data.country.code}`
        : "—"
      : null;

  return (
    <SafeAreaView className="flex-1 bg-[#F9FAFB]" edges={["top"]}>
      {/* Header */}
      <View className="px-4 pt-3 pb-3 bg-white border-b border-[#F1F5F9]">
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => navigation.goBack()}
            className="h-9 w-9 items-center justify-center rounded-full bg-[#F3F4F6]"
          >
            <Ionicons name="chevron-back" size={20} color="#111827" />
          </Pressable>

          <View className="flex-1 items-center px-3">
            <View className="flex-row bg-[#F3F4F6] rounded-full p-1 w-full max-w-[280px]">
              <TopTabButton
                // keep your i18n key if you want, but this tab is GLOBAL now
                label={t("liveData.tabs.live")}
                active={topTab === "Live"}
                onPress={() => setTopTab("Live")}
              />
              <TopTabButton
                // reuse existing key if you don’t want to touch i18n now
                label={t("liveData.tabs.pk")}
                active={topTab === "Country"}
                onPress={() => setTopTab("Country")}
              />
            </View>
          </View>

          <Pressable
            onPress={() => setShowHelp(true)}
            className="h-9 w-9 items-center justify-center rounded-full bg-[#F3F4F6]"
          >
            <Ionicons name="help-circle-outline" size={19} color="#6B7280" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32, paddingTop: 12 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Filters (range + date) */}
        <View className="mx-4 rounded-2xl bg-white border border-[#EEF2F7] px-3 py-3">
          <View className="rounded-full bg-[#F3F4F6] p-1 flex-row items-center">
            <View className="flex-1 flex-row">
              <RangeTabButton
                label={t("liveData.range.daily")}
                active={range === "Daily"}
                onPress={() => setRange("Daily")}
              />
              <RangeTabButton
                label={t("liveData.range.weekly")}
                active={range === "Weekly"}
                onPress={() => setRange("Weekly")}
              />
              <RangeTabButton
                label={t("liveData.range.monthly")}
                active={range === "Monthly"}
                onPress={() => setRange("Monthly")}
              />
            </View>

            <Pressable
              onPress={() => setShowDatePicker(true)}
              className="ml-2 h-9 rounded-full bg-white border border-[#E5E7EB] px-3 flex-row items-center justify-center"
            >
              <Ionicons name="calendar-outline" size={14} color="#6B7280" />
              <Text
                className="ml-2 text-[12px] font-semibold text-[#111827]"
                style={{ includeFontPadding: false, textAlignVertical: "center" }}
              >
                {displayDate}
              </Text>
            </Pressable>
          </View>

          {/* ✅ Scope helper line */}
          <View className="mt-2 flex-row items-center justify-between">
            <Text className="text-[11px] text-[#6B7280]">
              {topTab === "Live" ? "Scope: Global" : "Scope: Country"}
            </Text>
            {topTab === "Country" && (
              <View className="flex-row items-center">
                <Ionicons name="flag-outline" size={14} color="#6B7280" />
                <Text className="ml-1 text-[11px] font-semibold text-[#111827]">
                  {countryLabel}
                </Text>
              </View>
            )}
          </View>

          {errorText && (
            <View className="mt-3 rounded-xl bg-red-50 px-3 py-2">
              <Text className="text-[11px] text-red-600">{errorText}</Text>
            </View>
          )}
        </View>

        {/* Main stats */}
        <View className="mt-4 mx-4 rounded-3xl bg-white border border-[#EEF2F7] px-4 py-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="h-9 w-9 rounded-xl bg-[#EEF2FF] items-center justify-center mr-2">
                <Ionicons name="sparkles-outline" size={18} color="#6366F1" />
              </View>
              <View>
                <Text className="text-[12px] text-[#6B7280]">
                  {t("liveData.stats.wonPoints")}
                </Text>
                <Text className="text-[26px] font-extrabold text-[#111827]">
                  {wonPoints}
                </Text>
              </View>
            </View>

            {loading && <ActivityIndicator size="small" color="#6366F1" />}
          </View>

          <View className="mt-4 rounded-2xl bg-[#F9FAFB] border border-[#EEF2F7] px-4 py-3 space-y-3">
            <TwoColRow
              leftLabel={t("liveData.stats.liveDuration")}
              leftValue={liveDuration}
              rightLabel={t("liveData.stats.liveEarnings")}
              rightValue={String(liveEarnings)}
            />
            <TwoColRow
              leftLabel={avgOnlineLabel}
              leftValue={String(avgOnlineUsers)}
              rightLabel={t("liveData.stats.partyDuration")}
              rightValue={partyDuration}
            />
            <TwoColRow
              leftLabel={t("liveData.stats.partyEarnings")}
              leftValue={String(partyEarnings)}
              rightLabel={t("liveData.stats.partyCrownDuration")}
              rightValue={partyCrownDuration}
            />
            <TwoColRow
              leftLabel={t("liveData.stats.newFans")}
              leftValue={String(newFans)}
              rightLabel={t("liveData.stats.newFanClubMembers")}
              rightValue={String(newFanClubMembers)}
            />
          </View>
        </View>

        {/* CTA */}
        <View className="mt-4 mx-4">
          <Pressable
            className="rounded-full bg-[#6366F1] py-3"
            onPress={() => navigation.navigate("Reward")}
          >
            <Text className="text-center text-[14px] font-semibold text-white">
              {t("liveData.actions.getMorePoints")}
            </Text>
          </Pressable>
        </View>

        {/* Contribution */}
        <View className="mt-4 mx-4">
          <Pressable
            className="rounded-2xl bg-white border border-[#EEF2F7] px-4 py-3 flex-row items-center justify-between"
            onPress={() => {
              navigation.navigate("FansRanking", {
                userId,
                date: selectedDate,
                range: rangeParam,
                scope: scopeParam,
              });
            }}
          >
            <View className="flex-row items-center">
              <View className="h-9 w-9 rounded-xl bg-[#FFFBEB] items-center justify-center mr-2">
                <Ionicons name="trophy-outline" size={18} color="#F59E0B" />
              </View>
              <Text className="text-[14px] font-semibold text-[#111827]">
                {t("liveData.actions.contribution")}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </Pressable>
        </View>
      </ScrollView>

      {/* Help modal */}
      <Modal
        transparent
        visible={showHelp}
        animationType="fade"
        onRequestClose={() => setShowHelp(false)}
      >
        <View className="flex-1 bg-black/40 items-center justify-center px-8">
          <View className="w-full rounded-2xl bg-white px-5 py-4">
            <Text className="text-[16px] font-semibold text-[#111827] mb-3 text-center">
              {t("liveData.help.title")}
            </Text>
            <Text className="text-[13px] text-[#4B5563] mb-4">
              {t("liveData.help.line1")}
            </Text>
            <Pressable
              onPress={() => setShowHelp(false)}
              className="mt-1 rounded-full bg-[#6366F1] py-2"
            >
              <Text className="text-center text-[14px] font-semibold text-white">
                {t("liveData.help.confirm")}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {showDatePicker && (
        <DateTimePicker
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          value={parseYYYYMMDD(selectedDate)}
          onChange={handleDateChange}
        />
      )}
    </SafeAreaView>
  );
};

/* ---------------- UI components ---------------- */

const TopTabButton: React.FC<{
  label: string;
  active: boolean;
  onPress: () => void;
}> = ({ label, active, onPress }) => (
  <Pressable
    onPress={onPress}
    className={`flex-1 rounded-full px-4 py-2 items-center ${
      active ? "bg-white" : "bg-transparent"
    }`}
  >
    <Text
      className={`text-[13px] ${
        active ? "text-[#111827] font-extrabold" : "text-[#6B7280] font-semibold"
      }`}
      numberOfLines={1}
    >
      {label}
    </Text>
  </Pressable>
);

const RangeTabButton: React.FC<{
  label: string;
  active: boolean;
  onPress: () => void;
}> = ({ label, active, onPress }) => (
  <Pressable
    onPress={onPress}
    className={`h-9 px-3 rounded-full items-center justify-center ${
      active ? "bg-white" : "bg-transparent"
    }`}
  >
    <Text
      className={`text-[12px] ${
        active ? "text-[#111827] font-extrabold" : "text-[#6B7280] font-semibold"
      }`}
      style={{ includeFontPadding: false, textAlignVertical: "center" }}
    >
      {label}
    </Text>
  </Pressable>
);

const TwoColRow: React.FC<{
  leftLabel: string;
  leftValue: string;
  rightLabel: string;
  rightValue: string;
}> = ({ leftLabel, leftValue, rightLabel, rightValue }) => (
  <View className="flex-row justify-between">
    <View className="flex-1 mr-2">
      <Text className="text-[11px] text-[#6B7280]">{leftLabel}</Text>
      <Text className="mt-1 text-[13px] font-extrabold text-[#111827]">{leftValue}</Text>
    </View>
    <View className="flex-1 ml-2">
      <Text className="text-[11px] text-[#6B7280]">{rightLabel}</Text>
      <Text className="mt-1 text-[13px] font-extrabold text-[#111827]">{rightValue}</Text>
    </View>
  </View>
);

function formatSeconds(total: number): string {
  const s = Math.max(0, Math.floor(total));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
}

function parseYYYYMMDD(str: string): Date {
  const [y, m, d] = str.split("-").map((x) => Number(x));
  if (!y || !m || !d) return new Date();
  return new Date(y, m - 1, d);
}

export default LiveDataScreen;
