import { useTheme } from "@shopify/restyle";
import React from "react";
import Icon from "react-native-vector-icons/Ionicons";
import { Theme } from "../theme";

type Props = {
  name: string;
  size?: number;
  variant?: keyof Theme["colors"];
};

export function ThemedIcon({ name, size = 24, variant = "text" }: Props) {
  const theme = useTheme<Theme>();

  return <Icon name={name} size={size} color={theme.colors[variant]} />;
}
