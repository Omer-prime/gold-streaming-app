import React, { useCallback, useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { t } from "../i18n";

type LevelTab = "Wealth" | "Live";

type LevelApiResponse = {
  type: "WEALTH" | "LIVE";
  exp: number;
  currentLevel: number;
  nextLevel: number | null;
  progressPct: number;
  expToNext: number | null;
  benefits: Array<{
    unlockLevel: number;
    title: string;
    description?: string;
    locked: boolean;
  }>;
  lockedLevels: Array<{
    level: number;
    preview: string[];
  }>;
};

function getApiBaseUrl() {
  const raw = (
    process.env.EXPO_PUBLIC_API_BASE_URL ??
    process.env.EXPO_PUBLIC_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    ""
  ).trim();
  return raw.replace(/\/+$/, "") || "http://localhost:4000";
}

async function buildHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = await AsyncStorage.getItem("token");
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function apiGet<T>(path: string): Promise<T> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}${path}`, { headers: await buildHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as T;
}

function formatNum(n?: number | null) {
  if (n === null || n === undefined) return "";
  return new Intl.NumberFormat("en-US").format(n);
}

const LevelScreen: React.FC = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<LevelTab>("Wealth");

  const [wealthData, setWealthData] = useState<LevelApiResponse | null>(null);
  const [liveData, setLiveData] = useState<LevelApiResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const current = useMemo(() => {
    return activeTab === "Wealth" ? wealthData : liveData;
  }, [activeTab, wealthData, liveData]);

  const fetchLevel = useCallback(async (tab: LevelTab) => {
    const type = tab === "Wealth" ? "WEALTH" : "LIVE";
    const data = await apiGet<LevelApiResponse>(`/api/profile/levels?type=${type}`);
    if (tab === "Wealth") setWealthData(data);
    else setLiveData(data);
  }, []);

  const load = useCallback(
    async (tab: LevelTab, isRefresh = false) => {
      try {
        isRefresh ? setRefreshing(true) : setLoading(true);
        await fetchLevel(tab);
      } catch (e) {
        // keep UI stable
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [fetchLevel]
  );

  useFocusEffect(
    useCallback(() => {
      let alive = true;

      (async () => {
        if (!alive) return;
        await load(activeTab, false);
      })();

      const id = setInterval(() => {
        if (!alive) return;
        load(activeTab, true);
      }, 12000);

      return () => {
        alive = false;
        clearInterval(id);
      };
    }, [load, activeTab])
  );

  useEffect(() => {
    if (activeTab === "Wealth" && !wealthData) load("Wealth", false);
    if (activeTab === "Live" && !liveData) load("Live", false);
  }, [activeTab, wealthData, liveData, load]);

  const headerTitle =
    activeTab === "Wealth" ? t("level.header.wealthTitle") : t("level.header.liveTitle");

  const progressPct = current ? Math.round(current.progressPct) : 0;

  return (
    <SafeAreaView className="flex-1 bg-[#022c22]" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-4 pt-3 pb-2">
        <Pressable onPress={() => (navigation as any).goBack()}>
          <Ionicons name="chevron-back" size={22} color="#F9FAFB" />
        </Pressable>
        <Text className="flex-1 text-center text-[16px] font-semibold text-[#F9FAFB]">
          {headerTitle}
        </Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Top switch */}
      <View className="flex-row justify-center mt-1">
        <LevelSwitch
          label={t("level.tabs.wealth")}
          active={activeTab === "Wealth"}
          onPress={() => setActiveTab("Wealth")}
        />
        <LevelSwitch
          label={t("level.tabs.live")}
          active={activeTab === "Live"}
          onPress={() => setActiveTab("Live")}
        />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(activeTab, true)}
            tintColor={Platform.OS === "ios" ? "#ffffff" : undefined}
          />
        }
      >
        {/* Main level card */}
        <LinearGradient
          colors={["#065f46", "#0f766e"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            marginHorizontal: 16,
            marginTop: 12,
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingVertical: 18,
          }}
        >
          <Text className="text-[12px] text-emerald-100">{headerTitle}</Text>

          <View className="mt-2 flex-row items-center justify-between">
            <Text className="text-[26px] font-bold text-white">
              {t("level.labels.levelShort", { level: current?.currentLevel ?? 1 })}
            </Text>

            <View className="h-14 w-14 rounded-2xl bg-white/10 items-center justify-center">
              <Ionicons name="stats-chart" size={26} color="#4ADE80" />
            </View>
          </View>

          <View className="mt-3 h-2 rounded-full bg-black/30 overflow-hidden">
            <View style={{ width: `${progressPct}%` }} className="h-full rounded-full bg-[#4ADE80]" />
          </View>

          <View className="mt-2 flex-row items-center justify-between">
            <Text className="text-[11px] text-emerald-100">
              {current?.expToNext == null
                ? t("level.progress.maxLevelReached")
                : t("level.progress.distanceToUpgrade", { exp: formatNum(current.expToNext) })}
            </Text>
            {loading ? <ActivityIndicator /> : null}
          </View>

          <Text className="mt-2 text-[11px] text-emerald-200">
            {t("level.progress.exp", { exp: formatNum(current?.exp ?? 0) })}
          </Text>
        </LinearGradient>

        {/* Content */}
        <View className="mt-4 px-4">
          {/* My benefits */}
          <View className="rounded-2xl bg-black/30 px-4 py-3 mb-4">
            <Text className="text-[13px] text-emerald-100 mb-2">
              {t("level.sections.myBenefits")}
            </Text>

            {!current ? (
              <View className="rounded-xl bg-black/40 px-4 py-3">
                <Text className="text-[12px] text-emerald-200">
                  {t("level.states.loadingBenefits")}
                </Text>
              </View>
            ) : current.benefits.length === 0 ? (
              <View className="rounded-xl bg-black/40 px-4 py-3">
                <Text className="text-[12px] text-emerald-200">
                  {t("level.states.noBenefits")}
                </Text>
              </View>
            ) : (
              current.benefits.map((b) => (
                <View key={`${b.unlockLevel}-${b.title}`} className="mb-2 rounded-xl bg-black/40 px-4 py-3">
                  <Text className="text-[12px] text-emerald-50 mb-1">
                    {t("level.benefits.titleWithLevel", { title: b.title, level: b.unlockLevel })}
                  </Text>
                  {!!b.description && (
                    <Text className="text-[11px] text-emerald-200">{b.description}</Text>
                  )}
                </View>
              ))
            )}
          </View>

          {/* Locked benefits */}
          <LockedLevels lockedLevels={current?.lockedLevels ?? []} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const LevelSwitch: React.FC<{
  label: string;
  active: boolean;
  onPress: () => void;
}> = ({ label, active, onPress }) => (
  <Pressable onPress={onPress} className="mx-3 pb-1">
    <Text className={`text-[14px] ${active ? "text-white font-semibold" : "text-emerald-200"}`}>
      {label}
    </Text>
    {active && <View className="h-[2px] bg-white mt-1 rounded-full" />}
  </Pressable>
);

const LockedLevels: React.FC<{ lockedLevels: Array<{ level: number; preview: string[] }> }> = ({ lockedLevels }) => (
  <View>
    <Text className="text-[13px] text-emerald-100 mb-2">
      {t("level.sections.lockedBenefits")}
    </Text>

    {lockedLevels.length === 0 ? (
      <View className="mb-2 rounded-2xl bg-black/30 px-4 py-3">
        <Text className="text-[12px] text-emerald-200">
          {t("level.states.noLocked")}
        </Text>
      </View>
    ) : (
      lockedLevels.map((item) => (
        <View
          key={`lv-${item.level}`}
          className="mb-2 rounded-2xl bg-black/30 px-4 py-3 flex-row items-center justify-between"
        >
          <View style={{ paddingRight: 12 }}>
            <Text className="text-[13px] text-emerald-50">
              {t("level.labels.levelShort", { level: item.level })}
            </Text>
            <Text className="text-[11px] text-emerald-200 mt-1">
              {item.preview?.length
                ? t("level.locked.unlocksAtWithPreview", {
                    level: item.level,
                    preview: item.preview.join(", "),
                  })
                : t("level.locked.unlocksAt", { level: item.level })}
            </Text>
          </View>
          <Ionicons name="lock-closed-outline" size={18} color="#A7F3D0" />
        </View>
      ))
    )}
  </View>
);

export default LevelScreen;
