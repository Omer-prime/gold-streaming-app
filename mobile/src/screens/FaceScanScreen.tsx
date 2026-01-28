// src/screens/FaceScanScreen.tsx
import React, { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CameraView, useCameraPermissions } from "expo-camera";
import { API_BASE_URL } from "../config"; // ✅ use same config as other screens

type ScanPhase = "POSITIONING" | "SCANNING" | "UPLOADING" | "DONE" | "ERROR";

const FaceScanScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const cameraRef = useRef<CameraView | null>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [phase, setPhase] = useState<ScanPhase>("POSITIONING");
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    if (!permission) return;
    if (!permission.granted) requestPermission();
  }, [permission, requestPermission]);

  const backgroundColor =
    phase === "POSITIONING" || phase === "ERROR" ? "#FF1744" : "#00E676";

  const handleClose = () => navigation.goBack();

  const handleScanAndUpload = async () => {
    if (!cameraRef.current) return;
    if (phase === "UPLOADING" || phase === "SCANNING") return;

    try {
      setErrorText(null);
      setPhase("SCANNING");

      await new Promise((r) => setTimeout(r, 500));

      const userId = await AsyncStorage.getItem("gl_user_id");
      if (!userId) {
        setErrorText("Please log in first.");
        setPhase("ERROR");
        return;
      }

      const photo = await cameraRef.current.takePictureAsync({
        // ✅ reduce size to avoid 413 / body limit issues
        quality: 0.25,
        base64: true,
        skipProcessing: false,
        exif: false,
      });

      if (!photo?.base64) {
        setErrorText("Failed to capture image. Please try again.");
        setPhase("ERROR");
        return;
      }

      setPhase("UPLOADING");

      const endpoint = `${API_BASE_URL}/api/profile/face-scan`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, imageBase64: photo.base64 }),
      });

      const raw = await res.text(); // ✅ important: handle non-JSON (nginx 413 html)
      let json: any = null;
      try {
        json = raw ? JSON.parse(raw) : null;
      } catch {
        json = null;
      }

      if (!res.ok) {
        if (res.status === 413) {
          setErrorText("Upload failed: image too large (413). Increase server upload limit or compress more.");
        } else {
          setErrorText(json?.error || `Upload failed (${res.status}). ${raw?.slice(0, 120) || ""}`);
        }
        setPhase("ERROR");
        return;
      }

      if (json?.error) {
        setErrorText(json.error);
        setPhase("ERROR");
        return;
      }

      setPhase("DONE");
      // optional: auto close after success
      setTimeout(() => navigation.goBack(), 700);
    } catch (err: any) {
      console.error("face scan error", err);
      setErrorText(err?.message || "Network/Unexpected error while scanning.");
      setPhase("ERROR");
    }
  };

  if (!permission) return <View style={{ flex: 1, backgroundColor }} />;

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor }} edges={["top"]}>
        <Text className="mb-3 text-[16px] font-semibold text-white">Camera permission needed</Text>
        <Text className="mb-5 text-[13px] text-white/90 px-8 text-center">
          We need access to your camera to complete real-person verification.
        </Text>
        <Pressable
          className="px-6 py-3 rounded-full bg-white/20 border border-white/60"
          onPress={requestPermission}
        >
          <Text className="text-[14px] font-semibold text-white">Grant permission</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }} edges={["top"]}>
      <View className="flex-row items-center justify-between px-4 pt-3">
        <View />
        <Text className="text-[16px] font-semibold text-white">Hold Still for a Moment</Text>
        <Pressable onPress={handleClose}>
          <Ionicons name="close" size={22} color="#FFFFFF" />
        </Pressable>
      </View>

      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={styles.camera} facing="front" ratio="16:9" />

        <View style={styles.overlayCenter}>
          <View style={styles.hexOuter}>
            <View style={styles.hexInner}>
              <View style={styles.headCircle}>
                <Ionicons name="person" size={72} color="#FFFFFF" />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.bottomHint}>
          <Text className="text-[13px] text-white text-center px-10">
            Align your face inside the outline and stay still while we capture your photo.
          </Text>
        </View>
      </View>

      <View className="pb-6 px-6">
        {errorText && (
          <View className="mb-3 rounded-2xl bg-red-50 px-3 py-2">
            <Text className="text-[12px] text-red-700">{errorText}</Text>
          </View>
        )}

        {phase === "UPLOADING" && (
          <View className="mb-3 flex-row items-center justify-center">
            <ActivityIndicator color="#FFFFFF" />
            <Text className="ml-2 text-[12px] text-white/90">Uploading your face image...</Text>
          </View>
        )}

        <Pressable
          className="rounded-full bg-white/20 py-3 border border-white/60"
          onPress={phase === "DONE" ? handleClose : phase === "UPLOADING" ? undefined : handleScanAndUpload}
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
  cameraContainer: { flex: 1, position: "relative" },
  camera: { flex: 1 },
  overlayCenter: { position: "absolute", top: "18%", left: 0, right: 0, alignItems: "center" },
  hexOuter: {
    width: 260, height: 260, borderRadius: 32, borderWidth: 4, borderColor: "#FFFFFF",
    justifyContent: "center", alignItems: "center",
  },
  hexInner: {
    width: 230, height: 230, borderRadius: 32, borderWidth: 2, borderColor: "#FFFFFF",
    justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.18)",
  },
  headCircle: {
    width: 170, height: 170, borderRadius: 999, borderWidth: 2, borderColor: "#FFFFFF",
    alignItems: "center", justifyContent: "center",
  },
  bottomHint: { position: "absolute", bottom: 40, left: 0, right: 0, alignItems: "center" },
});

export default FaceScanScreen;
