// src/screens/FansRankingScreen.tsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Image,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL =
  (process.env.EXPO_PUBLIC_API_BASE_URL || "").replace(/\/$/, "") ||
  "http://192.168.10.25:3000";

/** Mobile item shape (your existing UI) */
type FanRankItem = {
  id: string;
  nickname: string;
  avatarUrl?: string | null;
  contribution: number;
  level: number;
  rank: number;
};

/** Backend current shape */
type ApiListItem = {
  rank: number;
  userId: string;
  nickname: string | null;
  username: string;
  avatarUrl: string | null;
  coins: number;
};

type ApiResponseOld = {
  totalContribution: number;
  items: FanRankItem[];
};

type ApiResponseNew = {
  range: "today" | "7days" | "monthly";
  myRank: number | null;
  myCoins: number;
  list: ApiListItem[];
  totalContribution?: number;
  items?: FanRankItem[];
};

const FansRankingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // normalized output for UI
  const [totalContribution, setTotalContribution] = useState(0);
  const [items, setItems] = useState<FanRankItem[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [myCoins, setMyCoins] = useState<number>(0);

  const normalize = useCallback((json: any) => {
    // If backend returns old shape
    if (json && Array.isArray(json.items)) {
      const safeItems = (json.items ?? []).map((it: any, idx: number) => ({
        id: String(it?.id ?? idx),
        nickname: String(it?.nickname ?? "Unknown"),
        avatarUrl: it?.avatarUrl ?? null,
        contribution: Number(it?.contribution ?? 0),
        level: Number(it?.level ?? 0),
        rank: Number(it?.rank ?? idx + 1),
      }));

      setItems(safeItems);
      setTotalContribution(Number(json.totalContribution ?? 0));
      setMyRank(null);
      setMyCoins(0);
      return;
    }

    // If backend returns new shape
    const list = Array.isArray(json?.list) ? json.list : [];
    const safeItems: FanRankItem[] = list.map((it: any, idx: number) => ({
      id: String(it?.userId ?? it?.id ?? idx),
      nickname: String(it?.nickname ?? it?.username ?? "Unknown"),
      avatarUrl: it?.avatarUrl ?? null,
      contribution: Number(it?.coins ?? 0),
      level: Number(it?.level ?? 0), // not provided by backend -> keep 0
      rank: Number(it?.rank ?? idx + 1),
    }));

    setItems(safeItems);
    setMyRank(json?.myRank ?? null);
    setMyCoins(Number(json?.myCoins ?? 0));

    // totalContribution might not exist in your current backend — calculate if missing
    const total =
      typeof json?.totalContribution === "number"
        ? Number(json.totalContribution)
        : safeItems.reduce((sum, x) => sum + (Number(x.contribution) || 0), 0);

    setTotalContribution(total);
  }, []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setErrorText(null);

      const userId = route?.params?.userId ?? (await AsyncStorage.getItem("gl_user_id"));
      if (!userId) {
        setErrorText("Not logged in.");
        setItems([]);
        setTotalContribution(0);
        return;
      }

      // optional params (safe)
      const range = route?.params?.range; // "daily/weekly/monthly" possibly
      const date = route?.params?.date;

      // your backend currently supports range=today|7days|monthly.
      // If you pass daily/weekly/monthly from LiveData, map it:
      const mappedRange =
        range === "weekly" ? "7days" : range === "monthly" ? "monthly" : "today";

      const url =
        `${API_BASE_URL}/api/profile/fans-ranking` +
        `?userId=${encodeURIComponent(userId)}` +
        (mappedRange ? `&range=${encodeURIComponent(mappedRange)}` : "") +
        (date ? `&date=${encodeURIComponent(date)}` : ""); // backend may ignore date unless you add support

      const res = await fetch(url);
      const json = await res.json().catch(() => null);

      if (!res.ok || !json || json?.error) {
        setErrorText(json?.error || "Failed to load fans ranking.");
        setItems([]);
        setTotalContribution(0);
        return;
      }

      normalize(json);
    } catch (err) {
      console.error("Fans ranking fetch error", err);
      setErrorText("Network error while loading fans ranking.");
      setItems([]);
      setTotalContribution(0);
    } finally {
      setLoading(false);
    }
  }, [normalize, route?.params]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const empty = useMemo(() => (items ?? []).length === 0, [items]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-4 pt-3 pb-2">
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </Pressable>
        <View className="flex-1 items-center">
          <Text className="text-[16px] font-semibold text-[#111827]">
            Fans ranking
          </Text>
        </View>
        <View className="w-6" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Summary card */}
        <View className="mx-4 mt-3 rounded-3xl bg-[#EEF2FF] px-4 py-4">
          <Text className="text-[12px] text-[#4B5563] mb-1">
            Total contribution
          </Text>
          <Text className="text-[24px] font-bold text-[#4F46E5]">
            {totalContribution}
          </Text>

          {(myRank !== null || myCoins > 0) && (
            <View className="mt-3 flex-row justify-between">
              <Text className="text-[12px] text-[#6B7280]">My rank: {myRank ?? "-"}</Text>
              <Text className="text-[12px] text-[#6B7280]">My coins: {myCoins}</Text>
            </View>
          )}
        </View>

        {errorText && (
          <View className="mt-3 mx-4 rounded-2xl bg-red-50 px-3 py-2">
            <Text className="text-[11px] text-red-600">{errorText}</Text>
          </View>
        )}

        {loading && items.length === 0 && (
          <View className="mt-6 items-center">
            <ActivityIndicator />
            <Text className="mt-2 text-[11px] text-gray-500">
              Loading ranking...
            </Text>
          </View>
        )}

        {/* List */}
        <View className="mt-4 mx-4">
          {(items ?? []).map((item) => (
            <View
              key={item.id}
              className="flex-row items-center justify-between py-2 border-b border-[#F3F4F6]"
            >
              <View className="flex-row items-center">
                <View className="w-6">
                  <Text className="text-[13px] text-[#6B7280]">
                    {item.rank}
                  </Text>
                </View>

                {item.avatarUrl ? (
                  <Image
                    source={{ uri: item.avatarUrl }}
                    className="h-9 w-9 rounded-full mr-3"
                  />
                ) : (
                  <View className="h-9 w-9 rounded-full bg-gray-200 mr-3 items-center justify-center">
                    <Ionicons name="person-outline" size={18} color="#6B7280" />
                  </View>
                )}

                <View>
                  <Text className="text-[13px] text-[#111827]">
                    {item.nickname}
                  </Text>
                  <Text className="text-[11px] text-[#9CA3AF]">
                    Lv.{item.level}
                  </Text>
                </View>
              </View>

              <Text className="text-[13px] font-semibold text-[#EF4444]">
                {item.contribution}
              </Text>
            </View>
          ))}

          {empty && !loading && !errorText && (
            <Text className="mt-4 text-[12px] text-[#9CA3AF]">
              No fan contributions yet.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default FansRankingScreen;
