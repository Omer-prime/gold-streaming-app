import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  Image,
  Share,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "../navigation/ProfileStackNavigator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config";
import QRCode from "react-native-qrcode-svg";
import { t } from "../i18n";

type Nav = NativeStackNavigationProp<ProfileStackParamList>;

type InviteRow = {
  id: string;
  createdAt: string;
  status: "REGISTERED" | "QUALIFIED" | "REWARDED";
  user: { id: string; username: string; avatarUrl: string | null } | null;
};

type InviteResp = {
  myId: string;
  inviteCode: string;
  inviteLink?: string | null;
  claimedRewards: number;
  inviteesCount: number;
  availableToday: number;
  last7Days: InviteRow[];
};

const FALLBACK_INVITE_BASE = "https://goldilivepainelgeral.com/invite";

function toAbsoluteUrl(base: string, url?: string | null) {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const b = (base || "").replace(/\/+$/, "");
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${b}${path}`;
}

async function safeCopy(text: string) {
  try {
    const Clipboard = await import("expo-clipboard");
    await Clipboard.setStringAsync(text);
    return true;
  } catch {
    return false;
  }
}

type Tab = "myRewards" | "incomeRank";

const InviteScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [tab, setTab] = useState<Tab>("myRewards");

  const [userId, setUserId] = useState<string | null>(null);
  const [data, setData] = useState<InviteResp | null>(null);
  const [loading, setLoading] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  const apiBase = useMemo(
    () => String(API_BASE_URL || "").replace(/\/+$/, ""),
    []
  );

  useEffect(() => {
    AsyncStorage.getItem("gl_user_id").then(setUserId);
  }, []);

  const inviteLink = useMemo(() => {
    const code = data?.inviteCode?.trim();
    const apiLink = (data?.inviteLink || "")?.trim();

    if (apiLink) return apiLink;
    if (code) return `${FALLBACK_INVITE_BASE}?code=${encodeURIComponent(code)}`;
    return "";
  }, [data?.inviteCode, data?.inviteLink]);

  const headerCounts = useMemo(() => {
    const claimed = data?.claimedRewards ?? 0;
    const invitees = data?.inviteesCount ?? 0;
    const availableToday = data?.availableToday ?? 0;
    return { claimed, invitees, availableToday };
  }, [data]);

  const load = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const url = `${apiBase}/api/profile/invite?userId=${encodeURIComponent(userId)}`;

      const res = await fetch(url);
      const json = (await res.json().catch(() => null)) as InviteResp | null;

      if (!res.ok) {
        throw new Error((json as any)?.error || `Request failed (${res.status})`);
      }

      if (!json?.inviteCode) {
        throw new Error(t("invite.alerts.inviteCodeMissing"));
      }

      setData(json);
    } catch (e: any) {
      Alert.alert(t("invite.alerts.errorTitle"), e?.message || t("invite.alerts.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [apiBase, userId]);

  useEffect(() => {
    load();
  }, [load]);

  const onCopyCode = async () => {
    const code = data?.inviteCode?.trim();
    if (!code) {
      Alert.alert(t("invite.alerts.inviteTitle"), t("invite.alerts.codeNotReady"));
      return;
    }

    const ok = await safeCopy(code);
    if (!ok) {
      Alert.alert(t("invite.alerts.clipboardNotReadyTitle"), t("invite.alerts.clipboardNotReadyMsg"));
      return;
    }
    Alert.alert(t("invite.alerts.copiedTitle"), t("invite.alerts.codeCopied"));
  };

  const onCopyLink = async () => {
    if (!inviteLink) {
      Alert.alert(t("invite.alerts.inviteTitle"), t("invite.alerts.linkNotReady"));
      return;
    }

    const ok = await safeCopy(inviteLink);
    if (!ok) {
      Alert.alert(t("invite.alerts.clipboardNotReadyTitle"), t("invite.alerts.clipboardNotReadyMsg"));
      return;
    }
    Alert.alert(t("invite.alerts.copiedTitle"), t("invite.alerts.linkCopied"));
  };

  const onShare = async () => {
    const code = data?.inviteCode?.trim() || "-";
    if (!inviteLink) {
      Alert.alert(t("invite.alerts.inviteTitle"), t("invite.alerts.linkNotReady"));
      return;
    }
    try {
      await Share.share({
        message: t("invite.shareMessage", { code, link: inviteLink }),
      });
    } catch {
      // ignore
    }
  };

  const onOpenQr = () => {
    if (!inviteLink) {
      Alert.alert(t("invite.alerts.inviteTitle"), t("invite.alerts.linkNotReady"));
      return;
    }
    setQrOpen(true);
  };

  const onReceive = () => {
    Alert.alert(t("invite.alerts.soonTitle"), t("invite.alerts.receiveSoon"));
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-4 pt-3 pb-2 border-b border-gray-100">
        <Pressable
          onPress={navigation.goBack}
          className="mr-3 h-9 w-9 items-center justify-center rounded-full"
        >
          <Ionicons name="chevron-back" size={20} color="#111827" />
        </Pressable>

        <Text className="flex-1 text-center text-[18px] font-semibold text-[#111827]">
          {t("invite.title")}
        </Text>

        <Pressable
          onPress={load}
          className="h-9 w-9 items-center justify-center rounded-full"
        >
          {loading ? <ActivityIndicator /> : <Ionicons name="refresh-outline" size={20} color="#9CA3AF" />}
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner */}
        <LinearGradient
          colors={["#FB923C", "#F97316"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ marginTop: 16, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 16 }}
        >
          <Text style={{ fontSize: 13, color: "white" }}>{t("invite.banner.small")}</Text>
          <Text style={{ marginTop: 4, fontSize: 22, fontWeight: "600", color: "white" }}>
            {t("invite.banner.title")}
          </Text>
          <Text style={{ marginTop: 4, fontSize: 11, color: "rgba(255,255,255,0.85)" }}>
            {t("invite.banner.subtitle")}
          </Text>
        </LinearGradient>

        {/* Tabs */}
        <View className="mt-4 flex-row rounded-full bg-[#F3F4F6] p-1">
          {(["myRewards", "incomeRank"] as const).map((k) => {
            const active = k === tab;
            return (
              <Pressable
                key={k}
                onPress={() => setTab(k)}
                className={`flex-1 items-center justify-center rounded-full py-2.5 ${active ? "bg-white" : ""}`}
              >
                <Text className={`text-[12px] ${active ? "font-semibold text-[#F97316]" : "text-[#6B7280]"}`}>
                  {t(`invite.tabs.${k}`)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Stats */}
        <View className="mt-4 rounded-3xl bg-white px-4 py-4 border border-[#F3F4F6]">
          <View className="flex-row justify-between">
            <Stat label={t("invite.stats.claimed")} value={String(headerCounts.claimed)} />
            <Stat label={t("invite.stats.invitees")} value={String(headerCounts.invitees)} />
          </View>

          <View className="mt-4 flex-row items-center justify-between">
            <Text className="text-[12px] text-[#374151]">
              {t("invite.stats.availableToday", { count: headerCounts.availableToday })}
            </Text>

            <Pressable onPress={onReceive} className="rounded-full bg-[#E5E7EB] px-4 py-2">
              <Text className="text-[11px] font-semibold text-[#6B7280]">
                {t("invite.actions.receive")}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* List */}
        <View className="mt-4 rounded-3xl bg-white px-4 py-4 border border-[#F3F4F6]">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-[13px] font-semibold text-[#111827]">
              {t("invite.list.title", { count: data?.last7Days?.length ?? 0 })}
            </Text>
            <Text className="text-[11px] text-[#6B7280]">{t("invite.list.more")}</Text>
          </View>

          {!data ? (
            <View className="py-6 items-center">
              <ActivityIndicator />
              <Text className="mt-2 text-[12px] text-[#9CA3AF]">{t("invite.list.loading")}</Text>
            </View>
          ) : data.last7Days.length === 0 ? (
            <View className="items-center py-6">
              <View className="h-24 w-24 rounded-3xl bg-[#EEF2FF] items-center justify-center mb-2">
                <Ionicons name="planet-outline" size={32} color="#9CA3AF" />
              </View>
              <Text className="text-[12px] text-[#9CA3AF]">{t("invite.list.empty")}</Text>
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {data.last7Days.slice(0, 7).map((row) => (
                <View
                  key={row.id}
                  className="flex-row items-center justify-between"
                >
                  <View className="flex-row items-center">
                    {row.user?.avatarUrl ? (
                      <Image
                        source={{ uri: toAbsoluteUrl(apiBase, row.user.avatarUrl) ?? row.user.avatarUrl }}
                        style={{ height: 36, width: 36, borderRadius: 18, marginRight: 10 }}
                      />
                    ) : (
                      <View className="h-9 w-9 rounded-full bg-[#F3F4F6] items-center justify-center mr-2.5">
                        <Text className="text-[12px] font-semibold text-[#6B7280]">
                          {(row.user?.username || "U").slice(0, 1).toUpperCase()}
                        </Text>
                      </View>
                    )}

                    <View>
                      <Text className="text-[12px] font-semibold text-[#111827]">
                        {row.user?.username || t("invite.labels.userFallback")}
                      </Text>
                      <Text className="mt-0.5 text-[11px] text-[#6B7280]">
                        {new Date(row.createdAt).toISOString().slice(0, 10)}
                      </Text>
                    </View>
                  </View>

                  <Badge status={row.status} />
                </View>
              ))}
            </View>
          )}

          {/* My code */}
          <View className="mt-4 flex-row items-center justify-between">
            <Text className="text-[11px] text-[#6B7280]">
              {t("invite.list.myCode", { code: data?.inviteCode || "-" })}
            </Text>

            <View className="flex-row">
              <Pressable
                onPress={onCopyCode}
                className="h-10 px-3 rounded-xl border border-[#E5E7EB] items-center justify-center mr-2.5"
              >
                <Ionicons name="copy-outline" size={18} color="#111827" />
              </Pressable>

              <Pressable
                onPress={onOpenQr}
                className="h-10 w-10 rounded-xl border border-[#E5E7EB] items-center justify-center"
              >
                <Ionicons name="qr-code-outline" size={20} color="#111827" />
              </Pressable>
            </View>
          </View>

          {/* Copy link */}
          <Pressable
            onPress={onCopyLink}
            className="mt-3 rounded-xl border border-[#F3F4F6] px-3 py-3 flex-row items-center justify-between"
          >
            <Text numberOfLines={1} className="flex-1 text-[12px] text-[#111827] mr-2">
              {inviteLink || t("invite.list.linkPlaceholder")}
            </Text>
            <Ionicons name="copy-outline" size={16} color="#111827" />
          </Pressable>
        </View>

        {/* CTA */}
        <Pressable
          onPress={onShare}
          className="mt-5 rounded-full bg-[#F97316] py-3.5 items-center justify-center"
        >
          <Text className="text-[15px] font-semibold text-white">
            {t("invite.actions.inviteNow")}
          </Text>
        </Pressable>
      </ScrollView>

      {/* QR Modal */}
      <Modal visible={qrOpen} transparent animationType="fade" onRequestClose={() => setQrOpen(false)}>
        <View className="flex-1 bg-black/50 items-center justify-center px-5">
          <View className="w-full max-w-[360px] bg-white rounded-2xl p-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-[14px] font-semibold text-[#111827]">
                {t("invite.qr.title")}
              </Text>
              <Pressable onPress={() => setQrOpen(false)} className="h-9 w-9 items-center justify-center rounded-full">
                <Ionicons name="close" size={20} color="#111827" />
              </Pressable>
            </View>

            <View className="items-center mt-4 py-2">
              {!!inviteLink && <QRCode value={inviteLink} size={220} />}
              <Text className="mt-3 text-[11px] text-[#6B7280] text-center">
                {inviteLink}
              </Text>
            </View>

            <Pressable onPress={onShare} className="mt-3 rounded-full bg-[#F97316] py-3 items-center justify-center">
              <Text className="text-[13px] font-semibold text-white">
                {t("invite.actions.share")}
              </Text>
            </Pressable>

            <Pressable onPress={onCopyLink} className="mt-3 rounded-full bg-[#111827] py-3 items-center justify-center">
              <Text className="text-[13px] font-semibold text-white">
                {t("invite.actions.copyLink")}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View className="flex-1 items-center">
    <Text className="text-[18px] font-semibold text-[#111827]">{value}</Text>
    <Text className="mt-1 text-[11px] text-[#6B7280]">{label}</Text>
  </View>
);

function Badge({ status }: { status: "REGISTERED" | "QUALIFIED" | "REWARDED" }) {
  const cfg =
    status === "REWARDED"
      ? { bg: "rgba(16,185,129,0.12)", fg: "#059669", text: t("invite.badge.rewarded") }
      : status === "QUALIFIED"
      ? { bg: "rgba(59,130,246,0.12)", fg: "#2563EB", text: t("invite.badge.qualified") }
      : { bg: "rgba(249,115,22,0.12)", fg: "#F97316", text: t("invite.badge.registered") };

  return (
    <View style={{ backgroundColor: cfg.bg, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 }}>
      <Text style={{ fontSize: 11, fontWeight: "700", color: cfg.fg }}>{cfg.text}</Text>
    </View>
  );
}

export default InviteScreen;
