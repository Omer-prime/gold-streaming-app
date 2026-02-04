// src/screens/SettingsScreen.tsx
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "../navigation/ProfileStackNavigator";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ✅ use your i18n helper (same as LanguageSettingScreen)
import { t } from "../i18n";

type Nav = NativeStackNavigationProp<ProfileStackParamList, "Settings">;

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://192.168.10.25:3000";

type SecurityInfo = {
  securityLevel: "Low" | "Medium" | "High";
};

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();

  const [security, setSecurity] = useState<SecurityInfo>({
    securityLevel: "Low",
  });

  const [loadingSecurity, setLoadingSecurity] = useState(false);

  useEffect(() => {
    const loadSecurity = async () => {
      try {
        setLoadingSecurity(true);
        const userId = await AsyncStorage.getItem("gl_user_id");
        if (!userId) return;

        const res = await fetch(
          `${API_BASE_URL}/api/settings/security?userId=${encodeURIComponent(
            userId
          )}`
        );
        if (!res.ok) return;
        const json = await res.json();

        setSecurity({
          securityLevel:
            (json.securityLevel as SecurityInfo["securityLevel"]) || "Low",
        });
      } catch (e) {
        console.warn("loadSecurity error", e);
      } finally {
        setLoadingSecurity(false);
      }
    };

    loadSecurity();
  }, []);

  const securityColor =
    security.securityLevel === "High"
      ? "#22C55E"
      : security.securityLevel === "Medium"
      ? "#F97316"
      : "#EF4444";

  const securityLevelText = useMemo(() => {
    if (loadingSecurity) return t("common.loading");
    if (security.securityLevel === "High") return t("settings.security.levelHigh");
    if (security.securityLevel === "Medium") return t("settings.security.levelMedium");
    return t("settings.security.levelLow");
  }, [loadingSecurity, security.securityLevel]);

  const securitySubLabel = useMemo(() => {
    // "Security level: High"
    return `${t("settings.security.levelPrefix")} ${securityLevelText}`;
  }, [securityLevelText]);

  const handleClearCache = () => {
    Alert.alert(
      t("settings.actions.clearCacheTitle"),
      t("settings.actions.clearCacheMsg"),
      [{ text: t("common.ok") }]
    );
  };

  const doResetToLogin = async () => {
    await AsyncStorage.multiRemove([
      "gl_user_id",
      "gl_auth_token",
      "gl_profile_completed",
    ]);
    // @ts-ignore – root navigator has Login route
    navigation.getParent()?.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  const handleSwitchAccount = () => {
    Alert.alert(
      t("settings.actions.switchAccountTitle"),
      t("settings.actions.switchAccountMsg"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("settings.actions.switch"),
          style: "destructive",
          onPress: doResetToLogin,
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      t("settings.actions.logoutTitle"),
      t("settings.actions.logoutMsg"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("settings.actions.logout"),
          style: "destructive",
          onPress: doResetToLogin,
        },
      ]
    );
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
          {t("settings.title")}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      >
        {/* Account & Security card */}
        <View className="rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] mb-4 overflow-hidden">
          <SettingsRow
            label={t("settings.items.accountAndSecurity")}
            subLabel={securitySubLabel}
            subLabelColor={securityColor}
            showDangerDot={!loadingSecurity && security.securityLevel === "Low"}
            onPress={() => navigation.navigate("AccountSecurity")}
          />
          <Divider />
          <SettingsRow
            label={t("settings.items.securityPassword")}
            onPress={() => navigation.navigate("SecurityPassword")}
          />
          <Divider />
          <SettingsRow
            label={t("settings.items.languageSetting")}
            onPress={() => navigation.navigate("LanguageSetting")}
          />
        </View>

        {/* Middle block */}
        <View className="rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] mb-4 overflow-hidden">
          <SettingsRow
            label={t("settings.items.blacklist")}
            onPress={() => navigation.navigate("Blacklist")}
          />
          <Divider />
          <SettingsRow
            label={t("settings.items.privilegeSettings")}
            onPress={() => navigation.navigate("PrivilegeSettings")}
          />
          <Divider />
          <SettingsRow
            label={t("settings.items.newMessagesNotification")}
            onPress={() => navigation.navigate("NewMessageNotification")}
          />
          <Divider />
          <SettingsRow
            label={t("settings.items.privacy")}
            onPress={() => navigation.navigate("PrivacySettings")}
          />
        </View>

        {/* Version / about / cache */}
        <View className="rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] mb-6 overflow-hidden">
          <SettingsRow
            label={t("settings.items.version")}
            trailingText={t("settings.versionText")}
          />
          <Divider />
          <SettingsRow
            label={t("settings.items.aboutGoldLive")}
            onPress={() => navigation.navigate("AboutGoldLive")}
          />
          <Divider />
          <SettingsRow
            label={t("settings.items.clearCache")}
            onPress={handleClearCache}
          />
        </View>

        {/* Buttons */}
        <Pressable
          className="mb-3 h-11 rounded-full border border-red-400 items-center justify-center"
          onPress={handleSwitchAccount}
        >
          <Text className="text-[14px] font-semibold text-red-500">
            {t("settings.actions.switchAccountBtn")}
          </Text>
        </Pressable>

        <Pressable
          className="h-11 rounded-full bg-[#3B82F6] items-center justify-center"
          onPress={handleLogout}
        >
          <Text className="text-[14px] font-semibold text-white">
            {t("settings.actions.logoutBtn")}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

type RowProps = {
  label: string;
  subLabel?: string;
  subLabelColor?: string;
  showDangerDot?: boolean;
  trailingText?: string;
  onPress?: () => void;
};

const SettingsRow: React.FC<RowProps> = ({
  label,
  subLabel,
  subLabelColor,
  showDangerDot,
  trailingText,
  onPress,
}) => (
  <Pressable
    className="px-4 py-3 flex-row items-center justify-between"
    onPress={onPress}
  >
    <View>
      <Text className="text-[14px] text-[#111827]">{label}</Text>
      {subLabel ? (
        <View className="mt-1 flex-row items-center">
          {showDangerDot && (
            <View className="h-1.5 w-1.5 rounded-full bg-red-500 mr-1" />
          )}
          <Text
            className="text-[11px]"
            style={{ color: subLabelColor ?? "#9CA3AF" }}
          >
            {subLabel}
          </Text>
        </View>
      ) : null}
    </View>

    <View className="flex-row items-center">
      {trailingText ? (
        <Text className="mr-2 text-[12px] text-[#6B7280]">
          {trailingText}
        </Text>
      ) : null}
      <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
    </View>
  </Pressable>
);

const Divider: React.FC = () => <View className="h-px bg-[#E5E7EB]" />;

export default SettingsScreen;
