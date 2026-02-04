// src/screens/PrivilegeSettingsScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "../navigation/ProfileStackNavigator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { t } from "../i18n";

type Nav = NativeStackNavigationProp<ProfileStackParamList, "PrivilegeSettings">;



const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://192.168.10.25:3000";

const PrivilegeSettingsScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();

  const [invisibleVisitor, setInvisibleVisitor] = useState(false);
  const [mysteryLive, setMysteryLive] = useState(false);
  const [mysteryRank, setMysteryRank] = useState(false);
  const [invisibleOnline, setInvisibleOnline] = useState(false);
  const [exclusiveEmail, setExclusiveEmail] = useState(false);
  const [hideLiveLevel, setHideLiveLevel] = useState(false);

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const userId =
          (await AsyncStorage.getItem("gl_user_id")) ??
          (await AsyncStorage.getItem("userId"));

        if (!userId) return;

        const res = await fetch(
          `${API_BASE_URL}/api/settings/privileges?userId=${encodeURIComponent(userId)}`
        );
        if (!res.ok) return;
        const json = await res.json();

        setInvisibleVisitor(!!json.invisibleVisitor);
        setMysteryLive(!!json.mysteryLive);
        setMysteryRank(!!json.mysteryRank);
        setInvisibleOnline(!!json.invisibleOnline);
        setExclusiveEmail(!!json.exclusiveEmail);
        setHideLiveLevel(!!json.hideLiveLevel);
      } catch (e) {
        console.error("load privilege settings error", e);
      } finally {
        setLoaded(true);
      }
    };

    load();
  }, []);

  useEffect(() => {
    if (!loaded) return;

    const save = async () => {
      try {
        const userId =
          (await AsyncStorage.getItem("gl_user_id")) ??
          (await AsyncStorage.getItem("userId"));

        if (!userId) return;

        await fetch(`${API_BASE_URL}/api/settings/privileges`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            invisibleVisitor,
            mysteryLive,
            mysteryRank,
            invisibleOnline,
            exclusiveEmail,
            hideLiveLevel,
          }),
        });
      } catch (e) {
        console.error("save privilege settings error", e);
      }
    };

    save();
  }, [
    loaded,
    invisibleVisitor,
    mysteryLive,
    mysteryRank,
    invisibleOnline,
    exclusiveEmail,
    hideLiveLevel,
  ]);

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
          {t("privilegeSettings.title")}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <ToggleRow
          label={t("privilegeSettings.items.invisibleVisitor.label")}
          description={t("privilegeSettings.items.invisibleVisitor.description")}
          value={invisibleVisitor}
          onValueChange={setInvisibleVisitor}
        />
        <ToggleRow
          label={t("privilegeSettings.items.mysteryLive.label")}
          description={t("privilegeSettings.items.mysteryLive.description")}
          value={mysteryLive}
          onValueChange={setMysteryLive}
        />
        <ToggleRow
          label={t("privilegeSettings.items.mysteryRank.label")}
          description={t("privilegeSettings.items.mysteryRank.description")}
          value={mysteryRank}
          onValueChange={setMysteryRank}
        />
        <ToggleRow
          label={t("privilegeSettings.items.invisibleOnline.label")}
          description={t("privilegeSettings.items.invisibleOnline.description")}
          value={invisibleOnline}
          onValueChange={setInvisibleOnline}
        />
        <ToggleRow
          label={t("privilegeSettings.items.exclusiveEmail.label")}
          description={t("privilegeSettings.items.exclusiveEmail.description")}
          value={exclusiveEmail}
          onValueChange={setExclusiveEmail}
        />
        <ToggleRow
          label={t("privilegeSettings.items.hideLiveLevel.label")}
          description={t("privilegeSettings.items.hideLiveLevel.description")}
          value={hideLiveLevel}
          onValueChange={setHideLiveLevel}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

type ToggleRowProps = {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
};

const ToggleRow: React.FC<ToggleRowProps> = ({
  label,
  description,
  value,
  onValueChange,
}) => (
  <View className="px-4 py-3 border-b border-[#E5E7EB] flex-row items-center justify-between">
    <View className="flex-1 mr-3">
      <Text className="text-[14px] text-[#111827]">{label}</Text>
      {description ? (
        <Text className="mt-1 text-[11px] text-[#6B7280]">{description}</Text>
      ) : null}
    </View>
    <Switch value={value} onValueChange={onValueChange} />
  </View>
);

export default PrivilegeSettingsScreen;
