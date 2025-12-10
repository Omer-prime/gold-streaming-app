// src/screens/PostMomentScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "../navigation/ProfileStackNavigator";
import { API_BASE_URL } from "../config";

type PostMomentNav = NativeStackNavigationProp<
  ProfileStackParamList,
  "PostMoment"
>;

const recommendedTopics = [
  "#Rocket Host Video Collection",
  "#Outfit Of The Day(OOTD)",
  "#Everyday life",
  "#SHOW YOURSELF",
  "#Topics you are interested in",
  "#The most beautiful travel photos",
  "#Recommend a movie",
  "#My hobby",
];

const PostMomentScreen: React.FC = () => {
  const navigation = useNavigation<PostMomentNav>();
  const [text, setText] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);

  const appendToText = (snippet: string) => {
    setText((prev) => {
      let next =
        prev.trim().length === 0 ? snippet : prev.trimEnd() + " " + snippet;
      if (next.length > 250) next = next.slice(0, 250);
      return next;
    });
  };

  const handleTopicPress = (topic: string) => {
    appendToText(topic);
  };

  const pickFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please allow photo access so you can upload a picture."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets[0]?.uri) {
      setImageUri(result.assets[0].uri);
    }
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please allow camera access so you can take a picture."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets[0]?.uri) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleAddPress = () => {
    Alert.alert("Add photo", "Choose how you want to add a picture", [
      { text: "Camera", onPress: openCamera },
      { text: "Gallery", onPress: pickFromLibrary },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleAddEmoji = () => {
    appendToText("😊");
  };

  const handleMention = () => {
    appendToText("@username");
  };

  const handleVideoPress = () => {
    Alert.alert(
      "Video coming soon",
      "Here you will be able to record or upload short videos for your moment."
    );
  };

  const handlePost = async () => {
    if (posting) return;

    const trimmed = text.trim();

    if (!trimmed && !imageUri) {
      Alert.alert(
        "Nothing to post",
        "Please write something or add a photo before posting."
      );
      return;
    }

    try {
      setPosting(true);
      const userId = await AsyncStorage.getItem("gl_user_id");
      if (!userId) {
        Alert.alert("Not logged in", "Please login again.");
        setPosting(false);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/profile/moments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          text: trimmed || null,
          imageUrl: imageUri ?? null,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        console.log("Post moment error", json || res.status);
        Alert.alert("Error", json?.error || "Failed to post moment.");
        setPosting(false);
        return;
      }

      Alert.alert("Posted", "Your moment is ready in Gold Live feed.");
      navigation.goBack();
    } catch (err) {
      console.error("Post moment error", err);
      Alert.alert("Error", "Network error while posting moment.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3">
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={8}
            className="pr-2"
          >
            <Ionicons name="chevron-back" size={22} color="#111827" />
          </Pressable>
          <Text className="text-[16px] font-semibold text-[#111827]">
            Post moments
          </Text>
          <Pressable
            className="px-3 py-1 rounded-full bg-[#6366F1] flex-row items-center justify-center"
            onPress={handlePost}
            disabled={posting}
          >
            {posting && (
              <ActivityIndicator
                size="small"
                color="#ffffff"
                style={{ marginRight: 6 }}
              />
            )}
            <Text className="text-[13px] text-white font-semibold">
              {posting ? "Posting..." : "Post"}
            </Text>
          </Pressable>
        </View>

        <View className="flex-1">
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 80 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Text + image picker row */}
            <View className="px-4 mt-2">
              <TextInput
                value={text}
                onChangeText={(val) => {
                  if (val.length <= 250) setText(val);
                }}
                placeholder="Say something to record this moment..."
                placeholderTextColor="#9CA3AF"
                multiline
                className="text-[14px] text-[#111827] min-h-[80px]"
              />
              <Text className="text-[11px] text-[#9CA3AF] text-right">
                {text.length}/250
              </Text>

              <View className="mt-4">
                {imageUri ? (
                  <Pressable
                    onPress={handleAddPress}
                    className="h-20 w-20 rounded-md overflow-hidden bg-[#F3F4F6]"
                  >
                    <Image
                      source={{ uri: imageUri }}
                      style={{ width: "100%", height: "100%" }}
                    />
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={handleAddPress}
                    className="h-20 w-20 rounded-md bg-[#F3F4F6] items-center justify-center"
                  >
                    <Ionicons name="add" size={24} color="#9CA3AF" />
                  </Pressable>
                )}
              </View>
            </View>

            {/* Recommended topics */}
            <View className="px-4 mt-5">
              <Text className="text-[13px] text-[#6B7280] mb-2">
                Recommended topics
              </Text>
              <View className="flex-row flex-wrap">
                {recommendedTopics.map((topic) => (
                  <Pressable
                    key={topic}
                    className="px-3 py-1 mr-2 mb-2 rounded-full bg-[#F3F4F6]"
                    onPress={() => handleTopicPress(topic)}
                  >
                    <Text className="text-[11px] text-[#4B5563]">
                      {topic}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Bottom toolbar */}
          <View className="flex-row items-center justify-around border-t border-[#E5E7EB] py-2">
            <ToolbarIcon name="camera-outline" onPress={openCamera} />
            <ToolbarIcon name="videocam-outline" onPress={handleVideoPress} />
            <ToolbarIcon name="happy-outline" onPress={handleAddEmoji} />
            <ToolbarIcon name="at-outline" onPress={handleMention} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const ToolbarIcon: React.FC<{
  name: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}> = ({ name, onPress }) => (
  <Pressable className="p-2" onPress={onPress}>
    <Ionicons name={name} size={22} color="#6B7280" />
  </Pressable>
);

export default PostMomentScreen;
