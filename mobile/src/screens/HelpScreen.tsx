// src/screens/HelpScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "../navigation/ProfileStackNavigator";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Nav = NativeStackNavigationProp<ProfileStackParamList>;

const CATEGORIES = ["Frequent", "Livestream", "Recharge", "Report", "Account"];

const FAQ_ITEMS = [
  "Why did my face authentication fail?",
  "How to become an agent?",
  'Why can\'t the "Points to be confirmed" be withdrawn?',
  "I didn't receive salary after making withdrawal. What should I do?",
  "How to become a coinseller?",
  "I didn't receive coins after topping up. What should I do?",
  "How to quit an agency?",
  "Why is my livestream task missing?",
];

const HelpScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [activeCategory, setActiveCategory] = useState("Frequent");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenIndex((prev) => (prev === index ? null : index));
  };

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
          Help
        </Text>
        <View className="w-8" />
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Category chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 pt-3 pb-2"
        >
          {CATEGORIES.map((cat) => {
            const active = cat === activeCategory;
            return (
              <Pressable
                key={cat}
                onPress={() => setActiveCategory(cat)}
                className={`mr-2 rounded-full px-4 py-2 ${
                  active ? "bg-[#4F46E5]" : "bg-gray-100"
                }`}
              >
                <Text
                  className={`text-[13px] ${
                    active ? "text-white font-semibold" : "text-[#374151]"
                  }`}
                >
                  {cat}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Section title */}
        <View className="px-4 mt-2 mb-1">
          <Text className="text-[13px] font-semibold text-[#111827]">
            {activeCategory}
          </Text>
        </View>

        {/* FAQ list */}
        <View className="px-4">
          {FAQ_ITEMS.map((q, index) => {
            const open = index === openIndex;
            return (
              <View key={q} className="border-b border-gray-100">
                <Pressable
                  onPress={() => toggleItem(index)}
                  className="flex-row items-center justify-between py-3"
                >
                  <Text className="flex-1 pr-4 text-[14px] text-[#111827]">
                    {q}
                  </Text>
                  <Ionicons
                    name={open ? "chevron-up" : "chevron-down"}
                    size={18}
                    color="#9CA3AF"
                  />
                </Pressable>
                {open && (
                  <View className="pb-3 pr-6">
                    <Text className="text-[12px] leading-4 text-[#6B7280]">
                      This is a placeholder answer for "{q}". In the real app,
                      we will show detailed help content here.
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Bottom buttons */}
        <View className="px-4 mt-6 mb-4 flex-row">
          <Pressable className="flex-1 mr-3 rounded-full bg-[#EEF2FF] py-3 items-center justify-center">
            <Text className="text-[13px] font-semibold text-[#4F46E5]">
              My feedback
            </Text>
          </Pressable>
          <Pressable className="flex-1 rounded-full bg-[#4F46E5] py-3 items-center justify-center">
            <Text className="text-[13px] font-semibold text-white">
              Message feedback
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HelpScreen;
