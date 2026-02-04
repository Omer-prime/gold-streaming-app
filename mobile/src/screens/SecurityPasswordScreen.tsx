// src/screens/SecurityPasswordScreen.tsx
import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "../navigation/ProfileStackNavigator";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { t } from "../i18n";

type Nav = NativeStackNavigationProp<ProfileStackParamList, "SecurityPassword">;

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://192.168.10.25:3000";

const SecurityPasswordScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!newPwd || !confirmPwd) {
      Alert.alert(t("securityPassword.errors.title"), t("securityPassword.errors.enterNew"));
      return;
    }
    if (newPwd !== confirmPwd) {
      Alert.alert(t("securityPassword.errors.title"), t("securityPassword.errors.mismatch"));
      return;
    }

    try {
      setSaving(true);
      const userId = await AsyncStorage.getItem("gl_user_id");
      if (!userId) {
        Alert.alert(t("securityPassword.errors.title"), t("errors.userNotFound"));
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/settings/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          currentPassword: oldPwd || undefined,
          newPassword: newPwd,
        }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        Alert.alert(
          t("securityPassword.errors.title"),
          json?.error ?? t("securityPassword.errors.updateFailed")
        );
        return;
      }

      Alert.alert(t("securityPassword.success.title"), t("securityPassword.success.msg"), [
        {
          text: t("common.ok"),
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (e) {
      console.error("update password error", e);
      Alert.alert(t("securityPassword.errors.title"), t("securityPassword.errors.network"));
    } finally {
      setSaving(false);
    }
  };

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
          {t("securityPassword.title")}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <PasswordField
          label={t("securityPassword.fields.current")}
          value={oldPwd}
          onChangeText={setOldPwd}
        />
        <PasswordField
          label={t("securityPassword.fields.new")}
          value={newPwd}
          onChangeText={setNewPwd}
        />
        <PasswordField
          label={t("securityPassword.fields.confirm")}
          value={confirmPwd}
          onChangeText={setConfirmPwd}
        />

        <Pressable
          onPress={handleSave}
          disabled={saving}
          className="mt-6 h-11 rounded-full bg-[#3B82F6] items-center justify-center"
        >
          <Text className="text-[14px] font-semibold text-white">
            {saving ? t("securityPassword.actions.saving") : t("securityPassword.actions.save")}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (val: string) => void;
};

const PasswordField: React.FC<FieldProps> = ({ label, value, onChangeText }) => (
  <View className="mb-4">
    <Text className="mb-1 text-[13px] text-[#374151]">{label}</Text>
    <View className="h-11 rounded-full border border-[#E5E7EB] px-4 flex-row items-center bg-[#F9FAFB]">
      <TextInput
        value={value}
        onChangeText={onChangeText}
        secureTextEntry
        placeholder={label}
        placeholderTextColor="#9CA3AF"
        className="flex-1 text-[14px] text-[#111827]"
      />
    </View>
  </View>
);

export default SecurityPasswordScreen;
