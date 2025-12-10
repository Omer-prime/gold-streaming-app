// src/screens/StoreScreen.tsx
import React, { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "../navigation/ProfileStackNavigator";

type Nav = NativeStackNavigationProp<ProfileStackParamList>;

const CATEGORIES = [
  "Popular",
  "Honor",
  "Premium ID",
  "Rides",
  "Profile card",
  "Avatar Frame",
  "Party Theme",
  "Chat bubble",
];

const MOCK_ITEMS = [
  { id: 1, title: "Tiger", price: "700", section: "New This Month" },
  { id: 2, title: "Sagittarius", price: "50", section: "New This Month" },
  { id: 3, title: "Sagittarius", price: "20", section: "New This Month" },
];

const StoreScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [activeCategory, setActiveCategory] = useState("Popular");

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
          Store
        </Text>
        <Pressable className="w-8 items-center justify-center">
          <MaterialCommunityIcons
            name="trophy-outline"
            size={20}
            color="#F97316"
          />
        </Pressable>
      </View>

      {/* Category row */}
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
              className={`mr-3 items-center`}
            >
              <View
                className={`h-9 w-9 rounded-2xl items-center justify-center mb-1 ${
                  active ? "bg-[#F97316]" : "bg-gray-100"
                }`}
              >
                <Ionicons
                  name="flame-outline"
                  size={18}
                  color={active ? "#FFFFFF" : "#9CA3AF"}
                />
              </View>
              <Text
                className={`text-[10px] ${
                  active ? "text-[#111827] font-semibold" : "text-[#6B7280]"
                }`}
              >
                {cat}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32, paddingHorizontal: 12 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Section: New This Month */}
        <SectionHeader title="New This Month" />
        <View className="flex-row flex-wrap -mx-1 mb-4">
          {MOCK_ITEMS.map((item) => (
            <StoreCard key={item.id} title={item.title} price={item.price} />
          ))}
        </View>

        {/* Section: Avatar Frame */}
        <SectionHeader title="Avatar Frame" />
        <View className="flex-row flex-wrap -mx-1 mb-4">
          {MOCK_ITEMS.map((item) => (
            <StoreCard
              key={`af-${item.id}`}
              title={item.title}
              price={item.price}
            />
          ))}
        </View>

        {/* Section: Chat bubble */}
        <SectionHeader title="Chat bubble" />
        <View className="flex-row flex-wrap -mx-1 mb-10">
          {MOCK_ITEMS.map((item) => (
            <StoreCard
              key={`cb-${item.id}`}
              title="Hello~"
              price={item.price}
            />
          ))}
        </View>

        {/* Balance row */}
        <View className="flex-row items-center justify-between px-3 py-2 rounded-2xl bg-white shadow-sm shadow-black/5">
          <View className="flex-row items-center">
            <Ionicons name="cash-outline" size={18} color="#F59E0B" />
            <Text className="ml-1 text-[12px] text-[#6B7280]">Coins</Text>
            <Text className="ml-1 text-[13px] font-semibold text-[#111827]">
              100
            </Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-[11px] text-[#6B7280] mr-2">Recharge</Text>
            <Ionicons name="lock-closed-outline" size={16} color="#9CA3AF" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <View className="mb-2 mt-3 flex-row items-center justify-between px-1">
    <Text className="text-[13px] font-semibold text-[#111827]">{title}</Text>
    <Text className="text-[11px] text-[#6B7280]">All &gt;</Text>
  </View>
);

const StoreCard: React.FC<{ title: string; price: string }> = ({
  title,
  price,
}) => (
  <View className="w-1/3 px-1 mb-3">
    <View className="rounded-2xl bg-white p-2 items-center justify-between shadow-sm shadow-black/5">
      <View className="h-16 w-full rounded-xl bg-[#EEF2FF] mb-2 items-center justify-center">
        <Text className="text-[12px] text-[#6B7280]">Preview</Text>
      </View>
      <View className="w-full flex-row items-center justify-between">
        <Text
          className="flex-1 text-[11px] text-[#111827]"
          numberOfLines={1}
        >
          {title}
        </Text>
        <View className="flex-row items-center ml-1">
          <Ionicons name="cash-outline" size={12} color="#F59E0B" />
          <Text className="ml-0.5 text-[11px] text-[#F97316]">{price}</Text>
        </View>
      </View>
    </View>
  </View>
);

export default StoreScreen;
