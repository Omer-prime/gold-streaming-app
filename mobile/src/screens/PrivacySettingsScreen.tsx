// src/screens/PrivacySettingsScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  Alert,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "../navigation/ProfileStackNavigator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { t } from "../i18n";

type Nav = NativeStackNavigationProp<ProfileStackParamList, "PrivacySettings">;



const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://192.168.10.25:3000";

const PrivacySettingsScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [hideMicStatus, setHideMicStatus] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const userId =
          (await AsyncStorage.getItem("gl_user_id")) ??
          (await AsyncStorage.getItem("userId"));

        if (!userId) return;

        const res = await fetch(
          `${API_BASE_URL}/api/settings/privacy?userId=${encodeURIComponent(userId)}`
        );
        if (!res.ok) return;
        const json = await res.json();
        setHideMicStatus(!!json.hideMicStatus);
      } catch (e) {
        console.error("load privacy settings error", e);
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

        await fetch(`${API_BASE_URL}/api/settings/privacy`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, hideMicStatus }),
        });
      } catch (e) {
        console.error("save privacy settings error", e);
      }
    };

    save();
  }, [loaded, hideMicStatus]);

  const openSystemSettings = () => {
    Linking.openSettings().catch(() => {
      Alert.alert(t("common.error"), t("privacySettings.errors.openSettingsFailed"));
    });
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
          {t("privacySettings.title")}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Live privacy */}
        <View className="px-4 pt-4 pb-1">
          <Text className="text-[11px] text-[#6B7280]">
            {t("privacySettings.sections.livePrivacy")}
          </Text>
        </View>
        <View className="px-4 py-3 border-b border-[#E5E7EB] flex-row items-center justify-between">
          <Text className="text-[14px] text-[#111827]">
            {t("privacySettings.items.hideMicStatus")}
          </Text>
          <Switch value={hideMicStatus} onValueChange={setHideMicStatus} />
        </View>

        {/* Permission privacy */}
        <View className="px-4 pt-4 pb-1">
          <Text className="text-[11px] text-[#6B7280]">
            {t("privacySettings.sections.permissionPrivacy")}
          </Text>
        </View>

        <PermissionRow
          label={t("privacySettings.permissions.camera.label")}
          subLabel={t("privacySettings.permissions.camera.subLabel")}
          trailingText={t("privacySettings.trailing.on")}
        />
        <PermissionRow
          label={t("privacySettings.permissions.voice.label")}
          subLabel={t("privacySettings.permissions.voice.subLabel")}
          trailingText={t("privacySettings.trailing.goSettings")}
          onPress={openSystemSettings}
        />
        <PermissionRow
          label={t("privacySettings.permissions.notifications.label")}
          subLabel={t("privacySettings.permissions.notifications.subLabel")}
          trailingText={t("privacySettings.trailing.goSettings")}
          onPress={openSystemSettings}
        />
        <PermissionRow
          label={t("privacySettings.permissions.bluetooth.label")}
          subLabel={t("privacySettings.permissions.bluetooth.subLabel")}
          trailingText={t("privacySettings.trailing.goSettings")}
          onPress={openSystemSettings}
        />
        <PermissionRow
          label={t("privacySettings.permissions.location.label")}
          subLabel={t("privacySettings.permissions.location.subLabel")}
          trailingText={t("privacySettings.trailing.goSettings")}
          onPress={openSystemSettings}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

type PermissionRowProps = {
  label: string;
  subLabel?: string;
  trailingText?: string;
  onPress?: () => void;
};

const PermissionRow: React.FC<PermissionRowProps> = ({
  label,
  subLabel,
  trailingText,
  onPress,
}) => (
  <Pressable
    onPress={onPress}
    className="px-4 py-3 border-b border-[#E5E7EB] flex-row items-center justify-between"
  >
    <View className="flex-1 mr-3">
      <Text className="text-[14px] text-[#111827]">{label}</Text>
      {subLabel ? (
        <Text className="mt-1 text-[11px] text-[#6B7280]">{subLabel}</Text>
      ) : null}
    </View>
    {trailingText ? (
      <Text className="text-[12px] text-[#6366F1]">{trailingText}</Text>
    ) : null}
  </Pressable>
);

export default PrivacySettingsScreen;
