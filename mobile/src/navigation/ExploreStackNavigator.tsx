// src/navigation/ExploreStackNavigator.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ExploreScreen from "../screens/ExploreScreen";
import LiveApplicationScreen from "../screens/LiveApplicationScreen";

export type ExploreStackParamList = {
  ExploreMain: undefined;
  LiveApplication: undefined;
};

const Stack = createNativeStackNavigator<ExploreStackParamList>();

const ExploreStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ExploreMain" component={ExploreScreen} />
      <Stack.Screen name="LiveApplication" component={LiveApplicationScreen} />
    </Stack.Navigator>
  );
};

export default ExploreStackNavigator;
