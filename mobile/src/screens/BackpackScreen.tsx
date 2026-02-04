import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { API_BASE_URL } from "../config";
import { t } from "../i18n";

type OutfitTab = "Backpack" | "Avatar" | "Party";

type OwnedItem = {
  id: string;
  type: string;
  title: string;
  description?: string | null;
  priceCoins: number;
  mediaType?: string | null;
  mediaUrl?: string | null;
  thumbnailUrl?: string | null;

  // backend might provide but can be WRONG (localhost)
  mediaUrlFull?: string | null;
  thumbnailUrlFull?: string | null;

  durationDays?: number | null;
  obtainedAt: string;
  expiresAt: string | null;
  isEquipped: boolean;
};

type OwnedResponse = {
  userId: string;
  equippedIds: Record<string, string | null>;
  items: OwnedItem[];
  groups: Record<string, OwnedItem[]>;
};

type ProfileMeLite = { wallet?: { balance: number } };

const TAB_META: Record<OutfitTab, { labelKey: string; icon: any }> = {
  Backpack: { labelKey: "outfit.tabs.backpack", icon: "gift-outline" },
  Avatar: { labelKey: "outfit.tabs.avatar", icon: "aperture-outline" },
  Party: { labelKey: "outfit.tabs.party", icon: "color-wand-outline" },
};

function getApiBase() {
  const raw =
    (process.env.EXPO_PUBLIC_API_URL ??
      process.env.EXPO_PUBLIC_API_BASE_URL ??
      "")?.trim() || "";

  const base = raw.replace(/\/+$/, "");
  const fallback = String(API_BASE_URL || "").trim().replace(/\/+$/, "");
  return base || fallback || "http://192.168.10.25:3000";
}

function resolveUrl(u?: string | null) {
  if (!u) return null;

  // if backend gave localhost, ignore it for mobile
  if (u.includes("localhost:3000") || u.includes("127.0.0.1:3000")) {
    return null;
  }

  if (u.startsWith("http://") || u.startsWith("https://")) return u;

  const base = getApiBase();
  return `${base}${u.startsWith("/") ? "" : "/"}${u}`;
}

function matchesTab(type: string, tab: OutfitTab) {
  if (tab === "Avatar") return type === "AVATAR_FRAME";
  if (tab === "Party") return type === "PARTY_THEME";
  return type !== "AVATAR_FRAME" && type !== "PARTY_THEME";
}

function getExpiryState(expiresAt: string | null) {
  if (!expiresAt) return { kind: "PERMANENT" as const, expired: false };
  const ts = new Date(expiresAt).getTime();
  if (Number.isNaN(ts)) return { kind: "LIMITED" as const, expired: false };
  const diff = ts - Date.now();
  const d = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (d <= 0) return { kind: "EXPIRED" as const, expired: true };
  if (d === 1) return { kind: "ONE_DAY" as const, expired: false };
  return { kind: "DAYS" as const, expired: false, days: d };
}

function expiryLabel(expiresAt: string | null) {
  const s = getExpiryState(expiresAt);
  if (s.kind === "PERMANENT") return t("outfit.labels.permanent");
  if (s.kind === "LIMITED") return t("outfit.labels.limited");
  if (s.kind === "EXPIRED") return t("outfit.labels.expired");
  if (s.kind === "ONE_DAY") return t("outfit.labels.oneDayLeft");
  return t("outfit.labels.daysLeft", { count: (s as any).days });
}

function isEquipable(type: string) {
  return (
    type === "AVATAR_FRAME" ||
    type === "PROFILE_CARD" ||
    type === "CHAT_BUBBLE" ||
    type === "PARTY_THEME" ||
    type === "RIDE" ||
    type === "PREMIUM_ID"
  );
}

function preferContain(type: string) {
  return type === "AVATAR_FRAME" || type === "PROFILE_CARD" || type === "CHAT_BUBBLE";
}

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
    throw new Error(`${msg} (HTTP ${res.status}) • ${url}`);
  }

  if (!json) throw new Error(`API returned non-JSON (HTTP ${res.status}) • ${url}`);
  return json;
}

