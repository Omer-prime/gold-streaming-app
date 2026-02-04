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
import { t } from "../i18n";

const API_BASE_URL =
  (process.env.EXPO_PUBLIC_API_BASE_URL || "").replace(/\/$/, "") ||
  "http://192.168.10.25:3000";

type FanRankItem = {
  id: string;
  nickname: string;
  avatarUrl?: string | null;
  contribution: number;
  level: number;
  rank: number;
};

const FansRankingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [totalContribution, setTotalContribution] = useState(0);
  const [items, setItems] = useState<FanRankItem[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [myCoins, setMyCoins] = useState<number>(0);

  const normalize = useCallback((json: any) => {
    if (json && Array.isArray(json.items)) {
      const safeItems = (json.items ?? []).map((it: any, idx: number) => ({
        id: String(it?.id ?? idx),
        nickname: String(it?.nickname ?? t("fansRanking.labels.unknownUser")),
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

    const list = Array.isArray(json?.list) ? json.list : [];
    const safeItems: FanRankItem[] = list.map((it: any, idx: number) => ({
      id: String(it?.userId ?? it?.id ?? idx),
      nickname: String(it?.nickname ?? it?.username ?? t("fansRanking.labels.unknownUser")),
      avatarUrl: it?.avatarUrl ?? null,
      contribution: Number(it?.coins ?? 0),
      level: Number(it?.level ?? 0),
      rank: Number(it?.rank ?? idx + 1),
    }));

    setItems(safeItems);
    setMyRank(json?.myRank ?? null);
    setMyCoins(Number(json?.myCoins ?? 0));

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
        setErrorText(t("fansRanking.errors.notLoggedIn"));
        setItems([]);
        setTotalContribution(0);
        return;
      }

      const range = route?.params?.range;
      const date = route?.params?.date;

      const mappedRange =
        range === "weekly" ? "7days" : range === "monthly" ? "monthly" : "today";

      const url =
        `${API_BASE_URL}/api/profile/fans-ranking` +
        `?userId=${encodeURIComponent(userId)}` +
        (mappedRange ? `&range=${encodeURIComponent(mappedRange)}` : "") +
        (date ? `&date=${encodeURIComponent(date)}` : "");

      const res = await fetch(url);
      const json = await res.json().catch(() => null);

      if (!res.ok || !json || json?.error) {
        setErrorText(json?.error || t("fansRanking.errors.loadFailed"));
        setItems([]);
        setTotalContribution(0);
        return;
      }

      normalize(json);
    } catch (err) {
      console.error("Fans ranking fetch error", err);
      setErrorText(t("fansRanking.errors.network"));
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
            {t("fansRanking.title")}
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
            {t("fansRanking.summary.totalContribution")}
          </Text>
          <Text className="text-[24px] font-bold text-[#4F46E5]">
            {totalContribution}
          </Text>

          {(myRank !== null || myCoins > 0) && (
            <View className="mt-3 flex-row justify-between">
              <Text className="text-[12px] text-[#6B7280]">
                {t("fansRanking.summary.myRank", { rank: myRank ?? "-" })}
              </Text>
              <Text className="text-[12px] text-[#6B7280]">
                {t("fansRanking.summary.myCoins", { coins: myCoins })}
              </Text>
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
              {t("fansRanking.states.loading")}
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
                  <Text className="text-[13px] text-[#6B7280]">{item.rank}</Text>
                </View>

                {item.avatarUrl ? (
                  <Image source={{ uri: item.avatarUrl }} className="h-9 w-9 rounded-full mr-3" />
                ) : (
                  <View className="h-9 w-9 rounded-full bg-gray-200 mr-3 items-center justify-center">
                    <Ionicons name="person-outline" size={18} color="#6B7280" />
                  </View>
                )}

                <View>
                  <Text className="text-[13px] text-[#111827]">{item.nickname}</Text>
                  <Text className="text-[11px] text-[#9CA3AF]">
                    {t("fansRanking.labels.levelShort", { level: item.level })}
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
              {t("fansRanking.empty")}
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default FansRankingScreen;
