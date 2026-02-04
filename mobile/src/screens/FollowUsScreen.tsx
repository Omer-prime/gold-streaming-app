import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as WebBrowser from "expo-web-browser";
import { API_BASE_URL } from "../config";
import { t } from "../i18n";

type SocialKey =
  | "facebook"
  | "youtube"
  | "instagram"
  | "tiktok"
  | "telegram"
  | "discord"
  | "x";

type SocialLink = {
  key: SocialKey;
  label?: string;
  icon: keyof typeof Ionicons.glyphMap;
  url: string;
};

type FollowUsApiResponse = {
  brand?: { name?: string; tagline?: string };
  links?: Array<{ key: SocialKey; url: string; label?: string; icon?: string }>;
};

const DEFAULT_LINKS: SocialLink[] = [
  { key: "facebook", icon: "logo-facebook", url: "https://facebook.com" },
  { key: "youtube", icon: "logo-youtube", url: "https://youtube.com" },
];

function getSocialLabel(key: SocialKey) {
  switch (key) {
    case "facebook":
      return t("followUs.social.facebook");
    case "youtube":
      return t("followUs.social.youtube");
    case "instagram":
      return t("followUs.social.instagram");
    case "tiktok":
      return t("followUs.social.tiktok");
    case "telegram":
      return t("followUs.social.telegram");
    case "discord":
      return t("followUs.social.discord");
    case "x":
      return t("followUs.social.x");
    default:
      return t("followUs.social.community");
  }
}

/** ✅ makes backend URLs safe (adds https:// if missing) */
function normalizeUrl(raw: string) {
  let u = String(raw ?? "").trim();
  // remove newlines/spaces (social URLs should never include spaces)
  u = u.replace(/\s+/g, "");
  if (!u) return "";

  // already a scheme? (https:, http:, fb:, youtube:, etc)
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(u)) return u;

  // common backend case: "facebook.com/page" or "www.youtube.com/@x"
  u = u.replace(/^\/+/, "");
  return `https://${u}`;
}

function normalizeLinks(api?: FollowUsApiResponse | null): SocialLink[] {
  const raw = api?.links ?? [];
  const out: SocialLink[] = [];

  for (const x of raw) {
    const key = x?.key;
    const url = normalizeUrl(String(x?.url ?? ""));
    if (!key || !url) continue;

    const icon = (String(x?.icon ?? "").trim() as any) || undefined;

    const fallbackIcon = (() => {
      if (key === "facebook") return "logo-facebook" as const;
      if (key === "youtube") return "logo-youtube" as const;
      if (key === "instagram") return "logo-instagram" as const;
      if (key === "tiktok") return "logo-tiktok" as const;
      if (key === "telegram") return "paper-plane-outline" as const;
      if (key === "discord") return "chatbubbles-outline" as const;
      if (key === "x") return "at-outline" as const;
      return "globe-outline" as const;
    })();

    out.push({
      key,
      label: x?.label ? String(x.label) : undefined,
      icon: (icon as any) || fallbackIcon,
      url,
    });
  }

  return out.length ? out : DEFAULT_LINKS;
}

async function fetchFollowUs(): Promise<FollowUsApiResponse | null> {
  const res = await fetch(`${API_BASE_URL}/api/public/follow-us`);
  const raw = await res.text();
  let json: any = null;
  try {
    json = raw ? JSON.parse(raw) : null;
  } catch {
    json = null;
  }
  if (!res.ok) throw new Error(json?.error || `Failed (${res.status})`);
  return json as FollowUsApiResponse;
}

