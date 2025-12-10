// src/screens/CompleteProfileScreen.tsx
import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  Pressable,
  Image,
  Platform,
  Modal,
  ActivityIndicator,
  Alert,
  ScrollView as RNScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootNavigator";

import TextField from "../components/TextField";
import GenderToggle, { Gender } from "../components/GenderToggle";
import AsyncStorage from "@react-native-async-storage/async-storage";

// @ts-ignore
import KidsImage from "../../assets/image.png";
// @ts-ignore
import ProfileBg from "../../assets/profilebg.png";

type Nav = NativeStackNavigationProp<RootStackParamList, "CompleteProfile">;

type CountryOption = {
  id: number;
  code: string;
  name: string;
  flagEmoji?: string | null;
};

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://192.168.10.25:3000";

const USER_ID_KEY = "gl_user_id";
const PROFILE_COMPLETED_KEY = "gl_profile_completed";

const CompleteProfileScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();

  const [nickname, setNickname] = useState("");
  const [dob, setDob] = useState<Date | null>(null);
  const [showDobPicker, setShowDobPicker] = useState(false);

  const [gender, setGender] = useState<Gender | null>(null);
  const [inviter, setInviter] = useState("");

  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [country, setCountry] = useState<CountryOption | null>(null);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [countryModalVisible, setCountryModalVisible] = useState(false);

  const [authUserId, setAuthUserId] = useState<string | null>(null);

  const formattedDob = dob
    ? dob.toISOString().slice(0, 10)
    : "2007-11-01";

  const handleDobChange = (_: any, selected?: Date) => {
    if (Platform.OS === "android") {
      setShowDobPicker(false);
    }
    if (selected) {
      setDob(selected);
    }
  };

  const handleWebDobChange = (value: string) => {
    if (!value) return;
    const d = new Date(value);
    if (!isNaN(d.getTime())) {
      setDob(d);
    }
  };

  const loadCountries = async () => {
    try {
      setCountriesLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/countries`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const json = await res.json();
      const list = (json.countries ?? []) as CountryOption[];
      setCountries(list);
      if (list.length > 0) setCountry(list[0]);
    } catch (error) {
      console.error("loadCountries error", error);
    } finally {
      setCountriesLoading(false);
    }
  };

  useEffect(() => {
    loadCountries();
  }, []);

  useEffect(() => {
    const loadUserId = async () => {
      try {
        const stored = await AsyncStorage.getItem(USER_ID_KEY);
        if (stored) setAuthUserId(stored);
      } catch (e) {
        console.error("Failed to load gl_user_id", e);
      }
    };
    loadUserId();
  }, []);

  const onSubmit = async () => {
    try {
      if (!nickname || !dob || !gender || !country) {
        Alert.alert(
          "Missing information",
          "Please fill nickname, date of birth, gender and country."
        );
        return;
      }

      const payload: any = {
        nickname,
        dob: formattedDob,
        gender,
        inviter,
        countryId: country.id,
      };

      if (authUserId) {
        payload.userId = authUserId;
      }

      const res = await fetch(`${API_BASE_URL}/api/profile/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => null);
        console.log("Profile complete error", errorJson || res.status);
        Alert.alert(
          "Error",
          errorJson?.error || "Could not complete profile, please try again."
        );
        return;
      }

      const json = await res.json();
      const user = json.user;

      if (user?.id) {
        await AsyncStorage.setItem(USER_ID_KEY, String(user.id));
      }

      // ✅ mark profile as completed and go to main app
      await AsyncStorage.setItem(PROFILE_COMPLETED_KEY, "1");

      navigation.reset({
        index: 0,
        routes: [{ name: "MainTabs" as never }],
      });
    } catch (e) {
      console.error("onSubmit error", e);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="bg-white"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO */}
        <View className="relative h-[270px] overflow-hidden bg-white">
          <Image
            source={ProfileBg}
            resizeMode="cover"
            className="absolute inset-0 h-full w-full"
          />

          {/* back arrow */}
          <View className="pt-8 px-4">
            <Pressable
              onPress={() => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                } else {
                  // no screen behind – go to Login instead
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "Login" as never }],
                  });
                }
              }}
              className="h-9 w-9 items-center justify-center rounded-full bg-[rgba(0,0,0,0.35)]"
            >
              <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* white curve overlap */}
          <View className="absolute bottom-[-50px] left-0 right-0 h-[100px] rounded-t-[40px] bg-white" />

          {/* kids illustration */}
          <Image
            source={KidsImage}
            resizeMode="contain"
            className="absolute bottom-[-8px] left-[-6px] h-[170px] w-[220px]"
          />

          {/* GOLD LIVE text */}
          <Text
            style={{
              position: "absolute",
              right: 24,
              bottom: 110,
              color: "#FFFFFF",
              fontWeight: "600",
              letterSpacing: 2,
              fontSize: 12,
              transform: [{ rotate: "-20deg" }],
            }}
          >
            GOLD LIVE
          </Text>
        </View>

        {/* WHITE CARD */}
        <View className="-mt-14 mx-4 rounded-[28px] bg-white px-5 py-6 shadow-lg">
          <Text className="text-[18px] font-bold text-[#111827]">
            Complete personal data
          </Text>
          <Text className="mt-1 text-[13px] text-[#9CA3AF]">
            Let everyone know you better
          </Text>

          <View className="mt-4">
            {/* Nickname */}
            <TextField
              label="Nickname"
              placeholder="Enter your nickname"
              value={nickname}
              onChangeText={setNickname}
            />

            {/* Date of birth */}
            <View className="mt-3">
              <Text className="mb-1 text-[13px] text-[#9CA3AF]">
                Date of birth
              </Text>

              {Platform.OS === "web" ? (
                <View className="rounded-2xl bg-[#F7F7FA] px-4 py-2">
                  <input
                    type="date"
                    value={formattedDob}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleWebDobChange(e.target.value)
                    }
                    style={{
                      width: "100%",
                      border: "none",
                      backgroundColor: "transparent",
                      fontSize: 14,
                      outline: "none",
                      paddingTop: 6,
                      paddingBottom: 6,
                      color: "#111827",
                    }}
                  />
                </View>
              ) : (
                <>
                  <Pressable
                    onPress={() => setShowDobPicker(true)}
                    className="flex-row items-center justify-between rounded-2xl bg-[#F7F7FA] px-4 py-3"
                  >
                    <Text
                      className={`text-[14px] ${dob ? "text-[#111827]" : "text-[#9CA3AF]"
                        }`}
                    >
                      {formattedDob}
                    </Text>
                    <Ionicons
                      name="calendar-outline"
                      size={18}
                      color="#9CA3AF"
                    />
                  </Pressable>

                  {showDobPicker && (
                    <DateTimePicker
                      value={dob ?? new Date(2007, 0, 1)}
                      mode="date"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      maximumDate={new Date()}
                      onChange={handleDobChange}
                    />
                  )}
                </>
              )}
            </View>

            {/* Country */}
            <View className="mt-3">
              <View className="mb-1 flex-row items-baseline justify-between">
                <Text className="text-[13px] text-[#9CA3AF]">Country</Text>
                <Text className="text-[11px] text-[#9CA3AF]">
                  Not to be altered once set
                </Text>
              </View>
              <Pressable
                className="flex-row items-center rounded-xl bg-[#F7F7FA] px-3.5 py-3"
                onPress={() => setCountryModalVisible(true)}
              >
                <View className="mr-3 h-7 w-7 items-center justify-center rounded-full bg-[#E5F4E5]">
                  <Text className="text-[16px]">
                    {country?.flagEmoji ?? "🌍"}
                  </Text>
                </View>
                <Text className="flex-1 text-[14px] text-[#111827]">
                  {country?.name ?? "Select country/region"}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={18}
                  color="rgb(148,163,184)"
                />
              </Pressable>
            </View>

            {/* Gender */}
            <View className="mt-4">
              <View className="mb-1 flex-row items-baseline justify-between">
                <Text className="text-[13px] text-[#9CA3AF]">Gender</Text>
                <Text className="text-[11px] text-[#9CA3AF]">
                  Not to be altered once set
                </Text>
              </View>
              <GenderToggle value={gender} onChange={setGender} />
            </View>

            {/* Inviter */}
            <View className="mt-4">
              <View className="mb-1 flex-row items-baseline justify-between">
                <Text className="text-[13px] text-[#9CA3AF]">Inviter</Text>
                <Text className="text-[11px] text-[#9CA3AF]">
                  Not required
                </Text>
              </View>
              <TextField
                placeholder="Enter inviter ID (optional)"
                value={inviter}
                onChangeText={setInviter}
              />
              <Text className="mt-1 text-[11px] text-[#9CA3AF]">
                Enter the Inviter ID (not required)
              </Text>
            </View>
          </View>

          {/* Complete button */}
          <Pressable
            onPress={onSubmit}
            className="mt-6 items-center rounded-full bg-[#6C4DFF] py-3"
          >
            <Text className="text-[15px] font-semibold text-white">
              Complete
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Country selection modal */}
      <Modal
        visible={countryModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCountryModalVisible(false)}
      >
        <View className="flex-1 bg-[rgba(0,0,0,0.3)] justify-end">
          <View className="max-h-[60%] rounded-t-3xl bg-white px-4 pt-4 pb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-[16px] font-semibold text-[#111827]">
                Select country/region
              </Text>
              <Pressable onPress={() => setCountryModalVisible(false)}>
                <Ionicons name="close" size={22} color="#6B7280" />
              </Pressable>
            </View>

            {countriesLoading ? (
              <View className="py-6 items-center justify-center">
                <ActivityIndicator />
                <Text className="mt-2 text-[12px] text-[#6B7280]">
                  Loading countries...
                </Text>
              </View>
            ) : (
              <RNScrollView style={{ maxHeight: 360 }}>
                {countries.map((c) => (
                  <Pressable
                    key={c.id}
                    onPress={() => {
                      setCountry(c);
                      setCountryModalVisible(false);
                    }}
                    className="flex-row items-center py-2.5"
                  >
                    <View className="mr-3 h-7 w-7 items-center justify-center rounded-full bg-[#F3F4F6]">
                      <Text className="text-[16px]">
                        {c.flagEmoji ?? "🌍"}
                      </Text>
                    </View>
                    <Text className="flex-1 text-[14px] text-[#111827]">
                      {c.name}
                    </Text>
                    {country?.id === c.id && (
                      <Ionicons name="checkmark" size={18} color="#4F46E5" />
                    )}
                  </Pressable>
                ))}
              </RNScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default CompleteProfileScreen;
