// src/screens/LanguageSettingScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "../navigation/ProfileStackNavigator";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Nav = NativeStackNavigationProp<
  ProfileStackParamList,
  "LanguageSetting"
>;

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://192.168.10.25:3000";

const LANG_OPTIONS = [
  { label: "Follow system", value: "system" },
  { label: "English", value: "en" },
  { label: "繁體中文", value: "zh-Hant" },
  { label: "Tiếng Việt", value: "vi" },
  { label: "हिंदी", value: "hi" },
  { label: "Bahasa Indonesia", value: "id" },
  { label: "العربية", value: "ar" },
  { label: "اردو", value: "ur" },
  { label: "Português", value: "pt" },
  { label: "Türkçe", value: "tr" },
  { label: "বাংলা", value: "bn" },
  { label: "ภาษาไทย", value: "th" },
  { label: "नेपाली", value: "ne" },
  { label: "Français", value: "fr" },
  { label: "Español", value: "es" },
];

const LanguageSettingScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [selected, setSelected] = useState<string>("system");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadLang = async () => {
      try {
        setLoading(true);
        const userId = await AsyncStorage.getItem("gl_user_id");
        if (!userId) return;

        const res = await fetch(
          `${API_BASE_URL}/api/settings/language?userId=${encodeURIComponent(
            userId
          )}`
        );
        if (!res.ok) return;
        const json = await res.json();
        if (json.language) {
          setSelected(String(json.language));
        }
      } catch (e) {
        console.warn("load language error", e);
      } finally {
        setLoading(false);
      }
    };

    loadLang();
  }, []);

  const handleOk = async () => {
    try {
      const userId = await AsyncStorage.getItem("gl_user_id");
      if (!userId) {
        Alert.alert("Error", "User not found, please login again.");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/settings/language`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, language: selected }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        Alert.alert("Error", json?.error ?? "Failed to update language");
        return;
      }

      await AsyncStorage.setItem("gl_language", selected);

      // TODO: if you integrate i18n, call i18n.changeLanguage(selected) here.
      navigation.goBack();
    } catch (e) {
      console.error("update language error", e);
      Alert.alert("Error", "Failed to update language.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-3 pb-2 border-b border-gray-100">
        <Pressable
          onPress={() => navigation.goBack()}
          className="h-9 w-9 items-center justify-center rounded-full"
        >
          <Ionicons name="chevron-back" size={20} color="#111827" />
        </Pressable>
        <Text className="text-[18px] font-semibold text-[#111827]">
          Language Setting
        </Text>
        <Pressable onPress={handleOk} disabled={loading}>
          <Text className="text-[14px] text-[#6366F1] font-semibold">
            {loading ? "..." : "OK"}
          </Text>
        </Pressable>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {LANG_OPTIONS.map((opt) => {
          const active = opt.value === selected;
          return (
            <Pressable
              key={opt.value}
              onPress={() => setSelected(opt.value)}
              className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100"
            >
              <Text className="text-[14px] text-[#111827]">{opt.label}</Text>
              <Ionicons
                name={active ? "radio-button-on" : "radio-button-off"}
                size={20}
                color={active ? "#4F46E5" : "#D1D5DB"}
              />
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

export default LanguageSettingScreen;
