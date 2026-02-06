// src/screens/AuthScreen.tsx
import React, { useCallback } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { t } from "../i18n";

import AuthButton from "../components/AuthButton";
import { useGoogleSignIn } from "../auth/googleSignIn";

// If you have API_BASE_URL in ../config, use it later for backend exchange
// import { API_BASE_URL } from "../config";

const AuthScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const onGoogleIdToken = useCallback(async (idToken: string) => {
    // ✅ Here you will call your backend later:
    // const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ idToken }),
    // });
    // const data = await res.json();
    // if (!res.ok) throw new Error(data?.error || "Google login failed");
    // Save token + user in AsyncStorage and navigate.

    Alert.alert("Success", "Google login success (now connect backend).");
  }, []);

  const google = useGoogleSignIn({ onIdToken: onGoogleIdToken });

  const onFacebookPress = () => {
    Alert.alert(
      "Next step",
      "Facebook login needs Meta App setup + OAuth flow. We’ll do it after Google is done."
    );
  };

  const onTikTokPress = () => {
    Alert.alert(
      "Next step",
      "TikTok login needs TikTok developer app + backend token exchange."
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-4 pt-3 pb-2">
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </Pressable>

        <Text className="flex-1 text-center text-[16px] font-semibold text-[#111827]">
          {t("auth.title")}
        </Text>

        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top gradient card */}
        <LinearGradient
          colors={["#A855F7", "#6366F1"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            marginHorizontal: 16,
            marginTop: 12,
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingVertical: 16,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View className="flex-1">
            <Text className="text-[14px] font-semibold text-white">
              {t("auth.card.title")}
            </Text>
            <Text className="mt-1 text-[12px] text-indigo-100">
              {t("auth.card.subtitle")}
            </Text>
          </View>
          <MaterialCommunityIcons name="check-decagram" size={40} color="#FACC15" />
        </LinearGradient>

        {/* Cards */}
        <View className="mt-4 px-4 space-y-3">
          <AuthRow
            title={t("auth.rows.faceAuthTitle")}
            description={t("auth.rows.faceAuthDesc")}
            buttonLabel={t("auth.rows.faceAuthBtn")}
            onPress={() => navigation.navigate("RealPersonAuth" as never)}
          />

          <AuthRow
            title={t("auth.rows.bindPhoneTitle")}
            description={t("auth.rows.bindPhoneDesc")}
            buttonLabel={t("auth.rows.bindPhoneBtn")}
            onPress={() => navigation.navigate("BindPhone" as never)}
          />
        </View>

        {/* Social login */}
        <View className="mt-6 px-4">
          <Text className="mb-3 text-center text-[12px] text-gray-500">
            Or continue with
          </Text>

          <AuthButton
            provider="google"
            label={google.loading ? "Connecting…" : "Continue with Google"}
            onPress={google.signIn}
            disabled={!google.requestReady || google.loading}
          />

          <AuthButton
            provider="facebook"
            label="Continue with Facebook"
            onPress={onFacebookPress}
            disabled={google.loading}
          />

          <AuthButton
            provider="tiktok"
            label="Continue with TikTok"
            onPress={onTikTokPress}
            disabled={google.loading}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const AuthRow: React.FC<{
  title: string;
  description: string;
  buttonLabel: string;
  onPress?: () => void;
}> = ({ title, description, buttonLabel, onPress }) => (
  <Pressable
    onPress={onPress}
    className="rounded-2xl bg-white px-4 py-3 flex-row items-center justify-between"
  >
    <View className="flex-1 mr-3">
      <Text className="text-[14px] font-semibold text-[#111827]">{title}</Text>
      <Text className="mt-1 text-[12px] text-gray-500">{description}</Text>
    </View>
    <View className="px-4 py-1.5 rounded-full bg-[#6366F1]">
      <Text className="text-[12px] font-semibold text-white">{buttonLabel}</Text>
    </View>
  </Pressable>
);

export default AuthScreen;
