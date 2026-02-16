import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "../navigation/ProfileStackNavigator";
import { t } from "../i18n";

type Nav = NativeStackNavigationProp<ProfileStackParamList, "TermsOfService">;

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View className="mt-5">
    <Text className="text-[15px] font-semibold text-[#111827]">{title}</Text>
    <View className="mt-2 space-y-2">{children}</View>
  </View>
);

const P = ({ children }: { children: React.ReactNode }) => (
  <Text className="text-[13px] leading-5 text-[#374151]">{children}</Text>
);

const TermsOfServiceScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-row items-center px-4 pt-3 pb-2 border-b border-gray-100">
        <Pressable onPress={() => navigation.goBack()} className="mr-3 h-9 w-9 items-center justify-center rounded-full">
          <Ionicons name="chevron-back" size={20} color="#111827" />
        </Pressable>
        <Text className="text-[18px] font-semibold text-[#111827]">
          {t("legalDocs.terms.title")}
        </Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32, paddingHorizontal: 16 }} showsVerticalScrollIndicator={false}>
        <Text className="mt-5 text-[13px] leading-5 text-[#374151]">
          {t("legalDocs.terms.intro")}
        </Text>

        <Section title={t("legalDocs.terms.sections.eligibility.title")}>
          <P>{t("legalDocs.terms.sections.eligibility.p1")}</P>
        </Section>

        <Section title={t("legalDocs.terms.sections.account.title")}>
          <P>{t("legalDocs.terms.sections.account.p1")}</P>
          <P>{t("legalDocs.terms.sections.account.p2")}</P>
        </Section>

        <Section title={t("legalDocs.terms.sections.userContent.title")}>
          <P>{t("legalDocs.terms.sections.userContent.p1")}</P>
          <P>{t("legalDocs.terms.sections.userContent.p2")}</P>
        </Section>

        <Section title={t("legalDocs.terms.sections.purchases.title")}>
          <P>{t("legalDocs.terms.sections.purchases.p1")}</P>
          <P>{t("legalDocs.terms.sections.purchases.p2")}</P>
        </Section>

        <Section title={t("legalDocs.terms.sections.enforcement.title")}>
          <P>{t("legalDocs.terms.sections.enforcement.p1")}</P>
          <P>{t("legalDocs.terms.sections.enforcement.p2")}</P>
        </Section>

        <Section title={t("legalDocs.terms.sections.changes.title")}>
          <P>{t("legalDocs.terms.sections.changes.p1")}</P>
        </Section>

        <Section title={t("legalDocs.terms.sections.contact.title")}>
          <P>{t("legalDocs.terms.sections.contact.p1")}</P>
        </Section>

        <Text className="mt-6 text-[12px] text-[#6B7280]">
          {t("legalDocs.common.lastUpdated")}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TermsOfServiceScreen;