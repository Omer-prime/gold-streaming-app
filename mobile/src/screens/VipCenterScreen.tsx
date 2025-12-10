// src/screens/VipCenterScreen.tsx
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "../navigation/ProfileStackNavigator";

type Nav = NativeStackNavigationProp<ProfileStackParamList, "VipCenter">;

type VipTierKey = "normal" | "super" | "diamond" | "svip";

type Privilege = {
  label: string;
  value?: string;
  icon: keyof typeof Ionicons.glyphMap;
  locked?: boolean;
};

type TierConfig = {
  title: string;
  price: string;
  priceUnit: "M" | "Y";
  gradient: [string, string];
  accent: string;
  buttonLabel: string;
  privileges: Privilege[];
};

const VIP_TIERS: Record<VipTierKey, TierConfig> = {
  normal: {
    title: "Normal VIP",
    price: "95,000",
    priceUnit: "M",
    gradient: ["#0F172A", "#1D4ED8"],
    accent: "#38BDF8",
    buttonLabel: "Open Normal VIP",
    privileges: [
      { label: "Collect coins", value: "+3,500/d", icon: "star-outline" },
      { label: "Live float tag", value: "+1/d", icon: "chatbubble-ellipses-outline" },
      { label: "Platform speaker", value: "+1/d", icon: "megaphone-outline" },
      { label: "Platform float tag", value: "+1/d", icon: "pricetag-outline" },
      { label: "Higher rank", icon: "trophy-outline" },
      { label: "Number of greetings", value: "30/d", icon: "chatbubble-outline" },
      { label: "Distinguished logo", icon: "ribbon-outline" },
      { label: "Live translation", icon: "language-outline" },
      { label: "Party room crown seat", icon: "cafe-outline" },
      { label: "Privileged gifts", icon: "gift-outline" },
      { label: "Exclusive data card", icon: "card-outline", locked: true },
      { label: "Invisible visitor", icon: "eye-off-outline", locked: true },
    ],
  },
  super: {
    title: "Super VIP",
    price: "450,000",
    priceUnit: "M",
    gradient: ["#7C2D12", "#EA580C"],
    accent: "#FDBA74",
    buttonLabel: "Open Super VIP",
    privileges: [
      { label: "Collect coins", value: "+16,000/d", icon: "star-outline" },
      { label: "Live float tag", value: "+2/d", icon: "chatbubble-ellipses-outline" },
      { label: "Platform speaker", value: "+1/d", icon: "megaphone-outline" },
      { label: "Platform float tag", value: "+1/d", icon: "pricetag-outline" },
      { label: "Higher rank", icon: "trophy-outline" },
      { label: "Number of greetings", value: "99/d", icon: "chatbubble-outline" },
      { label: "Distinguished logo", icon: "ribbon-outline" },
      { label: "Live translation", icon: "language-outline" },
      { label: "Party room crown seat", icon: "cafe-outline" },
      { label: "Privileged gifts", icon: "gift-outline" },
      { label: "Exclusive data card", icon: "card-outline" },
      { label: "Invisible visitor", icon: "eye-off-outline" },
    ],
  },
  diamond: {
    title: "Diamond VIP",
    price: "1,000,000",
    priceUnit: "M",
    gradient: ["#4C1D95", "#7C3AED"],
    accent: "#F9A8FF",
    buttonLabel: "Open Diamond VIP",
    privileges: [
      { label: "Collect coins", value: "+35,000/d", icon: "star-outline" },
      { label: "Live float tag", value: "+3/d", icon: "chatbubble-ellipses-outline" },
      { label: "Platform speaker", value: "+2/d", icon: "megaphone-outline" },
      { label: "Platform float tag", value: "+2/d", icon: "pricetag-outline" },
      { label: "Higher rank", icon: "trophy-outline" },
      { label: "Number of greetings", value: "199/d", icon: "chatbubble-outline" },
      { label: "Distinguished logo", icon: "ribbon-outline" },
      { label: "Live translation", icon: "language-outline" },
      { label: "Party room crown seat", icon: "cafe-outline" },
      { label: "Privileged gifts", icon: "gift-outline" },
      { label: "Exclusive data card", icon: "card-outline" },
      { label: "Invisible visitor", icon: "eye-off-outline" },
    ],
  },
  svip: {
    title: "SVIP",
    price: "12,990,000",
    priceUnit: "Y",
    gradient: ["#450A0A", "#B91C1C"],
    accent: "#FACC15",
    buttonLabel: "Open SVIP",
    privileges: [
      { label: "Collect coins", value: "+35,000/d", icon: "star-outline" },
      { label: "Live float tag", value: "+5/d", icon: "chatbubble-ellipses-outline" },
      { label: "Platform speaker", value: "+2/d", icon: "megaphone-outline" },
      { label: "Platform float tag", value: "+2/d", icon: "pricetag-outline" },
      { label: "Higher rank", icon: "trophy-outline" },
      { label: "Number of greetings", value: "199/d", icon: "chatbubble-outline" },
      { label: "Distinguished logo", icon: "ribbon-outline" },
      { label: "Live translation", icon: "language-outline" },
      { label: "Party room crown seat", icon: "cafe-outline" },
      { label: "Privileged gifts", icon: "gift-outline" },
      { label: "Exclusive data card", icon: "card-outline" },
      { label: "Invisible visitor", icon: "eye-off-outline" },
    ],
  },
};

