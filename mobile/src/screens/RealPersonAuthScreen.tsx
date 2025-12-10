// src/screens/RealPersonAuthScreen.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const RealPersonAuthScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const handleStart = () => {
    // go to green face scan screen
    navigation.navigate("FaceScan" as never);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-4 pt-3 pb-2">
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </Pressable>
        <View className="flex-1 items-center">
          <Text className="text-[16px] font-semibold text-[#111827]">
            Auth
          </Text>
        </View>
        <View className="w-6" />
      </View>

      <View className="flex-1 px-6 pt-6">
        {/* Big avatar circle */}
        <View className="items-center mb-8">
          <View className="h-32 w-32 rounded-full bg-[#EEF2FF] items-center justify-center mb-4">
            <MaterialCommunityIcons
              name="face-recognition"
              size={46}
              color="#6366F1"
            />
          </View>
          <Text className="text-[18px] font-semibold text-[#111827] text-center">
            Real-person verification will begin soon.
          </Text>
          <Text className="mt-2 text-[13px] text-[#6B7280] text-center">
            Please ensure you are the user
          </Text>
        </View>

        {/* 3 tips row */}
        <View className="flex-row justify-between mt-4 mb-10">
          <View className="items-center flex-1">
            <View className="h-10 w-10 rounded-full bg-[#EEF2FF] items-center justify-center mb-2">
              <Ionicons name="eye-outline" size={20} color="#6366F1" />
            </View>
            <Text className="text-[11px] text-[#6B7280] text-center">
              Avoid cover
            </Text>
          </View>

          <View className="items-center flex-1">
            <View className="h-10 w-10 rounded-full bg-[#EEF2FF] items-center justify-center mb-2">
              <Ionicons name="sunny-outline" size={20} color="#6366F1" />
            </View>
            <Text className="text-[11px] text-[#6B7280] text-center">
              Keep enough light
            </Text>
          </View>

          <View className="items-center flex-1">
            <View className="h-10 w-10 rounded-full bg-[#EEF2FF] items-center justify-center mb-2">
              <MaterialCommunityIcons
                name="account-cancel-outline"
                size={20}
                color="#6366F1"
              />
            </View>
            <Text className="text-[11px] text-[#6B7280] text-center">
              Minors are prohibited
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom CTA */}
      <View className="px-6 pb-6">
        <Pressable
          className="rounded-full bg-[#6366F1] py-3"
          onPress={handleStart}
        >
          <Text className="text-center text-[14px] font-semibold text-white">
            Start to certificate
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default RealPersonAuthScreen;
