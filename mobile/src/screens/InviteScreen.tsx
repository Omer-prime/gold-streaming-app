// src/screens/InviteScreen.tsx
import React, { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "../navigation/ProfileStackNavigator";

type Nav = NativeStackNavigationProp<ProfileStackParamList>;

const InviteScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [tab, setTab] = useState<"My rewards" | "Income Rank">("My rewards");

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
          Invitation Bonus
        </Text>
        <Pressable className="w-8 items-center justify-center">
          <Ionicons name="help-circle-outline" size={20} color="#9CA3AF" />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top banner */}
        <LinearGradient
          colors={["#FB923C", "#F97316"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="mt-4 rounded-3xl px-4 py-4"
        >
          <Text className="text-[13px] text-white">Invite someone</Text>
          <Text className="mt-1 text-[22px] font-semibold text-white">
            Can earn up to $22.3
          </Text>
          <Text className="mt-1 text-[11px] text-orange-100">
            The more you invite, the more rewards you will get.
          </Text>
        </LinearGradient>

        {/* Tabs */}
        <View className="mt-4 flex-row rounded-full bg-gray-100 p-1">
          {(["My rewards", "Income Rank"] as const).map((t) => {
            const active = t === tab;
            return (
              <Pressable
                key={t}
                onPress={() => setTab(t)}
                className={`flex-1 items-center justify-center rounded-full py-2 ${
                  active ? "bg-white" : ""
                }`}
              >
                <Text
                  className={`text-[12px] ${
                    active
                      ? "text-[#F97316] font-semibold"
                      : "text-[#6B7280]"
                  }`}
                >
                  {t}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Stats row */}
        <View className="mt-4 rounded-3xl bg-white px-4 py-3">
          <View className="flex-row justify-between">
            <Stat label="Claimed Rewards" value="0" />
            <Stat label="Number of invitees" value="0" />
          </View>
          <View className="mt-4 flex-row items-center justify-between">
            <Text className="text-[12px] text-[#374151]">
              Available for today:{" "}
              <Text className="font-semibold text-[#F97316]">0</Text>
            </Text>
            <Pressable className="rounded-full bg-gray-200 px-4 py-1.5">
              <Text className="text-[11px] font-semibold text-[#6B7280]">
                Receive
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Invitations list */}
        <View className="mt-4 rounded-3xl bg-white px-4 py-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-[13px] font-semibold text-[#111827]">
              Invitations from last 7 days (0)
            </Text>
            <Text className="text-[11px] text-[#6B7280]">More &gt;</Text>
          </View>
          <View className="items-center py-6">
            <View className="h-24 w-24 rounded-3xl bg-[#EEF2FF] items-center justify-center mb-2">
              <Ionicons name="planet-outline" size={32} color="#9CA3AF" />
            </View>
            <Text className="text-[12px] text-[#9CA3AF]">
              No invitations yet
            </Text>
          </View>
          <View className="mt-3 flex-row items-center justify-between">
            <Text className="text-[11px] text-[#6B7280]">
              My ID: 68975261
            </Text>
            <View className="h-10 w-10 rounded-xl border border-gray-200 items-center justify-center">
              <Ionicons name="qr-code-outline" size={20} color="#111827" />
            </View>
          </View>
        </View>

        {/* CTA button */}
        <Pressable className="mt-6 rounded-full bg-[#F97316] py-3.5 items-center justify-center">
          <Text className="text-[15px] font-semibold text-white">
            Invite Now
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View className="flex-1 items-center">
    <Text className="text-[18px] font-semibold text-[#111827]">{value}</Text>
    <Text className="mt-1 text-[11px] text-[#6B7280]">{label}</Text>
  </View>
);

export default InviteScreen;
