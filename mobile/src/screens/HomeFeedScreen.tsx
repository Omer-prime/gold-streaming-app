// mobile/src/screens/HomeFeedScreen.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  Pressable,
  ActivityIndicator,
  Image,
  Alert,
  TextInput,
  FlatList,
  Dimensions,
  Share,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { API_BASE_URL } from "../config";
import { Video, ResizeMode } from "expo-av";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

type HomeTopTab = "Following" | "Square" | "Video";
type CountryFilter = "Popular" | "Pakistan" | "Philippines";

type PartyRoom = {
  id: string; // stream id
  hostId: string;
  title: string;
  tag: string;
  viewers: number;
  countryFlag: string;
  thumbnailUrl?: string | null;
};

export type SquareTopic = {
  id: string;
  title: string;
  hotCount: number;
  category?: "DAILY" | "OFFICIAL" | "NORMAL";
};

export type SquarePost = {
  id: string;
  userId: string;
  userName: string;
  avatarUrl: string | null;
  countryFlag: string | null;
  text: string | null;
  imageUrl: string | null;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  isLikedByMe: boolean;
  topicTitle: string | null;
  commentsPreview?: {
    id: string;
    text: string;
    userName: string;
  }[];
};

export type VideoMoment = {
  id: string;
  userId: string;
  userName: string;
  avatarUrl: string | null;
  countryFlag: string | null;
  text: string | null;
  videoUrl: string;
  thumbnailUrl: string | null;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isLikedByMe: boolean;
};

const USER_ID_KEY = "gl_user_id";

