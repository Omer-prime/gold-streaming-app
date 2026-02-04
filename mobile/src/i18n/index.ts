import { I18n } from "i18n-js";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";

import en from "./translations/en";
import ur from "./translations/ur";
import ar from "./translations/ar";
import pt from "./translations/pt";
import es from "./translations/es";
import zhHant from "./translations/zh-Hant";

export type AppLangCode =
  | "system"
  | "en"
  | "zh-Hant"
  | "vi"
  | "hi"
  | "id"
  | "ar"
  | "ur"
  | "pt"
  | "tr"
  | "bn"
  | "th"
  | "ne"
  | "fr"
  | "es";

const SUPPORTED: AppLangCode[] = [
  "system",
  "en",
  "zh-Hant",
  "vi",
  "hi",
  "id",
  "ar",
  "ur",
  "pt",
  "tr",
  "bn",
  "th",
  "ne",
  "fr",
  "es",
];

const i18n = new I18n({
  en,
  ur,
  ar,
  pt,
  es,

  // ✅ IMPORTANT: the locale key must match i18n.locale exactly
  "zh-Hant": zhHant,

  // (optional) extra aliases if you ever set these locales
  zh: zhHant,
  "zh-TW": zhHant,
  "zh-Hant-TW": zhHant,
});

i18n.enableFallback = true;

function pickSupportedFromLocale(locale: string): AppLangCode {
  const l = (locale || "").replace("_", "-");
  const lower = l.toLowerCase();

  // You only support Traditional Chinese, so route all zh* to zh-Hant
  if (lower.startsWith("zh")) return "zh-Hant";

  const base = lower.split("-")[0];
  if (!base) return "en";

  const map: Record<string, AppLangCode> = {
    en: "en",
    zh: "zh-Hant",
    "zh-Hant": "zh-Hant",
    ar: "ar",
    ur: "ur",
    pt: "pt",
  
    es: "es",
  };

  return map[base] ?? "en";
}

export function resolveEffectiveLanguage(selected: AppLangCode): AppLangCode {
  if (selected !== "system") return selected;

  const locales = Localization.getLocales();
  const locale = Array.isArray(locales) ? locales[0]?.languageTag : "en";
  return pickSupportedFromLocale(locale || "en");
}

export async function loadSavedLanguage(): Promise<AppLangCode> {
  const saved = (await AsyncStorage.getItem("gl_language")) as AppLangCode | null;
  if (saved && SUPPORTED.includes(saved)) return saved;
  return "system";
}

export function applyLanguage(selected: AppLangCode) {
  const effective = resolveEffectiveLanguage(selected);

  // effective is never "system" here, but keeping this is fine
  i18n.locale = effective === "system" ? "en" : effective;

  return effective;
}

export function t(key: string, options?: any) {
  return i18n.t(key, options);
}
