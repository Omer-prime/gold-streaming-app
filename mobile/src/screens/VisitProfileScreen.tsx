// src/screens/VisitProfileScreen.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

import { API_BASE_URL } from "../config";
import { SquarePostCard, type SquarePost } from "./HomeFeedScreen";
import { t } from "../i18n";

type PublicProfile = {
  id: string;
  userName: string;
  avatarUrl: string | null;
  countryFlag: string | null;
  followerCount: number;
  followingCount: number;
  bio: string | null;
  isFollowing: boolean;
};

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

/**
 * ✅ admin-api may be separate. If not provided, falls back to API_BASE_URL.
 * Set EXPO_PUBLIC_ADMIN_API_BASE_URL if needed.
 */
const ADMIN_API_BASE_URL =
  (process.env.EXPO_PUBLIC_ADMIN_API_BASE_URL as string | undefined) ?? API_BASE_URL;

function navigateToProfileNested(navigation: any, payload: any) {
  let nav: any = navigation;
  while (nav) {
    const st = nav.getState?.();
    const routeNames: string[] =
      st?.routeNames ??
      (Array.isArray(st?.routes) ? st.routes.map((r: any) => r.name) : []);

    if (routeNames.includes("Profile")) {
      nav.navigate("Profile", payload);
      return true;
    }
    if (routeNames.includes("ProfileStack")) {
      nav.navigate("ProfileStack", payload);
      return true;
    }
    nav = nav.getParent?.();
  }
  return false;
}

const VisitProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  // ✅ This is the ONLY reliable target id for follow URL
  const targetUserId = String(route.params?.userId ?? "").trim();

  const [myUserId, setMyUserId] = useState<string | null>(null);

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [posts, setPosts] = useState<SquarePost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Block feature state
  const [blockChecked, setBlockChecked] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("gl_user_id")
      .then((id) => setMyUserId(id))
      .catch(() => {});
  }, []);

  /* -------------------------------------------------------------------------- */
  /*  CHECK BLOCK STATUS                                                       */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    let cancelled = false;

    const loadBlockStatus = async () => {
      try {
        setBlockChecked(false);

        if (!myUserId || !targetUserId) {
          if (!cancelled) {
            setIsBlocked(false);
            setBlockChecked(true);
          }
          return;
        }

        const res = await fetch(
          `${ADMIN_API_BASE_URL}/api/settings/blacklist?userId=${encodeURIComponent(myUserId)}`
        );
        const json = await res.json().catch(() => null);

        if (!res.ok) {
          console.error("blacklist GET error", json?.error || (await res.text()));
          if (!cancelled) {
            setIsBlocked(false);
            setBlockChecked(true);
          }
          return;
        }

        const blocks = Array.isArray(json?.blocks) ? json.blocks : [];
        const blocked = blocks.some(
          (b: any) => String(b?.blockedUser?.id) === String(targetUserId)
        );

        if (!cancelled) {
          setIsBlocked(!!blocked);
          setBlockChecked(true);
        }
      } catch (e) {
        console.error("blacklist GET error", e);
        if (!cancelled) {
          setIsBlocked(false);
          setBlockChecked(true);
        }
      }
    };

    loadBlockStatus();
    return () => {
      cancelled = true;
    };
  }, [myUserId, targetUserId]);

  /* -------------------------------------------------------------------------- */
  /*  LOAD PROFILE + POSTS                                                     */
  /* -------------------------------------------------------------------------- */
  const loadProfile = useCallback(async () => {
    try {
      setLoadingProfile(true);

      const viewerId = myUserId ?? (await AsyncStorage.getItem("gl_user_id"));

      const params = new URLSearchParams();
      params.set("userId", targetUserId);
      if (viewerId) params.set("viewerId", viewerId);

      const res = await fetch(`${API_BASE_URL}/api/profile/visit?${params.toString()}`);
      const json = await res.json().catch(() => null);

      if (!res.ok) {
        console.error("visit profile error", json?.error || (await res.text()));
        setProfile(null);
        return;
      }

      const u = json?.user;
      if (!u) {
        setProfile(null);
        return;
      }

      const mapped: PublicProfile = {
        id: String(u.id),
        userName: String(u.userName ?? t("visitProfile.titleFallback")),
        avatarUrl: normalizeMediaUrl(u.avatarUrl ?? null),
        countryFlag: u.countryFlag ?? null,
        followerCount: typeof u.followerCount === "number" ? u.followerCount : 0,
        followingCount: typeof u.followingCount === "number" ? u.followingCount : 0,
        bio: u.bio ?? null,
        isFollowing: !!u.isFollowing,
      };

      setProfile(mapped);
      setIsFollowing(mapped.isFollowing);
    } catch (err) {
      console.error("visit profile error", err);
      setProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  }, [myUserId, targetUserId]);

  const loadPosts = useCallback(async () => {
    try {
      setLoadingPosts(true);

      const params = new URLSearchParams();
      params.set("userId", targetUserId);
      params.set("limit", "20");

      const res = await fetch(`${API_BASE_URL}/api/profile/moments?${params.toString()}`);
      const json = await res.json().catch(() => null);

      if (!res.ok) {
        console.error("profile moments error", json?.error || (await res.text()));
        setPosts([]);
        return;
      }

      const mapped: SquarePost[] = (json?.moments || []).map((m: any) => ({
        id: String(m.id),
        userId: String(m.userId),
        userName:
          m.user?.nickname && String(m.user.nickname).trim().length > 0
            ? String(m.user.nickname)
            : String(m.user?.username ?? t("common.userFallback")),
        avatarUrl: normalizeMediaUrl(m.user?.avatarUrl ?? null),
        countryFlag: m.user?.country?.flagEmoji ?? null,
        text: m.text ?? null,
        imageUrl: normalizeMediaUrl(m.imageUrl ?? null),
        createdAt: String(m.createdAt),
        likeCount: typeof m.likeCount === "number" && !isNaN(m.likeCount) ? m.likeCount : 0,
        commentCount: typeof m.commentCount === "number" && !isNaN(m.commentCount) ? m.commentCount : 0,
        isLikedByMe: !!m.isLikedByMe,
        topicTitle: m.topic?.title ?? null,
        commentsPreview: [],
      }));

      setPosts(mapped);
    } catch (err) {
      console.error("profile moments error", err);
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  }, [targetUserId]);

  useEffect(() => {
    if (!targetUserId) return;
    if (!blockChecked) return;

    if (isBlocked) {
      setLoadingProfile(false);
      setLoadingPosts(false);
      setPosts([]);
      return;
    }

    loadProfile();
    loadPosts();
  }, [targetUserId, blockChecked, isBlocked, loadProfile, loadPosts]);

  /* -------------------------------------------------------------------------- */
  /*  FOLLOW                                                                    */
  /* -------------------------------------------------------------------------- */
 const handleToggleFollow = async () => {
  if (followLoading) return;

  const me = String(myUserId ?? "").trim();
  if (!me) return;

  const followTargetId = String(profile?.id ?? targetUserId ?? "").trim();

  if (!followTargetId) {
    Alert.alert("Error", "Missing target user id.");
    return;
  }

  if (me === followTargetId) return;

  if (isBlocked) {
    Alert.alert(
      t("visitProfile.alerts.blockedTitle"),
      t("visitProfile.alerts.blockedFollowMsg")
    );
    return;
  }

  // optimistic
  const prevFollowing = isFollowing;
  const prevCount = profile?.followerCount ?? 0;

  const nextFollowing = !prevFollowing;
  const nextCount = Math.max(0, prevCount + (nextFollowing ? 1 : -1));

  setIsFollowing(nextFollowing);
  setProfile((prev) => (prev ? { ...prev, followerCount: nextCount } : prev));
  setFollowLoading(true);

  try {
    // ✅ follow lives on admin-api in your setup, so use ADMIN_API_BASE_URL
    const base = String(ADMIN_API_BASE_URL || API_BASE_URL).replace(/\/+$/, "");
    const url = `${base}/api/users/${encodeURIComponent(followTargetId)}/follow`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        userId: me,

        // ✅ IMPORTANT: also send targetId in body (fixes your current error forever)
        targetId: followTargetId,

        // ✅ avoid server “toggle” ambiguity
        action: nextFollowing ? "follow" : "unfollow",
      }),
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(json?.error || `Follow failed (${res.status})`);
    }

    const serverFollowing =
      typeof json?.isFollowing === "boolean" ? json.isFollowing : nextFollowing;

    const serverFollowers =
      typeof json?.followersCount === "number" ? json.followersCount : nextCount;

    setIsFollowing(serverFollowing);
    setProfile((prev) =>
      prev ? { ...prev, followerCount: Math.max(0, serverFollowers) } : prev
    );
  } catch (err) {
    console.error("toggle follow error", err);
    setIsFollowing(prevFollowing);
    setProfile((prev) => (prev ? { ...prev, followerCount: prevCount } : prev));
  } finally {
    setFollowLoading(false);
  }
};


  /* -------------------------------------------------------------------------- */
  /*  BLOCK / UNBLOCK                                                          */
  /* -------------------------------------------------------------------------- */
  const doBlock = useCallback(async () => {
    if (!myUserId) {
      Alert.alert(t("visitProfile.alerts.loginRequired"), t("visitProfile.alerts.loginToBlock"));
      return;
    }
    if (!profile) return;
    if (myUserId === profile.id) return;

    Alert.alert(t("visitProfile.menu.blockTitle"), t("visitProfile.menu.blockMsg"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("visitProfile.menu.block"),
        style: "destructive",
        onPress: async () => {
          try {
            setBlockLoading(true);

            const res = await fetch(`${ADMIN_API_BASE_URL}/api/settings/blacklist`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId: myUserId, target: profile.id }),
            });

            const json = await res.json().catch(() => null);
            if (!res.ok) throw new Error(json?.error || t("visitProfile.errors.blockFailed"));

            setIsBlocked(true);
            setIsFollowing(false);
            setPosts([]);
          } catch (e: any) {
            console.error("block error", e);
            Alert.alert(t("visitProfile.alerts.errorTitle"), String(e?.message || t("visitProfile.errors.blockFailed")));
          } finally {
            setBlockLoading(false);
          }
        },
      },
    ]);
  }, [myUserId, profile]);

  const doUnblock = useCallback(async () => {
    if (!myUserId) {
      Alert.alert(t("visitProfile.alerts.loginRequired"), t("visitProfile.alerts.loginRequired"));
      return;
    }
    if (!profile) return;

    try {
      setBlockLoading(true);

      const res = await fetch(`${ADMIN_API_BASE_URL}/api/settings/blacklist`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: myUserId, blockedUserId: profile.id }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || t("visitProfile.errors.unblockFailed"));

      setIsBlocked(false);
      loadProfile();
      loadPosts();
    } catch (e: any) {
      console.error("unblock error", e);
      Alert.alert(t("visitProfile.alerts.errorTitle"), String(e?.message || t("visitProfile.errors.unblockFailed")));
    } finally {
      setBlockLoading(false);
    }
  }, [myUserId, profile, loadProfile, loadPosts]);

  const openOptions = useCallback(() => {
    if (!myUserId) {
      Alert.alert(t("visitProfile.alerts.loginRequired"), t("visitProfile.alerts.loginRequired"));
      return;
    }
    if (!profile) return;

    const buttons: any[] = [
      { text: t("common.cancel"), style: "cancel" },
      isBlocked
        ? { text: t("visitProfile.menu.unblock"), onPress: doUnblock }
        : { text: t("visitProfile.menu.block"), style: "destructive", onPress: doBlock },
    ];

    Alert.alert(t("visitProfile.menu.title"), "", buttons);
  }, [myUserId, profile, isBlocked, doBlock, doUnblock]);

  const titleName = useMemo(
    () => profile?.userName ?? t("visitProfile.titleFallback"),
    [profile]
  );

  const handleToggleLike = useCallback(
    async (post: SquarePost) => {
      if (!myUserId) {
        Alert.alert(t("visitProfile.alerts.loginRequired"), t("visitProfile.alerts.loginRequired"));
        return;
      }

      if (isBlocked) return;

      // Optimistic update
      const prevLiked = post.isLikedByMe;
      const prevCount = post.likeCount;
      const nextCount = Math.max(0, prevCount + (prevLiked ? -1 : 1));

      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? { ...p, isLikedByMe: !prevLiked, likeCount: nextCount }
            : p
        )
      );

      try {
        const res = await fetch(`${API_BASE_URL}/api/moments/${encodeURIComponent(post.id)}/like`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: myUserId, action: prevLiked ? "unlike" : "like" }),
        });

        const json = await res.json().catch(() => null);
        if (!res.ok) throw new Error(json?.error || "Failed to toggle like");

        const serverLiked = typeof json?.isLikedByMe === "boolean" ? json.isLikedByMe : !prevLiked;
        const serverCount = typeof json?.likeCount === "number" ? json.likeCount : nextCount;

        setPosts((prev) =>
          prev.map((p) =>
            p.id === post.id
              ? { ...p, isLikedByMe: serverLiked, likeCount: Math.max(0, serverCount) }
              : p
          )
        );
      } catch (err) {
        console.error("toggle like error", err);
        // Revert optimistic update
        setPosts((prev) =>
          prev.map((p) =>
            p.id === post.id ? { ...p, isLikedByMe: prevLiked, likeCount: prevCount } : p
          )
        );
      }
    },
    [myUserId, isBlocked]
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} className="pr-3">
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </Pressable>

        <Text className="flex-1 text-[16px] font-semibold text-gray-900" numberOfLines={1}>
          {titleName}
        </Text>

        <Pressable hitSlop={10} onPress={openOptions} disabled={blockLoading}>
          {blockLoading ? (
            <ActivityIndicator size="small" color="#6B7280" />
          ) : (
            <Ionicons name="ellipsis-vertical" size={18} color="#111827" />
          )}
        </Pressable>
      </View>

      <ScrollView className="flex-1 bg-white" contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View className="px-4 pt-4 pb-3">
          {!blockChecked || loadingProfile ? (
            <View className="h-20 items-center justify-center">
              <ActivityIndicator size="small" color="#6C4DFF" />
            </View>
          ) : !profile ? (
            <Text className="text-[13px] text-gray-500">{t("visitProfile.states.notFound")}</Text>
          ) : (
            <View>
              <View className="flex-row items-center">
                <View className="h-14 w-14 rounded-full bg-gray-200 mr-3 overflow-hidden">
                  {profile.avatarUrl && (
                    <Image source={{ uri: profile.avatarUrl }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                  )}
                </View>

                <View className="flex-1">
                  <Text className="text-[16px] font-semibold text-gray-900">{profile.userName}</Text>

                  <Text className="text-[11px] text-gray-500 mt-0.5">
                    {profile.countryFlag ? `${profile.countryFlag} ` : ""}
                    {t("visitProfile.labels.id", { id: profile.id.slice(0, 6) })}
                  </Text>

                  {profile.bio && <Text className="text-[12px] text-gray-700 mt-1">{profile.bio}</Text>}

                  {isBlocked && (
                    <View className="mt-2 self-start rounded-full bg-red-50 px-3 py-1">
                      <Text className="text-[11px] text-red-600 font-semibold">
                        {t("visitProfile.states.blockedChip")}
                      </Text>
                    </View>
                  )}
                </View>

                {myUserId && profile.id !== myUserId && !isBlocked && (
                  <Pressable
                    onPress={handleToggleFollow}
                    disabled={followLoading}
                    className={`ml-3 px-4 py-1.5 rounded-full border ${
                      isFollowing ? "border-gray-300 bg-white" : "border-[#6C4DFF] bg-[#6C4DFF]"
                    }`}
                  >
                    <Text className={`text-[12px] font-semibold ${isFollowing ? "text-gray-800" : "text-white"}`}>
                      {followLoading
                        ? t("visitProfile.actions.pleaseWait")
                        : isFollowing
                        ? t("visitProfile.actions.following")
                        : t("visitProfile.actions.follow")}
                    </Text>
                  </Pressable>
                )}
              </View>

              <View className="mt-3 flex-row">
                <View className="mr-6">
                  <Text className="text-[13px] font-semibold text-gray-900">{profile.followerCount}</Text>
                  <Text className="text-[11px] text-gray-500">{t("visitProfile.labels.followers")}</Text>
                </View>
                <View>
                  <Text className="text-[13px] font-semibold text-gray-900">{profile.followingCount}</Text>
                  <Text className="text-[11px] text-gray-500">{t("visitProfile.labels.following")}</Text>
                </View>
              </View>

              {isBlocked && (
                <View className="mt-4">
                  <Pressable
                    onPress={doUnblock}
                    disabled={blockLoading}
                    className="h-11 rounded-xl bg-[#111827] items-center justify-center"
                  >
                    <Text className="text-white font-semibold">
                      {blockLoading ? t("visitProfile.actions.pleaseWait") : t("visitProfile.actions.unblock")}
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          )}
        </View>

        <View className="mt-1 border-t border-gray-100" />

        {isBlocked ? (
          <View className="py-10 items-center justify-center px-6">
            <Ionicons name="ban-outline" size={28} color="#EF4444" />
            <Text className="mt-3 text-[13px] text-gray-700 text-center">
              {t("visitProfile.states.blockedBody")}
            </Text>
          </View>
        ) : loadingPosts ? (
          <View className="py-6 items-center justify-center">
            <ActivityIndicator size="small" color="#6C4DFF" />
          </View>
        ) : posts.length === 0 ? (
          <View className="py-6 items-center justify-center">
            <Text className="text-[13px] text-gray-500">{t("visitProfile.states.noMoments")}</Text>
          </View>
        ) : (
          posts.map((post) => (
            <SquarePostCard
              key={post.id}
              post={post}
              onPressProfile={() => {}}
              onPressComments={() => {
                const ok = navigateToProfileNested(navigation, {
                  screen: "MomentComments",
                  params: {
                    momentId: post.id,
                    ownerName: profile?.userName ?? post.userName,
                  },
                });

                if (!ok) {
                  Alert.alert(
                    t("visitProfile.alerts.navigationErrorTitle"),
                    t("visitProfile.alerts.profileTabMissing")
                  );
                }
              }}
              onToggleLike={handleToggleLike}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default VisitProfileScreen;
