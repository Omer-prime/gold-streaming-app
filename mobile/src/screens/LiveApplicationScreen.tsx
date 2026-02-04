import React, { useCallback, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config";
import { Ionicons } from "@expo/vector-icons";
import { t } from "../i18n";

type LiveApplicationRes = {
  application: any | null;
  applicationStatus: "NONE" | "PENDING" | "APPROVED" | "REJECTED";
  hostApproved: boolean;
  requirements: {
    faceVerified: boolean;
    hasLiveCover: boolean;
    wealthLevel: number;
    requiredWealthLevel: number;
    canApply: boolean;
  };
};

type ScreenState = {
  approved: boolean;
  applicationStatus: "NONE" | "PENDING" | "APPROVED" | "REJECTED";
  requirements: {
    faceVerified: boolean;
    hasLivePhoto: boolean;
    wealthLevel: number;
    wealthRequired: number;
    canApply: boolean;
  };
};

export default function LiveApplicationScreen() {
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<ScreenState | null>(null);

  const load = useCallback(async () => {
    try {
      setErr(null);
      setLoading(true);

      const userId = await AsyncStorage.getItem("gl_user_id");
      if (!userId) {
        setErr(t("liveApplication.errors.loginRequired"));
        setData(null);
        return;
      }

      const res = await fetch(
        `${API_BASE_URL}/api/profile/live-application?userId=${encodeURIComponent(userId)}`
      );
      const json = (await res.json().catch(() => null)) as LiveApplicationRes | null;

      if (!res.ok || !json) {
        setErr((json as any)?.error || t("liveApplication.errors.loadFailed"));
        setData(null);
        return;
      }

      setData({
        approved: !!json.hostApproved,
        applicationStatus: json.applicationStatus,
        requirements: {
          faceVerified: json.requirements.faceVerified,
          hasLivePhoto: json.requirements.hasLiveCover,
          wealthLevel: json.requirements.wealthLevel,
          wealthRequired: json.requirements.requiredWealthLevel,
          canApply: json.requirements.canApply,
        },
      });
    } catch (e) {
      setErr(t("liveApplication.errors.network"));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onPressGoLive = useCallback(async () => {
    const userId = await AsyncStorage.getItem("gl_user_id");
    if (!userId) return Alert.alert(t("liveApplication.errors.loginRequired"));

    const req = data?.requirements;

    if (!data?.approved) {
      if (!req) return Alert.alert(t("common.error"), t("liveApplication.errors.notLoaded"));

      if (!req.faceVerified) return navigation.navigate("FaceScan");
      if (!req.hasLivePhoto) return navigation.navigate("LiveCoverScreen");

      if (req.wealthLevel < req.wealthRequired) {
        return Alert.alert(
          t("liveApplication.alerts.wealthRequiredTitle"),
          t("liveApplication.alerts.wealthRequiredMsg", { level: req.wealthRequired })
        );
      }

      if (data.applicationStatus === "PENDING") {
        return Alert.alert(
          t("liveApplication.alerts.underReviewTitle"),
          t("liveApplication.alerts.underReviewMsg")
        );
      }

      try {
        const applyRes = await fetch(`${API_BASE_URL}/api/profile/live-application`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
        const applyJson = await applyRes.json().catch(() => null);

        if (!applyRes.ok) {
          return Alert.alert(t("common.failed"), applyJson?.error || t("liveApplication.errors.submitFailed"));
        }

        Alert.alert(t("liveApplication.alerts.submittedTitle"), t("liveApplication.alerts.submittedMsg"));
        load();
      } catch {
        Alert.alert(t("common.error"), t("liveApplication.errors.submitNetwork"));
      }

      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/live`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          title: t("liveApplication.defaults.liveTitle"),
          mode: "SOLO",
        }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.stream?.id) {
        return Alert.alert(t("common.failed"), json?.error || t("liveApplication.errors.startFailed"));
      }

      navigation.navigate("LiveRoom", {
        streamId: json.stream.id,
        hostId: userId,
        displayName: t("liveApplication.defaults.hostName"),
        avatarUrl: null,
      });
    } catch {
      Alert.alert(t("common.error"), t("liveApplication.errors.startNetwork"));
    }
  }, [data, navigation, load]);

  const req = data?.requirements;

  const statusKey = (data?.applicationStatus || "NONE").toLowerCase();
  const statusText = t(`liveApplication.status.${statusKey}`);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="px-4 pt-4 pb-3 border-b border-gray-100 flex-row items-center">
        <Pressable onPress={() => navigation.goBack()} style={{ padding: 6, marginRight: 8 }}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </Pressable>
        <Text className="text-[16px] font-extrabold text-black">{t("liveApplication.title")}</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
          <Text className="mt-2 text-gray-500">{t("liveApplication.states.loading")}</Text>
        </View>
      ) : (
        <View className="flex-1 px-4 pt-4">
          {!!err && (
            <View className="bg-red-50 border border-red-200 rounded-xl px-3 py-3 mb-3">
              <Text className="text-red-600 text-[12px] font-bold">{err}</Text>
            </View>
          )}

          <View className="border border-gray-200 rounded-2xl overflow-hidden">
            <Row
              title={t("liveApplication.rows.faceAuthTitle")}
              subtitle={req?.faceVerified ? t("liveApplication.rows.completed") : t("liveApplication.rows.faceAuthNeed")}
              onPress={() => navigation.navigate("FaceScan")}
            />
            <Divider />
            <Row
              title={t("liveApplication.rows.livePhotoTitle")}
              subtitle={req?.hasLivePhoto ? t("liveApplication.rows.uploaded") : t("liveApplication.rows.livePhotoNeed")}
              onPress={() => navigation.navigate("LiveCoverScreen")}
            />
            <Divider />
            <Row
              title={t("liveApplication.rows.wealthTitle", { level: req?.wealthRequired ?? 5 })}
              subtitle={t("liveApplication.rows.wealthSubtitle", { level: req?.wealthLevel ?? 0 })}
              onPress={() => Alert.alert(t("liveApplication.alerts.infoTitle"), t("liveApplication.alerts.wealthInfoMsg"))}
            />
          </View>

          <View className="mt-3">
            <Text className="text-gray-500 text-[12px]">
              {t("liveApplication.labels.status")}{" "}
              <Text className="font-extrabold">{statusText}</Text>
            </Text>
          </View>

          <View className="flex-1" />

          <Pressable
            onPress={onPressGoLive}
            style={{
              backgroundColor: "#FF2D55",
              borderRadius: 999,
              paddingVertical: 16,
              alignItems: "center",
              marginBottom: 18,
              opacity: data?.approved ? 1 : 0.8,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "900" }}>
              {data?.approved ? t("liveApplication.actions.goLive") : t("liveApplication.actions.applyOrComplete")}
            </Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: "#F3F4F6" }} />;
}

function Row({ title, subtitle, onPress }: { title: string; subtitle: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} className="px-4 py-4 flex-row items-center justify-between bg-white">
      <View style={{ maxWidth: "85%" }}>
        <Text className="text-[14px] font-extrabold text-black">{title}</Text>
        <Text className="text-[12px] text-gray-500 mt-1">{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
    </Pressable>
  );
}
