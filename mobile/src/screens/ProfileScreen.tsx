import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  useNavigation,
  useFocusEffect,
} from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "../navigation/ProfileStackNavigator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
type ProfileNav = NativeStackNavigationProp<
  ProfileStackParamList,
  "ProfileMain"
>;

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://192.168.10.25:3000";

type ProfileUser = {
  id: string;
  username: string;
  nickname?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  role: string;
  country:
    | {
        code: string;
        name: string;
        flagEmoji?: string | null;
      }
    | null;
  level: number;
  vipLevel: number;
  profileCompletion?: number;
};

type ProfileApiResponse = {
  user: ProfileUser | null;
  wallet: {
    balance: number;
  };
  stats: {
    friends: number;
    following: number;
    followers: number;
    visitors: number;
    points: number;
  };
};

const USER_ID_KEY = "gl_user_id";

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileNav>();
  const [profile, setProfile] = useState<ProfileApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasUser, setHasUser] = useState(true);

  const [unreadCount, setUnreadCount] = useState(0);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem(USER_ID_KEY);

      if (!userId) {
        // no user on this device
        setHasUser(false);
        setProfile(null);
        setLoading(false);
        return;
      }

      const res = await fetch(
        `${API_BASE_URL}/api/profile/me?userId=${encodeURIComponent(userId)}`
      );

      if (!res.ok) {
        console.log("Profile load failed", res.status);
        setLoading(false);
        return;
      }

      const json = (await res.json()) as ProfileApiResponse;

      if (!json.user) {
        setHasUser(false);
        setProfile(null);
      } else {
        setHasUser(true);
        setProfile(json);
      }
    } catch (err) {
      console.error("loadProfile error", err);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadNotifications = async () => {
    try {
      const userId = await AsyncStorage.getItem(USER_ID_KEY);
      if (!userId) return;

      const res = await fetch(
        `${API_BASE_URL}/api/notifications/unread-count?userId=${encodeURIComponent(
          userId
        )}`
      );
      if (!res.ok) return;

      const json = await res.json();
      setUnreadCount(typeof json.count === "number" ? json.count : 0);
    } catch (err) {
      console.error("loadUnreadNotifications error", err);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadProfile();
      loadUnreadNotifications();
    }, [])
  );

  const user = profile?.user ?? null;

  const displayName =
    user?.nickname || user?.username || "Guest";
  const displayId = user?.id ? user.id.slice(-7) : "--------";
  const coins = profile?.wallet.balance ?? 0;
  const points = profile?.stats.points ?? 0;
  const friends = profile?.stats.friends ?? 0;
  const following = profile?.stats.following ?? 0;
  const followers = profile?.stats.followers ?? 0;
  const visitors = profile?.stats.visitors ?? 0;
  const completion = user?.profileCompletion ?? 0;

  const initials = getInitials(displayName);
  const vipLevel = user?.vipLevel ?? 0;
  const level = user?.level ?? 1;

  // if device has no stored user OR backend gave user: null
  if (!hasUser) {
    return (
      <SafeAreaView className="flex-1 bg-[#F3F4F6]" edges={["top"]}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-[18px] font-semibold text-[#111827] mb-2">
            You’re logged out
          </Text>
          <Text className="text-[12px] text-[#6B7280] text-center mb-4">
            Please login again to view your profile.
          </Text>
          <Pressable
            className="px-5 py-2.5 rounded-full bg-[#6C4DFF]"
            onPress={async () => {
              await AsyncStorage.removeItem(USER_ID_KEY);
              const rootNav: any = navigation.getParent();
              rootNav?.reset({
                index: 0,
                routes: [{ name: "Login" }],
              });
            }}
          >
            <Text className="text-white text-[14px] font-semibold">
              Go to Login
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F3F4F6]" edges={["top"]}>
      {loading && !profile ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
          <Text className="mt-2 text-xs text-gray-500">
            Loading your profile...
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 96 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="bg-white px-4 pt-3 pb-2 flex-row items-center justify-between">
            <Text className="text-[20px] font-semibold text-[#111827]">Me</Text>
            <View className="flex-row items-center space-x-4">
              <Pressable onPress={() => navigation.navigate("Settings")}>
                <Ionicons name="settings-outline" size={20} color="#111827" />
              </Pressable>

              {/* Mail / chat icon with badge */}
              <Pressable
                onPress={() => {
                  const rootNav: any = navigation.getParent();
                  rootNav?.navigate("Chat");
                }}
                className="relative"
              >
                <Ionicons
                  name="mail-unread-outline"
                  size={20}
                  color="#111827"
                />
                {unreadCount > 0 && (
                  <View className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full bg-red-500 items-center justify-center px-1">
                    <Text className="text-[9px] font-semibold text-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </Text>
                  </View>
                )}
              </Pressable>
            </View>
          </View>

          {/* User info card -> go to MyProfile */}
          <View className="px-4 mt-3">
            <Pressable
              className="rounded-3xl bg-white px-4 py-4 flex-row items-center active:opacity-95"
              onPress={() => navigation.navigate("MyProfile")}
            >
              <View className="h-14 w-14 rounded-full bg-[#F97316] items-center justify-center overflow-hidden">
                {user?.avatarUrl ? (
                  <Image
                    source={{ uri: user.avatarUrl }}
                    style={{ width: "100%", height: "100%" }}
                  />
                ) : (
                  <Text className="text-white font-semibold text-[18px]">
                    {initials}
                  </Text>
                )}
              </View>

              <View className="flex-1 ml-3">
                <View className="flex-row items-center flex-wrap">
                  <Text className="text-[15px] font-semibold text-[#111827] mr-2">
                    {displayName}
                  </Text>

                  {vipLevel > 0 && (
                    <View className="flex-row items-center rounded-full bg-[#FACC15] px-2 py-0.5 mr-1">
                      <MaterialCommunityIcons
                        name="crown"
                        size={12}
                        color="#92400E"
                      />
                      <Text className="ml-1 text-[10px] font-semibold text-[#92400E]">
                        VIP {vipLevel}
                      </Text>
                    </View>
                  )}

                  <View className="rounded-full bg-[#EEF2FF] px-2 py-0.5">
                    <Text className="text-[10px] font-semibold text-[#4F46E5]">
                      LV.{level}
                    </Text>
                  </View>
                </View>

                <View className="mt-1 flex-row items-center flex-wrap">
                  <View className="flex-row items-center mr-3">
                    <View className="h-2 w-2 rounded-full bg-[#22C55E] mr-1" />
                    <Text className="text-[11px] text-[#4B5563]">
                      Online
                    </Text>
                  </View>
                  <Text className="text-[11px] text-[#9CA3AF] mr-3">
                    ID {displayId}
                  </Text>
                  {user?.country && (
                    <Text className="text-[11px] text-[#9CA3AF]">
                      {user.country.flagEmoji
                        ? `${user.country.flagEmoji} `
                        : ""}
                      {user.country.name}
                    </Text>
                  )}
                </View>
              </View>

              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>
          </View>

          {/* Profile progress banner */}
          <View className="px-4 mt-3">
            <View className="rounded-2xl bg-[#FEF2F2] px-4 py-3 flex-row items-center">
              <Ionicons name="alert-circle-outline" size={18} color="#F97373" />
              <Text className="ml-2 flex-1 text-[12px] text-[#B91C1C]">
                Your profile is {completion}% completed. Finish it to make
                friends easier in Gold Live.
              </Text>
            </View>
          </View>

          {/* Stats row */}
          <View className="px-4 mt-3">
            <View className="rounded-2xl bg-white py-3 flex-row justify-around">
              <StatItem label="Friends" value={friends.toString()} />
              <StatItem label="Following" value={following.toString()} />
              <StatItem label="Followers" value={followers.toString()} />
              <StatItem label="Visitors" value={visitors.toString()} />
            </View>
          </View>

          {/* Coins & Points */}
          <View className="px-4 mt-3">
            <View className="rounded-2xl bg-white flex-row px-4 py-3 space-x-4">
              <Pressable
                className="flex-1"
                onPress={() => navigation.navigate("Coins")}
              >
                <View className="flex-row items-center">
                  <View className="h-8 w-8 rounded-full bg-[#FEF3C7] items-center justify-center mr-2">
                    <Ionicons name="cash-outline" size={18} color="#F59E0B" />
                  </View>
                  <View>
                    <Text className="text-[11px] text-[#6B7280]">Coins</Text>
                    <Text className="text-[14px] font-semibold text-[#111827]">
                      {coins}
                    </Text>
                  </View>
                </View>
              </Pressable>

              <Pressable
                className="flex-1"
                onPress={() => navigation.navigate("Points")}
              >
                <View className="flex-row items-center">
                  <View className="h-8 w-8 rounded-full bg-[#FCE7F3] items-center justify-center mr-2">
                    <Ionicons name="gift-outline" size={18} color="#EC4899" />
                  </View>
                  <View>
                    <Text className="text-[11px] text-[#6B7280]">Points</Text>
                    <Text className="text-[14px] font-semibold text-[#111827]">
                      {points}
                    </Text>
                  </View>
                </View>
              </Pressable>
            </View>
          </View>

          {/* VIP feature grid */}
          <View className="px-4 mt-3">
            <View className="rounded-3xl bg-[#FFFBEB] px-4 pt-3 pb-4">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-[12px] font-semibold text-[#92400E]">
                  VIP • Get Gold Live VIP and enjoy privileges
                </Text>
                <Pressable onPress={() => navigation.navigate("VipCenter")}>
                  <Text className="text-[12px] font-semibold text-[#EA580C]">
                    View &gt;
                  </Text>
                </Pressable>
              </View>

              <View className="flex-row justify-between mb-3">
                <FeatureIcon
                  label="Reward"
                  icon="gift-outline"
                  onPress={() => navigation.navigate("Reward")}
                />
                <FeatureIcon
                  label="Ranking"
                  icon="trophy-outline"
                  onPress={() => navigation.navigate("Ranking")}
                />
                <FeatureIcon
                  label="Store"
                  icon="bag-handle-outline"
                  onPress={() => navigation.navigate("Store")}
                />
                <FeatureIcon
                  label="Invite"
                  icon="person-add-outline"
                  onPress={() => navigation.navigate("Invite")}
                />
              </View>

              <View className="flex-row justify-between">
                <FeatureIcon
                  label="Guardian"
                  icon="shield-checkmark-outline"
                  onPress={() => navigation.navigate("Guardian")}
                />
                <FeatureIcon
                  label="Fan club"
                  icon="people-outline"
                  onPress={() => navigation.navigate("FanClub")}
                />
                <FeatureIcon
                  label="Medal Wall"
                  icon="ribbon-outline"
                  onPress={() => navigation.navigate("MedalWall")}
                />
                <View className="w-14" />
              </View>
            </View>
          </View>

          {/* Notice banner */}
          <View className="px-4 mt-3">
            <LinearGradient
              colors={["#4F46E5", "#8B5CF6", "#EC4899"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: 24,
                paddingHorizontal: 16,
                paddingVertical: 12,
              }}
            >
              <Text className="text-[12px] font-semibold text-white">
                NOTICE
              </Text>
              <Text className="mt-1 text-[11px] text-[#E0E7FF]">
                User conduct standards and prohibited activities in Gold Live.
              </Text>
            </LinearGradient>
          </View>

          {/* Live data row */}
          <View className="px-4 mt-3">
            <Pressable
              onPress={() => navigation.navigate("LiveData")}
              className="rounded-2xl bg-white px-4 py-3 flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                <View className="h-8 w-8 rounded-full bg-[#FEE2E2] items-center justify-center mr-3">
                  <MaterialCommunityIcons
                    name="broadcast"
                    size={18}
                    color="#EF4444"
                  />
                </View>
                <Text className="text-[14px] text-[#111827]">Live data</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </Pressable>
          </View>

          {/* Settings list card */}
          <View className="px-4 mt-3 mb-4">
            <View className="rounded-3xl bg-white px-4 py-4">
              <SettingsRow
                label="Help"
                icon="help-circle-outline"
                onPress={() => navigation.navigate("Help")}
              />
              <Divider />
              <SettingsRow
                label="My Agency"
                icon="briefcase-outline"
                onPress={() => navigation.navigate("MyAgency")}
              />
              <Divider />
              <SettingsRow
                label="Level"
                icon="podium-outline"
                onPress={() => navigation.navigate("Level")}
              />
              <Divider />
              <SettingsRow
                label="Auth"
                icon="key-outline"
                onPress={() => navigation.navigate("Auth")}
              />
              <Divider />
              <SettingsRow
                label="Backpack"
                icon="cube-outline"
                onPress={() => navigation.navigate("Backpack")}
              />
              <Divider />
              <SettingsRow
                label="Follow Us"
                icon="planet-outline"
                onPress={() => navigation.navigate("FollowUs")}
              />
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

/* Small components & helpers */

const StatItem: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <View className="items-center">
    <Text className="text-[16px] font-semibold text-[#111827]">{value}</Text>
    <Text className="mt-0.5 text-[11px] text-[#6B7280]">{label}</Text>
  </View>
);

const FeatureIcon: React.FC<{
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}> = ({ label, icon, onPress }) => (
  <Pressable
    onPress={onPress}
    className="items-center w-14"
    android_ripple={{ color: "rgba(0,0,0,0.05)", borderless: true }}
  >
    <View className="h-10 w-10 rounded-2xl bg-white/70 items-center justify-center mb-1">
      <Ionicons name={icon} size={18} color="#F97316" />
    </View>
    <Text className="text-[10px] text-[#6B7280]" numberOfLines={1}>
      {label}
    </Text>
  </Pressable>
);

const SettingsRow: React.FC<{
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}> = ({ label, icon, onPress }) => (
  <Pressable
    onPress={onPress}
    className="flex-row items-center justify-between py-2.5"
  >
    <View className="flex-row items-center">
      <View className="h-8 w-8 rounded-full bg-[#EEF2FF] items-center justify-center mr-3">
        <Ionicons name={icon} size={18} color="#4F46E5" />
      </View>
      <Text className="text-[14px] text-[#111827]">{label}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
  </Pressable>
);

const Divider: React.FC = () => <View className="h-px bg-[#E5E7EB] my-1" />;

function getInitials(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "GL";
  const parts = trimmed.split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default ProfileScreen;
