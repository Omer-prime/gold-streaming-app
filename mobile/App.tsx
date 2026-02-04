// App.tsx
import "./global.css";
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import RootNavigator from "./src/navigation/RootNavigator";
import { registerGlobals } from "@livekit/react-native";
import { applyLanguage, loadSavedLanguage } from "./src/i18n";

registerGlobals();

export default function App() {
const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const saved = await loadSavedLanguage();
      applyLanguage(saved);
      setReady(true);
    })();
  }, []);

  if (!ready) return null;
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
 null;