const TIER_KEYS: VipTierKey[] = ["normal", "super", "diamond", "svip"];
const { width: SCREEN_WIDTH } = Dimensions.get("window");

const VipCenterScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [activeIndex, setActiveIndex] = useState(0);
  const pagerRef = useRef<ScrollView | null>(null);

  const currentTierKey = TIER_KEYS[activeIndex];
  const currentTier = VIP_TIERS[currentTierKey];

  const handleTabPress = (index: number) => {
    setActiveIndex(index);
    pagerRef.current?.scrollTo({
      x: index * SCREEN_WIDTH,
      y: 0,
      animated: true,
    });
  };

  const handleMomentumEnd = (
    e: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const pageIndex = Math.round(
      e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width
    );
    if (pageIndex !== activeIndex) {
      setActiveIndex(pageIndex);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#020617]" edges={["top"]}>
      {/* Header */}
      <View className="px-4 pt-3 pb-2 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => navigation.goBack()}
            className="h-8 w-8 items-center justify-center rounded-full bg-black/40 mr-2"
          >
            <Ionicons name="chevron-back" size={20} color="#E5E7EB" />
          </Pressable>
          <Text className="text-[16px] font-semibold text-white">
            VIP Center
          </Text>
        </View>
        <Ionicons
          name="shield-checkmark-outline"
          size={20}
          color={currentTier.accent}
        />
      </View>

      {/* Top tabs */}
      <View className="px-4 mt-2 flex-row items-center">
        {TIER_KEYS.map((key, index) => {
          const isActive = index === activeIndex;
          return (
            <Pressable
              key={key}
              onPress={() => handleTabPress(index)}
              className="mr-4 pb-1"
            >
              <Text
                className={`text-[13px] ${
                  isActive ? "text-white font-semibold" : "text-gray-400"
                }`}
              >
                {VIP_TIERS[key].title}
              </Text>
              {isActive && (
                <View className="mt-1 h-[2px] rounded-full bg-[#FDE68A]" />
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Swipeable pager */}
      <ScrollView
        ref={pagerRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumEnd}
        style={{ flex: 1 }}
      >
        {TIER_KEYS.map((key) => (
          <View key={key} style={{ width: SCREEN_WIDTH }}>
            <VipTierPage tierKey={key} />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

/* One page per tier */
const VipTierPage: React.FC<{ tierKey: VipTierKey }> = ({ tierKey }) => {
  const tier = VIP_TIERS[tierKey];
  const unlocked = tier.privileges.filter((p) => !p.locked).length;
  const total = tier.privileges.length;

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
    >
      {/* Big medal + price card */}
      <LinearGradient
        colors={tier.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          marginHorizontal: 16,
          marginTop: 12,
          borderRadius: 24,
          paddingVertical: 16,
          paddingHorizontal: 16,
        }}
      >
        <View className="items-center">
          <View className="h-28 w-28 rounded-full bg-white/10 items-center justify-center mb-3">
            <Ionicons name="diamond-outline" size={52} color={tier.accent} />
          </View>
          <Text className="text-[12px] text-white/80">{tier.title}</Text>
          <View className="mt-1 flex-row items-center">
            <Ionicons name="cash-outline" size={18} color="#FDE68A" />
            <Text className="ml-1 text-[20px] font-extrabold text-[#FEFCE8]">
              {tier.price}
            </Text>
            <Text className="ml-1 text-[12px] text-[#E0E7FF]">
              /{tier.priceUnit}
            </Text>
          </View>
          <Text className="mt-1 text-[11px] text-[#E0E7FF]">
            Get VIP & Enjoy Privileges
          </Text>
        </View>
      </LinearGradient>

      {/* Privileges grid */}
      <View className="mt-6 px-4">
        <Text className="text-[12px] text-gray-200 mb-3">
          VIP exclusive privileges {unlocked}/{total}
        </Text>

        <View className="flex-row flex-wrap -mx-1.5">
          {tier.privileges.map((p) => {
            const locked = p.locked;
            return (
              <View key={p.label} className="w-1/3 px-1.5 pb-3">
                <View
                  className={`rounded-2xl px-3 py-3 ${
                    locked ? "bg:white/5" : "bg-white/10"
                  }`}
                  style={{ backgroundColor: locked ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.10)" }}
                >
                  <View
                    className="h-8 w-8 rounded-full items-center justify-center mb-2"
                    style={{
                      backgroundColor: locked ? "rgba(0,0,0,0.40)" : "rgba(0,0,0,0.30)",
                    }}
                  >
                    <Ionicons
                      name={p.icon}
                      size={18}
                      color={locked ? "#9CA3AF" : tier.accent}
                    />
                  </View>
                  <Text
                    className={`text-[11px] font-semibold ${
                      locked ? "text-gray-400" : "text-white"
                    }`}
                    numberOfLines={2}
                  >
                    {p.label}
                  </Text>
                  {p.value && (
                    <Text
                      className={`mt-1 text-[10px] ${
                        locked ? "text-gray-500" : "text-[#FDE68A]"
                      }`}
                    >
                      {p.value}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* CTA button */}
      <View className="px-4 mt-4">
        <LinearGradient
          colors={tier.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            borderRadius: 999,
            paddingVertical: 12,
          }}
        >
          <Text className="text-center text-[15px] font-semibold text-white">
            {tier.buttonLabel}
          </Text>
        </LinearGradient>
      </View>
    </ScrollView>
  );
};

export default VipCenterScreen;
