// src/screens/GiftGalleryScreen.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { t } from "../i18n";

const USER_ID_KEY = "gl_user_id";

function getApiBase() {
  const raw =
    (process.env.EXPO_PUBLIC_API_URL ??
      process.env.EXPO_PUBLIC_API_BASE_URL ??
      "").trim();
  const base = raw.replace(/\/+$/, "");
  return base || "http://192.168.10.25:3000";
}

function getPublicBase() {
  const raw =
    (process.env.EXPO_PUBLIC_PUBLIC_URL ??
      process.env.EXPO_PUBLIC_API_URL ??
      process.env.EXPO_PUBLIC_API_BASE_URL ??
      "").trim();
  const base = raw.replace(/\/+$/, "");
  return base || getApiBase();
}

function toAbsoluteUrl(url?: string | null) {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    if (url.includes("localhost:") || url.includes("127.0.0.1:")) {
      try {
        const u = new URL(url);
        return `${getPublicBase().replace(/\/+$/, "")}${u.pathname}`;
      } catch {
        return url;
      }
    }
    return url;
  }
  const p = url.startsWith("/") ? url : `/${url}`;
  return `${getPublicBase().replace(/\/+$/, "")}${p}`;
}

type GiftGalleryItem = {
  giftId: number;
  name: string;
  price: number;
  quantity: number;
  totalValueCoins: number;
  mediaType?: "IMAGE" | "GIF" | "VIDEO" | null;
  mediaUrl?: string | null;
  thumbnailUrl?: string | null;
  iconUrl?: string | null;
};

type GiftGalleryResponse = {
  summary: {
    totalGifts: number;
    uniqueGifts: number;
    totalValueCoins: number;
  };
  items: GiftGalleryItem[];
};

export default function GiftGalleryScreen() {
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [summary, setSummary] = useState<GiftGalleryResponse["summary"]>({
    totalGifts: 0,
    uniqueGifts: 0,
    totalValueCoins: 0,
  });
  const [items, setItems] = useState<GiftGalleryItem[]>([]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem(USER_ID_KEY);
      if (!userId) {
        Alert.alert(t("common.error"), t("giftGallery.errors.notLoggedIn"));
        setItems([]);
        return;
      }

      const base = getApiBase();
      const res = await fetch(
        `${base}/api/profile/gift-gallery?userId=${encodeURIComponent(userId)}`,
        { headers: { Accept: "application/json" } }
      );

      const json = (await res.json().catch(() => null)) as GiftGalleryResponse | any;
      if (!res.ok || !json) {
        throw new Error(json?.error || t("giftGallery.errors.loadFailed"));
      }

      setSummary({
        totalGifts: Number(json?.summary?.totalGifts ?? 0),
        uniqueGifts: Number(json?.summary?.uniqueGifts ?? 0),
        totalValueCoins: Number(json?.summary?.totalValueCoins ?? 0),
      });

      setItems(Array.isArray(json?.items) ? json.items : []);
    } catch (e: any) {
      console.log("GiftGallery load error", e?.message || e);
      Alert.alert(t("common.error"), e?.message || t("giftGallery.errors.network"));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const empty = useMemo(() => !loading && (items?.length ?? 0) === 0, [loading, items]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-4 pt-3 pb-2">
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </Pressable>
        <View className="flex-1 items-center">
          <Text className="text-[16px] font-semibold text-[#111827]">
            {t("giftGallery.title")}
          </Text>
        </View>
        <View className="w-6" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 28 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary */}
        <View className="mx-4 mt-3 rounded-3xl bg-[#F3F4F6] px-4 py-4">
          <Text className="text-[12px] text-[#6B7280]">
            {t("giftGallery.summary.totalValue")}
          </Text>
          <Text className="text-[26px] font-bold text-[#111827]">
            {summary.totalValueCoins} {t("giftGallery.labels.coins")}
          </Text>

          <View className="mt-3 flex-row justify-between">
            <Text className="text-[12px] text-[#6B7280]">
              {t("giftGallery.summary.totalGifts", { count: summary.totalGifts })}
            </Text>
            <Text className="text-[12px] text-[#6B7280]">
              {t("giftGallery.summary.uniqueGifts", { count: summary.uniqueGifts })}
            </Text>
          </View>

          <Pressable
            onPress={() => navigation.navigate("Points")}
            className="mt-4 rounded-2xl bg-[#111827] px-4 py-3 items-center"
          >
            <Text className="text-[13px] font-semibold text-white">
              {t("giftGallery.actions.goToPoints")}
            </Text>
          </Pressable>
        </View>

        {/* List */}
        <View className="mt-4 mx-4">
          {loading && items.length === 0 ? (
            <View className="mt-6 items-center">
              <ActivityIndicator />
              <Text className="mt-2 text-[11px] text-gray-500">
                {t("giftGallery.states.loading")}
              </Text>
            </View>
          ) : null}

          {(items ?? []).map((it) => {
            const thumb = toAbsoluteUrl(it.thumbnailUrl || it.mediaUrl || it.iconUrl || null);
            return (
              <View
                key={`${it.giftId}`}
                className="flex-row items-center justify-between py-3 border-b border-[#F3F4F6]"
              >
                <View className="flex-row items-center">
                  {thumb ? (
                    <Image source={{ uri: thumb }} className="h-10 w-10 rounded-xl mr-3" />
                  ) : (
                    <View className="h-10 w-10 rounded-xl bg-gray-200 mr-3 items-center justify-center">
                      <Ionicons name="gift-outline" size={18} color="#6B7280" />
                    </View>
                  )}

                  <View>
                    <Text className="text-[13px] text-[#111827]" numberOfLines={1}>
                      {it.name}
                    </Text>
                    <Text className="text-[11px] text-[#9CA3AF]">
                      {t("giftGallery.labels.qtyLine", { qty: it.quantity, unit: it.price })}
                    </Text>
                  </View>
                </View>

                <Text className="text-[13px] font-semibold text-[#111827]">
                  {it.totalValueCoins} {t("giftGallery.labels.coins")}
                </Text>
              </View>
            );
          })}

          {empty ? (
            <Text className="mt-4 text-[12px] text-[#9CA3AF]">
              {t("giftGallery.empty")}
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
