// src/screens/LiveApplicationScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://192.168.10.25:3000";

type BackendStatus = "PENDING" | "APPROVED" | "REJECTED";
type LiveApplicationStatus = BackendStatus | "NONE";

type LiveApplication = {
  id: string;
  userId: string;
  status: BackendStatus;
  createdAt: string;
  updatedAt: string;
};

type LiveApplicationApiResponse = {
  application: LiveApplication | null;
  error?: string;
};

const LiveApplicationScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [status, setStatus] = useState<LiveApplicationStatus>("NONE");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [successText, setSuccessText] = useState<string | null>(null);

  // helper so navigation always hits the Profile stack correctly
  const goToProfileRoute = (screenName: "Auth" | "EditProfile" | "Level") => {
    const parentNav = (navigation as any)?.getParent?.();
    if (parentNav && typeof parentNav.navigate === "function") {
      // go via bottom tabs -> Profile stack
      parentNav.navigate("Profile", { screen: screenName });
    } else {
      // fallback: same stack
      navigation.navigate(screenName as never);
    }
  };

  // Load existing application status on mount
  useEffect(() => {
    let cancelled = false;

    const loadStatus = async () => {
      try {
        setLoading(true);
        setErrorText(null);
        setSuccessText(null);

        const userId = await AsyncStorage.getItem("gl_user_id");
        if (!userId) {
          if (!cancelled) {
            setErrorText("Please log in first.");
            setStatus("NONE");
          }
          return;
        }

        const res = await fetch(
          `${API_BASE_URL}/api/profile/live-application?userId=${encodeURIComponent(
            userId
          )}`
        );

        const json = (await res.json().catch(() => null)) as
          | LiveApplicationApiResponse
          | { error?: string }
          | null;

        if (cancelled) return;

        if (!res.ok) {
          const msg =
            (json as any)?.error || "Failed to load live application.";
          setErrorText(msg);
          setStatus("NONE");
          return;
        }

        const application = (json as LiveApplicationApiResponse | null)
          ?.application;

        if (!application) {
          setStatus("NONE");
        } else {
          setStatus(application.status);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("load live application error", err);
          setErrorText("Network error while loading application.");
          setStatus("NONE");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadStatus();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleApply = async () => {
    if (submitting) return;

    try {
      setSubmitting(true);
      setErrorText(null);
      setSuccessText(null);

      const userId = await AsyncStorage.getItem("gl_user_id");
      if (!userId) {
        setErrorText("Please log in first.");
        return;
      }

      const res = await fetch(
        `${API_BASE_URL}/api/profile/live-application`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        }
      );

      const json = (await res.json().catch(() => null)) as
        | LiveApplicationApiResponse
        | { application?: LiveApplication | null; error?: string }
        | null;

      const application = (json as any)?.application as
        | LiveApplication
        | null
        | undefined;
      const backendError = (json as any)?.error as string | undefined;

      // already has active application
      if (res.status === 409 && application) {
        setStatus(application.status);
        setSuccessText(
          backendError ||
            "You already have an active application. Please wait for review."
        );
        return;
      }

      if (!res.ok || !json || backendError) {
        setErrorText(backendError || "Failed to submit application.");
        return;
      }

      if (!application) {
        setStatus("PENDING");
        setSuccessText("Application submitted. Please wait for review.");
        return;
      }

      setStatus(application.status);

      if (application.status === "APPROVED") {
        setSuccessText(
          "Your live application is approved. You can start streaming."
        );
      } else if (application.status === "PENDING") {
        setSuccessText("Application submitted. Please wait for review.");
      } else if (application.status === "REJECTED") {
        setSuccessText(
          "Your application was rejected. You can update your info and apply again later."
        );
      }
    } catch (err) {
      console.error("submit live application error", err);
      setErrorText("Network error while submitting application.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStatusText = () => {
    if (status === "NONE") return "You have not applied to become a host yet.";
    if (status === "PENDING")
      return "Your application is under review. We will notify you soon.";
    if (status === "APPROVED")
      return "You are approved as a host. You can start live streams.";
    if (status === "REJECTED")
      return "Your previous application was rejected. You can update info and apply again.";
    return "";
  };

  const isApplyDisabled =
    submitting || status === "APPROVED" || status === "PENDING";

  const applyButtonLabel =
    status === "NONE" || status === "REJECTED"
      ? "Apply now"
      : status === "PENDING"
      ? "Application pending"
      : "Approved";

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-4 pt-3 pb-2">
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </Pressable>
        <View className="flex-1 items-center">
          <Text className="text-[16px] font-semibold text-[#111827]">
            Live application
          </Text>
        </View>
        <View className="w-6" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* --- Live application conditions (like Poppo) --- */}
        <View className="mt-2">
          <Text className="text-[14px] font-semibold text-[#111827] mb-2">
            Live application conditions
          </Text>

          <ConditionRow
            title="Face Authentication"
            subtitle="Please complete authentication process first."
            onPress={() => goToProfileRoute("Auth")}
          />

          <ConditionRow
            title="Live photo"
            subtitle="Please upload the live cover again."
            onPress={() => goToProfileRoute("EditProfile")}
          />

          <ConditionRow
            title="Wealth level ≥ level 5"
            subtitle="Only Wealth level reaches 5 can start to live."
            onPress={() => goToProfileRoute("Level")}
          />
        </View>

        {/* --- Become a host card + status --- */}
        <View className="mt-4 rounded-3xl bg-[#EEF2FF] px-4 py-4">
          <Text className="text-[14px] font-semibold text-[#111827] mb-1">
            Become a host
          </Text>
          <Text className="text-[12px] text-[#4B5563]">
            Submit your information to apply for hosting. After passing the
            review, you can start live streams and complete reward tasks.
          </Text>
        </View>

        <View className="mt-4 mx-1">
          {loading ? (
            <View className="flex-row items-center">
              <ActivityIndicator size="small" />
              <Text className="ml-2 text-[12px] text-gray-500">
                Checking your application status...
              </Text>
            </View>
          ) : (
            <Text className="text-[12px] text-[#6B7280]">
              {renderStatusText()}
            </Text>
          )}
        </View>

        <View className="mt-5 rounded-2xl bg-white px-4 py-4 shadow-sm">
          <Text className="text-[13px] font-semibold text-[#111827] mb-2">
            Basic Requirements
          </Text>
          <Text className="text-[12px] text-[#6B7280] mb-1">
            • Complete your profile information.
          </Text>
          <Text className="text-[12px] text-[#6B7280] mb-1">
            • Bind a valid phone number or email.
          </Text>
          <Text className="text-[12px] text-[#6B7280] mb-1">
            • Follow platform community guidelines.
          </Text>
        </View>

        {errorText && (
          <View className="mt-4 rounded-2xl bg-red-50 px-3 py-2">
            <Text className="text-[12px] text-red-600">{errorText}</Text>
          </View>
        )}

        {successText && (
          <View className="mt-4 rounded-2xl bg-green-50 px-3 py-2">
            <Text className="text-[12px] text-green-700">{successText}</Text>
          </View>
        )}

        <Pressable
          className={`mt-6 rounded-full py-3 ${
            status === "APPROVED"
              ? "bg-gray-400"
              : status === "PENDING"
              ? "bg-gray-400"
              : "bg-[#6366F1]"
          }`}
          disabled={isApplyDisabled}
          onPress={handleApply}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-center text-[14px] font-semibold text-white">
              {applyButtonLabel}
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const ConditionRow: React.FC<{
  title: string;
  subtitle: string;
  onPress?: () => void;
}> = ({ title, subtitle, onPress }) => (
  <Pressable
    onPress={onPress}
    className="flex-row items-center justify-between bg-white rounded-2xl px-4 py-3 mb-2"
  >
    <View className="flex-1 mr-3">
      <Text className="text-[13px] font-semibold text-[#111827]">{title}</Text>
      <Text className="text-[11px] text-[#9CA3AF] mt-1">{subtitle}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
  </Pressable>
);

export default LiveApplicationScreen;
