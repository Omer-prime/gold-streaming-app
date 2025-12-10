// src/screens/RewardScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://192.168.10.25:3000";

type RewardTab = "PKMission" | "Activity" | "FanClub" | "Invite";

type RewardTask = {
  id: string;
  title: string;
  subtitle?: string | null;
  rewardPoints: number;
  current: number;
  target: number;
  // optional navigation target for GO button
  goToScreen?: "Explore" | "VipCenter" | "Auth" | "LiveApplication";
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
  const [errorText, setErrorText] = useState<string | null>(null);
  const [showRule, setShowRule] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setErrorText(null);

        const userId = await AsyncStorage.getItem("gl_user_id");
        if (!userId) {
          if (!cancelled) {
            setErrorText("Not logged in.");
            setData(null);
          }
          return;
        }

        const url = `${API_BASE_URL}/api/profile/rewards?userId=${encodeURIComponent(
          userId
        )}`;

        const res = await fetch(url);
        const json = (await res.json().catch(() => null)) as
          | RewardApiResponse
          | { error?: string }
          | null;

        if (cancelled) return;

        if (!res.ok || !json || (json as any).error) {
          console.log("Rewards error", json || res.status);
          setErrorText(
            (json as any)?.error || "Failed to load reward tasks."
          );
          setData(null);
          return;
        }

        setData(json as RewardApiResponse);
      } catch (err) {
        if (!cancelled) {
          console.error("Rewards fetch error", err);
          setErrorText("Network error while loading reward tasks.");
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const tasksForTab: RewardTask[] =
    tab === "PKMission"
      ? data?.pkMission ?? []
      : tab === "Activity"
      ? data?.activity ?? []
      : tab === "FanClub"
      ? data?.fanClub ?? []
      : data?.invite ?? [];

  const handleGoPress = (task: RewardTask) => {
    if (!task.goToScreen) return;

    switch (task.goToScreen) {
      case "VipCenter":
        navigation.navigate("VipCenter" as never);
        break;
      case "Auth":
        navigation.navigate("Auth" as never);
        break;
      case "LiveApplication":
        // 🔧 Change "LiveApplication" to your actual route name if different
        navigation.navigate("LiveApplication" as never);
        break;
      case "Explore":
        /**
         * 🔧 If your Explore screen lives in a different navigator
         * you might need something like:
         * navigation.navigate("MainTabs", { screen: "Explore" });
         */
        navigation.navigate("Explore" as never);
        break;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-4 pt-3 pb-2">
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </Pressable>
        <View className="flex-1 items-center">
          <Text className="text-[16px] font-semibold text-[#111827]">
            Reward
          </Text>
        </View>
        <Pressable onPress={() => setShowRule(true)}>
          <Ionicons name="help-circle-outline" size={20} color="#6B7280" />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner */}
        <View className="mx-4 mt-2 rounded-2xl bg-[#8B5CF6] px-4 py-3">
          <Text className="text-[15px] font-semibold text-white">
            Host tasks & rewards
          </Text>
          <Text className="mt-1 text-[11px] text-white/80">
            Complete daily and weekly tasks to earn more points.
          </Text>
        </View>

        {/* Tabs */}
        <View className="mt-4 px-4 flex-row">
          <RewardTabButton
            label="PK Mission"
            active={tab === "PKMission"}
            onPress={() => setTab("PKMission")}
          />
          <RewardTabButton
            label="Activity"
            active={tab === "Activity"}
            onPress={() => setTab("Activity")}
          />
          <RewardTabButton
            label="Fan Club"
            active={tab === "FanClub"}
            onPress={() => setTab("FanClub")}
          />
          <RewardTabButton
            label="Invite"
            active={tab === "Invite"}
            onPress={() => setTab("Invite")}
          />
        </View>

        {/* Error */}
        {errorText && (
          <View className="mt-3 mx-4 rounded-2xl bg-red-50 px-3 py-2">
            <Text className="text-[11px] text-red-600">{errorText}</Text>
          </View>
        )}

        {/* PK header card only on PK Mission tab */}
        {tab === "PKMission" && data && (
          <View className="mx-4 mt-4 rounded-2xl bg-[#EEF2FF] px-4 py-3">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-[12px] font-semibold text-[#111827]">
                Today&apos;s PK record
              </Text>
              <Text className="text-[11px] text-[#6366F1]">
                PK record &gt;&gt;
              </Text>
            </View>
            <View className="flex-row justify-between mt-1">
              <View className="flex-1 items-center">
                <Text className="text-[18px] font-semibold text-[#111827]">
                  {data.pkRecord.highestStreak}
                </Text>
                <Text className="mt-1 text-[11px] text-[#6B7280] text-center">
                  Highest effective winning streak
                </Text>
              </View>
              <View className="w-px bg-[#E5E7EB] mx-2" />
              <View className="flex-1 items-center">
                <Text className="text-[18px] font-semibold text-[#111827]">
                  {data.pkRecord.effectiveWins}
                </Text>
                <Text className="mt-1 text-[11px] text-[#6B7280] text-center">
                  Effective wins
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Loading */}
        {loading && (
          <View className="mt-6 items-center">
            <ActivityIndicator />
            <Text className="mt-2 text-[11px] text-gray-500">
              Loading tasks...
            </Text>
          </View>
        )}

        {/* Timeline tasks */}
        <View className="mt-4 mx-4 mb-8">
          {tasksForTab.map((task, index) => (
            <RewardTaskItem
              key={task.id}
              task={task}
              isLast={index === tasksForTab.length - 1}
              onGoPress={() => handleGoPress(task)}
            />
          ))}

          {!loading && tasksForTab.length === 0 && !errorText && (
            <Text className="text-[12px] text-[#9CA3AF] mt-2">
              No tasks configured yet.
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Reward rule modal */}
      <Modal
        transparent
        visible={showRule}
        animationType="fade"
        onRequestClose={() => setShowRule(false)}
      >
        <View className="flex-1 bg-black/40 items-center justify-center px-8">
          <View className="w-full rounded-2xl bg-white px-5 py-4">
            <Text className="text-[16px] font-semibold text-[#111827] mb-3 text-center">
              Reward rule
            </Text>
            <Text className="text-[13px] text-[#4B5563] mb-2">
              Daily tasks: Tasks refresh daily at 00:00:00 (UTC+8).
            </Text>
            <Text className="text-[13px] text-[#4B5563] mb-4">
              Weekly tasks: Tasks refresh every Monday at 00:00:00 (UTC+8).
            </Text>
            <Pressable
              onPress={() => setShowRule(false)}
              className="mt-1 rounded-full bg-[#6366F1] py-2"
            >
              <Text className="text-center text-[14px] font-semibold text-white">
                Confirm
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
    {/* Timeline rail */}
    <View className="items-center mr-3">
      <View className="w-3 h-3 rounded-full bg-[#6366F1] mt-1" />
      {!isLast && <View className="w-px flex-1 bg-[#E5E7EB]" />}
    </View>

    {/* Card */}
    <View className="flex-1 rounded-2xl bg-white px-3 py-3 shadow-sm">
      <Text className="text-[13px] font-semibold text-[#111827]">
        {task.title}
      </Text>
      {task.subtitle && (
        <Text className="mt-1 text-[11px] text-[#6B7280]">
          {task.subtitle}
        </Text>
      )}

      <View className="mt-3 flex-row items-center justify-between">
        <View>
          <Text className="text-[11px] text-[#6B7280]">
            ({task.current}/{task.target})
          </Text>
          <Text className="mt-1 text-[12px] font-semibold text-[#F97316]">
            +{task.rewardPoints}
          </Text>
        </View>
        <Pressable
          className="px-4 py-1 rounded-full bg-[#EEF2FF]"
          onPress={onGoPress}
        >
          <Text className="text-[12px] font-semibold text-[#4F46E5]">
            GO
          </Text>
        </Pressable>
      </View>
    </View>
  </View>
);

export default RewardScreen;
