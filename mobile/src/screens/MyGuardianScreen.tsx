// src/screens/MyGuardianScreen.tsx
import React, { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, FlatList, ActivityIndicator, Image, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "../navigation/ProfileStackNavigator";

type Nav = NativeStackNavigationProp<ProfileStackParamList, "MyGuardian">;
type R = RouteProp<ProfileStackParamList, "MyGuardian">;

const USER_ID_KEY = "gl_user_id";

function getApiBase() {
  const raw =
    (process.env.EXPO_PUBLIC_API_URL ??
      process.env.EXPO_PUBLIC_API_BASE_URL ??
      "").trim();
  const base = raw.replace(/\/+$/, "");
  return base || "http://192.168.10.25:3000";
}

type ApiUser = { id: string; username: string; nickname?: string | null; avatarUrl?: string | null };

type GuardianResponse = {
  myGuarding: Array<{
    id: string;
    tier: string;
    startedAt: string;
    endsAt: string;
    guarded: ApiUser;
  }>;
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

const MyGuardianScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();

  const routeUserId = (route.params as any)?.userId as string | undefined;

  const [userId, setUserId] = useState<string | null>(routeUserId ?? null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [list, setList] = useState<GuardianResponse["myGuarding"]>([]);

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

      if (!userId) throw new Error("Missing userId. Please login again.");

      const base = getApiBase();
      const res = await fetch(`${base}/api/profile/guardian?userId=${encodeURIComponent(userId)}`);
      const json = (await res.json().catch(() => null)) as any;
      if (!res.ok) throw new Error(json?.error || "Failed to load");
      setList(Array.isArray(json?.myGuarding) ? json.myGuarding : []);
    } catch (e: any) {
      setErr(e?.message || "Error");
      setList([]);
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
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <Pressable onPress={navigation.goBack} className="h-8 w-8 items-center justify-center">
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </Pressable>
        <Text className="flex-1 text-center text-[16px] font-semibold text-[#111827]">
          My guardian
        </Text>
        <View className="h-8 w-8" />
      </View>

      {!!err && (
        <View className="mx-4 mt-3 rounded-2xl bg-red-50 border border-red-100 px-4 py-3">
          <Text className="text-[12px] text-red-600">{err}</Text>
        </View>
      )}

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
          <Text className="mt-2 text-[12px] text-gray-500">Loading…</Text>
        </View>
      ) : list.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="h-24 w-24 rounded-full bg-gray-100 items-center justify-center">
            <Ionicons name="shield-outline" size={42} color="#9CA3AF" />
          </View>
          <Text className="mt-4 text-[13px] text-gray-500 text-center">
            You haven't guarded someone yet.
          </Text>

          <Pressable
            onPress={() => navigation.goBack()}
            className="mt-5 rounded-full bg-[#111827] px-5 py-3"
          >
            <Text className="text-white text-[13px] font-semibold">Go back</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(x) => x.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 28 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item }) => {
            const name = item.guarded.nickname || item.guarded.username;
            return (
              <Pressable
                onPress={() => navigation.navigate("VisitProfile" as any, { userId: item.guarded.id })}
                className="rounded-2xl border border-gray-100 bg-white px-14 py-4"
                style={{ shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, elevation: 1 }}
              >
                <View className="flex-row items-center">
                  <View className="h-12 w-12 rounded-full bg-[#F97316] overflow-hidden items-center justify-center">
                    {item.guarded.avatarUrl ? (
                      <Image source={{ uri: item.guarded.avatarUrl }} style={{ width: "100%", height: "100%" }} />
                    ) : (
                      <Text className="text-white font-semibold">{initials(name)}</Text>
                    )}
                  </View>

                  <View className="flex-1 ml-3">
                    <Text className="text-[14px] font-semibold text-[#111827]">{name}</Text>
                    <Text className="text-[12px] text-gray-500">@{item.guarded.username}</Text>
                    <Text className="mt-1 text-[11px] text-gray-500">
                      Tier: <Text className="font-semibold">{String(item.tier).toUpperCase()}</Text> • Ends:{" "}
                      <Text className="font-semibold">{fmtDate(item.endsAt)}</Text>
                    </Text>
                  </View>

                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
};

export default MyGuardianScreen;
