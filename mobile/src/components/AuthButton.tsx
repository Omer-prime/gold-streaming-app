// src/components/AuthButton.tsx
import React from "react";
import { View, Pressable, Text, Image } from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";

const GoogleIcon: any = require("../../assets/google.png");

export type Provider = "google" | "facebook" | "tiktok";

export interface AuthButtonProps {
  provider: Provider;
  label: string;
  latest?: boolean;
  disabled?: boolean;
  onPress?: () => void;
}

const providerIcon = (provider: Provider) => {
  switch (provider) {
    case "google":
      return (
        <Image source={GoogleIcon} className="h-5 w-5" resizeMode="contain" />
      );
    case "facebook":
      return <Ionicons name="logo-facebook" size={20} color="#1877F2" />;
    case "tiktok":
      // FontAwesome5 has a tiktok icon in most builds; if yours doesn't,
      // replace with MaterialCommunityIcons "music-note" etc.
      return <FontAwesome5 name="tiktok" size={18} color="#111827" />;
  }
};

const AuthButton: React.FC<AuthButtonProps> = ({
  provider,
  label,
  latest,
  disabled,
  onPress,
}) => {
  return (
    <View className="mb-3">
      {latest && (
        <View className="self-end mr-8 mb-1 rounded-full bg-primary px-3 py-1">
          <Text className="text-[11px] text-white">Latest Login</Text>
        </View>
      )}

      <Pressable
        disabled={!!disabled}
        onPress={disabled ? undefined : onPress}
        className={[
          "flex-row items-center rounded-full border border-gray-200 bg-white px-5 py-3 shadow-sm",
          disabled ? "opacity-50" : "opacity-100",
        ].join(" ")}
      >
        <View className="w-6 items-center">{providerIcon(provider)}</View>

        <Text className="flex-1 text-center text-[15px] font-semibold text-text">
          {label}
        </Text>

        <View className="w-6" />
      </Pressable>
    </View>
  );
};

export default AuthButton;
