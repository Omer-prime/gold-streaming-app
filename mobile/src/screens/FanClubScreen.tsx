// src/screens/FanClubScreen.tsx
import React, { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "../navigation/ProfileStackNavigator";

type Nav = NativeStackNavigationProp<ProfileStackParamList>;

const FanClubScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [topTab, setTopTab] = useState<"Fan Club" | "Fan group">("Fan Club");
  const [subTab, setSubTab] = useState<"Joined club" | "My club">(
    "Joined club"
  );

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
          Fan Club
        </Text>
        <Pressable className="w-8 items-center justify-center">
          <Ionicons name="help-circle-outline" size={20} color="#9CA3AF" />
        </Pressable>
      </View>

      <LinearGradient
        colors={["#F9E8FF", "#F5F3FF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="flex-1"
      >
        {/* Top tabs */}
        <View className="mt-3 flex-row justify-center">
          {(["Fan Club", "Fan group"] as const).map((tab) => {
            const active = tab === topTab;
            return (
              <Pressable
                key={tab}
                onPress={() => setTopTab(tab)}
                className="mx-4 pb-1"
              >
                <Text
                  className={`text-[15px] ${
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

        {/* Sub tabs */}
        <View className="mt-3 flex-row justify-center">
          {(["Joined club", "My club"] as const).map((tab) => {
            const active = tab === subTab;
            return (
              <Pressable
                key={tab}
                onPress={() => setSubTab(tab)}
                className="mx-4 pb-1"
              >
                <Text
                  className={`text-[13px] ${
                    active
                      ? "text-[#111827] font-semibold"
                      : "text-[#9CA3AF]"
                  }`}
                >
                  {tab}
                </Text>
                {active && (
                  <View className="mt-1 h-[2px] rounded-full bg-[#111827]" />
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Empty state */}
        <View className="flex-1 items-center justify-center px-4">
          <View className="h-40 w-40 rounded-3xl bg-white items-center justify-center mb-2">
            <Ionicons name="planet-outline" size={42} color="#9CA3AF" />
          </View>
          <Text className="text-[13px] text-[#9CA3AF]">No more data</Text>
        </View>

        {/* Footer link */}
        <Pressable className="mb-6 mt-auto items-center">
          <Text className="text-[12px] text-[#6B7280]">
            Frozen Fan Club &gt;
          </Text>
        </Pressable>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default FanClubScreen;
