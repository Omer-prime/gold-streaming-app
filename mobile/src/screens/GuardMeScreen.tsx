// src/screens/GuardMeScreen.tsx
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "../navigation/ProfileStackNavigator";
import { API_BASE_URL } from "../config";
import { t } from "../i18n";

type Nav = NativeStackNavigationProp<ProfileStackParamList, "GuardMe">;
export type R = RouteProp<ProfileStackParamList, "GuardMe">;

const USER_ID_KEY = "gl_user_id";

type ApiUser = {
  id: string;
  username: string;
  nickname?: string | null;
  avatarUrl?: string | null;
};

type GuardianResponse = {
  myGuardian: null | {
    id: string;
    tier: string;
    startedAt: string;
    endsAt: string;
    guardian: ApiUser;
  };
};

function fmtDate(x?: string) {
  if (!x) return "";
  const d = new Date(x);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString();
}

function initials(name: string) {
  const s = (name || "").trim();
  if (!s) return "GL";
  const p = s.split(" ");
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[1][0]).toUpperCase();
}

export default function GuardMeScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const routeUserId = (route.params as any)?.userId as string | undefined;

  const [userId, setUserId] = useState<string | null>(routeUserId ?? null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [myGuardian, setMyGuardian] = useState<GuardianResponse["myGuardian"]>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (routeUserId) return;
      const stored = await AsyncStorage.getItem(USER_ID_KEY);
      if (!mounted) return;
      setUserId(stored || null);
    })();
    return () => {
      mounted = false;
    };
  }, [routeUserId]);

  const load = useCallback(async () => {
    try {
      setErr(null);
      setLoading(true);

      if (!userId) throw new Error(t("guardMe.errors.missingUser"));

      const base = (API_BASE_URL ?? "").trim().replace(/\/+$/, "") || "http://192.168.10.25:3000";
      const res = await fetch(`${base}/api/profile/guardian?userId=${encodeURIComponent(userId)}`);
      const json = (await res.json().catch(() => null)) as any;

      if (!res.ok) throw new Error(json?.error || t("guardMe.errors.loadFailed"));

      setMyGuardian(json?.myGuardian ?? null);
    } catch (e: any) {
      setErr(e?.message || t("common.error"));
      setMyGuardian(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    load();
  }, [userId, load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <Pressable onPress={navigation.goBack} className="h-8 w-8 items-center justify-center">
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </Pressable>
        <Text className="flex-1 text-center text-[16px] font-semibold text-[#111827]">
          {t("guardMe.title")}
        </Text>
        <Pressable onPress={load} className="h-8 w-8 items-center justify-center">
          <Ionicons name="refresh-outline" size={20} color="#111827" />
        </Pressable>
      </View>

      {!!err && (
        <View className="mx-4 mt-3 rounded-2xl bg-red-50 border border-red-100 px-4 py-3">
          <Text className="text-[12px] text-red-600">{err}</Text>
        </View>
      )}

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
          <Text className="mt-2 text-[12px] text-gray-500">{t("guardMe.states.loading")}</Text>
        </View>
      ) : !myGuardian?.guardian ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="h-24 w-24 rounded-full bg-gray-100 items-center justify-center">
            <Ionicons name="planet-outline" size={42} color="#9CA3AF" />
          </View>
          <Text className="mt-4 text-[13px] text-gray-500 text-center">
            {t("guardMe.states.empty")}
          </Text>
          <Pressable onPress={() => navigation.goBack()} className="mt-5 rounded-full bg-[#111827] px-5 py-3">
            <Text className="text-white text-[13px] font-semibold">{t("guardMe.actions.goBack")}</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 28 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View
            className="rounded-2xl border border-gray-100 bg-white p-4"
            style={{ shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, elevation: 1 }}
          >
            <Text className="text-[12px] text-gray-500 mb-2">{t("guardMe.labels.currentGuardian")}</Text>

            <Pressable
              onPress={() => navigation.navigate("VisitProfile" as any, { userId: myGuardian.guardian.id })}
              className="flex-row items-center"
            >
              <View className="h-14 w-14 rounded-full bg-[#4F46E5] overflow-hidden items-center justify-center">
                {myGuardian.guardian.avatarUrl ? (
                  <Image source={{ uri: myGuardian.guardian.avatarUrl }} style={{ width: "100%", height: "100%" }} />
                ) : (
                  <Text className="text-white font-semibold text-[16px]">
                    {initials(myGuardian.guardian.nickname || myGuardian.guardian.username)}
                  </Text>
                )}
              </View>

              <View className="flex-1 ml-3">
                <Text className="text-[15px] font-semibold text-[#111827]">
                  {myGuardian.guardian.nickname || myGuardian.guardian.username}
                </Text>
                <Text className="text-[12px] text-gray-500">@{myGuardian.guardian.username}</Text>
              </View>

              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </Pressable>

            <View className="mt-4 rounded-xl bg-gray-50 px-3 py-3">
              <Text className="text-[12px] text-gray-600">
                {t("guardMe.labels.tier")}:{" "}
                <Text className="font-semibold text-[#111827]">{String(myGuardian.tier).toUpperCase()}</Text>
              </Text>
              <Text className="mt-1 text-[12px] text-gray-600">
                {t("guardMe.labels.ends")}:{" "}
                <Text className="font-semibold text-[#111827]">{fmtDate(myGuardian.endsAt)}</Text>
              </Text>
              <Text className="mt-1 text-[12px] text-gray-600">
                {t("guardMe.labels.started")}:{" "}
                <Text className="font-semibold text-[#111827]">{fmtDate(myGuardian.startedAt)}</Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
