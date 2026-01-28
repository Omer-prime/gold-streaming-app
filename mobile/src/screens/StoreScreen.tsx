import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "../navigation/ProfileStackNavigator";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Nav = NativeStackNavigationProp<ProfileStackParamList>;
const USER_ID_KEY = "gl_user_id";

function getApiBase() {
  const raw =
    (process.env.EXPO_PUBLIC_API_URL ??
      process.env.EXPO_PUBLIC_API_BASE_URL ??
      "").trim();
  const base = raw.replace(/\/+$/, "");
  return base || "http://192.168.10.25:3000";
}

async function fetchJsonLoose(url: string) {
  const res = await fetch(url, { method: "GET" });
  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  if (!res.ok) throw new Error(json?.error || `Request failed (HTTP ${res.status})`);
  if (!json) throw new Error("API returned non-JSON");
  return json;
}

type Category = { id: string; name: string; slug: string; icon?: string | null };
type StoreItem = {
  id: string;
  title: string;
  priceCoins: number;
  thumbnailUrl?: string | null;
  mediaUrl?: string | null;
};
type Section = { title: string; items: StoreItem[] };

const StoreScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();

  const [resolvedUserId, setResolvedUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [activeSlug, setActiveSlug] = useState<string>("popular");
  const [sections, setSections] = useState<Section[]>([]);
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const stored = await AsyncStorage.getItem(USER_ID_KEY);
      if (!mounted) return;
      setResolvedUserId(stored || null);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function load(slug?: string) {
    try {
      setLoading(true);
      setErr(null);

      if (!resolvedUserId) throw new Error("Missing userId. Please login again.");

      const base = getApiBase();
      const s = (slug ?? activeSlug).trim();
      const url = `${base}/api/profile/store?userId=${encodeURIComponent(resolvedUserId)}&category=${encodeURIComponent(s)}`;
      const json = await fetchJsonLoose(url);

      const cats: Category[] = Array.isArray(json?.categories) ? json.categories : [];
      const secs: Section[] = Array.isArray(json?.sections) ? json.sections : [];
      const bal = Number(json?.wallet?.balance ?? 0) || 0;

      setCategories([{ id: "popular", name: "Popular", slug: "popular", icon: "flame-outline" }, ...cats]);
      setSections(secs);
      setBalance(bal);

      // if slug not set yet and db has categories, default to popular
      if (!activeSlug) setActiveSlug("popular");
    } catch (e: any) {
      setErr(e?.message || "Error");
      setCategories([{ id: "popular", name: "Popular", slug: "popular", icon: "flame-outline" }]);
      setSections([]);
      setBalance(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!resolvedUserId) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedUserId]);

  const empty = useMemo(() => !loading && sections.length === 0, [loading, sections.length]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <Pressable onPress={navigation.goBack} className="mr-3 h-8 w-8 items-center justify-center">
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </Pressable>
        <Text className="flex-1 text-center text-[17px] font-semibold text-[#111827]">
          Store
        </Text>
        <Pressable className="w-8 items-center justify-center" onPress={() => load()}>
          <MaterialCommunityIcons name="trophy-outline" size={20} color="#F97316" />
        </Pressable>
      </View>

      {/* Error */}
      {!!err && (
        <View className="mx-4 mt-3 rounded-2xl bg-red-500/10 border border-red-500/20 px-3 py-2">
          <Text className="text-[12px] text-red-700">{err}</Text>
          <Text className="text-[10px] text-red-700/70 mt-1">Base: {getApiBase()}</Text>
        </View>
      )}

      {/* Category row */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 pt-3 pb-2">
        {categories.map((cat) => {
          const active = cat.slug === activeSlug;
          return (
            <Pressable
              key={cat.slug}
              onPress={() => {
                setActiveSlug(cat.slug);
                load(cat.slug);
              }}
              className="mr-3 items-center"
            >
              <View
                className={`h-9 w-9 rounded-2xl items-center justify-center mb-1 ${
                  active ? "bg-[#F97316]" : "bg-gray-100"
                }`}
              >
                <Ionicons
                  name={(cat.icon || "flame-outline") as any}
                  size={18}
                  color={active ? "#FFFFFF" : "#9CA3AF"}
                />
              </View>
              <Text className={`text-[10px] ${active ? "text-[#111827] font-semibold" : "text-[#6B7280]"}`}>
                {cat.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32, paddingHorizontal: 12 }} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View className="py-16 items-center">
            <ActivityIndicator />
            <Text className="mt-2 text-[12px] text-[#6B7280]">Loading store…</Text>
          </View>
        ) : empty ? (
          <View className="py-16 items-center">
            <Text className="text-[13px] text-[#6B7280]">No items found</Text>
            <Pressable onPress={() => load()} className="mt-3 rounded-full bg-gray-100 px-4 py-2">
              <Text className="text-[12px] text-[#111827]">Refresh</Text>
            </Pressable>
          </View>
        ) : (
          sections.map((sec) => (
            <View key={sec.title}>
              <SectionHeader title={sec.title} />
              <View className="flex-row flex-wrap -mx-1 mb-4">
                {sec.items.map((item) => (
                  <StoreCard key={item.id} title={item.title} price={String(item.priceCoins)} />
                ))}
              </View>
            </View>
          ))
        )}

        {/* Balance row */}
        <View className="flex-row items-center justify-between px-3 py-2 rounded-2xl bg-white shadow-sm shadow-black/5">
          <View className="flex-row items-center">
            <Ionicons name="cash-outline" size={18} color="#F59E0B" />
            <Text className="ml-1 text-[12px] text-[#6B7280]">Coins</Text>
            <Text className="ml-1 text-[13px] font-semibold text-[#111827]">
              {balance.toLocaleString()}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-[11px] text-[#6B7280] mr-2">Recharge</Text>
            <Ionicons name="lock-closed-outline" size={16} color="#9CA3AF" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <View className="mb-2 mt-3 flex-row items-center justify-between px-1">
    <Text className="text-[13px] font-semibold text-[#111827]">{title}</Text>
    <Text className="text-[11px] text-[#6B7280]">All &gt;</Text>
  </View>
);

const StoreCard: React.FC<{ title: string; price: string }> = ({ title, price }) => (
  <View className="w-1/3 px-1 mb-3">
    <View className="rounded-2xl bg-white p-2 items-center justify-between shadow-sm shadow-black/5">
      <View className="h-16 w-full rounded-xl bg-[#EEF2FF] mb-2 items-center justify-center">
        <Text className="text-[12px] text-[#6B7280]">Preview</Text>
      </View>
      <View className="w-full flex-row items-center justify-between">
        <Text className="flex-1 text-[11px] text-[#111827]" numberOfLines={1}>
          {title}
        </Text>
        <View className="flex-row items-center ml-1">
          <Ionicons name="cash-outline" size={12} color="#F59E0B" />
          <Text className="ml-0.5 text-[11px] text-[#F97316]">{price}</Text>
        </View>
      </View>
    </View>
  </View>
);

export default StoreScreen;
