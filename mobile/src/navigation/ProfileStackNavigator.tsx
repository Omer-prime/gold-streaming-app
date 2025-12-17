// src/navigation/ProfileStackNavigator.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text } from "react-native";

import ProfileScreen from "../screens/ProfileScreen";
import SettingsScreen from "../screens/SettingsScreen";

import BackpackScreen from "../screens/BackpackScreen";
import AuthScreen from "../screens/AuthScreen";
import MyAgencyScreen from "../screens/MyAgencyScreen";
import LevelScreen from "../screens/LevelScreen";
import FollowUsScreen from "../screens/FollowUsScreen";
import CoinsScreen from "../screens/CoinsScreen";
import PointsScreen from "../screens/PointsScreen";
import LiveDataScreen from "../screens/LiveDataScreen";

// Real feature screens
import HelpScreen from "../screens/HelpScreen";
import RewardScreen from "../screens/RewardScreen";
import RankingScreen from "../screens/RankingScreen";
import StoreScreen from "../screens/StoreScreen";
import InviteScreen from "../screens/InviteScreen";
import GuardianScreen from "../screens/GuardianScreen";
import FanClubScreen from "../screens/FanClubScreen";
import MedalWallScreen from "../screens/MedalWallScreen";

// ⭐ NEW: Fans ranking screen
import FansRankingScreen from "../screens/FansRankingScreen";

// Profile related screens
import MyProfileScreen from "../screens/MyProfileScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import PostMomentScreen from "../screens/PostMomentScreen";

// 🆕 Visit profile (other user)
import VisitProfileScreen from "../screens/VisitProfileScreen";

// 🆕 Moment comments screen
import MomentCommentsScreen from "../screens/MomentCommentsScreen";

// Settings subtree screens
import AccountSecurityScreen from "../screens/AccountSecurityScreen";
import SecurityPasswordScreen from "../screens/SecurityPasswordScreen";
import LanguageSettingScreen from "../screens/LanguageSettingScreen";
import BlacklistScreen from "../screens/BlacklistScreen";
import PrivilegeSettingsScreen from "../screens/PrivilegeSettingsScreen";
import NewMessageNotificationScreen from "../screens/NewMessageNotificationScreen";
import PrivacySettingsScreen from "../screens/PrivacySettingsScreen";
import AboutGoldLiveScreen from "../screens/AboutGoldLiveScreen";

// NEW: account-bind & device
import DeviceManagementScreen from "../screens/DeviceManagementScreen";
import BindPhoneScreen from "../screens/BindPhoneScreen";
import BindEmailScreen from "../screens/BindEmailScreen";
import BindGoogleScreen from "../screens/BindGoogleScreen";
import BindFacebookScreen from "../screens/BindFacebookScreen";
import BindInstagramScreen from "../screens/BindInstagramScreen";
import BindTiktokScreen from "../screens/BindTiktokScreen";
import HonorWallScreen from "../screens/HonorWallScreen";

// ✅ REAL VIP CENTER SCREEN
import VipCenterScreen from "../screens/VipCenterScreen";

// ✅ NEW: Live application screen
import LiveApplicationScreen from "../screens/LiveApplicationScreen";

// ✅ NEW: real-person auth + face scan screens
import RealPersonAuthScreen from "../screens/RealPersonAuthScreen";
import FaceScanScreen from "../screens/FaceScanScreen";

