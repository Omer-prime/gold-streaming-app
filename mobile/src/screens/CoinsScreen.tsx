import React from "react";
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const CoinsScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header with tabs */}
      <View className="flex-row items-center px-4 pt-3 pb-2">
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </Pressable>
        <View className="flex-1 flex-row justify-center space-x-6">
          <Text className="text-[15px] font-semibold text-[#111827]">
            Coins
          </Text>
          <Pressable onPress={() => navigation.navigate("Points" as never)}>
            <Text className="text-[15px] text-gray-400">Points</Text>
          </Pressable>
        </View>
        <View style={{ width: 22 }} />
      </View>

      {/* Body */}
      <View className="flex-1 px-4 pt-4">
        {/* Orange card */}
        <View className="rounded-3xl bg-[#FDBA74] px-4 py-4 flex-row items-center justify-between">
          <View>
            <Text className="text-[26px] font-bold text-white">100</Text>
            <Text className="mt-1 text-[12px] text-orange-50">
              Remaining coins
            </Text>
          </View>
          <Pressable className="px-5 py-2 rounded-full bg-white">
            <Text className="text-[13px] font-semibold text-[#FB923C]">
              Top Up
            </Text>
          </Pressable>
        </View>

        {/* Filter row */}
        <View className="mt-4 flex-row items-center">
          <View className="flex-row items-center mr-4">
            <Text className="text-[13px] text-[#111827] mr-1">All</Text>
            <Ionicons name="chevron-down" size={14} color="#6B7280" />
          </View>
          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text className="ml-1 text-[13px] text-[#111827]">
              2025-11-23
            </Text>
          </View>
        </View>

        {/* Empty state */}
        <View className="flex-1 items-center justify-center">
          <Text className="text-[13px] text-gray-400">No more</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CoinsScreen;
