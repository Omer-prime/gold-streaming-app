// src/screens/ChatRoomScreen.tsx
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ChatStackParamList } from "../navigation/ChatStackNavigator";

type Nav = NativeStackNavigationProp<ChatStackParamList, "ChatRoom">;
type ChatRoute = RouteProp<ChatStackParamList, "ChatRoom">;

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://192.168.10.25:3000";

type UiMessage = {
  id: string;
  content: string;
  createdAt: string;
  isMine: boolean;
};

const ChatRoomScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<ChatRoute>();

  const peerUserId = route.params?.userId;
  const userName = route.params?.userName ?? "User";

  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState("");
  const scrollRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const storedId = await AsyncStorage.getItem("gl_user_id");
        if (!storedId) {
          setMyUserId(null);
          setLoading(false);
          return;
        }

        setMyUserId(storedId);

        const res = await fetch(
          `${API_BASE_URL}/api/chat/messages?userId=${encodeURIComponent(
            storedId
          )}&peerId=${encodeURIComponent(peerUserId)}`
        );

        if (!res.ok) {
          console.log("chat messages load failed", res.status);
          setLoading(false);
          return;
        }

        const json = (await res.json()) as { messages: UiMessage[] };
        setMessages(json.messages ?? []);
      } catch (e) {
        console.error("load chat messages error", e);
      } finally {
        setLoading(false);
      }
    };

    if (peerUserId) {
      init();
    }
  }, [peerUserId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollToEnd({ animated: true });
    }
  }, [messages.length]);

  const handleSend = async () => {
    if (!myUserId || !peerUserId) return;
    const trimmed = text.trim();
    if (!trimmed) return;

    setSending(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: myUserId,
          receiverId: peerUserId,
          content: trimmed,
        }),
      });

      if (!res.ok) {
        console.log("send message failed", await res.text());
        setSending(false);
        return;
      }

      const json = await res.json();
      const m = json.message as {
        id: string;
        content: string;
        createdAt: string;
      };

      setMessages((prev) => [
        ...prev,
        {
          id: m.id,
          content: m.content,
          createdAt: m.createdAt,
          isMine: true,
        },
      ]);
      setText("");
    } catch (e) {
      console.error("send message error", e);
    } finally {
      setSending(false);
    }
  };

  if (!myUserId && !loading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-[16px] font-semibold text-black mb-2">
            You&apos;re logged out
          </Text>
          <Text className="text-[12px] text-gray-500 text-center">
            Please login again to use chat.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center border-b border-gray-100 px-4 pt-3 pb-2">
          <Pressable
            onPress={() => navigation.goBack()}
            className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-gray-100"
          >
            <Ionicons name="chevron-back" size={20} color="#111827" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-[16px] font-semibold text-black">
              {userName}
            </Text>
            <Text className="text-[11px] text-gray-400">Online</Text>
          </View>
          <Ionicons
            name="call-outline"
            size={20}
            color="#6C4DFF"
            style={{ marginRight: 16 }}
          />
          <Ionicons name="ellipsis-vertical" size={18} color="#6B7280" />
        </View>

        {/* Messages */}
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
            <Text className="mt-2 text-xs text-gray-500">
              Loading messages...
            </Text>
          </View>
        ) : (
          <ScrollView
            ref={scrollRef}
            className="flex-1 px-4"
            contentContainerStyle={{ paddingVertical: 12 }}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((m) => {
              const bubbleBase =
                "mb-3 max-w-[80%] rounded-2xl px-3 py-2";
              const alignClass = m.isMine ? "self-end" : "self-start";
              const colorClass = m.isMine
                ? "bg-[#6C4DFF]"
                : "bg-gray-100";

              return (
                <View
                  key={m.id}
                  className={`${bubbleBase} ${alignClass} ${colorClass}`}
                >
                  <Text
                    className={`text-[13px] ${
                      m.isMine ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {m.content}
                  </Text>
                </View>
              );
            })}

            {messages.length === 0 && (
              <Text className="text-center text-[12px] text-gray-400 mt-6">
                Say hi to {userName} 👋
              </Text>
            )}
          </ScrollView>
        )}

        {/* Input */}
        <View className="flex-row items-center border-t border-gray-100 bg-white px-3 py-2">
          <Pressable className="mr-2">
            <Ionicons name="add-circle-outline" size={24} color="#6C4DFF" />
          </Pressable>
          <View className="flex-1 flex-row items-center rounded-full bg-gray-100 px-3 py-2">
            <TextInput
              placeholder="Type a message..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 text-[14px] text-gray-900"
              value={text}
              onChangeText={setText}
              editable={!sending}
            />
            <Pressable disabled={sending}>
              <Ionicons name="happy-outline" size={22} color="#9CA3AF" />
            </Pressable>
          </View>
          <Pressable
            className="ml-2"
            onPress={handleSend}
            disabled={sending || !text.trim()}
          >
            <Ionicons
              name="send"
              size={22}
              color={sending || !text.trim() ? "#9CA3AF" : "#6C4DFF"}
            />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ChatRoomScreen;
