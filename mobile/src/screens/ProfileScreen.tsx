import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Image,
  RefreshControl,
  type ImageSourcePropType,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "../navigation/ProfileStackNavigator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

type ProfileNav = NativeStackNavigationProp<ProfileStackParamList>;

function getApiBase() {
  // Prefer one env var across the app
  const raw =
    (process.env.EXPO_PUBLIC_API_URL ??
      process.env.EXPO_PUBLIC_API_BASE_URL ??
      "").trim();
  const base = raw.replace(/\/+$/, "");

  // Keep your current LAN fallback (works on physical device if same WiFi)
  return base || "http://192.168.10.25:3000";
}

function toAbsoluteUrl(url?: string | null) {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const base = getApiBase().replace(/\/$/, "");
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${base}${path}`;
}

const USER_ID_KEY = "gl_user_id";

// ✅ Assets (MUST match exact filenames in /assets/profile)
const ICONS: Record<string, ImageSourcePropType> = {
  coin: require("../../assets/profile/coin.png"),
  points: require("../../assets/profile/points.png"),
  store: require("../../assets/profile/store.png"),
  invite: require("../../assets/profile/invite.png"),
  guardian: require("../../assets/profile/guardian.png"),
  fanClub: require("../../assets/profile/fan-club.png"),
  reward: require("../../assets/profile/reward.png"),
  ranking: require("../../assets/profile/ranking.png"),
  medalWall: require("../../assets/profile/medal-wall.png"),
  liveData: require("../../assets/profile/live-data.png"),
  help: require("../../assets/profile/help.png"),
  myAgency: require("../../assets/profile/my-agency.png"),
  level: require("../../assets/profile/level.png"),
  auth: require("../../assets/profile/auth.png"),
  backpack: require("../../assets/profile/backpack.png"),
  followUs: require("../../assets/profile/follow-us.png"),
};

type ProfileUser = {
  id: string;
  username: string;
  nickname?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  role: string;
  country: { code: string; name: string; flagEmoji?: string | null } | null;
  level: number;
  vipLevel: number;
  profileCompletion?: number;
};

type ProfileApiResponse = {
  user: ProfileUser | null;
  wallet: { balance: number };
  stats: {
    friends: number;
    following: number;
    followers: number;
    visitors: number;
    points: number;
  };
};

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileNav>();

  const [profile, setProfile] = useState<ProfileApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasUser, setHasUser] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem(USER_ID_KEY);

      if (!userId) {
        setHasUser(false);
        setProfile(null);
        return;
      }

      const base = getApiBase();
      const res = await fetch(
        `${base}/api/profile/me?userId=${encodeURIComponent(userId)}`
      );

      if (!res.ok) {
        setHasUser(false);
        setProfile(null);
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
  }, []);

  const loadUnreadNotifications = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem(USER_ID_KEY);
      if (!userId) return;

      const base = getApiBase();
      const res = await fetch(
        `${base}/api/notifications/unread-count?userId=${encodeURIComponent(
          userId
        )}`
      );
      if (!res.ok) return;

      const json = await res.json();
      setUnreadCount(typeof json.count === "number" ? json.count : 0);
    } catch (err) {
      console.error("loadUnreadNotifications error", err);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadProfile();
      loadUnreadNotifications();
    }, [loadProfile, loadUnreadNotifications])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadProfile(), loadUnreadNotifications()]);
    setRefreshing(false);
  }, [loadProfile, loadUnreadNotifications]);

  const user = profile?.user ?? null;

  const displayName = user?.nickname || user?.username || "Guest";
  const displayId = user?.id ? user.id.slice(-7) : "--------";
  const completion = user?.profileCompletion ?? 0;
  const vipLevel = user?.vipLevel ?? 0;
  const level = user?.level ?? 1;

  const coins = profile?.wallet.balance ?? 0;
  const points = profile?.stats.points ?? 0;

  const friends = profile?.stats.friends ?? 0;
  const following = profile?.stats.following ?? 0;
  const followers = profile?.stats.followers ?? 0;
  const visitors = profile?.stats.visitors ?? 0;

  const initials = getInitials(displayName);

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
              rootNav?.reset({ index: 0, routes: [{ name: "Login" }] });
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

  const isInitialLoading = loading && !profile;

  return (
    <SafeAreaView className="flex-1 bg-[#F3F4F6]" edges={["top"]}>
      {isInitialLoading ? (
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
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Header */}
          <View className="bg-white px-4 pt-3 pb-2 flex-row items-center justify-between">
            <Text className="text-[22px] font-semibold text-[#111827]">Me</Text>

            <View className="flex-row items-center">
              <Pressable
                onPress={() => navigation.navigate("Settings")}
                className="h-9 w-9 items-center justify-center rounded-full"
              >
                <Ionicons name="settings-outline" size={20} color="#111827" />
              </Pressable>

              <Pressable
                onPress={() => {
                  const rootNav: any = navigation.getParent();
                  rootNav?.navigate("Chat");
                }}
                className="ml-2 h-9 w-9 items-center justify-center rounded-full relative"
              >
                <Ionicons name="mail-unread-outline" size={20} color="#111827" />
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

          {/* User card */}
          <View className="px-4 mt-3">
            <Pressable
              className="rounded-3xl bg-white px-4 py-4 flex-row items-center active:opacity-95"
              onPress={() => navigation.navigate("MyProfile")}
            >
              <View className="h-14 w-14 rounded-full bg-[#F97316] items-center justify-center overflow-hidden">
                {user?.avatarUrl ? (
                  <Image
                    source={{ uri: toAbsoluteUrl(user.avatarUrl) ?? user.avatarUrl }}
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
                      <MaterialCommunityIcons name="crown" size={12} color="#92400E" />
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
                    <Text className="text-[11px] text-[#4B5563]">Online</Text>
                  </View>

                  <Text className="text-[11px] text-[#9CA3AF] mr-3">
                    ID {displayId}
                  </Text>

                  {user?.country && (
                    <Text className="text-[11px] text-[#9CA3AF]">
                      {user.country.flagEmoji ? `${user.country.flagEmoji} ` : ""}
                      {user.country.name}
                    </Text>
                  )}
                </View>
              </View>

              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>
          </View>

          {/* Profile completion */}
          <View className="px-4 mt-3">
            <View className="rounded-2xl bg-[#FEF2F2] px-4 py-3 flex-row items-center">
              <Ionicons name="alert-circle-outline" size={18} color="#F97373" />
              <Text className="ml-2 flex-1 text-[12px] text-[#B91C1C]">
                Your profile is {completion}% completed. Finish it to make friends easier in Gold Live.
              </Text>
            </View>
          </View>

          {/* Stats */}
          <View className="px-4 mt-3">
            <View className="rounded-2xl bg-white py-3 flex-row justify-around">
              <StatItem label="Friends" value={friends.toString()} />
              <StatItem label="Following" value={following.toString()} />
              <StatItem label="Followers" value={followers.toString()} />
              <StatItem label="Visitors" value={visitors.toString()} />
            </View>
          </View>

          {/* Coins + Points */}
          <View className="px-4 mt-3">
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => navigation.navigate("Coins")}
                className="flex-1 rounded-2xl bg-[#FFF4CC] px-4 py-3 active:opacity-90"
              >
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-[12px] text-[#7C5A00]">Coins</Text>
                    <Text className="mt-1 text-[18px] font-semibold text-[#111827]">
                      {coins}
                    </Text>
                  </View>
                  <Image source={ICONS.coin} style={{ width: 34, height: 34 }} resizeMode="contain" />
                </View>
              </Pressable>

              <Pressable
                onPress={() => navigation.navigate("Points")}
                className="flex-1 rounded-2xl bg-[#FFE0F1] px-4 py-3 active:opacity-90"
              >
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-[12px] text-[#8A1256]">Points</Text>
                    <Text className="mt-1 text-[18px] font-semibold text-[#111827]">
                      {points}
                    </Text>
                  </View>
                  <Image source={ICONS.points} style={{ width: 34, height: 34 }} resizeMode="contain" />
                </View>
              </Pressable>
            </View>
          </View>

          {/* VIP card */}
          <View className="px-4 mt-3">
            <View className="rounded-3xl bg-[#FFF7E6] overflow-hidden">
              <Pressable
                onPress={() => navigation.navigate("VipCenter")}
                className="mx-4 mt-4 rounded-2xl bg-white/70 px-4 py-3 flex-row items-center justify-between"
                style={{ borderWidth: 1, borderStyle: "dashed", borderColor: "#93C5FD" }}
              >
                <View className="flex-row items-center flex-1 pr-3">
                  <View className="h-8 w-8 rounded-2xl bg-[#FFE8B5] items-center justify-center mr-3">
                    <MaterialCommunityIcons name="crown" size={18} color="#B45309" />
                  </View>
                  <Text className="text-[12px] font-semibold text-[#92400E]" numberOfLines={2}>
                    VIP • Upgrade to VIP and Enjoy Exclusive Benefits
                  </Text>
                </View>
                <Text className="text-[12px] font-semibold text-[#EA580C]">View &gt;</Text>
              </Pressable>

              <View className="px-4 pt-4 pb-5">
                <View className="flex-row justify-between mb-4">
                  <FeatureTile label="Reward" onPress={() => navigation.navigate("Reward")} image={ICONS.reward} />
                  <FeatureTile label="Ranking" onPress={() => navigation.navigate("Ranking")} image={ICONS.ranking} />
                  <FeatureTile label="Store" onPress={() => navigation.navigate("Store")} image={ICONS.store} />
                  <FeatureTile label="Invite" onPress={() => navigation.navigate("Invite")} image={ICONS.invite} />
                </View>

                <View className="flex-row justify-between">
                  <FeatureTile
                    label="Guardian"
                    image={ICONS.guardian}
                    onPress={() => {
                      if (!user?.id) {
                        Alert.alert("Missing user", "Please login again.");
                        return;
                      }
                      // ✅ IMPORTANT: pass userId param
                      navigation.navigate("Guardian", { userId: user.id });
                    }}
                  />
                  <FeatureTile label="Fan club" onPress={() => navigation.navigate("FanClub")} image={ICONS.fanClub} />
                  <FeatureTile label="Medal Wall" onPress={() => navigation.navigate("MedalWall")} image={ICONS.medalWall} />
                  <View className="w-14" />
                </View>
              </View>
            </View>
          </View>

          {/* Notice */}
          <View className="px-4 mt-3">
            <LinearGradient
              colors={["#4F46E5", "#8B5CF6", "#EC4899"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ borderRadius: 24, paddingHorizontal: 16, paddingVertical: 12 }}
            >
              <Text className="text-[12px] font-semibold text-white">NOTICE</Text>
              <Text className="mt-1 text-[11px] text-[#E0E7FF]">
                User conduct standards and prohibited activities in Gold Live.
              </Text>
            </LinearGradient>
          </View>

          {/* Live data */}
          <View className="px-4 mt-3">
            <Pressable
              onPress={() => navigation.navigate("LiveData")}
              className="rounded-2xl bg-white px-4 py-3 flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                <View className="h-9 w-9 rounded-2xl bg-[#F3F4F6] items-center justify-center mr-3">
                  <Image source={ICONS.liveData} style={{ width: 18, height: 18 }} resizeMode="contain" />
                </View>
                <Text className="text-[14px] text-[#111827]">Live data</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </Pressable>
          </View>

          {/* Settings list */}
          <View className="px-4 mt-3 mb-4">
            <View className="rounded-3xl bg-white px-4 py-4">
              <SettingsRow label="Help" iconImage={ICONS.help} onPress={() => navigation.navigate("Help")} />
              <Divider />
              <SettingsRow label="My Agency" iconImage={ICONS.myAgency} onPress={() => navigation.navigate("MyAgency")} />
              <Divider />
              <SettingsRow label="Level" iconImage={ICONS.level} onPress={() => navigation.navigate("Level")} />
              <Divider />
              <SettingsRow label="Auth" iconImage={ICONS.auth} onPress={() => navigation.navigate("Auth")} />
              <Divider />
              <SettingsRow label="Backpack" iconImage={ICONS.backpack} onPress={() => navigation.navigate("Backpack")} />
              <Divider />
              <SettingsRow label="Follow Us" iconImage={ICONS.followUs} onPress={() => navigation.navigate("FollowUs")} />
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

/* small components */

const StatItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View className="items-center">
    <Text className="text-[16px] font-semibold text-[#111827]">{value}</Text>
    <Text className="mt-0.5 text-[11px] text-[#6B7280]">{label}</Text>
  </View>
);

const FeatureTile: React.FC<{
  label: string;
  onPress?: () => void;
  image?: ImageSourcePropType;
  icon?: React.ReactNode;
}> = ({ label, onPress, image, icon }) => (
  <Pressable
    onPress={onPress}
    className="items-center w-14 active:opacity-90"
    android_ripple={{ color: "rgba(0,0,0,0.05)", borderless: true }}
  >
    <View className="h-11 w-11 rounded-2xl bg-white/75 items-center justify-center mb-1">
      {image ? (
        <Image source={image} style={{ width: 22, height: 22 }} resizeMode="contain" />
      ) : (
        icon
      )}
    </View>
    <Text className="text-[10px] text-[#6B7280]" numberOfLines={1}>
      {label}
    </Text>
  </Pressable>
);

const SettingsRow: React.FC<{
  label: string;
  iconImage: ImageSourcePropType;
  onPress?: () => void;
}> = ({ label, iconImage, onPress }) => (
  <Pressable
    onPress={onPress}
    className="flex-row items-center justify-between py-2.5 active:opacity-90"
  >
    <View className="flex-row items-center">
      <View className="h-9 w-9 rounded-2xl bg-[#EEF2FF] items-center justify-center mr-3">
        <Image source={iconImage} style={{ width: 18, height: 18 }} resizeMode="contain" />
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
