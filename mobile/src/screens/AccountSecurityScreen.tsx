// src/screens/AccountSecurityScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "../navigation/ProfileStackNavigator";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
          securityLevel: (json.securityLevel as SecurityInfo["securityLevel"]) || "Low",
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

  const handleCancelAccount = () => {
    Alert.alert(
      "Cancel account",
      "Account cancellation flow will be implemented later."
    );
  };

  const levelText = `Your account security level is ${security.securityLevel.toLowerCase()}.`;

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
          Account and security
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
            Binding a mobile number or email can raise your security level.
          </Text>
        </View>

        {/* rows */}
        <View className="mt-2">
          <AccountRow
            label="Set password"
            trailing={security.hasPassword ? "Modify" : "Set"}
            onPress={() => navigation.navigate("SecurityPassword")}
          />
          <Divider />
          <AccountRow
            label="Phone number"
            trailing={security.hasPhone ? "Bound" : "Bind"}
            onPress={() => navigation.navigate("BindPhone")}
          />
          <Divider />
          <AccountRow
            label="Email"
            trailing={security.hasEmail ? "Bound" : "Bind"}
            showRedDot={!security.hasEmail}
            onPress={() => navigation.navigate("BindEmail")}
          />
          <Divider />
          <AccountRow
            label="Google"
            trailing={security.boundGoogle ? "Bound" : "Bind"}
            onPress={() => navigation.navigate("BindGoogle")}
          />
          <Divider />
          <AccountRow
            label="Facebook"
            trailing={security.boundFacebook ? "Bound" : "Bind"}
            onPress={() => navigation.navigate("BindFacebook")}
          />
          <Divider />
          <AccountRow
            label="Instagram"
            trailing={security.boundInstagram ? "Bound" : "Bind"}
            onPress={() => navigation.navigate("BindInstagram")}
          />
          <Divider />
          <AccountRow
            label="TikTok"
            trailing={security.boundTiktok ? "Bound" : "Bind"}
            onPress={() => navigation.navigate("BindTiktok")}
          />
          <Divider />
          <AccountRow
            label="Device management"
            onPress={() => navigation.navigate("DeviceManagement")}
          />
        </View>

        {/* cancel account button – red bg, white text */}
        <Pressable
          onPress={handleCancelAccount}
          className="mt-6 mx-4 h-11 rounded-full bg-[#EF4444] items-center justify-center"
        >
          <Text className="text-[14px] font-semibold text-white">
            Cancel account
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
