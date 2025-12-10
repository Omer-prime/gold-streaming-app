import React, { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

type LevelTab = "Wealth" | "Live";

const LevelScreen: React.FC = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<LevelTab>("Wealth");

  return (
    <SafeAreaView className="flex-1 bg-[#022c22]" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-4 pt-3 pb-2">
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#F9FAFB" />
        </Pressable>
        <Text className="flex-1 text-center text-[16px] font-semibold text-[#F9FAFB]">
          {activeTab === "Wealth" ? "Wealth level" : "Livestream level"}
        </Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Top switch */}
      <View className="flex-row justify-center mt-1">
        <LevelSwitch
          label="Wealth level"
          active={activeTab === "Wealth"}
          onPress={() => setActiveTab("Wealth")}
        />
        <LevelSwitch
          label="Livestream level"
          active={activeTab === "Live"}
          onPress={() => setActiveTab("Live")}
        />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Main level card */}
        <LinearGradient
          colors={["#065f46", "#0f766e"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            marginHorizontal: 16,
            marginTop: 12,
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingVertical: 18,
          }}
        >
          <Text className="text-[12px] text-emerald-100">
            {activeTab === "Wealth" ? "Wealth level" : "Livestream level"}
          </Text>
          <View className="mt-2 flex-row items-center justify-between">
            <Text className="text-[26px] font-bold text-white">Lv.1</Text>
            <View className="h-14 w-14 rounded-2xl bg-white/10 items-center justify-center">
              <Ionicons name="triangle" size={28} color="#4ADE80" />
            </View>
          </View>
          <View className="mt-3 h-2 rounded-full bg-black/30 overflow-hidden">
            <View className="h-full w-[10%] rounded-full bg-[#4ADE80]" />
          </View>
          <Text className="mt-1 text-[11px] text-emerald-100">
            The distance to upgrade · 3,000
          </Text>
        </LinearGradient>

        {activeTab === "Wealth" ? <WealthSection /> : <LiveSection />}
      </ScrollView>
    </SafeAreaView>
  );
};

const LevelSwitch: React.FC<{
  label: string;
  active: boolean;
  onPress: () => void;
}> = ({ label, active, onPress }) => (
  <Pressable onPress={onPress} className="mx-3 pb-1">
    <Text
      className={`text-[14px] ${
        active ? "text-white font-semibold" : "text-emerald-200"
      }`}
    >
      {label}
    </Text>
    {active && <View className="h-[2px] bg-white mt-1 rounded-full" />}
  </Pressable>
);

const WealthSection: React.FC = () => (
  <View className="mt-4 px-4">
    {/* My benefits */}
    <View className="rounded-2xl bg-black/30 px-4 py-3 mb-4">
      <Text className="text-[13px] text-emerald-100 mb-2">My Benefits</Text>
      <View className="rounded-xl bg-black/40 px-4 py-3">
        <Text className="text-[12px] text-emerald-300 mb-1">
          Entry special effect
        </Text>
        <Text className="text-[11px] text-emerald-200">
          Check for details &gt;
        </Text>
      </View>
    </View>

    {/* Locked benefits */}
    <LockedLevels />
  </View>
);

const LiveSection: React.FC = () => (
  <View className="mt-4 px-4">
    <LockedLevels />
  </View>
);

const LockedLevels: React.FC = () => (
  <View>
    <Text className="text-[13px] text-emerald-100 mb-2">Locked Benefits</Text>
    {["Lv.5", "Lv.10", "Lv.15", "Lv.20"].map((level) => (
      <View
        key={level}
        className="mb-2 rounded-2xl bg-black/30 px-4 py-3 flex-row items-center justify-between"
      >
        <View>
          <Text className="text-[13px] text-emerald-50">{level}</Text>
          <Text className="text-[11px] text-emerald-200 mt-1">
            {level} benefits will unlock at {level}.
          </Text>
        </View>
        <Ionicons name="lock-closed-outline" size={18} color="#A7F3D0" />
      </View>
    ))}
  </View>
);

export default LevelScreen;
