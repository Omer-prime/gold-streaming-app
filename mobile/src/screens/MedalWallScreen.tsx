import React, { useCallback, useMemo, useState } from "react";
import { View, Text, ScrollView, Image, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "../navigation/ProfileStackNavigator";
import { getMedalWall, type MedalDTO } from "../services/medals.service";

type Nav = NativeStackNavigationProp<ProfileStackParamList>;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

const MedalWallScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<any>();

  // ✅ Pass userId when navigating to this screen:
  // navigation.navigate("MedalWall", { userId: currentUser.id })
  const userId: string = route?.params?.userId ?? "";

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [user, setUser] = useState<{
    username: string;
    nickname?: string | null;
    avatarUrl?: string | null;
    level: number;
  } | null>(null);

  const [summary, setSummary] = useState<{ obtainedCount: number; total: number } | null>(null);
  const [medals, setMedals] = useState<MedalDTO[]>([]);

  const load = useCallback(async () => {
    if (!userId) {
      setError("Missing userId. Pass { userId } when navigating to MedalWall.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const data = await getMedalWall(userId);
      setUser(data.user);
      setSummary({ obtainedCount: data.summary.obtainedCount, total: data.summary.total });
      setMedals(data.medals);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Failed to load medals");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  const displayName = useMemo(() => {
    if (!user) return "—";
    return (user.nickname || user.username || "—").toString();
  }, [user]);

  const initialLetter = useMemo(() => {
    const s = displayName?.trim();
    return s ? s.slice(0, 1).toUpperCase() : "U";
  }, [displayName]);

  return (
    <SafeAreaView className="flex-1 bg-[#111827]" edges={["top"]}>
      <LinearGradient
        colors={["#111827", "#1F2937", "#111827"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center px-4 py-3">
          <Ionicons name="chevron-back" size={22} color="#F9FAFB" onPress={navigation.goBack} />
          <Text className="flex-1 text-center text-[17px] font-semibold text-[#F9FAFB]">
            Medal Wall
          </Text>
          <View className="w-8 items-center justify-center">
            <Ionicons name="help-circle-outline" size={20} color="#9CA3AF" />
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 32, paddingHorizontal: 12 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* Error */}
          {!!error && (
            <View className="mt-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3">
              <Text className="text-[12px] text-red-200">{error}</Text>
            </View>
          )}

          {/* User summary */}
          <View className="mt-3 rounded-3xl bg-white/10 px-4 py-3 flex-row items-center">
            <View className="h-10 w-10 rounded-full bg-[#0B1220] items-center justify-center mr-3 overflow-hidden border border-white/10">
              {user?.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={{ width: 40, height: 40 }} />
              ) : (
                <Text className="text-[16px] font-semibold text-[#F9FAFB]">{initialLetter}</Text>
              )}
            </View>

            <View className="flex-1">
              <Text className="text-[14px] font-semibold text-white" numberOfLines={1}>
                {displayName}
              </Text>
              <Text className="mt-0.5 text-[11px] text-[#E5E7EB]">
                Obtain: {summary?.obtainedCount ?? 0}/{summary?.total ?? medals.length}
                {loading ? " • Loading..." : ""}
              </Text>
            </View>

            <Text className="text-[12px] font-semibold text-[#FACC15]">
              Level: {user?.level ?? 0}
            </Text>
          </View>

          {/* Title */}
          <View className="mt-6 mb-3 items-center">
            <Text className="text-[13px] font-semibold text-[#FACC15]">
              Achievement Medal
            </Text>
          </View>

          {/* Grid */}
          <View className="flex-row flex-wrap -mx-1">
            {medals.map((medal) => {
              const isLocked = !medal.obtained;
              const prog = medal.progress;
              const pct =
                prog && prog.target > 0 ? clamp(Math.round((prog.current / prog.target) * 100), 0, 100) : null;

              return (
                <View key={medal.key} className="w-1/2 px-1 mb-3">
                  <LinearGradient
                    colors={
                      isLocked
                        ? ["rgba(255,255,255,0.06)", "rgba(255,255,255,0.03)"]
                        : ["rgba(202,138,4,0.75)", "rgba(146,64,14,0.85)"]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    className="rounded-3xl px-4 py-4 items-center justify-center border border-white/10"
                  >
                    <View className="h-10 w-10 rounded-full bg-white/15 items-center justify-center mb-2 border border-white/10">
                      {medal.iconKind === "IMAGE_URL" ? (
                        <Image
                          source={{ uri: medal.icon }}
                          style={{ width: 24, height: 24 }}
                          resizeMode="contain"
                        />
                      ) : (
                        <Ionicons name={medal.icon as any} size={22} color="#F9FAFB" />
                      )}
                    </View>

                    <Text
                      className={"text-[12px] " + (isLocked ? "text-[#CBD5E1]" : "text-[#F9FAFB]")}
                      numberOfLines={2}
                      style={{ textAlign: "center" }}
                    >
                      {medal.title}
                    </Text>

                    {/* lock + progress */}
                    {isLocked ? (
                      <View className="mt-2 flex-row items-center">
                        <Ionicons name="lock-closed-outline" size={14} color="#94A3B8" />
                        {pct !== null && (
                          <Text className="ml-1 text-[10px] text-[#94A3B8]">
                            {pct}% ({prog!.current}/{prog!.target})
                          </Text>
                        )}
                      </View>
                    ) : (
                      <View className="mt-2 flex-row items-center">
                        <Ionicons name="checkmark-circle-outline" size={14} color="#FACC15" />
                        <Text className="ml-1 text-[10px] text-[#FACC15]">Unlocked</Text>
                      </View>
                    )}
                  </LinearGradient>
                </View>
              );
            })}
          </View>

          {/* Empty state */}
          {medals.length === 0 && !loading && !error && (
            <View className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
              <Text className="text-[12px] text-slate-300">
                No medals found. Add DB medals (HonorItem type MEDAL) or ensure API returns computed medals.
              </Text>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default MedalWallScreen;
