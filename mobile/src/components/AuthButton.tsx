// src/components/AuthButton.tsx
import React from "react";
import { View, Pressable, Text, Image } from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
const GoogleIcon: any = require("../../assets/google.png");

type Provider = "google" | "facebook" | "instagram";

interface AuthButtonProps {
    provider: Provider;
    label: string;
    latest?: boolean;
    onPress?: () => void;
}

const providerIcon = (provider: Provider) => {
    switch (provider) {
        case "google":
            return (
                <Image
                    source={GoogleIcon}
                    className="h-5 w-5"
                    resizeMode="contain"
                />
            );
        //   return <Ionicons name="logo-google" size={20} color="#4285F4" />;
        case "facebook":
            return <Ionicons name="logo-facebook" size={20} color="#1877F2" />;
        case "instagram":
            return <FontAwesome name="instagram" size={20} color="#E4405F" />;
    }
};

const AuthButton: React.FC<AuthButtonProps> = ({
    provider,
    label,
    latest,
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
                onPress={onPress}
                className="flex-row items-center rounded-full border border-gray-200 bg-white px-5 py-3 shadow-sm"
            >
                <View className="w-6 items-center">{providerIcon(provider)}</View>
                <Text className="flex-1 text-center text-[15px] font-semibold text-text">
                    {label}
                </Text>
                {/* spacer */}
                <View className="w-6" />
            </Pressable>
        </View>
    );
};

export default AuthButton;
