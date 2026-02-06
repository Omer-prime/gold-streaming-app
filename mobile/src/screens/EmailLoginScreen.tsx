// src/screens/EmailLoginScreen.tsx
import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootNavigator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

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

  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const title = useMemo(
    () => (mode === "login" ? "Welcome back" : "Create account"),
    [mode]
  );

  const subtitle = useMemo(
    () =>
      mode === "login"
        ? "Login with your email or username"
        : "Register with your email and password",
    [mode]
  );

  const onSubmit = async () => {
    const trimmedIdentifier = identifier.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (mode === "login") {
      if (!trimmedIdentifier || !trimmedPassword) {
        Alert.alert("Error", "Please enter username/email and password.");
        return;
      }
    } else {
      if (!trimmedEmail || !trimmedPassword || !trimmedConfirmPassword) {
        Alert.alert("Error", "Please fill in email, password and confirm password.");
        return;
      }
      if (trimmedPassword !== trimmedConfirmPassword) {
        Alert.alert("Error", "Password and confirm password do not match.");
        return;
      }
    }

    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";

      const body =
        mode === "login"
          ? { identifier: trimmedIdentifier, password: trimmedPassword }
          : { email: trimmedEmail.toLowerCase(), password: trimmedPassword };

      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      let json: any = null;
      try {
        json = await res.json();
      } catch {
        json = null;
      }

      if (!res.ok) {
        console.log("[EmailLogin] error response:", json || res.status);
        Alert.alert(
          "Error",
          json?.error ?? `Failed to ${mode === "login" ? "login" : "register"}`
        );
        return;
      }

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
        await AsyncStorage.setItem(PROFILE_COMPLETED_KEY, "0");
        navigation.reset({
          index: 0,
          routes: [{ name: "CompleteProfile" as never }],
        });
      } else {
        const serverCompleted = json?.user?.profileCompleted === true;
        await AsyncStorage.setItem(PROFILE_COMPLETED_KEY, serverCompleted ? "1" : "0");

        navigation.reset({
          index: 0,
          routes: [
            { name: (serverCompleted ? "MainTabs" : "CompleteProfile") as never },
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
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
        >
          {/* Header */}
          <View className="flex-row items-center px-4 pt-3 pb-2">
            <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
              <Ionicons name="chevron-back" size={22} color="#111827" />
            </Pressable>
            <Text className="flex-1 text-center text-[16px] font-semibold text-[#111827]">
              {mode === "login" ? "Email Login" : "Email Register"}
            </Text>
            <View style={{ width: 22 }} />
          </View>

          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 28 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="px-5 pt-6">
              <Text className="text-[26px] font-extrabold text-[#111827]">
                {title}
              </Text>
              <Text className="mt-1 text-[12px] text-gray-500">{subtitle}</Text>

              {/* Mode toggle */}
              <View className="mt-5 flex-row rounded-2xl bg-gray-100 p-1">
                <Pressable
                  onPress={() => setMode("login")}
                  className={`flex-1 items-center rounded-2xl py-2.5 ${
                    mode === "login" ? "bg-[#6C4DFF]" : "bg-transparent"
                  }`}
                >
                  <Text
                    className={`text-[13px] font-semibold ${
                      mode === "login" ? "text-white" : "text-[#111827]"
                    }`}
                  >
                    Login
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setMode("register")}
                  className={`flex-1 items-center rounded-2xl py-2.5 ${
                    mode === "register" ? "bg-[#6C4DFF]" : "bg-transparent"
                  }`}
                >
                  <Text
                    className={`text-[13px] font-semibold ${
                      mode === "register" ? "text-white" : "text-[#111827]"
                    }`}
                  >
                    Register
                  </Text>
                </Pressable>
              </View>

              {/* Card */}
              <View className="mt-5 rounded-3xl bg-white border border-gray-100 px-4 py-4 shadow-sm">
                {mode === "login" ? (
                  <>
                    {/* Identifier */}
                    <View className="mb-3">
                      <Text className="mb-1 text-[12px] font-semibold text-gray-700">
                        Username / Email
                      </Text>
                      <View className="flex-row items-center rounded-2xl border border-gray-200 bg-white px-3 py-3">
                        <Ionicons name="person-outline" size={18} color="#6B7280" />
                        <TextInput
                          className="ml-2 flex-1 text-[14px] text-[#111827]"
                          placeholder="Enter username or email"
                          placeholderTextColor="#9CA3AF"
                          autoCapitalize="none"
                          autoCorrect={false}
                          keyboardType="email-address"
                          returnKeyType="next"
                          value={identifier}
                          onChangeText={setIdentifier}
                          onSubmitEditing={() => passwordRef.current?.focus()}
                        />
                      </View>
                    </View>

                    {/* Password */}
                    <View className="mb-1">
                      <Text className="mb-1 text-[12px] font-semibold text-gray-700">
                        Password
                      </Text>
                      <View className="flex-row items-center rounded-2xl border border-gray-200 bg-white px-3 py-3">
                        <Ionicons name="lock-closed-outline" size={18} color="#6B7280" />
                        <TextInput
                          ref={passwordRef}
                          className="ml-2 flex-1 text-[14px] text-[#111827]"
                          placeholder="Enter password"
                          placeholderTextColor="#9CA3AF"
                          secureTextEntry={!showPassword}
                          autoCapitalize="none"
                          autoCorrect={false}
                          returnKeyType="done"
                          value={password}
                          onChangeText={setPassword}
                          onSubmitEditing={onSubmit}
                        />
                        <Pressable
                          onPress={() => setShowPassword((v) => !v)}
                          hitSlop={10}
                        >
                          <Ionicons
                            name={showPassword ? "eye-off-outline" : "eye-outline"}
                            size={18}
                            color="#6B7280"
                          />
                        </Pressable>
                      </View>
                    </View>
                  </>
                ) : (
                  <>
                    {/* Email */}
                    <View className="mb-3">
                      <Text className="mb-1 text-[12px] font-semibold text-gray-700">
                        Email
                      </Text>
                      <View className="flex-row items-center rounded-2xl border border-gray-200 bg-white px-3 py-3">
                        <Ionicons name="mail-outline" size={18} color="#6B7280" />
                        <TextInput
                          className="ml-2 flex-1 text-[14px] text-[#111827]"
                          placeholder="Enter your email"
                          placeholderTextColor="#9CA3AF"
                          autoCapitalize="none"
                          autoCorrect={false}
                          keyboardType="email-address"
                          returnKeyType="next"
                          value={email}
                          onChangeText={setEmail}
                          onSubmitEditing={() => passwordRef.current?.focus()}
                        />
                      </View>
                    </View>

                    {/* Password */}
                    <View className="mb-3">
                      <Text className="mb-1 text-[12px] font-semibold text-gray-700">
                        Password
                      </Text>
                      <View className="flex-row items-center rounded-2xl border border-gray-200 bg-white px-3 py-3">
                        <Ionicons name="lock-closed-outline" size={18} color="#6B7280" />
                        <TextInput
                          ref={passwordRef}
                          className="ml-2 flex-1 text-[14px] text-[#111827]"
                          placeholder="Create a password"
                          placeholderTextColor="#9CA3AF"
                          secureTextEntry={!showPassword}
                          autoCapitalize="none"
                          autoCorrect={false}
                          returnKeyType="next"
                          value={password}
                          onChangeText={setPassword}
                          onSubmitEditing={() => confirmRef.current?.focus()}
                        />
                        <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={10}>
                          <Ionicons
                            name={showPassword ? "eye-off-outline" : "eye-outline"}
                            size={18}
                            color="#6B7280"
                          />
                        </Pressable>
                      </View>
                    </View>

                    {/* Confirm */}
                    <View className="mb-1">
                      <Text className="mb-1 text-[12px] font-semibold text-gray-700">
                        Confirm Password
                      </Text>
                      <View className="flex-row items-center rounded-2xl border border-gray-200 bg-white px-3 py-3">
                        <Ionicons name="shield-checkmark-outline" size={18} color="#6B7280" />
                        <TextInput
                          ref={confirmRef}
                          className="ml-2 flex-1 text-[14px] text-[#111827]"
                          placeholder="Re-enter password"
                          placeholderTextColor="#9CA3AF"
                          secureTextEntry={!showPassword}
                          autoCapitalize="none"
                          autoCorrect={false}
                          returnKeyType="done"
                          value={confirmPassword}
                          onChangeText={setConfirmPassword}
                          onSubmitEditing={onSubmit}
                        />
                      </View>
                    </View>
                  </>
                )}

                {/* Submit */}
                <Pressable
                  onPress={onSubmit}
                  disabled={loading}
                  className={`mt-4 h-12 items-center justify-center rounded-2xl ${
                    loading ? "bg-[#6C4DFF]/70" : "bg-[#6C4DFF]"
                  }`}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white font-semibold">
                      {mode === "login" ? "Login" : "Create account"}
                    </Text>
                  )}
                </Pressable>

                {/* Hint */}
                <Text className="mt-3 text-center text-[11px] text-gray-500">
                  By continuing, you agree to our Terms & Privacy Policy.
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default EmailLoginScreen;
