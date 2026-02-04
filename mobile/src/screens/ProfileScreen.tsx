import React, { useCallback, useMemo, useState } from "react";
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
import { t } from "../i18n";

type ProfileNav = NativeStackNavigationProp<ProfileStackParamList>;

const USER_ID_KEY = "gl_user_id";

function getApiBase() {
  const raw =
    (process.env.EXPO_PUBLIC_API_URL ??
      process.env.EXPO_PUBLIC_API_BASE_URL ??
      "").trim();
  const base = raw.replace(/\/+$/, "");
  return base || "http://192.168.10.25:3000";
}

// ✅ robust: supports relative URLs, http(s), AND fixes localhost/127.0.0.1 coming from backend,
// plus keeps file:// and content:// as-is (for local previews).
function toAbsoluteUrl(url?: string | null) {
  if (!url) return null;

  if (url.startsWith("file://") || url.startsWith("content://") || url.startsWith("data:")) {
    return url;
  }

  const base = getApiBase().replace(/\/+$/, "");

  // absolute http(s)
  if (url.startsWith("http://") || url.startsWith("https://")) {
    // if backend mistakenly returns localhost, rewrite to your base
    if (url.includes("localhost:") || url.includes("127.0.0.1:")) {
      try {
        const u = new URL(url);
        return `${base}${u.pathname}`;
      } catch {
        // fallback: try to take path after .com/.pk etc not possible; just return as-is
        return url;
      }
    }
    return url;
  }

  // relative
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${base}${path}`;
}

async function fetchJsonLoose(url: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: { Accept: "application/json", ...(init?.headers ?? {}) },
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  if (!res.ok) {
    const msg = json?.error || (text?.trim() ? text.trim() : `Request failed (HTTP ${res.status})`);
    throw new Error(`${msg} (HTTP ${res.status}) • ${url}`);
  }

  if (!json) {
    const preview = (text || "").replace(/\s+/g, " ").trim().slice(0, 160);
    throw new Error(`API returned non-JSON. Preview: ${preview || "(empty)"} • ${url}`);
  }

  return json;
}

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

type OwnedItem = {
  id: string;
  type: string;
  title: string;
  mediaUrl?: string | null;
  thumbnailUrl?: string | null;
  mediaUrlFull?: string | null;      // can be wrong (localhost)
  thumbnailUrlFull?: string | null;  // can be wrong (localhost)
  isEquipped: boolean;
};

type OwnedResponse = {
  userId: string;
  equippedIds: Record<string, string | null>;
  items: OwnedItem[];
};

type EquippedProfileLook = {
  avatarOverrideUrl: string | null;
  avatarFrameUrl: string | null;
  avatarFrameName: string | null;
};

function pickBestMedia(it?: OwnedItem | null) {
  if (!it) return null;
  // ✅ prefer RELATIVE first to avoid backend localhost full urls
  return (
    it.thumbnailUrl ||
    it.mediaUrl ||
    it.thumbnailUrlFull ||
    it.mediaUrlFull ||
    null
  );
}

function findEquippedItem(owned: OwnedResponse, type: string) {
  const items = Array.isArray(owned.items) ? owned.items : [];
  const id = owned.equippedIds?.[type] ?? null;

  if (id) {
    const byId = items.find((x) => x.id === id);
    if (byId) return byId;
  }

  return items.find((x) => String(x.type) === type && !!x.isEquipped) || null;
}

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileNav>();

  const [profile, setProfile] = useState<ProfileApiResponse | null>(null);
  const [look, setLook] = useState<EquippedProfileLook>({
    avatarOverrideUrl: null,
    avatarFrameUrl: null,
    avatarFrameName: null,
  });

  const [loading, setLoading] = useState(true);
  const [hasUser, setHasUser] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  // ✅ FIXED: use the REAL endpoint that exists
  const loadEquippedItems = useCallback(async (userId: string) => {
    const base = getApiBase();
    const ownedUrl = `${base}/api/profile/store/owned?userId=${encodeURIComponent(userId)}`;
    const owned = (await fetchJsonLoose(ownedUrl)) as OwnedResponse;

    const frame = findEquippedItem(owned, "AVATAR_FRAME");
    const frameUrlRaw = pickBestMedia(frame);
    const frameUrlAbs = toAbsoluteUrl(frameUrlRaw);

    // (optional) if you ever add real avatar items later, this will work
    const avatarTypes = ["AVATAR", "AVATAR_IMAGE", "PROFILE_AVATAR", "AVATAR_SKIN"];
    let avatar: OwnedItem | null = null;
    for (const tp of avatarTypes) {
      avatar = findEquippedItem(owned, tp);
      if (avatar) break;
    }
    const avatarUrlRaw = pickBestMedia(avatar);
    const avatarUrlAbs = toAbsoluteUrl(avatarUrlRaw);

    setLook({
      avatarOverrideUrl: avatarUrlAbs || null,
      avatarFrameUrl: frameUrlAbs || null,
      avatarFrameName: frame?.title ? String(frame.title) : null,
    });
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setErrorText(null);

      const userId = await AsyncStorage.getItem(USER_ID_KEY);

      if (!userId) {
        setHasUser(false);
        setProfile(null);
        setLook({ avatarOverrideUrl: null, avatarFrameUrl: null, avatarFrameName: null });
        return;
      }

      const base = getApiBase();
      const url = `${base}/api/profile/me?userId=${encodeURIComponent(userId)}`;

      const json = (await fetchJsonLoose(url)) as ProfileApiResponse;

      if (!json?.user) {
        setHasUser(false);
        setProfile(null);
        setLook({ avatarOverrideUrl: null, avatarFrameUrl: null, avatarFrameName: null });
      } else {
        setHasUser(true);
        setProfile(json);

        // ✅ Load equipped avatar/frame (no more 404)
        loadEquippedItems(userId).catch((e) => {
          console.log("loadEquippedItems error", e?.message || e);
        });
      }
    } catch (err: any) {
      console.error("loadProfile error", err);
      setErrorText(err?.message || t("profile.errors.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [loadEquippedItems]);

  const loadUnreadNotifications = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem(USER_ID_KEY);
      if (!userId) return;

      const base = getApiBase();
      const url = `${base}/api/notifications/unread-count?userId=${encodeURIComponent(userId)}`;

      const json = await fetchJsonLoose(url);
      setUnreadCount(typeof json?.count === "number" ? json.count : 0);
    } catch (err) {
      console.error("loadUnreadNotifications error", err);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      let active = true;

      (async () => {
        if (!active) return;
        await Promise.all([loadProfile(), loadUnreadNotifications()]);
      })();

      return () => {
        active = false;
      };
    }, [loadProfile, loadUnreadNotifications])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadProfile(), loadUnreadNotifications()]);
    setRefreshing(false);
  }, [loadProfile, loadUnreadNotifications]);

  const user = profile?.user ?? null;

  const displayName = user?.nickname || user?.username || t("profile.labels.guest");
  const displayId = user?.id ? user.id.slice(-7) : "--------";
  const completion = user?.profileCompletion ?? 0;
  const vipLevel = user?.vipLevel ?? 0;
  const level = user?.level ?? 1;

  const coins = profile?.wallet?.balance ?? 0;
  const points = profile?.stats?.points ?? 0;

  const friends = profile?.stats?.friends ?? 0;
  const following = profile?.stats?.following ?? 0;
  const followers = profile?.stats?.followers ?? 0;
  const visitors = profile?.stats?.visitors ?? 0;

  const initials = getInitials(displayName);

  // ✅ Items feature: avatar override + avatar frame
  const finalAvatarUrl = useMemo(() => {
    return toAbsoluteUrl(look.avatarOverrideUrl || user?.avatarUrl || null);
  }, [look.avatarOverrideUrl, user?.avatarUrl]);

  const finalFrameUrl = useMemo(() => {
    return toAbsoluteUrl(look.avatarFrameUrl || null);
  }, [look.avatarFrameUrl]);

  if (!hasUser) {
    return (
      <SafeAreaView className="flex-1 bg-[#F3F4F6]" edges={["top"]}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-[18px] font-semibold text-[#111827] mb-2">
            {t("profile.loggedOut.title")}
          </Text>
          <Text className="text-[12px] text-[#6B7280] text-center mb-4">
            {t("profile.loggedOut.subtitle")}
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
              {t("profile.actions.goToLogin")}
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
            {t("profile.states.loading")}
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
            <Text className="text-[22px] font-semibold text-[#111827]">
              {t("profile.header.title")}
            </Text>

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

          {!!errorText && (
            <View className="px-4 mt-3">
              <View className="rounded-2xl bg-red-50 border border-red-200 px-3 py-2">
                <Text className="text-[11px] text-red-600">{errorText}</Text>
                <Pressable
                  onPress={() => loadProfile()}
                  className="mt-2 self-start rounded-full bg-red-600 px-3 py-1"
                >
                  <Text className="text-[11px] text-white font-semibold">
                    {t("profile.states.retry")}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* User card */}
          <View className="px-4 mt-3">
            <Pressable
              className="rounded-3xl bg-white px-4 py-4 flex-row items-center active:opacity-95"
              onPress={() => navigation.navigate("MyProfile")}
            >
              <AvatarWithFrame
                size={56}
                initials={initials}
                avatarUrl={finalAvatarUrl}
                frameUrl={finalFrameUrl}
              />

              <View className="flex-1 ml-3">
                <View className="flex-row items-center flex-wrap">
                  <Text className="text-[15px] font-semibold text-[#111827] mr-2">
                    {displayName}
                  </Text>

                  {vipLevel > 0 && (
                    <View className="flex-row items-center rounded-full bg-[#FACC15] px-2 py-0.5 mr-1">
                      <MaterialCommunityIcons name="crown" size={12} color="#92400E" />
                      <Text className="ml-1 text-[10px] font-semibold text-[#92400E]">
                        {t("profile.labels.vipLevel", { level: vipLevel })}
                      </Text>
                    </View>
                  )}

                  <View className="rounded-full bg-[#EEF2FF] px-2 py-0.5">
                    <Text className="text-[10px] font-semibold text-[#4F46E5]">
                      {t("profile.labels.levelShort", { level })}
                    </Text>
                  </View>
                </View>

                <View className="mt-1 flex-row items-center flex-wrap">
                  <View className="flex-row items-center mr-3">
                    <View className="h-2 w-2 rounded-full bg-[#22C55E] mr-1" />
                    <Text className="text-[11px] text-[#4B5563]">
                      {t("profile.labels.online")}
                    </Text>
                  </View>

                  <Text className="text-[11px] text-[#9CA3AF] mr-3">
                    {t("profile.labels.id", { id: displayId })}
                  </Text>

                  {user?.country && (
                    <Text className="text-[11px] text-[#9CA3AF]">
                      {user.country.flagEmoji ? `${user.country.flagEmoji} ` : ""}
                      {user.country.name}
                    </Text>
                  )}
                </View>

                {!!look.avatarFrameName && (
                  <Text className="mt-1 text-[11px] text-[#6B7280]">
                    Frame: {look.avatarFrameName}
                  </Text>
                )}
              </View>

              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>
          </View>

          {/* Profile completion */}
          {completion < 100 && (
            <View className="px-4 mt-3">
              <View className="rounded-2xl bg-[#FEF2F2] px-4 py-3 flex-row items-center">
                <Ionicons name="alert-circle-outline" size={18} color="#F97373" />
                <Text className="ml-2 flex-1 text-[12px] text-[#B91C1C]">
                  {t("profile.completion.text", { completion })}
                </Text>
              </View>
            </View>
          )}

          {/* Stats */}
          <View className="px-4 mt-3">
            <View className="rounded-2xl bg-white py-3 flex-row justify-around">
              <StatItem label={t("profile.stats.friends")} value={friends.toString()} />
              <StatItem label={t("profile.stats.following")} value={following.toString()} />
              <StatItem label={t("profile.stats.followers")} value={followers.toString()} />
              <StatItem label={t("profile.stats.visitors")} value={visitors.toString()} />
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
                    <Text className="text-[12px] text-[#7C5A00]">
                      {t("profile.wallet.coins")}
                    </Text>
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
                    <Text className="text-[12px] text-[#8A1256]">
                      {t("profile.wallet.points")}
                    </Text>
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
                    {t("profile.vipCard.cta")}
                  </Text>
                </View>
                <Text className="text-[12px] font-semibold text-[#EA580C]">
                  {t("profile.actions.view")}
                </Text>
              </Pressable>

              <View className="px-4 pt-4 pb-5">
                <View className="flex-row justify-between mb-4">
                  <FeatureTile label={t("profile.tiles.reward")} onPress={() => navigation.navigate("Reward")} image={ICONS.reward} />
                  <FeatureTile label={t("profile.tiles.ranking")} onPress={() => navigation.navigate("Ranking")} image={ICONS.ranking} />
                  <FeatureTile label={t("profile.tiles.store")} onPress={() => navigation.navigate("Store")} image={ICONS.store} />
                  <FeatureTile label={t("profile.tiles.invite")} onPress={() => navigation.navigate("Invite")} image={ICONS.invite} />
                </View>

                <View className="flex-row justify-between">
                  <FeatureTile
                    label={t("profile.tiles.guardian")}
                    image={ICONS.guardian}
                    onPress={() => {
                      if (!user?.id) {
                        Alert.alert(t("profile.alerts.missingUserTitle"), t("profile.alerts.missingUserMsg"));
                        return;
                      }
                      navigation.navigate("Guardian", { userId: user.id });
                    }}
                  />
                  <FeatureTile label={t("profile.tiles.fanClub")} onPress={() => navigation.navigate("FanClub")} image={ICONS.fanClub} />
                  <FeatureTile
                    label={t("profile.tiles.medalWall")}
                    image={ICONS.medalWall}
                    onPress={() => {
                      if (!user?.id) {
                        Alert.alert(t("profile.alerts.missingUserTitle"), t("profile.alerts.missingUserMsg"));
                        return;
                      }
                      navigation.navigate("MedalWall", { userId: user.id });
                    }}
                  />
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
              <Text className="text-[12px] font-semibold text-white">
                {t("profile.notice.title")}
              </Text>
              <Text className="mt-1 text-[11px] text-[#E0E7FF]">
                {t("profile.notice.subtitle")}
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
                <Text className="text-[14px] text-[#111827]">
                  {t("profile.rows.liveData")}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </Pressable>
          </View>

          {/* Settings list */}
          <View className="px-4 mt-3 mb-4">
            <View className="rounded-3xl bg-white px-4 py-4">
              <SettingsRow label={t("profile.rows.help")} iconImage={ICONS.help} onPress={() => navigation.navigate("Help")} />
              <Divider />
              <SettingsRow label={t("profile.rows.myAgency")} iconImage={ICONS.myAgency} onPress={() => navigation.navigate("MyAgency")} />
              <Divider />
              <SettingsRow label={t("profile.rows.level")} iconImage={ICONS.level} onPress={() => navigation.navigate("Level")} />
              <Divider />
              <SettingsRow label={t("profile.rows.auth")} iconImage={ICONS.auth} onPress={() => navigation.navigate("Auth")} />
              <Divider />
              <SettingsRow
                label={t("profile.rows.backpack")}
                iconImage={ICONS.backpack}
                onPress={() => navigation.navigate("Backpack")}
              />
              <Divider />
              <SettingsRow label={t("profile.rows.followUs")} iconImage={ICONS.followUs} onPress={() => navigation.navigate("FollowUs")} />
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
  <Pressable onPress={onPress} className="flex-row items-center justify-between py-2.5 active:opacity-90">
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

const AvatarWithFrame: React.FC<{
  size: number;
  avatarUrl: string | null;
  frameUrl: string | null;
  initials: string;
}> = ({ size, avatarUrl, frameUrl, initials }) => {
  const frameSize = Math.round(size * 1.35);

  return (
    <View style={{ width: frameSize, height: frameSize, alignItems: "center", justifyContent: "center" }}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: "hidden",
          backgroundColor: "#F97316",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={{ width: "100%", height: "100%" }} />
        ) : (
          <Text style={{ color: "white", fontWeight: "700", fontSize: Math.max(16, Math.round(size * 0.32)) }}>
            {initials}
          </Text>
        )}
      </View>

      {!!frameUrl && (
        <Image
          source={{ uri: frameUrl }}
          style={{
            position: "absolute",
            width: frameSize,
            height: frameSize,
          }}
          resizeMode="contain"
        />
      )}
    </View>
  );
};

function getInitials(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "GL";
  const parts = trimmed.split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default ProfileScreen;
