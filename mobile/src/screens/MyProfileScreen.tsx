// src/screens/MyProfileScreen.tsx
import React, { useState, useCallback, useMemo, useEffect } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "../navigation/ProfileStackNavigator";
import * as ImagePicker from "expo-image-picker";
import { t } from "../i18n";

type MyProfileNav = NativeStackNavigationProp<ProfileStackParamList, "MyProfile">;

const USER_ID_KEY = "gl_user_id";

function getApiBase() {
  const raw =
    (process.env.EXPO_PUBLIC_API_URL ??
      process.env.EXPO_PUBLIC_API_BASE_URL ??
      "").trim();
  const base = raw.replace(/\/+$/, "");
  return base || "http://192.168.10.25:3000";
}

// If you ever want separate CDN/public host, put it here.
// For now we keep it same as API host.
function getPublicBase() {
  const raw =
    (process.env.EXPO_PUBLIC_PUBLIC_URL ??
      process.env.EXPO_PUBLIC_API_URL ??
      process.env.EXPO_PUBLIC_API_BASE_URL ??
      "").trim();
  const base = raw.replace(/\/+$/, "");
  return base || getApiBase();
}

function toAbsoluteUrl(url?: string | null) {
  if (!url) return null;

  if (
    url.startsWith("file://") ||
    url.startsWith("content://") ||
    url.startsWith("data:")
  ) {
    return url;
  }

  const base = getPublicBase().replace(/\/+$/, "");

  if (url.startsWith("http://") || url.startsWith("https://")) {
    if (url.includes("localhost:") || url.includes("127.0.0.1:")) {
      try {
        const u = new URL(url);
        return `${base}${u.pathname}`;
      } catch {
        return url;
      }
    }
    return url;
  }

  const p = url.startsWith("/") ? url : `/${url}`;
  return `${base}${p}`;
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
    const msg =
      json?.error ||
      (text?.trim() ? text.trim() : `Request failed (HTTP ${res.status})`);
    throw new Error(`${msg} (HTTP ${res.status}) • ${url}`);
  }

  if (!json) {
    const preview = (text || "").replace(/\s+/g, " ").trim().slice(0, 160);
    throw new Error(
      `API returned non-JSON. Preview: ${preview || "(empty)"} • ${url}`
    );
  }

  return json;
}

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

type OwnedItem = {
  id: string;
  type: string;
  title: string;
  mediaUrl?: string | null;
  thumbnailUrl?: string | null;
  mediaUrlFull?: string | null;
  thumbnailUrlFull?: string | null;
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

// ✅ prefer relative first (avoids localhost-full issues)
function pickBestMedia(it?: OwnedItem | null) {
  if (!it) return null;
  return (
    it.thumbnailUrl || it.mediaUrl || it.thumbnailUrlFull || it.mediaUrlFull || null
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

async function prepareAvatarForUpload(originalUri: string) {
  try {
    const mod: any = await import("expo-image-manipulator");
    const manipulateAsync = mod?.manipulateAsync;
    const SaveFormat = mod?.SaveFormat;
    if (!manipulateAsync || !SaveFormat) return originalUri;

    const processed = await manipulateAsync(
      originalUri,
      [{ resize: { width: 900 } }],
      { compress: 0.78, format: SaveFormat.JPEG }
    );

    return processed?.uri || originalUri;
  } catch {
    return originalUri;
  }
}

type UploadResult = { uploadedUrl: string | null; uploadedPath: string | null; raw: any };

async function uploadAvatarToUploadsApi(params: { localUri: string }): Promise<UploadResult> {
  const base = getApiBase();

  // ✅ try the moment uploader first (matches your shown route.ts)
  const endpoints = [
    `${base}/api/uploads/moment`,
    `${base}/api/uploads`,
  ];

  const file: any = {
    uri: params.localUri,
    name: `avatar_${Date.now()}.jpg`,
    type: "image/jpeg",
  };

  for (const url of endpoints) {
    const form = new FormData();
    form.append("kind", "image");
    form.append("file", file);

    const res = await fetch(url, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: form,
    });

    const text = await res.text();
    let json: any = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }

    // if endpoint doesn't exist, try next
    if (res.status === 404) continue;

    if (!res.ok) {
      const preview = (text || "").replace(/\s+/g, " ").trim().slice(0, 260);
      throw new Error(
        `${json?.error || "Upload failed"} (HTTP ${res.status}) • ${url}\n${preview}`
      );
    }

    const uploadedUrl = json?.url ? String(json.url) : null;
    const uploadedPath = json?.path ? String(json.path) : null;

    if (!uploadedUrl && !uploadedPath) {
      throw new Error(`Upload ok but missing url/path • ${url}`);
    }

    return { uploadedUrl, uploadedPath, raw: json };
  }

  throw new Error("No upload endpoint found (tried /api/uploads/moment, /api/uploads)");
}

async function saveAvatarToProfile(params: { userId: string; avatarUrl: string }) {
  const base = getApiBase();
  const url = `${base}/api/profile/me`;

  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ userId: params.userId, avatarUrl: params.avatarUrl }),
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  if (!res.ok) {
    const preview = (text || "").replace(/\s+/g, " ").trim().slice(0, 260);
    throw new Error(
      `${json?.error || "Failed to save avatar"} (HTTP ${res.status}) • ${url}\n${preview}`
    );
  }

  return json;
}

