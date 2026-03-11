import { Theme } from "@/theme/theme";
import { createBox, useTheme } from "@shopify/restyle";
import React from "react";
import { TextProps } from "react-native";
import { ThemedText } from "./ThemedText";

const Box = createBox();

export function ThemedHeader({ children }: { children: React.ReactNode }) {
  const themeObj = useTheme<Theme>();

  type Props = TextProps & {
    variant?: keyof Theme["textVariants"];
  };
  return (
    <Box backgroundColor="background" padding="m">
      <ThemedText variant="header" color="text">
        {children}
      </ThemedText>
    </Box>
  );
}
