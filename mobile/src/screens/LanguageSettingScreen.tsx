// src/screens/LanguageSettingScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "../navigation/ProfileStackNavigator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config";
import { applyLanguage, t, type AppLangCode } from "../i18n";

type Nav = NativeStackNavigationProp<ProfileStackParamList, "LanguageSetting">;

const LANG_OPTIONS: { label: string; value: AppLangCode }[] = [
  { label: "Follow system", value: "system" },
  { label: "English", value: "en" },
  { label: "繁體中文", value: "zh-Hant" },
  { label: "العربية", value: "ar" },
  { label: "اردو", value: "ur" },
  { label: "Português", value: "pt" },
  { label: "Español", value: "es" },
];

const LanguageSettingScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [selected, setSelected] = useState<AppLangCode>("system");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadLang = async () => {
      try {
        setLoading(true);

        // first try local
        const local = (await AsyncStorage.getItem("gl_language")) as AppLangCode | null;
        if (local) setSelected(local);

        // then sync from backend (if user exists)
        const userId = await AsyncStorage.getItem("gl_user_id");
        if (!userId) return;

        const res = await fetch(
          `${API_BASE_URL}/api/settings/language?userId=${encodeURIComponent(userId)}`
        );

        if (!res.ok) return;
        const json = await res.json();

        const lang = String(json.language || "system") as AppLangCode;
        setSelected(lang);

        // apply immediately
        await AsyncStorage.setItem("gl_language", lang);
        applyLanguage(lang);
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
        Alert.alert("Error", t("errors.userNotFound"));
        return;
      }

      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/api/settings/language`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, language: selected }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        Alert.alert("Error", json?.error ?? t("errors.updateFailed"));
        return;
      }

      await AsyncStorage.setItem("gl_language", selected);
      applyLanguage(selected);

      navigation.goBack();
    } catch (e) {
      console.error("update language error", e);
      Alert.alert("Error", t("errors.updateFailed"));
    } finally {
      setLoading(false);
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
          {t("settings.language.title")}
        </Text>

        <Pressable onPress={handleOk} disabled={loading}>
          <Text className="text-[14px] text-[#6366F1] font-semibold">
            {loading ? t("common.loading") : t("common.ok")}
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
