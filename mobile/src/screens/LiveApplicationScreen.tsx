import React, { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config";
import { Ionicons } from "@expo/vector-icons";

type LiveStatus = {
  approved: boolean;
  applicationStatus: "NONE" | "PENDING" | "APPROVED" | "REJECTED";
  requirements: {
    faceVerified: boolean;
    hasLivePhoto: boolean;
    wealthLevel: number;
    wealthRequired: number;
  };
  host: {
    id: string;
    name: string;
    avatarUrl: string | null;
    liveCoverUrl: string | null;
  };
  activeStream: { id: string; title: string | null } | null;
};

export default function LiveApplicationScreen() {
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<LiveStatus | null>(null);

  const load = useCallback(async () => {
    try {
      setErr(null);
      setLoading(true);

      const userId = await AsyncStorage.getItem("gl_user_id");
      if (!userId) {
        setErr("Login required");
        setData(null);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/live?userId=${encodeURIComponent(userId)}`);
      const json = (await res.json().catch(() => null)) as LiveStatus | null;

      if (!res.ok || !json) {
        setErr((json as any)?.error || "Failed to load live status");
        setData(null);
        return;
      }

      setData(json);
    } catch (e) {
      setErr("Network error");
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

  const goLive = useCallback(async () => {
    const userId = await AsyncStorage.getItem("gl_user_id");
    if (!userId) return Alert.alert("Login required");

    if (!data?.approved) {
      return Alert.alert("Not approved", "Complete requirements / wait for approval.");
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/live`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, title: "My Live", mode: "SOLO" }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.stream?.id) {
        return Alert.alert("Failed", json?.error || "Failed to start live");
      }

      navigation.navigate("LiveRoom", {
        streamId: json.stream.id,
        hostId: userId,
        displayName: data.host.name,
        avatarUrl: data.host.avatarUrl,
      });
    } catch {
      Alert.alert("Network error", "Failed to start live");
    }
  }, [data, navigation]);

  const req = data?.requirements;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="px-4 pt-4 pb-3 border-b border-gray-100 flex-row items-center">
        <Pressable onPress={() => navigation.goBack()} style={{ padding: 6, marginRight: 8 }}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </Pressable>
        <Text className="text-[16px] font-extrabold text-black">Live application</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
          <Text className="mt-2 text-gray-500">Loading...</Text>
        </View>
      ) : (
        <View className="flex-1 px-4 pt-4">
          {!!err && (
            <View className="bg-red-50 border border-red-200 rounded-xl px-3 py-3 mb-3">
              <Text className="text-red-600 text-[12px] font-bold">{err}</Text>
            </View>
          )}

          <View className="border border-gray-200 rounded-2xl overflow-hidden">
            <Row title="Face Authentication" subtitle={req?.faceVerified ? "Completed" : "Please complete authentication process first."} />
            <Divider />
            <Row title="Live photo" subtitle={req?.hasLivePhoto ? "Uploaded" : "Please upload the live cover again."} />
            <Divider />
            <Row title={`Wealth level ≥ level ${req?.wealthRequired ?? 5}`} subtitle={`Your level: ${req?.wealthLevel ?? 1}`} />
          </View>

          <View className="mt-4 bg-gray-50 rounded-2xl p-4 border border-gray-200">
            <Text className="text-[14px] font-extrabold text-black">Become a host</Text>
            <Text className="text-[12px] text-gray-500 mt-1">
              Submit your information to apply for hosting. After passing the review, you can start live streams.
            </Text>
          </View>

          {data?.approved ? (
            <View className="mt-3 flex-row items-center">
              <Text className="text-green-600 font-extrabold">✅ You are approved. You can start live anytime.</Text>
            </View>
          ) : (
            <View className="mt-3">
              <Text className="text-gray-500 text-[12px]">
                Status: <Text className="font-extrabold">{data?.applicationStatus ?? "NONE"}</Text>
              </Text>
            </View>
          )}

          <View className="flex-1" />

          <Pressable
            onPress={goLive}
            style={{
              backgroundColor: "#FF2D55",
              borderRadius: 999,
              paddingVertical: 16,
              alignItems: "center",
              marginBottom: 18,
              opacity: data?.approved ? 1 : 0.6,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "900" }}>Go Live</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: "#F3F4F6" }} />;
}

function Row({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View className="px-4 py-4 flex-row items-center justify-between bg-white">
      <View style={{ maxWidth: "85%" }}>
        <Text className="text-[14px] font-extrabold text-black">{title}</Text>
        <Text className="text-[12px] text-gray-500 mt-1">{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
    </View>
  );
}
