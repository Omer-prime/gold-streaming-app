import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const FollowUsScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-4 pt-3 pb-2">
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </Pressable>
        <Text className="flex-1 text-center text-[16px] font-semibold text-[#111827]">
          Follow Us
        </Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero card */}
        <View className="mt-4 mx-4 rounded-3xl bg-[#EEF2FF] px-4 py-4 flex-row">
          <View className="flex-1 mr-3">
            <Text className="text-[16px] font-semibold text-[#111827]">
              POPPO LIVE Global Community
            </Text>
            <Text className="mt-2 text-[12px] text-gray-600">
              Discover premium content and connect with people from all over
              the world. Join the communities below and start your social
              journey!
            </Text>
          </View>
          <View className="items-center justify-center">
            <Ionicons name="globe-outline" size={40} color="#6366F1" />
          </View>
        </View>

        {/* Recommended communities */}
        <View className="mt-6 px-4">
          <Text className="text-[14px] font-semibold text-[#111827] mb-3">
            Recommended Communities
          </Text>

          <View className="flex-row">
            <CommunityButton label="Facebook" icon="logo-facebook" />
            <CommunityButton label="YouTube" icon="logo-youtube" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const CommunityButton: React.FC<{
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = ({ label, icon }) => (
  <Pressable className="flex-1 mr-3 last:mr-0 rounded-2xl bg-white px-4 py-3 flex-row items-center shadow-sm shadow-black/5">
    <Ionicons name={icon} size={22} color="#2563EB" />
    <Text className="ml-2 text-[14px] text-[#111827]">{label}</Text>
  </Pressable>
);

export default FollowUsScreen;
