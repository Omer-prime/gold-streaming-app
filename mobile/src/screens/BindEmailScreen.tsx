import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, TextInput, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "../navigation/ProfileStackNavigator";
import { getBindStatus, requestEmailOtp, verifyEmailOtp } from "../services/bind.service";
import { t } from "../i18n";;

type Nav = NativeStackNavigationProp<ProfileStackParamList, "BindEmail">;

export default function BindEmailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<any>();

  const [userId, setUserId] = useState("");
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    (async () => {
      const id = String(route?.params?.userId ?? (await AsyncStorage.getItem("userId")) ?? "");
      setUserId(id);
      if (!id) return;

      try {
        const st = await getBindStatus(id);
        setCurrentEmail(st.email ?? null);
        setEmail(st.email ?? "");
      } catch {
        // ignore
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canSend = useMemo(() => email.trim().includes("@") && !sending && !!userId, [email, sending, userId]);
  const canVerify = useMemo(() => code.trim().length >= 4 && !verifying && !!userId, [code, verifying, userId]);

  const onSend = async () => {
    try {
      setSending(true);
      const r = await requestEmailOtp(userId, email.trim());
      const devCodeLine = r?.devCode ? `\n${t("bindEmail.alerts.devCode", { code: r.devCode })}` : "";

      Alert.alert(
        t("common.codeSent"),
        `${t("bindEmail.alerts.codeSentMsg", { email: email.trim() })}${devCodeLine}`
      );
    } catch (e: any) {
      Alert.alert(t("common.error"), e?.message || t("common.failed"));
    } finally {
      setSending(false);
    }
  };

  const onVerify = async () => {
    try {
      setVerifying(true);
      await verifyEmailOtp(userId, email.trim(), code.trim());
      Alert.alert(t("common.success"), t("bindEmail.alerts.successMsg"));
      navigation.goBack();
    } catch (e: any) {
      Alert.alert(t("common.error"), e?.message || t("common.failed"));
    } finally {
      setVerifying(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-row items-center px-4 pt-3 pb-2 border-b border-gray-100">
        <Pressable onPress={() => navigation.goBack()} className="mr-3 h-9 w-9 items-center justify-center rounded-full">
          <Ionicons name="chevron-back" size={20} color="#111827" />
        </Pressable>
        <Text className="text-[18px] font-semibold text-[#111827]">{t("bindEmail.title")}</Text>
      </View>

      <View className="px-6 pt-6">
        {currentEmail ? (
          <Text className="text-[12px] text-[#6B7280] mb-4">
            {t("bindEmail.currentBoundLabel")}{" "}
            <Text className="text-[#111827] font-semibold">{currentEmail}</Text>
          </Text>
        ) : (
          <Text className="text-[12px] text-[#6B7280] mb-4">{t("bindEmail.noBoundYet")}</Text>
        )}

        <Text className="text-[13px] text-[#111827] font-semibold mb-2">{t("bindEmail.labels.email")}</Text>
        <View className="rounded-2xl border border-gray-200 px-4 py-3">
          <TextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder={t("bindEmail.placeholders.email")}
            placeholderTextColor="#9CA3AF"
            className="text-[14px] text-[#111827]"
          />
        </View>

        <Pressable
          onPress={onSend}
          disabled={!canSend}
          className={`mt-4 h-11 rounded-full items-center justify-center ${canSend ? "bg-[#6366F1]" : "bg-[#E5E7EB]"}`}
        >
          {sending ? <ActivityIndicator color="#fff" /> : <Text className={`font-semibold ${canSend ? "text-white" : "text-[#9CA3AF]"}`}>{t("common.sendCode")}</Text>}
        </Pressable>

        <Text className="text-[13px] text-[#111827] font-semibold mt-6 mb-2">{t("bindEmail.labels.code")}</Text>
        <View className="rounded-2xl border border-gray-200 px-4 py-3">
          <TextInput
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            placeholder={t("bindEmail.placeholders.code")}
            placeholderTextColor="#9CA3AF"
            className="text-[14px] text-[#111827]"
          />
        </View>

        <Pressable
          onPress={onVerify}
          disabled={!canVerify}
          className={`mt-4 h-11 rounded-full items-center justify-center ${canVerify ? "bg-[#111827]" : "bg-[#E5E7EB]"}`}
        >
          {verifying ? <ActivityIndicator color="#fff" /> : <Text className={`font-semibold ${canVerify ? "text-white" : "text-[#9CA3AF]"}`}>{t("common.verifyAndBind")}</Text>}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
