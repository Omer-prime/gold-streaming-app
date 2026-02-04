// src/screens/HonorWallScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "../navigation/ProfileStackNavigator";
import { t } from "../i18n";

type Nav = NativeStackNavigationProp<ProfileStackParamList, "HonorWall">;

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://192.168.10.25:3000";

type HonorResp = {
  userId: string;
  tagCount: number;
  medalCount: number;
  giftCount: number;
  vehicleCount: number;
};

const HonorWallScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  
  const [loading, setLoading] = useState(true);
  const [honor, setHonor] = useState<HonorResp | null>(null);

  const loadHonor = async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem("gl_user_id");
      if (!userId) {
        setLoading(false);
        return;
      }

      const res = await fetch(
        `${API_BASE_URL}/api/profile/honor?userId=${encodeURIComponent(userId)}`
      );

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        console.log("Honor load error", json || res.status);
        setLoading(false);
        return;
      }

      const json = (await res.json()) as HonorResp;
      setHonor(json);
    } catch (err) {
      console.error("loadHonor error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHonor();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-[#F9FAFB]" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} className="pr-2">
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </Pressable>
        <Text className="text-[16px] font-semibold text-[#111827]">
          {t("honorWall.title")}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs – Honor active */}
      <View className="flex-row px-4 mt-1">
        <Pressable onPress={() => navigation.navigate("MyProfile")}>
          <Text className="text-[14px] text-[#9CA3AF] mr-6">{t("honorWall.tabs.data")}</Text>
        </Pressable>
        <View>
          <Text className="text-[14px] font-semibold text-[#111827]">
            {t("honorWall.tabs.honor")}
          </Text>
          <View className="h-0.5 bg-[#6366F1] rounded-full mt-1" />
        </View>
      </View>

      {loading && !honor ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
          <Text className="mt-2 text-xs text-gray-500">
            {t("honorWall.states.loading")}
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1 mt-3"
          contentContainerStyle={{ paddingBottom: 32, paddingHorizontal: 16 }}
          showsVerticalScrollIndicator={false}
        >
          <HonorCard
            title={t("honorWall.cards.tagWall")}
            count={honor?.tagCount ?? 0}
            fromColor="#5B21B6"
            toColor="#C026D3"
          />

          <HonorCard
            title={t("honorWall.cards.medalWall")}
            count={honor?.medalCount ?? 0}
            fromColor="#92400E"
            toColor="#F97316"
          />

          <HonorCard
            title={t("honorWall.cards.giftCollection")}
            count={honor?.giftCount ?? 0}
            fromColor="#1E293B"
            toColor="#475569"
          />

          <HonorCard
            title={t("honorWall.cards.vehicleWall")}
            count={honor?.vehicleCount ?? 0}
            fromColor="#0F172A"
            toColor="#4B5563"
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

type HonorCardProps = {
  title: string;
  count: number;
  fromColor: string;
  toColor: string;
};

const HonorCard: React.FC<HonorCardProps> = ({ title, count, fromColor, toColor }) => {
 

  return (
    <View className="mb-4">
      <View className="flex-row items-center justify-between mb-1 px-1">
        <Text className="text-[13px] text-[#111827]">{title}</Text>
        <Text className="text-[11px] text-[#6B7280]">{t("honorWall.cards.countMore", { count })}</Text>
      </View>
      <LinearGradient
        colors={[fromColor, toColor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ borderRadius: 18, paddingVertical: 18, paddingHorizontal: 16 }}
      >
        <View className="items-center justify-center">
          <Text className="text-[13px] text-white font-semibold">
            {t("honorWall.cards.notObtained")}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
};

export default HonorWallScreen;
