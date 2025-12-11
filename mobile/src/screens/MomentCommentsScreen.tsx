// src/screens/MomentCommentsScreen.tsx
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import type {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { API_BASE_URL } from "../config";
import type { ProfileStackParamList } from "../navigation/ProfileStackNavigator";

type CommentUser = {
  id: string;
  userName: string;
  avatarUrl: string | null;
};

type Comment = {
  id: string;
  text: string;
  createdAt: string;
  user: CommentUser;
};

type MomentCommentsNav = NativeStackNavigationProp<
  ProfileStackParamList,
  "MomentComments"
>;
type MomentCommentsRoute = RouteProp<
  ProfileStackParamList,
  "MomentComments"
>;

const MomentCommentsScreen: React.FC = () => {
  const navigation = useNavigation<MomentCommentsNav>();
  const route = useRoute<MomentCommentsRoute>();

  const { momentId, ownerName } = route.params;

  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");

  useEffect(() => {
    AsyncStorage.getItem("gl_user_id")
      .then((id) => setMyUserId(id))
      .catch(() => {});
  }, []);

  const loadComments = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.set("momentId", momentId);
      params.set("limit", "50");

      const res = await fetch(
        `${API_BASE_URL}/api/profile/moments/comments?${params.toString()}`
      );

      if (!res.ok) {
        console.error("load comments error", await res.text());
        return;
      }

      const json = await res.json();
      const mapped: Comment[] = (json.comments || []).map((c: any) => ({
        id: c.id,
        text: c.text,
        createdAt: c.createdAt,
        user: {
          id: c.user?.id,
          userName: c.user?.userName ?? "User",
          avatarUrl: c.user?.avatarUrl ?? null,
        },
      }));

      setComments(mapped);
    } catch (err) {
      console.error("load comments error", err);
    } finally {
      setLoading(false);
    }
  }, [momentId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (!myUserId) return;

    try {
      setSending(true);

      const res = await fetch(
        `${API_BASE_URL}/api/profile/moments/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: myUserId,
            momentId,
            text: trimmed,
          }),
        }
      );

      if (!res.ok) {
        console.error("send comment error", await res.text());
        return;
      }

      const json = await res.json();
      const c = json.comment ?? json?.comment?.comment ?? json;

      if (c) {
        const mapped: Comment = {
          id: c.id,
          text: c.text,
          createdAt: c.createdAt,
          user: {
            id: c.user?.id,
            userName: c.user?.userName ?? "You",
            avatarUrl: c.user?.avatarUrl ?? null,
          },
        };

        setComments((prev) => [...prev, mapped]);
        setInput("");
      }
    } catch (err) {
      console.error("send comment error", err);
    } finally {
      setSending(false);
    }
  };

  const renderItem = ({ item }: { item: Comment }) => (
    <View className="px-4 py-2 flex-row">
      <View className="h-8 w-8 rounded-full bg-gray-200 mr-3" />
      <View className="flex-1">
        <Text className="text-[13px] font-semibold text-gray-900">
          {item.user.userName}
        </Text>
        <Text className="text-[13px] text-gray-800 mt-1">{item.text}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <View className="flex-1">
          {/* Header */}
          <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
            <Pressable
              onPress={() => navigation.goBack()}
              hitSlop={8}
              className="pr-3"
            >
              <Ionicons name="chevron-back" size={22} color="#111827" />
            </Pressable>
            <Text className="text-[16px] font-semibold text-gray-900">
              {ownerName}'s moments
            </Text>
          </View>

          {/* Comments list */}
          {loading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="small" color="#6C4DFF" />
            </View>
          ) : comments.length === 0 ? (
            <View className="flex-1 items-center justify-center px-6">
              <Text className="text-[13px] text-gray-500 text-center">
                No comments yet. Be the first to reply!
              </Text>
            </View>
          ) : (
            <FlatList
              data={comments}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={{ paddingVertical: 8 }}
              keyboardShouldPersistTaps="handled"
            />
          )}

          {/* Input bar – stays above keyboard */}
          <View className="flex-row items-center px-3 py-2 border-t border-gray-200 bg-white">
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Write a comment..."
              placeholderTextColor="#9CA3AF"
              multiline
              className="flex-1 bg-[#F3F4F6] rounded-full px-3 py-2 text-[13px] text-gray-900"
            />
            <Pressable
              onPress={handleSend}
              disabled={sending || !input.trim()}
              className={`ml-2 h-9 w-9 rounded-full items-center justify-center ${
                sending || !input.trim() ? "bg-[#A5B4FC]" : "bg-[#6C4DFF]"
              }`}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Ionicons name="send" size={18} color="#ffffff" />
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default MomentCommentsScreen;
