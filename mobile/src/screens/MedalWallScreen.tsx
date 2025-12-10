// src/screens/MedalWallScreen.tsx
import React from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "../navigation/ProfileStackNavigator";

type Nav = NativeStackNavigationProp<ProfileStackParamList>;

const MEDALS = [
  { title: "Normal VIP", icon: "star-outline" },
  { title: "Wealth Lv.5", icon: "diamond-outline" },
  { title: "Livestream Lv.5", icon: "radio-outline" },
  { title: "Live Star Lv.1", icon: "musical-notes-outline" },
  { title: "10K Fans", icon: "heart-outline" },
  { title: "10K Likes", icon: "thumbs-up-outline" },
];

const MedalWallScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView className="flex-1 bg-[#111827]" edges={["top"]}>
      <LinearGradient
        colors={["#111827", "#1F2937", "#111827"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center px-4 py-3">
          <Ionicons
            name="chevron-back"
            size={22}
            color="#F9FAFB"
            onPress={navigation.goBack}
          />
          <Text className="flex-1 text-center text-[17px] font-semibold text-[#F9FAFB]">
            Medal Wall
          </Text>
          <View className="w-8 items-center justify-center">
            <Ionicons name="help-circle-outline" size={20} color="#9CA3AF" />
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 32, paddingHorizontal: 12 }}
          showsVerticalScrollIndicator={false}
        >
          {/* User summary */}
          <View className="mt-3 rounded-3xl bg-white/10 px-4 py-3 flex-row items-center">
            <View className="h-10 w-10 rounded-full bg-[#E5E7EB] items-center justify-center mr-3">
              <Text className="text-[16px] font-semibold text-[#111827]">
                S
              </Text>
            </View>
            <View className="flex-1">
              <Text
                className="text-[14px] font-semibold text-white"
                numberOfLines={1}
              >
                Someone4...
              </Text>
              <Text className="mt-0.5 text-[11px] text-[#E5E7EB]">
                Obtain: 0
              </Text>
            </View>
            <Text className="text-[12px] font-semibold text-[#FACC15]">
              Level: 0
            </Text>
          </View>

          {/* Title */}
          <View className="mt-6 mb-3 items-center">
            <Text className="text-[13px] font-semibold text-[#FACC15]">
              Achievement Medal
            </Text>
          </View>

          {/* Grid */}
          <View className="flex-row flex-wrap -mx-1">
            {MEDALS.map((medal) => (
              <View key={medal.title} className="w-1/2 px-1 mb-3">
                <View className="rounded-3xl bg-gradient-to-b from-yellow-600/70 to-amber-800/80 px-4 py-4 items-center justify-center">
                  <View className="h-10 w-10 rounded-full bg-white/20 items-center justify-center mb-2">
                    <Ionicons name={medal.icon as any} size={22} color="#F9FAFB" />
                  </View>
                  <Text className="text-[12px] text-[#F9FAFB]">
                    {medal.title}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default MedalWallScreen;
