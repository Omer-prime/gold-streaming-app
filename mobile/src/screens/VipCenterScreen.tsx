// src/screens/VipCenterScreen.tsx
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "../navigation/ProfileStackNavigator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { t } from "../i18n";

type Nav = NativeStackNavigationProp<ProfileStackParamList, "VipCenter">;

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://192.168.10.25:3000";
const USER_ID_KEY = "gl_user_id";

type VipTierApi = "NONE" | "NORMAL" | "SUPER" | "DIAMOND" | "SVIP";

type VipApiResponse = {
  current: {
    tier: VipTierApi;
    expiresAt: string | null;
    isActive: boolean;
    daysLeft: number | null;
  };
  plans: Array<{
    tier: VipTierApi;
    name: string;
    monthlyPriceCoins: number;
    description?: string;
    privileges: Array<{ key: string; label: string; value?: string; locked?: boolean }>;
  }>;
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/** UI tokens stay in app (design), data comes from backend (price/privileges). */
const UI_BY_TIER: Record<Exclude<VipTierApi, "NONE">, { gradient: [string, string]; accent: string }> =
  {
    NORMAL: { gradient: ["#0F172A", "#1D4ED8"], accent: "#38BDF8" },
    SUPER: { gradient: ["#7C2D12", "#EA580C"], accent: "#FDBA74" },
    DIAMOND: { gradient: ["#4C1D95", "#7C3AED"], accent: "#F9A8FF" },
    SVIP: { gradient: ["#450A0A", "#B91C1C"], accent: "#FACC15" },
  };

const TIER_ORDER: Exclude<VipTierApi, "NONE">[] = ["NORMAL", "SUPER", "DIAMOND", "SVIP"];

const ICON_BY_PRIV_KEY: Record<string, keyof typeof Ionicons.glyphMap> = {
  daily_coins: "star-outline",
  live_tag: "pricetag-outline",
  platform_speaker: "megaphone-outline",
  entry_vehicle: "car-outline",
  vip_badge: "ribbon-outline",
  invisible_visitor: "eye-off-outline",
  data_card: "card-outline",
};

function formatCoins(n: number) {
  try {
    return n.toLocaleString();
  } catch {
    return String(n);
  }
}

const VipCenterScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();

  const [data, setData] = useState<VipApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [activeIndex, setActiveIndex] = useState(0);
  const pagerRef = useRef<ScrollView | null>(null);

  const plansByTier = useMemo(() => {
    const map: Partial<Record<VipTierApi, VipApiResponse["plans"][number]>> = {};
    (data?.plans ?? []).forEach((p) => (map[p.tier] = p));
    return map;
  }, [data]);

  const currentTierUi = useMemo(() => {
    const tier = (data?.current.tier ?? "NONE") as VipTierApi;
    if (tier === "NONE") return UI_BY_TIER.NORMAL;
    return UI_BY_TIER[tier];
  }, [data]);

  const loadVip = useCallback(async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem(USER_ID_KEY);
      if (!userId) {
        setData(null);
        return;
      }

      const res = await fetch(
        `${API_BASE_URL}/api/profile/vip?userId=${encodeURIComponent(userId)}`
      );

      if (!res.ok) {
        console.log("VIP load failed", res.status);
        setData(null);
        return;
      }

      const json = (await res.json()) as VipApiResponse;
      setData(json);

      // Optional: auto-select current tier if active
      if (json.current?.tier && json.current.tier !== "NONE") {
        const idx = TIER_ORDER.indexOf(json.current.tier as any);
        if (idx >= 0) {
          setActiveIndex(idx);
          pagerRef.current?.scrollTo({ x: idx * SCREEN_WIDTH, y: 0, animated: false });
        }
      }
    } catch (e) {
      console.error("loadVip error", e);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadVip();
    }, [loadVip])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadVip();
    setRefreshing(false);
  }, [loadVip]);

  const handleTabPress = (index: number) => {
    setActiveIndex(index);
    pagerRef.current?.scrollTo({ x: index * SCREEN_WIDTH, y: 0, animated: true });
  };

  const handleMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const pageIndex = Math.round(
      e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width
    );
    if (pageIndex !== activeIndex) setActiveIndex(pageIndex);
  };

  const currentTier = data?.current?.tier ?? "NONE";
  const currentText =
    currentTier === "NONE"
      ? t("vipCenter.current.none")
      : t("vipCenter.current.active", {
          name: plansByTier[currentTier]?.name ?? currentTier,
          days: data?.current.daysLeft ?? 0,
        });

  if (loading && !data) {
    return (
      <SafeAreaView className="flex-1 bg-[#020617]" edges={["top"]}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
          <Text className="mt-2 text-[12px] text-gray-300">{t("vipCenter.states.loading")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#020617]" edges={["top"]}>
      {/* Header */}
      <View className="px-4 pt-3 pb-2 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => navigation.goBack()}
            className="h-8 w-8 items-center justify-center rounded-full bg-black/40 mr-2"
          >
            <Ionicons name="chevron-back" size={20} color="#E5E7EB" />
          </Pressable>
          <View>
            <Text className="text-[16px] font-semibold text-white">{t("vipCenter.title")}</Text>
            <Text className="text-[11px] text-gray-300 mt-0.5">{currentText}</Text>
          </View>
        </View>
        <Ionicons name="shield-checkmark-outline" size={20} color={currentTierUi.accent} />
      </View>

      {/* Top tabs */}
      <View className="px-4 mt-2 flex-row items-center">
        {TIER_ORDER.map((tier, index) => {
          const isActive = index === activeIndex;
          const title = plansByTier[tier]?.name ?? tier;
          return (
            <Pressable key={tier} onPress={() => handleTabPress(index)} className="mr-4 pb-1">
              <Text className={`text-[13px] ${isActive ? "text-white font-semibold" : "text-gray-400"}`}>
                {title}
              </Text>
              {isActive && <View className="mt-1 h-[2px] rounded-full bg-[#FDE68A]" />}
            </Pressable>
          );
        })}
      </View>

      {/* Swipeable pager */}
      <ScrollView
        ref={pagerRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumEnd}
        style={{ flex: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {TIER_ORDER.map((tier) => (
          <View key={tier} style={{ width: SCREEN_WIDTH }}>
            <VipTierPage
              tier={tier}
              plan={plansByTier[tier]}
              onOpenVip={async () => {
                Alert.alert(
                  t("vipCenter.alerts.purchaseTitle"),
                  t("vipCenter.alerts.purchaseMsg", { tier })
                );
              }}
            />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const VipTierPage: React.FC<{
  tier: Exclude<VipTierApi, "NONE">;
  plan?: VipApiResponse["plans"][number];
  onOpenVip: () => void;
}> = ({ tier, plan, onOpenVip }) => {
  const ui = UI_BY_TIER[tier];
  const price = plan?.monthlyPriceCoins ?? 0;
  const privileges = plan?.privileges ?? [];

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
    >
      <LinearGradient
        colors={ui.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          marginHorizontal: 16,
          marginTop: 12,
          borderRadius: 24,
          paddingVertical: 16,
          paddingHorizontal: 16,
        }}
      >
        <View className="items-center">
          <View className="h-28 w-28 rounded-full bg-white/10 items-center justify-center mb-3">
            <Ionicons name="diamond-outline" size={52} color={ui.accent} />
          </View>

          <Text className="text-[12px] text-white/80">{plan?.name ?? tier}</Text>

          <View className="mt-1 flex-row items-center">
            <Ionicons name="cash-outline" size={18} color="#FDE68A" />
            <Text className="ml-1 text-[20px] font-extrabold text-[#FEFCE8]">
              {formatCoins(price)}
            </Text>
            <Text className="ml-1 text-[12px] text-[#E0E7FF]">{t("vipCenter.labels.perMonth")}</Text>
          </View>

          <Text className="mt-1 text-[11px] text-[#E0E7FF]">
            {plan?.description ?? t("vipCenter.labels.defaultDescription")}
          </Text>
        </View>
      </LinearGradient>

      {/* Privileges grid */}
      <View className="mt-6 px-4">
        <Text className="text-[12px] text-gray-200 mb-3">
          {t("vipCenter.labels.privilegesCount", { count: privileges.length, total: privileges.length })}
        </Text>

        <View className="flex-row flex-wrap -mx-1.5">
          {privileges.map((p) => {
            const locked = !!p.locked;
            const icon = ICON_BY_PRIV_KEY[p.key] ?? "sparkles-outline";

            return (
              <View key={`${p.key}-${p.label}`} className="w-1/3 px-1.5 pb-3">
                <View
                  className="rounded-2xl px-3 py-3"
                  style={{ backgroundColor: locked ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.10)" }}
                >
                  <View
                    className="h-8 w-8 rounded-full items-center justify-center mb-2"
                    style={{ backgroundColor: locked ? "rgba(0,0,0,0.40)" : "rgba(0,0,0,0.30)" }}
                  >
                    <Ionicons name={icon} size={18} color={locked ? "#9CA3AF" : ui.accent} />
                  </View>

                  <Text
                    className={`text-[11px] font-semibold ${locked ? "text-gray-400" : "text-white"}`}
                    numberOfLines={2}
                  >
                    {p.label}
                  </Text>

                  {!!p.value && (
                    <Text className={`mt-1 text-[10px] ${locked ? "text-gray-500" : "text-[#FDE68A]"}`}>
                      {p.value}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* CTA */}
      <View className="px-4 mt-4">
        <Pressable onPress={onOpenVip} className="active:opacity-90">
          <LinearGradient
            colors={ui.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ borderRadius: 999, paddingVertical: 12 }}
          >
            <Text className="text-center text-[15px] font-semibold text-white">
              {t("vipCenter.actions.open", { name: plan?.name ?? tier })}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default VipCenterScreen;
