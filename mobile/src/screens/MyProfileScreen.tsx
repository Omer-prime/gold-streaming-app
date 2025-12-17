// mobile/src/screens/MyProfileScreen.tsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "../navigation/ProfileStackNavigator";
import { API_BASE_URL } from "../config";

type MyProfileNav = NativeStackNavigationProp<ProfileStackParamList, "MyProfile">;

type ProfileMeResponse = {
  user: {
    id: string;
    username: string;
    nickname?: string | null;
    avatarUrl?: string | null;
    role: string;
    level: number;
    liveLevel: number;
    vipLevel: number;
  };
  wallet: { balance: number };
  stats: {
    friends: number;
    following: number;
    followers: number;
    visitors: number;
    points: number;
  };
};

const MyProfileScreen: React.FC = () => {
  const navigation = useNavigation<MyProfileNav>();

  const [loading, setLoading] = useState(true);
  const [savingName, setSavingName] = useState(false);
  const [profile, setProfile] = useState<ProfileMeResponse | null>(null);
  const [nickname, setNickname] = useState<string>("");
  const [editingName, setEditingName] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const displayName = nickname || profile?.user.nickname || profile?.user.username || "Someone";

  const avatarInitial =
    displayName.trim().length > 0 ? displayName.trim().charAt(0).toUpperCase() : "S";

  const following = profile?.stats.following ?? 0;
  const followers = profile?.stats.followers ?? 0;
  const wealthLevel = profile?.user.level ?? 1;
  const liveLevel = profile?.user.liveLevel ?? 1;

  const loadProfile = useCallback(async () => {
    let cancelled = false;

    try {
      setLoading(true);
      const storedId = await AsyncStorage.getItem("gl_user_id");
      if (!storedId) {
        setLoading(false);
        Alert.alert("Not logged in", "Please login again.");
        return;
      }
      if (!cancelled) setUserId(storedId);

      const res = await fetch(`${API_BASE_URL}/api/profile/me?userId=${encodeURIComponent(storedId)}`);

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        console.log("MyProfile load error", json || res.status);
        Alert.alert("Error", json?.error || "Failed to load profile");
        if (!cancelled) setLoading(false);
        return;
      }

      const json = (await res.json()) as ProfileMeResponse;
      if (!cancelled) {
        setProfile(json);
        setNickname(json.user.nickname || json.user.username);
        setAvatarUri(json.user.avatarUrl ?? null);
      }
    } catch (err) {
      console.error("loadProfile error", err);
      Alert.alert("Error", "Network error while loading profile.");
    } finally {
      if (!cancelled) setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const saveNickname = async (value: string) => {
    if (!userId) return;
    const trimmed = value.trim();
    if (!trimmed) return;

    try {
      setSavingName(true);
      const res = await fetch(`${API_BASE_URL}/api/profile/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, nickname: trimmed }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        console.log("saveNickname error", json || res.status);
        Alert.alert("Error", json?.error || "Failed to update nickname");
        return;
      }

      setProfile((prev) =>
        prev ? { ...prev, user: { ...prev.user, nickname: json.user.nickname } } : prev
      );
    } catch (err) {
      console.error("saveNickname error", err);
      Alert.alert("Error", "Network error while updating nickname.");
    } finally {
      setSavingName(false);
    }
  };

  const handleChangeAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow photo access so you can choose a profile picture.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets[0]?.uri) {
      const uri = result.assets[0].uri;
      setAvatarUri(uri);

      // NOTE: This is still sending a URI. Best practice is to upload image and save the returned URL.
      if (userId) {
        try {
          await fetch(`${API_BASE_URL}/api/profile/me`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, avatarUrl: uri, profilePhotos: [uri] }),
          });
        } catch (e) {
          console.log("avatar save error", e);
        }
      }
    }
  };

  const openMyPosts = () => {
    if (!profile?.user.id) {
      Alert.alert("Please wait", "Profile is still loading.");
      return;
    }

    // ✅ Reuse the existing VisitProfile screen to show your own posts/videos
    // If your ProfileStackParamList has VisitProfile, this will work.
    (navigation as any).navigate("VisitProfile", { userId: profile.user.id });
  };

  if (loading && !profile) {
    return (
      <SafeAreaView className="flex-1 bg-[#F9FAFB]" edges={["top"]}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
          <Text className="mt-2 text-xs text-gray-500">Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F9FAFB]" edges={["top"]}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3">
          <Pressable onPress={() => navigation.goBack()} hitSlop={8} className="pr-2">
            <Ionicons name="chevron-back" size={22} color="#111827" />
          </Pressable>
          <Text className="text-[16px] font-semibold text-[#111827]">{displayName}</Text>
          <Pressable onPress={() => (navigation as any).navigate("EditProfile")} hitSlop={8} className="pl-2">
            <Ionicons name="create-outline" size={20} color="#111827" />
          </Pressable>
        </View>

        {/* Top banner */}
        <LinearGradient
          colors={["#4B5563", "#111827"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ marginHorizontal: 16, borderRadius: 16, padding: 16 }}
        >
          <View className="flex-row items-center">
            <Pressable
              onPress={handleChangeAvatar}
              className="h-16 w-16 rounded-full bg-[#9CA3AF] items-center justify-center mr-3 overflow-hidden"
            >
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={{ width: "100%", height: "100%" }} />
              ) : (
                <Text className="text-white text-[32px] font-semibold">{avatarInitial}</Text>
              )}
            </Pressable>

            <View className="flex-1">
              {editingName ? (
                <TextInput
                  value={nickname}
                  onChangeText={setNickname}
                  autoFocus
                  placeholder="Enter nickname"
                  placeholderTextColor="#9CA3AF"
                  className="text-[16px] font-semibold text-white"
                  maxLength={20}
                  onBlur={() => {
                    setEditingName(false);
                    saveNickname(nickname);
                  }}
                />
              ) : (
                <Pressable onPress={() => setEditingName(true)}>
                  <View className="flex-row items-center">
                    <Text className="text-[16px] font-semibold text-white mr-2">{displayName}</Text>
                    {savingName && <ActivityIndicator size="small" color="#E5E7EB" />}
                  </View>
                </Pressable>
              )}

              <View className="flex-row items-center mt-1">
                <View className="px-2 py-0.5 rounded-full bg-[#10B981]/90 mr-2">
                  <Text className="text-[11px] text-white">Online</Text>
                </View>
                <Text className="text-[11px] text-[#E5E7EB]">ID: {profile?.user.id.slice(-7) ?? "-------"}</Text>
              </View>

              <Text className="mt-1 text-[11px] text-[#E5E7EB]">
                Following {following} · Followers {followers}
              </Text>
            </View>

            <View className="items-end">
              <View className="px-2 py-1 rounded-full bg-[#F97316]">
                <Text className="text-[10px] text-white font-semibold">LV.{wealthLevel}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Tabs (Data / Honor Wall / Posts) */}
        <View className="flex-row px-4 mt-4 items-center">
          <View className="mr-6">
            <Text className="text-[14px] font-semibold text-[#111827]">Data</Text>
            <View className="h-0.5 bg-[#6366F1] rounded-full mt-1" />
          </View>

          <Pressable onPress={() => (navigation as any).navigate("HonorWall")} className="mr-6">
            <Text className="text-[14px] text-[#9CA3AF]">Honor Wall</Text>
          </Pressable>

          <Pressable onPress={openMyPosts}>
            <Text className="text-[14px] text-[#9CA3AF]">Posts</Text>
          </Pressable>
        </View>

        {/* Level & FanClub row */}
        <View className="px-4 mt-3">
          <View className="flex-row">
            <Pressable className="flex-1 rounded-2xl bg-[#ECFDF3] px-3 py-3 mr-2" onPress={() => (navigation as any).navigate("Level")}>
              <Text className="text-[11px] text-[#16A34A] mb-1">Wealth level</Text>
              <Text className="text-[13px] text-[#111827]">Lv.{wealthLevel}</Text>
            </Pressable>

            <Pressable className="flex-1 rounded-2xl bg-[#EEF2FF] px-3 py-3 mr-2" onPress={() => (navigation as any).navigate("Level")}>
              <Text className="text-[11px] text-[#4F46E5] mb-1">Livestream level</Text>
              <Text className="text-[13px] text-[#111827]">Lv.{liveLevel}</Text>
            </Pressable>

            <Pressable className="flex-1 rounded-2xl bg-[#FEF2F2] px-3 py-3" onPress={() => (navigation as any).navigate("FanClub")}>
              <Text className="text-[11px] text-[#DC2626] mb-1">Fan Club</Text>
              <Text className="text-[13px] text-[#111827]">0 Fans</Text>
            </Pressable>
          </View>
        </View>

        {/* Gift Gallery & Contribution */}
        <View className="px-4 mt-4">
          <Pressable className="rounded-2xl bg-white px-4 py-3 mb-2 flex-row items-center justify-between">
            <View>
              <Text className="text-[13px] text-[#111827]">Gift Gallery</Text>
              <Text className="text-[11px] text-[#9CA3AF] mt-1">Lit: 0/16</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
          </Pressable>

          <Pressable className="rounded-2xl bg-white px-4 py-3 flex-row items-center justify-between">
            <View>
              <Text className="text-[13px] text-[#111827]">Contribution</Text>
              <Text className="text-[11px] text-[#9CA3AF] mt-1">Participants on rank: 0</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
          </Pressable>
        </View>

        {/* Personal info + camera -> PostMoment */}
        <View className="px-4 mt-6 mb-8">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-[14px] font-semibold text-[#111827]">Personal information</Text>
            <Pressable
              onPress={() => (navigation as any).navigate("PostMoment")}
              className="h-9 w-9 rounded-full bg-[#6366F1] items-center justify-center"
            >
              <Ionicons name="camera-outline" size={18} color="#ffffff" />
            </Pressable>
          </View>
          <Text className="text-[13px] text-[#6B7280]">She/He was lazy and left nothing behind.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyProfileScreen;
