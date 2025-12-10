import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const PointsScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-4 pt-3 pb-2">
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </Pressable>
        <View className="flex-1 flex-row justify-center space-x-6">
          <Pressable onPress={() => navigation.navigate("Coins" as never)}>
            <Text className="text-[15px] text-gray-400">Coins</Text>
          </Pressable>
          <Text className="text-[15px] font-semibold text-[#111827]">
            Points
          </Text>
        </View>
        <Pressable>
          <Text className="text-[13px] text-[#6366F1]">Details</Text>
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Pink stats card */}
        <View className="mt-3 rounded-3xl bg-[#FB7185] px-4 py-4">
          <Text className="text-[12px] text-pink-50 mb-2">
            Available points
          </Text>
          <View className="flex-row justify-between">
            <Text className="text-[28px] font-bold text-white">0</Text>
            <View className="items-end">
              <Text className="text-[11px] text-pink-50">
                Total: 0
              </Text>
              <Text className="mt-1 text-[11px] text-pink-50">
                Unconfirmed: 0
              </Text>
            </View>
          </View>
        </View>

        {/* Income filter */}
        <View className="mt-4 mb-2 flex-row items-center justify-between">
          <Text className="text-[13px] text-[#111827]">Income</Text>
          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text className="ml-1 text-[13px] text-[#111827]">
              Last 30 days
            </Text>
            <Ionicons
              name="chevron-down"
              size={14}
              color="#6B7280"
              style={{ marginLeft: 2 }}
            />
          </View>
        </View>

        {/* Income list */}
        {["Livestream", "Party", "Platform Rewards"].map((label) => (
          <View
            key={label}
            className="mb-2 rounded-2xl bg-white px-4 py-3 flex-row items-center justify-between shadow-sm shadow-black/5"
          >
            <Text className="text-[14px] text-[#111827]">{label}</Text>
            <Text className="text-[13px] text-gray-500">0</Text>
          </View>
        ))}

        {/* Buttons */}
        <View className="mt-6">
          <Pressable className="rounded-full bg-[#6366F1] py-3 mb-3">
            <Text className="text-center text-[14px] font-semibold text-white">
              Withdraw now
            </Text>
          </Pressable>
          <Pressable className="rounded-full border border-[#6366F1] py-3">
            <Text className="text-center text-[14px] font-semibold text-[#6366F1]">
              Exchange Points for Coins
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PointsScreen;
