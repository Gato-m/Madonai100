import { useTheme } from "@shopify/restyle";
import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { Theme } from "../theme";

type Props = {
  label: string;
  variant?: keyof Theme["buttonVariants"];
  onPress?: () => void;
};

export function ThemedButton({ label, variant = "primary", onPress }: Props) {
  const theme = useTheme<Theme>();
  const v = theme.buttonVariants[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: theme.colors[v.backgroundColor],
        padding: theme.spacing.m,
        borderRadius: theme.borderRadii.m,
        borderWidth: v.borderWidth ?? 0,
        borderColor: v.borderColor
          ? theme.colors[v.borderColor]
          : "transparent",
      }}
    >
      <Text style={{ color: theme.colors.white, textAlign: "center" }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
