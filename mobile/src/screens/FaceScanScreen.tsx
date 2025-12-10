// src/screens/FaceScanScreen.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CameraView, CameraType, Camera, useCameraPermissions } from "expo-camera";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://192.168.10.25:3000";

type ScanPhase = "POSITIONING" | "SCANNING" | "UPLOADING" | "DONE" | "ERROR";

const FaceScanScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const [phase, setPhase] = useState<ScanPhase>("POSITIONING");
  const [errorText, setErrorText] = useState<string | null>(null);

  // Ask for camera permission on mount if not granted
  useEffect(() => {
    if (!permission) return;

    if (!permission.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const backgroundColor =
    phase === "POSITIONING" || phase === "ERROR" ? "#FF1744" : "#00E676";

  const handleClose = () => {
    navigation.goBack();
  };

  const handleScanAndUpload = async () => {
    if (!cameraRef.current) return;
    if (phase === "UPLOADING" || phase === "SCANNING") return;

    try {
      setErrorText(null);
      setPhase("SCANNING");

      // small delay to simulate “aligning face”
      await new Promise((res) => setTimeout(res, 800));

      const userId = await AsyncStorage.getItem("gl_user_id");
      if (!userId) {
        setErrorText("Please log in first.");
        setPhase("ERROR");
        return;
      }

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.6,
        base64: true,
        skipProcessing: true,
      });

      if (!photo.base64) {
        setErrorText("Failed to capture image. Please try again.");
        setPhase("ERROR");
        return;
      }

      setPhase("UPLOADING");

      const res = await fetch(`${API_BASE_URL}/api/profile/face-scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          imageBase64: photo.base64,
        }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || (json as any)?.error) {
        setErrorText(
          (json as any)?.error ||
            "Failed to upload face image. Please try again."
        );
        setPhase("ERROR");
        return;
      }

      // ✅ success
      setPhase("DONE");
    } catch (err) {
      console.error("face scan error", err);
      setErrorText("Unexpected error while scanning. Please try again.");
      setPhase("ERROR");
    }
  };

  // --- Permission UI states ---
  if (!permission) {
    // still loading permission info
    return <View style={{ flex: 1, backgroundColor }} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center"
        style={{ backgroundColor }}
        edges={["top"]}
      >
        <Text className="mb-3 text-[16px] font-semibold text-white">
          Camera permission needed
        </Text>
        <Text className="mb-5 text-[13px] text-white/90 px-8 text-center">
          We need access to your camera to complete real-person verification.
        </Text>
        <Pressable
          className="px-6 py-3 rounded-full bg-white/20 border border-white/60"
          onPress={requestPermission}
        >
          <Text className="text-[14px] font-semibold text-white">
            Grant permission
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor }}
      edges={["top"]}
    >
      {/* Top bar */}
      <View className="flex-row items-center justify-between px-4 pt-3">
        <View />
        <Text className="text-[16px] font-semibold text-white">
          Hold Still for a Moment
        </Text>
        <Pressable onPress={handleClose}>
          <Ionicons name="close" size={22} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Camera with overlay */}
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="front"
          ratio="16:9"
        />

        {/* Hex / head overlay */}
        <View style={styles.overlayCenter}>
          {/* Outer hex-ish frame */}
          <View style={styles.hexOuter}>
            <View style={styles.hexInner}>
              {/* Head outline placeholder */}
              <View style={styles.headCircle}>
                <Ionicons name="person" size={72} color="#FFFFFF" />
              </View>
            </View>
          </View>
        </View>

        {/* Instruction text */}
        <View style={styles.bottomHint}>
          <Text className="text-[13px] text-white text-center px-10">
            Align your face inside the outline and stay still while we capture
            your photo.
          </Text>
        </View>
      </View>

      {/* Bottom actions */}
      <View className="pb-6 px-6">
        {errorText && (
          <View className="mb-3 rounded-2xl bg-red-50 px-3 py-2">
            <Text className="text-[12px] text-red-700">{errorText}</Text>
          </View>
        )}

        {phase === "UPLOADING" && (
          <View className="mb-3 flex-row items-center justify-center">
            <ActivityIndicator color="#FFFFFF" />
            <Text className="ml-2 text-[12px] text-white/90">
              Uploading your face image...
            </Text>
          </View>
        )}

        <Pressable
          className="rounded-full bg-white/20 py-3 border border-white/60"
          onPress={
            phase === "DONE"
              ? handleClose
              : phase === "UPLOADING"
              ? undefined
              : handleScanAndUpload
          }
          disabled={phase === "UPLOADING"}
        >
          <Text className="text-center text-[14px] font-semibold text-white">
            {phase === "DONE"
              ? "Done"
              : phase === "POSITIONING"
              ? "Start scan"
              : phase === "SCANNING"
              ? "Scanning…"
              : phase === "UPLOADING"
              ? "Uploading…"
              : "Try again"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  cameraContainer: {
    flex: 1,
    position: "relative",
  },
  camera: {
    flex: 1,
  },
  overlayCenter: {
    position: "absolute",
    top: "18%",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  hexOuter: {
    width: 260,
    height: 260,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  hexInner: {
    width: 230,
    height: 230,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  headCircle: {
    width: 170,
    height: 170,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomHint: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
  },
});

export default FaceScanScreen;
