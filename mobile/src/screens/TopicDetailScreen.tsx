// mobile/src/screens/TopicDetailScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config";
import type { SquarePost } from "./HomeFeedScreen";
import { SquarePostCard } from "./HomeFeedScreen";

type TopicDetailRouteParams = {
  topicId: string;
  topicTitle: string;
};

const USER_ID_KEY = "gl_user_id";

const TopicDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { topicId, topicTitle } = route.params as TopicDetailRouteParams;

  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [posts, setPosts] = useState<SquarePost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const storedUserId = await AsyncStorage.getItem(USER_ID_KEY);
        if (!cancelled) setMyUserId(storedUserId);

        const params = new URLSearchParams();
        params.set("tab", "square");
        params.set("limit", "20");
        params.set("topicId", topicId);
        if (storedUserId) params.set("userId", storedUserId);

        const res = await fetch(`${API_BASE_URL}/api/feed/home?${params.toString()}`);

        if (!res.ok) {
          const json = await res.json().catch(() => null);
          if (!cancelled) {
            setError(json?.error || "Failed to load topic feed");
            setPosts([]);
          }
          return;
        }

        const json = await res.json();

        if (!cancelled) {
          const mappedPosts: SquarePost[] = (json.items || []).map((m: any) => ({
            id: String(m.id),
            userId: String(m.userId),
            userName: String(m.userName ?? "User"),
            avatarUrl: m.avatarUrl ?? null,
            countryFlag: m.countryFlag ?? null,
            text: m.text ?? null,
            imageUrl: m.imageUrl ?? null,
            createdAt: String(m.createdAt),
            likeCount: typeof m.likeCount === "number" ? m.likeCount : 0,
            commentCount: typeof m.commentCount === "number" ? m.commentCount : 0,
            isLikedByMe: !!m.isLikedByMe,
            topicTitle: m.topicTitle ?? null,
            commentsPreview: Array.isArray(m.commentsPreview) ? m.commentsPreview : [],
          }));

          setPosts(mappedPosts);
        }
      } catch (err) {
        console.error("load topic feed error", err);
        if (!cancelled) {
          setError("Network error while loading topic feed");
          setPosts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [topicId]);

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

  const handleToggleLike = async (post: SquarePost) => {
    if (!myUserId) {
      Alert.alert("Login required", "Please login to like posts.");
      return;
    }

    const prevLiked = post.isLikedByMe;
    const prevCount = post.likeCount;
    const nextLiked = !prevLiked;
    const nextCount = Math.max(0, prevCount + (nextLiked ? 1 : -1));

    setPosts((cur) => cur.map((p) => (p.id === post.id ? { ...p, isLikedByMe: nextLiked, likeCount: nextCount } : p)));

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

      setPosts((cur) =>
        cur.map((p) =>
          p.id === post.id
            ? { ...p, isLikedByMe: serverLiked, likeCount: Math.max(0, serverCount) }
            : p
        )
      );
    } catch (err) {
      console.error("toggle like error", err);
      setPosts((cur) => cur.map((p) => (p.id === post.id ? { ...p, isLikedByMe: prevLiked, likeCount: prevCount } : p)));
      Alert.alert("Error", "Unable to like this post right now.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </Pressable>
        <Text className="text-[16px] font-semibold text-gray-900" numberOfLines={1}>
          {topicTitle}
        </Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView className="flex-1 bg-white" contentContainerStyle={{ paddingBottom: 96 }} showsVerticalScrollIndicator={false}>
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
            <Text className="text-[13px] text-gray-500">No moments yet under this topic.</Text>
          </View>
        )}

        {posts.map((post) => (
          <SquarePostCard
            key={post.id}
            post={post}
            onPressProfile={handlePressProfile}
            onPressComments={handleOpenComments}
            onToggleLike={handleToggleLike}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default TopicDetailScreen;
