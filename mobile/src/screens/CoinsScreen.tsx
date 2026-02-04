import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, FlatList, Alert, Modal, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

import { API_BASE_URL } from "../config";
import { t } from "../i18n";

type LedgerItem = {
  id: string;
  createdAt: string;
  type: "TOPUP" | "GIFT_SENT" | "GIFT_RECEIVED" | "ADJUSTMENT";
  delta: number;
  balanceAfter: number;
  title?: string | null;
};

type PackageApi = { id: string; coins: number; price: number; currency: string; title: string };
type PackageItem = PackageApi & { priceLabel: string };

const CoinsScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [userId, setUserId] = useState<string | null>(null);

  const [balance, setBalance] = useState<number>(0);
  const [loadingBalance, setLoadingBalance] = useState(true);

  const [filterType, setFilterType] = useState<"ALL" | "TOPUP" | "GIFT_SENT">("ALL");

  const [items, setItems] = useState<LedgerItem[]>([]);
  const [loadingLedger, setLoadingLedger] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const [topupOpen, setTopupOpen] = useState(false);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loadingPkgs, setLoadingPkgs] = useState(false);
  const [toppingUp, setToppingUp] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem("gl_user_id").then((id) => setUserId(id));
  }, []);

  const loadBalance = useCallback(async (uid: string) => {
    try {
      setLoadingBalance(true);
      const res = await fetch(`${API_BASE_URL}/api/wallet?userId=${encodeURIComponent(uid)}`);
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || t("coins.errors.loadWallet"));
      setBalance(Number(json?.wallet?.balance ?? 0));
    } catch (e: any) {
      Alert.alert(t("coins.alerts.walletErrorTitle"), e?.message || t("coins.errors.loadWallet"));
    } finally {
      setLoadingBalance(false);
    }
  }, []);

  const ledgerUrl = useMemo(() => {
    const base = `${API_BASE_URL}/api/wallet/ledger?userId=${encodeURIComponent(userId || "")}&limit=20`;
    const tt = filterType !== "ALL" ? `&type=${encodeURIComponent(filterType)}` : `&type=ALL`;
    return base + tt;
  }, [userId, filterType]);

  const loadLedgerFirst = useCallback(async () => {
    if (!userId) return;
    try {
      setLoadingLedger(true);
      const res = await fetch(ledgerUrl);
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || t("coins.errors.loadHistory"));
      setItems(json?.items ?? []);
      setNextCursor(json?.nextCursor ?? null);
    } catch (e: any) {
      Alert.alert(t("coins.alerts.historyErrorTitle"), e?.message || t("coins.errors.loadHistory"));
    } finally {
      setLoadingLedger(false);
    }
  }, [userId, ledgerUrl]);

  const loadMore = useCallback(async () => {
    if (!userId || !nextCursor || loadingMore) return;
    try {
      setLoadingMore(true);
      const res = await fetch(`${ledgerUrl}&cursor=${encodeURIComponent(nextCursor)}`);
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || t("coins.errors.loadMore"));
      const more = (json?.items ?? []) as LedgerItem[];
      setItems((prev) => [...prev, ...more]);
      setNextCursor(json?.nextCursor ?? null);
    } catch (e: any) {
      Alert.alert(t("coins.alerts.historyErrorTitle"), e?.message || t("coins.errors.loadMore"));
    } finally {
      setLoadingMore(false);
    }
  }, [userId, nextCursor, loadingMore, ledgerUrl]);

  const loadPackages = useCallback(async () => {
    try {
      setLoadingPkgs(true);
      const res = await fetch(`${API_BASE_URL}/api/coins/packages`);
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || t("coins.errors.loadPackages"));

      const pkgs = (json?.packages ?? []) as PackageApi[];
      const mapped: PackageItem[] = pkgs.map((p) => ({
        ...p,
        priceLabel: `${p.currency} ${p.price}`,
      }));

      setPackages(mapped);
    } catch (e: any) {
      Alert.alert(t("coins.alerts.topupErrorTitle"), e?.message || t("coins.errors.loadPackages"));
    } finally {
      setLoadingPkgs(false);
    }
  }, []);

  const openTopup = useCallback(() => {
    setTopupOpen(true);
    loadPackages();
  }, [loadPackages]);

  const doTopup = useCallback(
    async (pkg: PackageItem) => {
      if (!userId) return Alert.alert(t("coins.alerts.loginRequiredTitle"));
      if (toppingUp) return;

      try {
        setToppingUp(pkg.id);

        const res = await fetch(`${API_BASE_URL}/api/coins/topup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, packageId: pkg.id }),
        });

        const json = await res.json().catch(() => null);
        if (!res.ok) {
          return Alert.alert(t("coins.alerts.topupFailedTitle"), json?.error || t("coins.errors.topupFailed"));
        }

        const newBalance = Number(json?.wallet?.balance ?? balance);
        setBalance(newBalance);

        await loadLedgerFirst();
        await loadBalance(userId);

        Alert.alert(t("coins.alerts.successTitle"), t("coins.alerts.addedCoinsMsg", { coins: pkg.coins }));
        setTopupOpen(false);
      } catch (e: any) {
        Alert.alert(t("coins.alerts.topupFailedTitle"), e?.message || t("coins.errors.topupFailed"));
      } finally {
        setToppingUp(null);
      }
    },
    [userId, toppingUp, balance, loadLedgerFirst, loadBalance]
  );

  useEffect(() => {
    if (!userId) return;
    loadBalance(userId);
    loadLedgerFirst();
  }, [userId, loadBalance, loadLedgerFirst]);

  const balanceText = loadingBalance ? "…" : String(balance);

  const filterLabel =
    filterType === "ALL"
      ? t("coins.filters.all")
      : filterType === "TOPUP"
      ? t("coins.filters.topups")
      : t("coins.filters.spent");

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* ✅ Header (same UX as Points screen) */}
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10, flexDirection: "row", alignItems: "center" }}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </Pressable>

        {/* ✅ Segmented Tabs */}
        <View style={{ flex: 1, alignItems: "center" }}>
          <View style={styles.segmentWrap}>
            <View style={[styles.segmentBtn, styles.segmentBtnActive]}>
              <Text style={styles.segmentTextActive}>{t("coins.title")}</Text>
            </View>

            <View style={{ width: 8 }} />

            <Pressable
              onPress={() => navigation.navigate("Points")}
              style={[styles.segmentBtn, styles.segmentBtnInactive]}
            >
              <Text style={styles.segmentTextInactive}>{t("coins.pointsTab")}</Text>
            </Pressable>
          </View>
        </View>

        {/* keep right spacing balanced */}
        <View style={{ width: 22 }} />
      </View>

      <View className="flex-1 px-4 pt-2">
        {/* ✅ Balance Card (nicer gradient + topup button) */}
        <LinearGradient
          colors={["#FDBA74", "#FB923C"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View>
              <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                <Text style={styles.balanceValue}>{balanceText}</Text>
                <Text style={styles.balanceUnit}>{t("coins.labels.coinsUnit")}</Text>
              </View>
              <Text style={styles.balanceLabel}>{t("coins.labels.remainingCoins")}</Text>
            </View>

            <Pressable style={styles.topupBtn} onPress={openTopup}>
              <Ionicons name="add-circle-outline" size={18} color="#FB923C" />
              <Text style={styles.topupText}>{t("coins.actions.topUp")}</Text>
            </Pressable>
          </View>
        </LinearGradient>

        {/* ✅ Filter row (cleaner) */}
        <View style={{ marginTop: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Pressable
            onPress={() => setFilterType((p) => (p === "ALL" ? "TOPUP" : p === "TOPUP" ? "GIFT_SENT" : "ALL"))}
            style={styles.filterPill}
            hitSlop={10}
          >
            <Ionicons name="funnel-outline" size={14} color="#6B7280" />
            <Text style={styles.filterText}>{filterLabel}</Text>
            <Ionicons name="repeat-outline" size={14} color="#6B7280" />
          </Pressable>

          <Pressable onPress={loadLedgerFirst} style={styles.refreshPill} hitSlop={10}>
            <Ionicons name="refresh-outline" size={14} color="#6B7280" />
            <Text style={styles.refreshText}>{t("coins.actions.refresh")}</Text>
          </Pressable>
        </View>

        {loadingLedger ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
            <Text className="mt-2 text-[13px] text-gray-400">{t("coins.states.loading")}</Text>
          </View>
        ) : items.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-[13px] text-gray-400">{t("coins.states.empty")}</Text>
          </View>
        ) : (
          <FlatList
            className="mt-3"
            data={items}
            keyExtractor={(i) => i.id}
            onEndReachedThreshold={0.5}
            onEndReached={loadMore}
            ListFooterComponent={
              loadingMore ? (
                <View className="py-4 items-center">
                  <ActivityIndicator />
                </View>
              ) : nextCursor ? (
                <View className="py-4 items-center">
                  <Text className="text-[12px] text-gray-400">{t("coins.states.scrollMore")}</Text>
                </View>
              ) : (
                <View className="py-4 items-center">
                  <Text className="text-[12px] text-gray-300">{t("coins.states.end")}</Text>
                </View>
              )
            }
            renderItem={({ item }) => {
              const isPlus = item.delta > 0;
              const d = new Date(item.createdAt);
              const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(
                2,
                "0"
              )}`;

              const fallbackTitle =
                item.type === "TOPUP"
                  ? t("coins.types.topup")
                  : item.type === "GIFT_SENT"
                  ? t("coins.types.giftSent")
                  : item.type;

              return (
                <View style={styles.row}>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <Text style={styles.rowTitle}>{item.title || fallbackTitle}</Text>

                    <View style={[styles.deltaPill, { backgroundColor: isPlus ? "#ECFDF5" : "#FFF1F2" }]}>
                      <Text style={[styles.deltaText, { color: isPlus ? "#059669" : "#E11D48" }]}>
                        {isPlus ? `+${item.delta}` : String(item.delta)}
                      </Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
                    <Text style={styles.rowMeta}>{date}</Text>
                    <Text style={styles.rowMeta}>
                      {t("coins.labels.balanceAfter", { balance: item.balanceAfter })}
                    </Text>
                  </View>
                </View>
              );
            }}
          />
        )}
      </View>

      {/* ✅ Topup Modal */}
      <Modal visible={topupOpen} transparent animationType="slide" onRequestClose={() => setTopupOpen(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: "#fff", borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 16 }}>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-[15px] font-semibold text-[#111827]">{t("coins.modal.title")}</Text>
              <Pressable onPress={() => setTopupOpen(false)} hitSlop={10}>
                <Ionicons name="close" size={22} color="#111827" />
              </Pressable>
            </View>

            {loadingPkgs ? (
              <View style={{ paddingVertical: 18, alignItems: "center" }}>
                <ActivityIndicator />
                <Text className="mt-2 text-[13px] text-gray-400">{t("coins.states.loadingPackages")}</Text>
              </View>
            ) : packages.length === 0 ? (
              <Text className="text-[13px] text-gray-400">{t("coins.states.noPackages")}</Text>
            ) : (
              <View style={{ gap: 10 }}>
                {packages.map((p) => {
                  const busy = toppingUp === p.id;
                  return (
                    <Pressable
                      key={p.id}
                      onPress={() => doTopup(p)}
                      disabled={!!toppingUp}
                      style={{
                        borderWidth: 1,
                        borderColor: "#E5E7EB",
                        borderRadius: 14,
                        padding: 14,
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        opacity: toppingUp && !busy ? 0.6 : 1,
                      }}
                    >
                      <View>
                        <Text style={{ fontSize: 14, fontWeight: "900", color: "#111827" }}>
                          {t("coins.labels.pkgCoins", { coins: p.coins })}
                        </Text>
                        <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                          {t("coins.labels.pkgId", { id: p.id })}
                        </Text>
                      </View>

                      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <Text style={{ fontSize: 13, fontWeight: "900", color: "#FB923C" }}>{p.priceLabel}</Text>
                        {busy ? <ActivityIndicator /> : <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}

            <Text className="text-[11px] text-gray-400 mt-3">{t("coins.modal.note")}</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // same segmented style as PointsScreen
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

  balanceCard: {
    borderRadius: 24,
    padding: 16,
    marginTop: 8,
  },
  balanceValue: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "900",
  },
  balanceUnit: {
    marginLeft: 6,
    color: "rgba(255,255,255,0.92)",
    fontSize: 12,
    fontWeight: "900",
  },
  balanceLabel: {
    marginTop: 6,
    color: "rgba(255,255,255,0.92)",
    fontSize: 12,
    fontWeight: "800",
  },

  topupBtn: {
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
  },
  topupText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: "900",
    color: "#FB923C",
  },

  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    gap: 8,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#111827",
  },

  refreshPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
  },
  refreshText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: "900",
    color: "#111827",
  },

  row: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  rowTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#111827",
  },
  rowMeta: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "700",
  },
  deltaPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  deltaText: {
    fontSize: 12,
    fontWeight: "900",
  },
});

export default CoinsScreen;
