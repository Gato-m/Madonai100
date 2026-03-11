// src/components/ThemedView.tsx
import { useTheme } from "@shopify/restyle";
import React from "react";
import { View, ViewProps } from "react-native";
import { Theme } from "../theme";

export function ThemedView({ style, ...rest }: ViewProps) {
  const theme = useTheme<Theme>();

  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.background,
          flex: 1,
        },
        style,
      ]}
      {...rest}
    />
  );
}
