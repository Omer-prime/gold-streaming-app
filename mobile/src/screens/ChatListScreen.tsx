// src/screens/ChatListScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ChatStackParamList } from "../navigation/ChatStackNavigator";

type Nav = NativeStackNavigationProp<ChatStackParamList, "ChatList">;

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://192.168.10.25:3000";

type ConversationItem = {
  threadId: string;
  otherUserId: string;
  otherUsername: string;
  otherNickname: string | null;
  otherAvatarUrl: string | null;
  lastMessageText: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
};

const ChatListScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [items, setItems] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasUser, setHasUser] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const userId = await AsyncStorage.getItem("gl_user_id");
        if (!userId) {
          setHasUser(false);
          setLoading(false);
          return;
        }

        const res = await fetch(
          `${API_BASE_URL}/api/chat/conversations?userId=${encodeURIComponent(
            userId
          )}`
        );

        if (!res.ok) {
          console.log("conversations load failed", res.status);
          setLoading(false);
          return;
        }

        const json = (await res.json()) as { threads: ConversationItem[] };
        setItems(json.threads ?? []);
      } catch (e) {
        console.error("load conversations error", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const openChat = (item: ConversationItem) => {
    navigation.navigate("ChatRoom", {
      userId: item.otherUserId,
      userName: item.otherNickname || item.otherUsername,
    });
  };

  const formatTime = (iso: string | null) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (!hasUser) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-[16px] font-semibold text-black mb-2">
            You&apos;re logged out
          </Text>
          <Text className="text-[12px] text-gray-500 text-center">
            Please log in again to view your messages.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-1 px-4 pt-4">
        {/* Header */}
        <View className="mb-6 flex-row items-center justify-between">
          <Text className="text-[22px] font-bold text-black">Message</Text>
          <View className="flex-row items-center">
            <Pressable>
              <Ionicons name="search" size={20} color="#111827" />
            </Pressable>
            <Pressable className="ml-4">
              <Ionicons name="trophy-outline" size={22} color="#F59E0B" />
            </Pressable>
          </View>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
            <Text className="mt-2 text-xs text-gray-500">
              Loading conversations...
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            {/* Optional Unclaimed gift section */}
            <View className="mb-6">
              <View className="h-20 w-20 items-center justify-center rounded-full self-start border-2 border-[#F97316]">
                <MaterialCommunityIcons
                  name="gift"
                  size={32}
                  color="#F97316"
                />
              </View>
              <Text className="mt-3 text-[13px] font-semibold text-gray-700">
                Unclaimed...
              </Text>
            </View>

            {/* Chats */}
            {items.map((item) => (
              <Pressable
                key={item.threadId}
                onPress={() => openChat(item)}
                className="mb-4 flex-row items-center"
              >
                {/* Avatar (simple colored circle for now) */}
                <View className="h-11 w-11 items-center justify-center rounded-full bg-[#6C4DFF]">
                  <MaterialCommunityIcons
                    name="account"
                    size={22}
                    color="#FFFFFF"
                  />
                </View>

                {/* Text */}
                <View className="ml-3 flex-1">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-[14px] font-semibold text-gray-900">
                      {item.otherNickname || item.otherUsername}
                    </Text>
                    {!!item.lastMessageAt && (
                      <Text className="text-[11px] text-gray-400">
                        {formatTime(item.lastMessageAt)}
                      </Text>
                    )}
                  </View>
                  <View className="flex-row items-center justify-between mt-0.5">
                    <Text
                      className="text-[12px] text-gray-500 flex-1"
                      numberOfLines={1}
                    >
                      {item.lastMessageText || "No messages yet"}
                    </Text>
                    {item.unreadCount > 0 && (
                      <View className="ml-2 h-5 min-w-[18px] px-1 rounded-full bg-red-500 items-center justify-center">
                        <Text className="text-[10px] text-white font-semibold">
                          {item.unreadCount}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </Pressable>
            ))}

            {!loading && items.length === 0 && (
              <Text className="text-center text-[12px] text-gray-400 mt-8">
                No chats yet. Start messaging your friends from their profile.
              </Text>
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

export default ChatListScreen;