async function fetchOwned(userId: string) {
  const base = getApiBase();
  const url = `${base}/api/profile/store/owned?userId=${encodeURIComponent(userId)}`;
  return (await fetchJsonLoose(url, { method: "GET" })) as OwnedResponse;
}

async function fetchWallet(userId: string) {
  const base = getApiBase();
  const url = `${base}/api/profile/me?userId=${encodeURIComponent(userId)}`;
  return (await fetchJsonLoose(url, { method: "GET" })) as ProfileMeLite;
}

async function equipItem(userId: string, itemId: string) {
  const base = getApiBase();
  const url = `${base}/api/profile/store/equip`;
  return await fetchJsonLoose(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ userId, itemId }),
  });
}

async function unequipType(userId: string, type: string) {
  const base = getApiBase();
  const url = `${base}/api/profile/store/unequip`;
  return await fetchJsonLoose(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ userId, type }),
  });
}

const BackPackScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<OutfitTab>("Backpack");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const [walletBalance, setWalletBalance] = useState(0);
  const [ownedItems, setOwnedItems] = useState<OwnedItem[]>([]);

  const bg = useMemo(() => ["#0b1220", "#0b1220", "rgba(108,77,255,0.18)"] as const, []);

  const load = useCallback(async (isRefresh = false) => {
    try {
      setErrorText(null);
      isRefresh ? setRefreshing(true) : setLoading(true);

      const uid = (await AsyncStorage.getItem("gl_user_id"))?.trim() || "";
      if (!uid) {
        setOwnedItems([]);
        setWalletBalance(0);
        setErrorText(t("outfit.errors.loginRequired"));
        return;
      }

      const [owned, prof] = await Promise.all([fetchOwned(uid), fetchWallet(uid)]);

      const items = Array.isArray(owned.items) ? owned.items : [];
      items.sort((a, b) => {
        const ea = getExpiryState(a.expiresAt).expired ? 1 : 0;
        const eb = getExpiryState(b.expiresAt).expired ? 1 : 0;
        if (ea !== eb) return ea - eb;
        if (a.isEquipped !== b.isEquipped) return a.isEquipped ? -1 : 1;
        return String(a.title || "").localeCompare(String(b.title || ""));
      });

      setWalletBalance(Number(prof?.wallet?.balance ?? 0));
      setOwnedItems(items);
    } catch (e: any) {
      setErrorText(e?.message || t("outfit.errors.loadFailed"));
      setOwnedItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(false);
    }, [load])
  );

  const filtered = useMemo(
    () => ownedItems.filter((x) => matchesTab(String(x.type ?? "OTHER"), activeTab)),
    [ownedItems, activeTab]
  );

  const emptyLabel =
    activeTab === "Backpack"
      ? t("outfit.empty.backpack")
      : activeTab === "Avatar"
      ? t("outfit.empty.avatar")
      : t("outfit.empty.party");

  const onPressItem = useCallback(
    async (it: OwnedItem) => {
      const uid = (await AsyncStorage.getItem("gl_user_id"))?.trim() || "";
      if (!uid) {
        Alert.alert(t("common.error"), t("outfit.errors.loginRequired"));
        return;
      }

      const exp = expiryLabel(it.expiresAt);
      const expired = getExpiryState(it.expiresAt).expired;

      const type = String(it.type ?? "OTHER");
      const equipable = isEquipable(type);

      const subtitle = `${type.replace(/_/g, " ")} • ${exp}`;

      if (expired || !equipable) {
        Alert.alert(it.title || t("outfit.labels.item"), subtitle);
        return;
      }

      const actions: any[] = [{ text: t("common.cancel"), style: "cancel" }];

      if (it.isEquipped) {
        actions.unshift({
          text: t("outfit.actions.unequip") || "Unequip",
          style: "destructive",
          onPress: async () => {
            try {
              await unequipType(uid, type);
              await load(true);
            } catch (e: any) {
              Alert.alert(t("common.error"), e?.message || "Unequip failed");
            }
          },
        });
      } else {
        actions.unshift({
          text: t("outfit.actions.equip") || "Equip",
          onPress: async () => {
            try {
              await equipItem(uid, it.id);
              await load(true);
            } catch (e: any) {
              Alert.alert(t("common.error"), e?.message || "Equip failed");
            }
          },
        });
      }

      Alert.alert(it.title || t("outfit.labels.item"), subtitle, actions);
    },
    [load]
  );

  return (
    <SafeAreaView style={styles.full} edges={["top"]}>
      <LinearGradient colors={bg} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </Pressable>

        <View style={{ alignItems: "center" }}>
          <Text style={styles.headerTitle}>{t("outfit.title")}</Text>
          <View style={styles.walletPill}>
            <Ionicons name="logo-bitcoin" size={14} color="rgba(255,255,255,0.9)" />
            <Text style={styles.walletText}>{walletBalance}</Text>
          </View>
        </View>

        <Pressable onPress={() => load(false)} style={styles.headerBtn}>
          <Ionicons name="refresh-outline" size={19} color="rgba(255,255,255,0.92)" />
        </Pressable>
      </View>

      <View style={styles.segment}>
        {(["Backpack", "Avatar", "Party"] as OutfitTab[]).map((tt) => {
          const isActive = tt === activeTab;
          return (
            <Pressable key={tt} onPress={() => setActiveTab(tt)} style={[styles.segBtn, isActive && styles.segBtnActive]}>
              <Ionicons name={TAB_META[tt].icon} size={16} color={isActive ? "#0b1220" : "rgba(255,255,255,0.75)"} />
              <Text style={[styles.segText, isActive && styles.segTextActive]}>{t(TAB_META[tt].labelKey)}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.body}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color="#fff" />
            <Text style={styles.centerText}>{t("outfit.states.loading")}</Text>
          </View>
        ) : errorText ? (
          <View style={styles.center}>
            <Ionicons name="alert-circle-outline" size={22} color="rgba(255,120,120,0.95)" />
            <Text style={[styles.centerText, { textAlign: "center" }]}>{errorText}</Text>

            <Pressable onPress={() => load(false)} style={styles.retryBtn}>
              <Ionicons name="refresh-outline" size={18} color="#fff" />
              <Text style={styles.retryText}>{t("outfit.actions.retry")}</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(it) => it.id}
            numColumns={2}
            columnWrapperStyle={{ gap: 12 }}
            contentContainerStyle={{ paddingBottom: 18, gap: 12 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor="#fff" />}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <View style={styles.emptyIcon}>
                  <Ionicons name={TAB_META[activeTab].icon} size={44} color="rgba(255,255,255,0.92)" />
                </View>
                <Text style={styles.emptyTitle}>{emptyLabel}</Text>
                <Text style={styles.emptySub}>{t("outfit.empty.hint")}</Text>
              </View>
            }
            renderItem={({ item }) => {
              const type = String(item.type ?? "OTHER");

              // ✅ IMPORTANT: prefer relative fields first (avoid localhost full URLs)
              const rawThumb =
                item.thumbnailUrl ||
                item.mediaUrl ||
                item.thumbnailUrlFull ||
                item.mediaUrlFull ||
                null;

              const thumb = resolveUrl(rawThumb);
              const exp = expiryLabel(item.expiresAt);
              const expired = getExpiryState(item.expiresAt).expired;

              const resizeMode = preferContain(type) ? "contain" : "cover";

              return (
                <Pressable onPress={() => onPressItem(item)} style={styles.card}>
                  <View style={styles.thumbWrap}>
                    <LinearGradient colors={["rgba(255,255,255,0.06)", "rgba(0,0,0,0.10)"]} style={StyleSheet.absoluteFill} />

                    {thumb ? (
                      <Image
                        source={{ uri: thumb }}
                        style={styles.thumb}
                        resizeMode={resizeMode}
                        onError={(e) => console.log("IMAGE ERROR:", thumb, e?.nativeEvent)}
                      />
                    ) : (
                      <View style={styles.thumbFallback}>
                        <Ionicons name="image-outline" size={22} color="rgba(255,255,255,0.7)" />
                      </View>
                    )}

                    <View style={[styles.badge, expired && styles.badgeExpired]}>
                      <Text style={styles.badgeText}>{exp}</Text>
                    </View>

                    {item.isEquipped && (
                      <View style={styles.equippedPill}>
                        <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
                        <Text style={styles.equippedText}>{t("outfit.labels.equipped") || "Equipped"}</Text>
                      </View>
                    )}

                    <View style={styles.typeTag}>
                      <Text style={styles.typeText}>{type.replace(/_/g, " ")}</Text>
                    </View>
                  </View>

                  <Text numberOfLines={1} style={styles.itemTitle}>
                    {item.title}
                  </Text>

                  <Text numberOfLines={1} style={styles.itemSub}>
                    {isEquipable(type) ? t("outfit.labels.tapToUse") || "Tap to equip/unequip" : t("outfit.labels.owned")}
                  </Text>
                </Pressable>
              );
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default BackPackScreen;

const styles = StyleSheet.create({
  full: { flex: 1 },
  header: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  headerTitle: { color: "#fff", fontSize: 16, fontWeight: "900" },
  walletPill: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  walletText: { color: "rgba(255,255,255,0.92)", fontWeight: "900", fontSize: 12 },
  segment: {
    marginHorizontal: 12,
    marginTop: 4,
    padding: 6,
    borderRadius: 16,
    flexDirection: "row",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  segBtn: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  segBtnActive: { backgroundColor: "rgba(255,255,255,0.92)" },
  segText: { color: "rgba(255,255,255,0.76)", fontWeight: "900", fontSize: 12 },
  segTextActive: { color: "#0b1220" },
  body: { flex: 1, paddingHorizontal: 12, paddingTop: 14 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, paddingHorizontal: 18 },
  centerText: { color: "rgba(255,255,255,0.78)", fontSize: 12, fontWeight: "800" },
  retryBtn: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  retryText: { color: "#fff", fontWeight: "900", fontSize: 12 },
  card: {
    flex: 1,
    borderRadius: 18,
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  thumbWrap: {
    borderRadius: 14,
    overflow: "hidden",
    height: 132,
    backgroundColor: "rgba(0,0,0,0.22)",
    padding: 10,
  },
  thumb: { width: "100%", height: "100%" },
  thumbFallback: { flex: 1, alignItems: "center", justifyContent: "center" },
  badge: {
    position: "absolute",
    right: 8,
    top: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(11,18,32,0.75)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  badgeExpired: { backgroundColor: "rgba(239,68,68,0.25)", borderColor: "rgba(239,68,68,0.35)" },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "900" },
  equippedPill: {
    position: "absolute",
    left: 8,
    top: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(11,18,32,0.70)",
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.35)",
  },
  equippedText: { color: "#fff", fontSize: 10, fontWeight: "900" },
  typeTag: {
    position: "absolute",
    left: 8,
    bottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(108,77,255,0.22)",
    borderWidth: 1,
    borderColor: "rgba(108,77,255,0.28)",
  },
  typeText: { color: "#fff", fontSize: 10, fontWeight: "900" },
  itemTitle: { marginTop: 10, color: "#fff", fontWeight: "900", fontSize: 12 },
  itemSub: { marginTop: 4, color: "rgba(255,255,255,0.62)", fontWeight: "800", fontSize: 10 },
  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 40, gap: 10 },
  emptyIcon: {
    width: 74,
    height: 74,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(108,77,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(108,77,255,0.25)",
  },
  emptyTitle: { color: "#fff", fontWeight: "900", fontSize: 13 },
  emptySub: {
    color: "rgba(255,255,255,0.65)",
    fontWeight: "700",
    fontSize: 12,
    textAlign: "center",
    maxWidth: 280,
  },
});
