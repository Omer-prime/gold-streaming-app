// src/screens/EditProfileScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Image,
  Alert,
  TextInput,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "../navigation/ProfileStackNavigator";

type EditProfileNav = NativeStackNavigationProp<
  ProfileStackParamList,
  "EditProfile"
>;

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://192.168.10.25:3000";

type ProfileMeResponse = {
  user: {
    id: string;
    username: string;
    nickname?: string | null;
    avatarUrl?: string | null;
    bio?: string | null;
    dateOfBirth?: string | null;
    gender?: "MALE" | "FEMALE" | "OTHER" | null;
    interestTags: string[];
    profilePhotos: string[];
    country: {
      code: string;
      name: string;
      flagEmoji?: string | null;
    } | null;
    level: number;
    liveLevel: number;
    vipLevel: number;
  };
  wallet: {
    balance: number;
  };
  stats: {
    friends: number;
    following: number;
    followers: number;
    visitors: number;
    points: number;
  };
};

const formatDateYYYYMMDD = (d: Date) => {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const mapGender = (g?: string | null) => {
  if (!g) return "";
  if (g === "MALE") return "Male";
  if (g === "FEMALE") return "Female";
  return "Other";
};

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<EditProfileNav>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileMeResponse | null>(null);

  // editable pieces
  const [nickname, setNickname] = useState("");
  const [dobText, setDobText] = useState(""); // YYYY-MM-DD for display
  const [dobDate, setDobDate] = useState<Date | null>(null);
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [bio, setBio] = useState("");
  const [interestTags, setInterestTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const userId = await AsyncStorage.getItem("gl_user_id");
        if (!userId) {
          setLoading(false);
          Alert.alert("Not logged in", "Please login again.");
          return;
        }

        const res = await fetch(
          `${API_BASE_URL}/api/profile/me?userId=${encodeURIComponent(userId)}`
        );
        if (!res.ok) {
          const json = await res.json().catch(() => null);
          console.log("EditProfile load error", json || res.status);
          Alert.alert("Error", json?.error || "Failed to load profile");
          setLoading(false);
          return;
        }

        const json = (await res.json()) as ProfileMeResponse;
        setProfile(json);

        const u = json.user;
        setNickname(u.nickname || u.username || "");
        setBio(u.bio || "");
        setInterestTags(u.interestTags || []);

        if (u.dateOfBirth) {
          const d = new Date(u.dateOfBirth);
          if (!isNaN(d.getTime())) {
            setDobDate(d);
            setDobText(formatDateYYYYMMDD(d));
          }
        }

        // single avatar source
        const avatar =
          u.avatarUrl || (u.profilePhotos && u.profilePhotos[0]) || null;
        setAvatarUri(avatar);
      } catch (err) {
        console.error("EditProfile load error", err);
        Alert.alert("Error", "Network error while loading profile.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handlePickAvatar = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please allow photo access so you can choose a profile picture."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        const uri = result.assets[0].uri;
        setAvatarUri(uri);
      }
    } catch (err) {
      console.error("pick avatar error", err);
      Alert.alert("Error", "Could not open gallery.");
    }
  };

  const handleDobChange = (
    _event: any,
    selected?: Date | undefined
  ) => {
    if (Platform.OS === "android") {
      setShowDobPicker(false);
    }

    if (selected) {
      setDobDate(selected);
      setDobText(formatDateYYYYMMDD(selected));
    }
  };

  const handleAddTag = () => {
    const trimmed = newTag.trim();
    if (!trimmed) return;

    if (interestTags.includes(trimmed)) {
      Alert.alert("Duplicate tag", "You already added this tag.");
      return;
    }

    setInterestTags((prev) => [...prev, trimmed]);
    setNewTag("");
  };

  const handleRemoveTag = (tag: string) => {
    setInterestTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleSaveProfile = async () => {
    try {
      const userId = await AsyncStorage.getItem("gl_user_id");
      if (!userId) {
        Alert.alert("Not logged in", "Please login again.");
        return;
      }

      // build DOB string from selected date
      const dobToSend = dobDate ? formatDateYYYYMMDD(dobDate) : null;

      const body = {
        userId,
        nickname: nickname.trim(),
        bio: bio.trim(),
        dateOfBirth: dobToSend,
        interestTags,
        profilePhotos: avatarUri ? [avatarUri] : [],
        avatarUrl: avatarUri ?? null,
      };

      setSaving(true);

      const res = await fetch(`${API_BASE_URL}/api/profile/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        console.log("Save profile error", json || res.status);
        Alert.alert("Error", json?.error || "Failed to update profile");
        return;
      }

      // merge back into local profile
      if (json?.user && profile) {
        setProfile({
          ...profile,
          user: {
            ...profile.user,
            ...json.user,
          },
        });
      }

      Alert.alert("Saved", "Profile updated successfully.");
    } catch (err) {
      console.error("Save profile error", err);
      Alert.alert("Error", "Network error while saving profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading && !profile) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
          <Text className="mt-2 text-xs text-gray-500">
            Loading profile data...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const user = profile?.user;
  const displayName =
    nickname || user?.nickname || user?.username || "Someone4582";

  const avatarInitial =
    displayName.trim().length > 0
      ? displayName.trim().charAt(0).toUpperCase()
      : "S";

  const gender = mapGender(user?.gender ?? null);
  const countryName = user?.country?.name || "";

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={8}
            className="pr-2"
          >
            <Ionicons name="chevron-back" size={22} color="#111827" />
          </Pressable>
          <Text className="text-[18px] font-semibold text-[#111827]">
            Edit data
          </Text>
        </View>
        <Pressable
          onPress={handleSaveProfile}
          disabled={saving}
          className="pl-2"
        >
          {saving ? (
            <ActivityIndicator size="small" color="#6366F1" />
          ) : (
            <Text className="text-[13px] text-[#6366F1] font-semibold">
              Save
            </Text>
          )}
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Photo grid */}
        <View className="px-4 mt-2">
          <View className="flex-row">
            <Pressable
              className="flex-1 aspect-square bg-[#9CA3AF] rounded-lg items-center justify-center mr-2 overflow-hidden"
              onPress={handlePickAvatar}
            >
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={{ width: "100%", height: "100%" }}
                />
              ) : (
                <Text className="text-white text-[40px] font-semibold">
                  {avatarInitial}
                </Text>
              )}
            </Pressable>
            <View className="flex-1 justify-between">
              <AddPhotoCell onPress={handlePickAvatar} />
              <AddPhotoCell onPress={handlePickAvatar} />
              <AddPhotoCell onPress={handlePickAvatar} />
            </View>
          </View>
        </View>

        {/* My profile fields */}
        <View className="mt-6 px-4">
          <Text className="text-[14px] font-semibold text-[#111827] mb-2">
            My Profile
          </Text>

          <ProfileField
            label="Nickname"
            value={nickname}
            editable
            onChangeText={setNickname}
            placeholder="Enter nickname"
          />

          <ProfileField
            label="Gender(Male/Female)"
            value={gender || "Not set"}
            helper="[Cannot be modified]"
          />

          {/* Date of Birth with calendar */}
          <View className="py-3 border-b border-[#F3F4F6]">
            <Text className="text-[14px] text-[#111827] mb-1">
              Date of Birth
            </Text>
            <Pressable
              onPress={() => setShowDobPicker(true)}
              className="flex-row items-center justify-between"
            >
              <Text className="text-[13px] text-[#6B7280]">
                {dobText || "Select date"}
              </Text>
              <Ionicons
                name="calendar-outline"
                size={18}
                color="#9CA3AF"
              />
            </Pressable>
          </View>

          <ProfileField
            label={countryName || "Country"}
            value=""
            helper="[Cannot be modified]"
          />

          <ProfileField
            label="Self-introduction"
            value={bio}
            editable
            onChangeText={setBio}
            placeholder="Write something about yourself"
            multiline
          />

          {/* Interest tags */}
          <View className="mt-4">
            <Text className="text-[13px] text-[#374151] mb-2">
              Interest tags
            </Text>

            {/* Existing tags */}
            <View className="flex-row flex-wrap mb-2">
              {interestTags.map((tag) => (
                <Pressable
                  key={tag}
                  onLongPress={() => handleRemoveTag(tag)}
                  className="flex-row items-center px-3 py-1 mr-2 mb-2 rounded-full bg-[#EEF2FF]"
                >
                  <Text className="text-[11px] text-[#4B5563]">
                    #{tag}
                  </Text>
                  <Ionicons
                    name="close-circle-outline"
                    size={16}
                    color="#9CA3AF"
                    style={{ marginLeft: 4 }}
                  />
                </Pressable>
              ))}
              {interestTags.length === 0 && (
                <Text className="text-[11px] text-[#9CA3AF]">
                  No tags yet. Add a few below.
                </Text>
              )}
            </View>

            {/* Add new tag */}
            <View className="flex-row items-center">
              <View className="flex-1 rounded-full border border-[#D1D5DB] bg-[#F9FAFB] px-3 py-1.5 mr-2">
                <TextInput
                  value={newTag}
                  onChangeText={setNewTag}
                  placeholder="Type a tag"
                  placeholderTextColor="#9CA3AF"
                  className="text-[13px] text-[#111827]"
                />
              </View>
              <Pressable
                onPress={handleAddTag}
                className="px-3 py-1.5 rounded-full bg-[#6366F1]"
              >
                <Text className="text-[13px] text-white font-semibold">
                  Add
                </Text>
              </Pressable>
            </View>

            <Text className="mt-1 text-[10px] text-[#9CA3AF]">
              Long press a tag to remove it.
            </Text>
          </View>
        </View>
      </ScrollView>

      {showDobPicker && (
        <DateTimePicker
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          value={dobDate || new Date(2000, 0, 1)}
          maximumDate={new Date()}
          onChange={handleDobChange}
        />
      )}
    </SafeAreaView>
  );
};

const ProfileField: React.FC<{
  label: string;
  value: string;
  helper?: string;
  editable?: boolean;
  multiline?: boolean;
  placeholder?: string;
  onChangeText?: (val: string) => void;
}> = ({
  label,
  value,
  helper,
  editable = false,
  multiline = false,
  placeholder,
  onChangeText,
}) => (
  <View className="py-3 border-b border-[#F3F4F6]">
    <View className="flex-row items-center mb-1">
      <Text className="text-[14px] text-[#111827]">{label}</Text>
      {helper ? (
        <Text className="ml-1 text-[11px] text-[#9CA3AF]">{helper}</Text>
      ) : null}
    </View>
    {editable ? (
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? label}
        placeholderTextColor="#9CA3AF"
        className="text-[13px] text-[#6B7280] py-1"
        multiline={multiline}
      />
    ) : value ? (
      <Text className="text-[13px] text-[#6B7280]">{value}</Text>
    ) : null}
  </View>
);

const AddPhotoCell: React.FC<{
  onPress?: () => void;
}> = ({ onPress }) => (
  <Pressable
    className="flex-1 aspect-[3/2] bg-[#F3F4F6] rounded-lg items-center justify-center mb-2 overflow-hidden"
    onPress={onPress}
  >
    <Ionicons name="add" size={24} color="#9CA3AF" />
  </Pressable>
);

export default EditProfileScreen;
