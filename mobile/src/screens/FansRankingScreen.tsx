// src/screens/FansRankingScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://192.168.10.25:3000";

type FanRankItem = {
  id: string;
  nickname: string;
  avatarUrl?: string | null;
  contribution: number;
  level: number;
  rank: number;
};

type FansRankingApiResponse = {
  totalContribution: number;
  items: FanRankItem[];
};

const FansRankingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [data, setData] = useState<FansRankingApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
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

        const url = `${API_BASE_URL}/api/profile/fans-ranking?userId=${encodeURIComponent(
          userId
        )}`;

        const res = await fetch(url);
        const json = (await res.json().catch(() => null)) as
          | FansRankingApiResponse
          | { error?: string }
          | null;

        if (cancelled) return;

        if (!res.ok || !json || (json as any).error) {
          console.log("Fans ranking error", json || res.status);
          setErrorText(
            (json as any)?.error || "Failed to load fans ranking."
          );
          setData(null);
          return;
        }

        setData(json as FansRankingApiResponse);
      } catch (err) {
        if (!cancelled) {
          console.error("Fans ranking fetch error", err);
          setErrorText("Network error while loading fans ranking.");
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
  }, []);

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
      >
        {/* Summary card */}
        <View className="mx-4 mt-3 rounded-3xl bg-[#EEF2FF] px-4 py-4">
          <Text className="text-[12px] text-[#4B5563] mb-1">
            Total contribution
          </Text>
          <Text className="text-[24px] font-bold text-[#4F46E5]">
            {data?.totalContribution ?? 0}
          </Text>
        </View>

        {errorText && (
          <View className="mt-3 mx-4 rounded-2xl bg-red-50 px-3 py-2">
            <Text className="text-[11px] text-red-600">{errorText}</Text>
          </View>
        )}

        {loading && !data && (
          <View className="mt-6 items-center">
            <ActivityIndicator />
            <Text className="mt-2 text-[11px] text-gray-500">
              Loading ranking...
            </Text>
          </View>
        )}

        {/* List */}
        <View className="mt-4 mx-4">
          {data?.items.map((item) => (
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

          {data && data.items.length === 0 && !loading && !errorText && (
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
