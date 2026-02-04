// src/screens/AccountSecurityScreen.tsx
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "../navigation/ProfileStackNavigator";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { t } from "../i18n";

type Nav = NativeStackNavigationProp<ProfileStackParamList, "AccountSecurity">;

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://192.168.10.25:3000";

type SecurityInfo = {
  securityLevel: "Low" | "Medium" | "High";
  hasPassword: boolean;
  hasEmail: boolean;
  hasPhone: boolean;
  boundGoogle: boolean;
  boundFacebook: boolean;
  boundInstagram: boolean;
  boundTiktok: boolean;
};

const AccountSecurityScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();

  const [security, setSecurity] = useState<SecurityInfo>({
    securityLevel: "Low",
    hasPassword: false,
    hasEmail: false,
    hasPhone: false,
    boundGoogle: false,
    boundFacebook: false,
    boundInstagram: false,
    boundTiktok: false,
  });

  useEffect(() => {
    const loadSecurity = async () => {
      try {
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
          hasPassword: !!json.hasPassword,
          hasEmail: !!json.hasEmail,
          hasPhone: !!json.hasPhone,
          boundGoogle: !!json.boundGoogle,
          boundFacebook: !!json.boundFacebook,
          boundInstagram: !!json.boundInstagram,
          boundTiktok: !!json.boundTiktok,
        });
      } catch (e) {
        console.warn("loadSecurity error", e);
      }
    };

    loadSecurity();
  }, []);

  const securityLevelText = useMemo(() => {
    if (security.securityLevel === "High")
      return t("settings.security.levelHigh");
    if (security.securityLevel === "Medium")
      return t("settings.security.levelMedium");
    return t("settings.security.levelLow");
  }, [security.securityLevel]);

  const levelText = useMemo(() => {
    // "Your account security level is low."
    return t("accountSecurity.levelText", {
      level: securityLevelText.toLowerCase(),
    });
  }, [securityLevelText]);

  const handleCancelAccount = () => {
    Alert.alert(
      t("accountSecurity.cancel.title"),
      t("accountSecurity.cancel.msg")
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
          {t("accountSecurity.title")}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* warning */}
        <View className="px-4 py-3 bg-[#FEF2F2]">
          <Text className="text-[12px] text-[#B91C1C]">{levelText}</Text>
        </View>

        {/* tip */}
        <View className="px-4 py-3 bg-[#F9FAFB] border-b border-[#E5E7EB]">
          <Text className="text-[11px] text-[#6B7280]">
            {t("accountSecurity.tip")}
          </Text>
        </View>

        {/* rows */}
        <View className="mt-2">
          <AccountRow
            label={t("accountSecurity.rows.setPassword")}
            trailing={
              security.hasPassword
                ? t("accountSecurity.trailing.modify")
                : t("accountSecurity.trailing.set")
            }
            onPress={() => navigation.navigate("SecurityPassword")}
          />
          <Divider />
          <AccountRow
            label={t("accountSecurity.rows.phoneNumber")}
            trailing={
              security.hasPhone
                ? t("accountSecurity.trailing.bound")
                : t("accountSecurity.trailing.bind")
            }
            onPress={() => navigation.navigate("BindPhone")}
          />
          <Divider />
          <AccountRow
            label={t("accountSecurity.rows.email")}
            trailing={
              security.hasEmail
                ? t("accountSecurity.trailing.bound")
                : t("accountSecurity.trailing.bind")
            }
            showRedDot={!security.hasEmail}
            onPress={() => navigation.navigate("BindEmail")}
          />
          <Divider />
          <AccountRow
            label={t("accountSecurity.rows.google")}
            trailing={
              security.boundGoogle
                ? t("accountSecurity.trailing.bound")
                : t("accountSecurity.trailing.bind")
            }
            onPress={() => navigation.navigate("BindGoogle")}
          />
          <Divider />
          <AccountRow
            label={t("accountSecurity.rows.facebook")}
            trailing={
              security.boundFacebook
                ? t("accountSecurity.trailing.bound")
                : t("accountSecurity.trailing.bind")
            }
            onPress={() => navigation.navigate("BindFacebook")}
          />
          <Divider />
          <AccountRow
            label={t("accountSecurity.rows.instagram")}
            trailing={
              security.boundInstagram
                ? t("accountSecurity.trailing.bound")
                : t("accountSecurity.trailing.bind")
            }
            onPress={() => navigation.navigate("BindInstagram")}
          />
          <Divider />
          <AccountRow
            label={t("accountSecurity.rows.tiktok")}
            trailing={
              security.boundTiktok
                ? t("accountSecurity.trailing.bound")
                : t("accountSecurity.trailing.bind")
            }
            onPress={() => navigation.navigate("BindTiktok")}
          />
          <Divider />
          <AccountRow
            label={t("accountSecurity.rows.deviceManagement")}
            onPress={() => navigation.navigate("DeviceManagement")}
          />
        </View>

        {/* cancel account button */}
        <Pressable
          onPress={handleCancelAccount}
          className="mt-6 mx-4 h-11 rounded-full bg-[#EF4444] items-center justify-center"
        >
          <Text className="text-[14px] font-semibold text-white">
            {t("accountSecurity.cancel.button")}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

type AccountRowProps = {
  label: string;
  trailing?: string;
  showRedDot?: boolean;
  onPress?: () => void;
};

const AccountRow: React.FC<AccountRowProps> = ({
  label,
  trailing,
  showRedDot,
  onPress,
}) => (
  <Pressable
    onPress={onPress}
    className="px-4 py-3 flex-row items-center justify-between bg-white"
  >
    <Text className="text-[14px] text-[#111827]">{label}</Text>
    <View className="flex-row items-center">
      {trailing ? (
        <Text className="mr-2 text-[12px] text-[#6B7280]">{trailing}</Text>
      ) : null}
      {showRedDot && (
        <View className="h-1.5 w-1.5 rounded-full bg-red-500 mr-1" />
      )}
      <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
    </View>
  </Pressable>
);

const Divider: React.FC = () => <View className="h-px bg-[#E5E7EB]" />;

export default AccountSecurityScreen;
