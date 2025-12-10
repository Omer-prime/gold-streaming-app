// src/screens/BindEmailScreen.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "../navigation/ProfileStackNavigator";

type Nav = NativeStackNavigationProp<ProfileStackParamList, "BindEmail">;

const BindEmailScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-row items-center px-4 pt-3 pb-2 border-b border-gray-100">
        <Pressable
          onPress={() => navigation.goBack()}
          className="mr-3 h-9 w-9 items-center justify-center rounded-full"
        >
          <Ionicons name="chevron-back" size={20} color="#111827" />
        </Pressable>
        <Text className="text-[18px] font-semibold text-[#111827]">
          Bind email
        </Text>
      </View>

      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-[14px] text-[#6B7280] text-center">
          Email binding UI & backend will be implemented here later for Gold
          Live.
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default BindEmailScreen;
