// src/screens/EmailLoginScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootNavigator";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Nav = NativeStackNavigationProp<RootStackParamList, "EmailLogin">;

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://192.168.10.25:3000";

const AUTH_TOKEN_KEY = "gl_auth_token";
const USER_ID_KEY = "gl_user_id";
const PROFILE_COMPLETED_KEY = "gl_profile_completed";

const EmailLoginScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();

  const [mode, setMode] = useState<"login" | "register">("login");

  // login fields
  const [identifier, setIdentifier] = useState(""); // username OR email

  // register fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async () => {
    // 🔍 normalize inputs before validation + sending to backend
    const trimmedIdentifier = identifier.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (mode === "login") {
      if (!trimmedIdentifier || !trimmedPassword) {
        Alert.alert("Error", "Please fill in username/email and password.");
        return;
      }
    } else {
      // register mode
      if (!trimmedEmail || !trimmedPassword || !trimmedConfirmPassword) {
        Alert.alert(
          "Error",
          "Please fill in email, password and confirm password."
        );
        return;
      }
      if (trimmedPassword !== trimmedConfirmPassword) {
        Alert.alert(
          "Error",
          "Password and confirm password do not match."
        );
        return;
      }
    }

    setLoading(true);
    try {
      const endpoint =
        mode === "login" ? "/api/auth/login" : "/api/auth/register";

      const body =
        mode === "login"
          ? {
              identifier: trimmedIdentifier,
              password: trimmedPassword,
            }
          : {
              // email stored / checked mostly in lowercase
              email: trimmedEmail.toLowerCase(),
              password: trimmedPassword,
            }; // 🔥 username removed – backend now auto-generates

      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      let json: any = null;
      try {
        json = await res.json();
      } catch {
        // if backend sends non-json error
        json = null;
      }

      if (!res.ok) {
        console.log("[EmailLogin] error response:", json || res.status);
        Alert.alert(
          "Error",
          json?.error ??
            `Failed to ${mode === "login" ? "login" : "register"}`
        );
        return;
      }

      // ✅ Save token + user id for persistent login
      if (json?.user?.id) {
        await AsyncStorage.setItem(USER_ID_KEY, String(json.user.id));
      }
      if (json?.token) {
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, String(json.token));
      }

      Alert.alert(
        "Success",
        mode === "login"
          ? `Welcome back ${json.user.username}`
          : `Account created for ${json.user.username}`
      );

      if (mode === "register") {
        // new user -> profile is definitely NOT completed yet
        await AsyncStorage.setItem(PROFILE_COMPLETED_KEY, "0");
        navigation.reset({
          index: 0,
          routes: [{ name: "CompleteProfile" as never }],
        });
      } else {
        // login -> use backend flag to decide where to go
        const serverCompleted = json?.user?.profileCompleted === true;

        await AsyncStorage.setItem(
          PROFILE_COMPLETED_KEY,
          serverCompleted ? "1" : "0"
        );

        navigation.reset({
          index: 0,
          routes: [
            {
              name: (serverCompleted ? "MainTabs" : "CompleteProfile") as never,
            },
          ],
        });
      }
    } catch (err) {
      console.error("[EmailLogin] network error", err);
      Alert.alert("Error", "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background px-6">
      <View className="flex-1 justify-center">
        <Text className="text-2xl font-bold text-text mb-2">
          {mode === "login" ? "Login" : "Create account"}
        </Text>
        <Text className="text-[12px] text-muted mb-4">
          {mode === "login"
            ? "Login using your email or username."
            : "Register with your email and password."}
        </Text>

        {/* mode toggle */}
        <View className="flex-row mb-4 bg-gray-100 rounded-2xl overflow-hidden">
          <Pressable
            className={`flex-1 py-2.5 items-center ${
              mode === "login" ? "bg-primary" : ""
            }`}
            onPress={() => setMode("login")}
          >
            <Text
              className={`text-[13px] ${
                mode === "login" ? "text-white" : "text-text"
              }`}
            >
              Login
            </Text>
          </Pressable>
          <Pressable
            className={`flex-1 py-2.5 items-center ${
              mode === "register" ? "bg-primary" : ""
            }`}
            onPress={() => setMode("register")}
          >
            <Text
              className={`text-[13px] ${
                mode === "register" ? "text-white" : "text-text"
              }`}
            >
              Register
            </Text>
          </Pressable>
        </View>

        {mode === "login" ? (
          <>
            <TextInput
              className="h-12 rounded-xl border border-gray-300 px-3 text-[14px] bg-white mb-3"
              placeholder="Username or email"
              autoCapitalize="none"
              value={identifier}
              onChangeText={setIdentifier}
            />
            <View className="h-12 rounded-xl border border-gray-300 px-3 bg-white mb-3 flex-row items-center">
              <TextInput
                className="flex-1 text-[14px]"
                placeholder="Password"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <Pressable onPress={() => setShowPassword((v) => !v)}>
                <Text className="text-[11px] text-primary font-medium">
                  {showPassword ? "Hide" : "Show"}
                </Text>
              </Pressable>
            </View>
          </>
        ) : (
          <>
            <TextInput
              className="h-12 rounded-xl border border-gray-300 px-3 text-[14px] bg-white mb-3"
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <View className="h-12 rounded-xl border border-gray-300 px-3 bg-white mb-3 flex-row items-center">
              <TextInput
                className="flex-1 text-[14px]"
                placeholder="Password"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <Pressable onPress={() => setShowPassword((v) => !v)}>
                <Text className="text-[11px] text-primary font-medium">
                  {showPassword ? "Hide" : "Show"}
                </Text>
              </Pressable>
            </View>
            <View className="h-12 rounded-xl border border-gray-300 px-3 bg-white mb-3 flex-row items-center">
              <TextInput
                className="flex-1 text-[14px]"
                placeholder="Confirm password"
                secureTextEntry={!showPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>
          </>
        )}

        <Pressable
          onPress={onSubmit}
          disabled={loading}
          className="mt-4 h-12 items-center justify-center rounded-xl bg-primary"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold">
              {mode === "login" ? "Login" : "Create account"}
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default EmailLoginScreen;
