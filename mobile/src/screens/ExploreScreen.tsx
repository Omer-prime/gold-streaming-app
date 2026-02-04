import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Image,
  useWindowDimensions,
  Alert,
  Modal,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect, useIsFocused } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config";
import { t } from "../i18n";

type TopTab = "FOLLOWING" | "EXPLORE" | "NEW" | "NEAR";

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
  streamId?: string | null;
  activeStreamId?: string | null;
};

type Country = {
  id: string;
  code: string;
  name: string;
  flagEmoji: string | null;
};

const ExploreScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const { width } = useWindowDimensions();
  const tabBarHeight = useBottomTabBarHeight();

  const [activeTopTab, setActiveTopTab] = useState<TopTab>("EXPLORE");
  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [countries, setCountries] = useState<Country[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [countriesErr, setCountriesErr] = useState<string | null>(null);
  const [activeCountryCode, setActiveCountryCode] = useState<string>("popular");

  // ✅ More modal state
  const [countriesModalOpen, setCountriesModalOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");

  const [items, setItems] = useState<ExploreItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [refreshTick, setRefreshTick] = useState(0);
  useFocusEffect(
    useCallback(() => {
      setRefreshTick((n) => n + 1);
    }, [])
  );

  const [pollTick, setPollTick] = useState(0);
  useEffect(() => {
    if (!isFocused) return;
    if (!(activeTopTab === "EXPLORE" || activeTopTab === "FOLLOWING")) return;

    const timer = setInterval(() => setPollTick((x) => x + 1), 2000);
    return () => clearInterval(timer);
  }, [isFocused, activeTopTab]);

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
            setCountriesErr(json?.error || t("explore.errors.loadCountries"));
          }
          return;
        }

        const list = (json?.countries ?? []) as Country[];
        const safe = Array.isArray(list) ? list : [];

        // ✅ sort A-Z so modal is nice
        safe.sort((a, b) => (a?.name || "").localeCompare(b?.name || ""));

        if (!cancelled) setCountries(safe);
      } catch (e) {
        console.error("load countries error", e);
        if (!cancelled) {
          setCountries([]);
          setCountriesErr(t("explore.errors.networkCountries"));
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

  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        setError(null);
        setLoading(true);

        const userId = await AsyncStorage.getItem("gl_user_id");

        const params = new URLSearchParams();
        if (userId) params.set("userId", userId);

        const tabMap: Record<TopTab, string> = {
          FOLLOWING: "following",
          EXPLORE: "explore",
          NEW: "new",
          NEAR: "near",
        };

        params.set("tab", tabMap[activeTopTab]);
        params.set("country", activeCountryCode || "popular");

        if (searchQuery.trim().length > 0) params.set("q", searchQuery.trim());
        params.set("limit", "30");

        const res = await fetch(`${API_BASE_URL}/api/feed/explore?${params.toString()}`);
        const json = await res.json().catch(() => null);

        if (!res.ok) {
          if (!cancelled) {
            setError(json?.error || t("explore.errors.loadFeed"));
            setItems([]);
          }
          return;
        }

        const list = (json?.items ?? []) as ExploreItem[];

        const liveOnly = (Array.isArray(list) ? list : []).filter((x) => {
          const sid = x.streamId ?? x.activeStreamId ?? null;
          return !!x.isLive && !!sid;
        });

        if (!cancelled) setItems(liveOnly);
      } catch (e) {
        console.error("load explore feed error", e);
        if (!cancelled) {
          setError(t("explore.errors.networkFeed"));
          setItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 180);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [activeTopTab, activeCountryCode, searchQuery, refreshTick, pollTick]);

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
    const remaining = countries.filter((c) => !shownCodes.has(c.code));
    return remaining.length > 0;
  }, [countries, visibleCountries]);

  // ✅ modal list filtering
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

  const openLiveRoom = async (item: ExploreItem) => {
    const sid = item.streamId ?? item.activeStreamId ?? null;
    if (!sid) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/live/stream?streamId=${encodeURIComponent(sid)}`);
      const json = await res.json().catch(() => null);

      if (res.ok && json && json.isLive === false) {
        Alert.alert(t("explore.alerts.liveEndedTitle"), t("explore.alerts.liveEndedMsg"));
        return;
      }
    } catch {}

    navigation.navigate("LiveRoom", {
      streamId: sid,
      hostId: item.id,
      displayName: item.displayName,
      avatarUrl: item.avatarUrl,
    });
  };

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
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 150, paddingTop: 8 }}
        >
          {(activeTopTab === "EXPLORE" || activeTopTab === "FOLLOWING") && (
            <>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}
              >
                <Chip
                  label={t("explore.chips.popular")}
                  active={activeCountryCode === "popular"}
                  onPress={() => setActiveCountryCode("popular")}
                />

                {visibleCountries.map((c) => (
                  <Chip
                    key={c.id}
                    label={c.name}
                    flag={c.flagEmoji ?? undefined}
                    active={activeCountryCode === c.code}
                    onPress={() => setActiveCountryCode(c.code)}
                  />
                ))}

                {showMore && (
                  <Chip
                    label={t("explore.chips.more")}
                    iconRight="chevron-forward"
                    // ✅ FIX: open modal
                    onPress={() => setCountriesModalOpen(true)}
                  />
                )}
              </ScrollView>

              {!!countriesErr && (
                <View style={{ paddingHorizontal: 16, paddingBottom: 6 }}>
                  <Text className="text-[11px] text-red-500">{countriesErr}</Text>
                </View>
              )}

              {countriesLoading && (
                <View style={{ paddingHorizontal: 16, paddingBottom: 6 }}>
                  <Text className="text-[11px] text-[#9CA3AF]">
                    {t("explore.states.loadingCountries")}
                  </Text>
                </View>
              )}
            </>
          )}

          {loading && (
            <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
              <ActivityIndicator size="small" color="#6C4DFF" />
              <Text className="text-[11px] text-gray-400 mt-2">
                {t("explore.states.refreshingList")}
              </Text>
            </View>
          )}

          {error && !loading && (
            <View style={{ paddingHorizontal: 16, paddingVertical: 6 }}>
              <Text className="text-[12px] text-red-500">{error}</Text>
            </View>
          )}

          {!loading && !error && items.length === 0 && (
            <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
              <Text className="text-[13px] text-gray-500">{t("explore.states.empty")}</Text>
            </View>
          )}

          <View style={{ paddingHorizontal: 16, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
            {items.map((item) => (
              <RoomCard key={item.id} item={item} onPress={() => openLiveRoom(item)} />
            ))}
          </View>
        </ScrollView>

        <Pressable
          onPress={() => navigation.navigate("LiveApplication")}
          style={{ position: "absolute", right: 18, bottom: tabBarHeight + 12 }}
        >
          <View style={{ alignItems: "center" }}>
            <View
              style={{
                height: 74,
                width: 74,
                borderRadius: 999,
                backgroundColor: "#fff",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#000",
                shadowOpacity: 0.2,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 6 },
                elevation: 12,
              }}
            >
              <LinearGradient
                colors={["#FF4B8B", "#FF2D55"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  height: 66,
                  width: 66,
                  borderRadius: 999,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="videocam" size={30} color="#ffffff" />
              </LinearGradient>
            </View>

            <Text style={{ marginTop: 6, fontSize: 12, fontWeight: "800", color: "#FF2D55" }}>
              {t("explore.actions.live")}
            </Text>
          </View>
        </Pressable>

        {/* ✅ Countries "More" Modal */}
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
          onSelect={(code) => onSelectCountry(code)}
        />
      </View>
    </SafeAreaView>
  );
};

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
            placeholder={t("explore.search.placeholder")}
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
            <Text className="ml-3 text-[13px] text-[#6C4DFF]">
              {t("explore.search.cancel")}
            </Text>
          </Pressable>
        </View>
      ) : (
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <HeaderTab
              label={t("explore.tabs.following")}
              active={activeTopTab === "FOLLOWING"}
              onPress={() => setActiveTopTab("FOLLOWING")}
            />
            <HeaderTab
              label={t("explore.tabs.explore")}
              active={activeTopTab === "EXPLORE"}
              onPress={() => setActiveTopTab("EXPLORE")}
            />
            <HeaderTab
              label={t("explore.tabs.new")}
              active={activeTopTab === "NEW"}
              onPress={() => setActiveTopTab("NEW")}
            />
            <HeaderTab
              label={t("explore.tabs.near")}
              active={activeTopTab === "NEAR"}
              onPress={() => setActiveTopTab("NEAR")}
            />
          </View>

          <View className="flex-row items-center">
            <Pressable onPress={() => setSearchMode(true)} hitSlop={10}>
              <Ionicons name="search" size={20} color="#111827" />
            </Pressable>

            <Pressable onPress={() => navigation.navigate("Profile", { screen: "Ranking" })} hitSlop={10}>
              <Ionicons name="trophy-outline" size={22} color="#F59E0B" style={{ marginLeft: 16 }} />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
};

const HeaderTab: React.FC<{ label: string; active?: boolean; onPress: () => void }> = ({
  label,
  active,
  onPress,
}) => (
  <Pressable onPress={onPress} hitSlop={8}>
    <Text className={`mr-4 text-[14px] ${active ? "text-black font-semibold" : "text-gray-400"}`}>
      {label}
    </Text>
  </Pressable>
);

const Chip: React.FC<{
  label: string;
  active?: boolean;
  flag?: string;
  iconRight?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}> = ({ label, active, flag, iconRight, onPress }) => (
  <Pressable
    onPress={onPress}
    style={{
      marginRight: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: active ? "#6C4DFF" : "#F3F4F6",
      flexDirection: "row",
      alignItems: "center",
    }}
  >
    {!!flag && <Text style={{ marginRight: 8, fontSize: 13 }}>{flag}</Text>}
    <Text style={{ fontSize: 13, fontWeight: active ? "800" : "600", color: active ? "#fff" : "#374151" }}>
      {label}
    </Text>
    {!!iconRight && (
      <Ionicons name={iconRight} size={14} color={active ? "#fff" : "#6B7280"} style={{ marginLeft: 6 }} />
    )}
  </Pressable>
);

const RoomCard: React.FC<{ item: ExploreItem; onPress?: () => void }> = ({ item, onPress }) => {
  const initials = (item.displayName || t("explore.labels.userFallback")).slice(0, 1).toUpperCase();

  return (
    <Pressable onPress={onPress} style={{ width: "48%", marginBottom: 12 }}>
      <View style={{ height: 170, borderRadius: 18, overflow: "hidden", backgroundColor: "#111827" }}>
        {item.avatarUrl ? (
          <Image source={{ uri: item.avatarUrl }} resizeMode="cover" style={{ width: "100%", height: "100%" }} />
        ) : (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <View
              style={{
                height: 74,
                width: 74,
                borderRadius: 999,
                backgroundColor: "rgba(255,255,255,0.12)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 28, fontWeight: "900" }}>{initials}</Text>
            </View>
          </View>
        )}

        {item.isLive && (
          <View
            style={{
              position: "absolute",
              right: 8,
              top: 8,
              backgroundColor: "#EF4444",
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 999,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 11, fontWeight: "900" }}>
              {t("explore.labels.liveBadge")}
            </Text>
          </View>
        )}

        <LinearGradient
          colors={["rgba(0,0,0,0.75)", "rgba(0,0,0,0.05)"]}
          start={{ x: 0, y: 1 }}
          end={{ x: 0, y: 0 }}
          style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 80 }}
        />

        <View style={{ position: "absolute", left: 10, right: 10, bottom: 10 }}>
          <Text style={{ color: "#fff", fontSize: 13, fontWeight: "900" }} numberOfLines={1}>
            {item.displayName}
          </Text>
          <Text style={{ marginTop: 2, color: "rgba(255,255,255,0.9)", fontSize: 11 }}>
            {t("explore.labels.viewers", { count: item.liveViewers || 0 })}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

/* ------------------------------ Countries Modal ----------------------------- */

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
          {/* header */}
          <View style={{ padding: 14, borderBottomWidth: 1, borderBottomColor: "#F3F4F6", flexDirection: "row", alignItems: "center" }}>
            <Text style={{ flex: 1, fontWeight: "900", fontSize: 15, color: "#111827" }}>
              {t("explore.chips.more")}
            </Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={18} color="#111827" />
            </Pressable>
          </View>

          {/* search */}
          <View style={{ padding: 14, paddingBottom: 10 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#F3F4F6",
                borderRadius: 999,
                paddingHorizontal: 12,
                paddingVertical: 10,
              }}
            >
              <Ionicons name="search" size={16} color="#6B7280" />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder={t("explore.search.placeholder")}
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

          {/* list */}
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
                  <Text style={{ flex: 1, fontSize: 14, fontWeight: active ? "900" : "700", color: "#111827" }}>
                    {item.name}
                  </Text>
                  {active ? <Ionicons name="checkmark" size={18} color="#6C4DFF" /> : null}
                </Pressable>
              );
            }}
            ListEmptyComponent={
              <View style={{ padding: 16 }}>
                <Text style={{ color: "#6B7280", fontSize: 13 }}>{t("explore.states.empty")}</Text>
              </View>
            }
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default ExploreScreen;
