import { useTheme } from "@shopify/restyle";
import React from "react";
import { View, ViewProps } from "react-native";
import { Theme } from "../theme";

export function ThemedCard({ style, ...rest }: ViewProps) {
  const theme = useTheme<Theme>();

  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.primary,
          padding: theme.spacing.m,
          borderRadius: theme.borderRadii.m,
        },
        style,
      ]}
      {...rest}
    />
  );
}
