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
  Modal,
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

type ChatThreadStatus = "REQUESTED" | "ACCEPTED" | "BLOCKED";
type ThreadMeta = {
  id: string;
  status: ChatThreadStatus;
  requestedById: string | null;
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

function navigateToChatNested(navigation: any, payload: any) {
  let nav: any = navigation;
  while (nav) {
    const st = nav.getState?.();
    const routeNames: string[] =
      st?.routeNames ??
      (Array.isArray(st?.routes) ? st.routes.map((r: any) => r.name) : []);

    // Common patterns: "Chat", "Chats", "ChatStack"
    if (routeNames.includes("Chat")) {
      nav.navigate("Chat", payload);
      return true;
    }
    if (routeNames.includes("Chats")) {
      nav.navigate("Chats", payload);
      return true;
    }
    if (routeNames.includes("ChatStack")) {
      nav.navigate("ChatStack", payload);
      return true;
    }

    nav = nav.getParent?.();
  }

  // fallback attempt
  try {
    navigation.navigate("ChatRoom" as never, payload as never);
    return true;
  } catch {
    return false;
  }
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

  // Block feature state (full block)
  const [blockChecked, setBlockChecked] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);

  // ✅ NEW: custom popup (no Alert for menu)
  const [optionsOpen, setOptionsOpen] = useState(false);

  // ✅ NEW: confirm modal for block (no Alert)
  const [confirmBlockOpen, setConfirmBlockOpen] = useState(false);

  // ✅ NEW: chat restriction state (chat-only)
  const [threadMeta, setThreadMeta] = useState<ThreadMeta | null>(null);
  const [threadLoading, setThreadLoading] = useState(false);

  const isChatRestricted = threadMeta?.status === "BLOCKED";

  useEffect(() => {
    AsyncStorage.getItem("gl_user_id")
      .then((id) => setMyUserId(id))
      .catch(() => {});
  }, []);

  /* -------------------------------------------------------------------------- */
  /*  CHECK BLOCK STATUS (full block)                                           */
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
  /*  LOAD THREAD META (chat restriction)                                       */
  /* -------------------------------------------------------------------------- */
  const loadThreadMeta = useCallback(async () => {
    if (!myUserId || !targetUserId) {
      setThreadMeta(null);
      return;
    }
    try {
      setThreadLoading(true);
      const url = `${ADMIN_API_BASE_URL}/api/chat/thread?userId=${encodeURIComponent(
        myUserId
      )}&peerId=${encodeURIComponent(targetUserId)}`;

      const res = await fetch(url, { headers: { Accept: "application/json" } });
      const json = await res.json().catch(() => null);

      if (!res.ok) {
        setThreadMeta(null);
        return;
      }

      setThreadMeta(json?.thread ?? null);
    } catch (e) {
      console.error("loadThreadMeta error", e);
      setThreadMeta(null);
    } finally {
      setThreadLoading(false);
    }
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
        commentCount:
          typeof m.commentCount === "number" && !isNaN(m.commentCount) ? m.commentCount : 0,
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
      Alert.alert(t("visitProfile.alerts.blockedTitle"), t("visitProfile.alerts.blockedFollowMsg"));
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
          targetId: followTargetId,
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
  /*  BLOCK / UNBLOCK (full block)                                              */
  /* -------------------------------------------------------------------------- */
  const doBlock = useCallback(async () => {
    if (!myUserId) return;
    if (!profile) return;
    if (myUserId === profile.id) return;

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
  }, [myUserId, profile]);

  const doUnblock = useCallback(async () => {
    if (!myUserId) return;
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

  /* -------------------------------------------------------------------------- */
  /*  RESTRICT / UNRESTRICT (chat-only)                                         */
  /* -------------------------------------------------------------------------- */
  const setRestrict = useCallback(
    async (action: "restrict" | "unrestrict") => {
      if (!myUserId || !profile) return;

      try {
        setThreadLoading(true);

        const res = await fetch(`${ADMIN_API_BASE_URL}/api/chat/thread`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            userId: myUserId,
            peerId: profile.id,
            action,
          }),
        });

        const json = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(json?.error || "Failed");
        }

        setThreadMeta(json?.thread ?? null);
      } catch (e) {
        console.error("restrict/unrestrict error", e);
      } finally {
        setThreadLoading(false);
      }
    },
    [myUserId, profile]
  );

  /* -------------------------------------------------------------------------- */
  /*  OPEN OPTIONS POPUP (no Alert)                                             */
  /* -------------------------------------------------------------------------- */
  const openOptions = useCallback(async () => {
    if (!myUserId) {
      Alert.alert(t("visitProfile.alerts.loginRequired"), t("visitProfile.alerts.loginRequired"));
      return;
    }
    if (!profile) return;

    setOptionsOpen(true);
    // refresh chat meta so Restrict state is correct
    await loadThreadMeta();
  }, [myUserId, profile, loadThreadMeta]);

  const titleName = useMemo(() => profile?.userName ?? t("visitProfile.titleFallback"), [profile]);

  const goToChatRoom = useCallback(() => {
    if (!profile) return;
    if (!myUserId) return;

    if (isBlocked) {
      Alert.alert(t("visitProfile.alerts.blockedTitle"), t("visitProfile.states.blockedBody"));
      return;
    }
    if (isChatRestricted) {
      Alert.alert(t("visitProfile.alerts.errorTitle"), t("visitProfile.menu.restrictedChatMsg"));
      return;
    }

    setOptionsOpen(false);

    const ok = navigateToChatNested(navigation, {
      screen: "ChatRoom",
      params: {
        userId: profile.id,
        userName: profile.userName,
      },
    });

    if (!ok) {
      Alert.alert(t("visitProfile.alerts.navigationErrorTitle"), t("visitProfile.alerts.profileTabMissing"));
    }
  }, [profile, myUserId, navigation, isBlocked, isChatRestricted]);

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
          p.id === post.id ? { ...p, isLikedByMe: !prevLiked, likeCount: nextCount } : p
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
            p.id === post.id ? { ...p, isLikedByMe: serverLiked, likeCount: Math.max(0, serverCount) } : p
          )
        );
      } catch (err) {
        console.error("toggle like error", err);
        // Revert optimistic update
        setPosts((prev) =>
          prev.map((p) => (p.id === post.id ? { ...p, isLikedByMe: prevLiked, likeCount: prevCount } : p))
        );
      }
    },
    [myUserId, isBlocked]
  );

  const OptionRow = ({
    icon,
    label,
    danger,
    onPress,
    disabled,
  }: {
    icon: any;
    label: string;
    danger?: boolean;
    onPress: () => void;
    disabled?: boolean;
  }) => (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{ opacity: disabled ? 0.5 : 1 }}
      className="flex-row items-center px-4 py-3"
    >
      <Ionicons name={icon} size={18} color={danger ? "#EF4444" : "#111827"} />
      <Text className={`ml-3 text-[14px] ${danger ? "text-red-500 font-semibold" : "text-gray-900"}`}>
        {label}
      </Text>
    </Pressable>
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

      <ScrollView
        className="flex-1 bg-white"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
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
                    <Image
                      source={{ uri: profile.avatarUrl }}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="cover"
                    />
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
                  Alert.alert(t("visitProfile.alerts.navigationErrorTitle"), t("visitProfile.alerts.profileTabMissing"));
                }
              }}
              onToggleLike={handleToggleLike}
            />
          ))
        )}
      </ScrollView>

      {/* ✅ Options popup (NO Alert) */}
      <Modal transparent visible={optionsOpen} animationType="fade" onRequestClose={() => setOptionsOpen(false)}>
        <Pressable
          onPress={() => setOptionsOpen(false)}
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)" }}
        >
          <Pressable
            onPress={() => {}}
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl overflow-hidden"
            style={{ paddingBottom: 16 }}
          >
            <View className="px-4 pt-3 pb-2">
              <View className="w-10 h-1.5 bg-gray-200 rounded-full self-center" />
              <Text className="mt-3 text-[13px] text-gray-500">
                {t("visitProfile.menu.title")}
              </Text>
            </View>

            <View className="border-t border-gray-100" />

            <OptionRow
              icon="chatbubble-ellipses-outline"
              label={t("visitProfile.menu.chat")}
              onPress={goToChatRoom}
              disabled={isBlocked || isChatRestricted || threadLoading}
            />

            <View className="border-t border-gray-100" />

            {isChatRestricted ? (
              <OptionRow
                icon="shield-checkmark-outline"
                label={t("visitProfile.menu.unrestrict")}
                onPress={async () => {
                  await setRestrict("unrestrict");
                  setOptionsOpen(false);
                }}
                disabled={threadLoading}
              />
            ) : (
              <OptionRow
                icon="shield-outline"
                label={t("visitProfile.menu.restrict")}
                onPress={async () => {
                  await setRestrict("restrict");
                  setOptionsOpen(false);
                }}
                disabled={threadLoading}
              />
            )}

            <View className="border-t border-gray-100" />

            {isBlocked ? (
              <OptionRow
                icon="unlock-outline"
                label={t("visitProfile.menu.unblock")}
                onPress={async () => {
                  setOptionsOpen(false);
                  await doUnblock();
                }}
                disabled={blockLoading}
              />
            ) : (
              <OptionRow
                icon="ban-outline"
                label={t("visitProfile.menu.block")}
                danger
                onPress={() => {
                  setOptionsOpen(false);
                  setConfirmBlockOpen(true);
                }}
                disabled={blockLoading}
              />
            )}

            <View className="border-t border-gray-100 mt-2" />

            <OptionRow
              icon="close-outline"
              label={t("common.cancel")}
              onPress={() => setOptionsOpen(false)}
            />
          </Pressable>
        </Pressable>
      </Modal>

      {/* ✅ Confirm block popup (NO Alert) */}
      <Modal transparent visible={confirmBlockOpen} animationType="fade" onRequestClose={() => setConfirmBlockOpen(false)}>
        <Pressable
          onPress={() => setConfirmBlockOpen(false)}
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)" }}
          className="items-center justify-center px-6"
        >
          <Pressable onPress={() => {}} className="bg-white w-full rounded-2xl overflow-hidden">
            <View className="px-5 pt-5 pb-3">
              <Text className="text-[16px] font-semibold text-gray-900">
                {t("visitProfile.menu.blockTitle")}
              </Text>
              <Text className="mt-2 text-[13px] text-gray-600">
                {t("visitProfile.menu.blockMsg")}
              </Text>
            </View>

            <View className="border-t border-gray-100" />

            <View className="flex-row">
              <Pressable
                className="flex-1 px-4 py-4 items-center"
                onPress={() => setConfirmBlockOpen(false)}
              >
                <Text className="text-[14px] font-semibold text-gray-700">{t("common.cancel")}</Text>
              </Pressable>

              <View className="w-[1px] bg-gray-100" />

              <Pressable
                className="flex-1 px-4 py-4 items-center"
                onPress={async () => {
                  setConfirmBlockOpen(false);
                  await doBlock();
                }}
              >
                <Text className="text-[14px] font-semibold text-red-500">
                  {t("visitProfile.menu.block")}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default VisitProfileScreen;
