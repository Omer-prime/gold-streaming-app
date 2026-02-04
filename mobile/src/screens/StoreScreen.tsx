import React, { useEffect, useMemo, useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, Image, Modal, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "../navigation/ProfileStackNavigator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { t } from "../i18n";

type Nav = NativeStackNavigationProp<ProfileStackParamList>;
const USER_ID_KEY = "gl_user_id";

function getApiBase() {
  const raw = (process.env.EXPO_PUBLIC_API_URL ?? process.env.EXPO_PUBLIC_API_BASE_URL ?? "").trim();
  const base = raw.replace(/\/+$/, "");
  return base || "http://192.168.10.25:3000";
}

/** ✅ works for GET + POST, and handles non-JSON responses nicely */
async function fetchJsonLoose(url: string, init?: RequestInit) {
  const res = await fetch(url, init);
  const text = await res.text();

  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  if (!res.ok) {
    const msg = json?.error || (text?.trim() ? text.trim() : `Request failed (HTTP ${res.status})`);
    throw new Error(msg);
  }

  if (!json) throw new Error(`API returned non-JSON (HTTP ${res.status})`);
  return json;
}

function resolveUrl(u?: string | null) {
  if (!u) return null;
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  return `${getApiBase()}${u.startsWith("/") ? "" : "/"}${u}`;
}

type Category = { id: string; name: string; slug: string; icon?: string | null };

type StoreItem = {
  id: string;
  title: string;
  description?: string | null;
  priceCoins: number;

  mediaType?: "IMAGE" | "GIF" | "VIDEO";
  mediaUrl?: string | null;
  thumbnailUrl?: string | null;

  durationDays?: number | null;
};

type Section = { title: string; items: StoreItem[] };

const StoreScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();

  const [resolvedUserId, setResolvedUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [activeSlug, setActiveSlug] = useState<string>("popular");
  const [sections, setSections] = useState<Section[]>([]);
  const [balance, setBalance] = useState<number>(0);

  const [selected, setSelected] = useState<StoreItem | null>(null);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const stored = await AsyncStorage.getItem(USER_ID_KEY);
      if (!mounted) return;
      setResolvedUserId(stored || null);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const load = useCallback(
    async (slug?: string) => {
      try {
        setLoading(true);
        setErr(null);

        if (!resolvedUserId) throw new Error(t("store.errors.missingUser"));

        const base = getApiBase();
        const s = (slug ?? activeSlug).trim();
        const url = `${base}/api/profile/store?userId=${encodeURIComponent(resolvedUserId)}&category=${encodeURIComponent(s)}`;

        const json = await fetchJsonLoose(url, { method: "GET" });

        const cats: Category[] = Array.isArray(json?.categories) ? json.categories : [];
        const secs: Section[] = Array.isArray(json?.sections) ? json.sections : [];
        const bal = Number(json?.wallet?.balance ?? 0) || 0;

        setCategories([{ id: "popular", name: t("store.popular"), slug: "popular", icon: "flame-outline" }, ...cats]);
        setSections(secs);
        setBalance(bal);

        if (!activeSlug) setActiveSlug("popular");
      } catch (e: any) {
        setErr(e?.message || t("common.error"));
        setCategories([{ id: "popular", name: t("store.popular"), slug: "popular", icon: "flame-outline" }]);
        setSections([]);
        setBalance(0);
      } finally {
        setLoading(false);
      }
    },
    [resolvedUserId, activeSlug]
  );

  useEffect(() => {
    if (!resolvedUserId) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedUserId]);

  const empty = useMemo(() => !loading && sections.length === 0, [loading, sections.length]);

  const onBuy = useCallback(async () => {
    if (!resolvedUserId || !selected) return;
    if (buying) return;

    if (balance < selected.priceCoins) {
      Alert.alert(t("store.purchase.insufficientTitle"), t("store.purchase.insufficientMsg"));
      return;
    }

    Alert.alert(
      t("store.purchase.confirmTitle"),
      t("store.purchase.confirmMsg", { title: selected.title, price: selected.priceCoins }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("store.purchase.actions.buy"),
          onPress: async () => {
            try {
              setBuying(true);

              const base = getApiBase();

              // ✅ FIX 1: Correct endpoint
              const url = `${base}/api/profile/store/purchase`;

              const json = await fetchJsonLoose(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  userId: resolvedUserId,
                  itemId: selected.id,
                  quantity: 1,
                }),
              });

              // ✅ FIX 2: Backend returns { ok: true, balance, expiresAt }
              const newBal = Number(json?.balance ?? balance);
              setBalance(Number.isFinite(newBal) ? newBal : balance);

              Alert.alert(t("store.purchase.successTitle"), t("store.purchase.successMsg"));
              setSelected(null);

              // refresh store list
              await load(activeSlug);
            } catch (e: any) {
              Alert.alert(t("store.purchase.failedTitle"), e?.message || t("store.purchase.failedMsg"));
            } finally {
              setBuying(false);
            }
          },
        },
      ]
    );
  }, [resolvedUserId, selected, buying, balance, load, activeSlug]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top"]}>
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable onPress={navigation.goBack} hitSlop={10} style={{ width: 40, height: 40, borderRadius: 999, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="chevron-back" size={20} color="#111827" />
          </Pressable>

          <Text style={{ flex: 1, textAlign: "center", fontSize: 16, fontWeight: "900", color: "#111827" }}>
            {t("store.title")}
          </Text>

          <Pressable
            onPress={() => navigation.navigate("Coins" as never)}
            hitSlop={10}
            style={{
              paddingHorizontal: 10,
              height: 36,
              borderRadius: 999,
              backgroundColor: "#FFF7ED",
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#FED7AA",
            }}
          >
            <Ionicons name="cash-outline" size={16} color="#F59E0B" />
            <Text style={{ marginLeft: 6, fontWeight: "900", color: "#9A3412" }}>
              {balance.toLocaleString()}
            </Text>
          </Pressable>
        </View>
      </View>

      {!!err && (
        <View style={{ marginHorizontal: 16, marginTop: 12, borderRadius: 16, backgroundColor: "rgba(239,68,68,0.08)", borderWidth: 1, borderColor: "rgba(239,68,68,0.18)", padding: 10 }}>
          <Text style={{ fontSize: 12, color: "#B91C1C", fontWeight: "700" }}>{err}</Text>
          <Text style={{ fontSize: 10, marginTop: 4, color: "rgba(185,28,28,0.75)" }}>
            Base: {getApiBase()}
          </Text>
        </View>
      )}

      {/* Category row */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
        {categories.map((cat) => {
          const active = cat.slug === activeSlug;
          return (
            <Pressable
              key={cat.slug}
              onPress={() => {
                setActiveSlug(cat.slug);
                load(cat.slug);
              }}
              style={{ marginRight: 12, alignItems: "center" }}
            >
              <View
                style={{
                  height: 40,
                  width: 40,
                  borderRadius: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 4,
                  backgroundColor: active ? "#F97316" : "#F3F4F6",
                }}
              >
                <Ionicons name={(cat.icon || "flame-outline") as any} size={18} color={active ? "#fff" : "#9CA3AF"} />
              </View>
              <Text style={{ fontSize: 10, fontWeight: active ? "800" : "700", color: active ? "#111827" : "#6B7280" }}>
                {cat.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 28, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={{ paddingVertical: 60, alignItems: "center" }}>
            <ActivityIndicator />
            <Text style={{ marginTop: 8, fontSize: 12, color: "#6B7280" }}>{t("store.states.loading")}</Text>
          </View>
        ) : empty ? (
          <View style={{ paddingVertical: 60, alignItems: "center" }}>
            <Text style={{ fontSize: 13, color: "#6B7280" }}>{t("store.states.empty")}</Text>
            <Pressable onPress={() => load()} style={{ marginTop: 12, borderRadius: 999, backgroundColor: "#F3F4F6", paddingHorizontal: 16, paddingVertical: 10 }}>
              <Text style={{ fontSize: 12, fontWeight: "800", color: "#111827" }}>{t("store.actions.refresh")}</Text>
            </Pressable>
          </View>
        ) : (
          sections.map((sec) => (
            <View key={sec.title} style={{ marginTop: 10 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <Text style={{ fontSize: 14, fontWeight: "900", color: "#111827" }}>{sec.title}</Text>
                <Text style={{ fontSize: 11, fontWeight: "800", color: "#6B7280" }}>{t("store.actions.all")}</Text>
              </View>

              {/* 2-column grid */}
              <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
                {sec.items.map((item) => (
                  <StoreCard key={item.id} item={item} onPress={() => setSelected(item)} />
                ))}
              </View>
            </View>
          ))
        )}

        {/* Bottom hint */}
        <LinearGradient
          colors={["rgba(249,115,22,0.10)", "rgba(249,115,22,0.02)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ marginTop: 14, borderRadius: 18, padding: 12, borderWidth: 1, borderColor: "rgba(249,115,22,0.18)" }}
        >
          <Text style={{ fontSize: 12, fontWeight: "900", color: "#111827" }}>
            {t("store.labels.balance")}
          </Text>
          <Text style={{ marginTop: 4, fontSize: 11, fontWeight: "700", color: "#6B7280" }}>
            {t("store.labels.balanceHint")}
          </Text>

          <Pressable
            onPress={() => navigation.navigate("Coins" as never)}
            style={{ marginTop: 10, borderRadius: 999, backgroundColor: "#111827", paddingVertical: 10, alignItems: "center" }}
          >
            <Text style={{ color: "#fff", fontWeight: "900", fontSize: 12 }}>{t("store.actions.recharge")}</Text>
          </Pressable>
        </LinearGradient>
      </ScrollView>

      {/* Buy Modal */}
      <Modal visible={!!selected} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
        <Pressable onPress={() => setSelected(null)} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" }}>
          <Pressable onPress={() => {}} style={{ backgroundColor: "#fff", borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 15, fontWeight: "900", color: "#111827" }}>{selected?.title}</Text>
              <Pressable onPress={() => setSelected(null)} hitSlop={10}>
                <Ionicons name="close" size={22} color="#111827" />
              </Pressable>
            </View>

            {/* Preview */}
            <View style={{ marginTop: 12, borderRadius: 16, overflow: "hidden", backgroundColor: "#111827", height: 180 }}>
              {(() => {
                const preview = resolveUrl(selected?.thumbnailUrl || selected?.mediaUrl);
                if (!preview) {
                  return (
                    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                      <Text style={{ color: "rgba(255,255,255,0.75)", fontWeight: "800" }}>{t("store.labels.preview")}</Text>
                    </View>
                  );
                }

                return (
                  <>
                    <Image source={{ uri: preview }} resizeMode="cover" style={{ width: "100%", height: "100%" }} />
                    {selected?.mediaType === "VIDEO" && (
                      <View style={{ position: "absolute", inset: 0, alignItems: "center", justifyContent: "center" }}>
                        <View style={{ height: 54, width: 54, borderRadius: 999, backgroundColor: "rgba(0,0,0,0.45)", alignItems: "center", justifyContent: "center" }}>
                          <Ionicons name="play" size={24} color="#fff" />
                        </View>
                      </View>
                    )}
                  </>
                );
              })()}
            </View>

            {!!selected?.description && (
              <Text style={{ marginTop: 10, fontSize: 12, color: "#6B7280", fontWeight: "700" }}>
                {selected.description}
              </Text>
            )}

            <View style={{ marginTop: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="cash-outline" size={16} color="#F59E0B" />
                <Text style={{ marginLeft: 6, fontWeight: "900", color: "#111827" }}>
                  {selected?.priceCoins?.toLocaleString?.() ?? 0}
                </Text>
                <Text style={{ marginLeft: 6, fontSize: 12, fontWeight: "800", color: "#6B7280" }}>
                  {t("store.labels.coins")}
                </Text>
              </View>

              <Text style={{ fontSize: 12, fontWeight: "800", color: "#6B7280" }}>
                {selected?.durationDays ? t("store.labels.durationDays", { days: selected.durationDays }) : t("store.labels.permanent")}
              </Text>
            </View>

            <Pressable
              onPress={onBuy}
              disabled={buying}
              style={{
                marginTop: 14,
                borderRadius: 999,
                paddingVertical: 12,
                alignItems: "center",
                backgroundColor: balance < (selected?.priceCoins ?? 0) ? "#F3F4F6" : "#F97316",
                opacity: buying ? 0.7 : 1,
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: "900", color: balance < (selected?.priceCoins ?? 0) ? "#6B7280" : "#fff" }}>
                {buying ? t("store.purchase.actions.buying") : t("store.purchase.actions.buy")}
              </Text>
            </Pressable>

            {balance < (selected?.priceCoins ?? 0) && (
              <Pressable
                onPress={() => {
                  setSelected(null);
                  navigation.navigate("Coins" as never);
                }}
                style={{ marginTop: 10, borderRadius: 999, paddingVertical: 12, alignItems: "center", borderWidth: 1, borderColor: "#E5E7EB" }}
              >
                <Text style={{ fontSize: 13, fontWeight: "900", color: "#111827" }}>
                  {t("store.purchase.actions.recharge")}
                </Text>
              </Pressable>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const StoreCard: React.FC<{ item: StoreItem; onPress: () => void }> = ({ item, onPress }) => {
  const preview = resolveUrl(item.thumbnailUrl || item.mediaUrl);

  return (
    <Pressable onPress={onPress} style={{ width: "48%", marginBottom: 12 }}>
      <View style={{ borderRadius: 18, overflow: "hidden", backgroundColor: "#111827", height: 160 }}>
        {preview ? (
          <Image source={{ uri: preview }} resizeMode="cover" style={{ width: "100%", height: "100%" }} />
        ) : (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: "rgba(255,255,255,0.75)", fontWeight: "800" }}>{t("store.labels.preview")}</Text>
          </View>
        )}

        {item.mediaType === "VIDEO" && (
          <View style={{ position: "absolute", right: 10, top: 10, backgroundColor: "rgba(0,0,0,0.45)", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 }}>
            <Text style={{ color: "#fff", fontSize: 10, fontWeight: "900" }}>VIDEO</Text>
          </View>
        )}

        <LinearGradient
          colors={["rgba(0,0,0,0.75)", "rgba(0,0,0,0.05)"]}
          start={{ x: 0, y: 1 }}
          end={{ x: 0, y: 0 }}
          style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 72 }}
        />

        <View style={{ position: "absolute", left: 10, right: 10, bottom: 10 }}>
          <Text style={{ color: "#fff", fontSize: 13, fontWeight: "900" }} numberOfLines={1}>
            {item.title}
          </Text>

          <View style={{ marginTop: 6, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="cash-outline" size={14} color="#F59E0B" />
              <Text style={{ marginLeft: 6, color: "#fff", fontWeight: "900" }}>
                {item.priceCoins.toLocaleString()}
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.7)" />
          </View>
        </View>
      </View>
    </Pressable>
  );
};

export default StoreScreen;
