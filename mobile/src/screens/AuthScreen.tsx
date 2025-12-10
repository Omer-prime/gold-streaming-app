// src/screens/AuthScreen.tsx
import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

const AuthScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-4 pt-3 pb-2">
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </Pressable>
        <Text className="flex-1 text-center text-[16px] font-semibold text-[#111827]">
          Auth
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
              My authentication
            </Text>
            <Text className="mt-1 text-[12px] text-indigo-100">
              In order to ensure the safety of your account and assets,
              we recommend you to authenticate.
            </Text>
          </View>
          <MaterialCommunityIcons
            name="check-decagram"
            size={40}
            color="#FACC15"
          />
        </LinearGradient>

        {/* Cards */}
        <View className="mt-4 px-4 space-y-3">
          {/* 👉 Face Authentication -> Real-person intro screen */}
          <AuthRow
            title="Face Authentication"
            description="Please complete authentication process first."
            buttonLabel="Go"
            onPress={() => navigation.navigate("RealPersonAuth" as never)}
          />

          {/* 👉 Bind phone -> existing BindPhone route */}
          <AuthRow
            title="Bind a phone"
            description="Bind your phone to secure your account."
            buttonLabel="Bind"
            onPress={() => navigation.navigate("BindPhone" as never)}
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
      <Text className="text-[14px] font-semibold text-[#111827]">
        {title}
      </Text>
      <Text className="mt-1 text-[12px] text-gray-500">{description}</Text>
    </View>
    <View className="px-4 py-1.5 rounded-full bg-[#6366F1]">
      <Text className="text-[12px] font-semibold text-white">
        {buttonLabel}
      </Text>
    </View>
  </Pressable>
);

export default AuthScreen;
