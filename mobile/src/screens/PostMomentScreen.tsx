import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import type { ImagePickerAsset } from "expo-image-picker";
import { Video, ResizeMode } from "expo-av";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { API_BASE_URL } from "../config";
import { t } from "../i18n";

type PostMomentParams = {
  PostMoment: {
    topicId?: string;
    topicTitle?: string;
  };
};

type PostMomentNav = NativeStackNavigationProp<PostMomentParams, "PostMoment">;
type PostMomentRoute = RouteProp<PostMomentParams, "PostMoment">;

type MediaPicked =
  | { kind: "image"; asset: ImagePickerAsset }
  | { kind: "video"; asset: ImagePickerAsset };

type ApiTopic = { id: string; title: string; hotScore?: number; hotCount?: number };

export default function PostMomentScreen() {
  const navigation = useNavigation<PostMomentNav>();
  const route = useRoute<PostMomentRoute>();

  const topicIdFromRoute = route.params?.topicId ?? undefined;
  const topicTitleFromRoute = route.params?.topicTitle ?? undefined;

  const [text, setText] = useState("");
  const [media, setMedia] = useState<MediaPicked | null>(null);
  const [posting, setPosting] = useState(false);

  const [topicLoading, setTopicLoading] = useState(false);
  const [topics, setTopics] = useState<ApiTopic[]>([]);

  const recommendedTopics = useMemo(() => {
    if (topics.length > 0) return topics.map((tt) => `#${tt.title}`);

    const fallback = t("postMoment.recommendedFallback") as any;
    if (Array.isArray(fallback)) return fallback;

    // hard fallback (should not be needed if en.ts is updated)
    return [
      "#Rocket Host Video Collection",
      "#Outfit Of The Day(OOTD)",
      "#Everyday life",
      "#SHOW YOURSELF",
      "#Topics you are interested in",
      "#The most beautiful travel photos",
      "#Recommend a movie",
      "#My hobby",
    ];
  }, [topics]);

  const appendToText = (snippet: string) => {
    setText((prev) => {
      let next = prev.trim().length === 0 ? snippet : prev.trimEnd() + " " + snippet;
      if (next.length > 250) next = next.slice(0, 250);
      return next;
    });
  };

  const loadTopics = async () => {
    try {
      setTopicLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/topics?category=ALL&includeInactive=0`);
      if (!res.ok) return;
      const json = await res.json().catch(() => null);
      const list = (json?.topics as ApiTopic[]) ?? [];
      setTopics(Array.isArray(list) ? list.slice(0, 10) : []);
    } catch {
      // ignore
    } finally {
      setTopicLoading(false);
    }
  };

  useEffect(() => {
    loadTopics();
  }, []);

  const ensureLibraryPerm = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(t("postMoment.permissions.title"), t("postMoment.permissions.libraryMsg"));
      return false;
    }
    return true;
  };

  const ensureCameraPerm = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(t("postMoment.permissions.title"), t("postMoment.permissions.cameraMsg"));
      return false;
    }
    return true;
  };

  const pickImageFromLibrary = async () => {
    if (!(await ensureLibraryPerm())) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 0.75,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setMedia({ kind: "image", asset: result.assets[0] });
    }
  };

  const pickVideoFromLibrary = async () => {
    if (!(await ensureLibraryPerm())) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsMultipleSelection: false,
      quality: 1,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setMedia({ kind: "video", asset: result.assets[0] });
    }
  };

  const openCameraPhoto = async () => {
    if (!(await ensureCameraPerm())) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.75,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setMedia({ kind: "image", asset: result.assets[0] });
    }
  };

  const openCameraVideo = async () => {
    if (!(await ensureCameraPerm())) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 1,
      videoMaxDuration: 60,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setMedia({ kind: "video", asset: result.assets[0] });
    }
  };

  // ✅ Popo-style sheet: Add photos / Add videos / Cancel
  const handleAddPress = () => {
    Alert.alert(t("postMoment.sheets.title"), t("postMoment.sheets.message"), [
      { text: t("postMoment.sheets.addPhotos"), onPress: pickImageFromLibrary },
      { text: t("postMoment.sheets.addVideos"), onPress: pickVideoFromLibrary },
      { text: t("common.cancel"), style: "cancel" },
    ]);
  };

  const uploadPickedMedia = async (picked: MediaPicked) => {
    const userId = await AsyncStorage.getItem("gl_user_id");
    if (!userId) throw new Error(t("postMoment.errors.notLoggedIn"));

    const fd = new FormData();
    fd.append("kind", picked.kind);

    const fileName =
      picked.asset.fileName ??
      (picked.kind === "video" ? `moment-${Date.now()}.mp4` : `moment-${Date.now()}.jpg`);

    const mime = picked.asset.mimeType ?? (picked.kind === "video" ? "video/mp4" : "image/jpeg");

    fd.append(
      "file",
      {
        uri: picked.asset.uri,
        name: fileName,
        type: mime,
      } as any
    );

    const res = await fetch(`${API_BASE_URL}/api/uploads/moment`, {
      method: "POST",
      body: fd,
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(json?.error || t("postMoment.errors.uploadFailed"));
    }

    return String(json?.url ?? "");
  };

  const handlePost = async () => {
    if (posting) return;

    const trimmed = text.trim();
    if (!trimmed && !media) {
      Alert.alert(t("postMoment.alerts.nothingTitle"), t("postMoment.alerts.nothingMsg"));
      return;
    }

    try {
      setPosting(true);

      const userId = await AsyncStorage.getItem("gl_user_id");
      if (!userId) {
        Alert.alert(t("postMoment.alerts.notLoggedInTitle"), t("postMoment.alerts.notLoggedInMsg"));
        return;
      }

      let imageUrl: string | null = null;
      let videoUrl: string | null = null;

      if (media) {
        const url = await uploadPickedMedia(media);
        if (!url) throw new Error(t("postMoment.errors.uploadEmpty"));

        if (media.kind === "image") imageUrl = url;
        if (media.kind === "video") videoUrl = url;
      }

      const res = await fetch(`${API_BASE_URL}/api/profile/moments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          text: trimmed || null,
          imageUrl,
          videoUrl,
          topicId: topicIdFromRoute ?? null,
        }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        Alert.alert(t("postMoment.alerts.errorTitle"), json?.error || t("postMoment.alerts.postFailed"));
        return;
      }

      Alert.alert(
        t("postMoment.alerts.postedTitle"),
        media?.kind === "video" ? t("postMoment.alerts.postedVideo") : t("postMoment.alerts.postedSquare")
      );

      navigation.goBack();
    } catch (err: any) {
      console.error("Post moment error", err);
      Alert.alert(t("postMoment.alerts.errorTitle"), err?.message || t("postMoment.errors.networkPost"));
    } finally {
      setPosting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3">
          <Pressable onPress={() => navigation.goBack()} hitSlop={8} className="pr-2">
            <Ionicons name="chevron-back" size={22} color="#111827" />
          </Pressable>

          <Text className="text-[16px] font-semibold text-[#111827]">{t("postMoment.title")}</Text>

          <Pressable
            className="px-3 py-1 rounded-full bg-[#6366F1] flex-row items-center justify-center"
            onPress={handlePost}
            disabled={posting}
          >
            {posting && <ActivityIndicator size="small" color="#ffffff" style={{ marginRight: 6 }} />}
            <Text className="text-[13px] text-white font-semibold">
              {posting ? t("postMoment.actions.posting") : t("postMoment.actions.post")}
            </Text>
          </Pressable>
        </View>

        <View className="flex-1">
          <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 80 }} showsVerticalScrollIndicator={false}>
            <View className="px-4 mt-2">
              {topicTitleFromRoute && (
                <View className="mb-2 self-start rounded-full bg-[#EEF2FF] px-3 py-1">
                  <Text className="text-[11px] text-[#4F46E5]">
                    {t("postMoment.labels.postingTo", { topic: topicTitleFromRoute })}
                  </Text>
                </View>
              )}

              <TextInput
                value={text}
                onChangeText={(val) => {
                  if (val.length <= 250) setText(val);
                }}
                placeholder={t("postMoment.placeholders.input")}
                placeholderTextColor="#9CA3AF"
                multiline
                className="text-[14px] text-[#111827] min-h-[80px]"
              />
              <Text className="text-[11px] text-[#9CA3AF] text-right">{text.length}/250</Text>

              {/* Media picker */}
              <View className="mt-4">
                {!media ? (
                  <Pressable
                    onPress={handleAddPress}
                    className="h-20 w-20 rounded-md bg-[#F3F4F6] items-center justify-center"
                  >
                    <Ionicons name="add" size={24} color="#9CA3AF" />
                  </Pressable>
                ) : (
                  <View className="relative h-24 w-24 rounded-md overflow-hidden bg-[#F3F4F6]">
                    {media.kind === "image" ? (
                      <Image source={{ uri: media.asset.uri }} style={{ width: "100%", height: "100%" }} />
                    ) : (
                      <Video
                        source={{ uri: media.asset.uri }}
                        style={{ width: "100%", height: "100%" }}
                        resizeMode={ResizeMode.COVER}
                        shouldPlay={false}
                        isLooping={false}
                        useNativeControls={false}
                      />
                    )}

                    <Pressable
                      onPress={() => setMedia(null)}
                      className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 items-center justify-center"
                    >
                      <Ionicons name="close" size={14} color="#fff" />
                    </Pressable>

                    {media.kind === "video" && (
                      <View className="absolute inset-0 items-center justify-center">
                        <View className="h-9 w-9 rounded-full bg-black/40 items-center justify-center">
                          <Ionicons name="play" size={18} color="#fff" />
                        </View>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>

            {/* Recommended topics */}
            <View className="px-4 mt-5">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-[13px] text-[#6B7280]">{t("postMoment.labels.recommended")}</Text>
                {topicLoading ? (
                  <Text className="text-[11px] text-[#9CA3AF]">{t("common.loadingText")}</Text>
                ) : (
                  <Pressable onPress={loadTopics}>
                    <Text className="text-[11px] text-[#6C4DFF]">{t("postMoment.actions.refresh")}</Text>
                  </Pressable>
                )}
              </View>

              <View className="flex-row flex-wrap">
                {recommendedTopics.map((topic) => (
                  <Pressable
                    key={topic}
                    className="px-3 py-1 mr-2 mb-2 rounded-full bg-[#F3F4F6]"
                    onPress={() => appendToText(topic)}
                  >
                    <Text className="text-[11px] text-[#4B5563]">{topic}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Bottom toolbar */}
          <View className="flex-row items-center justify-around border-t border-[#E5E7EB] py-2">
            <Pressable className="p-2" onPress={openCameraPhoto}>
              <Ionicons name="camera-outline" size={22} color="#6B7280" />
            </Pressable>
            <Pressable className="p-2" onPress={openCameraVideo}>
              <Ionicons name="videocam-outline" size={22} color="#6B7280" />
            </Pressable>
            <Pressable className="p-2" onPress={() => appendToText("😊")}>
              <Ionicons name="happy-outline" size={22} color="#6B7280" />
            </Pressable>
            <Pressable className="p-2" onPress={() => appendToText("@username")}>
              <Ionicons name="at-outline" size={22} color="#6B7280" />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
