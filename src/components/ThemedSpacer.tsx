import { useTheme } from "@shopify/restyle";
import React from "react";
import { View } from "react-native";
import { Theme } from "../theme";

type Props = {
  size?: keyof Theme["spacing"];
};

export function ThemedSpacer({ size = "m" }: Props) {
  const theme = useTheme<Theme>();

  return <View style={{ height: theme.spacing[size] }} />;
}
