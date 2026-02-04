// src/screens/HelpScreen.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "../navigation/ProfileStackNavigator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { t } from "../i18n";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Nav = NativeStackNavigationProp<ProfileStackParamList>;

type HelpCategory = { id: string; name: string; slug: string };
type HelpFaq = { id: string; question: string; answer: string; categoryId: string };

type FeedbackItem = {
  id: string;
  type: "MY_FEEDBACK" | "MESSAGE_FEEDBACK";
  category?: string | null;
  subject?: string | null;
  message: string;
  status: "OPEN" | "REPLIED" | "CLOSED";
  adminReply?: string | null;
  createdAt: string;
};

function getApiBaseUrl() {
  const raw = (
    process.env.EXPO_PUBLIC_API_BASE_URL ??
    process.env.EXPO_PUBLIC_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    ""
  ).trim();

  const base = raw.replace(/\/+$/, "");
  // ✅ fallback so it never becomes empty
  return base || "http://192.168.10.25:3000";
}

async function buildHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  const token = await AsyncStorage.getItem("token");
  if (token) headers.Authorization = `Bearer ${token}`;

  return headers;
}

async function apiGet<T>(path: string): Promise<T> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}${path}`, { headers: await buildHeaders() });

  const text = await res.text();
  const json = text ? JSON.parse(text) : null;

  if (!res.ok) throw new Error(json?.error || text || "Request failed");
  return json as T;
}

async function apiPost<T>(path: string, body: any): Promise<T> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}${path}`, {
    method: "POST",
    headers: await buildHeaders(),
    body: JSON.stringify(body),
  });

  const text = await res.text();
  const json = text ? JSON.parse(text) : null;

  if (!res.ok) throw new Error(json?.error || text || "Request failed");
  return json as T;
}

type FeedbackCategory = "GENERAL" | "BUG" | "PAYMENT" | "ACCOUNT" | "STREAM" | "REPORT";

const HelpScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();

  const [userId, setUserId] = useState<string | null>(null);

  const [categories, setCategories] = useState<HelpCategory[]>([]);
  const [activeSlug, setActiveSlug] = useState<string>("frequent");
  const [faqs, setFaqs] = useState<HelpFaq[]>([]);
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  const [loadingCats, setLoadingCats] = useState(false);
  const [loadingFaqs, setLoadingFaqs] = useState(false);

  const [showCompose, setShowCompose] = useState(false);
  const [showMyFeedback, setShowMyFeedback] = useState(false);

  // ✅ category (not "type") for your UI chips
  const [fbCategory, setFbCategory] = useState<FeedbackCategory>("GENERAL");
  const [fbSubject, setFbSubject] = useState<string>("");
  const [fbMessage, setFbMessage] = useState<string>("");
  const [sendingFb, setSendingFb] = useState(false);

  const [myFeedback, setMyFeedback] = useState<FeedbackItem[]>([]);
  const [loadingMyFb, setLoadingMyFb] = useState(false);

  const typeOptions = useMemo(
    () => [
      { key: "GENERAL", label: t("help.feedback.types.general") },
      { key: "BUG", label: t("help.feedback.types.bug") },
      { key: "PAYMENT", label: t("help.feedback.types.payment") },
      { key: "ACCOUNT", label: t("help.feedback.types.account") },
      { key: "STREAM", label: t("help.feedback.types.stream") },
      { key: "REPORT", label: t("help.feedback.types.report") },
    ] as const,
    []
  );

  const activeCategoryName = useMemo(() => {
    const c = categories.find((x) => x.slug === activeSlug);
    return c?.name ?? t("help.title");
  }, [categories, activeSlug]);

  const toggleItem = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const id = await AsyncStorage.getItem("gl_user_id");
        if (mounted) setUserId(id);
      } catch {
        if (mounted) setUserId(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadCategories() {
      try {
        setLoadingCats(true);
        const data = await apiGet<{ items: HelpCategory[] }>("/api/help/categories");
        if (!mounted) return;

        const items = data?.items ?? [];
        setCategories(items);
        if (items.length > 0) setActiveSlug(items[0].slug);
      } catch {
        if (!mounted) return;
        setCategories([
          { id: "local1", name: t("help.fallbackCategories.frequent"), slug: "frequent" },
          { id: "local2", name: t("help.fallbackCategories.livestream"), slug: "livestream" },
          { id: "local3", name: t("help.fallbackCategories.recharge"), slug: "recharge" },
          { id: "local4", name: t("help.fallbackCategories.report"), slug: "report" },
          { id: "local5", name: t("help.fallbackCategories.account"), slug: "account" },
        ]);
      } finally {
        if (mounted) setLoadingCats(false);
      }
    }

    loadCategories();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadFaqs() {
      try {
        setLoadingFaqs(true);
        setOpenFaqId(null);

        const data = await apiGet<{ items: HelpFaq[] }>(
          `/api/help/faqs?category=${encodeURIComponent(activeSlug)}`
        );

        if (!mounted) return;
        setFaqs(data?.items ?? []);
      } catch {
        if (!mounted) return;
        setFaqs([]);
      } finally {
        if (mounted) setLoadingFaqs(false);
      }
    }

    if (activeSlug) loadFaqs();
    return () => {
      mounted = false;
    };
  }, [activeSlug]);

  async function openMyFeedback() {
    setShowMyFeedback(true);
    try {
      setLoadingMyFb(true);
      const data = await apiGet<{ items: FeedbackItem[] }>(
        `/api/help/feedback/my?userId=${encodeURIComponent(userId ?? "")}`
      );
      setMyFeedback(data?.items ?? []);
    } catch {
      setMyFeedback([]);
    } finally {
      setLoadingMyFb(false);
    }
  }

  async function submitFeedback() {
    if (!fbMessage.trim()) {
      Alert.alert(t("help.alerts.missingMessageTitle"), t("help.alerts.missingMessageMsg"));
      return;
    }
    if (!userId) {
      Alert.alert(t("common.error"), t("liveData.errors.notLoggedIn"));
      return;
    }

    try {
      setSendingFb(true);

      await apiPost("/api/help/feedback", {
        userId,
        type: "MESSAGE_FEEDBACK",
        category: fbCategory,
        subject: fbSubject.trim() || null,
        message: fbMessage.trim(),
      });

      setShowCompose(false);
      setFbSubject("");
      setFbMessage("");
      setFbCategory("GENERAL");

      Alert.alert(t("help.alerts.sentTitle"), t("help.alerts.sentMsg"));
    } catch {
      Alert.alert(t("help.alerts.failedTitle"), t("help.alerts.failedMsg"));
    } finally {
      setSendingFb(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <Pressable onPress={navigation.goBack} className="mr-3 h-8 w-8 items-center justify-center">
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </Pressable>
        <Text className="flex-1 text-center text-[17px] font-semibold text-[#111827]">
          {t("help.title")}
        </Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {/* Category chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 pt-3 pb-2">
          {loadingCats ? (
            <View className="py-2 px-2">
              <ActivityIndicator />
            </View>
          ) : (
            categories.map((cat) => {
              const active = cat.slug === activeSlug;
              return (
                <Pressable
                  key={cat.slug}
                  onPress={() => setActiveSlug(cat.slug)}
                  className={`mr-2 rounded-full px-4 py-2 ${active ? "bg-[#4F46E5]" : "bg-gray-100"}`}
                >
                  <Text className={`text-[13px] ${active ? "text-white font-semibold" : "text-[#374151]"}`}>
                    {cat.name}
                  </Text>
                </Pressable>
              );
            })
          )}
        </ScrollView>

        {/* Section title */}
        <View className="px-4 mt-2 mb-1">
          <Text className="text-[13px] font-semibold text-[#111827]">{activeCategoryName}</Text>
        </View>

        {/* FAQ list */}
        <View className="px-4">
          {loadingFaqs ? (
            <View className="py-6 items-center">
              <ActivityIndicator />
              <Text className="mt-2 text-[12px] text-[#6B7280]">{t("help.states.loadingFaqs")}</Text>
            </View>
          ) : faqs.length === 0 ? (
            <View className="py-6">
              <Text className="text-[12px] text-[#6B7280]">{t("help.states.noFaqs")}</Text>
            </View>
          ) : (
            faqs.map((item) => {
              const open = item.id === openFaqId;
              return (
                <View key={item.id} className="border-b border-gray-100">
                  <Pressable onPress={() => toggleItem(item.id)} className="flex-row items-center justify-between py-3">
                    <Text className="flex-1 pr-4 text-[14px] text-[#111827]">{item.question}</Text>
                    <Ionicons name={open ? "chevron-up" : "chevron-down"} size={18} color="#9CA3AF" />
                  </Pressable>

                  {open && (
                    <View className="pb-3 pr-6">
                      <Text className="text-[12px] leading-4 text-[#6B7280]">{item.answer}</Text>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>

        {/* Bottom buttons */}
        <View className="px-4 mt-6 mb-4 flex-row">
          <Pressable
            onPress={openMyFeedback}
            className="flex-1 mr-3 rounded-full bg-[#EEF2FF] py-3 items-center justify-center"
          >
            <Text className="text-[13px] font-semibold text-[#4F46E5]">
              {t("help.actions.myFeedback")}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setShowCompose(true)}
            className="flex-1 rounded-full bg-[#4F46E5] py-3 items-center justify-center"
          >
            <Text className="text-[13px] font-semibold text-white">
              {t("help.actions.messageFeedback")}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Compose feedback modal */}
      <Modal visible={showCompose} transparent animationType="slide" onRequestClose={() => setShowCompose(false)}>
        <View className="flex-1 bg-black/40 justify-end">
          <View className="bg-white rounded-t-2xl p-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-[16px] font-semibold text-[#111827]">{t("help.compose.title")}</Text>
              <Pressable onPress={() => setShowCompose(false)} className="h-8 w-8 items-center justify-center">
                <Ionicons name="close" size={20} color="#111827" />
              </Pressable>
            </View>

            <Text className="text-[12px] text-[#6B7280] mb-2">{t("help.compose.typeLabel")}</Text>
            <View className="flex-row flex-wrap mb-3">
              {typeOptions.map((opt) => {
                const active = fbCategory === opt.key;
                return (
                  <Pressable
                    key={opt.key}
                    onPress={() => setFbCategory(opt.key)}
                    className={`mr-2 mb-2 rounded-full px-3 py-2 ${active ? "bg-[#4F46E5]" : "bg-gray-100"}`}
                  >
                    <Text className={`text-[12px] ${active ? "text-white font-semibold" : "text-[#374151]"}`}>
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text className="text-[12px] text-[#6B7280] mb-2">{t("help.compose.subjectOptional")}</Text>
            <TextInput
              value={fbSubject}
              onChangeText={setFbSubject}
              placeholder={t("help.compose.subjectPlaceholder")}
              className="border border-gray-200 rounded-xl px-3 py-2 text-[13px] text-[#111827]"
              placeholderTextColor="#9CA3AF"
            />

            <Text className="text-[12px] text-[#6B7280] mt-3 mb-2">{t("help.compose.messageLabel")}</Text>
            <TextInput
              value={fbMessage}
              onChangeText={setFbMessage}
              placeholder={t("help.compose.messagePlaceholder")}
              multiline
              className="border border-gray-200 rounded-xl px-3 py-2 text-[13px] text-[#111827]"
              placeholderTextColor="#9CA3AF"
              style={{ minHeight: 110, textAlignVertical: "top" }}
            />

            <Pressable
              disabled={sendingFb}
              onPress={submitFeedback}
              className={`mt-4 rounded-full py-3 items-center justify-center ${sendingFb ? "bg-gray-300" : "bg-[#4F46E5]"}`}
            >
              {sendingFb ? <ActivityIndicator /> : <Text className="text-[13px] font-semibold text-white">{t("help.compose.send")}</Text>}
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* My feedback modal */}
      <Modal visible={showMyFeedback} transparent animationType="slide" onRequestClose={() => setShowMyFeedback(false)}>
        <View className="flex-1 bg-black/40 justify-end">
          <View className="bg-white rounded-t-2xl p-4" style={{ maxHeight: "80%" }}>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-[16px] font-semibold text-[#111827]">{t("help.myFeedback.title")}</Text>
              <Pressable onPress={() => setShowMyFeedback(false)} className="h-8 w-8 items-center justify-center">
                <Ionicons name="close" size={20} color="#111827" />
              </Pressable>
            </View>

            {loadingMyFb ? (
              <View className="py-10 items-center">
                <ActivityIndicator />
                <Text className="mt-2 text-[12px] text-[#6B7280]">{t("common.loadingText")}</Text>
              </View>
            ) : myFeedback.length === 0 ? (
              <Text className="text-[12px] text-[#6B7280]">{t("help.myFeedback.empty")}</Text>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {myFeedback.map((fb) => (
                  <View key={fb.id} className="border border-gray-100 rounded-xl p-3 mb-3">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-[12px] font-semibold text-[#111827]">
                        {fb.subject || fb.category || fb.type}
                      </Text>
                      <Text className="text-[11px] text-[#6B7280]">{fb.status}</Text>
                    </View>

                    <Text className="mt-1 text-[12px] text-[#374151]">{fb.message}</Text>

                    {fb.adminReply ? (
                      <View className="mt-2 p-2 rounded-lg bg-[#F3F4F6]">
                        <Text className="text-[11px] font-semibold text-[#111827]">
                          {t("help.myFeedback.adminReplyTitle")}
                        </Text>
                        <Text className="text-[12px] text-[#374151]">{fb.adminReply}</Text>
                      </View>
                    ) : (
                      <Text className="mt-2 text-[11px] text-[#9CA3AF]">{t("help.myFeedback.noAdminReply")}</Text>
                    )}
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default HelpScreen;
