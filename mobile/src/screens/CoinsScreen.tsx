import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  FlatList,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config";

type LedgerItem = {
  id: string;
  createdAt: string;
  type: "TOPUP" | "GIFT_SENT" | "GIFT_RECEIVED" | "ADJUSTMENT";
  delta: number;
  balanceAfter: number;
  title?: string | null;
};

type PackageItem = { id: string; coins: number; priceLabel: string };

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
      if (!res.ok) throw new Error(json?.error || "Failed to load wallet");
      setBalance(Number(json?.wallet?.balance ?? 0));
    } catch (e: any) {
      Alert.alert("Wallet error", e?.message || "Failed to load wallet");
    } finally {
      setLoadingBalance(false);
    }
  }, []);

  const ledgerUrl = useMemo(() => {
    const base = `${API_BASE_URL}/api/wallet/ledger?userId=${encodeURIComponent(userId || "")}&limit=20`;
    const t = filterType !== "ALL" ? `&type=${encodeURIComponent(filterType)}` : `&type=ALL`;
    return base + t;
  }, [userId, filterType]);

  const loadLedgerFirst = useCallback(async () => {
    if (!userId) return;
    try {
      setLoadingLedger(true);
      const res = await fetch(ledgerUrl);
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Failed to load history");
      setItems(json?.items ?? []);
      setNextCursor(json?.nextCursor ?? null);
    } catch (e: any) {
      Alert.alert("History error", e?.message || "Failed to load history");
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
      if (!res.ok) throw new Error(json?.error || "Failed to load more");
      const more = (json?.items ?? []) as LedgerItem[];
      setItems((prev) => [...prev, ...more]);
      setNextCursor(json?.nextCursor ?? null);
    } catch (e: any) {
      Alert.alert("History error", e?.message || "Failed to load more");
    } finally {
      setLoadingMore(false);
    }
  }, [userId, nextCursor, loadingMore, ledgerUrl]);

  const loadPackages = useCallback(async () => {
    try {
      setLoadingPkgs(true);
      const res = await fetch(`${API_BASE_URL}/api/coins/packages`);
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Failed to load packages");
      setPackages(json?.packages ?? []);
    } catch (e: any) {
      Alert.alert("Top up error", e?.message || "Failed to load packages");
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
      if (!userId) return Alert.alert("Login required");
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
          return Alert.alert("Top up failed", json?.error || "Top up failed");
        }

        // update local balance immediately
        setBalance(Number(json?.balance ?? balance + pkg.coins));

        // refresh ledger
        await loadLedgerFirst();

        Alert.alert("Success", `Added ${pkg.coins} coins`);
        setTopupOpen(false);
      } catch (e: any) {
        Alert.alert("Top up failed", e?.message || "Top up failed");
      } finally {
        setToppingUp(null);
      }
    },
    [userId, toppingUp, balance, loadLedgerFirst]
  );

  useEffect(() => {
    if (!userId) return;
    loadBalance(userId);
    loadLedgerFirst();
  }, [userId, loadBalance, loadLedgerFirst]);

  const balanceText = loadingBalance ? "…" : String(balance);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header with tabs */}
      <View className="flex-row items-center px-4 pt-3 pb-2">
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </Pressable>

        <View className="flex-1 flex-row justify-center space-x-6">
          <Text className="text-[15px] font-semibold text-[#111827]">Coins</Text>
          <Pressable onPress={() => navigation.navigate("Points")}>
            <Text className="text-[15px] text-gray-400">Points</Text>
          </Pressable>
        </View>

        <View style={{ width: 22 }} />
      </View>

      {/* Body */}
      <View className="flex-1 px-4 pt-4">
        {/* Orange card */}
        <View className="rounded-3xl bg-[#FDBA74] px-4 py-4 flex-row items-center justify-between">
          <View>
            <Text className="text-[26px] font-bold text-white">{balanceText}</Text>
            <Text className="mt-1 text-[12px] text-orange-50">Remaining coins</Text>
          </View>

          <Pressable
            className="px-5 py-2 rounded-full bg-white"
            onPress={openTopup}
          >
            <Text className="text-[13px] font-semibold text-[#FB923C]">Top Up</Text>
          </Pressable>
        </View>

        {/* Filter row */}
        <View className="mt-4 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Pressable
              onPress={() =>
                setFilterType((p) => (p === "ALL" ? "TOPUP" : p === "TOPUP" ? "GIFT_SENT" : "ALL"))
              }
              className="flex-row items-center mr-4"
            >
              <Text className="text-[13px] text-[#111827] mr-1">
                {filterType === "ALL" ? "All" : filterType === "TOPUP" ? "Top ups" : "Spent"}
              </Text>
              <Ionicons name="repeat-outline" size={14} color="#6B7280" />
            </Pressable>
          </View>

          <Pressable onPress={loadLedgerFirst} className="flex-row items-center">
            <Ionicons name="refresh-outline" size={14} color="#6B7280" />
            <Text className="ml-1 text-[13px] text-[#111827]">Refresh</Text>
          </Pressable>
        </View>

        {/* History list */}
        {loadingLedger ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
            <Text className="mt-2 text-[13px] text-gray-400">Loading…</Text>
          </View>
        ) : items.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-[13px] text-gray-400">No history</Text>
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
                  <Text className="text-[12px] text-gray-400">Scroll for more…</Text>
                </View>
              ) : (
                <View className="py-4 items-center">
                  <Text className="text-[12px] text-gray-300">End</Text>
                </View>
              )
            }
            renderItem={({ item }) => {
              const isPlus = item.delta > 0;
              const d = new Date(item.createdAt);
              const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
                d.getDate()
              ).padStart(2, "0")}`;

              return (
                <View className="py-3 border-b border-gray-100">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-[13px] font-semibold text-[#111827]">
                      {item.title || (item.type === "TOPUP" ? "Top up" : item.type === "GIFT_SENT" ? "Gift sent" : item.type)}
                    </Text>
                    <Text className={`text-[13px] font-bold ${isPlus ? "text-emerald-600" : "text-rose-600"}`}>
                      {isPlus ? `+${item.delta}` : String(item.delta)}
                    </Text>
                  </View>
                  <View className="flex-row items-center justify-between mt-1">
                    <Text className="text-[12px] text-gray-400">{date}</Text>
                    <Text className="text-[12px] text-gray-400">Balance: {item.balanceAfter}</Text>
                  </View>
                </View>
              );
            }}
          />
        )}
      </View>

      {/* Top up modal */}
      <Modal visible={topupOpen} transparent animationType="slide" onRequestClose={() => setTopupOpen(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: "#fff", borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 16 }}>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-[15px] font-semibold text-[#111827]">Top Up</Text>
              <Pressable onPress={() => setTopupOpen(false)}>
                <Ionicons name="close" size={22} color="#111827" />
              </Pressable>
            </View>

            {loadingPkgs ? (
              <View style={{ paddingVertical: 18, alignItems: "center" }}>
                <ActivityIndicator />
                <Text className="mt-2 text-[13px] text-gray-400">Loading packages…</Text>
              </View>
            ) : packages.length === 0 ? (
              <Text className="text-[13px] text-gray-400">No packages</Text>
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
                        <Text style={{ fontSize: 14, fontWeight: "800", color: "#111827" }}>{p.coins} coins</Text>
                        <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>Package: {p.id}</Text>
                      </View>

                      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <Text style={{ fontSize: 13, fontWeight: "800", color: "#FB923C" }}>{p.priceLabel}</Text>
                        {busy ? <ActivityIndicator /> : <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}

            <Text className="text-[11px] text-gray-400 mt-3">
              Note: This top-up works only if backend is in TEST mode (COIN_TOPUP_MODE=TEST). Real payments will be added next.
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default CoinsScreen;
