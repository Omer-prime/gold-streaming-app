// src/navigation/RootNavigator.tsx
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

import LoginScreen from "../screens/LoginScreen";
import CompleteProfileScreen from "../screens/CompleteProfileScreen";
import MainTabsNavigator from "./MainTabsNavigator";
import EmailLoginScreen from "../screens/EmailLoginScreen";

export type RootStackParamList = {
  Login: undefined;
  EmailLogin: undefined;
  CompleteProfile: undefined;
  MainTabs: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AUTH_TOKEN_KEY = "gl_auth_token";
const PROFILE_COMPLETED_KEY = "gl_profile_completed";

const RootNavigator: React.FC = () => {
  const [initialRoute, setInitialRoute] =
    useState<keyof RootStackParamList | null>(null);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [[, token], [, profileCompleted]] = await AsyncStorage.multiGet([
          AUTH_TOKEN_KEY,
          PROFILE_COMPLETED_KEY,
        ]);

        if (!token) {
          setInitialRoute("Login");
          return;
        }

        if (profileCompleted === "1") {
          setInitialRoute("MainTabs");
        } else {
          setInitialRoute("CompleteProfile");
        }
      } catch (e) {
        console.log("Auth bootstrap error", e);
        setInitialRoute("Login");
      }
    };

    bootstrap();
  }, []);

  if (!initialRoute) {
    // simple splash while we read storage
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="EmailLogin" component={EmailLoginScreen} />
      <Stack.Screen
        name="CompleteProfile"
        component={CompleteProfileScreen}
      />
      <Stack.Screen name="MainTabs" component={MainTabsNavigator} />
    </Stack.Navigator>
  );
};

export default RootNavigator;
