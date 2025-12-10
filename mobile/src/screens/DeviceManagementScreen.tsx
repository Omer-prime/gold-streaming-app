// src/screens/DeviceManagementScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "../navigation/ProfileStackNavigator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config";

type Nav = NativeStackNavigationProp<
  ProfileStackParamList,
  "DeviceManagement"
>;

const USER_ID_KEY = "gl_user_id";
const DEVICE_ID_KEY = "gl_device_id";

type DeviceItem = {
  id: string;
  deviceId: string;
  deviceName: string | null;
  platform: string | null;
  isTrusted: boolean;
  lastActiveAt: string; // ISO string from backend
  isCurrent: boolean; // computed on client
};

const DeviceManagementScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();

  const [devices, setDevices] = useState<DeviceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ensureDeviceId = async (): Promise<string> => {
    let id = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = `${Platform.OS}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 10)}`;
      await AsyncStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const userId = await AsyncStorage.getItem(USER_ID_KEY);
        if (!userId) {
          if (!cancelled) {
            setError("Not logged in. Please login again.");
            setDevices([]);
          }
          return;
        }

        const currentDeviceId = await ensureDeviceId();

        // 1) Upsert current device (so backend knows it)
        try {
          const friendlyName = `${Platform.OS.toUpperCase()} device`;
          await fetch(`${API_BASE_URL}/api/profile/devices`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId,
              deviceId: currentDeviceId,
              deviceName: friendlyName,
              platform: Platform.OS,
              isTrusted: true,
            }),
          });
        } catch (e) {
          console.warn("Failed to upsert current device", e);
        }

        // 2) Fetch all devices for this user
        const params = new URLSearchParams();
        params.set("userId", userId);

        const res = await fetch(
          `${API_BASE_URL}/api/profile/devices?${params.toString()}`
        );

        if (!res.ok) {
          const json = await res.json().catch(() => null);
          if (!cancelled) {
            setError(json?.error || "Failed to load devices.");
            setDevices([]);
          }
          return;
        }

        const json = (await res.json()) as {
          devices: {
            id: string;
            deviceId: string;
            deviceName: string | null;
            platform: string | null;
            isTrusted: boolean;
            lastActiveAt: string;
          }[];
        };

        if (!cancelled) {
          const mapped: DeviceItem[] = (json.devices || []).map((d) => ({
            ...d,
            isCurrent: d.deviceId === currentDeviceId,
          }));
          setDevices(mapped);
        }
      } catch (err) {
        console.error("DeviceManagement load error", err);
        if (!cancelled) {
          setError("Network error while loading devices.");
          setDevices([]);
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
        <Text className="text-[18px] font-semibold text-[#111827]">
          Device management
        </Text>
      </View>

      {/* Content */}
      <View className="flex-1 pt-3">
        {loading && (
          <View className="px-4 py-4">
            <ActivityIndicator size="small" color="#6C4DFF" />
          </View>
        )}

        {error && !loading && (
          <View className="px-4 py-2">
            <Text className="text-[12px] text-red-500">{error}</Text>
          </View>
        )}

        {!loading && !error && devices.length === 0 && (
          <View className="px-4 mt-4">
            <Text className="text-[13px] text-gray-500">
              No device information yet.
            </Text>
          </View>
        )}

        {devices.map((device) => (
          <DeviceRow key={device.id} device={device} />
        ))}
      </View>
    </SafeAreaView>
  );
};

const formatTimestamp = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;

  const pad = (n: number) => (n < 10 ? `0${n}` : String(n));
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());

  // 2025-11-24 12:50:57
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const DeviceRow: React.FC<{ device: DeviceItem }> = ({ device }) => {
  const label = device.deviceName || "Unknown device";

  return (
    <Pressable className="mt-3 mx-4 rounded-2xl bg-white border border-[#E5E7EB] px-4 py-3 flex-row items-center justify-between">
      <View className="flex-1">
        <View className="flex-row items-center flex-wrap">
          <Text className="text-[14px] font-semibold text-[#111827] mr-2">
            {label}
          </Text>

          {device.isCurrent && (
            <View className="rounded-full bg-[#DBEAFE] px-2 py-[2px] mr-1">
              <Text className="text-[10px] text-[#1D4ED8]">
                Current device
              </Text>
            </View>
          )}

          {device.isTrusted && (
            <View className="rounded-full bg-[#DCFCE7] px-2 py-[2px]">
              <Text className="text-[10px] text-[#15803D]">Trust device</Text>
            </View>
          )}
        </View>

        <Text className="mt-1 text-[11px] text-[#6B7280]">
          Last active time: {formatTimestamp(device.lastActiveAt)}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
    </Pressable>
  );
};

export default DeviceManagementScreen;
