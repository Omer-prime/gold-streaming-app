import React, { useCallback, useMemo, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, Image, Alert, StyleSheet, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { LinearGradient } from "expo-linear-gradient";
import { API_BASE_URL } from "../config";
import { t } from "../i18n";

type Phase = "CHECKING" | "READY" | "PICKED" | "UPLOADING" | "DONE" | "ERROR";

type LiveApplicationRes = {
  application: any | null;
  applicationStatus: "NONE" | "PENDING" | "APPROVED" | "REJECTED";
  hostApproved: boolean;
  requirements: {
    faceVerified: boolean;
    hasLiveCover: boolean;
    wealthLevel: number;
    requiredWealthLevel: number;
    canApply: boolean;
  };
};

async function ensureBase64(asset: ImagePicker.ImagePickerAsset) {
  if (asset.base64) return asset.base64;
  if (!asset.uri) return null;

  try {
    const b64 = await FileSystem.readAsStringAsync(asset.uri, {
      encoding: "base64" as any,
    });
    return b64 || null;
  } catch {
    return null;
  }
}

export default function LiveCoverScreen() {
  const navigation = useNavigation<any>();
  

  const [phase, setPhase] = useState<Phase>("CHECKING");
  const [loadingText, setLoadingText] = useState(t("liveCover.states.checking"));
  const [errorText, setErrorText] = useState<string | null>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [alreadyUploaded, setAlreadyUploaded] = useState(false);

  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [base64, setBase64] = useState<string | null>(null);

  const [useFrontCamera, setUseFrontCamera] = useState(false);

  const bg = useMemo(() => "#0b1220", []);

  const load = useCallback(async () => {
    try {
      setErrorText(null);
      setPhase("CHECKING");
      setLoadingText(t("liveCover.states.checking"));

      const uid = (await AsyncStorage.getItem("gl_user_id"))?.trim() || null;
      if (!uid) {
        setErrorText(t("liveCover.errors.loginRequired"));
        setPhase("ERROR");
        return;
      }

      setUserId(uid);

      const res = await fetch(`${API_BASE_URL}/api/profile/live-application?userId=${encodeURIComponent(uid)}`);
      const json = (await res.json().catch(() => null)) as LiveApplicationRes | null;

      if (!res.ok || !json) {
        setErrorText((json as any)?.error || t("liveCover.errors.loadFailed"));
        setPhase("ERROR");
        return;
      }

      setAlreadyUploaded(!!json.requirements?.hasLiveCover);
      setPhase("READY");
    } catch {
      setErrorText(t("liveCover.errors.network"));
      setPhase("ERROR");
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const pickFromGallery = useCallback(async () => {
    try {
      setErrorText(null);

      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(t("liveCover.alerts.permissionNeededTitle"), t("liveCover.alerts.galleryPermissionMsg"));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.3,
        base64: true,
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];
      if (!asset?.uri) throw new Error(t("liveCover.errors.noImageReturned"));

      const b64 = await ensureBase64(asset);
      if (!b64) throw new Error(t("liveCover.errors.cannotReadBase64"));

      setPreviewUri(asset.uri);
      setBase64(b64);
      setPhase("PICKED");
    } catch (e: any) {
      setErrorText(e?.message || t("liveCover.errors.openGalleryFailed"));
      setPhase("ERROR");
    }
  }, [t]);

  const takePhoto = useCallback(async () => {
    try {
      setErrorText(null);

      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(t("liveCover.alerts.permissionNeededTitle"), t("liveCover.alerts.cameraPermissionMsg"));
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.3,
        base64: true,
        cameraType: useFrontCamera ? ImagePicker.CameraType.front : ImagePicker.CameraType.back,
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];
      if (!asset?.uri) throw new Error(t("liveCover.errors.cameraNoImage"));

      const b64 = await ensureBase64(asset);
      if (!b64) throw new Error(t("liveCover.errors.cannotReadBase64"));

      setPreviewUri(asset.uri);
      setBase64(b64);
      setPhase("PICKED");
    } catch (e: any) {
      const hint = Platform.OS === "android" ? `\n\n${t("liveCover.errors.androidEmulatorHint")}` : "";
      setErrorText((e?.message || t("liveCover.errors.openCameraFailed")) + hint);
      setPhase("ERROR");
    }
  }, [useFrontCamera, t]);

  const upload = useCallback(async () => {
    try {
      if (!userId) return;
      if (!base64) {
        setErrorText(t("liveCover.errors.selectPhotoFirst"));
        return;
      }

      setErrorText(null);
      setPhase("UPLOADING");
      setLoadingText(t("liveCover.states.uploading"));

      const res = await fetch(`${API_BASE_URL}/api/profile/live-cover`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, imageBase64: base64 }),
      });

      const raw = await res.text();
      let json: any = null;
      try {
        json = raw ? JSON.parse(raw) : null;
      } catch {
        json = null;
      }

      if (!res.ok) {
        if (res.status === 413) throw new Error(t("liveCover.errors.imageTooLarge"));
        throw new Error(json?.error || t("liveCover.errors.uploadFailed", { code: res.status }));
      }

      setPhase("DONE");
      setAlreadyUploaded(true);

      setTimeout(() => navigation.goBack(), 700);
    } catch (e: any) {
      setErrorText(e?.message || t("liveCover.errors.uploadFailedGeneric"));
      setPhase("ERROR");
    }
  }, [userId, base64, navigation, t]);

  const clear = () => {
    setPreviewUri(null);
    setBase64(null);
    setErrorText(null);
    setPhase("READY");
  };

  return (
    <SafeAreaView style={[styles.full, { backgroundColor: bg }]} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={{ padding: 6 }}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>{t("liveCover.title")}</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.body}>
        <LinearGradient colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)"]} style={styles.card}>
          <View style={styles.cardTop}>
            <Ionicons name="image-outline" size={22} color="rgba(255,255,255,0.9)" />
            <Text style={styles.cardTitle}>{t("liveCover.card.title")}</Text>
          </View>

          <Text style={styles.cardSub}>{t("liveCover.card.subtitle")}</Text>

          {alreadyUploaded && phase === "READY" && !previewUri && (
            <View style={styles.infoPill}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#22c55e" />
              <Text style={styles.infoText}>{t("liveCover.labels.alreadyUploaded")}</Text>
            </View>
          )}

          {previewUri ? (
            <View style={styles.previewWrap}>
              <Image source={{ uri: previewUri }} style={styles.preview} />
              <Text style={styles.previewHint}>{t("liveCover.labels.preview")}</Text>

              <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
                <Pressable style={styles.secondaryBtn} onPress={clear} disabled={phase === "UPLOADING"}>
                  <Ionicons name="refresh-outline" size={18} color="#fff" />
                  <Text style={styles.btnText}>{t("liveCover.actions.change")}</Text>
                </Pressable>

                <Pressable
                  style={[styles.primaryBtnSmall, phase === "UPLOADING" && { opacity: 0.6 }]}
                  onPress={upload}
                  disabled={phase === "UPLOADING"}
                >
                  {phase === "UPLOADING" ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>{t("liveCover.actions.upload")}</Text>}
                </Pressable>
              </View>
            </View>
          ) : (
            <>
              <View style={styles.previewPlaceholder}>
                <Ionicons name="images-outline" size={44} color="rgba(255,255,255,0.55)" />
                <Text style={styles.placeholderText}>{t("liveCover.labels.selectCover")}</Text>
              </View>

              <View style={styles.row}>
                <Pressable style={styles.secondaryBtn} onPress={takePhoto} disabled={phase === "UPLOADING"}>
                  <Ionicons name="camera-outline" size={18} color="#fff" />
                  <Text style={styles.btnText}>{t("liveCover.actions.camera")}</Text>
                </Pressable>

                <Pressable style={styles.secondaryBtn} onPress={pickFromGallery} disabled={phase === "UPLOADING"}>
                  <Ionicons name="image-outline" size={18} color="#fff" />
                  <Text style={styles.btnText}>{t("liveCover.actions.gallery")}</Text>
                </Pressable>
              </View>

              <Pressable onPress={() => setUseFrontCamera((v) => !v)} style={styles.toggleBtn} disabled={phase === "UPLOADING"}>
                <Ionicons name="sync-outline" size={16} color="rgba(255,255,255,0.9)" />
                <Text style={styles.toggleText}>
                  {t("liveCover.labels.cameraSide", { side: useFrontCamera ? t("liveCover.labels.front") : t("liveCover.labels.back") })}
                </Text>
              </Pressable>

              <Pressable
                style={[styles.primaryBtn, !base64 && { opacity: 0.55 }]}
                onPress={upload}
                disabled={!base64 || phase === "UPLOADING"}
              >
                {phase === "UPLOADING" ? (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <ActivityIndicator color="#fff" />
                    <Text style={styles.primaryText}>{loadingText}</Text>
                  </View>
                ) : (
                  <Text style={styles.primaryText}>{t("liveCover.actions.uploadCover")}</Text>
                )}
              </Pressable>
            </>
          )}

          {errorText && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorText}</Text>
            </View>
          )}

          {phase === "CHECKING" && (
            <View style={{ marginTop: 12, alignItems: "center" }}>
              <ActivityIndicator color="#fff" />
              <Text style={{ marginTop: 8, color: "rgba(255,255,255,0.75)", fontSize: 12 }}>
                {t("liveCover.states.checkingStatus")}
              </Text>
            </View>
          )}

          {phase === "DONE" && (
            <View style={{ marginTop: 12, alignItems: "center" }}>
              <Ionicons name="checkmark-circle" size={34} color="#22c55e" />
              <Text style={{ marginTop: 6, color: "rgba(255,255,255,0.85)", fontSize: 12, fontWeight: "800" }}>
                {t("liveCover.states.uploaded")}
              </Text>
            </View>
          )}
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  full: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
  },
  headerTitle: { color: "#fff", fontSize: 16, fontWeight: "800" },

  body: { flex: 1, padding: 16, justifyContent: "center" },
  card: { borderRadius: 22, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.10)" },

  cardTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  cardTitle: { color: "#fff", fontSize: 15, fontWeight: "900" },
  cardSub: { color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 8, lineHeight: 16 },

  infoPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.25)",
    backgroundColor: "rgba(34,197,94,0.10)",
  },
  infoText: { color: "rgba(255,255,255,0.88)", fontSize: 12, fontWeight: "700" },

  previewWrap: { marginTop: 14, alignItems: "center" },
  preview: { width: 170, height: 300, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.06)" },
  previewHint: { marginTop: 8, color: "rgba(255,255,255,0.7)", fontSize: 12 },

  previewPlaceholder: {
    marginTop: 14,
    height: 300,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(0,0,0,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: { marginTop: 10, color: "rgba(255,255,255,0.75)", fontSize: 12, fontWeight: "700" },

  row: { flexDirection: "row", gap: 10, marginTop: 14 },
  secondaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  btnText: { color: "#fff", fontWeight: "800", fontSize: 12 },

  toggleBtn: {
    marginTop: 10,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  toggleText: { color: "rgba(255,255,255,0.85)", fontWeight: "800", fontSize: 12 },

  primaryBtn: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    backgroundColor: "rgba(255,45,85,0.92)",
  },
  primaryBtnSmall: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
    backgroundColor: "rgba(255,45,85,0.92)",
  },
  primaryText: { color: "#fff", fontWeight: "900", fontSize: 13 },

  errorBox: {
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.28)",
    backgroundColor: "rgba(239,68,68,0.12)",
    padding: 10,
  },
  errorText: { color: "rgba(255,220,220,0.95)", fontSize: 12, fontWeight: "800" },
});
