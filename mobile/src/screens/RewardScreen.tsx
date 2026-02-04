import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Modal,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { t } from "../i18n";

const API_BASE_URL =
  (process.env.EXPO_PUBLIC_API_BASE_URL || "").replace(/\/$/, "") ||
  "http://192.168.10.25:3000";

type RewardTab = "PKMission" | "Activity" | "FanClub" | "Invite";

type RewardTask = {
  id: string;
  title: string;
  subtitle?: string | null;
  rewardPoints: number;
  current: number;
  target: number;
  goToScreen?: string | null;
  goAction?: string | null;
};

type RewardApiResponse = {
  dailyResetNote: string;
  weeklyResetNote: string;
  pkRecord: {
    highestStreak: number;
    effectiveWins: number;
  };
  pkMission: RewardTask[];
  activity: RewardTask[];
  fanClub: RewardTask[];
  invite: RewardTask[];
};

const RewardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [tab, setTab] = useState<RewardTab>("PKMission");

  const [data, setData] = useState<RewardApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [showRule, setShowRule] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setErrorText(null);

      const userId = await AsyncStorage.getItem("gl_user_id");
      if (!userId) {
        setErrorText(t("reward.errors.notLoggedIn"));
        setData(null);
        return;
      }

      const url = `${API_BASE_URL}/api/profile/rewards?userId=${encodeURIComponent(userId)}`;
      const res = await fetch(url);
      const json = (await res.json().catch(() => null)) as any;

      if (!res.ok || !json || json?.error) {
        setErrorText(json?.error || t("reward.errors.loadFailed"));
        setData(null);
        return;
      }

      const normalized: RewardApiResponse = {
        dailyResetNote: String(json?.dailyResetNote ?? ""),
        weeklyResetNote: String(json?.weeklyResetNote ?? ""),
        pkRecord: {
          highestStreak: Number(json?.pkRecord?.highestStreak ?? 0),
          effectiveWins: Number(json?.pkRecord?.effectiveWins ?? 0),
        },
        pkMission: Array.isArray(json?.pkMission) ? json.pkMission : [],
        activity: Array.isArray(json?.activity) ? json.activity : [],
        fanClub: Array.isArray(json?.fanClub) ? json.fanClub : [],
        invite: Array.isArray(json?.invite) ? json.invite : [],
      };

      setData(normalized);
    } catch (err) {
      console.error("Rewards fetch error", err);
      setErrorText(t("reward.errors.network"));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!cancelled) await load();
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const tasksForTab: RewardTask[] = useMemo(() => {
    if (!data) return [];
    return tab === "PKMission"
      ? data.pkMission
      : tab === "Activity"
      ? data.activity
      : tab === "FanClub"
      ? data.fanClub
      : data.invite;
  }, [data, tab]);

  const handleGoPress = (task: RewardTask) => {
    const to = task.goToScreen || null;
    const action = task.goAction || null;

    const screen =
      to ??
      (action === "OPEN_VIP_CENTER"
        ? "VipCenter"
        : action === "OPEN_ACTIVITY_CENTER"
        ? "Explore"
        : action === "OPEN_LIVE_ROOMS"
        ? "Explore"
        : action === "OPEN_PK_AREA"
        ? "Explore"
        : action === "OPEN_INVITE_CENTER"
        ? "Explore"
        : action === "OPEN_FANCLUB_CENTER"
        ? "Explore"
        : null);

    if (!screen) return;
    navigation.navigate(screen as never);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-4 pt-3 pb-2 border-b border-gray-100">
        <Pressable
          onPress={() => navigation.goBack()}
          className="mr-3 h-9 w-9 items-center justify-center rounded-full"
        >
          <Ionicons name="chevron-back" size={20} color="#111827" />
        </Pressable>

        <Text className="flex-1 text-center text-[18px] font-semibold text-[#111827]">
          {t("reward.title")}
        </Text>

        <Pressable
          onPress={() => setShowRule(true)}
          className="h-9 w-9 items-center justify-center rounded-full"
        >
          <Ionicons name="help-circle-outline" size={20} color="#6B7280" />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Banner */}
        <View className="mx-4 mt-3 rounded-2xl bg-[#8B5CF6] px-4 py-3">
          <Text className="text-[15px] font-semibold text-white">
            {t("reward.banner.title")}
          </Text>
          <Text className="mt-1 text-[11px] text-white/80">
            {t("reward.banner.subtitle")}
          </Text>
        </View>

        {/* Tabs */}
        <View className="mt-4 px-4 flex-row">
          <RewardTabButton
            label={t("reward.tabs.pkMission")}
            active={tab === "PKMission"}
            onPress={() => setTab("PKMission")}
          />
          <RewardTabButton
            label={t("reward.tabs.activity")}
            active={tab === "Activity"}
            onPress={() => setTab("Activity")}
          />
          <RewardTabButton
            label={t("reward.tabs.fanClub")}
            active={tab === "FanClub"}
            onPress={() => setTab("FanClub")}
          />
          <RewardTabButton
            label={t("reward.tabs.invite")}
            active={tab === "Invite"}
            onPress={() => setTab("Invite")}
          />
        </View>

        {errorText && (
          <View className="mt-3 mx-4 rounded-2xl bg-red-50 px-3 py-2">
            <Text className="text-[11px] text-red-600">{errorText}</Text>
          </View>
        )}

        {tab === "PKMission" && data && (
          <View className="mx-4 mt-4 rounded-2xl bg-[#EEF2FF] px-4 py-3">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-[12px] font-semibold text-[#111827]">
                {t("reward.pk.todayRecord")}
              </Text>
              <Text className="text-[11px] text-[#6366F1]">
                {t("reward.pk.recordLink")}
              </Text>
            </View>

            <View className="flex-row justify-between mt-1">
              <View className="flex-1 items-center">
                <Text className="text-[18px] font-semibold text-[#111827]">
                  {data.pkRecord.highestStreak}
                </Text>
                <Text className="mt-1 text-[11px] text-[#6B7280] text-center">
                  {t("reward.pk.highestStreak")}
                </Text>
              </View>

              <View className="w-px bg-[#E5E7EB] mx-2" />

              <View className="flex-1 items-center">
                <Text className="text-[18px] font-semibold text-[#111827]">
                  {data.pkRecord.effectiveWins}
                </Text>
                <Text className="mt-1 text-[11px] text-[#6B7280] text-center">
                  {t("reward.pk.effectiveWins")}
                </Text>
              </View>
            </View>
          </View>
        )}

        {loading && (
          <View className="mt-6 items-center">
            <ActivityIndicator />
            <Text className="mt-2 text-[11px] text-gray-500">
              {t("reward.states.loading")}
            </Text>
          </View>
        )}

        <View className="mt-4 mx-4 mb-8">
          {(tasksForTab ?? []).map((task, index) => (
            <RewardTaskItem
              key={task.id}
              task={task}
              isLast={index === tasksForTab.length - 1}
              onGoPress={() => handleGoPress(task)}
            />
          ))}

          {!loading && (tasksForTab ?? []).length === 0 && !errorText && (
            <Text className="text-[12px] text-[#9CA3AF] mt-2">
              {t("reward.states.empty")}
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Rule modal */}
      <Modal
        transparent
        visible={showRule}
        animationType="fade"
        onRequestClose={() => setShowRule(false)}
      >
        <View className="flex-1 bg-black/40 items-center justify-center px-8">
          <View className="w-full rounded-2xl bg-white px-5 py-4">
            <Text className="text-[16px] font-semibold text-[#111827] mb-3 text-center">
              {t("reward.rule.title")}
            </Text>
            <Text className="text-[13px] text-[#4B5563] mb-2">
              {t("reward.rule.daily")}
            </Text>
            <Text className="text-[13px] text-[#4B5563] mb-4">
              {t("reward.rule.weekly")}
            </Text>
            <Pressable
              onPress={() => setShowRule(false)}
              className="mt-1 rounded-full bg-[#6366F1] py-2"
            >
              <Text className="text-center text-[14px] font-semibold text-white">
                {t("reward.actions.confirm")}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const RewardTabButton: React.FC<{
  label: string;
  active: boolean;
  onPress: () => void;
}> = ({ label, active, onPress }) => (
  <Pressable onPress={onPress} className="mr-4 pb-1">
    <Text
      className={`text-[13px] ${
        active ? "text-[#111827] font-semibold" : "text-gray-400"
      }`}
    >
      {label}
    </Text>
    {active && <View className="h-[2px] bg-[#111827] mt-1 rounded-full" />}
  </Pressable>
);

const RewardTaskItem: React.FC<{
  task: RewardTask;
  isLast: boolean;
  onGoPress?: () => void;
}> = ({ task, isLast, onGoPress }) => (
  <View className="flex-row mt-3">
    <View className="items-center mr-3">
      <View className="w-3 h-3 rounded-full bg-[#6366F1] mt-1" />
      {!isLast && <View className="w-px flex-1 bg-[#E5E7EB]" />}
    </View>

    <View className="flex-1 rounded-2xl bg-white px-3 py-3 shadow-sm shadow-black/5">
      <Text className="text-[13px] font-semibold text-[#111827]">
        {task.title}
      </Text>

      {task.subtitle ? (
        <Text className="mt-1 text-[11px] text-[#6B7280]">{task.subtitle}</Text>
      ) : null}

      <View className="mt-3 flex-row items-center justify-between">
        <View>
          <Text className="text-[11px] text-[#6B7280]">
            ({Number(task.current ?? 0)}/{Number(task.target ?? 0)})
          </Text>
          <Text className="mt-1 text-[12px] font-semibold text-[#F97316]">
            +{Number(task.rewardPoints ?? 0)}
          </Text>
        </View>

        <Pressable className="px-4 py-1 rounded-full bg-[#EEF2FF]" onPress={onGoPress}>
          <Text className="text-[12px] font-semibold text-[#4F46E5]">
            {t("reward.actions.go")}
          </Text>
        </Pressable>
      </View>
    </View>
  </View>
);

export default RewardScreen;
