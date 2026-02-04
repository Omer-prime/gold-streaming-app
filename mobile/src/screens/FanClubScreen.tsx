import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "../navigation/ProfileStackNavigator";
import { t } from "../i18n";

type Nav = NativeStackNavigationProp<ProfileStackParamList>;

const FanClubScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [topTab, setTopTab] = useState<"fanClub" | "fanGroup">("fanClub");
  const [subTab, setSubTab] = useState<"joined" | "my">("joined");

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-4 pt-3 pb-2 border-b border-gray-100">
        <Pressable
          onPress={navigation.goBack}
          className="mr-3 h-9 w-9 items-center justify-center rounded-full"
        >
          <Ionicons name="chevron-back" size={20} color="#111827" />
        </Pressable>

        <Text className="flex-1 text-center text-[18px] font-semibold text-[#111827]">
          {t("fanClub.title")}
        </Text>

        <Pressable className="h-9 w-9 items-center justify-center rounded-full">
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
          {(["fanClub", "fanGroup"] as const).map((k) => {
            const active = k === topTab;
            return (
              <Pressable key={k} onPress={() => setTopTab(k)} className="mx-4 pb-1">
                <Text className={`text-[15px] ${active ? "text-[#4F46E5] font-semibold" : "text-[#6B7280]"}`}>
                  {t(`fanClub.topTabs.${k}`)}
                </Text>
                {active && <View className="mt-1 h-[2px] rounded-full bg-[#4F46E5]" />}
              </Pressable>
            );
          })}
        </View>

        {/* Sub tabs */}
        <View className="mt-3 flex-row justify-center">
          {(["joined", "my"] as const).map((k) => {
            const active = k === subTab;
            return (
              <Pressable key={k} onPress={() => setSubTab(k)} className="mx-4 pb-1">
                <Text className={`text-[13px] ${active ? "text-[#111827] font-semibold" : "text-[#9CA3AF]"}`}>
                  {t(`fanClub.subTabs.${k}`)}
                </Text>
                {active && <View className="mt-1 h-[2px] rounded-full bg-[#111827]" />}
              </Pressable>
            );
          })}
        </View>

        {/* Empty state */}
        <View className="flex-1 items-center justify-center px-4">
          <View className="h-40 w-40 rounded-3xl bg-white items-center justify-center mb-2">
            <Ionicons name="planet-outline" size={42} color="#9CA3AF" />
          </View>
          <Text className="text-[13px] text-[#9CA3AF]">{t("fanClub.empty")}</Text>
        </View>

        {/* Footer */}
        <Pressable className="mb-6 mt-auto items-center">
          <Text className="text-[12px] text-[#6B7280]">{t("fanClub.frozenLink")}</Text>
        </Pressable>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default FanClubScreen;
