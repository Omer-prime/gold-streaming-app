import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
// @ts-ignore - optional native dependency; guard at runtime if types are missing
const FileSystem = (() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require("expo-file-system");
  } catch {
    return { deleteAsync: async (_: string, __?: any) => Promise.resolve() };
  }
})();

import * as FaceDetector from "expo-face-detector";
import { API_BASE_URL } from "../config";
import { t } from "../i18n";

type ScanPhase =
  | "CHECKING"
  | "POSITIONING"
  | "CAPTURING"
  | "UPLOADING"
  | "WAITING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "ERROR";

type StatusResponse =
  | { exists: false; status: "NONE" }
  | {
      exists: true;
      status: "PENDING" | "APPROVED" | "REJECTED";
      applicationId: string;
      createdAt: string;
      updatedAt: string;
      hasImage: boolean;
    };

const POLL_MS = 8000;
const AUTO_CLOSE_AFTER_APPROVED_MS = 1200;
const ANALYZE_EVERY_MS = 550;
const STABLE_REQUIRED = 3;

export default function FaceScanScreen() {
  const navigation = useNavigation<any>();
  const cameraRef = useRef<CameraView | null>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [phase, setPhase] = useState<ScanPhase>("CHECKING");
  const [errorText, setErrorText] = useState<string | null>(null);

  const [userId, setUserId] = useState<string | null>(null);

  const [faceOk, setFaceOk] = useState(false);
  const [hint, setHint] = useState(() => t("faceScan.hints.placeFace"));

  const analyzingRef = useRef(false);
  const stableRef = useRef(0);
  const capturedRef = useRef(false);

  const bg = useMemo(() => {
    if (phase === "WAITING_APPROVAL" || phase === "CHECKING") return "#0b1220";
    if (phase === "REJECTED" || phase === "ERROR") return "#140b12";
    return "#0b1220";
  }, [phase]);

  const loadUserId = useCallback(async () => {
    const id = await AsyncStorage.getItem("gl_user_id");
    return id?.trim() ? id.trim() : null;
  }, []);

  const fetchStatus = useCallback(async (uid: string) => {
    const url = `${API_BASE_URL}/api/profile/face-scan/status?userId=${encodeURIComponent(uid)}`;
    const res = await fetch(url, { method: "GET" });
    const json = (await res.json().catch(() => null)) as StatusResponse | null;
    if (!res.ok || !json) throw new Error(t("faceScan.errors.statusFailed"));
    return json;
  }, []);

  const applyStatusToUI = useCallback((s: StatusResponse) => {
    if (!s.exists) {
      setPhase("POSITIONING");
      return;
    }
    if (s.status === "PENDING") setPhase("WAITING_APPROVAL");
    else if (s.status === "APPROVED") setPhase("APPROVED");
    else if (s.status === "REJECTED") setPhase("REJECTED");
  }, []);

  useEffect(() => {
    if (phase !== "APPROVED") return;
    const tt = setTimeout(() => navigation.goBack(), AUTO_CLOSE_AFTER_APPROVED_MS);
    return () => clearTimeout(tt);
  }, [phase, navigation]);

  useFocusEffect(
    useCallback(() => {
      let alive = true;

      (async () => {
        try {
          setErrorText(null);
          setFaceOk(false);
          setHint(t("faceScan.hints.placeFace"));
          stableRef.current = 0;
          capturedRef.current = false;

          if (!permission) return;

          if (!permission.granted) {
            await requestPermission();
            return;
          }

          const uid = await loadUserId();
          if (!alive) return;

          if (!uid) {
            setErrorText(t("faceScan.errors.loginFirst"));
            setPhase("ERROR");
            return;
          }

          setUserId(uid);
          setPhase("CHECKING");

          const s = await fetchStatus(uid);
          if (!alive) return;

          applyStatusToUI(s);
        } catch {
          if (!alive) return;
          setPhase("POSITIONING");
        }
      })();

      return () => {
        alive = false;
      };
    }, [permission, requestPermission, loadUserId, fetchStatus, applyStatusToUI])
  );

  useEffect(() => {
    if (phase !== "WAITING_APPROVAL" || !userId) return;

    let alive = true;
    const id = setInterval(async () => {
      try {
        const s = await fetchStatus(userId);
        if (!alive) return;
        applyStatusToUI(s);
      } catch {}
    }, POLL_MS);

    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [phase, userId, fetchStatus, applyStatusToUI]);

  const upload = useCallback(async (base64: string, uid: string) => {
    const endpoint = `${API_BASE_URL}/api/profile/face-scan`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: uid, imageBase64: base64 }),
    });

    const raw = await res.text();
    let json: any = null;
    try {
      json = raw ? JSON.parse(raw) : null;
    } catch {
      json = null;
    }

    if (!res.ok) {
      if (res.status === 413) {
        throw new Error(t("faceScan.errors.imageTooLarge"));
      }
      throw new Error(json?.error || t("faceScan.errors.uploadFailed", { code: res.status }));
    }

    if (json?.error) throw new Error(json.error);
    return json;
  }, []);

  const isFaceAligned = useCallback((face: any, imgW: number, imgH: number) => {
    const b = face?.bounds;
    if (!b?.origin || !b?.size) return { ok: false, hint: t("faceScan.hints.keepInside") };

    const x = b.origin.x as number;
    const y = b.origin.y as number;
    const w = b.size.width as number;
    const h = b.size.height as number;

    const cx = (x + w / 2) / imgW;
    const cy = (y + h / 2) / imgH;
    const rw = w / imgW;
    const rh = h / imgH;

    const targetCx = 0.5;
    const targetCy = 0.46;
    const rx = 0.23;
    const ry = 0.30;

    const inEllipse =
      Math.pow((cx - targetCx) / rx, 2) + Math.pow((cy - targetCy) / ry, 2) <= 1.0;

    const tooSmall = rw < 0.26 || rh < 0.30;
    const tooBig = rw > 0.58 || rh > 0.66;

    const yaw = Math.abs((face?.yawAngle ?? 0) as number);
    const roll = Math.abs((face?.rollAngle ?? 0) as number);
    const angleOk = yaw <= 14 && roll <= 14;

    if (tooSmall) return { ok: false, hint: t("faceScan.hints.moveCloser") };
    if (tooBig) return { ok: false, hint: t("faceScan.hints.moveBack") };
    if (!inEllipse) return { ok: false, hint: t("faceScan.hints.centerFace") };
    if (!angleOk) return { ok: false, hint: t("faceScan.hints.headStraight") };

    return { ok: true, hint: t("faceScan.hints.perfectHold") };
  }, []);

  const analyzeAndMaybeCapture = useCallback(async () => {
    if (!cameraRef.current) return;
    if (!userId) return;
    if (phase !== "POSITIONING") return;

    if (analyzingRef.current) return;
    analyzingRef.current = true;

    try {
      const snap = await cameraRef.current.takePictureAsync({
        quality: 0.05,
        base64: false,
        skipProcessing: true,
        exif: false,
      });

      const imgW = (snap as any).width ?? 0;
      const imgH = (snap as any).height ?? 0;

      const result = await FaceDetector.detectFacesAsync(snap.uri, {
        mode: FaceDetector.FaceDetectorMode.fast,
        detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
        runClassifications: FaceDetector.FaceDetectorClassifications.none,
      });

      FileSystem.deleteAsync(snap.uri, { idempotent: true }).catch(() => {});

      const face = result?.faces?.[0];
      if (!face || !imgW || !imgH) {
        stableRef.current = 0;
        setFaceOk(false);
        setHint(t("faceScan.hints.visibleLight"));
        return;
      }

      const { ok, hint: h } = isFaceAligned(face, imgW, imgH);
      setFaceOk(ok);
      setHint(h);

      if (ok) stableRef.current += 1;
      else stableRef.current = 0;

      if (stableRef.current >= STABLE_REQUIRED && !capturedRef.current) {
        capturedRef.current = true;
        setPhase("CAPTURING");
      }
    } catch {
      stableRef.current = 0;
      setFaceOk(false);
      setHint(t("faceScan.hints.adjustLighting"));
    } finally {
      analyzingRef.current = false;
    }
  }, [phase, userId, isFaceAligned]);

  useEffect(() => {
    if (phase !== "POSITIONING") return;
    if (!permission?.granted) return;
    if (!userId) return;

    stableRef.current = 0;
    capturedRef.current = false;

    const id = setInterval(() => {
      analyzeAndMaybeCapture();
    }, ANALYZE_EVERY_MS);

    return () => clearInterval(id);
  }, [phase, permission?.granted, userId, analyzeAndMaybeCapture]);

  const doFinalCaptureAndUpload = useCallback(async () => {
    try {
      if (!cameraRef.current) return;
      if (!userId) {
        setErrorText(t("faceScan.errors.loginFirst"));
        setPhase("ERROR");
        return;
      }

      setErrorText(null);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.20,
        base64: true,
        skipProcessing: false,
        exif: false,
      });

      if (!photo?.base64) {
        setErrorText(t("faceScan.errors.captureFailed"));
        setPhase("ERROR");
        return;
      }

      setPhase("UPLOADING");
      const resp = await upload(photo.base64, userId);

      if (resp?.status === "APPROVED") {
        setPhase("APPROVED");
        return;
      }

      setPhase("WAITING_APPROVAL");
    } catch (e: any) {
      setErrorText(e?.message || t("faceScan.errors.network"));
      setPhase("ERROR");
    }
  }, [userId, upload]);

  useEffect(() => {
    if (phase !== "CAPTURING") return;
    doFinalCaptureAndUpload();
  }, [phase, doFinalCaptureAndUpload]);

  const retryNewScan = () => {
    setErrorText(null);
    setFaceOk(false);
    setHint(t("faceScan.hints.placeFace"));
    stableRef.current = 0;
    capturedRef.current = false;
    setPhase("POSITIONING");
  };

  const handleClose = () => navigation.goBack();

  if (!permission) return <View style={{ flex: 1, backgroundColor: bg }} />;

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.full, { backgroundColor: bg }]} edges={["top"]}>
        <View style={styles.permissionCard}>
          <Text style={styles.permissionTitle}>{t("faceScan.permission.title")}</Text>
          <Text style={styles.permissionText}>{t("faceScan.permission.text")}</Text>
          <Pressable style={styles.permissionBtn} onPress={requestPermission}>
            <Text style={styles.permissionBtnText}>{t("faceScan.permission.button")}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const title =
    phase === "WAITING_APPROVAL"
      ? t("faceScan.titles.submitted")
      : phase === "APPROVED"
      ? t("faceScan.titles.verified")
      : phase === "REJECTED"
      ? t("faceScan.titles.rejected")
      : t("faceScan.titles.default");

  return (
    <SafeAreaView style={[styles.full, { backgroundColor: bg }]} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 24 }} />
        <Text style={styles.headerTitle}>{title}</Text>
        <Pressable onPress={handleClose}>
          <Ionicons name="close" size={22} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Body */}
      <View style={styles.container}>
        {phase === "WAITING_APPROVAL" || phase === "APPROVED" || phase === "REJECTED" ? (
          <View style={styles.centerWrap}>
            {phase === "WAITING_APPROVAL" && (
              <LinearGradient
                colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.04)"]}
                style={styles.card}
              >
                <ActivityIndicator color="#FFFFFF" />
                <Text style={styles.bigText}>{t("faceScan.states.waitTitle")}</Text>
                <Text style={styles.smallText}>{t("faceScan.states.waitText")}</Text>
                <View style={styles.badgeRow}>
                  <Ionicons name="time-outline" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.badgeText}>{t("faceScan.states.autoChecking")}</Text>
                </View>
              </LinearGradient>
            )}

            {phase === "APPROVED" && (
              <LinearGradient
                colors={["rgba(34,197,94,0.20)", "rgba(255,255,255,0.04)"]}
                style={[styles.card, { borderColor: "rgba(34,197,94,0.35)" }]}
              >
                <View style={styles.verifiedIcon}>
                  <Ionicons name="checkmark" size={26} color="#0b1220" />
                </View>
                <Text style={styles.bigText}>{t("faceScan.states.alreadyVerified")}</Text>
                <Text style={styles.smallText}>{t("faceScan.states.closing")}</Text>

                <Pressable onPress={handleClose} style={[styles.primaryBtn, { marginTop: 16 }]}>
                  <Text style={styles.primaryBtnText}>{t("faceScan.states.continue")}</Text>
                </Pressable>
              </LinearGradient>
            )}

            {phase === "REJECTED" && (
              <LinearGradient
                colors={["rgba(239,68,68,0.18)", "rgba(255,255,255,0.04)"]}
                style={[styles.card, { borderColor: "rgba(239,68,68,0.35)" }]}
              >
                <Ionicons name="close-circle" size={52} color="#ef4444" />
                <Text style={styles.bigText}>{t("faceScan.states.notApproved")}</Text>
                <Text style={styles.smallText}>{t("faceScan.states.rejectedText")}</Text>
                <Pressable onPress={retryNewScan} style={styles.primaryBtn}>
                  <Text style={styles.primaryBtnText}>{t("faceScan.states.rescan")}</Text>
                </Pressable>
              </LinearGradient>
            )}
          </View>
        ) : (
          <>
            <CameraView ref={cameraRef} style={styles.camera} facing="front" ratio="4:3" />

            <View style={styles.overlay}>
              <View style={[styles.faceGuideOuter, faceOk ? styles.guideOk : styles.guideBad]}>
                <View style={styles.faceGuideInner} />
              </View>

              <View style={styles.hintWrap}>
                {phase === "CAPTURING" || phase === "UPLOADING" ? (
                  <View style={styles.loadingPill}>
                    <ActivityIndicator color="#fff" />
                    <Text style={styles.loadingText}>
                      {phase === "CAPTURING" ? t("faceScan.hints.capturing") : t("faceScan.hints.uploading")}
                    </Text>
                  </View>
                ) : (
                  <View style={[styles.hintPill, faceOk ? styles.hintOk : styles.hintBad]}>
                    <Ionicons
                      name={faceOk ? "checkmark-circle-outline" : "scan-outline"}
                      size={16}
                      color={faceOk ? "#22c55e" : "rgba(255,255,255,0.85)"}
                    />
                    <Text style={styles.hintText}>{hint}</Text>
                  </View>
                )}
              </View>

              <View style={styles.bottomHint}>
                <Text style={styles.bottomHintText}>{t("faceScan.hints.bottom")}</Text>
              </View>
            </View>
          </>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        {errorText && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorText}</Text>
          </View>
        )}

        {phase === "CHECKING" && (
          <View style={{ paddingVertical: 12, alignItems: "center" }}>
            <ActivityIndicator color="#FFFFFF" />
            <Text style={{ marginTop: 8, fontSize: 12, color: "rgba(255,255,255,0.75)" }}>
              {t("faceScan.states.checking")}
            </Text>
          </View>
        )}

        {phase === "ERROR" && (
          <Pressable style={styles.retryBtn} onPress={retryNewScan}>
            <Text style={styles.retryBtnText}>{t("faceScan.states.tryAgain")}</Text>
          </Pressable>
        )}
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
  },
  headerTitle: { color: "#fff", fontSize: 16, fontWeight: "700" },

  container: { flex: 1, position: "relative" },
  camera: { flex: 1 },

  overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center" },

  faceGuideOuter: {
    marginTop: 64,
    width: 280,
    height: 370,
    borderRadius: 190,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.14)",
  },
  faceGuideInner: {
    width: 250,
    height: 340,
    borderRadius: 175,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.80)",
    backgroundColor: "rgba(0,0,0,0.10)",
  },
  guideOk: { borderColor: "rgba(34,197,94,0.95)" },
  guideBad: { borderColor: "rgba(255,255,255,0.95)" },

  hintWrap: { marginTop: 16, alignItems: "center" },
  hintPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  hintOk: { borderColor: "rgba(34,197,94,0.35)", backgroundColor: "rgba(34,197,94,0.10)" },
  hintBad: { borderColor: "rgba(255,255,255,0.20)", backgroundColor: "rgba(0,0,0,0.25)" },
  hintText: { color: "rgba(255,255,255,0.92)", fontSize: 12, fontWeight: "600" },

  loadingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  loadingText: { color: "rgba(255,255,255,0.90)", fontSize: 12, fontWeight: "700" },

  bottomHint: { position: "absolute", bottom: 28, left: 0, right: 0, alignItems: "center" },
  bottomHintText: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 12,
    textAlign: "center",
    paddingHorizontal: 28,
    lineHeight: 16,
  },

  centerWrap: { flex: 1, padding: 16, justifyContent: "center" },
  card: {
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
  },
  bigText: { fontSize: 18, fontWeight: "800", color: "#fff", marginTop: 10, textAlign: "center" },
  smallText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 18,
  },

  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  badgeText: { fontSize: 12, color: "rgba(255,255,255,0.80)", fontWeight: "700" },

  verifiedIcon: {
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: "#22c55e",
    alignItems: "center",
    justifyContent: "center",
  },

  primaryBtn: {
    marginTop: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
  },
  primaryBtnText: { color: "#fff", fontWeight: "800" },

  footer: { paddingBottom: 18, paddingHorizontal: 16 },
  errorBox: {
    marginBottom: 12,
    borderRadius: 14,
    backgroundColor: "rgba(239,68,68,0.12)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.25)",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorText: { fontSize: 12, color: "rgba(255,220,220,0.95)", fontWeight: "700" },
  retryBtn: {
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    paddingVertical: 12,
  },
  retryBtnText: { textAlign: "center", color: "#fff", fontWeight: "800" },

  permissionCard: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  permissionTitle: { color: "#fff", fontSize: 16, fontWeight: "800", marginBottom: 10 },
  permissionText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 18,
  },
  permissionBtn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
  },
  permissionBtnText: { color: "#fff", fontWeight: "800" },
});
