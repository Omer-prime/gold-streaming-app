// src/screens/RankingScreen.tsx
import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "../navigation/ProfileStackNavigator";

type Nav = NativeStackNavigationProp<ProfileStackParamList>;

const TOP_TABS: Array<"Host" | "Rich" | "Gift"> = ["Host", "Rich", "Gift"];
const PERIOD_TABS: Array<"Daily" | "Weekly" | "Monthly"> = [
  "Daily",
  "Weekly",
  "Monthly",
];

const MOCK_RANKS = [
  { id: 1, name: "UserOne", country: "🇵🇰", score: "352,279,592" },
  { id: 2, name: "Dragon_Agency", country: "🇮🇳", score: "318,278,062" },
  { id: 3, name: "HARRY", country: "🇮🇳", score: "212,393,108" },
  { id: 4, name: "StarHost", country: "🇵🇭", score: "192,895,860" },
  { id: 5, name: "CreatorX", country: "🇳🇵", score: "148,035,783" },
];

const RankingScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [topTab, setTopTab] = useState<"Host" | "Rich" | "Gift">("Host");
  const [periodTab, setPeriodTab] =
    useState<"Daily" | "Weekly" | "Monthly">("Weekly");

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <Pressable
          onPress={navigation.goBack}
          className="mr-3 h-8 w-8 items-center justify-center"
        >
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </Pressable>
        <Text className="flex-1 text-center text-[17px] font-semibold text-[#111827]">
          Ranking
        </Text>
        <Pressable className="w-8 items-center justify-center">
          <Ionicons name="help-circle-outline" size={20} color="#9CA3AF" />
        </Pressable>
      </View>

      {/* Top tabs */}
      <View className="flex-row items-center justify-center mt-2">
        {TOP_TABS.map((tab) => {
          const active = tab === topTab;
          return (
            <Pressable
              key={tab}
              onPress={() => setTopTab(tab)}
              className="mx-3 pb-1"
            >
              <Text
                className={`text-[14px] ${
                  active
                    ? "text-[#4F46E5] font-semibold"
                    : "text-[#6B7280]"
                }`}
              >
                {tab}
              </Text>
              {active && (
                <View className="mt-1 h-[2px] rounded-full bg-[#4F46E5]" />
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Period tabs */}
      <View className="flex-row items-center justify-center mt-3">
        {PERIOD_TABS.map((tab) => {
          const active = tab === periodTab;
          return (
            <Pressable
              key={tab}
              onPress={() => setPeriodTab(tab)}
              className={`mx-1 rounded-full px-3 py-1.5 ${
                active ? "bg-[#4F46E5]" : "bg-gray-100"
              }`}
            >
              <Text
                className={`text-[11px] ${
                  active ? "text-white font-semibold" : "text-[#374151]"
                }`}
              >
                {tab}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Filters row */}
      <View className="px-4 mt-3 mb-2 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Ionicons name="location-outline" size={16} color="#9CA3AF" />
          <Text className="ml-1 text-[12px] text-[#6B7280]">Region</Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="calendar-outline" size={16} color="#9CA3AF" />
          <Text className="ml-1 text-[12px] text-[#6B7280]">
            Current {periodTab}
          </Text>
        </View>
      </View>

      {/* List */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {MOCK_RANKS.map((item, index) => (
          <View
            key={item.id}
            className="mb-3 flex-row items-center rounded-2xl bg-white px-3 py-2.5 shadow-sm shadow-black/5"
          >
            <Text className="w-7 text-center text-[14px] font-semibold text-[#4B5563]">
              {index + 1}
            </Text>
            {/* Avatar */}
            <View className="h-10 w-10 rounded-full bg-[#E5E7EB] items-center justify-center mr-3">
              <Text className="text-[15px] font-semibold text-[#4B5563]">
                {item.name[0]}
              </Text>
            </View>
            {/* Info */}
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text
                  className="text-[14px] font-semibold text-[#111827]"
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                <Text className="ml-2 text-[13px]">{item.country}</Text>
              </View>
              <Text className="mt-0.5 text-[11px] text-[#6B7280]">
                Some badges and info
              </Text>
            </View>
            {/* Score */}
            <View className="items-end">
              <View className="flex-row items-center">
                <Ionicons name="gift-outline" size={14} color="#F97316" />
                <Text className="ml-1 text-[12px] font-semibold text-[#F97316]">
                  {item.score}
                </Text>
              </View>
            </View>
          </View>
        ))}

        <View className="mt-2 items-center">
          <Text className="text-[11px] text-[#6B7280]">
            Distance from rank is: 🎁 54,310,000
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RankingScreen;
