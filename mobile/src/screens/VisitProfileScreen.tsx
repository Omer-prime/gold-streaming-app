// src/screens/VisitProfileScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import type {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

import { API_BASE_URL } from "../config";
import type { ProfileStackParamList } from "../navigation/ProfileStackNavigator";
import { SquarePostCard } from "./HomeFeedScreen";
import type { SquarePost } from "./HomeFeedScreen";

type VisitProfileNav = NativeStackNavigationProp<
  ProfileStackParamList,
  "VisitProfile"
>;
type VisitProfileRoute = RouteProp<ProfileStackParamList, "VisitProfile">;

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

const VisitProfileScreen: React.FC = () => {
  const navigation = useNavigation<VisitProfileNav>();
  const route = useRoute<VisitProfileRoute>();
  const { userId } = route.params;

  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [posts, setPosts] = useState<SquarePost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("gl_user_id")
      .then((id) => setMyUserId(id))
      .catch(() => {});
  }, []);

  // load profile + moments
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoadingProfile(true);
        const viewerId = await AsyncStorage.getItem("gl_user_id");

        const params = new URLSearchParams();
        params.set("userId", userId);
        if (viewerId) params.set("viewerId", viewerId);

        const res = await fetch(
          `${API_BASE_URL}/api/profile/visit?${params.toString()}`
        );
        if (!res.ok) {
          console.error("visit profile error", await res.text());
          return;
        }
        const json = await res.json();
        const u = json.user;
        if (!u) return;

        setProfile({
          id: u.id,
          userName: u.userName,
          avatarUrl: u.avatarUrl ?? null,
          countryFlag: u.countryFlag ?? null,
          followerCount:
            typeof u.followerCount === "number" ? u.followerCount : 0,
          followingCount:
            typeof u.followingCount === "number" ? u.followingCount : 0,
          bio: u.bio ?? null,
          isFollowing: !!u.isFollowing,
        });
        setIsFollowing(!!u.isFollowing);
      } catch (err) {
        console.error("visit profile error", err);
      } finally {
        setLoadingProfile(false);
      }
    };

    const loadPosts = async () => {
      try {
        setLoadingPosts(true);
        const params = new URLSearchParams();
        params.set("userId", userId);
        params.set("limit", "20");

        const res = await fetch(
          `${API_BASE_URL}/api/profile/moments?${params.toString()}`
        );
        if (!res.ok) {
          console.error("profile moments error", await res.text());
          return;
        }

        const json = await res.json();
        const mapped: SquarePost[] = (json.moments || []).map((m: any) => ({
          id: m.id,
          userId: m.userId,
          userName:
            m.user?.nickname && m.user.nickname.trim().length > 0
              ? m.user.nickname
              : m.user?.username ?? "User",
          avatarUrl: m.user?.avatarUrl ?? null,
          countryFlag: null,
          text: m.text ?? null,
          imageUrl: m.imageUrl ?? null,
          createdAt: m.createdAt,
          likeCount:
            typeof m.likeCount === "number" && !isNaN(m.likeCount)
              ? m.likeCount
              : 0,
          commentCount:
            typeof m.commentCount === "number" && !isNaN(m.commentCount)
              ? m.commentCount
              : 0,
          isLikedByMe: false,
          topicTitle: m.topic?.title ?? null,
          commentsPreview: [], // not needed here
        }));

        setPosts(mapped);
      } catch (err) {
        console.error("profile moments error", err);
      } finally {
        setLoadingPosts(false);
      }
    };

    loadProfile();
    loadPosts();
  }, [userId]);

  const handleOpenComments = (post: SquarePost) => {
    navigation.navigate("MomentComments", {
      momentId: post.id,
      ownerName: profile?.userName ?? post.userName,
    });
  };

  const handleToggleLike = async (post: SquarePost) => {
    if (!myUserId) return;

    const prevLiked = post.isLikedByMe;
    const prevCount = post.likeCount;
    const nextLiked = !prevLiked;
    const nextCount = prevCount + (nextLiked ? 1 : -1);

    setPosts((current) =>
      current.map((p) =>
        p.id === post.id
          ? {
              ...p,
              isLikedByMe: nextLiked,
              likeCount: nextCount < 0 ? 0 : nextCount,
            }
          : p
      )
    );

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/profile/moments/like`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: myUserId, momentId: post.id }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to toggle like");
      }

      const json = await res.json().catch(() => null);
      const liked =
        typeof json?.liked === "boolean" ? json.liked : nextLiked;
      const likeCount =
        typeof json?.likeCount === "number" ? json.likeCount : nextCount;

      setPosts((current) =>
        current.map((p) =>
          p.id === post.id
            ? {
                ...p,
                isLikedByMe: liked,
                likeCount: likeCount < 0 ? 0 : likeCount,
              }
            : p
        )
      );
    } catch (err) {
      console.error("toggle like error (visit profile)", err);
      setPosts((current) =>
        current.map((p) =>
          p.id === post.id
            ? {
                ...p,
                isLikedByMe: prevLiked,
                likeCount: prevCount,
              }
            : p
        )
      );
    }
  };

  const handleToggleFollow = async () => {
    if (!myUserId || !profile) return;
    if (myUserId === profile.id) return;

    const prevFollowing = isFollowing;
    const prevCount = profile.followerCount;

    const nextFollowing = !prevFollowing;
    let nextCount = prevCount + (nextFollowing ? 1 : -1);
    if (nextCount < 0) nextCount = 0;

    setIsFollowing(nextFollowing);
    setProfile((prev) =>
      prev ? { ...prev, followerCount: nextCount } : prev
    );
    setFollowLoading(true);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/profile/follow`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            followerId: myUserId,
            followingId: profile.id,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to toggle follow");

      const json = await res.json().catch(() => null);
      const serverFollowing =
        typeof json?.isFollowing === "boolean"
          ? json.isFollowing
          : nextFollowing;
      const serverCount =
        typeof json?.followerCount === "number"
          ? json.followerCount
          : nextCount;

      setIsFollowing(serverFollowing);
      setProfile((prev) =>
        prev ? { ...prev, followerCount: serverCount } : prev
      );
    } catch (err) {
      console.error("toggle follow error", err);
      setIsFollowing(prevFollowing);
      setProfile((prev) =>
        prev ? { ...prev, followerCount: prevCount } : prev
      );
    } finally {
      setFollowLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={8}
          className="pr-3"
        >
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </Pressable>
        <Text className="text-[16px] font-semibold text-gray-900">
          {profile?.userName ?? "Profile"}
        </Text>
      </View>

      <ScrollView
        className="flex-1 bg-white"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* profile header */}
        <View className="px-4 pt-4 pb-3">
          {loadingProfile ? (
            <View className="h-20 items-center justify-center">
              <ActivityIndicator size="small" color="#6C4DFF" />
            </View>
          ) : !profile ? (
            <Text className="text-[13px] text-gray-500">
              Profile not found.
            </Text>
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
                  <Text className="text-[16px] font-semibold text-gray-900">
                    {profile.userName}
                  </Text>
                  <Text className="text-[11px] text-gray-500 mt-0.5">
                    {profile.countryFlag
                      ? `${profile.countryFlag} `
                      : ""}
                    ID: {profile.id.slice(0, 6)}
                  </Text>
                  {profile.bio && (
                    <Text className="text-[12px] text-gray-700 mt-1">
                      {profile.bio}
                    </Text>
                  )}
                </View>

                {myUserId && profile.id !== myUserId && (
                  <Pressable
                    onPress={handleToggleFollow}
                    disabled={followLoading}
                    className={`ml-3 px-4 py-1.5 rounded-full border ${
                      isFollowing
                        ? "border-gray-300 bg-white"
                        : "border-[#6C4DFF] bg-[#6C4DFF]"
                    }`}
                  >
                    <Text
                      className={`text-[12px] font-semibold ${
                        isFollowing ? "text-gray-800" : "text-white"
                      }`}
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </Text>
                  </Pressable>
                )}
              </View>

              {/* follower / following counts */}
              <View className="mt-3 flex-row">
                <View className="mr-6">
                  <Text className="text-[13px] font-semibold text-gray-900">
                    {profile.followerCount}
                  </Text>
                  <Text className="text-[11px] text-gray-500">
                    Followers
                  </Text>
                </View>
                <View>
                  <Text className="text-[13px] font-semibold text-gray-900">
                    {profile.followingCount}
                  </Text>
                  <Text className="text-[11px] text-gray-500">
                    Following
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* moments */}
        <View className="mt-1 border-t border-gray-100" />

        {loadingPosts ? (
          <View className="py-6 items-center justify-center">
            <ActivityIndicator size="small" color="#6C4DFF" />
          </View>
        ) : posts.length === 0 ? (
          <View className="py-6 items-center justify-center">
            <Text className="text-[13px] text-gray-500">
              No moments yet.
            </Text>
          </View>
        ) : (
          posts.map((post) => (
            <SquarePostCard
              key={post.id}
              post={post}
              onPressProfile={() => {}}
              onPressComments={handleOpenComments}
              onToggleLike={handleToggleLike}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default VisitProfileScreen;