async function verifyPublicImage(url: string) {
  try {
    // HEAD is faster but some setups block it; fallback to GET
    const head = await fetch(url, { method: "HEAD" });
    if (head.ok) return true;

    const get = await fetch(url, { method: "GET" });
    return get.ok;
  } catch {
    return false;
  }
}

const MyProfileScreen: React.FC = () => {
  const navigation = useNavigation<MyProfileNav>();

  const [loading, setLoading] = useState(true);
  const [savingName, setSavingName] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [pendingSavedAvatar, setPendingSavedAvatar] = useState<string | null>(null);
  const [avatarNonce, setAvatarNonce] = useState<number>(Date.now());

  const [profile, setProfile] = useState<ProfileMeResponse | null>(null);
  const [nickname, setNickname] = useState<string>("");
  const [editingName, setEditingName] = useState(false);

  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const [look, setLook] = useState<EquippedProfileLook>({
    avatarOverrideUrl: null,
    avatarFrameUrl: null,
    avatarFrameName: null,
  });

  const displayName =
    nickname ||
    profile?.user.nickname ||
    profile?.user.username ||
    t("common.userFallback");

  const avatarInitial =
    displayName.trim().length > 0 ? displayName.trim().charAt(0).toUpperCase() : "S";

  const following = profile?.stats.following ?? 0;
  const followers = profile?.stats.followers ?? 0;
  const wealthLevel = profile?.user.level ?? 1;
  const liveLevel = profile?.user.liveLevel ?? 1;

  const loadEquippedItems = useCallback(async (uid: string) => {
    const base = getApiBase();
    const ownedUrl = `${base}/api/profile/store/owned?userId=${encodeURIComponent(uid)}`;
    const owned = (await fetchJsonLoose(ownedUrl)) as OwnedResponse;

    const frame = findEquippedItem(owned, "AVATAR_FRAME");
    const frameUrlAbs = toAbsoluteUrl(pickBestMedia(frame));

    const avatarTypes = ["AVATAR", "AVATAR_IMAGE", "PROFILE_AVATAR", "AVATAR_SKIN"];
    let avatar: OwnedItem | null = null;
    for (const tp of avatarTypes) {
      avatar = findEquippedItem(owned, tp);
      if (avatar) break;
    }
    const avatarUrlAbs = toAbsoluteUrl(pickBestMedia(avatar));

    setLook({
      avatarOverrideUrl: avatarUrlAbs || null,
      avatarFrameUrl: frameUrlAbs || null,
      avatarFrameName: frame?.title ? String(frame.title) : null,
    });
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);

      const storedId = await AsyncStorage.getItem(USER_ID_KEY);
      if (!storedId) {
        setLoading(false);
        Alert.alert(
          t("editProfile.alerts.notLoggedInTitle"),
          t("editProfile.alerts.loginAgainMsg")
        );
        return;
      }
      setUserId(storedId);

      const base = getApiBase();
      const json = (await fetchJsonLoose(
        `${base}/api/profile/me?userId=${encodeURIComponent(storedId)}`
      )) as ProfileMeResponse;

      setProfile(json);
      setNickname(json.user.nickname || json.user.username);

      const serverAvatar = json?.user?.avatarUrl ?? null;
      if (serverAvatar) {
        setAvatarUri(serverAvatar);
        setPendingSavedAvatar((prev) => (prev && prev === serverAvatar ? null : prev));
        setAvatarNonce(Date.now());
      }

      loadEquippedItems(storedId).catch((e) => {
        console.log("loadEquippedItems error", e?.message || e);
      });
    } catch (err: any) {
      console.error("loadProfile error", err);
      Alert.alert(t("common.error"), err?.message || t("profile.errors.network"));
    } finally {
      setLoading(false);
    }
  }, [loadEquippedItems]);

  useFocusEffect(
    React.useCallback(() => {
      let active = true;
      (async () => {
        if (!active) return;
        await loadProfile();
      })();
      return () => {
        active = false;
      };
    }, [loadProfile])
  );

  const saveNickname = useCallback(
    async (value: string) => {
      if (!userId) return;
      const trimmed = value.trim();
      if (!trimmed) return;

      try {
        setSavingName(true);
        const base = getApiBase();

        const res = await fetch(`${base}/api/profile/me`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ userId, nickname: trimmed }),
        });

        const text = await res.text();
        let json: any = null;
        try {
          json = text ? JSON.parse(text) : null;
        } catch {
          json = null;
        }

        if (!res.ok) {
          Alert.alert(t("common.error"), json?.error || t("editProfile.alerts.updateFailedMsg"));
          return;
        }

        const nextNick = json?.user?.nickname ?? trimmed;
        setProfile((prev) =>
          prev ? { ...prev, user: { ...prev.user, nickname: nextNick } } : prev
        );
        setNickname(nextNick);
      } catch (err) {
        console.error("saveNickname error", err);
        Alert.alert(t("common.error"), t("editProfile.alerts.networkSaveMsg"));
      } finally {
        setSavingName(false);
      }
    },
    [userId]
  );

  const handleChangeAvatar = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        t("editProfile.alerts.permissionNeededTitle"),
        t("editProfile.alerts.permissionNeededMsg")
      );
      return;
    }

    const pickerAny: any = ImagePicker;
    const mediaTypesCompat =
      pickerAny?.MediaType?.Images ??
      pickerAny?.MediaTypeOptions?.Images ??
      ImagePicker.MediaTypeOptions.Images;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: mediaTypesCompat as any,
      allowsMultipleSelection: false,
      quality: 1,
    });

    if (result.canceled || !result.assets?.[0]?.uri) return;

    const pickedUri = result.assets[0].uri;
    const preparedUri = await prepareAvatarForUpload(pickedUri);

    setAvatarUri(preparedUri);

    if (!userId) return;

    try {
      setUploadingAvatar(true);

      // 1) upload
      const up = await uploadAvatarToUploadsApi({ localUri: preparedUri });

      // 2) ALWAYS save a RELATIVE path in DB (best practice)
      let toSave: string | null = up.uploadedPath || null;
      if (!toSave && up.uploadedUrl) {
        try {
          const u = new URL(up.uploadedUrl);
          toSave = u.pathname;
        } catch {
          toSave = up.uploadedUrl;
        }
      }
      if (!toSave) throw new Error("Upload succeeded but no path/url returned");

      await saveAvatarToProfile({ userId, avatarUrl: toSave });

      setPendingSavedAvatar(toSave);
      setAvatarNonce(Date.now());

      // verify reachability (will catch nginx/static misconfig)
      const abs = toAbsoluteUrl(toSave);
      if (abs && (abs.startsWith("http://") || abs.startsWith("https://"))) {
        const ok = await verifyPublicImage(abs);
        if (!ok) {
          Alert.alert(
            "Avatar saved, but image URL not reachable",
            `Saved: ${toSave}\nTried: ${abs}\n\nThis usually means nginx is not serving uploads publicly OR the alias folder doesn't match where files are saved.`
          );
        }
      }

      await loadProfile();
    } catch (e: any) {
      console.log("avatar upload error", e?.message || e);
      Alert.alert(t("common.error"), e?.message || "Avatar upload failed");
    } finally {
      setUploadingAvatar(false);
    }
  }, [userId, loadProfile]);

  const openAvatarActions = useCallback(() => {
    Alert.alert(
      "Profile Look",
      look.avatarFrameUrl ? "Avatar frame is equipped." : "No avatar frame equipped.",
      [
        { text: "Change Avatar", onPress: handleChangeAvatar },
        { text: "Change Frame", onPress: () => (navigation as any).navigate("Backpack") },
        { text: "Cancel", style: "cancel" },
      ]
    );
  }, [handleChangeAvatar, look.avatarFrameUrl, navigation]);

  const openMyPosts = useCallback(() => {
    if (!profile?.user.id) {
      Alert.alert(t("myProfile.alerts.waitTitle"), t("myProfile.alerts.profileLoadingMsg"));
      return;
    }
    (navigation as any).navigate("VisitProfile", { userId: profile.user.id });
  }, [navigation, profile?.user.id]);

  // ✅ NEW: Gift Gallery
  const openGiftGallery = useCallback(() => {
    (navigation as any).navigate("GiftGallery");
  }, [navigation]);

  // ✅ NEW: Fans Ranking (Contribution)
  const openFansRanking = useCallback(() => {
    const uid = profile?.user?.id || userId;
    if (!uid) {
      Alert.alert(t("myProfile.alerts.waitTitle"), t("myProfile.alerts.profileLoadingMsg"));
      return;
    }
    (navigation as any).navigate("FansRanking", { userId: uid, range: "today" });
  }, [navigation, profile?.user?.id, userId]);

  const finalAvatarUrl = useMemo(() => {
    const raw = pendingSavedAvatar || avatarUri || look.avatarOverrideUrl || null;
    const abs = toAbsoluteUrl(raw);

    if (!abs) return null;
    if (abs.startsWith("file://") || abs.startsWith("content://") || abs.startsWith("data:")) return abs;

    const join = abs.includes("?") ? "&" : "?";
    return `${abs}${join}v=${avatarNonce}`;
  }, [pendingSavedAvatar, avatarUri, look.avatarOverrideUrl, avatarNonce]);

  const finalFrameUrl = useMemo(() => {
    return toAbsoluteUrl(look.avatarFrameUrl || null);
  }, [look.avatarFrameUrl]);

  if (loading && !profile) {
    return (
      <SafeAreaView className="flex-1 bg-[#F9FAFB]" edges={["top"]}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
          <Text className="mt-2 text-xs text-gray-500">{t("profile.states.loading")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F9FAFB]" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3">
          <Pressable onPress={() => navigation.goBack()} hitSlop={8} className="pr-2">
            <Ionicons name="chevron-back" size={22} color="#111827" />
          </Pressable>

          <Text className="text-[16px] font-semibold text-[#111827]">{displayName}</Text>

          <View className="flex-row items-center">
            {uploadingAvatar && <ActivityIndicator size="small" />}
            <Pressable onPress={() => (navigation as any).navigate("EditProfile")} hitSlop={8} className="pl-2">
              <Ionicons name="create-outline" size={20} color="#111827" />
            </Pressable>
          </View>
        </View>

        {/* Top banner */}
        <LinearGradient
          colors={["#4B5563", "#111827"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ marginHorizontal: 16, borderRadius: 16, padding: 16 }}
        >
          <View className="flex-row items-center">
            <Pressable onPress={openAvatarActions} className="mr-3" hitSlop={8}>
              <AvatarWithFrame
                size={64}
                initials={avatarInitial}
                avatarUrl={finalAvatarUrl}
                frameUrl={finalFrameUrl}
              />
            </Pressable>

            <View className="flex-1">
              {editingName ? (
                <TextInput
                  value={nickname}
                  onChangeText={setNickname}
                  autoFocus
                  placeholder={t("editProfile.placeholders.enterNickname")}
                  placeholderTextColor="#9CA3AF"
                  className="text-[16px] font-semibold text-white"
                  maxLength={20}
                  onSubmitEditing={() => {
                    setEditingName(false);
                    saveNickname(nickname);
                  }}
                  onBlur={() => {
                    setEditingName(false);
                    saveNickname(nickname);
                  }}
                  returnKeyType="done"
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
                  <Text className="text-[11px] text-white">{t("profile.labels.online")}</Text>
                </View>

                <Text className="text-[11px] text-[#E5E7EB]">
                  {t("myProfile.labels.idLine", { id: profile?.user.id.slice(-7) ?? "-------" })}
                </Text>
              </View>

              <Text className="mt-1 text-[11px] text-[#E5E7EB]">
                {t("myProfile.labels.followingFollowers", { following, followers })}
              </Text>

              {!!look.avatarFrameName && (
                <Text className="mt-1 text-[11px] text-[#E5E7EB]">Frame: {look.avatarFrameName}</Text>
              )}
            </View>

            <View className="items-end">
              <View className="px-2 py-1 rounded-full bg-[#F97316]">
                <Text className="text-[10px] text-white font-semibold">
                  {t("profile.labels.levelShort", { level: wealthLevel })}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Tabs */}
        <View className="flex-row px-4 mt-4 items-center">
          <View className="mr-6">
            <Text className="text-[14px] font-semibold text-[#111827]">{t("honorWall.tabs.data")}</Text>
            <View className="h-0.5 bg-[#6366F1] rounded-full mt-1" />
          </View>

          <Pressable onPress={() => (navigation as any).navigate("HonorWall")} className="mr-6">
            <Text className="text-[14px] text-[#9CA3AF]">{t("honorWall.tabs.honor")}</Text>
          </Pressable>

          <Pressable onPress={openMyPosts}>
            <Text className="text-[14px] text-[#9CA3AF]">{t("myProfile.tabs.posts")}</Text>
          </Pressable>
        </View>

        {/* Level & FanClub row */}
        <View className="px-4 mt-3">
          <View className="flex-row">
            <Pressable className="flex-1 rounded-2xl bg-[#ECFDF3] px-3 py-3 mr-2" onPress={() => (navigation as any).navigate("Level")}>
              <Text className="text-[11px] text-[#16A34A] mb-1">{t("level.header.wealthTitle")}</Text>
              <Text className="text-[13px] text-[#111827]">Lv.{wealthLevel}</Text>
            </Pressable>

            <Pressable className="flex-1 rounded-2xl bg-[#EEF2FF] px-3 py-3 mr-2" onPress={() => (navigation as any).navigate("Level")}>
              <Text className="text-[11px] text-[#4F46E5] mb-1">{t("level.header.liveTitle")}</Text>
              <Text className="text-[13px] text-[#111827]">Lv.{liveLevel}</Text>
            </Pressable>

            <Pressable className="flex-1 rounded-2xl bg-[#FEF2F2] px-3 py-3" onPress={() => (navigation as any).navigate("FanClub")}>
              <Text className="text-[11px] text-[#DC2626] mb-1">{t("fanClub.title")}</Text>
              <Text className="text-[13px] text-[#111827]">{t("myProfile.labels.fansCount", { count: 0 })}</Text>
            </Pressable>
          </View>
        </View>

        {/* Gift Gallery & Contribution */}
        <View className="px-4 mt-4">
          <Pressable
            className="rounded-2xl bg-white px-4 py-3 mb-2 flex-row items-center justify-between"
            onPress={openGiftGallery}
          >
            <View>
              <Text className="text-[13px] text-[#111827]">{t("myProfile.items.giftGallery")}</Text>
              <Text className="text-[11px] text-[#9CA3AF] mt-1">{t("myProfile.labels.lit", { current: 0, total: 16 })}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
          </Pressable>

          <Pressable
            className="rounded-2xl bg-white px-4 py-3 flex-row items-center justify-between"
            onPress={openFansRanking}
          >
            <View>
              <Text className="text-[13px] text-[#111827]">{t("myProfile.items.contribution")}</Text>
              <Text className="text-[11px] text-[#9CA3AF] mt-1">{t("myProfile.labels.participantsRank", { count: 0 })}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
          </Pressable>
        </View>

        {/* Personal info + camera -> PostMoment */}
        <View className="px-4 mt-6 mb-8">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-[14px] font-semibold text-[#111827]">{t("myProfile.sections.personalInfo")}</Text>

            <Pressable onPress={() => (navigation as any).navigate("PostMoment")} className="h-9 w-9 rounded-full bg-[#6366F1] items-center justify-center">
              <Ionicons name="camera-outline" size={18} color="#ffffff" />
            </Pressable>
          </View>

          <Text className="text-[13px] text-[#6B7280]">{t("myProfile.defaults.bio")}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const AvatarWithFrame: React.FC<{
  size: number;
  avatarUrl: string | null;
  frameUrl: string | null;
  initials: string;
}> = ({ size, avatarUrl, frameUrl, initials }) => {
  const frameSize = Math.round(size * 1.35);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [avatarUrl]);

  return (
    <View style={{ width: frameSize, height: frameSize, alignItems: "center", justifyContent: "center" }}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: "hidden",
          backgroundColor: "#9CA3AF",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: "white", fontSize: Math.max(22, Math.round(size * 0.45)), fontWeight: "700" }}>
          {initials}
        </Text>

        {!!avatarUrl && !failed && (
          <Image
            source={{ uri: avatarUrl }}
            style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0, width: "100%", height: "100%" }}
            onError={() => setFailed(true)}
          />
        )}
      </View>

      {!!frameUrl && (
        <Image
          source={{ uri: frameUrl }}
          style={{ position: "absolute", width: frameSize, height: frameSize }}
          resizeMode="contain"
        />
      )}
    </View>
  );
};

export default MyProfileScreen;
