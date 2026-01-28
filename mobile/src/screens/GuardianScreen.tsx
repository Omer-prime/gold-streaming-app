// src/screens/GuardianScreen.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  TextInput,
  FlatList,
  ActivityIndicator,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "../navigation/ProfileStackNavigator";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Nav = NativeStackNavigationProp<ProfileStackParamList, "Guardian">;
type GuardianRoute = RouteProp<ProfileStackParamList, "Guardian">;

const USER_ID_KEY = "gl_user_id";

/**
 * ✅ IMPORTANT:
 * If you're testing on a real phone, "localhost" will NOT work.
 * Keep this as your machine LAN IP or your deployed domain.
 */
function getApiBase() {
  const raw =
    (process.env.EXPO_PUBLIC_API_URL ??
      process.env.EXPO_PUBLIC_API_BASE_URL ??
      "").trim();
  const base = raw.replace(/\/+$/, "");
  return base ;
}

function themeForTier(tier?: string) {
  const t = String(tier ?? "").toUpperCase();
  if (t === "SILVER")
    return { bg: ["#0B2A68", "#071733"], chip: "#BFDBFE", cta: "#3B82F6", title: "#E5E7EB" };
  if (t === "GOLD")
    return { bg: ["#7A3E00", "#2B1300"], chip: "#FFD59A", cta: "#F59E0B", title: "#FFF7ED" };
  if (t === "DIAMOND")
    return { bg: ["#4C1D95", "#0B1020"], chip: "#E9D5FF", cta: "#A855F7", title: "#F5F3FF" };
  if (t === "KING")
    return { bg: ["#7C2D12", "#0B1020"], chip: "#FED7AA", cta: "#FB923C", title: "#FFF7ED" };
  return { bg: ["#0F172A", "#1D4ED8"], chip: "#BFDBFE", cta: "#2563EB", title: "#E5E7EB" };
}

function tierIcon(tier?: string) {
  const t = String(tier ?? "").toUpperCase();
  if (t === "SILVER") return "shield-outline";
  if (t === "GOLD") return "medal-outline";
  if (t === "DIAMOND") return "diamond-outline";
  if (t === "KING") return "crown-outline";
  return "shield-checkmark-outline";
}

type ApiUser = { id: string; username: string; nickname?: string | null; avatarUrl?: string | null };
type GuardianPackage = { id: string; label: string; durationMonths: number; priceCoins: number };
type GuardianPrivilege = { key: string; label: string; value?: string; locked?: boolean; icon?: string | null };

type GuardianPlan = {
  id: string;
  tier: string;
  name: string;
  description?: string;
  packages: GuardianPackage[];
  privileges: GuardianPrivilege[];
};

type GuardianResponse = {
  meta?: { totalPlans: number; activePlans: number; activePackages: number; now: string };
  plans: GuardianPlan[];
  myGuardian: null | {
    id: string;
    tier: string;
    startedAt: string;
    endsAt: string;
    guardian: ApiUser;
    plan?: { id: string; name: string };
    package?: { id: string; label: string; durationMonths: number; priceCoins: number };
  };
  myGuarding: Array<{
    id: string;
    tier: string;
    startedAt: string;
    endsAt: string;
    guarded: ApiUser;
    plan?: { id: string; name: string };
    package?: { id: string; label: string; durationMonths: number; priceCoins: number };
  }>;
};

function iconFor(priv: GuardianPrivilege) {
  if (priv.icon) return priv.icon as any;
  const key = (priv.key ?? "").toLowerCase();
  if (key.includes("rank")) return "bar-chart-outline";
  if (key.includes("logo")) return "ribbon-outline";
  if (key.includes("entry")) return "sparkles-outline";
  if (key.includes("bubble")) return "chatbubble-ellipses-outline";
  if (key.includes("gift")) return "gift-outline";
  return "shield-checkmark-outline";
}


async function fetchJsonLoose(url: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const text = await res.text();
  let json: any = null;

  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  if (!res.ok) {
    throw new Error(json?.error || `Request failed (HTTP ${res.status})`);
  }

  if (!json) {
    const preview = (text || "").replace(/\s+/g, " ").trim().slice(0, 180);
    throw new Error(`API returned non-JSON. Preview: ${preview || "(empty)"}`);
  }

  return json;
}

