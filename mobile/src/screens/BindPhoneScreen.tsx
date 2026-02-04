import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "../navigation/ProfileStackNavigator";
import { getBindStatus, requestPhoneOtp, verifyPhoneOtp } from "../services/bind.service";
import { t } from "../i18n";

type Nav = NativeStackNavigationProp<ProfileStackParamList, "BindPhone">;

export default function BindPhoneScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<any>();

  const [userId, setUserId] = useState("");
  const [currentPhone, setCurrentPhone] = useState<string | null>(null);

  const [phone, setPhone] = useState("");
  const [countryCode] = useState("+92");
  const [step, setStep] = useState<"ENTER_PHONE" | "ENTER_CODE">("ENTER_PHONE");
  const [phoneE164, setPhoneE164] = useState("");

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
        setCurrentPhone(st.phoneNumber ?? null);
      } catch {
        // ignore
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isValidPhone = useMemo(() => phone.replace(/[^\d]/g, "").length >= 7, [phone]);
  const canSend = useMemo(() => !!userId && isValidPhone && !sending, [userId, isValidPhone, sending]);
  const canVerify = useMemo(
    () => !!userId && code.trim().length >= 4 && !verifying && !!phoneE164,
    [userId, code, verifying, phoneE164]
  );

  const onSend = async () => {
    try {
      setSending(true);

      const r = await requestPhoneOtp(userId, countryCode, phone);
      setPhoneE164(r.phoneE164);
      setStep("ENTER_CODE");

      const devCodeLine = r?.devCode ? `\n${t("bindPhone.alerts.devCode", { code: r.devCode })}` : "";
      Alert.alert(
        t("common.codeSent"),
        `${t("bindPhone.alerts.codeSentMsg", { phone: r.phoneE164 })}${devCodeLine}`
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
      await verifyPhoneOtp(userId, phoneE164, code.trim());
      Alert.alert(t("common.success"), t("bindPhone.alerts.successMsg"));
      navigation.goBack();
    } catch (e: any) {
      Alert.alert(t("common.error"), e?.message || t("common.failed"));
    } finally {
      setVerifying(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
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
            <Text className="text-[18px] font-semibold text-white">{t("bindPhone.title")}</Text>
          </View>

          <Text className="mt-6 text-[14px] text-indigo-100 max-w-[280px]">{t("bindPhone.subtitle")}</Text>

          {currentPhone ? (
            <Text className="mt-3 text-[12px] text-indigo-100">
              {t("bindPhone.currentBoundLabel")}{" "}
              <Text className="text-white font-semibold">{currentPhone}</Text>
            </Text>
          ) : null}
        </LinearGradient>

        <View className="flex-1 px-6 mt-6">
          {step === "ENTER_PHONE" ? (
            <>
              <Text className="text-[16px] font-semibold text-[#111827] mb-3">{t("bindPhone.sections.enterPhone")}</Text>

              <View className="flex-row items-center rounded-full border border-[#A5B4FC] px-3 py-2">
                <Pressable className="flex-row items-center mr-2">
                  <Text className="text-[14px] text-[#111827] mr-1">{`🇵🇰 ${countryCode}`}</Text>
                  <Ionicons name="chevron-down" size={14} color="#6B7280" />
                </Pressable>

                <View className="h-6 w-px bg-[#E5E7EB] mr-2" />

                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholder={t("bindPhone.placeholders.phone")}
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 text-[14px] text-[#111827]"
                />
              </View>

              <Pressable
                onPress={onSend}
                disabled={!canSend}
                className={`mt-8 h-11 rounded-full items-center justify-center ${canSend ? "bg-[#6366F1]" : "bg-[#E5E7EB]"}`}
              >
                {sending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className={`text-[14px] font-semibold ${canSend ? "text-white" : "text-[#9CA3AF]"}`}>
                    {t("common.sendCode")}
                  </Text>
                )}
              </Pressable>
            </>
          ) : (
            <>
              <Text className="text-[16px] font-semibold text-[#111827] mb-2">{t("bindPhone.sections.enterCode")}</Text>
              <Text className="text-[12px] text-[#6B7280] mb-3">{t("bindPhone.labels.sentTo", { phone: phoneE164 })}</Text>

              <View className="rounded-full border border-gray-200 px-4 py-3">
                <TextInput
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  placeholder={t("bindPhone.placeholders.code")}
                  placeholderTextColor="#9CA3AF"
                  className="text-[14px] text-[#111827]"
                />
              </View>

              <Pressable
                onPress={onVerify}
                disabled={!canVerify}
                className={`mt-6 h-11 rounded-full items-center justify-center ${canVerify ? "bg-[#111827]" : "bg-[#E5E7EB]"}`}
              >
                {verifying ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className={`text-[14px] font-semibold ${canVerify ? "text-white" : "text-[#9CA3AF]"}`}>
                    {t("common.verifyAndBind")}
                  </Text>
                )}
              </Pressable>

              <Pressable onPress={() => setStep("ENTER_PHONE")} className="mt-4 items-center">
                <Text className="text-[12px] text-[#4F46E5] font-semibold">{t("common.changePhoneNumber")}</Text>
              </Pressable>
            </>
          )}

          <Text className="mt-6 text-[11px] text-center text-[#6B7280]">
            {t("bindPhone.terms.prefix")}
            <Text className="text-[#4F46E5]">{t("bindPhone.terms.tos")}</Text>
            {t("bindPhone.terms.and")}
            <Text className="text-[#4F46E5]">{t("bindPhone.terms.privacy")}</Text>
            {t("bindPhone.terms.suffix")}
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