export type ProfileStackParamList = {
  ProfileMain: undefined;
  MyProfile: undefined;
  HonorWall: undefined;
  EditProfile: undefined;
  PostMoment: undefined;

  // 🆕 visiting another user's profile
  VisitProfile: { userId: string };

  // 🆕 comments under a moment
  MomentComments: { momentId: string; ownerName: string };

  Settings: undefined;

  LiveData: undefined;
  Help: undefined;
  MyAgency: undefined;
  Level: undefined;
  Auth: undefined;
  Backpack: undefined;
  FollowUs: undefined;

  VipCenter: undefined;
  Reward: undefined;
  Ranking: undefined;
  Store: undefined;
  Invite: undefined;
  Guardian: undefined;
  FanClub: undefined;
  MedalWall: undefined;

  Coins: undefined;
  Points: undefined;

  // ⭐ NEW: Fans ranking route
  FansRanking: undefined;

  // NEW: host live application
  LiveApplication: undefined;

  // NEW: real-person verification flow
  RealPersonAuth: undefined;
  FaceScan: undefined;
  HostLiveRoom: undefined;

  // settings-related
  AccountSecurity: undefined;
  SecurityPassword: undefined;
  LanguageSetting: undefined;
  Blacklist: undefined;
  PrivilegeSettings: undefined;
  NewMessageNotification: undefined;
  PrivacySettings: undefined;
  AboutGoldLive: undefined;

  // account bind + devices
  DeviceManagement: undefined;
  BindPhone: undefined;
  BindEmail: undefined;
  BindGoogle: undefined;
  BindFacebook: undefined;
  BindInstagram: undefined;
  BindTiktok: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

const ProfileStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleAlign: "center",
        headerShadowVisible: false,
        headerTintColor: "#111827",
        headerStyle: { backgroundColor: "#FFFFFF" },
      }}
    >
      {/* Main profile page */}
      <Stack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />

      {/* Profile detail & editing */}
      <Stack.Screen
        name="MyProfile"
        component={MyProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HonorWall"
        component={HonorWallScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PostMoment"
        component={PostMomentScreen}
        options={{ headerShown: false }}
      />

      {/* 🆕 Visit other user's profile */}
      <Stack.Screen
        name="VisitProfile"
        component={VisitProfileScreen}
        options={{ headerShown: false }}
      />

      {/* 🆕 Moment comments */}
      <Stack.Screen
        name="MomentComments"
        component={MomentCommentsScreen}
        options={{ headerShown: false }}
      />

      {/* Settings main */}
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ headerShown: false }}
      />

      {/* Settings subtree */}
      <Stack.Screen
        name="AccountSecurity"
        component={AccountSecurityScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SecurityPassword"
        component={SecurityPasswordScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LanguageSetting"
        component={LanguageSettingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Blacklist"
        component={BlacklistScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PrivilegeSettings"
        component={PrivilegeSettingsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="NewMessageNotification"
        component={NewMessageNotificationScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PrivacySettings"
        component={PrivacySettingsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AboutGoldLive"
        component={AboutGoldLiveScreen}
        options={{ headerShown: false }}
      />

      {/* Bind / device screens */}
      <Stack.Screen
        name="DeviceManagement"
        component={DeviceManagementScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BindPhone"
        component={BindPhoneScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BindEmail"
        component={BindEmailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BindGoogle"
        component={BindGoogleScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BindFacebook"
        component={BindFacebookScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BindInstagram"
        component={BindInstagramScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BindTiktok"
        component={BindTiktokScreen}
        options={{ headerShown: false }}
      />

      {/* Main list items */}
      <Stack.Screen
        name="LiveData"
        component={LiveDataScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Help"
        component={HelpScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MyAgency"
        component={MyAgencyScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Level"
        component={LevelScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Auth"
        component={AuthScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Backpack"
        component={BackpackScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="FollowUs"
        component={FollowUsScreen}
        options={{ headerShown: false }}
      />

      {/* Coins & Points */}
      <Stack.Screen
        name="Coins"
        component={CoinsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Points"
        component={PointsScreen}
        options={{ headerShown: false }}
      />

      {/* VIP / feature grid items */}
      <Stack.Screen
        name="VipCenter"
        component={VipCenterScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Reward"
        component={RewardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Ranking"
        component={RankingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Store"
        component={StoreScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Invite"
        component={InviteScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Guardian"
        component={GuardianScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="FanClub"
        component={FanClubScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MedalWall"
        component={MedalWallScreen}
        options={{ headerShown: false }}
      />

      {/* ⭐ Fans ranking */}
      <Stack.Screen
        name="FansRanking"
        component={FansRankingScreen}
        options={{ headerShown: false }}
      />

      {/* ⭐ Live application */}
      <Stack.Screen
        name="LiveApplication"
        component={LiveApplicationScreen}
        options={{ headerShown: false }}
      />

      {/* ⭐ Real-person auth + Face scan */}
      <Stack.Screen
        name="RealPersonAuth"
        component={RealPersonAuthScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="FaceScan"
        component={FaceScanScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default ProfileStackNavigator;
