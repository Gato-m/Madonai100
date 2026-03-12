import { useTheme } from "@shopify/restyle";
import React from "react";
import { Pressable, PressableProps } from "react-native";
import { Theme } from "../theme";

export function ThemedCard({ style, ...rest }: PressableProps) {
  const theme = useTheme<Theme>();

  return (
    <Pressable
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
