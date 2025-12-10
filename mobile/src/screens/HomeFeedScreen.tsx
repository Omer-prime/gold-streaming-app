// src/screens/HomeFeedScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  Pressable,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { API_BASE_URL } from "../config";

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

type SquareTopic = {
  id: string;
  title: string;
  hotCount: number;
};

type SquarePost = {
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
};

const HomeFeedScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<HomeTopTab>("Following");

  const [countryFilter, setCountryFilter] =
    useState<CountryFilter>("Popular");

  // Following tab data
  const [followingRooms, setFollowingRooms] = useState<PartyRoom[]>([]);
  const [followingLoading, setFollowingLoading] = useState(false);
  const [followingError, setFollowingError] = useState<string | null>(null);

  // Square tab data
  const [squareTopics, setSquareTopics] = useState<SquareTopic[]>([]);
  const [squarePosts, setSquarePosts] = useState<SquarePost[]>([]);
  const [squareLoading, setSquareLoading] = useState(false);
  const [squareError, setSquareError] = useState<string | null>(null);

  /* ---------------------------------------------------------------------- */
  /*  LOAD FOLLOWING FEED (live rooms)                                      */
  /* ---------------------------------------------------------------------- */
  useEffect(() => {
    if (activeTab !== "Following") return;

    let cancelled = false;

    const load = async () => {
      try {
        setFollowingLoading(true);
        setFollowingError(null);

        const userId = await AsyncStorage.getItem("gl_user_id");
        if (!userId) {
          if (!cancelled) {
            setFollowingRooms([]);
          }
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

        const res = await fetch(
          `${API_BASE_URL}/api/feed/home?${params.toString()}`
        );

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
            countryCode: string | null;
            thumbnailUrl: string | null;
          }[];
          nextCursor?: string | null;
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
        if (!cancelled) {
          setFollowingLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [activeTab, countryFilter]);

  /* ---------------------------------------------------------------------- */
  /*  LOAD SQUARE FEED (moments – global feed like Popo Square)             */
  /*  GET /api/profile/moments?limit=20                                     */
  /* ---------------------------------------------------------------------- */
  useEffect(() => {
    if (activeTab !== "Square") return;

    let cancelled = false;

    const load = async () => {
      try {
        setSquareLoading(true);
        setSquareError(null);

        const res = await fetch(
          `${API_BASE_URL}/api/profile/moments?limit=20`
        );

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
          moments: {
            id: string;
            userId: string;
            text: string | null;
            imageUrl: string | null;
            likeCount: number;
            commentCount: number;
            createdAt: string;
            user: {
              id: string;
              nickname: string | null;
              username: string;
              avatarUrl: string | null;
            };
          }[];
        };

        if (!cancelled) {
          const mapped: SquarePost[] = (json.moments || []).map((m) => ({
            id: m.id,
            userId: m.userId,
            userName:
              m.user.nickname && m.user.nickname.trim().length > 0
                ? m.user.nickname
                : m.user.username,
            avatarUrl: m.user.avatarUrl ?? null,
            countryFlag: null, // later: plug from user.country if you want
            text: m.text ?? null,
            imageUrl: m.imageUrl ?? null,
            createdAt: m.createdAt,
            likeCount: m.likeCount ?? 0,
            commentCount: m.commentCount ?? 0,
            isLikedByMe: false, // later when like API is ready
            topicTitle: null, // later: plug Topic.title
          }));

          // topics will come from a dedicated endpoint later – for now empty
          setSquareTopics([]);
          setSquarePosts(mapped);
        }
      } catch (err) {
        console.error("load square feed error", err);
        if (!cancelled) {
          setSquareError("Network error while loading square feed");
          setSquareTopics([]);
          setSquarePosts([]);
        }
      } finally {
        if (!cancelled) {
          setSquareLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-1">
        {/* HEADER */}
        <View className="bg-white px-4 pt-4 pb-3 border-b border-gray-100">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <TopTab
                label="Following"
                active={activeTab === "Following"}
                onPress={() => setActiveTab("Following")}
              />
              <TopTab
                label="Square"
                active={activeTab === "Square"}
                onPress={() => setActiveTab("Square")}
              />
              <TopTab
                label="Video"
                active={activeTab === "Video"}
                onPress={() => setActiveTab("Video")}
              />
            </View>
            <View className="flex-row items-center">
              <Pressable>
                <Ionicons name="search" size={20} color="#111827" />
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
          />
        )}
        {activeTab === "Video" && <VideoFeed />}
      </View>
    </SafeAreaView>
  );
};

/* ---- small top tab button (same style as Party screen) ---- */
const TopTab: React.FC<{
  label: string;
  active?: boolean;
  onPress: () => void;
}> = ({ label, active, onPress }) => (
  <Pressable onPress={onPress} className="mr-6 items-center">
    <Text
      className={`text-[16px] ${
        active ? "text-black font-semibold" : "text-gray-400"
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
    <ScrollView
      className="bg-white"
      contentContainerStyle={{ paddingBottom: 96 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Country chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 mt-3 mb-4"
      >
        <FilterChip
          label="Popular"
          active={countryFilter === "Popular"}
          onPress={() => setCountryFilter("Popular")}
        />
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
          <Text className="text-[13px] text-gray-500">
            No live rooms from people you follow yet.
          </Text>
        </View>
      )}

      {/* Rooms */}
      {rooms.map((room) => (
        <PartyCard
          key={room.id}
          room={room}
          onPress={(r) =>
            navigation.navigate("LiveRoom", {
              streamId: r.id,
              hostId: r.hostId,
            })
          }
        />
      ))}

      {/* Event banner (kept from design) */}
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

/* -------------------------------------------------------------------------- */
/*  SQUARE TAB – “Square” feed like Popo Live                                */
/* -------------------------------------------------------------------------- */

const SquareFeed: React.FC<{
  topics: SquareTopic[];
  posts: SquarePost[];
  loading: boolean;
  error: string | null;
}> = ({ topics, posts, loading, error }) => {
  const navigation = useNavigation<any>();

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1 bg-white"
        contentContainerStyle={{ paddingBottom: 96 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner */}
        <View className="px-4 pt-4">
          <View className="h-28 rounded-2xl bg-[#8B5CF6] px-4 justify-center">
            <Text className="text-white text-[14px] font-semibold">
              FAN CLUB TOPIC EVENT
            </Text>
            <Text className="text-purple-100 text-[11px] mt-1">
              12/11/2025 - 18/11/2025 [UTC+8]
            </Text>
          </View>
        </View>

        {/* Topics row */}
        <View className="mt-4 px-4 flex-row items-center justify-between">
          <Text className="text-[14px] font-semibold text-gray-900">
            Topics
          </Text>
          <Pressable>
            <Text className="text-[13px] text-[#6C4DFF]">More &gt;</Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-2 px-4"
        >
          {topics.map((topic) => (
            <TopicCard
              key={topic.id}
              title={topic.title}
              hotCount={topic.hotCount.toString()}
            />
          ))}
          {topics.length === 0 && (
            <TopicCard title="No topics yet" hotCount="0" />
          )}
        </ScrollView>

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
              No posts yet. Be the first to share something!
            </Text>
          </View>
        )}

        {posts.map((post) => (
          <SquarePostCard key={post.id} post={post} />
        ))}
      </ScrollView>

      {/* Floating camera “Post” button – like Popo Live */}
      <Pressable
        onPress={() => navigation.navigate("PostMoment")}
        className="absolute bottom-6 right-5 h-14 w-14 rounded-full bg-[#FF9800] items-center justify-center shadow-md shadow-black/30"
      >
        <Ionicons name="camera-outline" size={24} color="#FFFFFF" />
      </Pressable>
    </View>
  );
};

const TopicCard: React.FC<{ title: string; hotCount: string }> = ({
  title,
  hotCount,
}) => (
  <View className="mr-3 h-20 w-40 rounded-2xl bg-[#F9FAFB] px-3 py-2 justify-between">
    <View className="flex-row items-center">
      <View className="h-8 w-8 rounded-xl bg-gray-300 mr-2" />
      <Text className="flex-1 text-[12px] font-semibold text-gray-900">
        {title}
      </Text>
    </View>
    <View className="flex-row items-center justify-between mt-1">
      <View className="rounded-full bg-pink-500 px-2 py-0.5">
        <Text className="text-[10px] text-white">HOT</Text>
      </View>
      <Text className="text-[10px] text-gray-500">{hotCount}</Text>
    </View>
  </View>
);

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

const SquarePostCard: React.FC<{ post: SquarePost }> = ({ post }) => {
  const createdLabel = formatTimeAgo(post.createdAt);

  return (
    <View className="mt-5 px-4 pb-4 border-b border-gray-100">
      {/* header */}
      <View className="flex-row items-center">
        <View className="h-10 w-10 rounded-full bg-[#E5E5FF] mr-3 overflow-hidden">
          {post.avatarUrl && (
            <Image
              source={{ uri: post.avatarUrl }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          )}
        </View>
        <View className="flex-1">
          <Text className="text-[14px] font-semibold text-gray-900">
            {post.userName}
          </Text>
          {/* fake online dot (same feel as Popo) */}
          <Text className="text-[10px] text-green-600">● Online</Text>
        </View>
        {post.countryFlag && (
          <Text className="text-[18px]">{post.countryFlag}</Text>
        )}
      </View>

      {/* topic badge if any */}
      {post.topicTitle && (
        <View className="mt-2 self-start rounded-full bg-[#EEF2FF] px-3 py-1">
          <Text className="text-[11px] text-[#4F46E5]">
            #{post.topicTitle}
          </Text>
        </View>
      )}

      {/* text */}
      {post.text && (
        <View className="mt-3">
          <Text className="text-[13px] text-gray-800 leading-5">
            {post.text}
          </Text>
        </View>
      )}

      {/* image */}
      {post.imageUrl && (
        <View className="mt-3 rounded-2xl overflow-hidden bg-gray-200">
          <ImageBackground
            source={{ uri: post.imageUrl }}
            style={{ height: 180 }}
            resizeMode="cover"
          />
        </View>
      )}

      {/* time + actions */}
      <Text className="mt-1 text-[11px] text-gray-500">
        {createdLabel}
      </Text>

      <View className="mt-2 flex-row items-center">
        {/* gift / comments */}
        <Pressable className="mr-6 flex-row items-center">
          <Ionicons name="gift-outline" size={18} color="#F97316" />
          <Text className="ml-1 text-[12px] text-gray-600">
            {post.commentCount}
          </Text>
        </Pressable>

        {/* likes */}
        <Pressable className="flex-row items-center">
          <Ionicons
            name={post.isLikedByMe ? "heart" : "heart-outline"}
            size={18}
            color={post.isLikedByMe ? "#EF4444" : "#6B7280"}
          />
          <Text className="ml-1 text-[12px] text-gray-600">
            {post.likeCount}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

/* -------------------------------------------------------------------------- */
/*  VIDEO TAB (still placeholder)                                            */
/* -------------------------------------------------------------------------- */

const VideoFeed: React.FC = () => {
  return (
    <View className="flex-1 bg-black items-center justify-center">
      <Text className="text-white text-[16px]">Video feed placeholder</Text>
      <Text className="text-gray-400 text-[12px] mt-1 text-center px-8">
        (Backend is ready. Later you can plug in your short-video player here using
        tab="video".)
      </Text>
    </View>
  );
};

export default HomeFeedScreen;
