import React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

const MyAgencyScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-4 pt-3 pb-2">
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </Pressable>
        <Text className="flex-1 text-center text-[16px] font-semibold text-[#111827]">
          My Agency
        </Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <LinearGradient
          colors={["#A855F7", "#6366F1"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            marginHorizontal: 16,
            marginTop: 12,
            borderRadius: 24,
            paddingHorizontal: 16,
            paddingVertical: 20,
          }}
        >
          <Text className="text-[18px] font-bold text-white">
            Choose Method 1 or Method 2
          </Text>
          <Text className="mt-2 text-[12px] text-indigo-100">
            Join an existing agency or wait for an invitation from your agent.
          </Text>
        </LinearGradient>

        {/* Method 1 */}
        <View className="mt-4 px-4">
          <View className="rounded-3xl bg-white px-4 py-4 mb-4">
            <Text className="text-center text-[13px] font-semibold text-[#F97316] mb-2">
              Method 1
            </Text>
            <Text className="text-[15px] font-semibold text-[#111827] mb-1 text-center">
              Join agent
            </Text>
            <Text className="text-[12px] text-gray-500 text-center mb-3">
              Agent ID will be provided by your agent.
            </Text>
            <TextInput
              placeholder="Please enter agent's ID"
              placeholderTextColor="#9CA3AF"
              className="rounded-full border border-gray-200 px-4 py-2 text-[13px] text-[#111827]"
            />
            <Pressable className="mt-3 rounded-full bg-[#6366F1] py-2">
              <Text className="text-center text-[14px] font-semibold text-white">
                Please enter agent's ID
              </Text>
            </Pressable>
          </View>

          {/* Method 2 */}
          <View className="rounded-3xl bg-white px-4 py-4 mb-4">
            <Text className="text-center text-[13px] font-semibold text-[#F97316] mb-2">
              Method 2
            </Text>
            <Text className="text-[15px] font-semibold text-[#111827] mb-1 text-center">
              Waiting for agent invitation
            </Text>
            <Text className="text-[12px] text-gray-500 text-center mb-3">
              Share your ID and host code with your agent to receive an
              invitation.
            </Text>

            <View className="rounded-2xl bg-[#FEFCE8] px-4 py-3 space-y-2">
              <Text className="text-[13px] text-[#854D0E]">
                User ID: <Text className="font-semibold">68975261</Text>
              </Text>
              <Text className="text-[13px] text-[#854D0E]">
                Host Code: No. <Text className="font-semibold">32ldvc</Text>
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyAgencyScreen;
