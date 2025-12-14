// src/screens/ExploreScreen.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Image,
  ImageBackground,
  Modal,
  Platform,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config";

type TopTab = "Following" | "Explore" | "New" | "Near";

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

type Country = {
  id: string;
  code: string;
  name: string;
  flagEmoji: string | null;
};

const ExploreScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();

  const [activeTopTab, setActiveTopTab] = useState<TopTab>("Explore");

  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ dynamic countries from admin
  const [countries, setCountries] = useState<Country[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [countriesErr, setCountriesErr] = useState<string | null>(null);
  const tabBarHeight = useBottomTabBarHeight();
  // "popular" OR country code
  const [activeCountryCode, setActiveCountryCode] = useState<string>("popular");
  const [moreOpen, setMoreOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");

  const [items, setItems] = useState<ExploreItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---------- LOAD COUNTRIES ----------
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
        if (!cancelled) setCountries(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error("load countries error", e);
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

  // ---------- LOAD FEED ----------
  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        setError(null);
        setLoading(true);

        const userId = await AsyncStorage.getItem("gl_user_id");

        const params = new URLSearchParams();
        if (userId) params.set("userId", userId);
        params.set("tab", activeTopTab.toLowerCase());

        // backend expects: "popular" | "all" | "PK" etc
        params.set("country", activeCountryCode || "popular");

        if (searchQuery.trim().length > 0) params.set("q", searchQuery.trim());
        params.set("limit", "30");

        const res = await fetch(`${API_BASE_URL}/api/feed/explore?${params.toString()}`);

        const json = await res.json().catch(() => null);

        if (!res.ok) {
          if (!cancelled) {
            setError(json?.error || "Failed to load explore feed");
            setItems([]);
          }
          return;
        }

        const list = (json?.items ?? []) as ExploreItem[];

        // ✅ only live users (even if backend returns extra)
        const liveOnly = (Array.isArray(list) ? list : []).filter((x) => !!x.isLive);

        if (!cancelled) setItems(liveOnly);
      } catch (e) {
        console.error("load explore feed error", e);
        if (!cancelled) {
          setError("Network error while loading feed");
          setItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 220);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [activeTopTab, activeCountryCode, searchQuery]);

  // chips logic: show Popular + up to N countries + More
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
    while (out.length < maxVisibleCountries && rest.length > 0) {
      out.push(rest.shift() as Country);
    }
    return out;
  }, [countries, activeCountryCode, activeCountryObj, maxVisibleCountries]);

  const showMore = useMemo(() => {
    // if there are more than what we can display
    const shownCodes = new Set(visibleCountries.map((c) => c.code));
    const remaining = countries.filter((c) => !shownCodes.has(c.code));
    return remaining.length > 0;
  }, [countries, visibleCountries]);

  const openLiveRoom = (item: ExploreItem) => {
    navigation.navigate("LiveRoom", {
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
          {/* Country chips */}
          {(activeTopTab === "Explore" || activeTopTab === "Following") && (
            <>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}
              >
                <Chip
                  label="Popular"
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
                    label="More"
                    iconRight="chevron-forward"
                    onPress={() => {
                      setCountrySearch("");
                      setMoreOpen(true);
                    }}
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
                  <Text className="text-[11px] text-[#9CA3AF]">Loading countries...</Text>
                </View>
              )}
            </>
          )}

          {/* New Honor + Activity center */}
          {activeTopTab === "Explore" && searchQuery.trim().length === 0 && (
            <View style={{ paddingHorizontal: 16, marginTop: 6, marginBottom: 12, flexDirection: "row", gap: 12 }}>
              <Pressable style={{ flex: 1 }}>
                <LinearGradient
                  colors={["#FF60B6", "#A855F7"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    height: 86,
                    borderRadius: 18,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    overflow: "hidden",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>New</Text>
                  <Text style={{ color: "#fff", fontSize: 18, fontWeight: "900", marginTop: 2 }}>
                    Honor
                  </Text>

                  <Image
                    source={require("../../assets/king.png")}
                    resizeMode="contain"
                    style={{ position: "absolute", right: 10, top: 10, width: 44, height: 44 }}
                  />
                </LinearGradient>
              </Pressable>

              <Pressable style={{ flex: 1 }}>
                <LinearGradient
                  colors={["#7C3AED", "#A855F7"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    height: 86,
                    borderRadius: 18,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    overflow: "hidden",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 14, fontWeight: "800" }}>
                    Activity center
                  </Text>

                  <Image
                    source={require("../../assets/star.png")}
                    resizeMode="contain"
                    style={{ position: "absolute", right: 6, top: 6, width: 52, height: 52 }}
                  />
                </LinearGradient>
              </Pressable>
            </View>
          )}

          {/* Loading / error */}
          {loading && (
            <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
              <ActivityIndicator size="small" color="#6C4DFF" />
            </View>
          )}

          {error && !loading && (
            <View style={{ paddingHorizontal: 16, paddingVertical: 6 }}>
              <Text className="text-[12px] text-red-500">{error}</Text>
            </View>
          )}

          {!loading && !error && items.length === 0 && (
            <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
              <Text className="text-[13px] text-gray-500">
                No live hosts found. Try changing filters.
              </Text>
            </View>
          )}

          {/* Grid */}
          <View style={{ paddingHorizontal: 16, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
            {items.map((item) => (
              <RoomCard
                key={item.id}
                item={item}
                onPress={() => openLiveRoom(item)}
              />
            ))}
          </View>

          {/* FAN CLUB */}
          {activeTopTab === "Explore" && searchQuery.trim().length === 0 && (
            <View style={{ marginTop: 10, paddingHorizontal: 16 }}>
              <LinearGradient
                colors={["#6D28D9", "#A855F7"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  height: 100,
                  borderRadius: 18,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  overflow: "hidden",
                  justifyContent: "center",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <MaterialCommunityIcons name="gift" size={22} color="#fff" />
                  <Text style={{ color: "#fff", fontSize: 15, fontWeight: "900", marginLeft: 8 }}>
                    FAN CLUB TOPIC EVENT
                  </Text>
                </View>

                <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 12, marginTop: 6 }}>
                  12/11/2025 - 18/11/2025 [UTC+8]
                </Text>

                {/* countdown badge (static for now) */}
                <View
                  style={{
                    position: "absolute",
                    right: 12,
                    bottom: 12,
                    backgroundColor: "#FF4D6D",
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 12,
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 11, fontWeight: "800" }}>6d23h 57m</Text>
                </View>
              </LinearGradient>
            </View>
          )}
        </ScrollView>

        {/* Floating LIVE button */}
        <Pressable
          onPress={() => navigation.navigate("LiveApplication")}
          style={{
            position: "absolute",
            right: 18,
            bottom: tabBarHeight + 12, // stays above bottom tabs
          }}
        >
          <View style={{ alignItems: "center" }}>
            {/* outer white ring */}
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
              {/* inner gradient */}
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
                {/* camera icon (no asset required) */}
                <Ionicons name="videocam" size={30} color="#ffffff" />
              </LinearGradient>
            </View>

            <Text style={{ marginTop: 6, fontSize: 12, fontWeight: "800", color: "#FF2D55" }}>
              Live
            </Text>
          </View>
        </Pressable>
        {/* More countries modal */}
        <Modal visible={moreOpen} transparent animationType="fade" onRequestClose={() => setMoreOpen(false)}>
          <Pressable
            onPress={() => setMoreOpen(false)}
            style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" }}
          >
            <Pressable
              onPress={() => { }}
              style={{
                backgroundColor: "#fff",
                borderTopLeftRadius: 18,
                borderTopRightRadius: 18,
                paddingHorizontal: 16,
                paddingTop: 14,
                paddingBottom: 22,
                maxHeight: "75%",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 16, fontWeight: "800", color: "#111827" }}>Select country</Text>
                <Pressable onPress={() => setMoreOpen(false)} hitSlop={10}>
                  <Ionicons name="close" size={20} color="#111827" />
                </Pressable>
              </View>

              <View
                style={{
                  marginTop: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  borderRadius: 999,
                  paddingHorizontal: 12,
                  paddingVertical: Platform.OS === "android" ? 6 : 10,
                  backgroundColor: "#F9FAFB",
                }}
              >
                <Ionicons name="search-outline" size={16} color="#9CA3AF" />
                <TextInput
                  value={countrySearch}
                  onChangeText={setCountrySearch}
                  placeholder="Search country..."
                  placeholderTextColor="#9CA3AF"
                  autoCorrect={false}
                  autoCapitalize="none"
                  style={{ marginLeft: 8, flex: 1, fontSize: 13, color: "#111827" }}
                />
                {countrySearch.length > 0 && (
                  <Pressable onPress={() => setCountrySearch("")} hitSlop={10}>
                    <Ionicons name="close-circle" size={16} color="#9CA3AF" />
                  </Pressable>
                )}
              </View>

              <ScrollView style={{ marginTop: 12 }} keyboardShouldPersistTaps="handled">
                <Pressable
                  onPress={() => {
                    setActiveCountryCode("popular");
                    setMoreOpen(false);
                  }}
                  style={{
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: "#F3F4F6",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ fontSize: 14, color: "#111827", fontWeight: "700" }}>Popular</Text>
                  {activeCountryCode === "popular" && (
                    <Ionicons name="checkmark" size={18} color="#6C4DFF" />
                  )}
                </Pressable>

                {countries
                  .filter((c) => {
                    const s = countrySearch.trim().toLowerCase();
                    if (!s) return true;
                    return (
                      c.name.toLowerCase().includes(s) ||
                      c.code.toLowerCase().includes(s)
                    );
                  })
                  .map((c) => (
                    <Pressable
                      key={c.id}
                      onPress={() => {
                        setActiveCountryCode(c.code);
                        setMoreOpen(false);
                      }}
                      style={{
                        paddingVertical: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: "#F3F4F6",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        {!!c.flagEmoji && (
                          <Text style={{ fontSize: 16, marginRight: 10 }}>{c.flagEmoji}</Text>
                        )}
                        <Text style={{ fontSize: 14, color: "#111827", fontWeight: "600" }}>
                          {c.name}
                        </Text>
                        <Text style={{ fontSize: 12, color: "#9CA3AF", marginLeft: 8 }}>
                          {c.code}
                        </Text>
                      </View>

                      {activeCountryCode === c.code && (
                        <Ionicons name="checkmark" size={18} color="#6C4DFF" />
                      )}
                    </Pressable>
                  ))}
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>
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
            <HeaderTab label="Following" active={activeTopTab === "Following"} onPress={() => setActiveTopTab("Following")} />
            <HeaderTab label="Explore" active={activeTopTab === "Explore"} onPress={() => setActiveTopTab("Explore")} />
            <HeaderTab label="New" active={activeTopTab === "New"} onPress={() => setActiveTopTab("New")} />
            <HeaderTab label="Near" active={activeTopTab === "Near"} onPress={() => setActiveTopTab("Near")} />
          </View>

          <View className="flex-row items-center">
            <Pressable onPress={() => setSearchMode(true)} hitSlop={10}>
              <Ionicons name="search" size={20} color="#111827" />
            </Pressable>
            <Pressable onPress={() => navigation.navigate("Leaderboard")} hitSlop={10}>
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

const HeaderTab: React.FC<{ label: string; active?: boolean; onPress: () => void }> = ({
  label,
  active,
  onPress,
}) => (
  <Pressable onPress={onPress} hitSlop={8}>
    <Text
      className={`mr-4 text-[14px] ${active ? "text-black font-semibold" : "text-gray-400"
        }`}
    >
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
    <Text
      style={{
        fontSize: 13,
        fontWeight: active ? "800" : "600",
        color: active ? "#fff" : "#374151",
      }}
    >
      {label}
    </Text>
    {!!iconRight && (
      <Ionicons
        name={iconRight}
        size={14}
        color={active ? "#fff" : "#6B7280"}
        style={{ marginLeft: 6 }}
      />
    )}
  </Pressable>
);

const RoomCard: React.FC<{
  item: ExploreItem;
  onPress?: () => void;
}> = ({ item, onPress }) => {
  return (
    <Pressable onPress={onPress} style={{ width: "48%", marginBottom: 12 }}>
      <View style={{ height: 170, borderRadius: 18, overflow: "hidden" }}>
        <ImageBackground
          source={
            item.avatarUrl
              ? { uri: item.avatarUrl }
              : require("../../assets/placeholder-image.jpeg")
          }
          resizeMode="cover"
          style={{ flex: 1 }}
        >
          {/* top badges */}
          <View style={{ position: "absolute", left: 8, top: 8 }}>
            <View
              style={{
                backgroundColor: "rgba(0,0,0,0.45)",
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 999,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Image
                source={require("../../assets/king.png")}
                resizeMode="contain"
                style={{ width: 14, height: 14, marginRight: 6 }}
              />
              <Text style={{ color: "#fff", fontSize: 11, fontWeight: "800" }}>
                Region No.16
              </Text>
            </View>
          </View>

          {/* live pill (image like figma) */}
          {item.isLive && (
            <Image
              source={require("../../assets/live.png")}
              resizeMode="contain"
              style={{ position: "absolute", right: 8, top: 8, width: 64, height: 26 }}
            />
          )}

          {/* bottom gradient */}
          <LinearGradient
            colors={["rgba(0,0,0,0.7)", "rgba(0,0,0,0.05)"]}
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0 }}
            style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 80 }}
          />

          {/* bottom info */}
          <View style={{ position: "absolute", left: 10, right: 10, bottom: 10 }}>
            <View
              style={{
                alignSelf: "flex-start",
                backgroundColor: "rgba(255,255,255,0.18)",
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 999,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              {!!item.countryFlag && (
                <Text style={{ marginRight: 6, fontSize: 12, color: "#fff" }}>
                  {item.countryFlag}
                </Text>
              )}
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#fff" }}>
                Fun Live
              </Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6, justifyContent: "space-between" }}>
              <Text style={{ color: "#fff", fontSize: 13, fontWeight: "800", flex: 1 }} numberOfLines={1}>
                {item.displayName}
              </Text>

              <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 11, fontWeight: "700", marginLeft: 8 }}>
                {item.id.slice(0, 6)}
              </Text>
            </View>

            {item.liveViewers > 0 && (
              <Text style={{ marginTop: 2, color: "rgba(255,255,255,0.85)", fontSize: 11 }}>
                👀 {item.liveViewers}
              </Text>
            )}
          </View>
        </ImageBackground>
      </View>
    </Pressable>
  );
};

export default ExploreScreen;
