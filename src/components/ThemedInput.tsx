import { useTheme } from "@shopify/restyle";
import React from "react";
import { TextInput, TextInputProps } from "react-native";
import { Theme } from "../theme";

export function ThemedInput({ style, ...rest }: TextInputProps) {
  const theme = useTheme<Theme>();

  return (
    <TextInput
      placeholderTextColor={theme.colors.gray400}
      style={[
        {
          backgroundColor: theme.colors.gray200,
          color: theme.colors.text,
          padding: theme.spacing.m,
          borderRadius: theme.borderRadii.m,
        },
        style,
      ]}
      {...rest}
    />
  );
}
