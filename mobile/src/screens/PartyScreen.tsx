// src/screens/PartyScreen.tsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  Pressable,
  TextInput,
  ActivityIndicator,
  Modal,
  FlatList,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { API_BASE_URL } from "../config";
import { t } from "../i18n";

type TabType = "Following" | "Party";

type Country = {
  id: string;
  code: string;
  name: string;
  flagEmoji: string | null;
};

type PartyRoom = {
  id: string; // streamId
  hostId: string;
  title: string;
  tag: string;
  viewers: number;
  countryFlag: string;
  thumbnailUrl?: string | null;
};

function tr(key: string, fallback: string, vars?: any) {
  const v = t(key, vars);
  if (!v || v === key) return fallback;
  return v;
}

const PartyScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const { width } = useWindowDimensions();

  const [activeTab, setActiveTab] = useState<TabType>("Following");

  const [query, setQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const [countries, setCountries] = useState<Country[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [countriesErr, setCountriesErr] = useState<string | null>(null);

  const [activeCountryCode, setActiveCountryCode] = useState<string>("popular");
  const [countriesModalOpen, setCountriesModalOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");

  const maxVisibleCountries = width >= 390 ? 4 : 3;

  const activeCountryObj = useMemo(
    () => countries.find((c) => c.code === activeCountryCode) ?? null,
    [countries, activeCountryCode]
  );

  const visibleCountries = useMemo(() => {
    if (!countries.length) return [];
    const rest = countries.filter((c) => c.code !== activeCountryCode);
    const out: Country[] = [];
    if (activeCountryObj) out.push(activeCountryObj);
    while (out.length < maxVisibleCountries && rest.length > 0) out.push(rest.shift() as Country);
    return out;
  }, [countries, activeCountryCode, activeCountryObj, maxVisibleCountries]);

  const showMore = useMemo(() => {
    const shownCodes = new Set(visibleCountries.map((c) => c.code));
    return countries.some((c) => !shownCodes.has(c.code));
  }, [countries, visibleCountries]);

  const modalCountries = useMemo(() => {
    const q = countrySearch.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter((c) => (c.name || "").toLowerCase().includes(q) || (c.code || "").toLowerCase().includes(q));
  }, [countries, countrySearch]);

  const onSelectCountry = useCallback((code: string) => {
    setActiveCountryCode(code);
    setCountriesModalOpen(false);
    setCountrySearch("");
  }, []);

  const [rooms, setRooms] = useState<PartyRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load countries
  useEffect(() => {
    let cancelled = false;

    const loadCountries = async () => {
      try {
        setCountriesErr(null);
        setCountriesLoading(true);

        const res = await fetch(`${API_BASE_URL}/api/countries`);
        const json = await res.json().catch(() => null);

        if (!res.ok) {
          if (!cancelled) {
            setCountries([]);
            setCountriesErr(json?.error || "Failed to load countries");
          }
          return;
        }

        const list = (json?.countries ?? []) as Country[];
        const safe = Array.isArray(list) ? list : [];
        safe.sort((a, b) => (a?.name || "").localeCompare(b?.name || ""));
        if (!cancelled) setCountries(safe);
      } catch (e) {
        if (!cancelled) {
          setCountries([]);
          setCountriesErr("Network error while loading countries");
        }
      } finally {
        if (!cancelled) setCountriesLoading(false);
      }
    };

    loadCountries();
    return () => {
      cancelled = true;
    };
  }, []);

  // Poll rooms
  const [pollTick, setPollTick] = useState(0);
  useEffect(() => {
    if (!isFocused) return;
    const timer = setInterval(() => setPollTick((x) => x + 1), 2500);
    return () => clearInterval(timer);
  }, [isFocused]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const userId = await AsyncStorage.getItem("gl_user_id");
        const countryParam = activeCountryCode === "popular" ? "ALL" : activeCountryCode.toUpperCase();

        const params = new URLSearchParams();
        params.set("tab", activeTab === "Following" ? "following" : "party");
        params.set("country", countryParam);
        params.set("limit", "30");
        if (userId) params.set("userId", userId);

        const res = await fetch(`${API_BASE_URL}/api/feed/party?${params.toString()}`);
        const json = await res.json().catch(() => null);

        if (!res.ok) {
          if (!cancelled) {
            setError(json?.error || tr("party.errors.loadFailed", "Failed to load party rooms"));
            setRooms([]);
          }
          return;
        }

        const mapped: PartyRoom[] = (json?.items || []).map((item: any) => ({
          id: String(item.streamId),
          hostId: String(item.hostId),
          title: String(item.roomTitle ?? ""),
          tag: String(item.tag ?? tr("party.labels.defaultTag", "Party")),
          viewers: Number(item.viewers ?? 0),
          countryFlag: String(item.countryFlag ?? ""),
          thumbnailUrl: item.thumbnailUrl ? String(item.thumbnailUrl) : null,
        }));

        if (!cancelled) setRooms(mapped);
      } catch (err) {
        if (!cancelled) {
          setError(tr("party.errors.network", "Network error"));
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
  }, [activeTab, activeCountryCode, pollTick]);

  const roomsFiltered = useMemo(() => {
    if (!query.trim()) return rooms;
    const q = query.trim().toLowerCase();
    return rooms.filter((r) => (r.title || "").toLowerCase().includes(q));
  }, [rooms, query]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-1">
        {/* TOP BAR */}
        <View className="px-4 pt-4 pb-3 flex-row items-center justify-between border-b border-gray-100 bg-white">
          <View className="flex-row items-center">
            <TabLabel label={tr("party.tabs.following", "Following")} active={activeTab === "Following"} onPress={() => setActiveTab("Following")} />
            <TabLabel label={tr("party.tabs.party", "Party")} active={activeTab === "Party"} onPress={() => setActiveTab("Party")} />
          </View>

          <View className="flex-row items-center">
            <Pressable className="mr-4" onPress={() => setShowSearch((prev) => !prev)}>
              <Ionicons name="search" size={20} color="#111827" />
            </Pressable>
            <Ionicons name="trophy-outline" size={22} color="#F59E0B" />
          </View>
        </View>

        {/* SEARCH BAR */}
        {showSearch && (
          <View className="px-4 py-2 border-b border-gray-100 bg-white">
            <View className="flex-row items-center bg-gray-100 rounded-full px-3 py-2">
              <Ionicons name="search" size={16} color="#6B7280" />
              <TextInput
                className="flex-1 ml-2 text-[13px] text-gray-800"
                placeholder={tr("party.search.placeholder", "Search party rooms")}
                placeholderTextColor="#9CA3AF"
                value={query}
                onChangeText={setQuery}
              />
              {!!query && (
                <Pressable onPress={() => setQuery("")}>
                  <Ionicons name="close-circle" size={16} color="#9CA3AF" />
                </Pressable>
              )}
            </View>
          </View>
        )}

        {/* Country chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10 }}>
          <FilterChip label={tr("party.filters.popular", "Popular")} active={activeCountryCode === "popular"} onPress={() => setActiveCountryCode("popular")} />
          {visibleCountries.map((c) => (
            <FilterChip
              key={c.id}
              label={c.name}
              flag={c.flagEmoji ?? undefined}
              active={activeCountryCode === c.code}
              onPress={() => setActiveCountryCode(c.code)}
            />
          ))}
          {showMore && <FilterChip label={tr("party.filters.more", "More")} iconRight="chevron-forward" onPress={() => setCountriesModalOpen(true)} />}
        </ScrollView>

        {!!countriesErr && <Text className="px-4 pb-2 text-[11px] text-red-500">{countriesErr}</Text>}
        {countriesLoading && <Text className="px-4 pb-2 text-[11px] text-gray-400">{tr("explore.states.loadingCountries", "Loading countries...")}</Text>}

        {/* ROOMS LIST */}
        {loading ? (
          <View className="px-4 py-4">
            <ActivityIndicator size="small" color="#6C4DFF" />
          </View>
        ) : error ? (
          <Text className="px-4 py-2 text-[12px] text-red-500">{error}</Text>
        ) : (
          <FlatList
            data={roomsFiltered}
            keyExtractor={(x) => x.id}
            contentContainerStyle={{ paddingBottom: 96 }}
            renderItem={({ item, index }) => (
              <View>
                <PartyCard
                  room={item}
                  onPress={(r) => navigation.navigate("LiveRoom", { streamId: r.id, hostId: r.hostId })}
                />
                {index === 2 ? <EventBanner /> : null}
              </View>
            )}
            ListEmptyComponent={
              <View className="px-4 mt-10">
                <Text className="text-center text-[13px] text-gray-400">
                  {tr("party.states.empty", "No rooms found. Try changing the filter or search.")}
                </Text>
              </View>
            }
          />
        )}

        <CountriesModal
          visible={countriesModalOpen}
          onClose={() => {
            setCountriesModalOpen(false);
            setCountrySearch("");
          }}
          countries={modalCountries}
          search={countrySearch}
          setSearch={setCountrySearch}
          activeCountryCode={activeCountryCode}
          onSelect={onSelectCountry}
        />
      </View>
    </SafeAreaView>
  );
};

const TabLabel: React.FC<{ label: string; active: boolean; onPress: () => void }> = ({ label, active, onPress }) => (
  <Pressable onPress={onPress} className="mr-6">
    <Text className={`text-[16px] ${active ? "font-semibold text-black" : "text-gray-400"}`}>{label}</Text>
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
    style={{
      marginRight: 8,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: active ? "#6C4DFF" : "#F3F4F6",
      flexDirection: "row",
      alignItems: "center",
    }}
  >
    {!!flag && <Text style={{ marginRight: 8, fontSize: 13 }}>{flag}</Text>}
    <Text style={{ fontSize: 13, fontWeight: active ? "800" : "600", color: active ? "#fff" : "#374151" }}>{label}</Text>
    {!!iconRight && <Ionicons name={iconRight} size={14} color={active ? "#fff" : "#6B7280"} style={{ marginLeft: 6 }} />}
  </Pressable>
);

const PartyCard: React.FC<{ room: PartyRoom; onPress?: (room: PartyRoom) => void }> = ({ room, onPress }) => (
  <Pressable className="mx-4 mb-3 flex-row rounded-2xl bg-white shadow-sm shadow-black/5 overflow-hidden" onPress={() => onPress?.(room)}>
    <ImageBackground
      source={room.thumbnailUrl ? { uri: room.thumbnailUrl } : require("../../assets/placeholder-image.jpeg")}
      resizeMode="cover"
      style={{ width: 110, height: 90 }}
    />
    <View className="flex-1 px-3 py-2 justify-between">
      <View className="flex-row items-center justify-between">
        <Text className="flex-1 text-[13px] font-semibold text-gray-900" numberOfLines={1}>
          {room.title}
        </Text>
        <Text className="ml-2 text-[13px]">{room.countryFlag}</Text>
      </View>

      <View className="mt-1 flex-row items-center">
        <View className="mr-2 rounded-full bg-[#EC4899]/10 px-2 py-[2px]">
          <Text className="text-[10px] text-[#EC4899]">{room.tag}</Text>
        </View>
      </View>

      <Text className="mt-1 text-[10px] text-gray-400">· {room.viewers}</Text>
    </View>
  </Pressable>
);

const EventBanner: React.FC = () => (
  <View className="px-4 my-3">
    <View className="h-24 rounded-2xl bg-[#8B5CF6] px-4 justify-center">
      <Text className="text-[13px] text-white font-semibold">{tr("homeFeed.eventBanner.title", "Event")}</Text>
      <Text className="text-[11px] text-purple-100 mt-1">{tr("homeFeed.eventBanner.dateRange", "This week")}</Text>
    </View>
  </View>
);

const CountriesModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  countries: Country[];
  search: string;
  setSearch: (v: string) => void;
  activeCountryCode: string;
  onSelect: (code: string) => void;
}> = ({ visible, onClose, countries, search, setSearch, activeCountryCode, onSelect }) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)" }}>
        <Pressable
          onPress={() => {}}
          style={{
            marginTop: 90,
            marginHorizontal: 14,
            borderRadius: 18,
            backgroundColor: "#fff",
            overflow: "hidden",
          }}
        >
          <View style={{ padding: 14, borderBottomWidth: 1, borderBottomColor: "#F3F4F6", flexDirection: "row", alignItems: "center" }}>
            <Text style={{ flex: 1, fontWeight: "900", fontSize: 15, color: "#111827" }}>{tr("party.filters.more", "More")}</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={18} color="#111827" />
            </Pressable>
          </View>

          <View style={{ padding: 14, paddingBottom: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#F3F4F6", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 10 }}>
              <Ionicons name="search" size={16} color="#6B7280" />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder={tr("explore.search.placeholder", "Search")}
                placeholderTextColor="#9CA3AF"
                style={{ flex: 1, marginLeft: 8, color: "#111827" }}
              />
              {!!search && (
                <Pressable onPress={() => setSearch("")} hitSlop={10}>
                  <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                </Pressable>
              )}
            </View>
          </View>

          <FlatList
            data={countries}
            keyExtractor={(c) => c.id}
            style={{ maxHeight: 460 }}
            contentContainerStyle={{ paddingHorizontal: 6, paddingBottom: 10 }}
            renderItem={({ item }) => {
              const active = activeCountryCode === item.code;
              return (
                <Pressable
                  onPress={() => onSelect(item.code)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 12,
                    paddingHorizontal: 14,
                    borderRadius: 14,
                    marginHorizontal: 6,
                    marginBottom: 6,
                    backgroundColor: active ? "rgba(108,77,255,0.10)" : "transparent",
                  }}
                >
                  <Text style={{ width: 30, fontSize: 16 }}>{item.flagEmoji ?? "🌍"}</Text>
                  <Text style={{ flex: 1, fontSize: 14, fontWeight: active ? "900" : "700", color: "#111827" }}>{item.name}</Text>
                  {active ? <Ionicons name="checkmark" size={18} color="#6C4DFF" /> : null}
                </Pressable>
              );
            }}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default PartyScreen;
