// src/screens/InviteScreen.tsx
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

// ✅ Your domain fallback (if backend doesn’t return inviteLink)
const FALLBACK_INVITE_BASE = "https://goldilivepainelgeral.com/invite";

/**
 * ✅ Clipboard safe helper (won’t crash if ExpoClipboard not compiled in dev client)
 */
async function safeCopy(text: string) {
  try {
    const Clipboard = await import("expo-clipboard");
    await Clipboard.setStringAsync(text);
    return true;
  } catch {
    return false;
  }
}

const InviteScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [tab, setTab] = useState<"My rewards" | "Income Rank">("My rewards");

  const [userId, setUserId] = useState<string | null>(null);
  const [data, setData] = useState<InviteResp | null>(null);
  const [loading, setLoading] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

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
      const url = `${API_BASE_URL}/api/profile/invite?userId=${encodeURIComponent(
        userId
      )}`;

      const res = await fetch(url);
      const json = (await res.json().catch(() => null)) as InviteResp | null;

      if (!res.ok) {
        throw new Error((json as any)?.error || `Request failed (${res.status})`);
      }

      if (!json?.inviteCode) {
        throw new Error("Invite code missing from backend response");
      }

      setData(json);
    } catch (e: any) {
      Alert.alert("Invite error", e?.message || "Failed to load invite data");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const onCopyCode = async () => {
    const code = data?.inviteCode?.trim();
    if (!code) {
      Alert.alert("Invite", "Invite code not ready. Tap refresh.");
      return;
    }

    const ok = await safeCopy(code);
    if (!ok) {
      Alert.alert(
        "Clipboard not ready",
        "Clipboard module is not in your Dev Client build. Rebuild Dev Client to enable copy."
      );
      return;
    }
    Alert.alert("Copied", "Invite code copied");
  };

  const onCopyLink = async () => {
    if (!inviteLink) {
      Alert.alert("Invite", "Invite link not ready. Tap refresh.");
      return;
    }

    const ok = await safeCopy(inviteLink);
    if (!ok) {
      Alert.alert(
        "Clipboard not ready",
        "Clipboard module is not in your Dev Client build. Rebuild Dev Client to enable copy."
      );
      return;
    }
    Alert.alert("Copied", "Invite link copied");
  };

  const onShare = async () => {
    const code = data?.inviteCode?.trim();

    if (!inviteLink) {
      Alert.alert("Invite", "Invite link not ready. Tap refresh.");
      return;
    }

    try {
      await Share.share({
        message: `Join me on Gold Live 🎥\nUse my invite code: ${code || "-"}\n${inviteLink}`,
      });
    } catch {
      // ignore
    }
  };

  const onOpenQr = () => {
    if (!inviteLink) {
      Alert.alert("Invite", "Invite link not ready. Tap refresh.");
      return;
    }
    setQrOpen(true);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top"]}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: "#F3F4F6",
        }}
      >
        <Pressable
          onPress={navigation.goBack}
          style={{
            marginRight: 12,
            height: 32,
            width: 32,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </Pressable>

        <Text
          style={{
            flex: 1,
            textAlign: "center",
            fontSize: 17,
            fontWeight: "600",
            color: "#111827",
          }}
        >
          Invitation Bonus
        </Text>

        <Pressable
          onPress={load}
          style={{ width: 32, alignItems: "center", justifyContent: "center" }}
        >
          {loading ? (
            <ActivityIndicator />
          ) : (
            <Ionicons name="refresh-outline" size={20} color="#9CA3AF" />
          )}
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 32, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top banner */}
        <LinearGradient
          colors={["#FB923C", "#F97316"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            marginTop: 16,
            borderRadius: 24,
            paddingHorizontal: 16,
            paddingVertical: 16,
          }}
        >
          <Text style={{ fontSize: 13, color: "white" }}>Invite someone</Text>
          <Text
            style={{
              marginTop: 4,
              fontSize: 22,
              fontWeight: "600",
              color: "white",
            }}
          >
            Earn rewards by inviting friends
          </Text>
          <Text
            style={{
              marginTop: 4,
              fontSize: 11,
              color: "rgba(255,255,255,0.85)",
            }}
          >
            Share your invite link or code. We will count your invitees automatically.
          </Text>
        </LinearGradient>

        {/* Tabs */}
        <View
          style={{
            marginTop: 16,
            flexDirection: "row",
            borderRadius: 999,
            backgroundColor: "#F3F4F6",
            padding: 4,
          }}
        >
          {(["My rewards", "Income Rank"] as const).map((t) => {
            const active = t === tab;
            return (
              <Pressable
                key={t}
                onPress={() => setTab(t)}
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 999,
                  paddingVertical: 10,
                  backgroundColor: active ? "#fff" : "transparent",
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: active ? "600" : "400",
                    color: active ? "#F97316" : "#6B7280",
                  }}
                >
                  {t}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Stats */}
        <View
          style={{
            marginTop: 16,
            borderRadius: 24,
            backgroundColor: "#fff",
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderWidth: 1,
            borderColor: "#F3F4F6",
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Stat label="Claimed Rewards" value={String(headerCounts.claimed)} />
            <Stat label="Number of invitees" value={String(headerCounts.invitees)} />
          </View>

          <View
            style={{
              marginTop: 14,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text style={{ fontSize: 12, color: "#374151" }}>
              Available for today:{" "}
              <Text style={{ fontWeight: "600", color: "#F97316" }}>
                {headerCounts.availableToday}
              </Text>
            </Text>

            <Pressable
              onPress={() =>
                Alert.alert("Soon", "Claim rewards will be enabled when invite reward rules are added.")
              }
              style={{
                borderRadius: 999,
                backgroundColor: "#E5E7EB",
                paddingHorizontal: 16,
                paddingVertical: 8,
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: "600", color: "#6B7280" }}>
                Receive
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Invitations list */}
        <View
          style={{
            marginTop: 16,
            borderRadius: 24,
            backgroundColor: "#fff",
            paddingHorizontal: 16,
            paddingVertical: 16,
            borderWidth: 1,
            borderColor: "#F3F4F6",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#111827" }}>
              Invitations from last 7 days ({data?.last7Days?.length ?? 0})
            </Text>
            <Text style={{ fontSize: 11, color: "#6B7280" }}>More &gt;</Text>
          </View>

          {!data ? (
            <View style={{ paddingVertical: 20, alignItems: "center" }}>
              <ActivityIndicator />
              <Text style={{ marginTop: 8, fontSize: 12, color: "#9CA3AF" }}>
                Loading…
              </Text>
            </View>
          ) : data.last7Days.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: 20 }}>
              <View
                style={{
                  height: 96,
                  width: 96,
                  borderRadius: 24,
                  backgroundColor: "#EEF2FF",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 8,
                }}
              >
                <Ionicons name="planet-outline" size={32} color="#9CA3AF" />
              </View>
              <Text style={{ fontSize: 12, color: "#9CA3AF" }}>No invitations yet</Text>
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {data.last7Days.slice(0, 7).map((row) => (
                <View
                  key={row.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {row.user?.avatarUrl ? (
                      <Image
                        source={{ uri: row.user.avatarUrl }}
                        style={{ height: 36, width: 36, borderRadius: 18, marginRight: 10 }}
                      />
                    ) : (
                      <View
                        style={{
                          height: 36,
                          width: 36,
                          borderRadius: 18,
                          backgroundColor: "#F3F4F6",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 10,
                        }}
                      >
                        <Text style={{ fontSize: 12, fontWeight: "700", color: "#6B7280" }}>
                          {(row.user?.username || "U").slice(0, 1).toUpperCase()}
                        </Text>
                      </View>
                    )}

                    <View>
                      <Text style={{ fontSize: 12, fontWeight: "600", color: "#111827" }}>
                        {row.user?.username || "User"}
                      </Text>
                      <Text style={{ marginTop: 2, fontSize: 11, color: "#6B7280" }}>
                        {new Date(row.createdAt).toISOString().slice(0, 10)}
                      </Text>
                    </View>
                  </View>

                  <Badge status={row.status} />
                </View>
              ))}
            </View>
          )}

          {/* My code row */}
          <View
            style={{
              marginTop: 14,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text style={{ fontSize: 11, color: "#6B7280" }}>
              My code:{" "}
              <Text style={{ fontWeight: "700", color: "#111827" }}>
                {data?.inviteCode || "-"}
              </Text>
            </Text>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pressable
                onPress={onCopyCode}
                style={{
                  height: 40,
                  paddingHorizontal: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="copy-outline" size={18} color="#111827" />
              </Pressable>

              <Pressable
                onPress={onOpenQr}
                style={{
                  height: 40,
                  width: 40,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="qr-code-outline" size={20} color="#111827" />
              </Pressable>
            </View>
          </View>

          {/* Copy Link */}
          <Pressable
            onPress={onCopyLink}
            style={{
              marginTop: 12,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "#F3F4F6",
              paddingVertical: 12,
              paddingHorizontal: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text numberOfLines={1} style={{ flex: 1, fontSize: 12, color: "#111827" }}>
              {inviteLink || "Invite link not ready (tap refresh)"}
            </Text>
            <Ionicons name="copy-outline" size={16} color="#111827" />
          </Pressable>
        </View>

        {/* CTA */}
        <Pressable
          onPress={onShare}
          style={{
            marginTop: 20,
            borderRadius: 999,
            backgroundColor: "#F97316",
            paddingVertical: 14,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: "600", color: "#fff" }}>
            Invite Now
          </Text>
        </Pressable>
      </ScrollView>

      {/* QR MODAL */}
      <Modal
        visible={qrOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setQrOpen(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.45)",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: 360,
              backgroundColor: "#fff",
              borderRadius: 18,
              padding: 16,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#111827" }}>Scan to join</Text>
              <Pressable
                onPress={() => setQrOpen(false)}
                style={{ height: 34, width: 34, alignItems: "center", justifyContent: "center" }}
              >
                <Ionicons name="close" size={20} color="#111827" />
              </Pressable>
            </View>

            <View style={{ alignItems: "center", marginTop: 14, paddingVertical: 8 }}>
              {!!inviteLink && <QRCode value={inviteLink} size={220} />}
              <Text style={{ marginTop: 12, fontSize: 11, color: "#6B7280", textAlign: "center" }}>
                {inviteLink}
              </Text>
            </View>

            <Pressable
              onPress={onShare}
              style={{
                marginTop: 10,
                borderRadius: 999,
                backgroundColor: "#F97316",
                paddingVertical: 12,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#fff" }}>Share</Text>
            </Pressable>

            <Pressable
              onPress={onCopyLink}
              style={{
                marginTop: 10,
                borderRadius: 999,
                backgroundColor: "#111827",
                paddingVertical: 12,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#fff" }}>Copy link</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={{ flex: 1, alignItems: "center" }}>
    <Text style={{ fontSize: 18, fontWeight: "600", color: "#111827" }}>{value}</Text>
    <Text style={{ marginTop: 4, fontSize: 11, color: "#6B7280" }}>{label}</Text>
  </View>
);

function Badge({ status }: { status: "REGISTERED" | "QUALIFIED" | "REWARDED" }) {
  const cfg =
    status === "REWARDED"
      ? { bg: "rgba(16,185,129,0.12)", fg: "#059669", text: "Rewarded" }
      : status === "QUALIFIED"
      ? { bg: "rgba(59,130,246,0.12)", fg: "#2563EB", text: "Qualified" }
      : { bg: "rgba(249,115,22,0.12)", fg: "#F97316", text: "Registered" };

  return (
    <View style={{ backgroundColor: cfg.bg, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 }}>
      <Text style={{ fontSize: 11, fontWeight: "700", color: cfg.fg }}>{cfg.text}</Text>
    </View>
  );
}

export default InviteScreen;
