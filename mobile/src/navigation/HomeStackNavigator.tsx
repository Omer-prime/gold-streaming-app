// src/navigation/HomeStackNavigator.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeFeedScreen from "../screens/HomeFeedScreen";
import HotTopicsScreen from "../screens/HotTopicsScreen";
import TopicDetailScreen from "../screens/TopicDetailScreen";
import VisitProfileScreen from "../screens/VisitProfileScreen";

export type HomeStackParamList = {
  HomeFeed: undefined;
  HotTopics: undefined;
  VisitProfile: { userId: string };
  TopicDetail: { topicId: string; topicTitle: string };
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* main home feed (Following / Square / Video tabs) */}
      <Stack.Screen name="HomeFeed" component={HomeFeedScreen} />

      {/* hot topics list (More >) */}
      <Stack.Screen name="HotTopics" component={HotTopicsScreen} />
      <Stack.Screen name="VisitProfile" component={VisitProfileScreen} />
      

      {/* single topic feed screen */}
      <Stack.Screen name="TopicDetail" component={TopicDetailScreen} />
    </Stack.Navigator>
  );
};

export default HomeStackNavigator;
