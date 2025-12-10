// src/screens/PartyScreen.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  Pressable,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { API_BASE_URL } from "../config";

type TabType = "Following" | "Party";
type RegionFilter = "Popular" | "Pakistan" | "Philippines" | "More";

type PartyRoom = {
  id: string; // streamId
  hostId: string;
  title: string;
  tag: string;
  viewers: number;
  countryFlag: string;
  thumbnailUrl?: string | null;
};

const PartyScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [activeTab, setActiveTab] = useState<TabType>("Following");
  const [activeFilter, setActiveFilter] = useState<RegionFilter>("Popular");
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");

  const [rooms, setRooms] = useState<PartyRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ---------------------------------------------------------------------- */
  /*  LOAD PARTY ROOMS FROM BACKEND                                         */
  /* ---------------------------------------------------------------------- */
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const userId = await AsyncStorage.getItem("gl_user_id");

        let countryParam = "all";
        if (activeFilter === "Pakistan") countryParam = "PK";
        else if (activeFilter === "Philippines") countryParam = "PH";
        // Popular + More → all countries for now

        const params = new URLSearchParams();
        params.set(
          "tab",
          activeTab === "Following" ? "following" : "party"
        );
        params.set("country", countryParam);
        params.set("limit", "30");
        if (userId) params.set("userId", userId);

        const res = await fetch(
          `${API_BASE_URL}/api/feed/party?${params.toString()}`
        );

        if (!res.ok) {
          const json = await res.json().catch(() => null);
          if (!cancelled) {
            setError(json?.error || "Failed to load party rooms");
            setRooms([]);
          }
          return;
        }

        const json = (await res.json()) as {
          items: {
            streamId: string;
            hostId: string;
            roomTitle: string;
            tag: string | null;
            viewers: number;
            countryFlag: string | null;
            thumbnailUrl: string | null;
          }[];
          nextCursor?: string | null;
        };

        if (!cancelled) {
          const mapped: PartyRoom[] = (json.items || []).map((item) => ({
            id: item.streamId,
            hostId: item.hostId,
            title: item.roomTitle,
            tag: item.tag || "Party",
            viewers: item.viewers ?? 0,
            countryFlag: item.countryFlag ?? "",
            thumbnailUrl: item.thumbnailUrl,
          }));
          setRooms(mapped);
        }
      } catch (err) {
        console.error("load party rooms error", err);
        if (!cancelled) {
          setError("Network error while loading party rooms");
          setRooms([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [activeTab, activeFilter]);

  /* ---------------------------------------------------------------------- */
  /*  SEARCH FILTER (client-side)                                           */
  /* ---------------------------------------------------------------------- */
  const roomsFiltered = useMemo(() => {
    if (!query.trim()) return rooms;
    const q = query.trim().toLowerCase();
    return rooms.filter((r) => r.title.toLowerCase().includes(q));
  }, [rooms, query]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-1">
        {/* TOP BAR: Following | Party + icons */}
        <View className="px-4 pt-4 pb-3 flex-row items-center justify-between border-b border-gray-100 bg-white">
          <View className="flex-row items-center">
            <TabLabel
              label="Following"
              active={activeTab === "Following"}
              onPress={() => setActiveTab("Following")}
            />
            <TabLabel
              label="Party"
              active={activeTab === "Party"}
              onPress={() => setActiveTab("Party")}
            />
          </View>

          <View className="flex-row items-center">
            <Pressable
              className="mr-4"
              onPress={() => setShowSearch((prev) => !prev)}
            >
              <Ionicons name="search" size={20} color="#111827" />
            </Pressable>
            <Ionicons name="trophy-outline" size={22} color="#F59E0B" />
          </View>
        </View>

        {/* SEARCH BAR (toggle) */}
        {showSearch && (
          <View className="px-4 py-2 border-b border-gray-100 bg-white">
            <View className="flex-row items-center bg-gray-100 rounded-full px-3 py-2">
              <Ionicons name="search" size={16} color="#6B7280" />
              <TextInput
                className="flex-1 ml-2 text-[13px] text-gray-800"
                placeholder="Search party rooms"
                placeholderTextColor="#9CA3AF"
                value={query}
                onChangeText={setQuery}
              />
              {query.length > 0 && (
                <Pressable onPress={() => setQuery("")}>
                  <Ionicons name="close-circle" size={16} color="#9CA3AF" />
                </Pressable>
              )}
            </View>
          </View>
        )}

        {/* CONTENT */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 96 }}
        >
          {/* Country chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-4 mt-3 mb-2"
          >
            <FilterChip
              label="Popular"
              active={activeFilter === "Popular"}
              onPress={() => setActiveFilter("Popular")}
            />
            <FilterChip
              label="Pakistan"
              flag="🇵🇰"
              active={activeFilter === "Pakistan"}
              onPress={() => setActiveFilter("Pakistan")}
            />
            <FilterChip
              label="Philippines"
              flag="🇵🇭"
              active={activeFilter === "Philippines"}
              onPress={() => setActiveFilter("Philippines")}
            />
            <FilterChip
              label="More"
              iconRight="chevron-forward"
              active={activeFilter === "More"}
              onPress={() => setActiveFilter("More")}
            />
          </ScrollView>

          {/* Loading & error */}
          {loading && (
            <View className="px-4 py-3">
              <ActivityIndicator size="small" color="#6C4DFF" />
            </View>
          )}

          {error && !loading && (
            <View className="px-4 py-2">
              <Text className="text-[12px] text-red-500">{error}</Text>
            </View>
          )}

          {/* Rooms + banner after 3rd item */}
          {!loading &&
            roomsFiltered.map((room, index) => (
              <React.Fragment key={room.id}>
                <PartyCard
                  room={room}
                  onPress={(r) =>
                    navigation.navigate("LiveRoom", {
                      streamId: r.id,
                      hostId: r.hostId,
                    })
                  }
                />
                {index === 2 && <EventBanner />}
              </React.Fragment>
            ))}

          {/* If no rooms match */}
          {!loading && roomsFiltered.length === 0 && !error && (
            <View className="px-4 mt-8">
              <Text className="text-center text-[13px] text-gray-400">
                No rooms found. Try changing the filter or search.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const TabLabel: React.FC<{
  label: string;
  active: boolean;
  onPress: () => void;
}> = ({ label, active, onPress }) => (
  <Pressable onPress={onPress} className="mr-6">
    <Text
      className={`text-[16px] ${
        active ? "font-semibold text-black" : "text-gray-400"
      }`}
    >
      {label}
    </Text>
    {active && <View className="mt-1 h-0.5 rounded-full bg-[#6C4DFF]" />}
  </Pressable>
);

const FilterChip: React.FC<{
  label: string;
  active?: boolean;
  flag?: string;
  iconRight?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}> = ({ label, active, flag, iconRight, onPress }) => (
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

const PartyCard: React.FC<{
  room: PartyRoom;
  onPress?: (room: PartyRoom) => void;
}> = ({ room, onPress }) => (
  <Pressable
    className="mx-4 mb-3 flex-row rounded-2xl bg-white shadow-sm shadow-black/5 overflow-hidden"
    onPress={() => onPress?.(room)}
  >
    {/* Thumbnail */}
    <ImageBackground
      source={
        room.thumbnailUrl
          ? { uri: room.thumbnailUrl }
          : require("../../assets/placeholder-image.jpeg")
      }
      resizeMode="cover"
      style={{ width: 110, height: 90 }}
    />

    {/* Right side content */}
    <View className="flex-1 px-3 py-2 justify-between">
      <View className="flex-row items-center justify-between">
        <Text
          className="flex-1 text-[13px] font-semibold text-gray-900"
          numberOfLines={1}
        >
          {room.title}
        </Text>
        <Text className="ml-2 text-[13px]">{room.countryFlag}</Text>
      </View>

      <View className="mt-1 flex-row items-center">
        <View className="mr-2 rounded-full bg-[#EC4899]/10 px-2 py-[2px]">
          <Text className="text-[10px] text-[#EC4899]">{room.tag}</Text>
        </View>
      </View>

      <Text className="mt-1 text-[10px] text-gray-400">
        ·{room.viewers.toString()}
      </Text>
    </View>
  </Pressable>
);

const EventBanner: React.FC = () => (
  <View className="px-4 my-3">
    <View className="h-24 rounded-2xl bg-[#8B5CF6] px-4 justify-center">
      <Text className="text-[13px] text-white font-semibold">
        FAN CLUB TOPIC EVENT
      </Text>
      <Text className="text-[11px] text-purple-100 mt-1">
        12/11/2025 - 18/11/2025 [UTC+8]
      </Text>
    </View>
  </View>
);

export default PartyScreen;
