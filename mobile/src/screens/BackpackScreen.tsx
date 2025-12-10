import React, { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

type OutfitTab = "Backpack" | "Avatar" | "Party";

const BackpackScreen: React.FC = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<OutfitTab>("Backpack");

  const emptyLabel =
    activeTab === "Backpack"
      ? "No backpack gift yet"
      : activeTab === "Avatar"
      ? "No avatar frame yet"
      : "No party theme yet";

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-4 pt-3 pb-2">
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </Pressable>
        <Text className="flex-1 text-center text-[16px] font-semibold text-[#111827]">
          My outfit
        </Text>
        <Pressable>
          <Ionicons name="menu-outline" size={20} color="#111827" />
        </Pressable>
      </View>

      {/* Top tabs */}
      <View className="flex-row px-4 mt-1">
        <OutfitTabButton
          label="Backpack Gifts"
          active={activeTab === "Backpack"}
          onPress={() => setActiveTab("Backpack")}
        />
        <OutfitTabButton
          label="Avatar Frame"
          active={activeTab === "Avatar"}
          onPress={() => setActiveTab("Avatar")}
        />
        <OutfitTabButton
          label="Party Theme"
          active={activeTab === "Party"}
          onPress={() => setActiveTab("Party")}
        />
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 items-center justify-center">
          <View className="h-40 w-40 rounded-full bg-[#EEF2FF] items-center justify-center">
            <Ionicons name="gift-outline" size={64} color="#6C4DFF" />
          </View>
          <Text className="mt-4 text-[13px] text-gray-400">{emptyLabel}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const OutfitTabButton: React.FC<{
  label: string;
  active: boolean;
  onPress: () => void;
}> = ({ label, active, onPress }) => (
  <Pressable onPress={onPress} className="mr-4 pb-1">
    <Text
      className={`text-[14px] ${
        active ? "text-[#111827] font-semibold" : "text-gray-400"
      }`}
    >
      {label}
    </Text>
    {active && <View className="h-[2px] bg-[#6C4DFF] mt-1 rounded-full" />}
  </Pressable>
);

export default BackpackScreen;