export default function FollowUsScreen() {
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [links, setLinks] = useState<SocialLink[]>(DEFAULT_LINKS);

  const [brandName, setBrandName] = useState<string | null>(null);
  const [tagline, setTagline] = useState<string | null>(null);

  // DEV-only: shows if backend response actually loaded
  const [usingBackend, setUsingBackend] = useState(false);

  const bg = useMemo(
    () => ["#0b1220", "#0b1220", "rgba(108,77,255,0.18)"] as const,
    []
  );

  const load = useCallback(async (isRefresh = false) => {
    try {
      setErrorText(null);
      isRefresh ? setRefreshing(true) : setLoading(true);

      const data = await fetchFollowUs();
      setLinks(normalizeLinks(data));

      setBrandName(data?.brand?.name ? String(data.brand.name) : null);
      setTagline(data?.brand?.tagline ? String(data.brand.tagline) : null);

      setUsingBackend(true);
    } catch (e) {
      setLinks(DEFAULT_LINKS);
      setUsingBackend(false);
      setErrorText(t("followUs.errors.backendMissing"));
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

  /** ✅ Reliable open: use WebBrowser for http(s), Linking for deep links */
  const open = async (rawUrl: string) => {
    const url = normalizeUrl(rawUrl);

    try {
      if (!url) throw new Error(t("followUs.errors.openFailed"));

      // Web URL → open in browser reliably
      if (/^https?:\/\//i.test(url)) {
        await WebBrowser.openBrowserAsync(url);
        return;
      }

      // App deep link (fb://, youtube:// etc)
      const ok = await Linking.canOpenURL(url);
      if (!ok) throw new Error(t("followUs.errors.cannotOpen"));
      await Linking.openURL(url);
    } catch (e: any) {
      Alert.alert(
        t("followUs.errors.linkTitle"),
        e?.message || t("followUs.errors.openFailed")
      );
    }
  };

  return (
    <SafeAreaView style={styles.full} edges={["top"]}>
      <LinearGradient colors={bg} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </Pressable>

        <Text style={styles.headerTitle}>{t("followUs.title")}</Text>

        <Pressable
          onPress={() => load(true)}
          style={styles.headerBtn}
          disabled={refreshing || loading}
        >
          {refreshing || loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Ionicons
              name="refresh-outline"
              size={19}
              color="rgba(255,255,255,0.92)"
            />
          )}
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={{ paddingHorizontal: 12, marginTop: 10 }}>
          <LinearGradient
            colors={["rgba(255,255,255,0.10)", "rgba(255,255,255,0.05)"]}
            style={styles.heroCard}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>
                {(brandName || t("followUs.brandName"))}{" "}
                {(tagline || t("followUs.tagline"))}
              </Text>
              <Text style={styles.heroSub}>{t("followUs.hero.subtitle")}</Text>

              {__DEV__ && (
                <Text style={[styles.heroSub, { marginTop: 8, opacity: 0.8 }]}>
                  Backend: {usingBackend ? "CONNECTED" : "FALLBACK (DEFAULT LINKS)"}
                </Text>
              )}
            </View>

            <View style={styles.heroIcon}>
              <Ionicons
                name="globe-outline"
                size={44}
                color="rgba(255,255,255,0.92)"
              />
            </View>
          </LinearGradient>

          {errorText && (
            <View style={styles.notice}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color="rgba(255,255,255,0.85)"
              />
              <Text style={styles.noticeText}>{errorText}</Text>
            </View>
          )}
        </View>

        {/* Links */}
        <View style={{ marginTop: 18, paddingHorizontal: 12 }}>
          <Text style={styles.sectionTitle}>{t("followUs.sectionTitle")}</Text>

          <View style={styles.grid}>
            {links.map((it) => {
              const label = it.label ?? getSocialLabel(it.key);
              return (
                <Pressable key={it.key} style={styles.card} onPress={() => open(it.url)}>
                  <View style={styles.cardLeft}>
                    <View style={styles.iconWrap}>
                      <Ionicons name={it.icon} size={20} color="#fff" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{label}</Text>
                      <Text style={styles.cardSub} numberOfLines={1}>
                        {normalizeUrl(it.url).replace(/^https?:\/\//, "")}
                      </Text>
                    </View>
                  </View>

                  <Ionicons
                    name="open-outline"
                    size={18}
                    color="rgba(255,255,255,0.75)"
                  />
                </Pressable>
              );
            })}
          </View>
        </View>

        {loading && (
          <View style={styles.center}>
            <ActivityIndicator color="#fff" />
            <Text style={styles.centerText}>{t("followUs.states.loading")}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

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

  heroCard: {
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  heroTitle: { color: "#fff", fontWeight: "900", fontSize: 16 },
  heroSub: {
    marginTop: 8,
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    lineHeight: 16,
  },

  heroIcon: {
    width: 70,
    height: 70,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(108,77,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(108,77,255,0.25)",
  },

  notice: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  noticeText: {
    flex: 1,
    color: "rgba(255,255,255,0.78)",
    fontSize: 12,
    fontWeight: "700",
  },

  sectionTitle: { color: "#fff", fontWeight: "900", fontSize: 13, marginBottom: 10 },

  grid: { gap: 10 },
  card: {
    borderRadius: 18,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,45,85,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,45,85,0.22)",
  },
  cardTitle: { color: "#fff", fontWeight: "900", fontSize: 13 },
  cardSub: { marginTop: 2, color: "rgba(255,255,255,0.65)", fontWeight: "700", fontSize: 11 },

  center: { marginTop: 16, alignItems: "center", gap: 8 },
  centerText: { color: "rgba(255,255,255,0.75)", fontSize: 12, fontWeight: "800" },
});
