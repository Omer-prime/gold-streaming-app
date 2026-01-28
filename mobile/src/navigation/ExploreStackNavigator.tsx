import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ExploreScreen from "../screens/ExploreScreen";
import LiveApplicationScreen from "../screens/LiveApplicationScreen";
import HostLiveRoomScreen from "../screens/HostLiveRoomScreen";
import LiveRoomScreen from "../screens/LiveRoomScreen";

import RealPersonAuthScreen from "../screens/RealPersonAuthScreen";
import FaceScanScreen from "../screens/FaceScanScreen";

export type ExploreStackParamList = {
  ExploreMain: undefined;
  LiveApplication: undefined;

  RealPersonAuth: undefined;
  FaceScan: undefined;

  HostLiveRoom: undefined;
  LiveRoom: {
    streamId: string;
    hostId: string;
    displayName: string;
    avatarUrl: string | null;
  };
};

const Stack = createNativeStackNavigator<ExploreStackParamList>();

export default function ExploreStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ExploreMain" component={ExploreScreen} />
      <Stack.Screen name="LiveApplication" component={LiveApplicationScreen} />

      <Stack.Screen name="RealPersonAuth" component={RealPersonAuthScreen} />
      <Stack.Screen name="FaceScan" component={FaceScanScreen} />

      <Stack.Screen name="HostLiveRoom" component={HostLiveRoomScreen} />
      <Stack.Screen name="LiveRoom" component={LiveRoomScreen} />
    </Stack.Navigator>
  );
}
