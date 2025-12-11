// src/navigation/MainTabsNavigator.tsx
import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import type { NavigatorScreenParams } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import ChatStackNavigator from "./ChatStackNavigator";
import ProfileStackNavigator from "./ProfileStackNavigator";
import type { ProfileStackParamList } from "./ProfileStackNavigator";
import PartyScreen from "../screens/PartyScreen";
import ExploreStackNavigator from "./ExploreStackNavigator";
import { API_BASE_URL } from "../config";

// 🆕 import Home stack
import HomeStackNavigator, {
  type HomeStackParamList,
} from "./HomeStackNavigator";

type MainTabsParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>;
  Party: undefined;
  Explore: undefined;
  Chat: undefined;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

const Tab = createBottomTabNavigator<MainTabsParamList>();

const MainTabsNavigator: React.FC = () => {
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // 🔔 Poll unread notifications
  useEffect(() => {
    let isMounted = true;

    const loadUnread = async () => {
      try {
        const userId = await AsyncStorage.getItem("gl_user_id");
        if (!userId) return;

        const res = await fetch(
          `${API_BASE_URL}/api/notifications/unread-count?userId=${encodeURIComponent(
            userId
          )}`
        );
        if (!res.ok) return;

        const json = await res.json();
        if (!isMounted) return;
        setUnreadNotifications(json.count ?? 0);
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
        tabBarActiveTintColor: "#6C4DFF",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          height: 64,
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
          backgroundColor: "#FFFFFF",
        },
      }}
    >
      {/* 🏠 HOME (stack) */}
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size ?? 22} color={color} />
          ),
        }}
      />

      {/* 🎉 PARTY LIST */}
      <Tab.Screen
        name="Party"
        component={PartyScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="party-popper"
              size={size ?? 24}
              color={color}
            />
          ),
        }}
      />

      {/* 🔥 Explore (stack) */}
      <Tab.Screen
        name="Explore"
        component={ExploreStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                height: 40,
                width: 40,
                borderRadius: 20,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#6C4DFF",
                opacity: focused ? 1 : 0.7,
              }}
            >
              <Ionicons name="flame" size={22} color="#FFFFFF" />
            </View>
          ),
        }}
      />

      {/* 💬 Chat + 🔔 badge here */}
      <Tab.Screen
        name="Chat"
        component={ChatStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <View style={{ position: "relative" }}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={size ?? 22}
                color={color}
              />
              {unreadNotifications > 0 && (
                <View
                  style={{
                    position: "absolute",
                    right: -2,
                    top: -2,
                    minWidth: 16,
                    height: 16,
                    borderRadius: 8,
                    paddingHorizontal: 3,
                    backgroundColor: "#EF4444",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 10,
                      fontWeight: "600",
                    }}
                    numberOfLines={1}
                  >
                    {unreadNotifications > 99 ? "99+" : unreadNotifications}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: () => {
            navigation.navigate("Chat");

            // when user opens Chat, mark all notifications as read
            (async () => {
              try {
                const userId = await AsyncStorage.getItem("gl_user_id");
                if (!userId) return;

                await fetch(`${API_BASE_URL}/api/notifications`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ userId }),
                });
              } catch (e) {
                console.error(
                  "mark notifications read on Chat tab press error",
                  e
                );
              } finally {
                setUnreadNotifications(0); // optimistically clear badge
              }
            })();
          },
        })}
      />

      {/* 👤 Profile (stack with Settings) */}
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="person-circle-outline"
              size={size ?? 26}
              color={color}
            />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: () => {
            navigation.navigate("Profile", {
              screen: "ProfileMain",
            });
          },
        })}
      />
    </Tab.Navigator>
  );
};

export default MainTabsNavigator;
