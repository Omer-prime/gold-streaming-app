// src/screens/LoginScreen.tsx
import React, { useState } from "react";
import { ScrollView, View, Text, Pressable, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import AuthButton from "../components/AuthButton";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootNavigator";
import AsyncStorage from "@react-native-async-storage/async-storage";

// storage keys
const AUTH_TOKEN_KEY = "gl_auth_token";
const PROFILE_COMPLETED_KEY = "gl_profile_completed";

type Nav = NativeStackNavigationProp<RootStackParamList, "Login">;

// @ts-ignore – allow importing jpeg asset in TS
import GoldLiveHero from "../../assets/GoldLive.jpeg";

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [acceptedTos, setAcceptedTos] = useState(false);

  const handleSocialLogin = async () => {
    // later you will replace this with real social auth + token saving.
    // For now we only decide where to go based on profile completion flag.
    const profileCompleted = await AsyncStorage.getItem(PROFILE_COMPLETED_KEY);

    if (profileCompleted === "1") {
      navigation.reset({
        index: 0,
        routes: [{ name: "MainTabs" as never }],
      });
    } else {
      navigation.navigate("CompleteProfile");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="px-6"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-center py-6">
          {/* top headphone */}
          <View className="mb-4 flex-row items-center justify-between">
            <View />
            <Ionicons name="headset-outline" size={24} color="#111827" />
          </View>

          {/* small hero avatar in the middle */}
          <View className="items-center mb-4">
            <View className="h-32 w-32 rounded-3xl overflow-hidden border-4 border-[#FFCF4A] bg-black shadow-md items-center justify-center">
              <Image
                source={GoldLiveHero}
                resizeMode="contain"
                style={{ width: "90%", height: "90%" }}
              />
            </View>
          </View>

          {/* logo + title */}
          <View className="flex-row items-center space-x-4">
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#FFCF4A]">
              <Text className="text-[18px] font-extrabold text-black">GL</Text>
            </View>
            <View>
              <Text className="text-[20px] font-bold text-text">Gold Live</Text>
              <Text className="mt-0.5 text-[13px] text-muted">
                From strangers to friends
              </Text>
            </View>
          </View>

          {/* social buttons */}
          <View className="mt-7">
            <AuthButton
              provider="google"
              label="Login in with Google"
              latest
              onPress={handleSocialLogin}
            />
            <AuthButton
              provider="facebook"
              label="Log in with Facebook"
              onPress={handleSocialLogin}
            />
            <AuthButton
              provider="instagram"
              label="Log in with Instagram"
              onPress={handleSocialLogin}
            />
          </View>

          {/* divider */}
          <View className="mt-8 mb-3 flex-row items-center">
            <View className="h-px flex-1 bg-gray-200" />
            <Text className="mx-3 text-[12px] text-muted">
              More Login Method
            </Text>
            <View className="h-px flex-1 bg-gray-200" />
          </View>

          {/* secondary login methods */}
          <View className="mt-2 flex-row justify-between px-4">
            <CircleIcon>
              <Ionicons name="logo-tiktok" size={20} color="#000" />
            </CircleIcon>
            <CircleIcon>
              <Ionicons
                name="phone-portrait-outline"
                size={20}
                color="#111827"
              />
            </CircleIcon>
            <CircleIcon>
              <FontAwesome5 name="user-alt" size={18} color="#111827" />
            </CircleIcon>
            <CircleIcon onPress={() => navigation.navigate("EmailLogin")}>
              <MaterialIcons name="mail-outline" size={20} color="#EA4335" />
            </CircleIcon>
          </View>

          {/* terms & privacy */}
          <Pressable
            onPress={() => setAcceptedTos((v) => !v)}
            className="mt-8 flex-row items-center"
          >
            <View
              className={`mr-3 h-5 w-5 items-center justify-center rounded-full border ${
                acceptedTos ? "border-primary" : "border-gray-300"
              }`}
            >
              {acceptedTos && (
                <View className="h-2.5 w-2.5 rounded-full bg-primary" />
              )}
            </View>
            <Text className="flex-1 text-[11.5px] text-muted">
              I have read and agreed the{" "}
              <Text className="text-primary underline">
                Gold Live Terms of Service
              </Text>{" "}
              and{" "}
              <Text className="text-primary underline">Privacy Policy</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const CircleIcon: React.FC<{
  children: React.ReactNode;
  onPress?: () => void;
}> = ({ children, onPress }) => (
  <Pressable
    onPress={onPress}
    disabled={!onPress}
    className="h-11 w-11 items-center justify-center rounded-full bg-[#F5F5F5]"
  >
    {children}
  </Pressable>
);

export default LoginScreen;
