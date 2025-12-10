// src/screens/GuardianScreen.tsx
import React, { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "../navigation/ProfileStackNavigator";

type Nav = NativeStackNavigationProp<ProfileStackParamList>;
const DURATIONS = ["1 Month", "3 Months", "6 Months", "12 Months"];

const PRIVILEGES = [
  { label: "Higher Rank", icon: "bar-chart-outline" },
  { label: "Distinguished Logo", icon: "ribbon-outline" },
  { label: "Special Entry Effect", icon: "sparkles-outline" },
  { label: "Exclusive Bubbles", icon: "chatbubble-ellipses-outline" },
  { label: "Privileged Gifts", icon: "gift-outline" },
];

const GuardianScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [duration, setDuration] = useState("1 Month");

  return (
    <SafeAreaView className="flex-1 bg-[#020617]" edges={["top"]}>
      <LinearGradient
        colors={["#0F172A", "#1D4ED8"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center px-4 py-3">
          <Pressable
            onPress={navigation.goBack}
            className="mr-3 h-8 w-8 items-center justify-center"
          >
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          </Pressable>
          <Text className="flex-1 text-center text-[17px] font-semibold text-white">
            Open Guardian
          </Text>
          <Pressable className="w-8 items-center justify-center">
            <Ionicons name="help-circle-outline" size={20} color="#BFDBFE" />
          </Pressable>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Big badge */}
          <View className="items-center mt-4">
            <View className="h-32 w-32 rounded-full bg-white/10 items-center justify-center">
              <Ionicons name="shield-checkmark-outline" size={60} color="#E5E7EB" />
            </View>
            <Text className="mt-3 text-[14px] text-white font-semibold">
              Guardian of Silver
            </Text>
          </View>

          {/* Guard someone card */}
          <View className="mt-5 mx-4 rounded-3xl bg-white/10 p-4">
            <Text className="text-[13px] font-semibold text-white mb-3">
              I want to guard him/her
            </Text>
            <View className="flex-row items-center mb-3">
              <View className="h-10 w-10 rounded-full bg-white/20 items-center justify-center mr-3">
                <Ionicons name="person-outline" size={22} color="#E5E7EB" />
              </View>
              <Pressable className="ml-auto rounded-full bg-white px-3 py-1.5">
                <Text className="text-[12px] font-semibold text-[#1D4ED8]">
                  Select
                </Text>
              </Pressable>
            </View>

            {/* Durations */}
            <View className="flex-row flex-wrap">
              {DURATIONS.map((d) => {
                const active = d === duration;
                return (
                  <Pressable
                    key={d}
                    onPress={() => setDuration(d)}
                    className={`mr-2 mb-2 rounded-full px-3 py-1.5 ${
                      active ? "bg-white" : "bg-white/10"
                    }`}
                  >
                    <Text
                      className={`text-[11px] ${
                        active ? "text-[#1D4ED8] font-semibold" : "text-white"
                      }`}
                    >
                      {d}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text className="mt-3 text-[12px] text-[#BFDBFE]">
              Coins needed:{" "}
              <Text className="font-semibold text-[#FACC15]">150,000</Text>
            </Text>
          </View>

          {/* My guardian / Guard me */}
          <View className="mt-4 mx-4 rounded-3xl bg-white/10">
            <GuardianRow label="My guardian" />
            <View className="h-px bg-white/10 mx-4" />
            <GuardianRow label="Guard me" />
          </View>

          {/* Privileges */}
          <View className="mt-5 mx-4 rounded-3xl bg-white/10 p-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-[13px] font-semibold text-white">
                Guardian privileges
              </Text>
            </View>
            <View className="flex-row flex-wrap -mx-1">
              {PRIVILEGES.map((p) => (
                <View
                  key={p.label}
                  className="w-1/3 px-1 mb-3 items-center justify-center"
                >
                  <View className="h-10 w-10 rounded-2xl bg-white/15 items-center justify-center mb-1">
                    <Ionicons name={p.icon as any} size={20} color="#BFDBFE" />
                  </View>
                  <Text className="text-[11px] text-center text-[#E5E7EB]">
                    {p.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* CTA */}
          <Pressable className="mt-6 mx-6 rounded-full bg-[#2563EB] py-3.5 items-center justify-center">
            <Text className="text-[14px] font-semibold text-white">
              Activate Guardian of Silver
            </Text>
          </Pressable>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const GuardianRow: React.FC<{ label: string }> = ({ label }) => (
  <Pressable className="flex-row items-center justify-between px-4 py-3">
    <Text className="text-[13px] text-white">{label}</Text>
    <Ionicons name="chevron-forward" size={18} color="#BFDBFE" />
  </Pressable>
);

export default GuardianScreen;
