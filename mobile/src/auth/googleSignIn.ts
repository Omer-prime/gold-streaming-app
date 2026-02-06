// src/auth/googleSignIn.ts
import { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";

WebBrowser.maybeCompleteAuthSession();

type UseGoogleSignInOptions = {
  // Call this after you get idToken successfully
  onIdToken?: (idToken: string) => Promise<void> | void;
};

export function useGoogleSignIn({ onIdToken }: UseGoogleSignInOptions = {}) {
  const [loading, setLoading] = useState(false);

  const redirectUri = useMemo(
    () =>
      makeRedirectUri({
        scheme: "goldlive", // must match app.json -> expo.scheme
      }),
    []
  );

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    redirectUri,
  });

  useEffect(() => {
    (async () => {
      if (!response) return;

      // user cancelled or something else
      if (response.type !== "success") {
        setLoading(false);
        return;
      }

      const idToken = (response.params as any)?.id_token;
      if (!idToken) {
        setLoading(false);
        Alert.alert("Google login failed", "Missing id_token from Google.");
        return;
      }

      try {
        await onIdToken?.(idToken);
      } catch (e: any) {
        Alert.alert("Login error", e?.message ?? "Failed to login with Google.");
      } finally {
        setLoading(false);
      }
    })();
  }, [response, onIdToken]);

  const signIn = async () => {
    try {
      setLoading(true);

      // ✅ No useProxy option here (fixes your TS error)
      const res = await promptAsync();

      // If user cancels, we must reset loading
      if (res.type !== "success") {
        setLoading(false);
      }
    } catch (e: any) {
      setLoading(false);
      Alert.alert("Google login failed", e?.message ?? "Try again.");
    }
  };

  return {
    requestReady: !!request,
    loading,
    disabled: !request || loading,
    signIn,
  };
}