// small helper for "x mins ago"
function formatTimeAgo(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const diffMs = Date.now() - d.getTime();
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min${min > 1 ? "s" : ""} ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} h${hr > 1 ? "s" : ""} ago`;
  const days = Math.floor(hr / 24);
  return `${days} d${days > 1 ? "s" : ""} ago`;
}

const HomeFeedScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [activeTab, setActiveTab] = useState<HomeTopTab>("Following");
  const [myUserId, setMyUserId] = useState<string | null>(null);

  const [headerHeight, setHeaderHeight] = useState(0);

  // shared search (Square + Video)
  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounced(searchQuery, 350);

  const [countryFilter, setCountryFilter] = useState<CountryFilter>("Popular");

  // Following tab data
  const [followingRooms, setFollowingRooms] = useState<PartyRoom[]>([]);
  const [followingLoading, setFollowingLoading] = useState(false);
  const [followingError, setFollowingError] = useState<string | null>(null);

  // Square tab data
  const [squareTopics, setSquareTopics] = useState<SquareTopic[]>([]);
  const [squarePosts, setSquarePosts] = useState<SquarePost[]>([]);
  const [squareLoading, setSquareLoading] = useState(false);
  const [squareError, setSquareError] = useState<string | null>(null);

  // Video tab data
  const [videoItems, setVideoItems] = useState<VideoMoment[]>([]);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  const switchTab = (tab: HomeTopTab) => {
    setActiveTab(tab);
    setSearchMode(false);
    setSearchQuery("");
  };

  /* ---------------------------------------------------------------------- */
  /*  LOAD FOLLOWING FEED                                                   */
  /* ---------------------------------------------------------------------- */
  useEffect(() => {
    if (activeTab !== "Following") return;

    let cancelled = false;

    const load = async () => {
      try {
        setFollowingLoading(true);
        setFollowingError(null);

        const userId = await AsyncStorage.getItem(USER_ID_KEY);
        if (!cancelled) setMyUserId(userId);

        if (!userId) {
          if (!cancelled) setFollowingRooms([]);
          return;
        }

        let countryQuery = "all";
        if (countryFilter === "Pakistan") countryQuery = "PK";
        if (countryFilter === "Philippines") countryQuery = "PH";

        const params = new URLSearchParams();
        params.set("tab", "following");
        params.set("userId", userId);
        params.set("limit", "20");
        params.set("country", countryQuery);

        const res = await fetch(`${API_BASE_URL}/api/feed/home?${params.toString()}`);

        if (!res.ok) {
          const json = await res.json().catch(() => null);
          if (!cancelled) {
            setFollowingError(json?.error || "Failed to load following feed");
            setFollowingRooms([]);
          }
          return;
        }

        const json = (await res.json()) as {
          items: {
            streamId: string;
            hostId: string;
            roomTitle: string;
            tag: string;
            viewers: number;
            countryFlag: string | null;
            thumbnailUrl: string | null;
          }[];
        };

        if (!cancelled) {
          const mapped: PartyRoom[] = (json.items || []).map((item) => ({
            id: item.streamId,
            hostId: item.hostId,
            title: item.roomTitle,
            tag: item.tag,
            viewers: item.viewers,
            countryFlag: item.countryFlag ?? "",
            thumbnailUrl: item.thumbnailUrl,
          }));
          setFollowingRooms(mapped);
        }
      } catch (err) {
        console.error("load following feed error", err);
        if (!cancelled) {
          setFollowingError("Network error while loading following feed");
          setFollowingRooms([]);
        }
      } finally {
        if (!cancelled) setFollowingLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [activeTab, countryFilter]);

  /* ---------------------------------------------------------------------- */
  /*  LOAD SQUARE FEED                                                      */
  /* ---------------------------------------------------------------------- */
  useEffect(() => {
    if (activeTab !== "Square") return;

    let cancelled = false;

    const load = async () => {
      try {
        setSquareLoading(true);
        setSquareError(null);

        const storedUserId = await AsyncStorage.getItem(USER_ID_KEY);
        if (!cancelled) setMyUserId(storedUserId);

        const params = new URLSearchParams();
        params.set("tab", "square");
        params.set("limit", "20");
        if (storedUserId) params.set("userId", storedUserId);
        if (debouncedQuery.trim()) params.set("q", debouncedQuery.trim());

        const res = await fetch(`${API_BASE_URL}/api/feed/home?${params.toString()}`);

        if (!res.ok) {
          const json = await res.json().catch(() => null);
          if (!cancelled) {
            setSquareError(json?.error || "Failed to load square feed");
            setSquarePosts([]);
            setSquareTopics([]);
          }
          return;
        }

        const json = (await res.json()) as {
          topics?: { id: string; title: string; hotCount: number; category?: string }[];
          items?: any[];
        };

        if (!cancelled) {
          const mappedTopics: SquareTopic[] = (json.topics || []).map((t) => ({
            id: String(t.id),
            title: String(t.title ?? ""),
            hotCount: typeof t.hotCount === "number" && !isNaN(t.hotCount) ? t.hotCount : 0,
            category:
              t.category === "DAILY" || t.category === "OFFICIAL" || t.category === "NORMAL"
                ? t.category
                : undefined,
          }));

          const mappedPosts: SquarePost[] = (json.items || []).map((m: any) => ({
            id: String(m.id),
            userId: String(m.userId),
            userName: String(m.userName ?? "User"),
            avatarUrl: m.avatarUrl ?? null,
            countryFlag: m.countryFlag ?? null,
            text: m.text ?? null,
            imageUrl: m.imageUrl ?? null,
            createdAt: String(m.createdAt),
            likeCount: typeof m.likeCount === "number" && !isNaN(m.likeCount) ? m.likeCount : 0,
            commentCount:
              typeof m.commentCount === "number" && !isNaN(m.commentCount) ? m.commentCount : 0,
            isLikedByMe: !!m.isLikedByMe,
            topicTitle: m.topicTitle ?? null,
            commentsPreview: Array.isArray(m.commentsPreview)
              ? m.commentsPreview.map((c: any) => ({
                  id: String(c.id),
                  text: typeof c.text === "string" ? c.text : "",
                  userName:
                    typeof c.userName === "string" && c.userName.trim().length > 0 ? c.userName : "User",
                }))
              : [],
          }));

          setSquareTopics(mappedTopics);
          setSquarePosts(mappedPosts);
        }
      } catch (err) {
        console.error("load square feed error", err);
        if (!cancelled) {
          setSquareError("Network error while loading square feed");
          setSquareTopics([]);
          setSquarePosts([]);
        }
      } finally {
        if (!cancelled) setSquareLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [activeTab, debouncedQuery]);

  /* ---------------------------------------------------------------------- */
  /*  LOAD VIDEO FEED                                                       */
  /* ---------------------------------------------------------------------- */
  useEffect(() => {
    if (activeTab !== "Video") return;

    let cancelled = false;

    const load = async () => {
      try {
        setVideoLoading(true);
        setVideoError(null);

        const storedUserId = await AsyncStorage.getItem(USER_ID_KEY);
        if (!cancelled) setMyUserId(storedUserId);

        const params = new URLSearchParams();
        params.set("tab", "video");
        params.set("limit", "30");
        if (storedUserId) params.set("userId", storedUserId);
        if (debouncedQuery.trim()) params.set("q", debouncedQuery.trim());

        const res = await fetch(`${API_BASE_URL}/api/feed/home?${params.toString()}`);

        if (!res.ok) {
          const json = await res.json().catch(() => null);
          if (!cancelled) {
            setVideoError(json?.error || "Failed to load video feed");
            setVideoItems([]);
          }
          return;
        }

        const json = (await res.json()) as { items?: any[] };

        if (!cancelled) {
          const mapped: VideoMoment[] = (json.items || []).map((m: any) => ({
            id: String(m.id),
            userId: String(m.userId),
            userName: String(m.userName ?? "User"),
            avatarUrl: m.avatarUrl ?? null,
            countryFlag: m.countryFlag ?? null,
            text: m.text ?? null,
            videoUrl: String(m.videoUrl ?? ""),
            thumbnailUrl: m.thumbnailUrl ?? null,
            createdAt: String(m.createdAt),
            likeCount: typeof m.likeCount === "number" ? m.likeCount : 0,
            commentCount: typeof m.commentCount === "number" ? m.commentCount : 0,
            shareCount: typeof m.shareCount === "number" ? m.shareCount : 0,
            isLikedByMe: !!m.isLikedByMe,
          }));

          // remove invalid
          setVideoItems(mapped.filter((x) => x.videoUrl.trim().length > 0));
        }
      } catch (err) {
        console.error("load video feed error", err);
        if (!cancelled) {
          setVideoError("Network error while loading video feed");
          setVideoItems([]);
        }
      } finally {
        if (!cancelled) setVideoLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [activeTab, debouncedQuery]);

  const onToggleLikeSquare = async (post: SquarePost) => {
    if (!myUserId) {
      Alert.alert("Login required", "Please login to like posts.");
      return;
    }

    const prevLiked = post.isLikedByMe;
    const prevCount = post.likeCount;
    const nextLiked = !prevLiked;
    const nextCount = Math.max(0, prevCount + (nextLiked ? 1 : -1));

    setSquarePosts((cur) =>
      cur.map((p) => (p.id === post.id ? { ...p, isLikedByMe: nextLiked, likeCount: nextCount } : p))
    );

    try {
      const res = await fetch(`${API_BASE_URL}/api/profile/moments/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ momentId: post.id, userId: myUserId }),
      });

      if (!res.ok) throw new Error("Failed");

      const json = await res.json().catch(() => null);
      const serverLiked = typeof json?.liked === "boolean" ? json.liked : nextLiked;
      const serverCount = typeof json?.likeCount === "number" ? json.likeCount : nextCount;

      setSquarePosts((cur) =>
        cur.map((p) =>
          p.id === post.id ? { ...p, isLikedByMe: serverLiked, likeCount: Math.max(0, serverCount) } : p
        )
      );
    } catch (e) {
      console.error("square like error", e);
      setSquarePosts((cur) =>
        cur.map((p) => (p.id === post.id ? { ...p, isLikedByMe: prevLiked, likeCount: prevCount } : p))
      );
    }
  };

  const onToggleLikeVideo = async (item: VideoMoment) => {
    if (!myUserId) {
      Alert.alert("Login required", "Please login to like videos.");
      return;
    }

    const prevLiked = item.isLikedByMe;
    const prevCount = item.likeCount;
    const nextLiked = !prevLiked;
    const nextCount = Math.max(0, prevCount + (nextLiked ? 1 : -1));

    setVideoItems((cur) =>
      cur.map((v) => (v.id === item.id ? { ...v, isLikedByMe: nextLiked, likeCount: nextCount } : v))
    );

    try {
      const res = await fetch(`${API_BASE_URL}/api/profile/moments/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ momentId: item.id, userId: myUserId }),
      });

      if (!res.ok) throw new Error("Failed");

      const json = await res.json().catch(() => null);
      const serverLiked = typeof json?.liked === "boolean" ? json.liked : nextLiked;
      const serverCount = typeof json?.likeCount === "number" ? json.likeCount : nextCount;

      setVideoItems((cur) =>
        cur.map((v) =>
          v.id === item.id ? { ...v, isLikedByMe: serverLiked, likeCount: Math.max(0, serverCount) } : v
        )
      );
    } catch (e) {
      console.error("video like error", e);
      setVideoItems((cur) =>
        cur.map((v) => (v.id === item.id ? { ...v, isLikedByMe: prevLiked, likeCount: prevCount } : v))
      );
    }
  };

  const isVideoHeader = activeTab === "Video";

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-1">
        {/* HEADER */}
        <View
          onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
          className={`${isVideoHeader ? "bg-black" : "bg-white"} px-4 pt-4 pb-3 border-b ${
            isVideoHeader ? "border-black" : "border-gray-100"
          }`}
        >
          {searchMode && (activeTab === "Square" || activeTab === "Video") ? (
            <View
              className={`flex-row items-center rounded-full px-3 py-2 ${
                isVideoHeader ? "bg-white/10" : "bg-gray-100"
              }`}
            >
              <Ionicons name="search" size={18} color={isVideoHeader ? "#E5E7EB" : "#6B7280"} />
              <TextInput
                placeholder={activeTab === "Square" ? "Search posts, topics, users" : "Search videos, users"}
                placeholderTextColor={isVideoHeader ? "#9CA3AF" : "#9CA3AF"}
                value={searchQuery}
                onChangeText={setSearchQuery}
                className={`flex-1 ml-2 text-[14px] ${isVideoHeader ? "text-white" : "text-black"}`}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={18} color={isVideoHeader ? "#9CA3AF" : "#9CA3AF"} />
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
                <TopTab
                  label="Following"
                  active={activeTab === "Following"}
                  onPress={() => switchTab("Following")}
                  dark={isVideoHeader}
                />
                <TopTab
                  label="Square"
                  active={activeTab === "Square"}
                  onPress={() => switchTab("Square")}
                  dark={isVideoHeader}
                />
                <TopTab
                  label="Video"
                  active={activeTab === "Video"}
                  onPress={() => switchTab("Video")}
                  dark={isVideoHeader}
                />
              </View>
              <View className="flex-row items-center">
                <Pressable
                  onPress={() => {
                    if (activeTab === "Following") return;
                    setSearchMode(true);
                  }}
                >
                  <Ionicons name="search" size={20} color={isVideoHeader ? "#FFFFFF" : "#111827"} />
                </Pressable>
                <Pressable>
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

        {/* BODY */}
        {activeTab === "Following" && (
          <FollowingFeed
            rooms={followingRooms}
            loading={followingLoading}
            error={followingError}
            countryFilter={countryFilter}
            setCountryFilter={setCountryFilter}
          />
        )}

        {activeTab === "Square" && (
          <SquareFeed
            topics={squareTopics}
            posts={squarePosts}
            loading={squareLoading}
            error={squareError}
            myUserId={myUserId}
            onUpdatePosts={setSquarePosts}
            searchActive={debouncedQuery.trim().length > 0}
            onToggleLike={onToggleLikeSquare}
          />
        )}

        {activeTab === "Video" && (
          <VideoFeed
            headerHeight={headerHeight}
            items={videoItems}
            loading={videoLoading}
            error={videoError}
            onToggleLike={onToggleLikeVideo}
            onOpenComments={(momentId: string, ownerName: string) => {
              navigation.navigate("Profile", {
                screen: "MomentComments",
                params: { momentId, ownerName },
              });
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

/* ---- small top tab button ---- */
const TopTab: React.FC<{
  label: string;
  active?: boolean;
  onPress: () => void;
  dark?: boolean;
}> = ({ label, active, onPress, dark }) => (
  <Pressable onPress={onPress} className="mr-6 items-center">
    <Text
      className={`text-[16px] ${
        active
          ? dark
            ? "text-white font-semibold"
            : "text-black font-semibold"
          : dark
          ? "text-gray-500"
          : "text-gray-400"
      }`}
    >
      {label}
    </Text>
    {active && <View className="mt-1 h-0.5 w-8 rounded-full bg-[#6C4DFF]" />}
  </Pressable>
);

/* -------------------------------------------------------------------------- */
/*  FOLLOWING TAB                                                             */
/* -------------------------------------------------------------------------- */

const FollowingFeed: React.FC<{
  rooms: PartyRoom[];
  loading: boolean;
  error: string | null;
  countryFilter: CountryFilter;
  setCountryFilter: (val: CountryFilter) => void;
}> = ({ rooms, loading, error, countryFilter, setCountryFilter }) => {
  const navigation = useNavigation<any>();

  return (
    <ScrollView className="bg-white" contentContainerStyle={{ paddingBottom: 96 }} showsVerticalScrollIndicator={false}>
      {/* Country chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 mt-3 mb-4">
        <FilterChip label="Popular" active={countryFilter === "Popular"} onPress={() => setCountryFilter("Popular")} />
        <FilterChip
          label="Pakistan"
          flag="🇵🇰"
          active={countryFilter === "Pakistan"}
          onPress={() => setCountryFilter("Pakistan")}
        />
        <FilterChip
          label="Philippines"
          flag="🇵🇭"
          active={countryFilter === "Philippines"}
          onPress={() => setCountryFilter("Philippines")}
        />
        <FilterChip label="More" iconRight="chevron-forward" />
      </ScrollView>

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

      {!loading && !error && rooms.length === 0 && (
        <View className="px-4 mt-4">
          <Text className="text-[13px] text-gray-500">No live rooms from people you follow yet.</Text>
        </View>
      )}

      {rooms.map((room) => (
        <PartyCard
          key={room.id}
          room={room}
          onPress={(r) => navigation.navigate("LiveRoom", { streamId: r.id, hostId: r.hostId })}
        />
      ))}

      {rooms.length > 0 && <EventBanner />}
    </ScrollView>
  );
};

const FilterChip: React.FC<{
  label: string;
  active?: boolean;
  flag?: string;
  iconRight?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}> = ({ label, active, flag, iconRight, onPress }) => (
  <Pressable
    onPress={onPress}
    className={`mr-2 flex-row items-center rounded-full px-4 py-2 ${active ? "bg-[#6C4DFF]" : "bg-gray-100"}`}
  >
    {flag && <Text className="mr-1 text-[13px]">{flag}</Text>}
    <Text className={`text-[13px] ${active ? "text-white font-semibold" : "text-gray-700"}`}>{label}</Text>
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

      <Text className="mt-1 text-[10px] text-gray-400">·{room.viewers.toString()}</Text>
    </View>
  </Pressable>
);

const EventBanner: React.FC = () => (
  <View className="px-4 my-3">
    <View className="h-24 rounded-2xl bg-[#8B5CF6] px-4 justify-center">
      <Text className="text-[13px] text-white font-semibold">FAN CLUB TOPIC EVENT</Text>
      <Text className="text-[11px] text-purple-100 mt-1">12/11/2025 - 18/11/2025 [UTC+8]</Text>
    </View>
  </View>
);

/* -------------------------------------------------------------------------- */
/*  SQUARE TAB                                                                */
/* -------------------------------------------------------------------------- */

const SquareFeed: React.FC<{
  topics: SquareTopic[];
  posts: SquarePost[];
  loading: boolean;
  error: string | null;
  myUserId: string | null;
  onUpdatePosts: React.Dispatch<React.SetStateAction<SquarePost[]>>;
  searchActive: boolean;
  onToggleLike: (post: SquarePost) => void;
}> = ({ topics, posts, loading, error, myUserId, onUpdatePosts, searchActive, onToggleLike }) => {
  const navigation = useNavigation<any>();

  const handlePressProfile = (userId: string) => {
    navigation.navigate("Profile", {
      screen: "VisitProfile",
      params: { userId },
    });
  };

  const handleOpenComments = (post: SquarePost) => {
    navigation.navigate("Profile", {
      screen: "MomentComments",
      params: { momentId: post.id, ownerName: post.userName },
    });
  };

  const topicsPreview = useMemo(() => topics.slice(0, 3), [topics]);
  const hasMoreTopics = topics.length > 3;

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 bg-white" contentContainerStyle={{ paddingBottom: 96 }} showsVerticalScrollIndicator={false}>
        {!searchActive && <EventBanner />}

        {/* Hot topics header */}
        {!searchActive && (
          <View className="px-4 pt-2 flex-row items-center justify-between">
            <Text className="text-[14px] font-semibold text-gray-900">Hot topics</Text>

            {hasMoreTopics && (
              <Pressable onPress={() => navigation.navigate("HotTopics")}>
                <Text className="text-[13px] text-[#6C4DFF]">More &gt;</Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Topics row (ONLY 3) */}
        {!searchActive && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2 px-4">
            {topicsPreview.map((topic) => (
              <TopicCard
                key={topic.id}
                title={topic.title}
                hotCount={topic.hotCount.toString()}
                onPress={() =>
                  navigation.navigate("TopicDetail", {
                    topicId: topic.id,
                    topicTitle: topic.title,
                  })
                }
              />
            ))}

            {topics.length === 0 && <TopicCard title="No topics yet" hotCount="0" />}
          </ScrollView>
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

        {!loading && !error && posts.length === 0 && (
          <View className="px-4 mt-4">
            <Text className="text-[13px] text-gray-500">
              {searchActive ? "No results found." : "No posts yet. Be the first to share something!"}
            </Text>
          </View>
        )}

        {posts.map((post) => (
          <SquarePostCard
            key={post.id}
            post={post}
            onPressProfile={handlePressProfile}
            onPressComments={handleOpenComments}
            onToggleLike={onToggleLike}
          />
        ))}
      </ScrollView>

      {/* Floating camera “Post” button */}
      <Pressable
        onPress={() =>
          navigation.navigate("Profile", {
            screen: "PostMoment",
          })
        }
        className="absolute bottom-6 right-5 h-14 w-14 rounded-full bg-[#FF9800] items-center justify-center shadow-md shadow-black/30"
      >
        {/* if you add assets/ui/cam.png, replace Ionicons below */}
        <Ionicons name="camera-outline" size={24} color="#FFFFFF" />
      </Pressable>
    </View>
  );
};

const TopicCard: React.FC<{
  title: string;
  hotCount: string;
  onPress?: () => void;
}> = ({ title, hotCount, onPress }) => (
  <Pressable className="mr-3 h-20 w-40 rounded-2xl bg-[#F9FAFB] px-3 py-2 justify-between" onPress={onPress}>
    <View className="flex-row items-center">
      <View className="h-8 w-8 rounded-xl bg-gray-300 mr-2" />
      <Text className="flex-1 text-[12px] font-semibold text-gray-900" numberOfLines={2}>
        {title}
      </Text>
    </View>
    <View className="flex-row items-center justify-between mt-1">
      <View className="rounded-full bg-pink-500 px-2 py-0.5">
        <Text className="text-[10px] text-white">HOT</Text>
      </View>
      <Text className="text-[10px] text-gray-500">{hotCount}</Text>
    </View>
  </Pressable>
);

type SquarePostCardProps = {
  post: SquarePost;
  onPressProfile?: (userId: string) => void;
  onPressComments?: (post: SquarePost) => void;
  onToggleLike?: (post: SquarePost) => void;
};

export const SquarePostCard: React.FC<SquarePostCardProps> = ({
  post,
  onPressProfile,
  onPressComments,
  onToggleLike,
}) => {
  const createdLabel = formatTimeAgo(post.createdAt);

  return (
    <View className="mt-5 px-4 pb-4 border-b border-gray-100">
      {/* header */}
      <View className="flex-row items-center justify-between">
        <Pressable className="flex-row items-center flex-1" onPress={() => onPressProfile?.(post.userId)}>
          <View className="h-10 w-10 rounded-full bg-[#E5E5FF] mr-3 overflow-hidden">
            {post.avatarUrl && (
              <Image source={{ uri: post.avatarUrl }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
            )}
          </View>
          <View className="flex-1">
            <Text className="text-[14px] font-semibold text-gray-900">{post.userName}</Text>
            <Text className="text-[10px] text-green-600">● Online</Text>
          </View>
        </Pressable>

        {post.countryFlag && <Text className="text-[18px] ml-2">{post.countryFlag}</Text>}
      </View>

      {post.topicTitle && (
        <View className="mt-2 self-start rounded-full bg-[#EEF2FF] px-3 py-1">
          <Text className="text-[11px] text-[#4F46E5]">#{post.topicTitle}</Text>
        </View>
      )}

      {post.text && (
        <View className="mt-3">
          <Text className="text-[13px] text-gray-800 leading-5">{post.text}</Text>
        </View>
      )}

      {post.imageUrl && (
        <View className="mt-3 rounded-2xl overflow-hidden bg-gray-200">
          <ImageBackground source={{ uri: post.imageUrl }} style={{ height: 180 }} resizeMode="cover" />
        </View>
      )}

      <Text className="mt-1 text-[11px] text-gray-500">{createdLabel}</Text>

      <View className="mt-2 flex-row items-center">
        <Pressable className="mr-6 flex-row items-center" onPress={() => onPressComments?.(post)}>
          <Ionicons name="chatbubble-ellipses-outline" size={18} color="#6B7280" />
          <Text className="ml-1 text-[12px] text-gray-600">{post.commentCount}</Text>
        </Pressable>

        <Pressable className="flex-row items-center" onPress={() => onToggleLike?.(post)}>
          <Ionicons name={post.isLikedByMe ? "heart" : "heart-outline"} size={18} color={post.isLikedByMe ? "#EF4444" : "#6B7280"} />
          <Text className="ml-1 text-[12px] text-gray-600">{post.likeCount}</Text>
        </Pressable>
      </View>

      {((post.commentsPreview && post.commentsPreview.length > 0) || post.commentCount > 0) && (
        <View className="mt-2">
          {(post.commentsPreview || []).slice(0, 2).map((c) => (
            <Text key={c.id} className="text-[12px] text-gray-800" numberOfLines={2}>
              <Text className="font-semibold">{c.userName}: </Text>
              {c.text}
            </Text>
          ))}

          {post.commentCount > (post.commentsPreview?.length || 0) && (
            <Pressable onPress={() => onPressComments?.(post)} className="mt-1">
              <Text className="text-[12px] text-[#6C4DFF]">View all {post.commentCount} comments</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
};

/* -------------------------------------------------------------------------- */
/*  VIDEO TAB                                                                 */
/* -------------------------------------------------------------------------- */

const VideoFeed: React.FC<{
  headerHeight: number;
  items: VideoMoment[];
  loading: boolean;
  error: string | null;
  onToggleLike: (item: VideoMoment) => void;
  onOpenComments: (momentId: string, ownerName: string) => void;
}> = ({ headerHeight, items, loading, error, onToggleLike, onOpenComments }) => {
  const tabBarHeight = useBottomTabBarHeight();
  const { height: screenH } = Dimensions.get("window");
  const itemHeight = Math.max(200, screenH - headerHeight - tabBarHeight);

  const [activeIndex, setActiveIndex] = useState(0);

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const idx = Math.round(y / itemHeight);
    setActiveIndex(Math.max(0, Math.min(idx, items.length - 1)));
  };

  if (loading && items.length === 0) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator color="#FFFFFF" />
        <Text className="text-gray-400 text-[12px] mt-2">Loading videos...</Text>
      </View>
    );
  }

  if (error && items.length === 0) {
    return (
      <View className="flex-1 bg-black items-center justify-center px-8">
        <Text className="text-red-400 text-[13px] text-center">{error}</Text>
      </View>
    );
  }

  if (!loading && !error && items.length === 0) {
    return (
      <View className="flex-1 bg-black items-center justify-center px-8">
        <Text className="text-gray-300 text-[13px] text-center">No videos yet.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      pagingEnabled
      snapToInterval={itemHeight}
      decelerationRate="fast"
      onMomentumScrollEnd={onScrollEnd}
      renderItem={({ item, index }) => (
        <VideoCard
          height={itemHeight}
          item={item}
          active={index === activeIndex}
          onToggleLike={() => onToggleLike(item)}
          onComment={() => onOpenComments(item.id, item.userName)}
          onShare={async () => {
            try {
              await Share.share({
                message: item.videoUrl,
              });
            } catch {}
          }}
        />
      )}
    />
  );
};

const VideoCard: React.FC<{
  height: number;
  item: VideoMoment;
  active: boolean;
  onToggleLike: () => void;
  onComment: () => void;
  onShare: () => void;
}> = ({ height, item, active, onToggleLike, onComment, onShare }) => {
  const createdLabel = formatTimeAgo(item.createdAt);
  const videoRef = useRef<Video>(null);

  return (
    <View style={{ height }} className="bg-black">
      <Video
        ref={videoRef}
        source={{ uri: item.videoUrl }}
        style={{ width: "100%", height: "100%" }}
        resizeMode={ResizeMode.COVER}
        shouldPlay={active}
        isLooping
        useNativeControls={false}
        posterSource={item.thumbnailUrl ? { uri: item.thumbnailUrl } : undefined}
      />

      {/* Right overlay actions */}
      <View className="absolute right-3 bottom-20 items-center">
        <Pressable className="mb-6 items-center" onPress={() => Alert.alert("Tip", "Gift sending for video can be added next (needs a DB transaction model).")}>
          <Ionicons name="gift-outline" size={28} color="#FDBA74" />
          <Text className="mt-1 text-[11px] text-white">Tip</Text>
        </Pressable>

        <Pressable className="mb-6 items-center" onPress={onToggleLike}>
          <Ionicons name={item.isLikedByMe ? "heart" : "heart-outline"} size={28} color={item.isLikedByMe ? "#EF4444" : "#FFFFFF"} />
          <Text className="mt-1 text-[11px] text-white">{formatCount(item.likeCount)}</Text>
        </Pressable>

        <Pressable className="mb-6 items-center" onPress={onComment}>
          <Ionicons name="chatbubble-outline" size={26} color="#FFFFFF" />
          <Text className="mt-1 text-[11px] text-white">{formatCount(item.commentCount)}</Text>
        </Pressable>

        <Pressable className="items-center" onPress={onShare}>
          <Ionicons name="share-social-outline" size={26} color="#FFFFFF" />
          <Text className="mt-1 text-[11px] text-white">Share</Text>
        </Pressable>
      </View>

      {/* Bottom caption */}
      <View className="absolute left-3 right-16 bottom-6">
        <Text className="text-white text-[14px] font-semibold" numberOfLines={1}>
          {item.userName} {item.countryFlag ? ` ${item.countryFlag}` : ""}
        </Text>

        {item.text ? (
          <Text className="text-gray-200 text-[12px] mt-1" numberOfLines={2}>
            {item.text}
          </Text>
        ) : null}

        <Text className="text-gray-400 text-[11px] mt-1">{createdLabel}</Text>

        {/* Music: phase-1 just show label (video's own audio). Real overlay needs FFmpeg pipeline */}
        <View className="flex-row items-center mt-2">
          <Ionicons name="musical-notes-outline" size={14} color="#E5E7EB" />
          <Text className="ml-1 text-[11px] text-gray-200" numberOfLines={1}>
            Original sound
          </Text>
        </View>
      </View>
    </View>
  );
};

function formatCount(n: number) {
  const num = Math.max(0, Number(n) || 0);
  if (num < 1000) return String(num);
  if (num < 1_000_000) return `${Math.round((num / 1000) * 10) / 10}K`;
  return `${Math.round((num / 1_000_000) * 10) / 10}M`;
}

function useDebounced<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

export default HomeFeedScreen;
