// src/screens/AboutGoldLiveScreen.tsx
import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "../navigation/ProfileStackNavigator";
import { Alert } from "react-native";

type Nav = NativeStackNavigationProp<ProfileStackParamList, "AboutGoldLive">;

const AboutGoldLiveScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();

  const handleItemPress = (label: string) => {
    Alert.alert(label, `${label} page will be added later for Gold Live.`);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-4 pt-3 pb-2 border-b border-gray-100">
        <Pressable
          onPress={() => navigation.goBack()}
          className="mr-3 h-9 w-9 items-center justify-center rounded-full"
        >
          <Ionicons name="chevron-back" size={20} color="#111827" />
        </Pressable>
        <Text className="text-[18px] font-semibold text-[#111827]">
          About Gold Live
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* App logo & version */}
        <View className="items-center mt-6 mb-6">
          <View className="h-80 w-80 items-center justify-center">
            {/* simple GL badge – replace with real logo later */}
            <View className="h-24 w-24 rounded-3xl bg-[#4F46E5] items-center justify-center">
              <Text className="text-[28px] font-bold text-white">GL</Text>
            </View>
          </View>
          <Text className="mt-3 text-[13px] text-[#6B7280]">
            GOLD LIVE 1.0.0
          </Text>
        </View>

        {/* Info rows */}
        <InfoRow
          label="Privacy Policy"
          onPress={() => handleItemPress("Privacy Policy")}
        />
        <InfoRow
          label="Terms Of Service"
          onPress={() => handleItemPress("Terms Of Service")}
        />
        <InfoRow
          label="Live Agreement"
          onPress={() => handleItemPress("Live Agreement")}
        />
        <InfoRow
          label="User Recharge Agreement"
          onPress={() => handleItemPress("User Recharge Agreement")}
        />
        <InfoRow
          label="No Child Endangerment Policy"
          onPress={() => handleItemPress("No Child Endangerment Policy")}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const InfoRow: React.FC<{ label: string; onPress?: () => void }> = ({
  label,
  onPress,
}) => (
  <Pressable
    onPress={onPress}
    className="px-2 py-3 border-b border-[#E5E7EB] flex-row items-center justify-between"
  >
    <Text className="text-[14px] text-[#111827]">{label}</Text>
    <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
  </Pressable>
);

export default AboutGoldLiveScreen;
