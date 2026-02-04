// src/navigation/MainTabsNavigator.tsx
import React, { useEffect, useState } from "react";
import { View, Text, Image, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { NavigatorScreenParams } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import ChatStackNavigator, { type ChatStackParamList } from "./ChatStackNavigator";
import ProfileStackNavigator, { type ProfileStackParamList } from "./ProfileStackNavigator";
import PartyScreen from "../screens/PartyScreen";
import ExploreStackNavigator from "./ExploreStackNavigator";
import { API_BASE_URL } from "../config";
import HomeStackNavigator, { type HomeStackParamList } from "./HomeStackNavigator";

type MainTabsParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>;
  Party: undefined;
  Explore: undefined;
  Chat: NavigatorScreenParams<ChatStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

const Tab = createBottomTabNavigator<MainTabsParamList>();

const ICONS = {
  Home: require("../../assets/following.png"),
  Party: require("../../assets/party.png"),
  Explore: require("../../assets/explore.png"),
  Chat: require("../../assets/msg.png"),
  Profile: require("../../assets/profil.png"),
};

const DOT = "#2563EB";

function TabIcon({
  source,
  focused,
  size = 34,
}: {
  source: any;
  focused: boolean;
  size?: number;
}) {
  return (
    <View
      style={{
        width: 66,
        height: 56,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
      }}
    >
      <Image
        source={source}
        resizeMode="contain"
        fadeDuration={0}
        style={{
          width: size,
          height: size,
          opacity: focused ? 1 : 0.65, // ✅ active/inactive without tinting the image
          transform: [{ scale: focused ? 1.08 : 1 }],
        }}
      />

      <View
        style={{
          marginTop: 6,
          width: focused ? 18 : 6,
          height: 4,
          borderRadius: 999,
          backgroundColor: focused ? DOT : "transparent",
        }}
      />
    </View>
  );
}

const MainTabsNavigator: React.FC = () => {
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadUnread = async () => {
      try {
        const userId = await AsyncStorage.getItem("gl_user_id");
        if (!userId) {
          if (isMounted) setUnreadNotifications(0);
          return;
        }

        const res = await fetch(
          `${API_BASE_URL}/api/notifications/unread-count?userId=${encodeURIComponent(userId)}`
        );
        if (!res.ok) return;

        const json = await res.json();
        if (!isMounted) return;
        setUnreadNotifications(Number(json?.count ?? 0));
      } catch (e) {
        console.error("Unread notifications count error", e);
      }
    };

    loadUnread();
    const interval = setInterval(loadUnread, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <Tab.Navigator
      initialRouteName="Explore"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          height: Platform.OS === "ios" ? 88 : 76,
          paddingTop: 8,
          paddingBottom: Platform.OS === "ios" ? 24 : 12,
          borderTopWidth: 1,
          borderTopColor: "#F1F5F9",
          backgroundColor: "#FFFFFF",
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon source={ICONS.Home} focused={focused} size={34} />
          ),
        }}
      />

      <Tab.Screen
        name="Party"
        component={PartyScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon source={ICONS.Party} focused={focused} size={34} />
          ),
        }}
      />

      <Tab.Screen
        name="Explore"
        component={ExploreStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon source={ICONS.Explore} focused={focused} size={36} />
          ),
        }}
      />

      <Tab.Screen
        name="Chat"
        component={ChatStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ position: "relative" }}>
              <TabIcon source={ICONS.Chat} focused={focused} size={34} />

              {unreadNotifications > 0 && (
                <View
                  style={{
                    position: "absolute",
                    right: 10,
                    top: 4,
                    minWidth: 18,
                    height: 18,
                    borderRadius: 9,
                    paddingHorizontal: 5,
                    backgroundColor: "#EF4444",
                    justifyContent: "center",
                    alignItems: "center",
                    borderWidth: 2,
                    borderColor: "#FFFFFF",
                  }}
                >
                  <Text style={{ color: "#FFFFFF", fontSize: 10, fontWeight: "800" }}>
                    {unreadNotifications > 99 ? "99+" : unreadNotifications}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate("Chat", { screen: "ChatList" });
          },
        })}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon source={ICONS.Profile} focused={focused} size={34} />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate("Profile", { screen: "ProfileMain" });
          },
        })}
      />
    </Tab.Navigator>
  );
};

export default MainTabsNavigator;
