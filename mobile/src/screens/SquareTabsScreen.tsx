// src/screens/SquareTabsScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  Image,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

type SquareTopTab = "Following" | "Square" | "Video";

const POSTS = [
  {
    id: 1,
    author: "RASHID 7896",
    countryFlag: "🇵🇰",
    text: "گلابی شاموں میں ارغوانی سا خواب رکھا ہے، تمہاری یادوں نے دل کا رنگ لاجواب رکھا ہے۔",
    minutesAgo: 1,
  },
];

const SquareTabsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SquareTopTab>("Square");
  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts =
    searchQuery.trim().length === 0
      ? POSTS
      : POSTS.filter((post) =>
          post.text.toLowerCase().includes(searchQuery.toLowerCase())
        );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-1">
        {/* HEADER */}
        <View className="bg-white px-4 pt-4 pb-3 border-b border-gray-100">
          {searchMode ? (
            <View className="flex-row items-center bg-gray-100 rounded-full px-3 py-2">
              <Ionicons name="search" size={18} color="#6B7280" />
              <TextInput
                placeholder="Search"
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="flex-1 ml-2 text-[14px] text-black"
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                </Pressable>
              )}
              <Pressable
                onPress={() => {
                  setSearchMode(false);
                  setSearchQuery("");
                }}
              >
                <Text className="ml-3 text-[13px] text-[#6C4DFF]">Cancel</Text>
              </Pressable>
            </View>
          ) : (
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-baseline">
                <TopTabButton
                  label="Following"
                  active={activeTab === "Following"}
                  onPress={() => setActiveTab("Following")}
                />
                <TopTabButton
                  label="Square"
                  active={activeTab === "Square"}
                  onPress={() => setActiveTab("Square")}
                />
                <TopTabButton
                  label="Video"
                  active={activeTab === "Video"}
                  onPress={() => setActiveTab("Video")}
                />
              </View>
              <View className="flex-row items-center">
                <Pressable onPress={() => setSearchMode(true)}>
                  <Ionicons name="search" size={20} color="#111827" />
                </Pressable>
                <Pressable>
                  <Ionicons
                    name="trophy-outline"
                    size={22}
                    color="#F59E0B"
                    style={{ marginLeft: 16 }}
                  />
                </Pressable>
              </View>
            </View>
          )}
        </View>

        {/* TAB CONTENT */}
        {activeTab === "Following" && <FollowingEmptyState />}
        {activeTab === "Square" && (
          <SquareFeedTab posts={filteredPosts} searchActive={searchQuery !== ""} />
        )}
        {activeTab === "Video" && <VideoTab />}
      </View>
    </SafeAreaView>
  );
};

const TopTabButton: React.FC<{
  label: string;
  active: boolean;
  onPress: () => void;
}> = ({ label, active, onPress }) => (
  <Pressable onPress={onPress}>
    <Text
      className={`mr-4 text-[16px] ${
        active ? "text-black font-semibold" : "text-gray-400"
      }`}
    >
      {label}
    </Text>
  </Pressable>
);

/* ---------- Following tab (empty state) ---------- */

const FollowingEmptyState: React.FC = () => (
  <View className="flex-1 items-center justify-center bg-white">
    <Image
      source={require("../../assets/placeholder-image.jpeg")}
      resizeMode="contain"
      style={{ width: 200, height: 200, borderRadius: 24 }}
    />
    <Text className="mt-4 text-[14px] text-gray-500">
      No posts yet. Follow someone to see their updates.
    </Text>
  </View>
);

/* ---------- Square tab (feed) ---------- */

