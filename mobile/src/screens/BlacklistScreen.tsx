// src/screens/BlacklistScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "../navigation/ProfileStackNavigator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { t } from "../i18n";

type Nav = NativeStackNavigationProp<ProfileStackParamList, "Blacklist">;



const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://192.168.10.25:3000";

type BlockedUser = {
  id: string; // block id
  blockedId: string;
  blockedUser: {
    id: string;
    username: string;
    nickname?: string | null;
  };
};

const BlacklistScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [search, setSearch] = useState("");
  const [blocked, setBlocked] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const loadBlacklist = async () => {
    try {
      setLoading(true);
      const userId =
        (await AsyncStorage.getItem("gl_user_id")) ??
        (await AsyncStorage.getItem("userId"));

      if (!userId) return;

      const res = await fetch(
        `${API_BASE_URL}/api/settings/blacklist?userId=${encodeURIComponent(
          userId
        )}`
      );
      if (!res.ok) return;
      const json = await res.json();
      setBlocked((json.blocks as BlockedUser[]) ?? []);
    } catch (e) {
      console.error("load blacklist error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlacklist();
  }, []);

  const handleSearchAdd = async () => {
    if (!search.trim()) return;

    try {
      const userId =
        (await AsyncStorage.getItem("gl_user_id")) ??
        (await AsyncStorage.getItem("userId"));

      if (!userId) {
        Alert.alert(t("common.error"), t("errors.userNotFound"));
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/settings/blacklist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, target: search.trim() }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        Alert.alert(t("common.error"), json?.error ?? t("blacklist.errors.addFailed"));
        return;
      }

      setSearch("");
      await loadBlacklist();
    } catch (e) {
      console.error("add blacklist error", e);
      Alert.alert(t("common.error"), t("blacklist.errors.addFailed"));
    }
  };

  const handleRemove = async (blockedUserId: string) => {
    try {
      const userId =
        (await AsyncStorage.getItem("gl_user_id")) ??
        (await AsyncStorage.getItem("userId"));

      if (!userId) return;

      await fetch(`${API_BASE_URL}/api/settings/blacklist`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, blockedUserId }),
      });

      setBlocked((prev) => prev.filter((b) => b.blockedUser.id !== blockedUserId));
    } catch (e) {
      console.error("remove blacklist error", e);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-3 pb-2 border-b border-gray-100">
        <Pressable
          onPress={() => navigation.goBack()}
          className="h-9 w-9 items-center justify-center rounded-full"
        >
          <Ionicons name="chevron-back" size={20} color="#111827" />
        </Pressable>

        <Text className="text-[18px] font-semibold text-[#111827]">
          {t("blacklist.title")}
        </Text>

        <Pressable onPress={() => setEditing((v) => !v)}>
          <Text className="text-[13px] text-[#6B7280]">
            {editing ? t("common.done") : t("common.edit")}
          </Text>
        </Pressable>
      </View>

      {/* Search bar */}
      <View className="px-4 mt-3">
        <View className="flex-row items-center rounded-full bg-[#F3F4F6] px-3 py-2">
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={t("blacklist.searchPlaceholder")}
            placeholderTextColor="#9CA3AF"
            className="flex-1 ml-2 text-[13px] text-[#111827]"
            autoCapitalize="none"
          />
          <Pressable onPress={handleSearchAdd}>
            <Text className="ml-2 text-[13px] text-[#6C4DFF]">
              {t("common.block")}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Content */}
      {loading && blocked.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
          <Text className="mt-3 text-[12px] text-[#9CA3AF]">
            {t("common.loadingText")}
          </Text>
        </View>
      ) : blocked.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Image
            source={require("../../assets/placeholder-image.jpeg")}
            resizeMode="contain"
            style={{ width: 140, height: 140, borderRadius: 24 }}
          />
          <Text className="mt-3 text-[13px] text-[#9CA3AF]">
            {t("blacklist.empty")}
          </Text>
        </View>
      ) : (
        <ScrollView className="flex-1 mt-3" keyboardShouldPersistTaps="handled">
          {blocked.map((item) => {
            const name = item.blockedUser.nickname || item.blockedUser.username;
            return (
              <View
                key={item.id}
                className="mx-4 mb-2 flex-row items-center justify-between rounded-2xl bg-[#F9FAFB] px-4 py-3"
              >
                <View>
                  <Text className="text-[14px] text-[#111827]">{name}</Text>
                  <Text className="text-[11px] text-[#6B7280]">
                    {t("blacklist.labels.id", { id: item.blockedUser.id })}
                  </Text>
                </View>

                {editing ? (
                  <Pressable
                    onPress={() => handleRemove(item.blockedUser.id)}
                    className="px-3 py-1 rounded-full bg-red-100"
                  >
                    <Text className="text-[12px] text-red-500">
                      {t("common.remove")}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default BlacklistScreen;
