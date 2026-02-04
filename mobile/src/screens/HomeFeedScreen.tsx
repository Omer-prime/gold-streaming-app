// mobile/src/screens/HomeFeedScreen.tsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
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
  Modal,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { API_BASE_URL } from "../config";
import { Video, ResizeMode, type AVPlaybackStatus } from "expo-av";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { t } from "../i18n";

type HomeTopTab = "Following" | "Square" | "Video";

type Country = {
  id: string;
  code: string;
  name: string;
  flagEmoji: string | null;
};

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
  commentsPreview?: { id: string; text: string; userName: string }[];
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

type SearchUser = {
  id: string;
  username: string;
  nickname: string | null;
  displayName: string;
  avatarUrl: string | null;
  followersCount: number;
  isLive: boolean;
  liveViewers: number;
  countryCode: string | null;
  countryFlag: string | null;
  isFollowing: boolean;
};

const USER_ID_KEY = "gl_user_id";

/** Ensure any "/media/.." becomes "https://domain/media/.." */
function normalizeMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const u = String(url).trim();
  if (!u) return null;

  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  if (u.startsWith("//")) return `https:${u}`;

  const base = String(API_BASE_URL || "").replace(/\/+$/, "");
  if (!base) return u;

  if (u.startsWith("/")) return `${base}${u}`;
  return `${base}/${u}`;
}

// small helper for "x mins ago"
function formatTimeAgo(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const diffMs = Date.now() - d.getTime();
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return t("homeFeed.time.secondsAgo", { count: sec });

  const min = Math.floor(sec / 60);
  if (min < 60) return t("homeFeed.time.minutesAgo", { count: min });

  const hr = Math.floor(min / 60);
  if (hr < 24) return t("homeFeed.time.hoursAgo", { count: hr });

  const days = Math.floor(hr / 24);
  return t("homeFeed.time.daysAgo", { count: days });
}

function useDebounced<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const tt = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(tt);
  }, [value, delayMs]);
  return debounced;
}

function formatCount(n: number) {
  const num = Math.max(0, Number(n) || 0);
  if (num < 1000) return String(num);
  if (num < 1_000_000) return `${Math.round((num / 1000) * 10) / 10}K`;
  return `${Math.round((num / 1_000_000) * 10) / 10}M`;
}

/**
 * ✅ Fix for your warning:
 * Bottom tab route name is "Profile" (NOT "ProfileStack").
 * This helper navigates to that nested stack safely.
 */
function navigateToProfileNested(navigation: any, payload: any) {
  // try parent navigators first (bottom tabs usually live there)
  let nav: any = navigation;
  while (nav) {
    const st = nav.getState?.();
    const routeNames: string[] =
      st?.routeNames ?? (Array.isArray(st?.routes) ? st.routes.map((r: any) => r.name) : []);

    // your app uses "Profile" as the tab name
    if (routeNames.includes("Profile")) {
      nav.navigate("Profile", payload);
      return true;
    }

    // fallback if someone used ProfileStack in tabs
    if (routeNames.includes("ProfileStack")) {
      nav.navigate("ProfileStack", payload);
      return true;
    }

    nav = nav.getParent?.();
  }
  return false;
}

const HomeFeedScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();

  const [activeTab, setActiveTab] = useState<HomeTopTab>("Following");
  const [myUserId, setMyUserId] = useState<string | null>(null);

  const [headerHeight, setHeaderHeight] = useState(0);

  // ✅ search (NOW works for Following too)
  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounced(searchQuery, 350);

  // Countries (admin)
  const [countries, setCountries] = useState<Country[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [countriesErr, setCountriesErr] = useState<string | null>(null);
  const [activeCountryCode, setActiveCountryCode] = useState<string>("popular");

  // User search results
  const [userResults, setUserResults] = useState<SearchUser[]>([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [userSearchErr, setUserSearchErr] = useState<string | null>(null);

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

  useEffect(() => {
    AsyncStorage.getItem(USER_ID_KEY).then((id) => setMyUserId(id)).catch(() => {});
  }, []);

  // ✅ VisitProfile exists in HomeStackNavigator already -> navigate locally (fixes your warning)
 const goUserProfileSmart = useCallback(
  async (userId: string) => {
    const uid = myUserId ?? (await AsyncStorage.getItem(USER_ID_KEY));
    const target = String(userId ?? "").trim();

    if (!target) return;

    // ✅ If it's me -> open Profile tab root (your own profile)
    if (uid && uid === target) {
      // safest: just switch to Profile tab (no nested screen name guessing)
      let nav: any = navigation;
      while (nav) {
        const st = nav.getState?.();
        const routeNames: string[] =
          st?.routeNames ?? (Array.isArray(st?.routes) ? st.routes.map((r: any) => r.name) : []);
        if (routeNames.includes("Profile")) {
          nav.navigate("Profile");
          return;
        }
        nav = nav.getParent?.();
      }
      // last fallback
      navigation.navigate("Profile");
      return;
    }

    // ✅ Other user -> VisitProfile
    navigation.navigate("VisitProfile", { userId: target });
  },
  [navigation, myUserId]
);

  // ✅ MomentComments is inside Profile stack -> navigate via Profile tab
  const goMomentComments = useCallback(
    (momentId: string, ownerName?: string) => {
      const ok = navigateToProfileNested(navigation, {
        screen: "MomentComments",
        params: { momentId, ownerName: ownerName ?? "" },
      });

      if (!ok) {
        Alert.alert(
          "Navigation error",
          "Profile tab not found. Make sure your bottom tabs have a screen named 'Profile'."
        );
      }
    },
    [navigation]
  );

  const switchTab = (tab: HomeTopTab) => {
    setActiveTab(tab);
    setSearchMode(false);
    setSearchQuery("");
    setUserResults([]);
    setUserSearchErr(null);
  };

  const isVideoHeader = activeTab === "Video";

  // ✅ search overlay works in ALL tabs now (Following fixed)
  const showUserSearch = searchMode;

  /* ---------------------------------------------------------------------- */
  /*  LOAD COUNTRIES (admin controlled)                                     */
  /* ---------------------------------------------------------------------- */
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

  /* ---------------------------------------------------------------------- */
  /*  USER SEARCH (NOW: Following + Square + Video)                          */
  /* ---------------------------------------------------------------------- */
  useEffect(() => {
    if (!showUserSearch) return;

    let cancelled = false;

    const load = async () => {
      try {
        setUserSearchErr(null);
        setUserSearchLoading(true);

        const uid = myUserId ?? (await AsyncStorage.getItem(USER_ID_KEY));
        if (!cancelled && uid !== myUserId) setMyUserId(uid);

        const params = new URLSearchParams();
        params.set("q", debouncedQuery.trim());
        if (uid) params.set("userId", uid);
        params.set("limit", "30");

        const res = await fetch(`${API_BASE_URL}/api/search/users?${params.toString()}`);
        const json = await res.json().catch(() => null);

        if (!res.ok) {
          if (!cancelled) {
            setUserResults([]);
            setUserSearchErr(json?.error || "Failed to search users");
          }
          return;
        }

        const items = (json?.items ?? []) as SearchUser[];
        if (!cancelled) setUserResults(Array.isArray(items) ? items : []);
      } catch (e) {
        console.error("user search error", e);
        if (!cancelled) {
          setUserResults([]);
          setUserSearchErr("Network error while searching users");
        }
      } finally {
        if (!cancelled) setUserSearchLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [showUserSearch, debouncedQuery, myUserId]);

  const toggleFollowFromSearch = useCallback(
    async (targetId: string) => {
      const uid = myUserId ?? (await AsyncStorage.getItem(USER_ID_KEY));
      if (!uid) {
        Alert.alert(t("homeFeed.alerts.loginRequiredTitle"), "Login required to follow users.");
        return;
      }
      if (uid === targetId) return;

      // optimistic
      setUserResults((cur) =>
        cur.map((u) => {
          if (u.id !== targetId) return u;
          const next = !u.isFollowing;
          return {
            ...u,
            isFollowing: next,
            followersCount: Math.max(0, (u.followersCount || 0) + (next ? 1 : -1)),
          };
        })
      );

      try {
        const res = await fetch(`${API_BASE_URL}/api/users/${encodeURIComponent(targetId)}/follow`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: uid, action: "toggle" }),
        });

        const json = await res.json().catch(() => null);
        if (!res.ok) throw new Error(json?.error || "Failed");

        const isFollowing = typeof json?.isFollowing === "boolean" ? json.isFollowing : undefined;
        const followersCount = typeof json?.followersCount === "number" ? json.followersCount : undefined;

        setUserResults((cur) =>
          cur.map((u) => {
            if (u.id !== targetId) return u;
            return {
              ...u,
              isFollowing: typeof isFollowing === "boolean" ? isFollowing : u.isFollowing,
              followersCount: typeof followersCount === "number" ? followersCount : u.followersCount,
            };
          })
        );
      } catch (e) {
        // rollback
        setUserResults((cur) =>
          cur.map((u) => {
            if (u.id !== targetId) return u;
            const next = !u.isFollowing;
            return {
              ...u,
              isFollowing: next,
              followersCount: Math.max(0, (u.followersCount || 0) + (next ? 1 : -1)),
            };
          })
        );
      }
    },
    [myUserId]
  );

  /* ---------------------------------------------------------------------- */
  /*  LOAD FOLLOWING FEED                                                   */
  /* ---------------------------------------------------------------------- */
  useEffect(() => {
    if (activeTab !== "Following") return;
    if (searchMode) return; // ✅ don't refetch while searching

    let cancelled = false;

    const load = async () => {
      try {
        setFollowingLoading(true);
        setFollowingError(null);

        const userId = myUserId ?? (await AsyncStorage.getItem(USER_ID_KEY));
        if (!cancelled && userId !== myUserId) setMyUserId(userId);

        if (!userId) {
          if (!cancelled) setFollowingRooms([]);
          return;
        }

        const params = new URLSearchParams();
        params.set("tab", "following");
        params.set("userId", userId);
        params.set("limit", "20");
        params.set("country", activeCountryCode || "popular");

        const res = await fetch(`${API_BASE_URL}/api/feed/home?${params.toString()}`);

        if (!res.ok) {
          const json = await res.json().catch(() => null);
          if (!cancelled) {
            setFollowingError(json?.error || t("homeFeed.following.errors.loadFailed"));
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
            id: String(item.streamId),
            hostId: String(item.hostId),
            title: String(item.roomTitle ?? ""),
            tag: String(item.tag ?? ""),
            viewers: typeof item.viewers === "number" ? item.viewers : 0,
            countryFlag: item.countryFlag ?? "",
            thumbnailUrl: normalizeMediaUrl(item.thumbnailUrl),
          }));
          setFollowingRooms(mapped);
        }
      } catch (err) {
        console.error("load following feed error", err);
        if (!cancelled) {
          setFollowingError(t("homeFeed.following.errors.network"));
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
  }, [activeTab, activeCountryCode, myUserId, searchMode]);

  /* ---------------------------------------------------------------------- */
  /*  LOAD SQUARE FEED                                                      */
  /* ---------------------------------------------------------------------- */
  useEffect(() => {
    if (activeTab !== "Square") return;
    if (searchMode) return;

    let cancelled = false;

    const load = async () => {
      try {
        setSquareLoading(true);
        setSquareError(null);

        const storedUserId = myUserId ?? (await AsyncStorage.getItem(USER_ID_KEY));
        if (!cancelled && storedUserId !== myUserId) setMyUserId(storedUserId);

        const params = new URLSearchParams();
        params.set("tab", "square");
        params.set("limit", "20");
        if (storedUserId) params.set("userId", storedUserId);

        const res = await fetch(`${API_BASE_URL}/api/feed/home?${params.toString()}`);

        if (!res.ok) {
          const json = await res.json().catch(() => null);
          if (!cancelled) {
            setSquareError(json?.error || t("homeFeed.square.errors.loadFailed"));
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
          const mappedTopics: SquareTopic[] = (json.topics || []).map((tt) => ({
            id: String(tt.id),
            title: String(tt.title ?? ""),
            hotCount: typeof tt.hotCount === "number" && !isNaN(tt.hotCount) ? tt.hotCount : 0,
            category:
              tt.category === "DAILY" || tt.category === "OFFICIAL" || tt.category === "NORMAL"
                ? (tt.category as any)
                : undefined,
          }));

          const mappedPosts: SquarePost[] = (json.items || []).map((m: any) => ({
            id: String(m.id),
            userId: String(m.userId),
            userName: String(m.userName ?? t("common.userFallback")),
            avatarUrl: normalizeMediaUrl(m.avatarUrl ?? null),
            countryFlag: m.countryFlag ?? null,
            text: m.text ?? null,
            imageUrl: normalizeMediaUrl(m.imageUrl ?? null),
            createdAt: String(m.createdAt),
            likeCount: typeof m.likeCount === "number" && !isNaN(m.likeCount) ? m.likeCount : 0,
            commentCount: typeof m.commentCount === "number" && !isNaN(m.commentCount) ? m.commentCount : 0,
            isLikedByMe: !!m.isLikedByMe,
            topicTitle: m.topicTitle ?? null,
            commentsPreview: Array.isArray(m.commentsPreview)
              ? m.commentsPreview.map((c: any) => ({
                  id: String(c.id),
                  text: typeof c.text === "string" ? c.text : "",
                  userName:
                    typeof c.userName === "string" && c.userName.trim().length > 0
                      ? c.userName
                      : t("common.userFallback"),
                }))
              : [],
          }));

          setSquareTopics(mappedTopics);
          setSquarePosts(mappedPosts);
        }
      } catch (err) {
        console.error("load square feed error", err);
        if (!cancelled) {
          setSquareError(t("homeFeed.square.errors.network"));
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
  }, [activeTab, searchMode, myUserId]);

  /* ---------------------------------------------------------------------- */
  /*  LOAD VIDEO FEED                                                       */
  /* ---------------------------------------------------------------------- */
  useEffect(() => {
    if (activeTab !== "Video") return;
    if (searchMode) return;

    let cancelled = false;

    const load = async () => {
      try {
        setVideoLoading(true);
        setVideoError(null);

        const storedUserId = myUserId ?? (await AsyncStorage.getItem(USER_ID_KEY));
        if (!cancelled && storedUserId !== myUserId) setMyUserId(storedUserId);

        const params = new URLSearchParams();
        params.set("tab", "video");
        params.set("limit", "30");
        if (storedUserId) params.set("userId", storedUserId);

        const res = await fetch(`${API_BASE_URL}/api/feed/home?${params.toString()}`);

        if (!res.ok) {
          const json = await res.json().catch(() => null);
          if (!cancelled) {
            setVideoError(json?.error || t("homeFeed.video.errors.loadFailed"));
            setVideoItems([]);
          }
          return;
        }

        const json = (await res.json()) as { items?: any[] };

        if (!cancelled) {
          const mapped: VideoMoment[] = (json.items || []).map((m: any) => {
            const vUrl = normalizeMediaUrl(m.videoUrl ?? "") ?? "";
            return {
              id: String(m.id),
              userId: String(m.userId),
              userName: String(m.userName ?? t("common.userFallback")),
              avatarUrl: normalizeMediaUrl(m.avatarUrl ?? null),
              countryFlag: m.countryFlag ?? null,
              text: m.text ?? null,
              videoUrl: vUrl,
              thumbnailUrl: normalizeMediaUrl(m.thumbnailUrl ?? null),
              createdAt: String(m.createdAt),
              likeCount: typeof m.likeCount === "number" ? m.likeCount : 0,
              commentCount: typeof m.commentCount === "number" ? m.commentCount : 0,
              shareCount: typeof m.shareCount === "number" ? m.shareCount : 0,
              isLikedByMe: !!m.isLikedByMe,
            };
          });

          setVideoItems(mapped.filter((x) => x.videoUrl.trim().length > 0));
        }
      } catch (err) {
        console.error("load video feed error", err);
        if (!cancelled) {
          setVideoError(t("homeFeed.video.errors.network"));
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
  }, [activeTab, searchMode, myUserId]);

  const onToggleLikeSquare = async (post: SquarePost) => {
    if (!myUserId) {
      Alert.alert(t("homeFeed.alerts.loginRequiredTitle"), t("homeFeed.alerts.loginToLikePosts"));
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
      setSquarePosts((cur) =>
        cur.map((p) => (p.id === post.id ? { ...p, isLikedByMe: prevLiked, likeCount: prevCount } : p))
      );
    }
  };

  const onToggleLikeVideo = async (item: VideoMoment) => {
    if (!myUserId) {
      Alert.alert(t("homeFeed.alerts.loginRequiredTitle"), t("homeFeed.alerts.loginToLikeVideos"));
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
      setVideoItems((cur) =>
        cur.map((v) => (v.id === item.id ? { ...v, isLikedByMe: prevLiked, likeCount: prevCount } : v))
      );
    }
  };

  // Following countries UI settings
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

  const showMoreCountries = useMemo(() => {
    const shownCodes = new Set(visibleCountries.map((c) => c.code));
    const remaining = countries.filter((c) => !shownCodes.has(c.code));
    return remaining.length > 0;
  }, [countries, visibleCountries]);

  const goVisitProfile = useCallback(
    (userId: string) => {
      goUserProfileSmart(userId);
    },
    [goUserProfileSmart]
  );

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
          {showUserSearch ? (
            <View
              className={`flex-row items-center rounded-full px-3 py-2 ${
                isVideoHeader ? "bg-white/10" : "bg-gray-100"
              }`}
            >
              <Ionicons name="search" size={18} color={isVideoHeader ? "#E5E7EB" : "#6B7280"} />
              <TextInput
                placeholder={t("homeFeed.search.squarePlaceholder")}
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
                className={`flex-1 ml-2 text-[14px] ${isVideoHeader ? "text-white" : "text-black"}`}
                autoFocus
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
                  setUserResults([]);
                  setUserSearchErr(null);
                }}
              >
                <Text className="ml-3 text-[13px] text-[#6C4DFF]">{t("common.cancel")}</Text>
              </Pressable>
            </View>
          ) : (
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <TopTab
                  label={t("homeFeed.tabs.following")}
                  active={activeTab === "Following"}
                  onPress={() => switchTab("Following")}
                  dark={isVideoHeader}
                />
                <TopTab
                  label={t("homeFeed.tabs.square")}
                  active={activeTab === "Square"}
                  onPress={() => switchTab("Square")}
                  dark={isVideoHeader}
                />
                <TopTab
                  label={t("homeFeed.tabs.video")}
                  active={activeTab === "Video"}
                  onPress={() => switchTab("Video")}
                  dark={isVideoHeader}
                />
              </View>

              <View className="flex-row items-center">
                {/* ✅ NOW works on Following too */}
                <Pressable onPress={() => setSearchMode(true)}>
                  <Ionicons
                    name="search"
                    size={20}
                    color={isVideoHeader ? "#FFFFFF" : "#111827"}
                  />
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

        {/* USER SEARCH OVERLAY */}
        {showUserSearch ? (
          <UserSearchResults
            dark={isVideoHeader}
            loading={userSearchLoading}
            error={userSearchErr}
            items={userResults}
            myUserId={myUserId}
            onPressUser={(id) => {
              setSearchMode(false);
              setSearchQuery("");
              setUserResults([]);
              setUserSearchErr(null);
              goVisitProfile(id);
            }}
            onToggleFollow={(id) => toggleFollowFromSearch(id)}
          />
        ) : (
          <>
            {/* BODY */}
            {activeTab === "Following" && (
              <FollowingFeed
                rooms={followingRooms}
                loading={followingLoading}
                error={followingError}
                countries={countries}
                countriesLoading={countriesLoading}
                countriesErr={countriesErr}
                activeCountryCode={activeCountryCode}
                setActiveCountryCode={setActiveCountryCode}
                visibleCountries={visibleCountries}
                showMoreCountries={showMoreCountries}
              />
            )}

            {activeTab === "Square" && (
              <SquareFeed
                topics={squareTopics}
                posts={squarePosts}
                loading={squareLoading}
                error={squareError}
                searchActive={false}
                onToggleLike={onToggleLikeSquare}
                onPressProfile={goVisitProfile}
                onOpenComments={(postId, ownerName) => goMomentComments(postId, ownerName)}
              />
            )}

            {activeTab === "Video" && (
              <VideoFeed
                headerHeight={headerHeight}
                items={videoItems}
                loading={videoLoading}
                error={videoError}
                onToggleLike={onToggleLikeVideo}
                onOpenComments={(momentId, ownerName) => goMomentComments(momentId, ownerName)}
              />
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

/* ---- small top tab button ---- */
const TopTab: React.FC<{ label: string; active?: boolean; onPress: () => void; dark?: boolean }> = ({
  label,
  active,
  onPress,
  dark,
}) => (
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
/*  USER SEARCH RESULTS                                                       */
/* -------------------------------------------------------------------------- */

const UserSearchResults: React.FC<{
  dark?: boolean;
  loading: boolean;
  error: string | null;
  items: SearchUser[];
  myUserId: string | null;
  onPressUser: (id: string) => void;
  onToggleFollow: (id: string) => void;
}> = ({ dark, loading, error, items, myUserId, onPressUser, onToggleFollow }) => {
  const bg = dark ? "bg-black" : "bg-white";
  const textPrimary = dark ? "text-white" : "text-gray-900";
  const textMuted = dark ? "text-gray-300" : "text-gray-500";

  return (
    <View className={`flex-1 ${bg}`}>
      {loading && (
        <View className="px-4 py-4">
          <ActivityIndicator size="small" color={dark ? "#FFFFFF" : "#6C4DFF"} />
          <Text className={`mt-2 text-[12px] ${textMuted}`}>{t("common.loadingText")}</Text>
        </View>
      )}

      {!!error && !loading && (
        <View className="px-4 py-3">
          <Text className="text-[12px] text-red-400">{error}</Text>
        </View>
      )}

      {!loading && !error && items.length === 0 && (
        <View className="px-4 py-3">
          <Text className={`text-[13px] ${textMuted}`}>No users found.</Text>
          <Text className={`text-[11px] mt-1 ${textMuted}`}>Tip: type a username or nickname.</Text>
        </View>
      )}

      <FlatList
        data={items}
        keyExtractor={(u) => u.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => {
          const isMe = !!myUserId && item.id === myUserId;
          return (
            <Pressable onPress={() => onPressUser(item.id)} className="px-4 py-3">
              <View className="flex-row items-center">
                <View className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden">
                  {item.avatarUrl ? (
                    <Image
                      source={{ uri: normalizeMediaUrl(item.avatarUrl) ?? item.avatarUrl }}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="cover"
                    />
                  ) : null}
                </View>

                <View className="flex-1 ml-3">
                  <View className="flex-row items-center">
                    <Text className={`text-[14px] font-semibold ${textPrimary}`} numberOfLines={1}>
                      {item.displayName} {item.countryFlag ? ` ${item.countryFlag}` : ""}
                    </Text>
                    {item.isLive && (
                      <View className="ml-2 rounded-full bg-red-500 px-2 py-0.5">
                        <Text className="text-[10px] text-white font-semibold">LIVE</Text>
                      </View>
                    )}
                  </View>

                  <Text className={`text-[11px] mt-0.5 ${textMuted}`}>
                    @{item.username} • {formatCount(item.followersCount)} followers
                    {item.isLive ? ` • ${formatCount(item.liveViewers)} watching` : ""}
                  </Text>
                </View>

                {!isMe && (
                  <Pressable
                    onPress={() => onToggleFollow(item.id)}
                    className={`px-3 py-1.5 rounded-full border ${
                      item.isFollowing
                        ? dark
                          ? "border-gray-600"
                          : "border-gray-300"
                        : "border-[#6C4DFF] bg-[#6C4DFF]"
                    }`}
                  >
                    <Text
                      className={`text-[12px] font-semibold ${
                        item.isFollowing ? (dark ? "text-white" : "text-gray-800") : "text-white"
                      }`}
                    >
                      {item.isFollowing ? "Following" : "Follow"}
                    </Text>
                  </Pressable>
                )}
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
};

/* -------------------------------------------------------------------------- */
/*  FOLLOWING TAB                                                             */
/* -------------------------------------------------------------------------- */

const FollowingFeed: React.FC<{
  rooms: PartyRoom[];
  loading: boolean;
  error: string | null;

  countries: Country[];
  countriesLoading: boolean;
  countriesErr: string | null;
  activeCountryCode: string;
  setActiveCountryCode: (v: string) => void;

  visibleCountries: Country[];
  showMoreCountries: boolean;
}> = ({
  rooms,
  loading,
  error,
  countries,
  countriesLoading,
  countriesErr,
  activeCountryCode,
  setActiveCountryCode,
  visibleCountries,
  showMoreCountries,
}) => {
  const navigation = useNavigation<any>();

  const [modalOpen, setModalOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");

  const modalCountries = useMemo(() => {
    const q = countrySearch.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter(
      (c) => (c.name || "").toLowerCase().includes(q) || (c.code || "").toLowerCase().includes(q)
    );
  }, [countries, countrySearch]);

  return (
    <ScrollView
      className="bg-white"
      contentContainerStyle={{ paddingBottom: 96 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Country chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 mt-3 mb-2">
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
        {showMoreCountries && (
          <Chip label={t("explore.chips.more")} iconRight="chevron-forward" onPress={() => setModalOpen(true)} />
        )}
      </ScrollView>

      {!!countriesErr && (
        <View className="px-4 pb-2">
          <Text className="text-[11px] text-red-500">{countriesErr}</Text>
        </View>
      )}
      {countriesLoading && (
        <View className="px-4 pb-2">
          <Text className="text-[11px] text-gray-400">{t("explore.states.loadingCountries")}</Text>
        </View>
      )}

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
          <Text className="text-[13px] text-gray-500">{t("homeFeed.following.empty")}</Text>
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

      <CountriesModal
        visible={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setCountrySearch("");
        }}
        countries={modalCountries}
        search={countrySearch}
        setSearch={setCountrySearch}
        activeCountryCode={activeCountryCode}
        onSelect={(code) => {
          setActiveCountryCode(code);
          setModalOpen(false);
          setCountrySearch("");
        }}
      />
    </ScrollView>
  );
};

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

const PartyCard: React.FC<{ room: PartyRoom; onPress?: (room: PartyRoom) => void }> = ({ room, onPress }) => (
  <Pressable
    className="mx-4 mb-3 flex-row rounded-2xl bg-white shadow-sm shadow-black/5 overflow-hidden"
    onPress={() => onPress?.(room)}
  >
    <ImageBackground
      source={
        room.thumbnailUrl ? { uri: room.thumbnailUrl } : require("../../assets/placeholder-image.jpeg")
      }
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
      <Text className="text-[13px] text-white font-semibold">{t("homeFeed.eventBanner.title")}</Text>
      <Text className="text-[11px] text-purple-100 mt-1">{t("homeFeed.eventBanner.dateRange")}</Text>
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
  searchActive: boolean;
  onToggleLike: (post: SquarePost) => void;
  onPressProfile: (userId: string) => void;
  onOpenComments: (momentId: string, ownerName: string) => void;
}> = ({ topics, posts, loading, error, searchActive, onToggleLike, onPressProfile, onOpenComments }) => {
  const navigation = useNavigation<any>();
  const topicsPreview = useMemo(() => topics.slice(0, 3), [topics]);
  const hasMoreTopics = topics.length > 3;

  const openPostMoment = () => {
    const ok = navigateToProfileNested(navigation, { screen: "PostMoment" });
    if (!ok) {
      Alert.alert("Navigation error", "Profile tab not found. Make sure your bottom tabs have a screen named 'Profile'.");
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 bg-white" contentContainerStyle={{ paddingBottom: 96 }} showsVerticalScrollIndicator={false}>
        {!searchActive && <EventBanner />}

        {!searchActive && (
          <View className="px-4 pt-2 flex-row items-center justify-between">
            <Text className="text-[14px] font-semibold text-gray-900">{t("homeFeed.square.hotTopics")}</Text>
            {hasMoreTopics && (
              <Pressable onPress={() => navigation.navigate("HotTopics")}>
                <Text className="text-[13px] text-[#6C4DFF]">{t("homeFeed.square.more")}</Text>
              </Pressable>
            )}
          </View>
        )}

        {!searchActive && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2 px-4">
            {topicsPreview.map((topic) => (
              <TopicCard
                key={topic.id}
                title={topic.title}
                hotCount={topic.hotCount.toString()}
                onPress={() => navigation.navigate("TopicDetail", { topicId: topic.id, topicTitle: topic.title })}
              />
            ))}
            {topics.length === 0 && <TopicCard title={t("homeFeed.square.noTopicsYet")} hotCount="0" />}
          </ScrollView>
        )}

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
              {searchActive ? t("homeFeed.square.emptySearch") : t("homeFeed.square.emptyFeed")}
            </Text>
          </View>
        )}

        {posts.map((post) => (
          <SquarePostCard
            key={post.id}
            post={post}
            onPressProfile={onPressProfile}
            onPressComments={() => onOpenComments(post.id, post.userName)}
            onToggleLike={onToggleLike}
          />
        ))}
      </ScrollView>

      {/* Floating camera “Post” button */}
      <Pressable
        onPress={openPostMoment}
        className="absolute bottom-6 right-5 h-14 w-14 rounded-full bg-[#FF9800] items-center justify-center shadow-md shadow-black/30"
      >
        <Ionicons name="camera-outline" size={24} color="#FFFFFF" />
      </Pressable>
    </View>
  );
};

const TopicCard: React.FC<{ title: string; hotCount: string; onPress?: () => void }> = ({ title, hotCount, onPress }) => (
  <Pressable className="mr-3 h-20 w-40 rounded-2xl bg-[#F9FAFB] px-3 py-2 justify-between" onPress={onPress}>
    <View className="flex-row items-center">
      <View className="h-8 w-8 rounded-xl bg-gray-300 mr-2" />
      <Text className="flex-1 text-[12px] font-semibold text-gray-900" numberOfLines={2}>
        {title}
      </Text>
    </View>
    <View className="flex-row items-center justify-between mt-1">
      <View className="rounded-full bg-pink-500 px-2 py-0.5">
        <Text className="text-[10px] text-white">{t("homeFeed.square.hotBadge")}</Text>
      </View>
      <Text className="text-[10px] text-gray-500">{hotCount}</Text>
    </View>
  </Pressable>
);

// ✅ EXPORT so VisitProfileScreen can import it
export const SquarePostCard: React.FC<{
  post: SquarePost;
  onPressProfile: (userId: string) => void;
  onPressComments: () => void;
  onToggleLike: (post: SquarePost) => void;
}> = ({ post, onPressProfile, onPressComments, onToggleLike }) => {
  const createdLabel = formatTimeAgo(post.createdAt);

  return (
    <View className="mt-5 px-4 pb-4 border-b border-gray-100">
      <View className="flex-row items-center justify-between">
        <Pressable className="flex-row items-center flex-1" onPress={() => onPressProfile(post.userId)}>
          <View className="h-10 w-10 rounded-full bg-[#E5E5FF] mr-3 overflow-hidden">
            {post.avatarUrl && (
              <Image source={{ uri: post.avatarUrl }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
            )}
          </View>
          <View className="flex-1">
            <Text className="text-[14px] font-semibold text-gray-900">{post.userName}</Text>
            <Text className="text-[10px] text-green-600">● {t("profile.labels.online")}</Text>
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
        <Pressable className="mr-6 flex-row items-center" onPress={onPressComments}>
          <Ionicons name="chatbubble-ellipses-outline" size={18} color="#6B7280" />
          <Text className="ml-1 text-[12px] text-gray-600">{post.commentCount}</Text>
        </Pressable>

        <Pressable className="flex-row items-center" onPress={() => onToggleLike(post)}>
          <Ionicons
            name={post.isLikedByMe ? "heart" : "heart-outline"}
            size={18}
            color={post.isLikedByMe ? "#EF4444" : "#6B7280"}
          />
          <Text className="ml-1 text-[12px] text-gray-600">{post.likeCount}</Text>
        </Pressable>
      </View>
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

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 80 });
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<{ index?: number | null }> }) => {
      const first = viewableItems?.find((v) => typeof v.index === "number");
      if (typeof first?.index === "number") setActiveIndex(first.index);
    }
  );

  if (loading && items.length === 0) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator color="#FFFFFF" />
        <Text className="text-gray-400 text-[12px] mt-2">{t("homeFeed.video.states.loadingVideos")}</Text>
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
        <Text className="text-gray-300 text-[13px] text-center">{t("homeFeed.video.states.empty")}</Text>
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
      removeClippedSubviews
      windowSize={5}
      initialNumToRender={2}
      maxToRenderPerBatch={2}
      viewabilityConfig={viewabilityConfig.current}
      onViewableItemsChanged={onViewableItemsChanged.current as any}
      getItemLayout={(_, index) => ({ length: itemHeight, offset: itemHeight * index, index })}
      renderItem={({ item, index }) => (
        <VideoCard
          height={itemHeight}
          item={item}
          active={index === activeIndex}
          onToggleLike={() => onToggleLike(item)}
          onComment={() => onOpenComments(item.id, item.userName)}
          onShare={async () => {
            try {
              await Share.share({ message: item.videoUrl });
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

  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        if (!videoRef.current) return;
        if (active) await videoRef.current.playAsync();
        else await videoRef.current.pauseAsync();
      } catch {}
    };
    run();
  }, [active, item.videoUrl]);

  const onStatus = useCallback((st: AVPlaybackStatus) => {
    if (!st || typeof st !== "object") return;
    if ("isLoaded" in st && st.isLoaded) {
      setLoading(!!st.isBuffering);
      setErrMsg(null);
    } else if ("error" in st && (st as any).error) {
      setLoading(false);
      setErrMsg(String((st as any).error));
    }
  }, []);

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
        usePoster={!!item.thumbnailUrl}
        posterSource={item.thumbnailUrl ? { uri: item.thumbnailUrl } : undefined}
        onLoadStart={() => {
          setLoading(true);
          setErrMsg(null);
        }}
        onError={(e) => {
          setLoading(false);
          setErrMsg(t("homeFeed.video.errors.videoFailed"));
          console.log("VIDEO_ERROR", item.videoUrl, e);
        }}
        onPlaybackStatusUpdate={onStatus}
      />

      {loading && (
        <View className="absolute inset-0 items-center justify-center">
          <ActivityIndicator color="#FFFFFF" />
          <Text className="text-gray-300 text-[12px] mt-2">{t("common.loadingText")}</Text>
        </View>
      )}

      {errMsg && (
        <View className="absolute inset-0 items-center justify-center px-8">
          <Text className="text-red-300 text-[12px] text-center">{errMsg}</Text>
          <Text className="text-gray-400 text-[11px] text-center mt-2">{t("homeFeed.video.errors.debugHint")}</Text>
        </View>
      )}

      <View className="absolute right-3 bottom-20 items-center">
        <Pressable className="mb-6 items-center" onPress={() => Alert.alert(t("homeFeed.video.tip.title"), t("homeFeed.video.tip.msg"))}>
          <Ionicons name="gift-outline" size={28} color="#FDBA74" />
          <Text className="mt-1 text-[11px] text-white">{t("homeFeed.video.tip.label")}</Text>
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
          <Text className="mt-1 text-[11px] text-white">{t("homeFeed.video.actions.share")}</Text>
        </Pressable>
      </View>

      <View className="absolute left-3 right-16 bottom-6">
        <Text className="text-white text-[14px] font-semibold" numberOfLines={1}>
          {item.userName} {item.countryFlag ? ` ${item.countryFlag}` : ""}
        </Text>

        {!!item.text && (
          <Text className="text-gray-200 text-[12px] mt-1" numberOfLines={2}>
            {item.text}
          </Text>
        )}

        <Text className="text-gray-400 text-[11px] mt-1">{createdLabel}</Text>

        <View className="flex-row items-center mt-2">
          <Ionicons name="musical-notes-outline" size={14} color="#E5E7EB" />
          <Text className="ml-1 text-[11px] text-gray-200" numberOfLines={1}>
            {t("homeFeed.video.labels.originalSound")}
          </Text>
        </View>
      </View>
    </View>
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

export default HomeFeedScreen;
