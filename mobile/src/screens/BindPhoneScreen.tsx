// src/screens/BindPhoneScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "../navigation/ProfileStackNavigator";

type Nav = NativeStackNavigationProp<ProfileStackParamList, "BindPhone">;

const BindPhoneScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [phone, setPhone] = useState("");
  const countryCode = "+92"; // static for now

  const isValid = phone.trim().length >= 7;

  const handleNext = () => {
    if (!isValid) return;
    Alert.alert(
      "Bind phone",
      `Backend flow will send a code to ${countryCode} ${phone}.`
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        {/* Top banner similar vibe to Poppo but with Gold Live name */}
        <LinearGradient
          colors={["#4F46E5", "#6366F1"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }}
        >
          <View className="flex-row items-center">
            <Pressable
              onPress={() => navigation.goBack()}
              className="h-9 w-9 rounded-full bg-white/10 items-center justify-center mr-2"
            >
              <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
            </Pressable>
            <Text className="text-[18px] font-semibold text-white">
              Bind a phone
            </Text>
          </View>

          <Text className="mt-6 text-[14px] text-indigo-100 max-w-[260px]">
            Bind your mobile number to protect your Gold Live account and make
            login easier.
          </Text>
        </LinearGradient>

        {/* Form area */}
        <View className="flex-1 px-6 mt-6">
          <Text className="text-[16px] font-semibold text-[#111827] mb-3">
            Bind a phone
          </Text>

          {/* Phone input container */}
          <View className="flex-row items-center rounded-full border border-[#A5B4FC] px-3 py-2">
            <Pressable className="flex-row items-center mr-2">
              <Text className="text-[14px] text-[#111827] mr-1">
                🇵🇰 {countryCode}
              </Text>
              <Ionicons name="chevron-down" size={14} color="#6B7280" />
            </Pressable>
            <View className="h-6 w-px bg-[#E5E7EB] mr-2" />
            <TextInput
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="Please enter your phone number"
              placeholderTextColor="#9CA3AF"
              className="flex-1 text-[14px] text-[#111827]"
            />
          </View>

          {/* Next button */}
          <Pressable
            onPress={handleNext}
            disabled={!isValid}
            className={`mt-8 h-11 rounded-full items-center justify-center ${
              isValid ? "bg-[#6366F1]" : "bg-[#E5E7EB]"
            }`}
          >
            <Text
              className={`text-[14px] font-semibold ${
                isValid ? "text-white" : "text-[#9CA3AF]"
              }`}
            >
              Next
            </Text>
          </Pressable>

          {/* terms */}
          <Text className="mt-4 text-[11px] text-center text-[#6B7280]">
            I have read and agreed to the{" "}
            <Text className="text-[#4F46E5]">Gold Live Terms of Service</Text>{" "}
            and{" "}
            <Text className="text-[#4F46E5]">Privacy Policy</Text>.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default BindPhoneScreen;
