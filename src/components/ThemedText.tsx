import { useTheme } from "@shopify/restyle";
import React from "react";
import { Text, TextProps } from "react-native";
import { Theme } from "../theme";

type Props = TextProps & {
  variant?: keyof Theme["textVariants"];
};

export function ThemedText({ variant = "body", style, ...rest }) {
  const theme = useTheme<Theme>();
  const v = theme.textVariants[variant];

  return (
    <Text
      style={[
        {
          color: theme.colors.text, // ← vienīgā krāsa
          fontSize: v.fontSize,
          fontFamily: v.fontFamily,
        },
        style,
      ]}
      {...rest}
    />
  );
}
