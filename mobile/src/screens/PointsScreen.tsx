import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Platform,
  Keyboard,
  StyleSheet,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

import { API_BASE_URL } from "../config";
import { t } from "../i18n";

type PointsSummary = {
  available: number;
  total: number;
  unconfirmed: number;
  income: { livestream: number; party: number; platformRewards: number };
  days: number;
};

const PointsScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [userId, setUserId] = useState<string | null>(null);
  const [summary, setSummary] = useState<PointsSummary | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exchanging, setExchanging] = useState(false);

  // calendar/range
  const [rangeDays, setRangeDays] = useState<number>(30);
  const [rangeOpen, setRangeOpen] = useState(false);

  // withdraw modal
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawPoints, setWithdrawPoints] = useState<string>("1000");
  const [withdrawMethod, setWithdrawMethod] = useState<"Easypaisa" | "JazzCash" | "Bank">("Easypaisa");
  const [withdrawAccount, setWithdrawAccount] = useState<string>("");
  const [withdrawing, setWithdrawing] = useState(false);

  // ✅ details modal
  const [detailsOpen, setDetailsOpen] = useState(false);

  // ✅ Android: track keyboard height and lift sheet
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    AsyncStorage.getItem("gl_user_id").then((id) => setUserId(id));
  }, []);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates?.height ?? 0);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const loadSummary = useCallback(
    async (uid: string, isRefresh = false) => {
      try {
        isRefresh ? setRefreshing(true) : setLoading(true);

        const res = await fetch(
          `${API_BASE_URL}/api/points/summary?userId=${encodeURIComponent(uid)}&days=${encodeURIComponent(
            String(rangeDays)
          )}`
        );
        const json = await res.json().catch(() => null);
        if (!res.ok) throw new Error(json?.error || t("points.errors.loadFailed"));

        setSummary(json?.summary ?? null);
      } catch (e: any) {
        Alert.alert(t("points.alerts.errorTitle"), e?.message || t("points.errors.loadFailed"));
      } finally {
        isRefresh ? setRefreshing(false) : setLoading(false);
      }
    },
    [rangeDays]
  );

  useEffect(() => {
    if (!userId) return;
    loadSummary(userId);
  }, [userId, loadSummary]);

  const incomeRows = useMemo(() => {
    const inc = summary?.income ?? { livestream: 0, party: 0, platformRewards: 0 };
    return [
      { key: "livestream", label: t("points.income.livestream"), value: inc.livestream, icon: "radio-outline" as const },
      { key: "party", label: t("points.income.party"), value: inc.party, icon: "sparkles-outline" as const },
      { key: "rewards", label: t("points.income.platformRewards"), value: inc.platformRewards, icon: "gift-outline" as const },
    ];
  }, [summary]);

  const rangeLabel =
    rangeDays === 7 ? t("points.ranges.last7") : rangeDays === 30 ? t("points.ranges.last30") : t("points.ranges.last90");

  const onExchange = useCallback(async () => {
    if (!userId) return Alert.alert(t("points.alerts.loginRequiredTitle"), t("points.alerts.loginRequiredMsg"));
    if (exchanging) return;

    const pointsToExchange = 100;

    try {
      setExchanging(true);

      const res = await fetch(`${API_BASE_URL}/api/points/exchange`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, points: pointsToExchange }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        return Alert.alert(t("points.alerts.exchangeFailedTitle"), json?.error || t("points.errors.exchangeFailed"));
      }

      Alert.alert(
        t("points.alerts.successTitle"),
        t("points.alerts.exchangeSuccessMsg", {
          points: json?.pointsSpent ?? pointsToExchange,
          coins: json?.coinsAdded ?? 0,
        })
      );

      await loadSummary(userId, true);
    } catch (e: any) {
      Alert.alert(t("points.alerts.exchangeFailedTitle"), e?.message || t("points.errors.exchangeFailed"));
    } finally {
      setExchanging(false);
    }
  }, [userId, exchanging, loadSummary]);

  const openWithdraw = useCallback(() => {
    setWithdrawOpen(true);
  }, []);

  const closeWithdraw = useCallback(() => {
    Keyboard.dismiss();
    setWithdrawOpen(false);
  }, []);

  const submitWithdraw = useCallback(async () => {
    if (!userId) return Alert.alert(t("points.alerts.loginRequiredTitle"), t("points.alerts.loginRequiredMsg"));
    if (withdrawing) return;

    const pts = Math.trunc(Number(withdrawPoints));
    if (!Number.isFinite(pts) || pts <= 0) {
      return Alert.alert(t("points.alerts.errorTitle"), t("points.withdraw.errors.invalidPoints"));
    }

    if (!withdrawAccount.trim()) {
      return Alert.alert(t("points.alerts.errorTitle"), t("points.withdraw.errors.accountRequired"));
    }

    try {
      setWithdrawing(true);

      const res = await fetch(`${API_BASE_URL}/api/points/withdraw/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          points: pts,
          method: withdrawMethod,
          account: withdrawAccount.trim(),
        }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        return Alert.alert(t("points.withdraw.alerts.failedTitle"), json?.error || t("points.withdraw.errors.failed"));
      }

      Alert.alert(t("points.withdraw.alerts.successTitle"), t("points.withdraw.alerts.successMsg"));
      closeWithdraw();
      await loadSummary(userId, true);
    } catch (e: any) {
      Alert.alert(t("points.withdraw.alerts.failedTitle"), e?.message || t("points.withdraw.errors.failed"));
    } finally {
      setWithdrawing(false);
    }
  }, [userId, withdrawing, withdrawPoints, withdrawMethod, withdrawAccount, loadSummary, closeWithdraw]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10, flexDirection: "row", alignItems: "center" }}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </Pressable>

        {/* ✅ Segmented Tabs (Coins / Points) */}
        <View style={{ flex: 1, alignItems: "center" }}>
          <View style={styles.segmentWrap}>
            <Pressable
              onPress={() => navigation.navigate("Coins" as never)}
              style={[styles.segmentBtn, styles.segmentBtnInactive]}
            >
              <Text style={styles.segmentTextInactive}>{t("points.coinsTab")}</Text>
            </Pressable>

            <View style={{ width: 8 }} />

            <View style={[styles.segmentBtn, styles.segmentBtnActive]}>
              <Text style={styles.segmentTextActive}>{t("points.title")}</Text>
            </View>
          </View>
        </View>

        {/* ✅ Details -> modal popup */}
        <Pressable onPress={() => setDetailsOpen(true)} hitSlop={10} style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="information-circle-outline" size={18} color="#6366F1" />
          <Text style={{ marginLeft: 4, fontSize: 13, color: "#6366F1", fontWeight: "700" }}>
            {t("points.actions.details")}
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
          <Text className="mt-2 text-[13px] text-gray-400">{t("points.states.loading")}</Text>
        </View>
      ) : (
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32, paddingHorizontal: 16 }}>
          {/* ✅ Stats card (nicer) */}
          <LinearGradient
            colors={["#FB7185", "#F43F5E"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statsCard}
          >
            <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.statsLabel}>{t("points.labels.available")}</Text>
                <Text style={styles.statsValue}>{summary?.available ?? 0}</Text>

                <View style={{ flexDirection: "row", marginTop: 10, alignItems: "center" }}>
                  <View style={styles.pill}>
                    <Ionicons name="checkmark-circle-outline" size={14} color="#fff" />
                    <Text style={styles.pillText}>
                      {t("points.labels.total", { count: summary?.total ?? 0 })}
                    </Text>
                  </View>

                  <View style={{ width: 10 }} />

                  <View style={[styles.pill, { backgroundColor: "rgba(255,255,255,0.18)" }]}>
                    <Ionicons name="time-outline" size={14} color="#fff" />
                    <Text style={styles.pillText}>
                      {t("points.labels.unconfirmed", { count: summary?.unconfirmed ?? 0 })}
                    </Text>
                  </View>
                </View>
              </View>

              <Pressable
                onPress={() => userId && loadSummary(userId, true)}
                style={{ opacity: refreshing ? 0.6 : 1, flexDirection: "row", alignItems: "center" }}
                disabled={refreshing}
              >
                <View style={styles.refreshBtn}>
                  <Ionicons name="refresh-outline" size={16} color="#111827" />
                </View>
              </Pressable>
            </View>
          </LinearGradient>

          {/* Income filter row */}
          <View className="mt-4 mb-2 flex-row items-center justify-between">
            <Text className="text-[13px] text-[#111827] font-semibold">{t("points.labels.income")}</Text>

            <Pressable className="flex-row items-center" onPress={() => setRangeOpen(true)} hitSlop={10}>
              <Ionicons name="calendar-outline" size={14} color="#6B7280" />
              <Text className="ml-1 text-[13px] text-[#111827]">{rangeLabel}</Text>
              <Ionicons name="chevron-down" size={14} color="#6B7280" style={{ marginLeft: 2 }} />
            </Pressable>
          </View>

          {/* Income cards */}
          {incomeRows.map((row) => (
            <View key={row.key} style={styles.incomeCard}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={styles.incomeIconWrap}>
                  <Ionicons name={row.icon} size={18} color="#6B7280" />
                </View>
                <Text style={{ fontSize: 14, color: "#111827", fontWeight: "700" }}>{row.label}</Text>
              </View>

              <Text style={{ fontSize: 14, fontWeight: "800", color: "#374151" }}>{row.value}</Text>
            </View>
          ))}

          {/* Buttons */}
          <View className="mt-6">
            <Pressable style={styles.primaryAction} onPress={openWithdraw}>
              <Ionicons name="cash-outline" size={18} color="#fff" />
              <Text style={styles.primaryActionText}>{t("points.actions.withdraw")}</Text>
            </Pressable>

            <Pressable
              style={[styles.secondaryAction, { opacity: exchanging ? 0.6 : 1 }]}
              onPress={onExchange}
              disabled={exchanging}
            >
              <Ionicons name="swap-horizontal-outline" size={18} color="#6366F1" />
              <Text style={styles.secondaryActionText}>
                {exchanging ? t("points.actions.exchanging") : t("points.actions.exchange")}
              </Text>
            </Pressable>

            <Text className="text-[11px] text-gray-400 mt-3">{t("points.hints.exchangeRate")}</Text>
          </View>

          {/* ✅ Range Modal */}
          <Modal visible={rangeOpen} transparent animationType="fade" onRequestClose={() => setRangeOpen(false)}>
            <Pressable style={styles.backdrop} onPress={() => setRangeOpen(false)}>
              <Pressable onPress={() => {}} style={styles.rangeCard}>
                <Text className="text-[15px] font-semibold text-[#111827]">{t("points.ranges.title")}</Text>

                {[
                  { label: t("points.ranges.last7"), days: 7 },
                  { label: t("points.ranges.last30"), days: 30 },
                  { label: t("points.ranges.last90"), days: 90 },
                ].map((r) => (
                  <Pressable
                    key={r.days}
                    onPress={async () => {
                      setRangeDays(r.days);
                      setRangeOpen(false);
                      if (userId) await loadSummary(userId, true);
                    }}
                    style={{
                      paddingVertical: 12,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={{ fontSize: 14, color: "#111827", fontWeight: "700" }}>{r.label}</Text>
                    {rangeDays === r.days ? <Ionicons name="checkmark" size={18} color="#10B981" /> : null}
                  </Pressable>
                ))}
              </Pressable>
            </Pressable>
          </Modal>

          {/* ✅ Details Modal (popup instead of “coming soon”) */}
          <Modal visible={detailsOpen} transparent animationType="fade" onRequestClose={() => setDetailsOpen(false)}>
            <Pressable style={styles.backdrop} onPress={() => setDetailsOpen(false)}>
              <Pressable onPress={() => {}} style={styles.detailsCard}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <Text style={{ fontSize: 16, fontWeight: "900", color: "#111827" }}>
                    {t("points.details.title")}
                  </Text>
                  <Pressable onPress={() => setDetailsOpen(false)} hitSlop={10}>
                    <Ionicons name="close" size={22} color="#111827" />
                  </Pressable>
                </View>

                <Text style={{ marginTop: 8, fontSize: 13, color: "#6B7280", lineHeight: 18 }}>
                  {t("points.details.intro")}
                </Text>

                <View style={{ marginTop: 14 }}>
                  <DetailRow icon="wallet-outline" text={t("points.details.lines.available")} />
                  <DetailRow icon="time-outline" text={t("points.details.lines.unconfirmed")} />
                  <DetailRow icon="stats-chart-outline" text={t("points.details.lines.total")} />
                  <DetailRow icon="pie-chart-outline" text={t("points.details.lines.income")} />
                  <DetailRow icon="swap-horizontal-outline" text={t("points.details.lines.exchange")} />
                  <DetailRow icon="cash-outline" text={t("points.details.lines.withdraw")} />
                </View>

                <View style={{ marginTop: 14, backgroundColor: "#F3F4F6", padding: 12, borderRadius: 14 }}>
                  <Text style={{ fontSize: 12, color: "#374151", lineHeight: 17 }}>
                    {t("points.details.footer")}
                  </Text>
                </View>

                <Pressable
                  onPress={() => setDetailsOpen(false)}
                  style={{ marginTop: 14, borderRadius: 999, paddingVertical: 12, backgroundColor: "#111827" }}
                >
                  <Text style={{ textAlign: "center", color: "#fff", fontWeight: "900", fontSize: 14 }}>
                    {t("common.ok")}
                  </Text>
                </Pressable>
              </Pressable>
            </Pressable>
          </Modal>

          {/* ✅ Withdraw Modal (Android-safe: typing works + stays above keyboard) */}
          <Modal
            visible={withdrawOpen}
            transparent
            animationType="slide"
            statusBarTranslucent
            presentationStyle="overFullScreen"
            onRequestClose={closeWithdraw}
          >
            <View style={styles.modalRoot} pointerEvents="box-none">
              <Pressable style={StyleSheet.absoluteFill} onPress={() => Keyboard.dismiss()} />

              <View
                style={[
                  styles.sheet,
                  {
                    marginBottom: Platform.OS === "android" ? keyboardHeight : 0,
                  },
                ]}
                pointerEvents="auto"
              >
                <ScrollView
                  keyboardShouldPersistTaps="always"
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 16 }}
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-[15px] font-semibold text-[#111827]">{t("points.withdraw.title")}</Text>
                    <Pressable onPress={closeWithdraw}>
                      <Ionicons name="close" size={22} color="#111827" />
                    </Pressable>
                  </View>

                  <Text className="text-[12px] text-gray-500 mb-2">
                   x {t("points.withdraw.available", { points: summary?.available ?? 0 })}
                  </Text>

                  <Text className="text-[12px] text-gray-500">{t("points.withdraw.fields.points")}</Text>
                  <TextInput
                    value={withdrawPoints}
                    onChangeText={setWithdrawPoints}
                    keyboardType="number-pad"
                    placeholder="1000"
                    style={styles.input}
                    returnKeyType="done"
                  />

                  <Text className="text-[12px] text-gray-500">{t("points.withdraw.fields.method")}</Text>
                  <View style={{ flexDirection: "row", gap: 10, marginTop: 8, marginBottom: 12 }}>
                    {(["Easypaisa", "JazzCash", "Bank"] as const).map((m) => {
                      const active = withdrawMethod === m;
                      return (
                        <Pressable
                          key={m}
                          onPress={() => setWithdrawMethod(m)}
                          style={[
                            styles.chip,
                            {
                              borderColor: active ? "#6366F1" : "#E5E7EB",
                              backgroundColor: active ? "#EEF2FF" : "#fff",
                            },
                          ]}
                        >
                          <Text style={{ fontSize: 12, fontWeight: "700", color: active ? "#4338CA" : "#111827" }}>
                            {m}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  <Text className="text-[12px] text-gray-500">{t("points.withdraw.fields.account")}</Text>
                  <TextInput
                    value={withdrawAccount}
                    onChangeText={setWithdrawAccount}
                    placeholder={t("points.withdraw.placeholders.account")}
                    style={styles.input}
                    returnKeyType="done"
                  />

                  <Pressable
                    onPress={submitWithdraw}
                    disabled={withdrawing}
                    style={[styles.primaryBtn, { opacity: withdrawing ? 0.6 : 1 }]}
                  >
                    <Text style={styles.primaryBtnText}>
                      {withdrawing ? t("points.withdraw.actions.submitting") : t("points.withdraw.actions.submit")}
                    </Text>
                  </Pressable>

                  <Text className="text-[11px] text-gray-400 mt-3">{t("points.withdraw.note")}</Text>
                </ScrollView>
              </View>
            </View>
          </Modal>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const DetailRow: React.FC<{ icon: keyof typeof Ionicons.glyphMap; text: string }> = ({ icon, text }) => {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 10 }}>
      <View style={{ width: 26, marginTop: 1 }}>
        <Ionicons name={icon} size={16} color="#6366F1" />
      </View>
      <Text style={{ flex: 1, fontSize: 13, color: "#111827", lineHeight: 18 }}>
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  segmentWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 999,
    padding: 4,
  },
  segmentBtn: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minWidth: 88,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentBtnActive: {
    backgroundColor: "#111827",
  },
  segmentBtnInactive: {
    backgroundColor: "transparent",
  },
  segmentTextActive: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 13,
  },
  segmentTextInactive: {
    color: "#6B7280",
    fontWeight: "800",
    fontSize: 13,
  },

  statsCard: {
    marginTop: 10,
    borderRadius: 24,
    padding: 16,
  },
  statsLabel: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 12,
    fontWeight: "800",
  },
  statsValue: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "900",
    marginTop: 6,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.22)",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
  },
  pillText: {
    marginLeft: 6,
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.85)",
    alignItems: "center",
    justifyContent: "center",
  },

  incomeCard: {
    marginBottom: 10,
    borderRadius: 18,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  incomeIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  primaryAction: {
    borderRadius: 999,
    backgroundColor: "#6366F1",
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryActionText: {
    marginLeft: 8,
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
  },
  secondaryAction: {
    marginTop: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#6366F1",
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  secondaryActionText: {
    marginLeft: 8,
    color: "#6366F1",
    fontSize: 14,
    fontWeight: "900",
  },

  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 24,
  },
  rangeCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
  },
  detailsCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
  },

  modalRoot: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 16,
    maxHeight: "85%",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 6,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  primaryBtn: {
    borderRadius: 999,
    paddingVertical: 12,
    backgroundColor: "#6366F1",
  },
  primaryBtnText: {
    textAlign: "center",
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
});

export default PointsScreen;
