// src/navigation/ChatStackNavigator.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ChatListScreen from "../screens/ChatListScreen";
import ChatRoomScreen from "../screens/ChatRoomScreen";
import NotificationsInboxScreen from "../screens/NotificationsInboxScreen";

export type ChatStackParamList = {
  ChatList: undefined;
  ChatRoom: { userId: string; userName: string };
  NotificationsInbox: undefined;
};

const Stack = createNativeStackNavigator<ChatStackParamList>();

const ChatStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator initialRouteName="ChatList" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChatList" component={ChatListScreen} />
      <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
      <Stack.Screen name="NotificationsInbox" component={NotificationsInboxScreen} />
    </Stack.Navigator>
  );
};

export default ChatStackNavigator;
