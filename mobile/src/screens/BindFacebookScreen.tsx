import React, { useEffect, useState } from "react";
import { View, Text, Pressable, TextInput, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "../navigation/ProfileStackNavigator";
import { bindSocial, getBindStatus, unbindSocial } from "../services/bind.service";
import { t } from "../i18n";

type Nav = NativeStackNavigationProp<ProfileStackParamList, "BindFacebook">;



export default function BindFacebookScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<any>();

  const provider = t("bindSocial.providers.facebook");

  const [userId, setUserId] = useState("");
  const [current, setCurrent] = useState<string | null>(null);
  const [providerId, setProviderId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const id = String(route?.params?.userId ?? (await AsyncStorage.getItem("userId")) ?? "");
      setUserId(id);
      if (!id) return;
      try {
        const st = await getBindStatus(id);
        setCurrent(st.facebookId ?? null);
      } catch {
        // ignore
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onBind = async () => {
    const val = providerId.trim();
    if (!userId || !val) return;

    try {
      setSaving(true);
      await bindSocial(userId, "facebook", val);
      Alert.alert(t("common.success"), t("bindSocial.alerts.boundSuccess", { provider }));
      navigation.goBack();
    } catch (e: any) {
      Alert.alert(t("common.error"), e?.message || t("common.failed"));
    } finally {
      setSaving(false);
    }
  };

  const onUnbind = async () => {
    if (!userId) return;

    try {
      setSaving(true);
      await unbindSocial(userId, "facebook");
      Alert.alert(t("common.done"), t("bindSocial.alerts.unboundSuccess", { provider }));
      navigation.goBack();
    } catch (e: any) {
      Alert.alert(t("common.error"), e?.message || t("common.failed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-row items-center px-4 pt-3 pb-2 border-b border-gray-100">
        <Pressable onPress={() => navigation.goBack()} className="mr-3 h-9 w-9 items-center justify-center rounded-full">
          <Ionicons name="chevron-back" size={20} color="#111827" />
        </Pressable>
        <Text className="text-[18px] font-semibold text-[#111827]">{t("bindSocial.titles.facebook")}</Text>
      </View>

      <View className="px-6 pt-6">
        <Text className="text-[12px] text-[#6B7280] mb-4">
          {current ? t("bindSocial.status.currentlyBound", { id: current }) : t("bindSocial.status.notBound")}
        </Text>

        <Text className="text-[12px] text-[#6B7280] mb-3">{t("bindSocial.tempBackendHint", { provider })}</Text>

        <View className="rounded-2xl border border-gray-200 px-4 py-3">
          <TextInput
            value={providerId}
            onChangeText={setProviderId}
            placeholder={t("bindSocial.placeholders.facebook")}
            placeholderTextColor="#9CA3AF"
            className="text-[14px] text-[#111827]"
            autoCapitalize="none"
          />
        </View>

        <Pressable
          onPress={onBind}
          disabled={!userId || !providerId.trim() || saving}
          className={`mt-4 h-11 rounded-full items-center justify-center ${!userId || !providerId.trim() || saving ? "bg-[#E5E7EB]" : "bg-[#6366F1]"}`}
        >
          {saving ? <ActivityIndicator /> : <Text className="font-semibold text-white">{t("common.bind")}</Text>}
        </Pressable>

        {current ? (
          <Pressable onPress={onUnbind} disabled={!userId || saving} className="mt-4 h-11 rounded-full items-center justify-center bg-[#111827]">
            <Text className="font-semibold text-white">{t("common.unbind")}</Text>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
