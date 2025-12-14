// src/navigation/MainTabsNavigator.tsx
import React, { useEffect, useState } from "react";
import { View, Text, Image } from "react-native";
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

function TabImg({
  source,
  focused,
  size = 26,
}: {
  source: any;
  focused: boolean;
  size?: number;
}) {
  return (
    <Image
      source={source}
      resizeMode="contain"
      style={{
        width: size,
        height: size,
        opacity: focused ? 1 : 0.45,
        transform: [{ scale: focused ? 1.06 : 1 }],
      }}
    />
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
          height: 66,
          paddingTop: 8,
          paddingBottom: 10,
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
          backgroundColor: "#FFFFFF",
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => <TabImg source={ICONS.Home} focused={focused} />,
        }}
      />

      <Tab.Screen
        name="Party"
        component={PartyScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabImg source={ICONS.Party} focused={focused} />,
        }}
      />

      <Tab.Screen
        name="Explore"
        component={ExploreStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => <TabImg source={ICONS.Explore} focused={focused} size={28} />,
        }}
      />

      <Tab.Screen
        name="Chat"
        component={ChatStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ position: "relative" }}>
              <TabImg source={ICONS.Chat} focused={focused} />

              {unreadNotifications > 0 && (
                <View
                  style={{
                    position: "absolute",
                    right: -6,
                    top: -6,
                    minWidth: 16,
                    height: 16,
                    borderRadius: 8,
                    paddingHorizontal: 4,
                    backgroundColor: "#EF4444",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#FFFFFF", fontSize: 10, fontWeight: "800" }} numberOfLines={1}>
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
          tabBarIcon: ({ focused }) => <TabImg source={ICONS.Profile} focused={focused} />,
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
