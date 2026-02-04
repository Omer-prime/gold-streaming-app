// src/screens/HotTopicsScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { API_BASE_URL } from "../config";
import type { SquareTopic } from "./HomeFeedScreen";
import { t } from "../i18n";

type TopicCategoryTab = "DAILY" | "OFFICIAL" | "NORMAL";

const HotTopicsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  
  const [activeTab, setActiveTab] = useState<TopicCategoryTab>("DAILY");
  const [topics, setTopics] = useState<SquareTopic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.set("category", activeTab);

        const res = await fetch(`${API_BASE_URL}/api/topics?${params.toString()}`);

        if (!res.ok) {
          const json = await res.json().catch(() => null);
          if (!cancelled) {
            setError(json?.error || t("hotTopics.errors.loadFailed"));
            setTopics([]);
          }
          return;
        }

        const json = await res.json();

        const mapped: SquareTopic[] = (json.topics || []).map((tt: any) => ({
          id: tt.id,
          title: tt.title,
          hotCount: typeof tt.hotCount === "number" && !isNaN(tt.hotCount) ? tt.hotCount : 0,
        }));

        if (!cancelled) setTopics(mapped);
      } catch (err) {
        console.error("load hot topics error", err);
        if (!cancelled) {
          setError(t("hotTopics.errors.network"));
          setTopics([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [activeTab, t]);

  const handleOpenTopic = (topic: SquareTopic) => {
    navigation.navigate("TopicDetail", {
      topicId: topic.id,
      topicTitle: topic.title,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </Pressable>
        <Text className="text-[16px] font-semibold text-gray-900">{t("hotTopics.title")}</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Category tabs */}
      <View className="flex-row justify-center mt-3 mb-1 px-4">
        <CategoryTab label={t("hotTopics.tabs.daily")} active={activeTab === "DAILY"} onPress={() => setActiveTab("DAILY")} />
        <CategoryTab label={t("hotTopics.tabs.official")} active={activeTab === "OFFICIAL"} onPress={() => setActiveTab("OFFICIAL")} />
        <CategoryTab label={t("hotTopics.tabs.normal")} active={activeTab === "NORMAL"} onPress={() => setActiveTab("NORMAL")} />
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {loading && (
          <View className="py-4">
            <ActivityIndicator size="small" color="#6C4DFF" />
          </View>
        )}

        {error && !loading && (
          <View className="py-2">
            <Text className="text-[12px] text-red-500">{error}</Text>
          </View>
        )}

        {!loading && !error && topics.length === 0 && (
          <View className="py-4">
            <Text className="text-[13px] text-gray-500">{t("hotTopics.empty")}</Text>
          </View>
        )}

        {topics.map((topic) => (
          <Pressable
            key={topic.id}
            className="mb-3 rounded-2xl bg-[#F9FAFB] px-3 py-3 flex-row justify-between items-center"
            onPress={() => handleOpenTopic(topic)}
          >
            <View className="flex-1 mr-2">
              <Text className="text-[13px] font-semibold text-gray-900" numberOfLines={2}>
                {topic.title}
              </Text>
              <Text className="mt-1 text-[11px] text-gray-500">
                {t("hotTopics.labels.hotCount", { count: topic.hotCount })}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const CategoryTab: React.FC<{
  label: string;
  active: boolean;
  onPress: () => void;
}> = ({ label, active, onPress }) => (
  <Pressable
    onPress={onPress}
    className={`mx-1 px-4 py-1.5 rounded-full border ${
      active ? "bg-[#6C4DFF] border-[#6C4DFF]" : "bg-white border-gray-200"
    }`}
  >
    <Text className={`text-[12px] ${active ? "text-white font-semibold" : "text-gray-700"}`}>
      {label}
    </Text>
  </Pressable>
);

export default HotTopicsScreen;