const SquareFeedTab: React.FC<{
  posts: typeof POSTS;
  searchActive: boolean;
}> = ({ posts, searchActive }) => (
  <ScrollView
    showsVerticalScrollIndicator={false}
    contentContainerStyle={{ paddingBottom: 96, paddingTop: 8 }}
  >
    {!searchActive && (
      <>
        {/* Banner */}
        <View className="px-4">
          <View className="h-24 rounded-2xl bg-[#8B5CF6] px-4 justify-center">
            <Text className="text-[13px] text-white font-semibold">
              FAN CLUB TOPIC EVENT
            </Text>
            <Text className="text-[11px] text-purple-100 mt-1">
              12/11/2025 - 18/11/2025 [UTC+8]
            </Text>
          </View>
        </View>

        {/* Topics row */}
        <View className="mt-4 px-4 flex-row items-center justify-between">
          <Text className="text-[14px] font-semibold text-gray-900">
            Topics
          </Text>
          <View className="flex-row items-center">
            <Text className="mr-1 text-[12px] text-gray-500">More</Text>
            <Ionicons name="chevron-forward" size={14} color="#6B7280" />
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 mt-2"
        >
          <TopicCard title="Honor Announcement" hotCount="11496" />
          <TopicCard title="Fan Club Announcement" hotCount="11496" />
        </ScrollView>
      </>
    )}

    {/* Posts list */}
    <View className="mt-4 px-4">
      {posts.map((post) => (
        <View
          key={post.id}
          className="mb-6 rounded-2xl bg-white shadow-sm shadow-black/5 p-4"
        >
          {/* author */}
          <View className="flex-row items-center mb-3">
            <Image
              source={require("../../assets/placeholder-image.jpeg")}
              style={{ width: 40, height: 40, borderRadius: 9999 }}
            />
            <View className="ml-3 flex-1">
              <View className="flex-row items-center">
                <Text className="text-[13px] font-semibold text-gray-900 mr-1">
                  {post.author}
                </Text>
                <Text>{post.countryFlag}</Text>
              </View>
              <Text className="mt-0.5 text-[11px] text-[#EC4899]">Online</Text>
            </View>
          </View>

          {/* text */}
          <Text className="text-[13px] text-gray-800 leading-5">
            {post.text}
          </Text>

          {/* translation image */}
          <Text className="mt-3 text-[12px] text-gray-500">Translation</Text>
          <Image
            source={require("../../assets/placeholder-image.jpeg")}
            resizeMode="cover"
            style={{
              marginTop: 6,
              width: "100%",
              height: 150,
              borderRadius: 16,
            }}
          />

          {/* meta row */}
          <Text className="mt-2 text-[11px] text-gray-400">
            {post.minutesAgo} mins ago
          </Text>

          {/* actions row (gift / like / comment / camera) */}
          <View className="mt-3 flex-row items-center justify-between">
            <Ionicons name="add-circle-outline" size={20} color="#9CA3AF" />
            <Ionicons name="gift-outline" size={20} color="#F97316" />
            <Ionicons name="heart-outline" size={20} color="#9CA3AF" />
            <Ionicons name="chatbubble-outline" size={20} color="#9CA3AF" />
            <Ionicons name="camera-outline" size={20} color="#9CA3AF" />
          </View>
        </View>
      ))}
    </View>
  </ScrollView>
);

const TopicCard: React.FC<{ title: string; hotCount: string }> = ({
  title,
  hotCount,
}) => (
  <View className="mr-3 w-40 rounded-2xl bg-white shadow-sm shadow-black/5 p-2">
    <Image
      source={require("../../assets/placeholder-image.jpeg")}
      resizeMode="cover"
      style={{ width: "100%", height: 70, borderRadius: 16 }}
    />
    <View className="mt-1 flex-row items-center justify-between">
      <Text
        className="flex-1 text-[11px] font-semibold text-gray-900"
        numberOfLines={1}
      >
        {title}
      </Text>
      <View className="ml-1 rounded-full bg-[#EF4444]/10 px-2 py-[1px]">
        <Text className="text-[9px] text-[#EF4444]">HOT</Text>
      </View>
    </View>
    <Text className="mt-0.5 text-[10px] text-gray-400">{hotCount}</Text>
  </View>
);

/* ---------- Video tab ---------- */

const VideoTab: React.FC = () => (
  <View className="flex-1 bg-black">
    <ImageBackground
      source={require("../../assets/placeholder-image.jpeg")}
      resizeMode="cover"
      style={{ flex: 1, justifyContent: "space-between" }}
    >
      {/* top tabs + search icon */}
      <View className="mt-4 px-4 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Text className="mr-4 text-[14px] text-gray-200">Following</Text>
          <Text className="mr-4 text-[14px] text-gray-200">Square</Text>
          <Text className="text-[14px] font-semibold text-white underline">
            Video
          </Text>
        </View>
        <Ionicons name="search" size={20} color="#FFFFFF" />
      </View>

      {/* overlay actions on right side */}
      <View className="mb-16 mr-4 self-end items-center">
        <View className="mb-6 items-center">
          <Ionicons name="gift-outline" size={26} color="#FDBA74" />
          <Text className="mt-1 text-[11px] text-white">Tip</Text>
        </View>
        <View className="mb-6 items-center">
          <Ionicons name="heart-outline" size={26} color="#FFFFFF" />
          <Text className="mt-1 text-[11px] text-white">25K</Text>
        </View>
        <View className="mb-6 items-center">
          <Ionicons name="chatbubble-outline" size={26} color="#FFFFFF" />
          <Text className="mt-1 text-[11px] text-white">1.2K</Text>
        </View>
        <View className="items-center">
          <Ionicons name="share-social-outline" size={26} color="#FFFFFF" />
          <Text className="mt-1 text-[11px] text-white">Share</Text>
        </View>
      </View>
    </ImageBackground>
  </View>
);

export default SquareTabsScreen;
