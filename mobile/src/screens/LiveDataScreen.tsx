// src/screens/LiveDataScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Modal,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";

type TopTab = "Live" | "PK";
type RangeTab = "Daily" | "Weekly" | "Monthly";

type PKTabType = "Random" | "Friend" | "Team";
type PKRange = "Today" | "Recent7" | "Monthly";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://192.168.10.25:3000";

type LiveDataApiResponse = {
  mode: "live" | "pk";
  range: "daily" | "weekly" | "monthly";
  date: string; // YYYY-MM-DD

  wonPoints: number;
  liveDurationSeconds: number;
  liveEarnings: number;
  partyDurationSeconds: number;
  partyEarnings: number;
  newFans: number;
  newFanClubMembers: number;

  // extra fields
  averageOnlineUsers: number;
  partyCrownDurationSeconds: number;
};

type PKDataApiResponse = {
  pkType: "random" | "friend" | "team";
  range: "today" | "7days" | "monthly";
  winRate: number; // 0–100
  pkScore: number;
  sessions: number;
  history: {
    id: string;
    createdAt: string;
    opponentName: string;
    result: "win" | "lose" | "draw";
    score: string;
  }[];
};

const LiveDataScreen: React.FC = () => {
  const navigation = useNavigation();
  const [topTab, setTopTab] = useState<TopTab>("Live");
  const [range, setRange] = useState<RangeTab>("Daily");

  // live data state
  const [data, setData] = useState<LiveDataApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  // PK data state
  const [pkTab, setPkTab] = useState<PKTabType>("Random");
  const [pkRange, setPkRange] = useState<PKRange>("Today");
  const [pkData, setPkData] = useState<PKDataApiResponse | null>(null);
  const [pkLoading, setPkLoading] = useState(false);
  const [pkErrorText, setPkErrorText] = useState<string | null>(null);

  // date selection (for live tab)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = `${d.getMonth() + 1}`.padStart(2, "0");
    const day = `${d.getDate()}`.padStart(2, "0");
    return `${y}-${m}-${day}`;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  // help description modal
  const [showHelp, setShowHelp] = useState(false);

  /* --------- LIVE TAB FETCH --------- */
  useEffect(() => {
    if (topTab !== "Live") return;

    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setErrorText(null);

        const userId = await AsyncStorage.getItem("gl_user_id");
        if (!userId) {
          if (!cancelled) {
            setErrorText("Not logged in.");
            setData(null);
          }
          return;
        }

        const modeParam = "live";
        const rangeParam = range.toLowerCase(); // daily / weekly / monthly

        const url = `${API_BASE_URL}/api/profile/live-data?userId=${encodeURIComponent(
          userId
        )}&mode=${modeParam}&range=${rangeParam}&date=${selectedDate}`;

        const res = await fetch(url);
        const json = (await res.json().catch(() => null)) as
          | LiveDataApiResponse
          | { error?: string }
          | null;

        if (cancelled) return;

        if (!res.ok || !json || (json as any).error) {
          console.log("Live data error", json || res.status);
          setErrorText(
            (json as any)?.error || "Failed to load live data."
          );
          setData(null);
          return;
        }

        setData(json as LiveDataApiResponse);
      } catch (err) {
        if (!cancelled) {
          console.error("Live data fetch error", err);
          setErrorText("Network error while loading data.");
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [topTab, range, selectedDate]);

  /* --------- PK TAB FETCH --------- */
  useEffect(() => {
    if (topTab !== "PK") return;

    let cancelled = false;

    const load = async () => {
      try {
        setPkLoading(true);
        setPkErrorText(null);

        const userId = await AsyncStorage.getItem("gl_user_id");
        if (!userId) {
          if (!cancelled) {
            setPkErrorText("Not logged in.");
            setPkData(null);
          }
          return;
        }

        const typeParam =
          pkTab === "Friend" ? "friend" : pkTab === "Team" ? "team" : "random";
        const rangeParam =
          pkRange === "Today"
            ? "today"
            : pkRange === "Recent7"
            ? "7days"
            : "monthly";

        const url = `${API_BASE_URL}/api/profile/pk-data?userId=${encodeURIComponent(
          userId
        )}&type=${typeParam}&range=${rangeParam}`;

        const res = await fetch(url);
        const json = (await res.json().catch(() => null)) as
          | PKDataApiResponse
          | { error?: string }
          | null;

        if (cancelled) return;

        if (!res.ok || !json || (json as any).error) {
          console.log("PK data error", json || res.status);
          setPkErrorText((json as any)?.error || "Failed to load PK data.");
          setPkData(null);
          return;
        }

        setPkData(json as PKDataApiResponse);
      } catch (err) {
        if (!cancelled) {
          console.error("PK data fetch error", err);
          setPkErrorText("Network error while loading PK data.");
          setPkData(null);
        }
      } finally {
        if (!cancelled) setPkLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [topTab, pkTab, pkRange]);

  // derived live values
  const wonPoints = data?.wonPoints ?? 0;
  const liveDuration = formatSeconds(data?.liveDurationSeconds ?? 0);
  const partyDuration = formatSeconds(data?.partyDurationSeconds ?? 0);
  const partyCrownDuration = formatSeconds(
    data?.partyCrownDurationSeconds ?? 0
  );
  const liveEarnings = data?.liveEarnings ?? 0;
  const partyEarnings = data?.partyEarnings ?? 0;
  const newFans = data?.newFans ?? 0;
  const newFanClubMembers = data?.newFanClubMembers ?? 0;
  const avgOnlineUsers = data?.averageOnlineUsers ?? 0;

  const handleDateChange = (_event: any, date?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (date) {
      const y = date.getFullYear();
      const m = `${date.getMonth() + 1}`.padStart(2, "0");
      const d = `${date.getDate()}`.padStart(2, "0");
      setSelectedDate(`${y}-${m}-${d}`);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-4 pt-3 pb-2">
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </Pressable>
        <View className="flex-1 flex-row justify-center space-x-8">
          <TopTabButton
            label="Live data"
            active={topTab === "Live"}
            onPress={() => setTopTab("Live")}
          />
          <TopTabButton
            label="PK data"
            active={topTab === "PK"}
            onPress={() => setTopTab("PK")}
          />
        </View>
        <Pressable onPress={() => setShowHelp(true)}>
          <Ionicons name="help-circle-outline" size={20} color="#6B7280" />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {topTab === "Live" ? (
          <>
            {/* Range tabs + date */}
            <View className="mt-2 flex-row items-center justify-between px-4">
              <View className="flex-row">
                <RangeTabButton
                  label="Daily data"
                  active={range === "Daily"}
                  onPress={() => setRange("Daily")}
                />
                <RangeTabButton
                  label="Weekly Data"
                  active={range === "Weekly"}
                  onPress={() => setRange("Weekly")}
                />
                <RangeTabButton
                  label="Monthly data"
                  active={range === "Monthly"}
                  onPress={() => setRange("Monthly")}
                />
              </View>

              <Pressable
                className="flex-row items-center"
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                <Text className="ml-1 text-[12px] text-[#111827]">
                  {data?.date ?? selectedDate}
                </Text>
              </Pressable>
            </View>

            {/* Optional error text */}
            {errorText && (
              <View className="mt-3 mx-4 rounded-2xl bg-red-50 px-3 py-2">
                <Text className="text-[11px] text-red-600">
                  {errorText}
                </Text>
              </View>
            )}

            {/* Stats card */}
            <View className="mt-3 mx-4 rounded-3xl bg-[#FCE7F3] px-4 py-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-[12px] text-pink-500 mb-2">
                  Won points
                </Text>
                {loading && (
                  <ActivityIndicator size="small" color="#EC4899" />
                )}
              </View>
              <Text className="text-[28px] font-bold text-[#EC4899]">
                {wonPoints}
              </Text>

              {/* Rows */}
              <View className="mt-3 rounded-2xl bg-white px-4 py-3 space-y-3">
                <TwoColRow
                  leftLabel="Live duration"
                  leftValue={liveDuration}
                  rightLabel="Live earnings"
                  rightValue={String(liveEarnings)}
                />
                <TwoColRow
                  leftLabel={
                    range === "Daily"
                      ? "Average number of online users today"
                      : range === "Weekly"
                      ? "Average number of online users this week"
                      : "Average number of online users this month"
                  }
                  leftValue={String(avgOnlineUsers)}
                  rightLabel="Party duration"
                  rightValue={partyDuration}
                />
                <TwoColRow
                  leftLabel="Party earnings"
                  leftValue={String(partyEarnings)}
                  rightLabel="Party crown duration"
                  rightValue={partyCrownDuration}
                />
                <TwoColRow
                  leftLabel="The number of new fans"
                  leftValue={String(newFans)}
                  rightLabel="New members of fans club"
                  rightValue={String(newFanClubMembers)}
                />
              </View>
            </View>

            {/* Get more points */}
            <View className="mt-4 mx-4">
              <Pressable
                className="rounded-full bg-[#6366F1] py-3"
                onPress={() => {
                  // @ts-ignore – using untyped navigation
                  navigation.navigate("Reward");
                }}
              >
                <Text className="text-center text-[14px] font-semibold text-white">
                  Get more points
                </Text>
              </Pressable>
            </View>

            {/* Contribution -> Fans ranking */}
            <View className="mt-4 mx-4">
              <Pressable
                className="rounded-2xl bg-white px-4 py-3 flex-row items-center justify-between"
                onPress={() =>
                  // @ts-ignore – using untyped navigation
                  navigation.navigate("FansRanking")
                }
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name="trophy-outline"
                    size={18}
                    color="#F59E0B"
                  />
                  <Text className="ml-2 text-[14px] text-[#111827]">
                    Contribution
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color="#9CA3AF"
                />
              </Pressable>
            </View>
          </>
        ) : (
          /* ---------- PK TAB UI ---------- */
          <>
            {/* PK type tabs */}
            <View className="mt-2 px-4 flex-row justify-around">
              <PKTabButton
                label="Random PK"
                active={pkTab === "Random"}
                onPress={() => setPkTab("Random")}
              />
              <PKTabButton
                label="Friend PK"
                active={pkTab === "Friend"}
                onPress={() => setPkTab("Friend")}
              />
              <PKTabButton
                label="Team PK"
                active={pkTab === "Team"}
                onPress={() => setPkTab("Team")}
              />
            </View>

            {/* Range buttons */}
            <View className="mt-3 px-4 flex-row justify-center">
              <PKRangeButton
                label="Today"
                active={pkRange === "Today"}
                onPress={() => setPkRange("Today")}
              />
              <PKRangeButton
                label="Recent 7 days"
                active={pkRange === "Recent7"}
                onPress={() => setPkRange("Recent7")}
              />
              <PKRangeButton
                label="Monthly"
                active={pkRange === "Monthly"}
                onPress={() => setPkRange("Monthly")}
              />
            </View>

            {pkErrorText && (
              <View className="mt-3 mx-4 rounded-2xl bg-red-50 px-3 py-2">
                <Text className="text-[11px] text-red-600">
                  {pkErrorText}
                </Text>
              </View>
            )}

            {/* Summary cards */}
            <View className="mt-4 px-4 flex-row justify-between">
              <PKStatCard
                label="Win%"
                value={`${(pkData?.winRate ?? 0).toFixed(2)}%`}
              />
              <PKStatCard
                label="PK Score"
                value={String(pkData?.pkScore ?? 0)}
              />
              <PKStatCard
                label="Sessions"
                value={String(pkData?.sessions ?? 0)}
              />
            </View>

            {/* History */}
            <View className="mt-5 px-4 mb-8">
              <Text className="text-[13px] font-semibold text-[#111827] mb-2">
                Historical record
              </Text>

              {pkLoading && !pkData && (
                <View className="py-4 items-center">
                  <ActivityIndicator />
                  <Text className="mt-2 text-[11px] text-gray-500">
                    Loading PK history...
                  </Text>
                </View>
              )}

              {pkData && pkData.history.length === 0 && (
                <Text className="text-[12px] text-[#9CA3AF]">
                  No record. Invite friends to PK.
                </Text>
              )}

              {pkData?.history.map((item) => (
                <PKHistoryRow key={item.id} item={item} />
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Help modal (same text as screenshot) */}
      <Modal
        transparent
        visible={showHelp}
        animationType="fade"
        onRequestClose={() => setShowHelp(false)}
      >
        <View className="flex-1 bg-black/40 items-center justify-center px-8">
          <View className="w-full rounded-2xl bg-white px-5 py-4">
            <Text className="text-[16px] font-semibold text-[#111827] mb-3 text-center">
              Description
            </Text>
            <Text className="text-[13px] text-[#4B5563] mb-4">
              1. The settlement cycle is 00:00:00–23:59:59 in UTC+8.
            </Text>
            <Pressable
              onPress={() => setShowHelp(false)}
              className="mt-1 rounded-full bg-[#6366F1] py-2"
            >
              <Text className="text-center text-[14px] font-semibold text-white">
                Confirm
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Date picker for live data */}
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

const TopTabButton: React.FC<{
  label: string;
  active: boolean;
  onPress: () => void;
}> = ({ label, active, onPress }) => (
  <Pressable onPress={onPress} className="pb-1">
    <Text
      className={`text-[15px] ${
        active ? "text-[#111827] font-semibold" : "text-gray-400"
      }`}
    >
      {label}
    </Text>
    {active && <View className="h-[2px] bg-[#111827] mt-1 rounded-full" />}
  </Pressable>
);

const RangeTabButton: React.FC<{
  label: string;
  active: boolean;
  onPress: () => void;
}> = ({ label, active, onPress }) => (
  <Pressable onPress={onPress} className="mr-3">
    <Text
      className={`text-[12px] ${
        active ? "text-[#111827] font-semibold" : "text-gray-400"
      }`}
    >
      {label}
    </Text>
    {active && <View className="h-[2px] bg-[#111827] mt-0.5 rounded-full" />}
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
      <Text className="text-[11px] text-gray-500">{leftLabel}</Text>
      <Text className="mt-1 text-[13px] font-semibold text-[#111827]">
        {leftValue}
      </Text>
    </View>
    <View className="flex-1 ml-2">
      <Text className="text-[11px] text-gray-500">{rightLabel}</Text>
      <Text className="mt-1 text-[13px] font-semibold text-[#111827]">
        {rightValue}
      </Text>
    </View>
  </View>
);

/* ----- PK components ----- */

const PKTabButton: React.FC<{
  label: string;
  active: boolean;
  onPress: () => void;
}> = ({ label, active, onPress }) => (
  <Pressable onPress={onPress} className="px-3 py-1 rounded-full">
    <Text
      className={`text-[13px] ${
        active ? "text-[#111827] font-semibold" : "text-gray-400"
      }`}
    >
      {label}
    </Text>
    {active && <View className="h-[2px] bg-[#111827] mt-1 rounded-full" />}
  </Pressable>
);

const PKRangeButton: React.FC<{
  label: string;
  active: boolean;
  onPress: () => void;
}> = ({ label, active, onPress }) => (
  <Pressable onPress={onPress} className="mx-2 px-3 py-1 rounded-full">
    <Text
      className={`text-[12px] ${
        active ? "text-[#111827] font-semibold" : "text-gray-400"
      }`}
    >
      {label}
    </Text>
  </Pressable>
);

const PKStatCard: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <View className="flex-1 mx-1 rounded-2xl bg-white px-3 py-3 shadow-sm">
    <Text className="text-[11px] text-[#6B7280] mb-1">{label}</Text>
    <Text className="text-[16px] font-semibold text-[#111827]">
      {value}
    </Text>
  </View>
);

const PKHistoryRow: React.FC<{
  item: PKDataApiResponse["history"][number];
}> = ({ item }) => {
  const date = new Date(item.createdAt);
  const timeStr = `${date.getMonth() + 1}/${date.getDate()} ${date
    .getHours()
    .toString()
    .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;

  const resultColor =
    item.result === "win"
      ? "#16A34A"
      : item.result === "lose"
      ? "#DC2626"
      : "#6B7280";

  return (
    <View className="flex-row items-center justify-between py-2 border-b border-[#F3F4F6]">
      <View>
        <Text className="text-[13px] text-[#111827]">
          {item.opponentName}
        </Text>
        <Text className="text-[11px] text-[#9CA3AF] mt-0.5">
          {timeStr}
        </Text>
      </View>
      <View className="items-end">
        <Text
          className="text-[11px] font-semibold"
          style={{ color: resultColor }}
        >
          {item.result === "win"
            ? "Win"
            : item.result === "lose"
            ? "Lose"
            : "Draw"}
        </Text>
        <Text className="text-[11px] text-[#6B7280] mt-0.5">
          Score: {item.score}
        </Text>
      </View>
    </View>
  );
};

// helper for 00:00:00 format
function formatSeconds(total: number): string {
  const s = Math.max(0, Math.floor(total));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;

  const hStr = String(hours).padStart(2, "0");
  const mStr = String(minutes).padStart(2, "0");
  const sStr = String(seconds).padStart(2, "0");

  return `${hStr}:${mStr}:${sStr}`;
}

function parseYYYYMMDD(str: string): Date {
  const [y, m, d] = str.split("-").map((x) => Number(x));
  if (!y || !m || !d) return new Date();
  return new Date(y, m - 1, d);
}

export default LiveDataScreen;
