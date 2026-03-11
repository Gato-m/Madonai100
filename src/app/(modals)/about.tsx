import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { Pressable } from "react-native";

import { useTheme } from "@shopify/restyle";
import React from "react";

import {
  ThemedButton,
  ThemedCard,
  ThemedHeader,
  ThemedIcon,
  ThemedInput,
  ThemedSpacer,
  ThemedText,
  ThemedView,
} from "../../components";
import { useThemeMode } from "../../providers/ThemeProvider";
import { Theme } from "../../theme/theme";

export default function AboutModal() {
  const router = useRouter();
  const { mode, toggle } = useThemeMode();
  const theme = useTheme<Theme>();

  const colorKeys = Object.keys(theme.colors) as (keyof Theme["colors"])[];

  return (
    <>
      <Stack.Screen
        options={{
          title: "About",
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              style={{ paddingHorizontal: 12 }}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={theme.colors.text}
              />
            </Pressable>
          ),
        }}
      />

      <ThemedView style={{ padding: 20 }}>
        {/* HEADER */}
        <ThemedHeader>Demo UI Showcase</ThemedHeader>

        <ThemedSpacer size="l" />

        {/* TEXT */}

        <ThemedSpacer size="m" />

        <ThemedText variant="body">
          Aktīvā tēma: {mode === "light" ? "Light" : "Dark"}
        </ThemedText>

        <ThemedSpacer size="l" />

        {/* CARD */}
        <ThemedCard>
          <ThemedText variant="body">Šis ir ThemedCard</ThemedText>

          <ThemedSpacer size="m" />

          {/* ICON */}
          <ThemedIcon name="person-circle-outline" size={64} variant="accent" />

          <ThemedSpacer size="m" />

          {/* INPUT */}
          <ThemedInput placeholder="Ievadi tekstu..." />

          <ThemedSpacer size="m" />

          {/* BUTTON */}
          <ThemedButton label="Saglabāt" variant="primary" onPress={() => {}} />
        </ThemedCard>

        <ThemedSpacer size="l" />
      </ThemedView>
    </>
  );
}
