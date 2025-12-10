// src/screens/ExploreScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  ImageBackground, // 👈 NEW
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config";

type TopTab = "Following" | "Explore" | "New" | "Near";
type CountryFilter = "Popular" | "Pakistan" | "Philippines";

export type ExploreItem = {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  countryCode: string | null;
  countryFlag: string | null;
  isLive: boolean;
  liveViewers: number;
  followersCount: number;
  coins: number;
};

const ExploreScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [activeTopTab, setActiveTopTab] = useState<TopTab>("Explore");
  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCountry, setActiveCountry] =
    useState<CountryFilter>("Popular");

  const [items, setItems] = useState<ExploreItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---------- LOAD FEED FROM API ----------
  useEffect(() => {
    let cancelled = false;
    let timeout: NodeJS.Timeout;

    const load = async () => {
      try {
        setError(null);
        setLoading(true);

        const userId = await AsyncStorage.getItem("gl_user_id");

        // map UI country names → codes understood by backend
        let countryQuery = "all";
        if (activeCountry === "Pakistan") countryQuery = "PK";
        if (activeCountry === "Philippines") countryQuery = "PH";

        const params = new URLSearchParams();
        if (userId) params.set("userId", userId);
        params.set("tab", activeTopTab.toLowerCase());
        params.set("country", countryQuery);
        if (searchQuery.trim().length > 0) {
          params.set("q", searchQuery.trim());
        }
        params.set("limit", "30");

        const res = await fetch(
          `${API_BASE_URL}/api/feed/explore?${params.toString()}`
        );

        if (!res.ok) {
          const json = await res.json().catch(() => null);
          if (!cancelled) {
            setError(json?.error || "Failed to load explore feed");
            setItems([]);
          }
          return;
        }

        const json = (await res.json()) as {
          items: ExploreItem[];
          nextCursor?: string | null;
        };

        if (!cancelled) {
          setItems(json.items ?? []);
        }
      } catch (e) {
        console.error("load explore feed error", e);
        if (!cancelled) {
          setError("Network error while loading feed");
          setItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    // small debounce so we don't spam API on every keystroke
    timeout = setTimeout(load, 250);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [activeTopTab, activeCountry, searchQuery]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-1 relative">
        <ExploreHeader
          activeTopTab={activeTopTab}
          setActiveTopTab={setActiveTopTab}
          searchMode={searchMode}
          setSearchMode={setSearchMode}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 140, paddingTop: 8 }}
        >
          {(activeTopTab === "Explore" ||
            activeTopTab === "Following" ||
            activeTopTab === "New" ||
            activeTopTab === "Near") && (
            <ExploreContent
              tab={activeTopTab}
              searchQuery={searchQuery}
              items={items}
              loading={loading}
              error={error}
              activeCountry={activeCountry}
              setActiveCountry={setActiveCountry}
              // 👇 when user taps a card → go to live room
              onPressItem={(item) => {
                navigation.navigate("LiveRoom", {
                  hostId: item.id,
                  // you can also pass preloaded info:
                  displayName: item.displayName,
                  avatarUrl: item.avatarUrl,
                });
              }}
            />
          )}
        </ScrollView>

        {/* 🔴 Big floating LIVE button (Poppo-style) */}
        <Pressable
          onPress={() => {
            navigation.navigate("LiveApplication");
          }}
          className="absolute self-center bottom-16"
          style={{
            shadowColor: "#000",
            shadowOpacity: 0.3,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
            elevation: 12,
          }}
        >
          <View className="items-center">
            <View className="h-24 w-24 rounded-full bg-white items-center justify-center">
              <LinearGradient
                colors={["#FF4B8B", "#FF2D55"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  height: 92,
                  width: 92,
                  borderRadius: 999,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="radio-outline" size={36} color="#ffffff" />
              </LinearGradient>
            </View>
            <Text className="mt-1 text-[12px] text-[#FF2D55] font-semibold">
              Live
            </Text>
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

/* ---------- Header etc. ---------- */

interface HeaderProps {
  activeTopTab: TopTab;
  setActiveTopTab: (tab: TopTab) => void;
  searchMode: boolean;
  setSearchMode: (val: boolean) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
}

const ExploreHeader: React.FC<HeaderProps> = ({
  activeTopTab,
  setActiveTopTab,
  searchMode,
  setSearchMode,
  searchQuery,
  setSearchQuery,
}) => {
  const navigation = useNavigation<any>();

  return (
    <View className="bg-white px-4 pt-4 pb-3 border-b border-gray-100">
      {searchMode ? (
        <View className="flex-row items-center bg-gray-100 rounded-full px-3 py-2">
          <Ionicons name="search" size={18} color="#6B7280" />
          <TextInput
            placeholder="Search"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 ml-2 text-[14px] text-black"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </Pressable>
          )}
          <Pressable
            onPress={() => {
              setSearchMode(false);
              setSearchQuery("");
            }}
          >
            <Text className="ml-3 text-[13px] text-[#6C4DFF]">Cancel</Text>
          </Pressable>
        </View>
      ) : (
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <HeaderTab
              label="Following"
              active={activeTopTab === "Following"}
              onPress={() => setActiveTopTab("Following")}
            />
            <HeaderTab
              label="Explore"
              active={activeTopTab === "Explore"}
              onPress={() => setActiveTopTab("Explore")}
            />
            <HeaderTab
              label="New"
              active={activeTopTab === "New"}
              onPress={() => setActiveTopTab("New")}
            />
            <HeaderTab
              label="Near"
              active={activeTopTab === "Near"}
              onPress={() => setActiveTopTab("Near")}
            />
          </View>
          <View className="flex-row items-center">
            <Pressable onPress={() => setSearchMode(true)}>
              <Ionicons name="search" size={20} color="#111827" />
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate("Leaderboard")}
            >
              <Ionicons
                name="trophy-outline"
                size={22}
                color="#F59E0B"
                style={{ marginLeft: 16 }}
              />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
};

const HeaderTab: React.FC<{
  label: string;
  active?: boolean;
  onPress: () => void;
}> = ({ label, active, onPress }) => (
  <Pressable onPress={onPress}>
    <Text
      className={`mr-4 text-[14px] ${
        active ? "text-black font-semibold" : "text-gray-400"
      }`}
    >
      {label}
    </Text>
  </Pressable>
);

/* ---------- Explore content ---------- */

const ExploreContent: React.FC<{
  tab: TopTab;
  searchQuery: string;
  items: ExploreItem[];
  loading: boolean;
  error: string | null;
  activeCountry: CountryFilter;
  setActiveCountry: (c: CountryFilter) => void;
  onPressItem: (item: ExploreItem) => void; // 👈 NEW
}> = ({
  tab,
  searchQuery,
  items,
  loading,
  error,
  activeCountry,
  setActiveCountry,
  onPressItem,
}) => {
  const showingFiltered = searchQuery.trim().length > 0;

  return (
    <>
      {/* country chips only for Explore / Following */}
      {(tab === "Explore" || tab === "Following") && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 mt-2 mb-4"
        >
          <FilterChip
            label="Popular"
            active={activeCountry === "Popular"}
            onPress={() => setActiveCountry("Popular")}
          />
          <FilterChip
            label="Pakistan"
            active={activeCountry === "Pakistan"}
            flag="🇵🇰"
            onPress={() => setActiveCountry("Pakistan")}
          />
          <FilterChip
            label="Philippines"
            active={activeCountry === "Philippines"}
            flag="🇵🇭"
            onPress={() => setActiveCountry("Philippines")}
          />
          <FilterChip label="More" iconRight="chevron-forward" />
        </ScrollView>
      )}

      {!showingFiltered && tab === "Explore" && (
        <View className="px-4 flex-row space-x-3 mb-4">
          <View className="flex-1 h-20 rounded-2xl bg-[#A855F7] justify-center px-4">
            <Text className="text-[12px] text-white font-semibold">New</Text>
            <Text className="text-[14px] text-white font-bold mt-1">
              Honor
            </Text>
          </View>
          <View className="flex-1 h-20 rounded-2xl bg-[#8B5CF6] justify-center px-4">
            <Text className="text-[13px] text-white font-semibold">
              Activity center
            </Text>
          </View>
        </View>
      )}

      {/* loading / error */}
      {loading && (
        <View className="px-4 py-4">
          <ActivityIndicator size="small" color="#6C4DFF" />
        </View>
      )}

      {error && !loading && (
        <View className="px-4 py-2">
          <Text className="text-[12px] text-red-500">{error}</Text>
        </View>
      )}

      {!loading && !error && items.length === 0 && (
        <View className="px-4 mt-6">
          <Text className="text-[13px] text-gray-500">
            No live hosts found. Try changing filters.
          </Text>
        </View>
      )}

      <View className="px-4 flex-row flex-wrap justify-between">
        {items.map((item) => (
          <RoomCard
            key={item.id}
            label={item.displayName}
            tag={item.isLive ? "LIVE" : "Host"}
            viewers={item.liveViewers}
            countryFlag={item.countryFlag ?? ""}
            avatarUrl={item.avatarUrl ?? undefined}
            onPress={() => onPressItem(item)}
          />
        ))}
      </View>

      {!showingFiltered && tab === "Explore" && (
        <View className="mt-4 px-4">
          <View className="h-24 rounded-2xl bg-[#8B5CF6] px-4 justify-center">
            <Text className="text-[13px] text-white font-semibold">
              FAN CLUB TOPIC EVENT
            </Text>
            <Text className="text-[11px] text-purple-100 mt-1">
              12/11/2025 - 18/11/2025 [UTC+8]
            </Text>
          </View>
        </View>
      )}
    </>
  );
};

const FilterChip: React.FC<{
  label: string;
  active?: boolean;
  flag?: string;
  iconRight?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}> = ({ label, active, flag, iconRight, onPress }) => {
  return (
    <Pressable
      onPress={onPress}
      className={`mr-2 flex-row items-center rounded-full px-4 py-2 ${
        active ? "bg-[#6C4DFF]" : "bg-gray-100"
      }`}
    >
      {flag && <Text className="mr-1 text-[13px]">{flag}</Text>}
      <Text
        className={`text-[13px] ${
          active ? "text-white font-semibold" : "text-gray-700"
        }`}
      >
        {label}
      </Text>
      {iconRight && (
        <Ionicons
          name={iconRight}
          size={14}
          color={active ? "#ffffff" : "#6B7280"}
          style={{ marginLeft: 4 }}
        />
      )}
    </Pressable>
  );
};

/* ---------- Room card ---------- */

const RoomCard: React.FC<{
  label: string;
  tag: string;
  viewers?: number;
  countryFlag?: string;
  avatarUrl?: string;
  onPress?: () => void;
}> = ({ label, tag, viewers, countryFlag, avatarUrl, onPress }) => {
  return (
    <Pressable className="mb-3 w-[48%]" onPress={onPress}>
      <View
        className="rounded-2xl overflow-hidden"
        style={{ height: 160, width: "100%" }}
      >
        <ImageBackground
          source={
            avatarUrl
              ? { uri: avatarUrl }
              : require("../../assets/placeholder-image.jpeg")
          }
          resizeMode="cover"
          style={{ flex: 1 }}
        >
          <LinearGradient
            colors={["rgba(0,0,0,0.7)", "rgba(0,0,0,0.1)"]}
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0 }}
            style={{
              flex: 1,
              justifyContent: "flex-end",
            }}
          >
            <View className="p-2">
              <View className="self-start rounded-full bg-[rgba(0,0,0,0.55)] px-2 py-1 flex-row items-center">
                {countryFlag ? (
                  <Text className="text-[10px] text-white mr-1">
                    {countryFlag}
                  </Text>
                ) : null}
                <Text
                  className="text-[10px] text-white"
                  numberOfLines={1}
                >
                  {label}
                </Text>
              </View>
              <View className="mt-1 self-start rounded-full bg-[#10B981] px-2 py-1 flex-row items-center">
                <Text className="text-[10px] text-white">{tag}</Text>
                {typeof viewers === "number" && viewers > 0 && (
                  <Text className="text-[10px] text-white ml-1">
                    · {viewers}
                  </Text>
                )}
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>
      </View>
    </Pressable>
  );
};

export default ExploreScreen;