/** clean plan normalizer (prevents crash if a plan has missing packages/privileges) */
function normalizePlans(list: any[]): GuardianPlan[] {
  const safe = Array.isArray(list) ? list : [];
  return safe
    .map((p) => {
      const packages = Array.isArray(p?.packages) ? p.packages : [];
      const privileges = Array.isArray(p?.privileges) ? p.privileges : [];

      return {
        id: String(p?.id ?? ""),
        tier: String(p?.tier ?? ""),
        name: String(p?.name ?? ""),
        description: p?.description ?? "",
        packages: packages
          .map((x: any) => ({
            id: String(x?.id ?? ""),
            label: String(x?.label ?? ""),
            durationMonths: Number(x?.durationMonths ?? 0) || 0,
            priceCoins: Number(x?.priceCoins ?? 0) || 0,
          }))
          .filter((x: GuardianPackage) => !!x.id)
          .sort((a: GuardianPackage, b: GuardianPackage) => (a.durationMonths ?? 0) - (b.durationMonths ?? 0)),
        privileges: privileges
          .map((x: any) => ({
            key: String(x?.key ?? ""),
            label: String(x?.label ?? ""),
            value: x?.value ?? "",
            locked: Boolean(x?.locked ?? false),
            icon: x?.icon ?? null,
          }))
          .filter((x: GuardianPrivilege) => !!x.key),
      };
    })
    .filter((p) => !!p.id);
}

const GuardianScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<GuardianRoute>();
  const { width } = useWindowDimensions();

  const routeUserId = (route.params as any)?.userId as string | undefined;
  const [resolvedUserId, setResolvedUserId] = useState<string | null>(routeUserId ?? null);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [meta, setMeta] = useState<GuardianResponse["meta"]>(undefined);

  const [plans, setPlans] = useState<GuardianPlan[]>([]);
  const [myGuardian, setMyGuardian] = useState<GuardianResponse["myGuardian"]>(null);
  const [myGuarding, setMyGuarding] = useState<GuardianResponse["myGuarding"]>([]);

  // swiper
  const pagerRef = useRef<FlatList<GuardianPlan>>(null);
  const [page, setPage] = useState(0);

  // package selection per plan
  const [selectedPkgByPlan, setSelectedPkgByPlan] = useState<Record<string, string>>({});

  // user picker
  const [pickerOpen, setPickerOpen] = useState(false);
  const [q, setQ] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<ApiUser[]>([]);
  const [target, setTarget] = useState<ApiUser | null>(null);

  const [activating, setActivating] = useState(false);

  const currentPlan = useMemo(() => plans[page] ?? null, [plans, page]);
  const theme = useMemo(() => themeForTier(currentPlan?.tier), [currentPlan?.tier]);
  const title = currentPlan?.name ?? "Open Guardian";

  const selectedPkg = useMemo(() => {
    if (!currentPlan) return null;
    const selId = selectedPkgByPlan[currentPlan.id];
    return currentPlan.packages.find((p) => p.id === selId) ?? currentPlan.packages[0] ?? null;
  }, [currentPlan, selectedPkgByPlan]);

  // Resolve userId from AsyncStorage if not passed
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (routeUserId) return;
      const stored = await AsyncStorage.getItem(USER_ID_KEY);
      if (!mounted) return;
      setResolvedUserId(stored || null);
    })();
    return () => {
      mounted = false;
    };
  }, [routeUserId]);

  async function load() {
    setLoading(true);
    setErr(null);

    try {
      const userId = resolvedUserId;
      if (!userId) throw new Error("Missing userId. Please login again.");

      const base = getApiBase();
      const url = `${base}/api/profile/guardian?userId=${encodeURIComponent(userId)}`;
      const json: GuardianResponse = await fetchJsonLoose(url);

      setMeta(json?.meta);

      const list = normalizePlans((json as any)?.plans ?? []);
      setPlans(list);

      setMyGuardian(json?.myGuardian ?? null);
      setMyGuarding(Array.isArray(json?.myGuarding) ? json.myGuarding : []);

      // default pkg selection per plan
      setSelectedPkgByPlan((prev) => {
        const next = { ...prev };
        for (const p of list) {
          if (!next[p.id] && p.packages?.[0]?.id) next[p.id] = p.packages[0].id;
        }
        return next;
      });

      // keep page in range
      setPage((p) => Math.min(p, Math.max(0, list.length - 1)));

      // If API says activePlans > 0 but list is empty, show clear message
      if ((json?.meta?.activePlans ?? 0) > 0 && list.length === 0) {
        setErr("Plans exist but returned empty. Check active packages for active plans.");
      }
    } catch (e: any) {
      setErr(e?.message || "Error");
      setMeta(undefined);
      setPlans([]);
      setMyGuardian(null);
      setMyGuarding([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!resolvedUserId) {
      setLoading(false);
      setErr("Missing userId. Please login again.");
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedUserId]);

  async function searchUsers() {
    try {
      const qq = q.trim();
      if (qq.length < 2) {
        setResults([]);
        return;
      }
      setSearching(true);
      const base = getApiBase();
      const url = `${base}/api/profile/users/search?q=${encodeURIComponent(qq)}&limit=20`;
      const json = await fetchJsonLoose(url);
      setResults(Array.isArray(json?.users) ? json.users : []);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  async function activate() {
    try {
      const userId = resolvedUserId;
      if (!userId) throw new Error("Missing userId");
      if (!target?.id) throw new Error("Select a user to guard first");
      if (!selectedPkg?.id) throw new Error("Select duration first");

      setActivating(true);
      const base = getApiBase();

      const json = await fetchJsonLoose(`${base}/api/profile/guardian/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, targetUserId: target.id, packageId: selectedPkg.id }),
      });

      if (!json?.ok) {
        throw new Error(json?.error || "Activation failed");
      }

      await load();
      setPickerOpen(false);
    } catch (e: any) {
      setErr(e?.message || "Error");
    } finally {
      setActivating(false);
    }
  }

  function goPrev() {
    if (page <= 0) return;
    pagerRef.current?.scrollToIndex({ index: page - 1, animated: true });
    setPage(page - 1);
  }

  function goNext() {
    if (page >= plans.length - 1) return;
    pagerRef.current?.scrollToIndex({ index: page + 1, animated: true });
    setPage(page + 1);
  }

  return (
    <SafeAreaView className="flex-1 bg-[#020617]" edges={["top"]}>
      <LinearGradient colors={theme.bg as any} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} className="flex-1">
        {/* Header */}
        <View className="flex-row items-center px-4 py-3">
          <Pressable onPress={navigation.goBack} className="mr-3 h-8 w-8 items-center justify-center">
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          </Pressable>

          <Text className="flex-1 text-center text-[17px] font-semibold" style={{ color: theme.title }}>
            {title}
          </Text>

          <Pressable className="w-8 items-center justify-center" onPress={load}>
            <Ionicons name="refresh-outline" size={20} color={theme.chip} />
          </Pressable>
        </View>

        {/* Dots */}
        {plans.length > 1 && (
          <View className="flex-row justify-center gap-2 pb-2">
            {plans.map((_, i) => (
              <View
                key={i}
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: i === page ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.25)" }}
              />
            ))}
          </View>
        )}

        {!!err && (
          <View className="mx-4 mb-2 rounded-2xl bg-red-500/15 border border-red-500/30 px-4 py-3">
            <Text className="text-[12px] text-red-200">{err}</Text>
            <Text className="text-[10px] text-red-200/70 mt-1">Base: {getApiBase()}</Text>

            {!!meta && (
              <Text className="text-[10px] text-red-200/70 mt-1">
                Plans: {meta.activePlans}/{meta.totalPlans} • Packages: {meta.activePackages}
              </Text>
            )}
          </View>
        )}

        {/* arrows */}
        {plans.length > 1 && (
          <>
            <Pressable
              onPress={goPrev}
              disabled={page === 0}
              className="absolute left-2 top-24 h-10 w-10 rounded-full bg-black/20 items-center justify-center"
              style={{ opacity: page === 0 ? 0.3 : 1 }}
            >
              <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
            </Pressable>

            <Pressable
              onPress={goNext}
              disabled={page === plans.length - 1}
              className="absolute right-2 top-24 h-10 w-10 rounded-full bg-black/20 items-center justify-center"
              style={{ opacity: page === plans.length - 1 ? 0.3 : 1 }}
            >
              <Ionicons name="chevron-forward" size={22} color="#FFFFFF" />
            </Pressable>
          </>
        )}

        {/* Swiper */}
        <FlatList
          ref={pagerRef}
          data={plans}
          keyExtractor={(x) => x.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const i = Math.round(e.nativeEvent.contentOffset.x / Math.max(1, width));
            setPage(i);
          }}
          renderItem={({ item }) => {
            const t = themeForTier(item.tier);
            const selId = selectedPkgByPlan[item.id];
            const pkg = item.packages.find((p) => p.id === selId) ?? item.packages[0] ?? null;

            return (
              <View style={{ width }}>
                <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
                  {/* Hero */}
                  <View className="items-center mt-2">
                    <LinearGradient
                      colors={["rgba(255,255,255,0.18)", "rgba(255,255,255,0.06)"]}
                      className="h-36 w-36 rounded-full items-center justify-center border border-white/10"
                    >
                      {loading ? (
                        <ActivityIndicator />
                      ) : (
                        <Ionicons name={tierIcon(item.tier) as any} size={64} color={t.chip} />
                      )}
                    </LinearGradient>

                    <Text className="mt-3 text-[14px] font-semibold" style={{ color: t.title }}>
                      {item.name}
                    </Text>
                    <Text className="mt-1 text-[11px] text-white/60">{String(item.tier ?? "").toUpperCase()} Guardian</Text>

                    {!!item.description && (
                      <Text className="mt-1 text-[11px] text-white/55 px-8 text-center">{item.description}</Text>
                    )}
                  </View>

                  {/* Guard someone */}
                  <View className="mt-5 mx-4 rounded-3xl bg-white/10 p-4">
                    <Text className="text-[13px] font-semibold text-white mb-3">I want to guard him/her</Text>

                    <View className="flex-row items-center mb-3">
                      <View className="h-10 w-10 rounded-full bg-white/20 items-center justify-center mr-3">
                        <Ionicons name="person-outline" size={22} color="#E5E7EB" />
                      </View>

                      <View className="flex-1">
                        <Text className="text-[12px] text-white">
                          {target ? target.nickname || target.username : "No user selected"}
                        </Text>
                        {target ? <Text className="text-[11px]" style={{ color: t.chip }}>@{target.username}</Text> : null}
                      </View>

                      <Pressable onPress={() => setPickerOpen(true)} className="ml-auto rounded-full bg-white px-3 py-1.5">
                        <Text className="text-[12px] font-semibold" style={{ color: t.cta }}>Select</Text>
                      </Pressable>
                    </View>

                    {/* Durations */}
                    <View className="flex-row flex-wrap">
                      {(item.packages ?? []).map((p) => {
                        const active = p.id === (pkg?.id ?? "");
                        return (
                          <Pressable
                            key={p.id}
                            onPress={() => setSelectedPkgByPlan((prev) => ({ ...prev, [item.id]: p.id }))}
                            className={`mr-2 mb-2 rounded-full px-3 py-1.5 ${active ? "bg-white" : "bg-white/10"}`}
                          >
                            <Text
                              className={`text-[11px] ${active ? "font-semibold" : ""}`}
                              style={{ color: active ? t.cta : "#FFFFFF" }}
                            >
                              {p.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>

                    <Text className="mt-3 text-[12px] text-white/75">
                      Coins needed:{" "}
                      <Text className="font-semibold text-[#FACC15]">{Number(pkg?.priceCoins ?? 0).toLocaleString()}</Text>
                    </Text>
                  </View>

                  {/* Links */}
                  <View className="mt-4 mx-4 rounded-3xl bg-white/10">
                    <Pressable
                      onPress={() => navigation.navigate("MyGuardian" as any, { userId: resolvedUserId ?? undefined })}
                      className="flex-row items-center justify-between px-4 py-3"
                    >
                      <View className="flex-1">
                        <Text className="text-[13px] text-white">My guardian</Text>
                        <Text className="text-[11px] mt-0.5" style={{ color: t.chip }}>
                          You are guarding: {myGuarding.length}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={t.chip} />
                    </Pressable>

                    <View className="h-px bg-white/10 mx-4" />

                    <Pressable
                      onPress={() => navigation.navigate("GuardMe" as any, { userId: resolvedUserId ?? undefined })}
                      className="flex-row items-center justify-between px-4 py-3"
                    >
                      <View className="flex-1">
                        <Text className="text-[13px] text-white">Guard me</Text>
                        <Text className="text-[11px] mt-0.5" style={{ color: t.chip }}>
                          {myGuardian?.guardian
                            ? `Guardian: ${myGuardian.guardian.nickname || myGuardian.guardian.username}`
                            : "No one is guarding you yet"}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={t.chip} />
                    </Pressable>
                  </View>

                  {/* Privileges */}
                  <View className="mt-5 mx-4 rounded-3xl bg-white/10 p-4">
                    <Text className="text-[13px] font-semibold text-white mb-3">Guardian privileges</Text>

                    <View className="flex-row flex-wrap -mx-1">
                      {(item.privileges ?? []).map((p) => (
                        <View key={p.key} className="w-1/3 px-1 mb-3 items-center justify-center">
                          <View className="h-10 w-10 rounded-2xl bg-white/15 items-center justify-center mb-1">
                            <Ionicons name={iconFor(p) as any} size={20} color={t.chip} />
                          </View>
                          <Text className="text-[11px] text-center text-[#E5E7EB]">{p.label}</Text>
                        </View>
                      ))}

                      {(!item.privileges || item.privileges.length === 0) && (
                        <Text className="text-white/60 text-[11px] px-2">No privileges configured.</Text>
                      )}
                    </View>
                  </View>

                  {/* CTA */}
                  <Pressable
                    onPress={activate}
                    disabled={loading || activating}
                    className="mt-6 mx-6 rounded-full py-3.5 items-center justify-center"
                    style={{ backgroundColor: loading || activating ? "rgba(255,255,255,0.15)" : t.cta }}
                  >
                    <Text className="text-[14px] font-semibold text-white">
                      {activating ? "Activating..." : `Activate ${String(item.tier ?? "").toUpperCase()} Guardian`}
                    </Text>
                  </Pressable>
                </ScrollView>
              </View>
            );
          }}
          ListEmptyComponent={() => (
            <View className="flex-1 items-center justify-center mt-16 px-6">
              {loading ? (
                <ActivityIndicator />
              ) : (
                <>
                  <Text className="text-white/80 text-[13px]">No plans found</Text>

                  {!!meta ? (
                    <Text className="text-white/50 text-[11px] mt-2 text-center">
                      Active plans: {meta.activePlans}/{meta.totalPlans} • Active packages: {meta.activePackages}
                    </Text>
                  ) : (
                    <Text className="text-white/50 text-[11px] mt-2 text-center">
                      This means API returned 0 active plans (isActive=true). Check guardianPlan + packages are active.
                    </Text>
                  )}

                  <Pressable onPress={load} className="mt-4 rounded-full bg-white/15 px-4 py-2">
                    <Text className="text-white text-[12px]">Refresh</Text>
                  </Pressable>
                </>
              )}
            </View>
          )}
        />

        {/* User Picker Modal */}
        <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
          <View className="flex-1 bg-black/60 items-center justify-center px-4">
            <View className="w-full rounded-3xl bg-[#0B1220] border border-white/10 p-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-white font-semibold text-[14px]">Select user</Text>
                <Pressable onPress={() => setPickerOpen(false)}>
                  <Ionicons name="close" size={22} color="#BFDBFE" />
                </Pressable>
              </View>

              <View className="mt-3 flex-row items-center rounded-2xl border border-white/10 bg-white/5 px-3">
                <Ionicons name="search-outline" size={18} color="#BFDBFE" />
                <TextInput
                  value={q}
                  onChangeText={setQ}
                  placeholder="Search username or nickname..."
                  placeholderTextColor="#94A3B8"
                  className="flex-1 px-2 py-2 text-white"
                  autoCapitalize="none"
                />
                <Pressable onPress={searchUsers} className="rounded-xl bg-white px-3 py-2">
                  <Text className="text-[#1D4ED8] font-semibold text-[12px]">{searching ? "..." : "Search"}</Text>
                </Pressable>
              </View>

              <View className="mt-3 max-h-64">
                {searching ? (
                  <View className="py-6 items-center">
                    <ActivityIndicator />
                  </View>
                ) : (
                  <FlatList
                    data={results}
                    keyExtractor={(x) => x.id}
                    ItemSeparatorComponent={() => <View className="h-px bg-white/10" />}
                    renderItem={({ item }) => (
                      <Pressable
                        onPress={() => {
                          setTarget(item);
                          setPickerOpen(false);
                        }}
                        className="py-3"
                      >
                        <Text className="text-white text-[13px] font-semibold">{item.nickname || item.username}</Text>
                        <Text className="text-[#BFDBFE] text-[11px]">@{item.username}</Text>
                      </Pressable>
                    )}
                    ListEmptyComponent={() => (
                      <Text className="text-[#94A3B8] text-[12px] py-4">Type at least 2 characters and search.</Text>
                    )}
                  />
                )}
              </View>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default GuardianScreen;
