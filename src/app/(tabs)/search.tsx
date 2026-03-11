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

export default function DemoScreen() {
  const { mode, toggle } = useThemeMode();
  const theme = useTheme<Theme>();

  const colorKeys = Object.keys(theme.colors) as (keyof Theme["colors"])[];

  return (
    <ThemedView style={{ padding: 20 }}>
      {/* HEADER */}
      <ThemedHeader>Demo UI Showcase</ThemedHeader>

      <ThemedSpacer size="l" />

      {/* TEXT */}

      <ThemedSpacer size="m" />

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
        <ThemedButton label="Saglabāt" variant="accent" onPress={() => {}} />
      </ThemedCard>

      <ThemedSpacer size="l" />

      <ThemedSpacer size="xl" />
    </ThemedView>
  );
}
